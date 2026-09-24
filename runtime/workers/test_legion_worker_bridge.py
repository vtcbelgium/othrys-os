import hashlib
import json
import subprocess
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from legion_worker_bridge import (
    BridgeError,
    run_authorized_job,
    run_brain_router,
    run_brain_research,
    validate_brain_payload,
    validate_research_payload,
    validate_job_payload,
)


def fixture(workspace: str):
    request = {
        "schema_version": "othrys.worker-request.v0.1",
        "job_id": "JOB-abc123",
        "node_id": "legion",
        "capability": "engineering.patch",
        "workspace": workspace,
        "task": "write the smoke file",
        "allowed_paths": ["docs/WEB-SMOKE.md"],
        "deny_paths": [],
        "timeout_sec": 30,
        "metadata": {
            "mission_id": "V2-999A",
            "builder_id": "qwen3-builder",
            "status": "READY_FOR_DISPATCH",
        },
    }
    request_raw = json.dumps(request, indent=2) + "\n"
    dispatch = {
        "schema": "othrys.os.dispatch-ticket.v1",
        "ticketId": "DISPATCH-abc123",
        "jobId": request["job_id"],
        "missionId": request["metadata"]["mission_id"],
        "builderId": request["metadata"]["builder_id"],
        "requestDigest": hashlib.sha256(request_raw.encode()).hexdigest(),
        "status": "DISPATCH_AUTHORIZED",
        "authorityGranted": True,
        "executionStarted": False,
    }
    dispatch_raw = json.dumps(dispatch, indent=2) + "\n"
    return {
        "token": "secret",
        "dispatchRaw": dispatch_raw,
        "requestRaw": request_raw,
    }


