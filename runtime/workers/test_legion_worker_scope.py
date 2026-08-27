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
