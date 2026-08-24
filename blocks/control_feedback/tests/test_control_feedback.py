"""Deterministic proof suite for the control_feedback block."""

import json
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from blocks.control_feedback import cli, receipt as receipt_module
from blocks.control_feedback.secrets import SecretDetected, scan
from blocks.control_feedback.validate import load_schema, validate

ENVELOPE = {
    "schema_version": "1.0.0",
    "mission_id": "V2-TEST",
    "objective": "test objective",
    "delegate": "unit-test",
    "issued_by": "GPT",
    "issued_at": "2026-08-23T00:00:00Z",
    "expected_proof": ["receipt exists"],
}

RESULT = {
    "created_at": "2026-08-23T00:00:01Z",
    "files_changed": [{"path": "a.py", "change": "added", "sha256": "0" * 64}],
    "commands_run": [{"cmd": "python3 -m unittest", "exit_code": 0}],
    "tests": [{"name": "suite", "result": "pass", "detail": "10 tests"}],
    "evidence": ["receipts/LATEST.json"],
    "result_claimed": "COMPLETE",
    "blocker": None,
}

SHA_A = "a" * 40
SHA_B = "b" * 40


def build():
    return receipt_module.build_receipt(ENVELOPE, dict(RESULT), "missions/x.json")


class EnvelopeContract(unittest.TestCase):
    def test_valid_envelope_passes(self):
        self.assertEqual(validate(ENVELOPE, load_schema("mission_envelope")), [])

    def test_unknown_property_is_refused(self):
        bad = dict(ENVELOPE, surprise="x")
        self.assertTrue(validate(bad, load_schema("mission_envelope")))

    def test_bad_mission_id_is_refused(self):
        bad = dict(ENVELOPE, mission_id="lowercase")
        self.assertTrue(validate(bad, load_schema("mission_envelope")))

    def test_build_refuses_invalid_envelope(self):
        with self.assertRaises(receipt_module.ReceiptError):
            receipt_module.build_receipt(dict(ENVELOPE, issued_at="yesterday"), dict(RESULT), "r")


class ReceiptContract(unittest.TestCase):
    def test_receipt_is_schema_valid_and_waits_for_gpt(self):
        built = build()
        self.assertEqual(validate(built, load_schema("receipt")), [])
        self.assertEqual(built["next_state"], "WAIT_GPT")
        self.assertEqual(built["sync_status"], "NOT_SYNCED")
        self.assertIsNone(built["repo_sha"])
        self.assertIsNone(built["remote_sha"])

    def test_result_keys_are_exact(self):
        short = dict(RESULT)
        short.pop("blocker")
        with self.assertRaises(receipt_module.ReceiptError):
            receipt_module.build_receipt(ENVELOPE, short, "r")
        with self.assertRaises(receipt_module.ReceiptError):
            receipt_module.build_receipt(ENVELOPE, dict(RESULT, extra=1), "r")

    def test_block_never_upgrades_a_claim(self):
        built = receipt_module.build_receipt(
            ENVELOPE, dict(RESULT, result_claimed="FAILED", blocker="x"), "r"
        )
        self.assertEqual(built["result_claimed"], "FAILED")
        self.assertEqual(built["next_state"], "WAIT_GPT")


class WriterBehaviour(unittest.TestCase):
    def test_writes_run_receipt_and_latest_identically(self):
        with TemporaryDirectory() as root:
            built = build()
            run_path, latest_path = receipt_module.write_receipt(root, built)
            self.assertTrue(run_path.is_file())
            self.assertEqual(
                run_path.read_text(encoding="utf-8"),
                latest_path.read_text(encoding="utf-8"),
            )
            self.assertEqual(json.loads(latest_path.read_text(encoding="utf-8")), built)

    def test_run_receipt_is_immutable(self):
        with TemporaryDirectory() as root:
            built = build()
            receipt_module.write_receipt(root, built)
            with self.assertRaises(receipt_module.ReceiptError):
                receipt_module.write_receipt(root, built)

    def test_invalid_receipt_writes_nothing(self):
        with TemporaryDirectory() as root:
            broken = dict(build(), next_state="GO")
            with self.assertRaises(receipt_module.ReceiptError):
                receipt_module.write_receipt(root, broken)
            self.assertEqual(sorted(Path(root).iterdir()), [])

    def test_secret_shaped_receipt_writes_nothing(self):
        with TemporaryDirectory() as root:
            leaky = dict(build())
            leaky["evidence"] = ["gh" + "p_" + "A" * 32]
            with self.assertRaises(SecretDetected):
                receipt_module.write_receipt(root, leaky)
            self.assertEqual(sorted(Path(root).iterdir()), [])

    def test_atomic_write_leaves_no_temp_files(self):
        with TemporaryDirectory() as root:
            receipt_module.write_receipt(root, build())
            leftovers = [p.name for p in Path(root).rglob(".tmp-*")]
            self.assertEqual(leftovers, [])

    def test_secret_scanner_is_quiet_on_clean_text(self):
        self.assertEqual(scan("receipts/LATEST.json sha 0123abcd"), [])


