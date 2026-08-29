import unittest

from colony import quarantine, route_live, route_plan


def env(node_id, gpu=0, cpu=6, queue=0, state="READY", caps=None):
    return {
        "node_id": node_id,
        "authorityGranted": False,
        "capabilities": caps or ["verification.sha256@1"],
        "advertised": {"cpu_threads": cpu, "ram_mb": 8192, "gpu_count": gpu, "vram_mb": 7600 if gpu else 0},
        "health": {"state": state, "queue_depth": queue, "latency_ms": 2},
    }


class ColonyTests(unittest.TestCase):
    def test_cpu_work_prefers_gpu_free_node(self):
        self.assertEqual(route_live([env("legion",1,28), env("t590",0,6)], "verification.sha256@1", {"cpu_threads":1})["node_id"], "t590")

    def test_gpu_work_requires_gpu_node(self):
        nodes=[env("legion",1,28,caps=["engineering.patch"]),env("t590",0,6)]
        self.assertEqual(route_live(nodes,"engineering.patch",{"gpu_count":1,"vram_mb":6000})["node_id"],"legion")

    def test_unreachable_node_is_not_selected(self):
        self.assertEqual(route_live([env("t590",state="UNREACHABLE"),env("legion",1,28)],"verification.sha256@1",{})["node_id"],"legion")

    def test_queue_depth_can_shift_cpu_work(self):
        self.assertEqual(route_live([env("t590",0,6,queue=3),env("legion",1,28,queue=0)],"verification.sha256@1",{})["node_id"],"legion")

    def test_quarantine_only_changes_route_health(self):
        original=env("t590")
        q=quarantine(original,"NODE_LOST")
        self.assertEqual(original["health"]["state"],"READY")
        self.assertEqual(q["health"]["state"],"UNREACHABLE")
        self.assertEqual(q["health"]["reason"],"NODE_LOST")
        self.assertFalse(q["authorityGranted"])

    def test_quarantined_node_allows_next_talos_attempt_elsewhere(self):
        t590=quarantine(env("t590"))
        legion=env("legion",1,28)
        self.assertEqual(route_live([t590,legion],"verification.sha256@1",{})["node_id"],"legion")

    def test_authority_tamper_never_routes(self):
        bad=env("bad"); bad["authorityGranted"]=True
        self.assertIsNone(route_live([bad],"verification.sha256@1",{}))


class MultichannelRoutingTests(unittest.TestCase):
    def test_multichannel_plan_is_bounded_distinct_and_authority_free(self):
        nodes=[env("a",0,8),env("b",0,8),env("c",0,8)]
        plan=route_plan(nodes,"verification.sha256@1",{"cpu_threads":1},channels=2,placement_strategy="SPREAD")
        self.assertEqual(len(plan["placements"]),2)
        self.assertEqual(len({x["node_id"] for x in plan["placements"]}),2)
        self.assertFalse(plan["authorityGranted"]); self.assertFalse(plan["executionStarted"])

    def test_multichannel_rejects_shared_mutation_and_unbounded_width(self):
        nodes=[env("a",0,8),env("b",0,8)]
        with self.assertRaisesRegex(ValueError,"MULTICHANNEL_WORK_MODE_FORBIDDEN"):
            route_plan(nodes,"verification.sha256@1",{},channels=2,work_mode="SHARED_MUTATION")
        with self.assertRaisesRegex(ValueError,"CHANNEL_BUDGET_INVALID"):
            route_plan(nodes,"verification.sha256@1",{},channels=9)

    def test_duplicate_node_envelopes_cannot_fake_extra_channels(self):
        a=env("a",0,1); b=env("b",0,1)
        plan=route_plan([a,a,b],"verification.sha256@1",{"cpu_threads":1},channels=3,placement_strategy="SPREAD")
        self.assertEqual([x["node_id"] for x in plan["placements"]],["a","b"])
        self.assertEqual(plan["satisfied_channels"],2)