class LegionWorkerBridgeTests(unittest.TestCase):
    def test_valid_payload_is_bound_to_dispatch_and_workspace(self):
        with TemporaryDirectory() as root:
            payload = fixture(root)
            dispatch, request, raw = validate_job_payload(payload, "secret", root)
            self.assertEqual(dispatch["jobId"], request["job_id"])
            self.assertEqual(hashlib.sha256(raw.encode()).hexdigest(), dispatch["requestDigest"])
    def test_bad_token_digest_and_workspace_fail_closed(self):
        with TemporaryDirectory() as root, TemporaryDirectory() as other:
            payload = fixture(root)
            with self.assertRaisesRegex(BridgeError, "JOB_UNAUTHORIZED"):
                validate_job_payload(payload, "different", root)
            broken = dict(payload)
            broken["requestRaw"] = payload["requestRaw"] + " "
            with self.assertRaisesRegex(BridgeError, "REQUEST_DISPATCH_MISMATCH"):
                validate_job_payload(broken, "secret", root)
            with self.assertRaisesRegex(BridgeError, "WORKSPACE_NOT_AUTHORIZED"):
                validate_job_payload(payload, "secret", other)

    def test_brain_payload_and_router_are_read_only(self):
        payload = {
            "token": "secret",
            "state": "Inspect repository status only.",
            "model": "jev-1.13.0",
        }
        request = validate_brain_payload(payload, "secret")
        self.assertEqual(request["schema"], "othrys.legion.brain-request.v1")
        self.assertEqual(request["state"], payload["state"])

        with self.assertRaisesRegex(BridgeError, "BRAIN_UNAUTHORIZED"):
            validate_brain_payload(payload, "different")

        with TemporaryDirectory() as root:
            router = Path(root, "runtime", "workers", "legion_brain_router.mjs")
            router.parent.mkdir(parents=True)
            router.write_text("// fixture\n", encoding="utf-8")
            brain = {
                "schema": "othrys.legion.brain-response.v1",
                "observation": {
                    "schema": "othrys.os.jev-observation.v1",
                    "mode": "TRAINING",
                    "circuitId": "router",
                    "answers": {},
                    "authorityGranted": False,
                    "actionApplied": False,
                    "executionStarted": False,
                },
                "transport": {"provider": "OPENROUTER"},
                "authorityGranted": False,
                "actionApplied": False,
                "executionStarted": False,
            }

            with patch(
                "legion_worker_bridge.subprocess.run",
                return_value=subprocess.CompletedProcess(
                    ["node", str(router)],
                    0,
                    json.dumps(brain),
                    "",
                ),
            ) as mocked:
                result = run_brain_router(
                    payload,
                    expected_token="secret",
                    router=router,
                )

            self.assertEqual(result["schema"], "othrys.legion.brain-response.v1")
            self.assertFalse(result["authorityGranted"])
            mocked.assert_called_once()

    def test_brain_router_rejects_authority_claims(self):
        payload = {
            "token": "secret",
            "state": "Inspect status.",
            "model": "jev-1.13.0",
        }
        with TemporaryDirectory() as root:
            router = Path(root, "runtime", "workers", "legion_brain_router.mjs")
            router.parent.mkdir(parents=True)
            router.write_text("// fixture\n", encoding="utf-8")
            brain = {
                "schema": "othrys.legion.brain-response.v1",
                "observation": {
                    "schema": "othrys.os.jev-observation.v1",
                },
                "authorityGranted": True,
                "executionStarted": False,
            }
            with patch(
                "legion_worker_bridge.subprocess.run",
                return_value=subprocess.CompletedProcess(
                    ["node", str(router)],
                    0,
                    json.dumps(brain),
                    "",
                ),
            ):
                with self.assertRaisesRegex(BridgeError, "BRAIN_RESPONSE_INVALID"):
                    run_brain_router(
                        payload,
                        expected_token="secret",
                        router=router,
                    )

    def test_research_payload_and_runner_are_read_only(self):
        payload = {
            "token": "secret",
            "query": "current Jev pricing",
            "maxResults": 5,
        }
        request = validate_research_payload(payload, "secret")
        self.assertEqual(request["schema"], "othrys.legion.research-request.v1")
        with self.assertRaisesRegex(BridgeError, "RESEARCH_UNAUTHORIZED"):
            validate_research_payload(payload, "different")

        with TemporaryDirectory() as root:
            runner = Path(root, "runtime", "workers", "legion_brain_research.mjs")
            runner.parent.mkdir(parents=True)
            runner.write_text("// fixture\n", encoding="utf-8")
            research = {
                "schema": "othrys.legion.research-response.v1",
                "findings": [{"title": "Official", "url": "https://example.com", "summary": "Evidence"}],
                "creditsUsed": 1,
                "authorityGranted": False,
                "actionApplied": False,
                "executionStarted": False,
            }
            with patch(
                "legion_worker_bridge.subprocess.run",
                return_value=subprocess.CompletedProcess(["node", str(runner)], 0, json.dumps(research), ""),
            ):
                result = run_brain_research(
                    payload,
                    expected_token="secret",
                    research_runner=runner,
                )
            self.assertEqual(result["schema"], "othrys.legion.research-response.v1")
            self.assertFalse(result["authorityGranted"])
            self.assertEqual(len(result["findings"]), 1)

    def test_research_runner_rejects_authority_claim(self):
        payload = {"token": "secret", "query": "current Jev pricing", "maxResults": 3}
        with TemporaryDirectory() as root:
            runner = Path(root, "runtime", "workers", "legion_brain_research.mjs")
            runner.parent.mkdir(parents=True)
            runner.write_text("// fixture\n", encoding="utf-8")
            research = {
                "schema": "othrys.legion.research-response.v1",
                "findings": [],
                "authorityGranted": True,
                "executionStarted": False,
            }
            with patch(
                "legion_worker_bridge.subprocess.run",
                return_value=subprocess.CompletedProcess(["node", str(runner)], 0, json.dumps(research), ""),
            ):
                with self.assertRaisesRegex(BridgeError, "RESEARCH_RESPONSE_INVALID"):
                    run_brain_research(payload, expected_token="secret", research_runner=runner)

    def test_authorized_job_launches_existing_bounded_worker(self):
        with TemporaryDirectory() as root:
            workspace = Path(root, "workspace")
            workspace.mkdir()
            state = Path(root, "state")
            launcher = Path(root, "runtime", "workers", "launch_worker.py")
            launcher.parent.mkdir(parents=True)
            launcher.write_text("# test launcher\n", encoding="utf-8")
            payload = fixture(str(workspace))

            def fake_run(command, **kwargs):
                result_path = Path(command[command.index("--result") + 1])
                request = json.loads(payload["requestRaw"])
                result = {
                    "schema_version": "othrys.worker-result.v0.1",
                    "mission_id": request["metadata"]["mission_id"],
                    "job_id": request["job_id"],
                    "builder_id": request["metadata"]["builder_id"],
                    "ok": True,
                    "allowed_paths": request["allowed_paths"],
                    "changed_files": request["allowed_paths"],
                    "out_of_scope_changes": [],
                }
                result_path.write_text(json.dumps(result) + "\n", encoding="utf-8")
                return subprocess.CompletedProcess(command, 0, "ok", "")

            with patch("legion_worker_bridge.subprocess.run", side_effect=fake_run) as mocked:
                result = run_authorized_job(
                    payload,
                    expected_token="secret",
                    expected_workspace=str(workspace),
                    state_dir=state,
                    launcher=launcher,
                )
            self.assertTrue(result["ok"])
            self.assertEqual(result["job_id"], "JOB-abc123")
            mocked.assert_called_once()

            replay = run_authorized_job(
                payload,
                expected_token="secret",
                expected_workspace=str(workspace),
                state_dir=state,
                launcher=launcher,
            )
            self.assertEqual(replay, result)
            mocked.assert_called_once()


if __name__ == "__main__":
    unittest.main()
