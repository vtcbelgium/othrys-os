import unittest

from anastomosis import plan_anastomosis

WK = "a" * 64
OTHER = "b" * 64


def claim(claim_id, consumer, work_key=WK, policy="SHARE_COMPUTATION"):
    return {"claimId": claim_id, "consumerId": consumer, "workKey": work_key, "reusePolicy": policy}


class AnastomosisPlannerTests(unittest.TestCase):
    def test_three_equivalent_shareable_claims_use_one_producer(self):
        plan = plan_anastomosis([claim("c1", "factory"), claim("c2", "hephaestus"), claim("c3", "mnemosyne")])
        self.assertEqual(plan["claimCount"], 3)
        self.assertEqual(plan["producerCount"], 1)
        self.assertEqual(plan["duplicatesPrevented"], 2)
        self.assertEqual(plan["producerPlans"][0]["claimIds"], ("c1", "c2", "c3"))
        self.assertFalse(plan["claimsMerged"])
        self.assertFalse(plan["authorityGranted"])
        self.assertFalse(plan["executionStarted"])

    def test_independent_verification_is_never_fused(self):
        claims = [claim("v1", "talos-legion", policy="INDEPENDENT_EXECUTION_REQUIRED"), claim("v2", "talos-t590", policy="INDEPENDENT_EXECUTION_REQUIRED")]
        plan = plan_anastomosis(claims)
        self.assertEqual(plan["producerCount"], 2)
        self.assertEqual(plan["duplicatesPrevented"], 0)
    def test_shareable_and_independent_claims_for_same_work_key_stay_distinct(self):
        claims = [
            claim("s1", "factory"),
            claim("s2", "hephaestus"),
            claim("v1", "talos", policy="INDEPENDENT_EXECUTION_REQUIRED"),
        ]
        plan = plan_anastomosis(claims)
        self.assertEqual(plan["producerCount"], 2)
        self.assertEqual(plan["duplicatesPrevented"], 1)
        self.assertEqual(plan["producerPlans"][0]["claimIds"], ("s1", "s2"))
        self.assertEqual(plan["producerPlans"][1]["claimIds"], ("v1",))

    def test_different_work_keys_never_fuse(self):
        plan = plan_anastomosis([claim("a", "factory", WK), claim("b", "factory", OTHER)])
        self.assertEqual(plan["producerCount"], 2)
        self.assertEqual(plan["duplicatesPrevented"], 0)

    def test_malformed_and_duplicate_claims_fail_closed(self):
        with self.assertRaisesRegex(ValueError, "CLAIMS_REQUIRED"):
            plan_anastomosis([])
        with self.assertRaisesRegex(ValueError, "CLAIM_IDENTITY_INVALID"):
            plan_anastomosis([claim("x", "a"), claim("x", "b")])
        with self.assertRaisesRegex(ValueError, "CLAIM_WORK_KEY_INVALID"):
            plan_anastomosis([claim("x", "a", "bad")])
        with self.assertRaisesRegex(ValueError, "CLAIM_REUSE_POLICY_INVALID"):
            plan_anastomosis([claim("x", "a", policy="ALWAYS_REUSE")])


if __name__ == "__main__":
    unittest.main()
