from __future__ import annotations

import json
import time
from typing import Any
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
    cpu_pressure=max(0.0,min(100.0,float(h.get("cpu_percent",h.get("cpuPercent",0)) or 0)))
    gpu_default=100.0 if h.get("gpu_busy") else 0.0
    gpu_pressure=max(0.0,min(100.0,float(h.get("gpu_util_percent",h.get("gpuUtilPercent",gpu_default)) or 0)))
    gpu = int(cap.get("gpu_count", 0)); cpu = int(cap.get("cpu_threads", 0))
    if needs_gpu:
        return (queue, gpu_pressure, cpu_pressure, -gpu, -int(cap.get("vram_mb", 0)), latency, str(e.get("node_id", "")))
    return (queue, cpu_pressure, gpu, cpu, latency, str(e.get("node_id", "")))


def _fits_remaining(remaining: dict[str, int], request: dict[str, int]) -> bool:
    return all(int(request.get(k,0)) <= int(remaining.get(k,0)) for k in ("cpu_threads","ram_mb","gpu_count","vram_mb"))


def _consume(remaining: dict[str, int], request: dict[str, int]) -> dict[str, int]:
    out=dict(remaining)
    for k in ("cpu_threads","ram_mb","gpu_count","vram_mb"):
        out[k]=max(0,int(out.get(k,0))-int(request.get(k,0)))
    return out


def route_plan(envelopes: list[dict[str, Any]], capability: str, request: dict[str, int], channels: int = 1, work_mode: str = "INDEPENDENT_READ_ONLY", placement_strategy: str = "AUTO") -> dict[str, Any]:
    if not isinstance(channels, int) or channels < 1 or channels > 8:
        raise ValueError("CHANNEL_BUDGET_INVALID")
    if channels > 1 and work_mode not in {"INDEPENDENT_READ_ONLY", "ISOLATED_SHARD", "ALTERNATIVE_CANDIDATE"}:
        raise ValueError("MULTICHANNEL_WORK_MODE_FORBIDDEN")
    strategy=str(placement_strategy).upper()
    if strategy not in {"AUTO","PACK","SPREAD","STRICT_PACK","STRICT_SPREAD"}:
        raise ValueError("PLACEMENT_STRATEGY_INVALID")
    if strategy=="AUTO":
        strategy="SPREAD" if work_mode=="ALTERNATIVE_CANDIDATE" else "PACK"
    candidates=[]; seen=set()
    for envelope in envelopes:
        if (envelope.get("health") or {}).get("state", READY) != READY or not feasible(envelope, capability, request):
            continue
        node_id=str(envelope.get("node_id", ""))
        if not node_id or node_id in seen:
            continue
        seen.add(node_id); candidates.append(envelope)
    candidates=sorted(candidates,key=lambda e:_route_score(e,request))
    remaining={str(e["node_id"]):{k:int((e.get("advertised") or {}).get(k,0)) for k in ("cpu_threads","ram_mb","gpu_count","vram_mb")} for e in candidates}
    if strategy=="STRICT_PACK":
        packed=[]
        for candidate in candidates:
            node_id=str(candidate["node_id"]); rem=remaining[node_id]; trial=[]
            for lane in range(channels):
                if not _fits_remaining(rem,request): break
                rem=_consume(rem,request); trial.append({"lane":f"lane-{lane+1}","node_id":node_id,"capability":capability})
            if len(trial)==channels:
                return {"schema":"othrys.mycelium.route-plan.v0.2","work_mode":work_mode,"placement_strategy":strategy,"requested_channels":channels,"placements":trial,"satisfied_channels":channels,"placement_status":"SATISFIED","authorityGranted":False,"executionStarted":False}
        return {"schema":"othrys.mycelium.route-plan.v0.2","work_mode":work_mode,"placement_strategy":strategy,"requested_channels":channels,"placements":[],"satisfied_channels":0,"placement_status":"INFEASIBLE","authorityGranted":False,"executionStarted":False}
    if strategy=="STRICT_SPREAD":
        if len(candidates)<channels:
            return {"schema":"othrys.mycelium.route-plan.v0.2","work_mode":work_mode,"placement_strategy":strategy,"requested_channels":channels,"placements":[],"satisfied_channels":0,"placement_status":"INFEASIBLE","authorityGranted":False,"executionStarted":False}
        placements=[{"lane":f"lane-{i+1}","node_id":e["node_id"],"capability":capability} for i,e in enumerate(candidates[:channels])]
        return {"schema":"othrys.mycelium.route-plan.v0.2","work_mode":work_mode,"placement_strategy":strategy,"requested_channels":channels,"placements":placements,"satisfied_channels":channels,"placement_status":"SATISFIED","authorityGranted":False,"executionStarted":False}
    placements=[]
    for lane in range(channels):
        eligible=[e for e in candidates if _fits_remaining(remaining[str(e["node_id"])],request)]
        if not eligible: break
        if strategy=="SPREAD":
            counts={}
            for placed in placements:
                counts[placed["node_id"]]=counts.get(placed["node_id"],0)+1
            chosen=min(eligible,key=lambda e:(counts.get(str(e["node_id"]),0),_route_score(e,request)))
        else:
            chosen=eligible[0]
        node_id=str(chosen["node_id"])
        remaining[node_id]=_consume(remaining[node_id],request)
        placements.append({"lane":f"lane-{lane+1}","node_id":node_id,"capability":capability})
    status="SATISFIED" if len(placements)==channels else "PARTIAL" if placements else "INFEASIBLE"
    return {"schema":"othrys.mycelium.route-plan.v0.2","work_mode":work_mode,"placement_strategy":strategy,"requested_channels":channels,"placements":placements,"satisfied_channels":len(placements),"placement_status":status,"authorityGranted":False,"executionStarted":False}



def quarantine(envelope: dict[str, Any], reason: str = "NODE_LOST") -> dict[str, Any]:
    copy = dict(envelope)
    health = dict(copy.get("health") or {})
    health.update({"state": UNREACHABLE, "reason": reason})
    copy["health"] = health
    return copy
