import unittest

from metabolism import (
    calibrate_concurrency_knee,
    choose_metabolic_mode,
    decide_topology,
    effective_channel_ceiling,
    normalize_resource_report,
)


class ResourceTruthTests(unittest.TestCase):
    def test_measured_report_derives_scarcity(self):
        r = normalize_resource_report({
            "availability": 0.25, "pressure": 0.70, "confidence": 0.80,
            "source": "host-probe", "disposition": "MEASURED",
        })
        self.assertEqual(r["scarcity"], 0.6)

    def test_unavailable_telemetry_must_not_fabricate_values(self):
        ok = normalize_resource_report({
            "availability": None, "pressure": None, "confidence": 0,
            "source": "probe-absent", "disposition": "UNAVAILABLE",
        })
        self.assertIsNone(ok["scarcity"])
        with self.assertRaisesRegex(ValueError, "UNAVAILABLE_RESOURCE_MUST_NOT_FABRICATE"):
            normalize_resource_report({
                "availability": 1, "pressure": 0, "confidence": 0,
                "source": "guess", "disposition": "UNAVAILABLE",
            })


class MetabolicModeTests(unittest.TestCase):
    def test_all_seven_modes_are_reachable(self):
        self.assertEqual(choose_metabolic_mode(demand=.05), "REST")
        self.assertEqual(choose_metabolic_mode(demand=.5, interactive=True), "INTERACTIVE")
        self.assertEqual(choose_metabolic_mode(demand=.5), "NORMAL")
        self.assertEqual(choose_metabolic_mode(demand=.9), "BURST")
        self.assertEqual(choose_metabolic_mode(demand=.7, ram_pressure=.9), "CONSERVE")
        self.assertEqual(choose_metabolic_mode(demand=.5, soak=True), "SOAK")
        self.assertEqual(choose_metabolic_mode(demand=.5, recovering=True), "RECOVERY")

    def test_pressure_beats_burst_and_interactive_growth(self):
        self.assertEqual(choose_metabolic_mode(demand=.95, interactive=True, cpu_pressure=.95), "CONSERVE")


class CalibrationTests(unittest.TestCase):
    def test_legion_like_curve_prefers_knee_not_redline(self):
        samples = [
            {"channels": 1, "throughput": 20.4},
            {"channels": 2, "throughput": 39.0},
            {"channels": 4, "throughput": 62.0},
            {"channels": 8, "throughput": 82.3},
            {"channels": 16, "throughput": 88.4},
            {"channels": 32, "throughput": 90.4},
        ]
        result = calibrate_concurrency_knee(samples)
        self.assertEqual(result["knee"], 16)
        self.assertFalse(result["authorityGranted"])

    def test_t590_like_curve_peaks_around_four(self):
        samples = [
            {"channels": 1, "throughput": 36.4},
            {"channels": 2, "throughput": 66.4},
            {"channels": 4, "throughput": 99.4},
            {"channels": 6, "throughput": 99.1},
            {"channels": 8, "throughput": 94.8},
        ]
        self.assertEqual(calibrate_concurrency_knee(samples)["knee"], 4)

    def test_severe_contention_can_make_one_channel_optimal(self):
        samples = [
            {"channels": 1, "throughput": 34.3},
            {"channels": 4, "throughput": 12.0},
            {"channels": 16, "throughput": 4.74},
        ]
        self.assertEqual(calibrate_concurrency_knee(samples)["knee"], 1)

    def test_failure_only_curve_is_unqualified(self):
        result = calibrate_concurrency_knee([{"channels": 2, "throughput": 10, "failures": 1}])
        self.assertEqual(result["status"], "UNQUALIFIED")
        self.assertIsNone(result["knee"])


