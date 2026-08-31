import subprocess
import tempfile
import unittest
from pathlib import Path

from legion_qwen_worker_v01 import _changed_since, _dirty_snapshot, _repair_single_path_tool_calls, _recover_malformed_write_args, _gate_finish_tool


def git(root: Path, *args: str) -> None:
    subprocess.check_call(
        ["git", "-C", str(root), *args],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


class DirtyDeltaTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        git(self.root, "init")
        git(self.root, "config", "user.email", "othrys@local")
        git(self.root, "config", "user.name", "OTHRYS")
        (self.root / "pre.txt").write_text("clean\n", encoding="utf-8")
        (self.root / "target.txt").write_text("before\n", encoding="utf-8")
        git(self.root, "add", ".")
        git(self.root, "commit", "-m", "baseline")

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_preexisting_dirty_file_is_not_attributed_to_worker(self) -> None:
        (self.root / "pre.txt").write_text("operator dirty\n", encoding="utf-8")
        before = _dirty_snapshot(self.root)
        (self.root / "target.txt").write_text("after\n", encoding="utf-8")
        after = _dirty_snapshot(self.root)
        self.assertEqual(_changed_since(before, after), ["target.txt"])

    def test_new_untracked_file_is_attributed(self) -> None:
        (self.root / "existing.tmp").write_text("existing\n", encoding="utf-8")
        before = _dirty_snapshot(self.root)
        (self.root / "new.tmp").write_text("new\n", encoding="utf-8")
        after = _dirty_snapshot(self.root)
        self.assertEqual(_changed_since(before, after), ["new.tmp"])

    def test_preexisting_dirty_file_changed_again_is_attributed(self) -> None:
        (self.root / "pre.txt").write_text("operator dirty\n", encoding="utf-8")
        before = _dirty_snapshot(self.root)
        (self.root / "pre.txt").write_text("worker changed it\n", encoding="utf-8")
        after = _dirty_snapshot(self.root)
        self.assertEqual(_changed_since(before, after), ["pre.txt"])


class ToolPathRepairTests(unittest.TestCase):
    def test_missing_write_path_uses_only_allowed_path(self) -> None:
        response = {"tool_calls": [{"function": {"name": "write_file", "arguments": '{"content":"x"}'}}]}
        fixed = _repair_single_path_tool_calls(response, ["only.txt"])
        self.assertIn('"path": "only.txt"', fixed["tool_calls"][0]["function"]["arguments"])

    def test_multiple_allowed_paths_do_not_infer(self) -> None:
        response = {"tool_calls": [{"function": {"name": "write_file", "arguments": '{"content":"x"}'}}]}
        fixed = _repair_single_path_tool_calls(response, ["a.txt", "b.txt"])
        self.assertNotIn('"path"', fixed["tool_calls"][0]["function"]["arguments"])

    def test_unrecoverable_truncated_arguments_do_not_infer_path(self) -> None:
        response = {"tool_calls": [{"function": {"name": "write_file", "arguments": '{"content":"partial'}}]}
        fixed = _repair_single_path_tool_calls(response, ["only.txt"])
        args = fixed["tool_calls"][0]["function"]["arguments"]
        self.assertNotIn('"path": "only.txt"', args)

    def test_malformed_json_body_recovers_explicit_authorized_path(self) -> None:
        raw = '{"path":"only.txt","content":"line one\nconst x = "quoted";\n"}'
        recovered = _recover_malformed_write_args(raw, "content")
        self.assertEqual(recovered["path"], "only.txt")
        self.assertIn('const x = "quoted";', recovered["content"])
        response = {"tool_calls": [{"function": {"name": "write_file", "arguments": raw}}]}
        fixed = _repair_single_path_tool_calls(response, ["only.txt"])
        parsed = __import__("json").loads(fixed["tool_calls"][0]["function"]["arguments"])
        self.assertEqual(parsed["path"], "only.txt")
        self.assertIn('const x = "quoted";', parsed["content"])

    def test_malformed_json_body_wrong_explicit_path_is_not_rewritten(self) -> None:
        raw = '{"path":"other.txt","content":"line one\n"}'
        response = {"tool_calls": [{"function": {"name": "write_file", "arguments": raw}}]}
        fixed = _repair_single_path_tool_calls(response, ["only.txt"])
        self.assertEqual(fixed["tool_calls"][0]["function"]["arguments"], raw)

    def test_finish_tool_hidden_before_attempt_mutation(self) -> None:
        tools = [{"function": {"name": "read_file"}}, {"function": {"name": "write_file"}}, {"function": {"name": "finish"}}]
        gated = _gate_finish_tool(tools, False)
        self.assertEqual([t["function"]["name"] for t in gated], ["read_file", "write_file"])

    def test_finish_tool_available_after_attempt_mutation(self) -> None:
        tools = [{"function": {"name": "write_file"}}, {"function": {"name": "finish"}}]
        gated = _gate_finish_tool(tools, True)
        self.assertEqual([t["function"]["name"] for t in gated], ["write_file", "finish"])

if __name__ == "__main__":
    unittest.main()


def test_malformed_single_path_write_recovery_discards_stray_json_tail():
    import importlib.util
    mod_path=Path(__file__).with_name("legion_qwen_worker_v01.py")
    spec=importlib.util.spec_from_file_location("worker_mod_tail",mod_path);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    raw=r'{"path":"x.mjs","content":"export const x = 1;\n"}]}]}\n\ No newline at end of file'
    got=mod._recover_malformed_write_args(raw,"content")
    assert got=={"path":"x.mjs","content":"export const x = 1;\n"}


def test_malformed_outer_tail_preserves_source_escape_sequences():
    import importlib.util
    mod_path=Path(__file__).with_name("legion_qwen_worker_v01.py")
    spec=importlib.util.spec_from_file_location("worker_mod_escape",mod_path);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    raw='{"path":"x.mjs","content":"const LF = \\\"\\\\n\\\";\\nconst r = /\\\\n{3,}/g;\\n"}]}'
    got=mod._recover_malformed_write_args(raw,"content")
    assert got["path"]=="x.mjs"
    assert got["content"]=='const LF = "\\n";\nconst r = /\\n{3,}/g;\n'


def test_worker_source_refuses_finish_before_mutation():
    text=Path(__file__).with_name("legion_qwen_worker_v01.py").read_text(encoding="utf-8")
    assert 'finish refused before mutation' in text
    assert 'if not mutated:' in text


def test_worker_evidence_is_allowlist_scoped():
    text=Path(__file__).with_name("legion_qwen_worker_v01.py").read_text(encoding="utf-8")
    assert '_scoped_workspace_diff(workspace, allowed)' in text
    assert 'local_engineering.workspace_diff = lambda _workspace' in text


def test_single_path_repair_normalizes_workspace_prefix_without_widening_scope():
    import importlib.util
    mod_path=Path(__file__).with_name("legion_qwen_worker_v01.py")
    spec=importlib.util.spec_from_file_location("worker_mod_prefix",mod_path);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    response={"tool_calls":[{"function":{"name":"write_file","arguments":{"path":"workspace/x.mjs","content":"ok"}}}]}
    got=mod._repair_single_path_tool_calls(response,["x.mjs"])
    import json
    args=json.loads(got["tool_calls"][0]["function"]["arguments"])
    assert args["path"]=="x.mjs"


def test_forge_execution_reads_roster_permission(tmp_path):
    import importlib.util, json
    mod_path=Path(__file__).with_name("legion_qwen_worker_v01.py")
    spec=importlib.util.spec_from_file_location("worker_mod_forge",mod_path);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    roster=tmp_path/"runtime"/"hephaestus"/"data";roster.mkdir(parents=True)
    (roster/"forge_roster.json").write_text(json.dumps({"builders":[{"id":"a","executionAllowed":True},{"id":"b","executionAllowed":False}]}),encoding="utf-8")
    assert mod._forge_execution_allowed(tmp_path,"a") is True
    assert mod._forge_execution_allowed(tmp_path,"b") is False
    assert mod._forge_execution_allowed(tmp_path,"missing") is False
