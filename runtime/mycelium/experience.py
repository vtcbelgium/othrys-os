from __future__ import annotations

import hashlib
import json
import re
from typing import Any

ROUTE_STATES = {"CANDIDATE", "QUALIFYING", "QUALIFIED", "PREFERRED", "DEGRADED", "RETIRED"}
METABOLIC_MODES = {"REST", "INTERACTIVE", "NORMAL", "BURST", "CONSERVE", "SOAK", "RECOVERY"}
HEX64 = re.compile(r"^[0-9a-f]{64}$")


def _digest(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def _num(value: Any, code: str, minimum: float = 0.0) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or float(value) < minimum:
        raise ValueError(code)
    return float(value)


def validate_route_template(route: dict[str, Any]) -> dict[str, Any]:
    required = {"routeId", "familyId", "version", "workloadClass", "authorityEnvelope", "compatibilityDigest", "registered"}
    if not isinstance(route, dict) or set(route) != required:
        raise ValueError("ROUTE_TEMPLATE_FIELDS_INVALID")
    if any(not str(route[k]).strip() for k in ("routeId", "familyId", "version", "workloadClass", "authorityEnvelope")):
        raise ValueError("ROUTE_TEMPLATE_IDENTITY_INVALID")
    if not HEX64.fullmatch(str(route["compatibilityDigest"])) or route["registered"] is not True:
        raise ValueError("ROUTE_TEMPLATE_LEGALITY_INVALID")
    return dict(route)


def validate_observation(obs: dict[str, Any]) -> dict[str, Any]:
    required = {"observationId", "routeId", "routeVersion", "workKey", "envFingerprint", "contractDigest",
                "authorityEnvelope", "metabolicMode", "correctness", "integrity", "authorityOk", "holdout",
                "latencyMs", "resourceCost", "artifactHits", "duplicatesPrevented", "contextReductionBytes", "provenanceDigest"}
    if not isinstance(obs, dict) or set(obs) != required:
        raise ValueError("EXPERIENCE_OBSERVATION_FIELDS_INVALID")
    for key in ("observationId", "routeId", "routeVersion", "envFingerprint", "authorityEnvelope"):
        if not str(obs[key]).strip():
            raise ValueError("EXPERIENCE_OBSERVATION_IDENTITY_INVALID")
    for key in ("workKey", "contractDigest", "provenanceDigest"):
        if not HEX64.fullmatch(str(obs[key])):
            raise ValueError("EXPERIENCE_OBSERVATION_DIGEST_INVALID")
    mode = str(obs["metabolicMode"]).upper()
    if mode not in METABOLIC_MODES:
        raise ValueError("EXPERIENCE_METABOLIC_MODE_INVALID")
    if any(type(obs[k]) is not bool for k in ("correctness", "integrity", "authorityOk", "holdout")):
        raise ValueError("EXPERIENCE_OBSERVATION_FLAGS_INVALID")
    for key in ("latencyMs", "resourceCost", "artifactHits", "duplicatesPrevented", "contextReductionBytes"):
        _num(obs[key], f"EXPERIENCE_{key.upper()}_INVALID")
    return {**obs, "metabolicMode": mode}


def _aggregate(route: dict[str, Any], observations: list[dict[str, Any]], min_evidence: int,
               current_environment: str, current_contract_digest: str, metabolic_mode: str) -> dict[str, Any]:
    history = [x for x in observations if x["routeId"] == route["routeId"]]
    base = {"routeId": route["routeId"], "historicalEvidenceCount": len(history)}
    if not history:
        return {**base, "state": "CANDIDATE", "evidenceCount": 0, "staleEvidenceCount": 0,
                "holdoutPassed": False, "reason": "NO_EVIDENCE", "objectives": None}
    current = [x for x in history if x["routeVersion"] == route["version"]
               and x["authorityEnvelope"] == route["authorityEnvelope"]
               and x["envFingerprint"] == current_environment
               and x["contractDigest"] == current_contract_digest
               and x["metabolicMode"] == metabolic_mode]
    stale = len(history) - len(current)
    if not current:
        return {**base, "state": "DEGRADED", "evidenceCount": 0, "staleEvidenceCount": stale,
                "holdoutPassed": False, "reason": "STALE_EVIDENCE_ONLY", "objectives": None}
    if any(not x["correctness"] or not x["integrity"] or not x["authorityOk"] for x in current):
        return {**base, "state": "DEGRADED", "evidenceCount": len(current), "staleEvidenceCount": stale,
                "holdoutPassed": any(x["holdout"] for x in current), "reason": "QUALITY_GATE_FAILED", "objectives": None}
    holdout = any(x["holdout"] for x in current)
    state = "QUALIFIED" if len(current) >= min_evidence and holdout else "QUALIFYING"
    n = len(current)
    objectives = {
        "latencyMs": round(sum(float(x["latencyMs"]) for x in current) / n, 6),
        "resourceCost": round(sum(float(x["resourceCost"]) for x in current) / n, 6),
        "artifactHits": sum(int(x["artifactHits"]) for x in current),
        "duplicatesPrevented": sum(int(x["duplicatesPrevented"]) for x in current),
        "contextReductionBytes": sum(int(x["contextReductionBytes"]) for x in current),
    }
    return {**base, "state": state, "evidenceCount": n, "staleEvidenceCount": stale,
            "holdoutPassed": holdout,
            "reason": "MATURE" if state == "QUALIFIED" else "INSUFFICIENT_OR_HOLDOUT_PENDING",
            "objectives": objectives, "envFingerprint": current_environment,
            "contractDigest": current_contract_digest}


def _dominates(a: dict[str, Any], b: dict[str, Any]) -> bool:
    x, y = a["objectives"], b["objectives"]
    weak = (x["latencyMs"] <= y["latencyMs"] and x["resourceCost"] <= y["resourceCost"] and
            x["artifactHits"] >= y["artifactHits"] and x["duplicatesPrevented"] >= y["duplicatesPrevented"] and
            x["contextReductionBytes"] >= y["contextReductionBytes"])
    strict = (x["latencyMs"] < y["latencyMs"] or x["resourceCost"] < y["resourceCost"] or
              x["artifactHits"] > y["artifactHits"] or x["duplicatesPrevented"] > y["duplicatesPrevented"] or
              x["contextReductionBytes"] > y["contextReductionBytes"])
    return weak and strict

def qualify_route_family(routes: list[dict[str, Any]], observations: list[dict[str, Any]], *, metabolic_mode: str,
                         current_environment: str, current_contract_digest: str, min_evidence: int = 3,
                         prior_preferred: str | None = None, hysteresis_evidence: int = 2) -> dict[str, Any]:
    mode = str(metabolic_mode).upper()
    if mode not in METABOLIC_MODES:
        raise ValueError("EXPERIENCE_METABOLIC_MODE_INVALID")
    environment = str(current_environment).strip()
    if not environment or not HEX64.fullmatch(str(current_contract_digest)):
        raise ValueError("EXPERIENCE_CURRENT_IDENTITY_INVALID")
    if not isinstance(min_evidence, int) or min_evidence < 2 or not isinstance(hysteresis_evidence, int) or hysteresis_evidence < 0:
        raise ValueError("EXPERIENCE_THRESHOLDS_INVALID")
    legal = [validate_route_template(x) for x in routes]
    if not legal or len({x["routeId"] for x in legal}) != len(legal):
        raise ValueError("ROUTE_FAMILY_INVALID")
    families = {x["familyId"] for x in legal}
    workloads = {x["workloadClass"] for x in legal}
    if len(families) != 1 or len(workloads) != 1:
        raise ValueError("ROUTE_FAMILY_MIXED")
    normalized = [validate_observation(x) for x in observations]
    ids = [x["observationId"] for x in normalized]
    if len(ids) != len(set(ids)):
        raise ValueError("EXPERIENCE_OBSERVATION_DUPLICATE")
    known = {x["routeId"] for x in legal}
    if any(x["routeId"] not in known for x in normalized):
        raise ValueError("UNREGISTERED_ROUTE_OBSERVATION")
    records = [_aggregate(x, normalized, min_evidence, environment, current_contract_digest, mode) for x in legal]
    mature = [x for x in records if x["state"] == "QUALIFIED"]
    frontier = [x for x in mature if not any(_dominates(y, x) for y in mature if y is not x)]
    frontier_ids = sorted(x["routeId"] for x in frontier)
    preferred = None
    reason = "NO_MATURE_ROUTE"
    suppressed = False
    if frontier:
        if prior_preferred in frontier_ids:
            preferred, reason = prior_preferred, "PRIOR_PREFERENCE_STILL_PARETO"
        elif len(frontier) == 1:
            challenger = frontier[0]
            prior = next((x for x in records if x["routeId"] == prior_preferred), None)
            if prior and prior["state"] == "QUALIFIED" and challenger["evidenceCount"] < prior["evidenceCount"] + hysteresis_evidence:
                preferred, reason, suppressed = prior_preferred, "HYSTERESIS_SUPPRESSED_FLIP", True
            else:
                preferred, reason = challenger["routeId"], "SOLE_PARETO_ROUTE"
        else:
            reason = "PARETO_TIE_NO_OPAQUE_SCORE"
    out = {"schema": "othrys.mycelium.experience-qualification.v0.1", "familyId": next(iter(families)),
           "workloadClass": next(iter(workloads)), "metabolicMode": mode, "currentEnvironment": environment,
           "currentContractDigest": current_contract_digest, "routes": records, "paretoFrontier": frontier_ids,
           "preferredRouteId": preferred, "preferenceReason": reason, "hysteresisSuppressed": suppressed,
           "routeGenerationByMycelium": False, "derivedPreference": True,
           "authorityGranted": False, "executionStarted": False}
    return {**out, "qualificationDigest": _digest(out)}

def plan_sparse_reinforcement(qualification: dict[str, Any], declared_links: list[dict[str, Any]], *, max_links: int = 2) -> dict[str, Any]:
    if not isinstance(qualification, dict) or qualification.get("schema") != "othrys.mycelium.experience-qualification.v0.1":
        raise ValueError("QUALIFICATION_INVALID")
    if not isinstance(max_links, int) or max_links < 0 or max_links > 4:
        raise ValueError("SPARSE_LINK_BUDGET_INVALID")
    legal = {x["routeId"] for x in qualification.get("routes", []) if x.get("state") == "QUALIFIED"}
    if not isinstance(declared_links, list):
        raise ValueError("DECLARED_LINKS_INVALID")
    admitted = []
    seen = set()
    for link in declared_links:
        required = {"linkId", "fromRoute", "toRoute", "reason", "decayAfterFailures", "registered"}
        if not isinstance(link, dict) or set(link) != required:
            raise ValueError("SPARSE_LINK_FIELDS_INVALID")
        lid = str(link["linkId"]).strip()
        left = str(link["fromRoute"]).strip()
        right = str(link["toRoute"]).strip()
        if not lid or lid in seen or not left or not right or left == right or link["registered"] is not True:
            raise ValueError("SPARSE_LINK_IDENTITY_INVALID")
        if left not in legal or right not in legal:
            raise ValueError("SPARSE_LINK_ROUTE_NOT_QUALIFIED")
        if not isinstance(link["decayAfterFailures"], int) or not 1 <= link["decayAfterFailures"] <= 5:
            raise ValueError("SPARSE_LINK_DECAY_INVALID")
        if not str(link["reason"]).strip():
            raise ValueError("SPARSE_LINK_REASON_REQUIRED")
        seen.add(lid)
        if len(admitted) < max_links:
            admitted.append({**link,
                "retractionLaw": f"retract after {link['decayAfterFailures']} observed failures or route degradation"})
    out = {"schema": "othrys.mycelium.sparse-reinforcement-plan.v0.1", "budget": max_links,
           "declaredCount": len(declared_links), "admittedCount": len(admitted), "links": admitted,
           "unboundedGrowth": False, "routeGenerationByMycelium": False,
           "authorityGranted": False, "executionStarted": False}
    return {**out, "planDigest": _digest(out)}


def evaluate_sparse_reinforcement(plan: dict[str, Any], route_states: dict[str, str], failure_counts: dict[str, int]) -> dict[str, Any]:
    if not isinstance(plan, dict) or plan.get("schema") != "othrys.mycelium.sparse-reinforcement-plan.v0.1":
        raise ValueError("SPARSE_PLAN_INVALID")
    evaluated = []
    for link in plan.get("links", []):
        left, right = link["fromRoute"], link["toRoute"]
        failures = failure_counts.get(link["linkId"], 0)
        if not isinstance(failures, int) or failures < 0:
            raise ValueError("SPARSE_LINK_FAILURE_COUNT_INVALID")
        degraded = route_states.get(left) in {"DEGRADED", "RETIRED"} or route_states.get(right) in {"DEGRADED", "RETIRED"}
        threshold = failures >= link["decayAfterFailures"]
        active = not degraded and not threshold
        reason = "ACTIVE" if active else ("ROUTE_DEGRADED" if degraded else "FAILURE_DECAY_THRESHOLD")
        evaluated.append({**link, "state": "ACTIVE" if active else "RETRACTED", "reason": reason,
                          "observedFailures": failures})
    out = {"schema": "othrys.mycelium.sparse-reinforcement-state.v0.1", "links": evaluated,
           "activeCount": sum(x["state"] == "ACTIVE" for x in evaluated),
           "retractedCount": sum(x["state"] == "RETRACTED" for x in evaluated),
           "authorityGranted": False, "executionStarted": False}
    return {**out, "stateDigest": _digest(out)}
