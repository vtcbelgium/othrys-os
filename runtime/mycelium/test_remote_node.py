import hashlib
import unittest

from remote_node import CAPABILITY, WORK_SCHEMA, execute_work


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


if __name__ == "__main__":
    unittest.main()
