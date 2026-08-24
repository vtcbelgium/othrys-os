import importlib.util
import unittest
from pathlib import Path

P = Path(__file__).resolve().parents[1] / "tools" / "lifeline" / "github_relay.py"
spec = importlib.util.spec_from_file_location("lifeline_relay", P)
relay = importlib.util.module_from_spec(spec)
spec.loader.exec_module(relay)


def good():
    return {
        "state": "open",
        "title": "[LIFELINE-CMD] probe",
        "user": {"login": "vtcbelgium"},
        "body": '{"schema":"othrys.v2.lifeline.command.v1","command_id":"LIFELINE-001-PROBE-001","action":"scratch_builder_probe","builder":"qwen3-builder","touch_allow":["PROBE.txt"]}',
    }


class RelayValidationTests(unittest.TestCase):
    def test_accepts_exact_command(self):
        self.assertEqual(relay.validate_issue(good())["builder"], "qwen3-builder")

    def test_rejects_other_author(self):
        x = good(); x["user"] = {"login": "intruder"}
        with self.assertRaisesRegex(ValueError, "AUTHOR_NOT_ALLOWED"):
            relay.validate_issue(x)

    def test_rejects_extra_field(self):
        x = good(); x["body"] = x["body"][:-1] + ',"task":"do more"}'
        with self.assertRaisesRegex(ValueError, "COMMAND_FIELDS_INVALID"):
            relay.validate_issue(x)

    def test_rejects_other_builder(self):
        x = good(); x["body"] = x["body"].replace("qwen3-builder", "claude-builder")
        with self.assertRaisesRegex(ValueError, "BUILDER_NOT_ALLOWED"):
            relay.validate_issue(x)


if __name__ == "__main__":
    unittest.main()
