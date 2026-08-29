import unittest

from experience import qualify_route_family as _qualify_route_family, plan_sparse_reinforcement, evaluate_sparse_reinforcement

H = lambda c: c * 64

def qualify_route_family(routes, observations, **kwargs):
    kwargs.setdefault('current_environment', 'env-a')
    kwargs.setdefault('current_contract_digest', H('b'))
    return _qualify_route_family(routes, observations, **kwargs)


def route(route_id, version="1", compat="a"):
    return {
        "routeId": route_id,
        "familyId": "family-build",
        "version": version,
        "workloadClass": "engineering.verify",
        "authorityEnvelope": "verify-only",
        "compatibilityDigest": H(compat),
        "registered": True,
    }


def obs(route_id, n, *, latency=10, cost=10, hits=0, dup=0, reduction=0, holdout=False,
        correctness=True, integrity=True, authority=True, env="env-a", contract="b", version="1"):
    return {
        "observationId": f"{route_id}-{n}",
        "routeId": route_id,
        "routeVersion": version,
        "workKey": H("c"),
        "envFingerprint": env,
        "contractDigest": H(contract),
        "authorityEnvelope": "verify-only",
        "metabolicMode": "NORMAL",
        "correctness": correctness,
        "integrity": integrity,
        "authorityOk": authority,
        "holdout": holdout,
        "latencyMs": latency,
        "resourceCost": cost,
        "artifactHits": hits,
        "duplicatesPrevented": dup,
        "contextReductionBytes": reduction,
        "provenanceDigest": H("d"),
    }