class PlacementStrategyTests(unittest.TestCase):
    def test_pack_reuses_node_only_with_real_remaining_capacity(self):
        nodes=[env("a",0,4),env("b",0,4)]
        plan=route_plan(nodes,"verification.sha256@1",{"cpu_threads":2,"ram_mb":1024},channels=3,placement_strategy="PACK")
        self.assertEqual([x["node_id"] for x in plan["placements"]],["a","a","b"])
        self.assertEqual(plan["satisfied_channels"],3)

    def test_spread_uses_distinct_nodes_before_reuse(self):
        nodes=[env("a",0,4),env("b",0,4)]
        plan=route_plan(nodes,"verification.sha256@1",{"cpu_threads":1,"ram_mb":1024},channels=3,placement_strategy="SPREAD")
        self.assertEqual([x["node_id"] for x in plan["placements"]],["a","b","a"])

    def test_auto_spreads_alternative_candidates_and_packs_shards(self):
        nodes=[env("a",0,4),env("b",0,4)]
        alternatives=route_plan(nodes,"verification.sha256@1",{"cpu_threads":1},channels=2,work_mode="ALTERNATIVE_CANDIDATE")
        shards=route_plan(nodes,"verification.sha256@1",{"cpu_threads":1},channels=2,work_mode="ISOLATED_SHARD")
        self.assertEqual(alternatives["placement_strategy"],"SPREAD")
        self.assertEqual(shards["placement_strategy"],"PACK")

    def test_capacity_prevents_oversubscription_and_invalid_strategy_fails(self):
        nodes=[env("a",0,2)]
        plan=route_plan(nodes,"verification.sha256@1",{"cpu_threads":2,"ram_mb":1024},channels=4,placement_strategy="PACK")
        self.assertEqual(plan["satisfied_channels"],1)
        with self.assertRaisesRegex(ValueError,"PLACEMENT_STRATEGY_INVALID"):
            route_plan(nodes,"verification.sha256@1",{},placement_strategy="YOLO")

    def test_spread_balances_reuse_after_all_nodes_are_touched(self):
        nodes=[env("a",0,4),env("b",0,4)]
        plan=route_plan(nodes,"verification.sha256@1",{"cpu_threads":1},channels=4,placement_strategy="SPREAD")
        self.assertEqual([x["node_id"] for x in plan["placements"]],["a","b","a","b"])

    def test_repeated_capacity_plans_never_exceed_declared_cpu(self):
        nodes=[env("a",0,4),env("b",0,2)]
        for strategy in ("PACK","SPREAD"):
            for channels in range(1,9):
                plan=route_plan(nodes,"verification.sha256@1",{"cpu_threads":1,"ram_mb":256},channels=channels,placement_strategy=strategy)
                counts={"a":0,"b":0}
                for placement in plan["placements"]: counts[placement["node_id"]]+=1
                self.assertLessEqual(counts["a"],4); self.assertLessEqual(counts["b"],2)
                self.assertLessEqual(plan["satisfied_channels"],6)

class StrictPlacementTests(unittest.TestCase):
    def test_strict_spread_is_all_or_nothing(self):
        nodes=[env("a",0,4),env("b",0,4)]
        ok=route_plan(nodes,"verification.sha256@1",{"cpu_threads":1},channels=2,placement_strategy="STRICT_SPREAD")
        bad=route_plan(nodes,"verification.sha256@1",{"cpu_threads":1},channels=3,placement_strategy="STRICT_SPREAD")
        self.assertEqual(ok["placement_status"],"SATISFIED")
        self.assertEqual([x["node_id"] for x in ok["placements"]],["a","b"])
        self.assertEqual(bad["placement_status"],"INFEASIBLE"); self.assertEqual(bad["placements"],[])

    def test_strict_pack_requires_one_node_to_fit_every_lane(self):
        nodes=[env("a",0,4),env("b",0,2)]
        ok=route_plan(nodes,"verification.sha256@1",{"cpu_threads":1},channels=4,placement_strategy="STRICT_PACK")
        bad=route_plan(nodes,"verification.sha256@1",{"cpu_threads":2},channels=3,placement_strategy="STRICT_PACK")
        self.assertEqual(ok["placement_status"],"SATISFIED")
        self.assertEqual({x["node_id"] for x in ok["placements"]},{"a"})
        self.assertEqual(bad["placement_status"],"INFEASIBLE"); self.assertEqual(bad["satisfied_channels"],0)
class SaturationRoutingTests(unittest.TestCase):
    def test_idle_node_beats_right_sized_but_saturated_node(self):
        t590=env("t590",0,6); legion=env("legion",1,30)
        t590["health"]["cpu_percent"]=95
        legion["health"]["cpu_percent"]=15
        picked=route_live([t590,legion],"verification.sha256@1",{"cpu_threads":1})
        self.assertEqual(picked["node_id"],"legion")

    def test_gpu_pressure_breaks_ties_between_equivalent_gpu_nodes(self):
        a=env("a",1,8,caps=["engineering.patch"]); b=env("b",1,8,caps=["engineering.patch"])
        a["health"]["gpu_util_percent"]=95; b["health"]["gpu_util_percent"]=10
        picked=route_live([a,b],"engineering.patch",{"gpu_count":1,"vram_mb":1024})
        self.assertEqual(picked["node_id"],"b")

if __name__ == "__main__":
    unittest.main()
