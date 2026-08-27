from __future__ import annotations

import json
import time
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
    needs_gpu = int(request.get("gpu_count", 0)) > 0 or int(request.get("vram_mb", 0)) > 0
    def score(e: dict[str, Any]):
        h = e.get("health") or {}; cap = e.get("advertised") or {}
        queue = int(h.get("queue_depth", 0)); latency = float(h.get("latency_ms") or 0)
        gpu = int(cap.get("gpu_count", 0)); cpu = int(cap.get("cpu_threads", 0))
        if needs_gpu:
            return (queue, -gpu, -int(cap.get("vram_mb", 0)), latency, str(e.get("node_id", "")))
        return (queue, gpu, cpu, latency, str(e.get("node_id", "")))
    return sorted(candidates, key=score)[0]



def quarantine(envelope: dict[str, Any], reason: str = "NODE_LOST") -> dict[str, Any]:
    copy = dict(envelope)
    health = dict(copy.get("health") or {})
    health.update({"state": UNREACHABLE, "reason": reason})
    copy["health"] = health
    return copy
