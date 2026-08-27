import hashlib
import json
import unittest
from datetime import datetime, timezone
from tempfile import TemporaryDirectory
from pathlib import Path
from unittest.mock import patch

from remote_node import ADVISORY_CAPABILITY, CAPABILITY, TELEMETRY_CAPABILITY, V2_CAPABILITY, WORK_SCHEMA, execute_work


class RemoteNodeTests(unittest.TestCase):
    def work(self, text="abc"):
        return {"schema": WORK_SCHEMA, "work_id": "w1", "capability": CAPABILITY, "payload": {"text": text}}

    def test_hash_work_is_bound_and_authority_free(self):
        r = execute_work("t590", self.work("OTHRYS"))
        self.assertTrue(r["ok"])
        self.assertFalse(r["authorityGranted"])
        self.assertEqual(r["node_id"], "t590")
        self.assertEqual(r["artifact"]["sha256"], hashlib.sha256(b"OTHRYS").hexdigest())

    def test_unknown_capability_fails_closed(self):
        w = self.work(); w["capability"] = "shell.exec"
        with self.assertRaisesRegex(ValueError, "UNSUPPORTED_WORK"):
            execute_work("t590", w)

    def test_extra_fields_fail_closed(self):
        w = self.work(); w["command"] = "rm -rf /"
        with self.assertRaisesRegex(ValueError, "INVALID_WORK_FIELDS"):
            execute_work("t590", w)

    def test_payload_shape_is_exact(self):
        w = self.work(); w["payload"]["path"] = "/tmp/x"
        with self.assertRaisesRegex(ValueError, "INVALID_PAYLOAD"):
            execute_work("t590", w)

    def test_v2_suite_payload_is_exact(self):
        w={"schema":WORK_SCHEMA,"work_id":"v1","capability":V2_CAPABILITY,"payload":{"suite":"core","expected_sha":"abc","command":"pytest"}}
        with self.assertRaisesRegex(ValueError,"INVALID_VERIFY_PAYLOAD"):
            execute_work("t590",w)

    def test_v2_suite_requires_disposable_repo(self):
        w={"schema":WORK_SCHEMA,"work_id":"v1","capability":V2_CAPABILITY,"payload":{"suite":"core","expected_sha":"abc"}}
        with patch.dict("os.environ",{"OTHRYS_VERIFY_REPO":"C:/definitely/missing"},clear=False):
            with self.assertRaisesRegex(ValueError,"VERIFY_REPO_UNAVAILABLE"):
                execute_work("t590",w)

    def test_advisory_payload_is_exact(self):
        w={"schema":WORK_SCHEMA,"work_id":"a1","capability":ADVISORY_CAPABILITY,"payload":{"candidateCommit":"abc","artifactSha256":"a"*64,"sourceText":"x","command":"edit"}}
        with self.assertRaisesRegex(ValueError,"INVALID_ADVISORY_PAYLOAD"):
            execute_work("t590",w)

    def test_advisory_output_is_authority_free(self):
        class FakeResponse:
            def __enter__(self): return self
            def __exit__(self,*args): return False
            def read(self):
                response=json.dumps({"summary":"Tiny CLI","suggestions":["Add help"],"risks":["Keep Block boundary"]})
                return json.dumps({"response":response}).encode("utf-8")
        w={"schema":WORK_SCHEMA,"work_id":"a1","capability":ADVISORY_CAPABILITY,"payload":{"candidateCommit":"abc","artifactSha256":"a"*64,"sourceText":"console.log(1)"}}
        with patch("remote_node.urlopen",return_value=FakeResponse()):
            r=execute_work("t590",w)
        self.assertTrue(r["ok"]); self.assertFalse(r["authorityGranted"]); self.assertEqual(r["node_id"],"t590")
        self.assertEqual(r["artifact"]["suggestions"],["Add help"]); self.assertEqual(r["artifact"]["model"],"llama3.2")

    def test_advisory_model_invalid_output_fails_closed(self):
        class FakeResponse:
            def __enter__(self): return self
            def __exit__(self,*args): return False
            def read(self): return json.dumps({"response":"{}"}).encode("utf-8")
        w={"schema":WORK_SCHEMA,"work_id":"a1","capability":ADVISORY_CAPABILITY,"payload":{"candidateCommit":"abc","artifactSha256":"a"*64,"sourceText":"x"}}
        with patch("remote_node.urlopen",return_value=FakeResponse()):
            with self.assertRaisesRegex(ValueError,"ADVISORY_MODEL_INVALID_OUTPUT"):
                execute_work("t590",w)

    def telemetry(self, token="secret"):
        return {"schema":WORK_SCHEMA,"work_id":"t1","capability":TELEMETRY_CAPABILITY,"payload":{"token":token,"nodeId":"legion","capturedAt":datetime.now(timezone.utc).isoformat(),"cpuPercent":12.5,"ramAvailableMb":8192,"gpuUtilPercent":4,"vramUsedMb":512,"vramTotalMb":8151,"gpuTempC":44,"qwenLoaded":False}}

    def test_telemetry_is_token_bound_bounded_and_authority_free(self):
        with TemporaryDirectory() as d, patch.dict("os.environ",{"OTHRYS_TELEMETRY_TOKEN":"secret","OTHRYS_TELEMETRY_DIR":d},clear=False):
            r=execute_work("t590",self.telemetry())
            self.assertTrue(r["ok"]); self.assertFalse(r["authorityGranted"]); self.assertEqual(r["artifact"]["nodeId"],"legion")
            saved=json.loads(Path(d,"legion.json").read_text())
            self.assertNotIn("token",saved); self.assertEqual(saved["nodeId"],"legion"); self.assertFalse(saved["qwenLoaded"])

    def test_telemetry_rejects_bad_token_shape_and_metrics(self):
        with TemporaryDirectory() as d, patch.dict("os.environ",{"OTHRYS_TELEMETRY_TOKEN":"secret","OTHRYS_TELEMETRY_DIR":d},clear=False):
            with self.assertRaisesRegex(ValueError,"TELEMETRY_UNAUTHORIZED"): execute_work("t590",self.telemetry("wrong"))
            w=self.telemetry(); w["payload"]["gpuUtilPercent"]=101
            with self.assertRaisesRegex(ValueError,"INVALID_TELEMETRY_METRIC"): execute_work("t590",w)
            w=self.telemetry(); w["payload"]["command"]="shutdown"
            with self.assertRaisesRegex(ValueError,"INVALID_TELEMETRY_PAYLOAD"): execute_work("t590",w)


if __name__ == "__main__":
    unittest.main()
