# Qwen / Legion Engineering Log

**Authority:** evidence only; this log does not grant builder authority.
**Purpose:** preserve local-model selection, failures, timing, GPU placement, tool traces, and certification decisions used by V2.

## Logging rule
Every meaningful local Qwen engineering attempt should record: mission/job id, model, builder seam, outcome, duration, GPU/CPU placement where observed, changed paths, verifier result, timeout/extinction reason, and any prompt/tool-contract lesson.

Failures stay in the record. A newer/larger model does not replace a proven worker until it wins on actual OTHRYS engineering under the same bounded contract.
