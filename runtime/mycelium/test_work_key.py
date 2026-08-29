import unittest

from work_key import compute_work_key, same_work

A = "a" * 64
B = "b" * 64


def contract(cls="PURE", env=None, inputs=None):
    return {
        "operationId": "verify.runtime",
        "operationVersion": "1",
        "inputDigests": inputs or [A, B],
        "relevantEnvironment": env or {},
        "capabilityVersion": "node-test@1",
        "determinismClass": cls,
    }


class WorkKeyTests(unittest.TestCase):
    def test_pure_key_is_order_independent_and_ignores_environment(self):
        left = contract(env={"host": "legion"}, inputs=[A, B])
        right = contract(env={"host": "t590"}, inputs=[B, A])
        self.assertTrue(same_work(left, right))
        result = compute_work_key(left)
        self.assertEqual(result["material"]["relevantEnvironment"], {})
        self.assertFalse(result["authorityGranted"])
        self.assertFalse(result["executionStarted"])

    def test_environment_bound_changes_when_relevant_environment_changes(self):
        left = contract("ENVIRONMENT_BOUND", {"os": "windows", "_noise": "x"})
        same = contract("ENVIRONMENT_BOUND", {"os": "windows", "_noise": "y"})
        changed = contract("ENVIRONMENT_BOUND", {"os": "linux"})
        self.assertTrue(same_work(left, same))
        self.assertFalse(same_work(left, changed))
    def test_time_bound_uses_only_bucket_and_ttl_class(self):
        left = contract("TIME_BOUND", {"timeBucket": "2026-08-29T12", "ttlClass": "1h", "host": "legion"})
        same = contract("TIME_BOUND", {"timeBucket": "2026-08-29T12", "ttlClass": "1h", "host": "t590"})
        changed = contract("TIME_BOUND", {"timeBucket": "2026-08-29T13", "ttlClass": "1h"})
        self.assertTrue(same_work(left, same))
        self.assertFalse(same_work(left, changed))

    def test_nondeterministic_requires_explicit_nonce_and_nonce_changes_key(self):
        with self.assertRaisesRegex(ValueError, "NONDETERMINISTIC_NONCE_REQUIRED"):
            compute_work_key(contract("NONDETERMINISTIC", {}))
        left = contract("NONDETERMINISTIC", {"_nonce": "run-a", "host": "legion"})
        right = contract("NONDETERMINISTIC", {"_nonce": "run-b", "host": "legion"})
        self.assertFalse(same_work(left, right))

    def test_identity_version_and_input_changes_change_key(self):
        base = contract()
        changed_version = {**base, "operationVersion": "2"}
        changed_capability = {**base, "capabilityVersion": "node-test@2"}
        changed_input = {**base, "inputDigests": [A, "c" * 64]}
        self.assertFalse(same_work(base, changed_version))
        self.assertFalse(same_work(base, changed_capability))
        self.assertFalse(same_work(base, changed_input))

    def test_malformed_contracts_fail_closed(self):
        with self.assertRaisesRegex(ValueError, "WORK_KEY_FIELDS_INVALID"):
            compute_work_key({**contract(), "surprise": True})
        with self.assertRaisesRegex(ValueError, "INPUT_DIGESTS_INVALID"):
            compute_work_key({**contract(), "inputDigests": ["not-a-digest"]})
        with self.assertRaisesRegex(ValueError, "DETERMINISM_CLASS_INVALID"):
            compute_work_key(contract("YOLO"))


if __name__ == "__main__":
    unittest.main()
