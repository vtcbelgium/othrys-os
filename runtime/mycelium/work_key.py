from __future__ import annotations

import hashlib
import json
import re
from typing import Any

DETERMINISM_CLASSES = {"PURE", "ENVIRONMENT_BOUND", "TIME_BOUND", "NONDETERMINISTIC"}
HEX64 = re.compile(r"^[0-9a-f]{64}$")


def _canonical(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _environment(cls: str, env: dict[str, str]) -> dict[str, str]:
    if cls == "PURE":
        return {}
    if cls == "NONDETERMINISTIC":
        nonce = str(env.get("_nonce", "")).strip()
        if not nonce:
            raise ValueError("NONDETERMINISTIC_NONCE_REQUIRED")
        return {**env, "_nonce": nonce}
    if cls == "TIME_BOUND":
        return {k: str(env[k]) for k in ("timeBucket", "ttlClass") if k in env}
    return {k: str(v) for k, v in sorted(env.items()) if not k.startswith("_")}


def compute_work_key(contract: dict[str, Any]) -> dict[str, Any]:
    required = {"operationId", "operationVersion", "inputDigests", "relevantEnvironment", "capabilityVersion", "determinismClass"}
    if set(contract) != required:
        raise ValueError("WORK_KEY_FIELDS_INVALID")
    cls = str(contract["determinismClass"])
    if cls not in DETERMINISM_CLASSES:
        raise ValueError("DETERMINISM_CLASS_INVALID")
    op_id = str(contract["operationId"]).strip()
    op_version = str(contract["operationVersion"]).strip()
    capability = str(contract["capabilityVersion"]).strip()
    if not op_id or not op_version or not capability:
        raise ValueError("WORK_KEY_IDENTITY_REQUIRED")
    inputs = contract["inputDigests"]
    env = contract["relevantEnvironment"]
    if not isinstance(inputs, list) or not inputs or any(not isinstance(x, str) or not HEX64.fullmatch(x) for x in inputs):
        raise ValueError("INPUT_DIGESTS_INVALID")
    if not isinstance(env, dict) or any(not isinstance(k, str) or not isinstance(v, str) for k, v in env.items()):
        raise ValueError("RELEVANT_ENVIRONMENT_INVALID")
    material = {
        "operationId": op_id,
        "operationVersion": op_version,
        "inputDigests": sorted(inputs),
        "relevantEnvironment": _environment(cls, env),
        "capabilityVersion": capability,
        "determinismClass": cls,
    }
    material_digest = hashlib.sha256(_canonical(material).encode()).hexdigest()
    key_material = "|".join([
        material["operationId"],
        material["operationVersion"],
        ",".join(material["inputDigests"]),
        _canonical(material["relevantEnvironment"]),
        material["capabilityVersion"],
        material["determinismClass"],
    ])
    work_key = hashlib.sha256(key_material.encode()).hexdigest()
    return {
        "schema": "othrys.mycelium.work-key.v1",
        "workKey": work_key,
        "materialDigest": material_digest,
        "material": material,
        "authorityGranted": False,
        "executionStarted": False,
    }


def same_work(left: dict[str, Any], right: dict[str, Any]) -> bool:
    """Pure equivalence test only. It does not authorize reuse or execution."""
    return compute_work_key(left)["workKey"] == compute_work_key(right)["workKey"]
