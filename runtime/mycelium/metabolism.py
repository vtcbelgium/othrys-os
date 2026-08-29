from __future__ import annotations

from dataclasses import dataclass
from typing import Any

RESOURCE_DISPOSITIONS = {"MEASURED", "INFERRED", "UNAVAILABLE", "BOUNDED_ZERO"}
METABOLIC_MODES = {"REST", "INTERACTIVE", "NORMAL", "BURST", "CONSERVE", "SOAK", "RECOVERY"}
TOPOLOGY_ACTIONS = {"GROW", "HOLD", "CONTRACT", "QUIESCE"}


def _unit(value: Any, code: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(code)
    value = float(value)
    if value < 0.0 or value > 1.0:
        raise ValueError(code)
    return value


def normalize_resource_report(report: dict[str, Any]) -> dict[str, Any]:
    required = {"availability", "pressure", "confidence", "source", "disposition"}
    if not isinstance(report, dict) or set(report) != required:
        raise ValueError("RESOURCE_REPORT_FIELDS_INVALID")
    disposition = str(report["disposition"]).upper()
    if disposition not in RESOURCE_DISPOSITIONS:
        raise ValueError("RESOURCE_DISPOSITION_INVALID")
    source = str(report["source"]).strip()
    if not source:
        raise ValueError("RESOURCE_SOURCE_REQUIRED")
    if disposition == "UNAVAILABLE":
        if any(report[k] is not None for k in ("availability", "pressure")) or report["confidence"] != 0:
            raise ValueError("UNAVAILABLE_RESOURCE_MUST_NOT_FABRICATE")
        return {**report, "disposition": disposition, "scarcity": None}
    availability = _unit(report["availability"], "RESOURCE_AVAILABILITY_INVALID")
    pressure = _unit(report["pressure"], "RESOURCE_PRESSURE_INVALID")
    confidence = _unit(report["confidence"], "RESOURCE_CONFIDENCE_INVALID")
    scarcity = max(pressure, 1.0 - availability) * confidence
    return {"availability": availability, "pressure": pressure, "confidence": confidence,
            "source": source, "disposition": disposition, "scarcity": round(scarcity, 6)}


def choose_metabolic_mode(*, demand: float, interactive: bool = False, soak: bool = False,
                          recovering: bool = False, cpu_pressure: float = 0.0,
                          ram_pressure: float = 0.0, queue_pressure: float = 0.0) -> str:
    demand = _unit(demand, "DEMAND_INVALID")
    pressures = [_unit(cpu_pressure, "CPU_PRESSURE_INVALID"),
                 _unit(ram_pressure, "RAM_PRESSURE_INVALID"),
                 _unit(queue_pressure, "QUEUE_PRESSURE_INVALID")]
    if recovering:
        return "RECOVERY"
    if demand <= 0.10:
        return "REST"
    if max(pressures) >= 0.80:
        return "CONSERVE"
    if interactive:
        return "INTERACTIVE"
    if soak:
        return "SOAK"
    if demand >= 0.85 and max(pressures) < 0.60:
        return "BURST"
    return "NORMAL"


def calibrate_concurrency_knee(samples: list[dict[str, Any]], within_best: float = 0.97) -> dict[str, Any]:
    if not samples or not 0.80 <= within_best <= 1.0:
        raise ValueError("CALIBRATION_INPUT_INVALID")
    clean = []
    for sample in samples:
        channels = sample.get("channels")
        throughput = sample.get("throughput")
        failures = sample.get("failures", 0)
        if not isinstance(channels, int) or channels < 1 or channels > 64:
            raise ValueError("CALIBRATION_CHANNELS_INVALID")
        if isinstance(throughput, bool) or not isinstance(throughput, (int, float)) or throughput <= 0:
            raise ValueError("CALIBRATION_THROUGHPUT_INVALID")
        if not isinstance(failures, int) or failures < 0:
            raise ValueError("CALIBRATION_FAILURES_INVALID")
        clean.append({"channels": channels, "throughput": float(throughput), "failures": failures})
    eligible = [x for x in clean if x["failures"] == 0]
    if not eligible:
        return {"status": "UNQUALIFIED", "knee": None, "reason": "NO_FAILURE_FREE_SAMPLE",
                "authorityGranted": False, "executionStarted": False}
    best = max(x["throughput"] for x in eligible)
    knee = min((x for x in eligible if x["throughput"] >= best * within_best), key=lambda x: x["channels"])
    return {"status": "QUALIFIED", "knee": knee["channels"], "bestThroughput": best,
            "kneeThroughput": knee["throughput"], "withinBest": within_best,
            "authorityGranted": False, "executionStarted": False}


def effective_channel_ceiling(project_policy: dict[str, Any], measured_knee: int | None, hard_cap: int = 8) -> int:
    if not isinstance(project_policy, dict) or project_policy.get("declarativeGrant") is not False:
        raise ValueError("PROJECT_POLICY_INVALID")
    project_max = project_policy.get("maxChannels")
    if not isinstance(project_max, int) or project_max < 1 or project_max > 8:
        raise ValueError("PROJECT_CHANNEL_BUDGET_INVALID")
    if not isinstance(hard_cap, int) or hard_cap < 1 or hard_cap > 8:
        raise ValueError("HARD_CHANNEL_CAP_INVALID")
    if measured_knee is None:
        return 1
    if not isinstance(measured_knee, int) or measured_knee < 1 or measured_knee > 64:
        raise ValueError("MEASURED_KNEE_INVALID")
    return min(project_max, measured_knee, hard_cap)


def decide_topology(*, mode: str, current_channels: int, ceiling: int, demand: float,
                    pressure: float, expected_gain: float, marginal_cost: float,
                    reliability: float = 1.0) -> dict[str, Any]:
    mode = str(mode).upper()
    if mode not in METABOLIC_MODES:
        raise ValueError("METABOLIC_MODE_INVALID")
    if not isinstance(current_channels, int) or current_channels < 0 or current_channels > 8:
        raise ValueError("CURRENT_CHANNELS_INVALID")
    if not isinstance(ceiling, int) or ceiling < 1 or ceiling > 8:
        raise ValueError("CHANNEL_CEILING_INVALID")
    demand = _unit(demand, "DEMAND_INVALID")
    pressure = _unit(pressure, "PRESSURE_INVALID")
    reliability = _unit(reliability, "RELIABILITY_INVALID")
    if isinstance(expected_gain, bool) or not isinstance(expected_gain, (int, float)) or expected_gain < 0:
        raise ValueError("EXPECTED_GAIN_INVALID")
    if isinstance(marginal_cost, bool) or not isinstance(marginal_cost, (int, float)) or marginal_cost < 0:
        raise ValueError("MARGINAL_COST_INVALID")
    useful = float(expected_gain) * demand * reliability
    cost = float(marginal_cost) * (1.0 + pressure)
    if mode == "REST" or demand == 0:
        action, target, reason = "QUIESCE", 0, "idle demand -> minimal footprint"
    elif current_channels > ceiling:
        action, target, reason = "CONTRACT", ceiling, "current width exceeds measured/project ceiling"
    elif mode in {"CONSERVE", "RECOVERY"}:
        action, target, reason = "CONTRACT", min(max(1, current_channels - 1), ceiling), f"{mode.lower()} posture contracts topology"
    elif current_channels < ceiling and useful > cost:
        action, target, reason = "GROW", current_channels + 1, "expected useful gain exceeds marginal metabolic cost"
    elif current_channels > 1 and useful < cost * 0.75:
        action, target, reason = "CONTRACT", current_channels - 1, "marginal metabolic cost dominates useful gain"
    else:
        action, target, reason = "HOLD", min(current_channels, ceiling), "no evidence-backed topology change"
    return {"schema": "othrys.mycelium.metabolic-decision.v0.1", "mode": mode, "action": action,
            "currentChannels": current_channels, "targetChannels": target, "ceiling": ceiling,
            "usefulGain": round(useful, 6), "marginalCost": round(cost, 6), "reason": reason,
            "authorityGranted": False, "executionStarted": False}


def plan_metabolic_routes(envelopes: list[dict[str, Any]], capability: str, request: dict[str, int], *,
                          project_policy: dict[str, Any], measured_knee: int | None,
                          mode: str, requested_channels: int, work_mode: str = "INDEPENDENT_READ_ONLY",
                          placement_strategy: str = "AUTO") -> dict[str, Any]:
    from colony import route_plan

    if not isinstance(requested_channels, int) or requested_channels < 1 or requested_channels > 8:
        raise ValueError("REQUESTED_CHANNELS_INVALID")
    mode = str(mode).upper()
    if mode not in METABOLIC_MODES:
        raise ValueError("METABOLIC_MODE_INVALID")
    ceiling = effective_channel_ceiling(project_policy, measured_knee)
    if mode == "REST":
        return {"schema": "othrys.mycelium.metabolic-route-plan.v0.1", "metabolicMode": mode,
                "requestedChannels": requested_channels, "admittedChannels": 0, "metabolicCeiling": ceiling,
                "placements": [], "placement_status": "QUIESCED", "throttled": True,
                "authorityGranted": False, "executionStarted": False}
    mode_ceiling = 1 if mode in {"CONSERVE", "RECOVERY"} else ceiling
    admitted = min(requested_channels, mode_ceiling)
    plan = route_plan(envelopes, capability, request, channels=admitted,
                      work_mode=work_mode, placement_strategy=placement_strategy)
    return {**plan, "schema": "othrys.mycelium.metabolic-route-plan.v0.1", "metabolicMode": mode,
            "requestedChannels": requested_channels, "admittedChannels": admitted,
            "metabolicCeiling": mode_ceiling, "throttled": admitted < requested_channels,
            "authorityGranted": False, "executionStarted": False}
