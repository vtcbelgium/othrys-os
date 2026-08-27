import hashlib
import unittest
from unittest.mock import patch

from remote_node import CAPABILITY, V2_CAPABILITY, WORK_SCHEMA, execute_work


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


if __name__ == "__main__":
    unittest.main()
