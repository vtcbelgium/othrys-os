import unittest

from colony import quarantine, route_live


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


if __name__ == "__main__": unittest.main()
