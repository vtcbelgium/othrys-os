import unittest
import node


class RoutingTests(unittest.TestCase):
    def env(self, node_id, gpu, cpu, caps):
        return {"node_id": node_id, "authorityGranted": False, "capabilities": caps,
                "advertised": {"cpu_threads": cpu, "ram_mb": 12000,
                               "gpu_count": gpu, "vram_mb": 7600 if gpu else 0}}

    def test_cpu_only_prefers_non_gpu_right_sized_node(self):
        legion = self.env("legion", 1, 30, ["verification.sha256@1", "engineering.patch"])
        t590 = self.env("t590", 0, 6, ["verification.sha256@1"])
        picked = node.select_node([legion, t590], "verification.sha256@1", {"cpu_threads": 1, "ram_mb": 64})
        self.assertEqual(picked["node_id"], "t590")

    def test_gpu_work_selects_legion(self):
        legion = self.env("legion", 1, 30, ["engineering.patch"])
        t590 = self.env("t590", 0, 6, ["verification.sha256@1"])
        picked = node.select_node([t590, legion], "engineering.patch", {"gpu_count": 1, "vram_mb": 6000})
        self.assertEqual(picked["node_id"], "legion")