class SyncProof(unittest.TestCase):
    def _seed(self, root):
        receipt_module.write_receipt(root, build())

    def test_matching_shas_are_synced(self):
        with TemporaryDirectory() as root:
            self._seed(root)
            stamp, path = receipt_module.stamp_sync(
                root, "https://example.invalid/r.git", SHA_A, SHA_A, "2026-08-23T00:00:02Z"
            )
            self.assertEqual(stamp["sync_status"], "SYNCED")
            self.assertEqual(validate(stamp, load_schema("sync_stamp")), [])
            self.assertTrue(path.is_file())
            latest = receipt_module.read_latest(root)
            self.assertEqual(latest["sync_status"], "SYNCED")
            self.assertEqual(latest["remote_sha"], SHA_A)

    def test_mismatched_shas_are_not_synced(self):
        with TemporaryDirectory() as root:
            self._seed(root)
            stamp, _ = receipt_module.stamp_sync(
                root, "https://example.invalid/r.git", SHA_A, SHA_B, "2026-08-23T00:00:02Z"
            )
            self.assertEqual(stamp["sync_status"], "NOT_SYNCED")
            self.assertEqual(receipt_module.read_latest(root)["sync_status"], "NOT_SYNCED")

    def test_missing_remote_sha_is_not_synced(self):
        with TemporaryDirectory() as root:
            self._seed(root)
            stamp, _ = receipt_module.stamp_sync(
                root, "https://example.invalid/r.git", SHA_A, None, "2026-08-23T00:00:02Z"
            )
            self.assertEqual(stamp["sync_status"], "NOT_SYNCED")
            self.assertIsNone(stamp["remote_sha"])

    def test_blocker_is_recorded_on_the_stamp(self):
        with TemporaryDirectory() as root:
            self._seed(root)
            stamp, _ = receipt_module.stamp_sync(
                root, "https://example.invalid/r.git", SHA_A, None,
                "2026-08-23T00:00:02Z", "no egress to the remote",
            )
            self.assertEqual(stamp["blocker"], "no egress to the remote")
            self.assertEqual(validate(stamp, load_schema("sync_stamp")), [])

    def test_run_receipt_is_not_rewritten_by_stamping(self):
        with TemporaryDirectory() as root:
            built = build()
            run_path, _ = receipt_module.write_receipt(root, built)
            before = run_path.read_text(encoding="utf-8")
            receipt_module.stamp_sync(
                root, "https://example.invalid/r.git", SHA_A, SHA_A, "2026-08-23T00:00:02Z"
            )
            self.assertEqual(run_path.read_text(encoding="utf-8"), before)

    def test_stamp_requires_latest(self):
        with TemporaryDirectory() as root:
            with self.assertRaises(receipt_module.ReceiptError):
                receipt_module.stamp_sync(
                    root, "r", SHA_A, SHA_A, "2026-08-23T00:00:02Z"
                )


class CliExitCodes(unittest.TestCase):
    def _files(self, root):
        envelope_path = Path(root) / "envelope.json"
        result_path = Path(root) / "result.json"
        envelope_path.write_text(json.dumps(ENVELOPE), encoding="utf-8")
        result_path.write_text(json.dumps(RESULT), encoding="utf-8")
        return str(envelope_path), str(result_path)

    def test_emit_then_stamp_exit_codes(self):
        with TemporaryDirectory() as root:
            envelope_path, result_path = self._files(root)
            self.assertEqual(
                cli.main(["emit", "--root", root, "--envelope", envelope_path, "--result", result_path]),
                0,
            )
            self.assertEqual(
                cli.main(
                    ["stamp-sync", "--root", root, "--remote", "https://example.invalid/r.git",
                     "--repo-sha", SHA_A, "--remote-sha", SHA_B, "--verified-at", "2026-08-23T00:00:02Z"]
                ),
                3,
            )

    def test_validate_refuses_bad_document(self):
        with TemporaryDirectory() as root:
            bad = Path(root) / "bad.json"
            bad.write_text(json.dumps(dict(ENVELOPE, mission_id="nope")), encoding="utf-8")
            self.assertEqual(cli.main(["validate", "--kind", "envelope", "--file", str(bad)]), 2)

    def test_emit_refuses_bad_envelope(self):
        with TemporaryDirectory() as root:
            envelope_path, result_path = self._files(root)
            Path(envelope_path).write_text(json.dumps(dict(ENVELOPE, delegate="")), encoding="utf-8")
            self.assertEqual(
                cli.main(["emit", "--root", root, "--envelope", envelope_path, "--result", result_path]),
                2,
            )