class TopologyDecisionTests(unittest.TestCase):
    def policy(self, max_channels=8):
        return {"maxChannels": max_channels, "declarativeGrant": False}

    def test_project_and_measured_knee_both_cap_growth(self):
        self.assertEqual(effective_channel_ceiling(self.policy(4), measured_knee=16), 4)
        self.assertEqual(effective_channel_ceiling(self.policy(8), measured_knee=4), 4)
        self.assertEqual(effective_channel_ceiling(self.policy(8), measured_knee=None), 1)

    def test_growth_requires_useful_gain_above_cost(self):
        d = decide_topology(mode="NORMAL", current_channels=2, ceiling=4, demand=.9,
                            pressure=.1, expected_gain=2.0, marginal_cost=.5, reliability=.95)
        self.assertEqual(d["action"], "GROW")
        self.assertEqual(d["targetChannels"], 3)
        self.assertFalse(d["authorityGranted"])
        self.assertFalse(d["executionStarted"])

    def test_pressure_and_recovery_contract_even_under_demand(self):
        for mode in ("CONSERVE", "RECOVERY"):
            d = decide_topology(mode=mode, current_channels=4, ceiling=4, demand=1,
                                pressure=.9, expected_gain=100, marginal_cost=.01)
            self.assertEqual(d["action"], "CONTRACT")
            self.assertEqual(d["targetChannels"], 3)

    def test_idle_quiesces_and_over_ceiling_contracts(self):
        idle = decide_topology(mode="REST", current_channels=3, ceiling=4, demand=.05,
                               pressure=0, expected_gain=10, marginal_cost=1)
        self.assertEqual((idle["action"], idle["targetChannels"]), ("QUIESCE", 0))
        over = decide_topology(mode="NORMAL", current_channels=7, ceiling=4, demand=.9,
                               pressure=.1, expected_gain=10, marginal_cost=1)
        self.assertEqual((over["action"], over["targetChannels"]), ("CONTRACT", 4))

    def test_low_value_network_tissue_retracts(self):
        d = decide_topology(mode="NORMAL", current_channels=4, ceiling=8, demand=.3,
                            pressure=.7, expected_gain=.2, marginal_cost=2.0, reliability=.7)
        self.assertEqual(d["action"], "CONTRACT")
        self.assertEqual(d["targetChannels"], 3)


if __name__ == "__main__":
    unittest.main()


class MetabolicRoutingTests(unittest.TestCase):
    def node(self, node_id, cpu):
        return {"node_id": node_id, "authorityGranted": False,
                "capabilities": ["verification.sha256@1"],
                "advertised": {"cpu_threads": cpu, "ram_mb": 8192, "gpu_count": 0, "vram_mb": 0},
                "health": {"state": "READY", "cpu_percent": 10}}

    def policy(self, max_channels):
        return {"maxChannels": max_channels, "declarativeGrant": False}

    def test_project_and_knee_throttle_route_width(self):
        from metabolism import plan_metabolic_routes
        p = plan_metabolic_routes([self.node("a", 8), self.node("b", 8)], "verification.sha256@1",
                                  {"cpu_threads": 1}, project_policy=self.policy(8), measured_knee=4,
                                  mode="NORMAL", requested_channels=8, placement_strategy="SPREAD")
        self.assertEqual(p["admittedChannels"], 4)
        self.assertEqual(len(p["placements"]), 4)
        self.assertTrue(p["throttled"])
        self.assertFalse(p["authorityGranted"])

    def test_conserve_collapses_to_one_and_rest_quiesces(self):
        from metabolism import plan_metabolic_routes
        nodes = [self.node("a", 8), self.node("b", 8)]
        conserve = plan_metabolic_routes(nodes, "verification.sha256@1", {"cpu_threads": 1},
                                         project_policy=self.policy(8), measured_knee=8,
                                         mode="CONSERVE", requested_channels=8)
        rest = plan_metabolic_routes(nodes, "verification.sha256@1", {"cpu_threads": 1},
                                     project_policy=self.policy(8), measured_knee=8,
                                     mode="REST", requested_channels=8)
        self.assertEqual(conserve["admittedChannels"], 1)
        self.assertEqual(rest["admittedChannels"], 0)
        self.assertEqual(rest["placement_status"], "QUIESCED")
