import unittest
from pathlib import Path
from unittest.mock import patch
import node


class MyceliumNodeTests(unittest.TestCase):
    def fixture(self):
        return {"hostname":"LEGION","platform":"Windows","logical_cpus":16,"ram_total_mb":32768,"disk_free_mb":100000,"gpu":{"available":True,"name":"RTX","memory_total_mb":8192,"memory_used_mb":100,"utilization_pct":2,"temperature_c":45,"power_w":20.0},"runtimes":{"python":"3.11","node":"v24","git":"git version 2","ollama":True},"ollama_models":"qwen3:8b"}

    def test_advertised_capacity_reserves_host_resources(self):
        a=node.advertised_capacity(self.fixture())
        self.assertEqual(a["cpu_threads"],14); self.assertEqual(a["ram_mb"],28672); self.assertEqual(a["vram_mb"],7680)

    def test_envelope_never_grants_authority(self):
        with patch.object(node,"census",return_value=self.fixture()):
            e=node.build_node_envelope("legion",Path("."),Path(__file__))
        self.assertFalse(e["authorityGranted"]); self.assertFalse(e["routing"]["distributed"]); self.assertFalse(e["routing"]["hardcoded_hostname"])

    def test_engineering_capability_requires_model_and_worker(self):
        self.assertIn("engineering.patch",node.capabilities(self.fixture(),Path(__file__)))
        f=self.fixture(); f["ollama_models"]="other:1b"; self.assertNotIn("engineering.patch",node.capabilities(f,Path(__file__)))

    def test_feasible_is_capability_and_resource_addressed(self):
        with patch.object(node,"census",return_value=self.fixture()): e=node.build_node_envelope("legion",Path("."),Path(__file__))
        self.assertTrue(node.feasible(e,"engineering.patch",{"cpu_threads":2,"ram_mb":4096,"gpu_count":1,"vram_mb":6000}))
        self.assertFalse(node.feasible(e,"engineering.patch",{"vram_mb":8000}))
        self.assertFalse(node.feasible(e,"unknown.capability",{}))

    def test_authority_tamper_fails_closed(self):
        with patch.object(node,"census",return_value=self.fixture()): e=node.build_node_envelope("legion",Path("."),Path(__file__))
        e["authorityGranted"]=True
        self.assertFalse(node.feasible(e,"engineering.patch",{}))

    def test_owner_env_can_reduce_but_not_exceed_physical_capacity(self):
        env={"OTHRYS_CPU_THREADS":"4","OTHRYS_RAM_MB":"8192","OTHRYS_VRAM_MB":"2048","OTHRYS_OWNER_POLICY":"PERSONAL_FIRST"}
        with patch.dict("os.environ",env,clear=False):
            a=node.advertised_capacity(self.fixture())
        self.assertEqual(a["cpu_threads"],4); self.assertEqual(a["ram_mb"],8192); self.assertEqual(a["vram_mb"],2048); self.assertEqual(a["owner_policy"],"PERSONAL_FIRST")
        with patch.dict("os.environ",{"OTHRYS_CPU_THREADS":"999","OTHRYS_RAM_MB":"999999","OTHRYS_VRAM_MB":"999999"},clear=False):
            b=node.advertised_capacity(self.fixture())
        self.assertEqual(b["cpu_threads"],16); self.assertEqual(b["ram_mb"],32768); self.assertEqual(b["vram_mb"],8192)



if __name__ == "__main__": unittest.main()