class NegativeControls(unittest.TestCase):
    """V2-000F: every rejection must fail closed, write nothing, mutate nothing."""

    def _seeded(self, root):
        receipt_module.write_receipt(root, build())

    def test_corrupt_latest_is_refused_not_parsed(self):
        with TemporaryDirectory() as root:
            self._seeded(root)
            (Path(root) / "receipts" / "LATEST.json").write_text("{not json", encoding="utf-8")
            with self.assertRaises(receipt_module.ReceiptError):
                receipt_module.read_latest(root)
            self.assertEqual(
                cli.main(["stamp-sync", "--root", root, "--remote", "r",
                          "--repo-sha", SHA_A, "--verified-at", "2026-08-24T00:00:00Z"]), 2)
            self.assertEqual(list((Path(root) / "receipts").glob("sync/*")), [])

    def test_schema_invalid_latest_is_refused(self):
        with TemporaryDirectory() as root:
            self._seeded(root)
            broken = dict(build(), next_state="GO")
            (Path(root) / "receipts" / "LATEST.json").write_text(
                json.dumps(broken), encoding="utf-8")
            with self.assertRaises(receipt_module.ReceiptError):
                receipt_module.read_latest(root)

    def test_duplicate_sync_stamp_is_refused(self):
        with TemporaryDirectory() as root:
            self._seeded(root)
            args = (root, "https://example.invalid/r.git", SHA_A, SHA_A, "2026-08-24T00:00:00Z")
            receipt_module.stamp_sync(*args)
            with self.assertRaises(receipt_module.ReceiptError):
                receipt_module.stamp_sync(*args)

    def test_secret_shaped_blocker_never_reaches_a_stamp(self):
        with TemporaryDirectory() as root:
            self._seeded(root)
            with self.assertRaises(SecretDetected):
                receipt_module.stamp_sync(
                    root, "r", SHA_A, None, "2026-08-24T00:00:00Z",
                    "push failed using gh" + "p_" + "B" * 32)
            self.assertEqual(list((Path(root) / "receipts").glob("sync/*")), [])
            self.assertEqual(receipt_module.read_latest(root)["sync_status"], "NOT_SYNCED")

    def test_equal_but_malformed_shas_cannot_claim_synced(self):
        with TemporaryDirectory() as root:
            self._seeded(root)
            with self.assertRaises(receipt_module.ReceiptError):
                receipt_module.stamp_sync(
                    root, "r", "not-a-sha", "not-a-sha", "2026-08-24T00:00:00Z")
            self.assertEqual(list((Path(root) / "receipts").glob("sync/*")), [])
            self.assertEqual(receipt_module.read_latest(root)["sync_status"], "NOT_SYNCED")

    def test_failed_atomic_replace_leaves_no_residue_and_no_target(self):
        with TemporaryDirectory() as root:
            original = receipt_module.os.replace

            def exploding_replace(src, dst):
                raise OSError("simulated replace failure")

            receipt_module.os.replace = exploding_replace
            try:
                with self.assertRaises(OSError):
                    receipt_module.write_receipt(root, build())
            finally:
                receipt_module.os.replace = original
            leftovers = [p.name for p in Path(root).rglob(".tmp-*")]
            written = [p for p in Path(root).rglob("*.json")]
            self.assertEqual(leftovers, [])
            self.assertEqual(written, [])

    def test_malformed_input_file_refuses_without_traceback(self):
        with TemporaryDirectory() as root:
            bad = Path(root) / "envelope.json"
            bad.write_text("{ broken", encoding="utf-8")
            self.assertEqual(
                cli.main(["validate", "--kind", "envelope", "--file", str(bad)]), 2)

    def test_guard_allows_ordinary_control_prose(self):
        """A guard that blocks normal work gets disabled. Prove ALLOW, not only DENY."""
        allowed = [
            "no secret value entered this receipt",
            "secrets are referenced by name only",
            "credentials for the private repository are not attached to this session",
            "authorization: pending operator review",
            "config_refs recorded as names, values withheld",
        ]
        for text in allowed:
            with self.subTest(text=text):
                self.assertEqual(scan(text), [])
        with TemporaryDirectory() as root:
            wordy = dict(build())
            wordy["evidence"] = allowed
            run_path, latest_path = receipt_module.write_receipt(root, wordy)
            self.assertTrue(run_path.is_file() and latest_path.is_file())


if __name__ == "__main__":
    unittest.main()
