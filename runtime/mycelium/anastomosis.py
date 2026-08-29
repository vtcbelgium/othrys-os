from __future__ import annotations

import re
from typing import Any

HEX64 = re.compile(r"^[0-9a-f]{64}$")
REUSE_POLICIES = {"SHARE_COMPUTATION", "INDEPENDENT_EXECUTION_REQUIRED"}


def plan_anastomosis(claims: list[dict[str, Any]]) -> dict[str, Any]:
    if not isinstance(claims, list) or not claims:
        raise ValueError("CLAIMS_REQUIRED")
    seen: set[str] = set()
    groups: dict[str, dict[str, Any]] = {}
    order: list[str] = []
    for raw in claims:
        if set(raw) != {"claimId", "consumerId", "workKey", "reusePolicy"}:
            raise ValueError("CLAIM_FIELDS_INVALID")
        claim_id, consumer = str(raw["claimId"]).strip(), str(raw["consumerId"]).strip()
        work_key, policy = str(raw["workKey"]), str(raw["reusePolicy"])
        if not claim_id or not consumer or claim_id in seen:
            raise ValueError("CLAIM_IDENTITY_INVALID")
        if not HEX64.fullmatch(work_key):
            raise ValueError("CLAIM_WORK_KEY_INVALID")
        if policy not in REUSE_POLICIES:
            raise ValueError("CLAIM_REUSE_POLICY_INVALID")
        seen.add(claim_id)
        group_id = f"shared:{work_key}" if policy == "SHARE_COMPUTATION" else f"independent:{claim_id}"
        if group_id not in groups:
            groups[group_id] = {"workKey": work_key, "claimIds": [], "consumers": [], "reusePolicy": policy}
            order.append(group_id)
        groups[group_id]["claimIds"].append(claim_id)
        groups[group_id]["consumers"].append(consumer)
    producers = []
    duplicates_prevented = 0
    for i, group_id in enumerate(order, start=1):
        group = groups[group_id]
        if group["reusePolicy"] == "SHARE_COMPUTATION":
            duplicates_prevented += max(0, len(group["claimIds"]) - 1)
        producers.append({
            "producerPlanId": f"producer-{i}",
            "workKey": group["workKey"],
            "claimIds": tuple(group["claimIds"]),
            "consumers": tuple(group["consumers"]),
            "reusePolicy": group["reusePolicy"],
            "executionCount": 1,
        })
    return {
        "schema": "othrys.mycelium.anastomosis-plan.v1",
        "claimCount": len(claims),
        "producerCount": len(producers),
        "duplicatesPrevented": duplicates_prevented,
        "producerPlans": tuple(producers),
        "claimsMerged": False,
        "authorityGranted": False,
        "executionStarted": False,
    }