class ExperienceTests(unittest.TestCase):
    def test_frequency_alone_does_not_qualify_without_holdout(self):
        rows = [obs("r1", i) for i in range(1, 5)]
        q = qualify_route_family([route("r1")], rows, metabolic_mode="NORMAL")
        self.assertEqual(q["routes"][0]["state"], "QUALIFYING")
        self.assertIsNone(q["preferredRouteId"])
        self.assertFalse(q["authorityGranted"])

    def test_quality_and_holdout_are_required(self):
        rows = [obs("r1", 1), obs("r1", 2), obs("r1", 3, holdout=True)]
        q = qualify_route_family([route("r1")], rows, metabolic_mode="NORMAL")
        self.assertEqual(q["routes"][0]["state"], "QUALIFIED")
        self.assertEqual(q["preferredRouteId"], "r1")
        bad = rows + [obs("r1", 4, correctness=False)]
        q2 = qualify_route_family([route("r1")], bad, metabolic_mode="NORMAL")
        self.assertEqual(q2["routes"][0]["state"], "DEGRADED")

    def test_pareto_preference_is_transparent_not_scalar_score(self):
        rows = []
        for i in range(1, 4):
            rows.append(obs("fast", i, latency=5, cost=4, hits=3, dup=2, reduction=100, holdout=i == 3))
            rows.append(obs("slow", i, latency=10, cost=8, hits=1, dup=0, reduction=20, holdout=i == 3))
        q = qualify_route_family([route("fast"), route("slow", compat="b")], rows, metabolic_mode="NORMAL")
        self.assertEqual(q["paretoFrontier"], ["fast"])
        self.assertEqual(q["preferredRouteId"], "fast")
        self.assertEqual(q["preferenceReason"], "SOLE_PARETO_ROUTE")

    def test_pareto_tie_refuses_opaque_tiebreak(self):
        rows = []
        for i in range(1, 4):
            rows.append(obs("latency", i, latency=4, cost=9, hits=0, holdout=i == 3))
            rows.append(obs("cost", i, latency=8, cost=3, hits=0, holdout=i == 3))
        q = qualify_route_family([route("latency"), route("cost", compat="b")], rows, metabolic_mode="NORMAL")
        self.assertEqual(set(q["paretoFrontier"]), {"latency", "cost"})
        self.assertIsNone(q["preferredRouteId"])
        self.assertEqual(q["preferenceReason"], "PARETO_TIE_NO_OPAQUE_SCORE")

    def test_hysteresis_can_suppress_flip_until_more_evidence(self):
        rows = []
        for i in range(1, 4):
            rows.append(obs("old", i, latency=10, cost=10, holdout=i == 3))
            rows.append(obs("new", i, latency=5, cost=5, hits=1, holdout=i == 3))
        q = qualify_route_family([route("old"), route("new", compat="b")], rows, metabolic_mode="NORMAL",
                                 prior_preferred="old", hysteresis_evidence=2)
        self.assertEqual(q["preferredRouteId"], "old")
        self.assertTrue(q["hysteresisSuppressed"])

    def test_stale_history_does_not_poison_current_requalification(self):
        old = [obs("r1", 1, env="env-b"), obs("r1", 2, env="env-b"), obs("r1", 3, env="env-b", holdout=True)]
        stale = qualify_route_family([route("r1")], old, metabolic_mode="NORMAL")
        self.assertEqual(stale["routes"][0]["reason"], "STALE_EVIDENCE_ONLY")
        current = old + [obs("r1", 4), obs("r1", 5), obs("r1", 6, holdout=True)]
        rebuilt = qualify_route_family([route("r1")], current, metabolic_mode="NORMAL")
        self.assertEqual(rebuilt["routes"][0]["state"], "QUALIFIED")
        self.assertEqual(rebuilt["routes"][0]["staleEvidenceCount"], 3)
        versions = [obs("r1", 1, version="2"), obs("r1", 2, version="2", holdout=True)] + [obs("r1", 3), obs("r1", 4), obs("r1", 5, holdout=True)]
        rebuilt2 = qualify_route_family([route("r1")], versions, metabolic_mode="NORMAL")
        self.assertEqual(rebuilt2["routes"][0]["state"], "QUALIFIED")
        self.assertEqual(rebuilt2["routes"][0]["staleEvidenceCount"], 2)

    def test_metabolic_mode_isolation_and_duplicate_observation_rejection(self):
        burst = [dict(obs("r1", i, holdout=i == 3), metabolicMode="BURST") for i in range(1, 4)]
        q = qualify_route_family([route("r1")], burst, metabolic_mode="NORMAL")
        self.assertEqual(q["routes"][0]["reason"], "STALE_EVIDENCE_ONLY")
        duplicate = [obs("r1", 1), obs("r1", 1)]
        with self.assertRaisesRegex(ValueError, "EXPERIENCE_OBSERVATION_DUPLICATE"):
            qualify_route_family([route("r1")], duplicate, metabolic_mode="NORMAL")

    def test_unregistered_route_observation_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "UNREGISTERED_ROUTE_OBSERVATION"):
            qualify_route_family([route("r1")], [obs("invented", 1)], metabolic_mode="NORMAL")

    def test_sparse_reinforcement_is_budgeted_and_retractable(self):
        rows = []
        for rid in ("r1", "r2", "r3"):
            for i in range(1, 4):
                rows.append(obs(rid, i, latency=5, cost=5, holdout=i == 3))
        q = qualify_route_family([route("r1"), route("r2", compat="b"), route("r3", compat="c")], rows,
                                 metabolic_mode="NORMAL")
        links = [
            {"linkId": "l1", "fromRoute": "r1", "toRoute": "r2", "reason": "fallback peer", "decayAfterFailures": 2, "registered": True},
            {"linkId": "l2", "fromRoute": "r2", "toRoute": "r3", "reason": "alternate peer", "decayAfterFailures": 1, "registered": True},
            {"linkId": "l3", "fromRoute": "r3", "toRoute": "r1", "reason": "third peer", "decayAfterFailures": 3, "registered": True},
        ]
        p = plan_sparse_reinforcement(q, links, max_links=2)
        self.assertEqual(p["admittedCount"], 2)
        self.assertFalse(p["unboundedGrowth"])
        self.assertTrue(all("retract" in x["retractionLaw"] for x in p["links"]))
        self.assertFalse(p["authorityGranted"])

    def test_reinforced_links_retract_on_decay_or_route_degradation(self):
        rows = []
        for rid in ("r1", "r2"):
            for i in range(1, 4):
                rows.append(obs(rid, i, latency=5, cost=5, holdout=i == 3))
        q = qualify_route_family([route("r1"), route("r2", compat="b")], rows, metabolic_mode="NORMAL")
        link = {"linkId": "l1", "fromRoute": "r1", "toRoute": "r2", "reason": "fallback peer", "decayAfterFailures": 2, "registered": True}
        plan = plan_sparse_reinforcement(q, [link])
        active = evaluate_sparse_reinforcement(plan, {"r1": "QUALIFIED", "r2": "QUALIFIED"}, {"l1": 1})
        self.assertEqual(active["links"][0]["state"], "ACTIVE")
        decayed = evaluate_sparse_reinforcement(plan, {"r1": "QUALIFIED", "r2": "QUALIFIED"}, {"l1": 2})
        self.assertEqual(decayed["links"][0]["reason"], "FAILURE_DECAY_THRESHOLD")
        degraded = evaluate_sparse_reinforcement(plan, {"r1": "DEGRADED", "r2": "QUALIFIED"}, {"l1": 0})
        self.assertEqual(degraded["links"][0]["reason"], "ROUTE_DEGRADED")
        self.assertFalse(degraded["authorityGranted"])

    def test_sparse_links_cannot_use_unqualified_or_invented_routes(self):
        rows = [obs("r1", 1), obs("r1", 2), obs("r1", 3, holdout=True)]
        q = qualify_route_family([route("r1"), route("r2", compat="b")], rows, metabolic_mode="NORMAL")
        link = {"linkId": "bad", "fromRoute": "r1", "toRoute": "r2", "reason": "not qualified", "decayAfterFailures": 1, "registered": True}
        with self.assertRaisesRegex(ValueError, "SPARSE_LINK_ROUTE_NOT_QUALIFIED"):
            plan_sparse_reinforcement(q, [link])

    def test_qualification_is_deterministic_and_disposable(self):
        rows = [obs("r1", 1), obs("r1", 2), obs("r1", 3, holdout=True)]
        a = qualify_route_family([route("r1")], rows, metabolic_mode="NORMAL")
        b = qualify_route_family([route("r1")], rows, metabolic_mode="NORMAL")
        self.assertEqual(a["qualificationDigest"], b["qualificationDigest"])
        self.assertTrue(a["derivedPreference"])
        self.assertFalse(a["routeGenerationByMycelium"])
        self.assertFalse(a["executionStarted"])


if __name__ == "__main__":
    unittest.main()
