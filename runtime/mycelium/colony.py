from __future__ import annotations

import json
import time
import heapq
from typing import Any, Callable
from urllib.error import URLError
from urllib.request import urlopen

from node import feasible

READY = "READY"
UNREACHABLE = "UNREACHABLE"


def live_health(base_url: str, timeout: float = 1.5) -> dict[str, Any]:
    started = time.perf_counter()
    try:
        with urlopen(base_url.rstrip("/") + "/health", timeout=timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
        node = payload["node"]
        health = dict(node.get("health") or {})
        health.update({"state": READY, "latency_ms": round((time.perf_counter()-started)*1000, 2)})
        node["health"] = health
        return node
    except (OSError, URLError, ValueError, KeyError, json.JSONDecodeError):
        return {"health": {"state": UNREACHABLE, "latency_ms": None}, "authorityGranted": False}

def route_live(envelopes: list[dict[str, Any]], capability: str, request: dict[str, int]) -> dict[str, Any] | None:
    candidates = []
    for envelope in envelopes:
        health = envelope.get("health") or {}
        if health.get("state", READY) != READY:
            continue
        if not feasible(envelope, capability, request):
            continue
        candidates.append(envelope)
    if not candidates:
        return None
    return min(candidates, key=lambda e: _route_score(e, request))


def _route_score(e: dict[str, Any], request: dict[str, int]):
    needs_gpu = int(request.get("gpu_count", 0)) > 0 or int(request.get("vram_mb", 0)) > 0
    h = e.get("health") or {}; cap = e.get("advertised") or {}
    queue = int(h.get("queue_depth", 0)); latency = float(h.get("latency_ms") or 0)
    gpu = int(cap.get("gpu_count", 0)); cpu = int(cap.get("cpu_threads", 0))
    if needs_gpu:
        return (queue, -gpu, -int(cap.get("vram_mb", 0)), latency, str(e.get("node_id", "")))
    return (queue, gpu, cpu, latency, str(e.get("node_id", "")))


def route_plan(envelopes: list[dict[str, Any]], capability: str, request: dict[str, int], channels: int = 1, work_mode: str = "INDEPENDENT_READ_ONLY") -> dict[str, Any]:
    if not isinstance(channels, int) or channels < 1 or channels > 8:
        raise ValueError("CHANNEL_BUDGET_INVALID")
    if channels > 1 and work_mode not in {"INDEPENDENT_READ_ONLY", "ISOLATED_SHARD", "ALTERNATIVE_CANDIDATE"}:
        raise ValueError("MULTICHANNEL_WORK_MODE_FORBIDDEN")
    candidates=[]; seen=set()
    for envelope in envelopes:
        if (envelope.get("health") or {}).get("state", READY) != READY or not feasible(envelope, capability, request):
            continue
        node_id=str(envelope.get("node_id", ""))
        if not node_id or node_id in seen:
            continue
        seen.add(node_id); candidates.append(envelope)
    ranked=heapq.nsmallest(channels,candidates,key=lambda e:_route_score(e,request))
    placements=[{"lane":f"lane-{i+1}","node_id":e["node_id"],"capability":capability} for i,e in enumerate(ranked)]
    return {"schema":"othrys.mycelium.route-plan.v0.1","work_mode":work_mode,"requested_channels":channels,"placements":placements,"authorityGranted":False,"executionStarted":False}



def quarantine(envelope: dict[str, Any], reason: str = "NODE_LOST") -> dict[str, Any]:
    copy = dict(envelope)
    health = dict(copy.get("health") or {})
    health.update({"state": UNREACHABLE, "reason": reason})
    copy["health"] = health
    return copy
