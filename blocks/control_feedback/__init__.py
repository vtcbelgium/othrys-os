"""OTHRYS V2 block: control_feedback.

Bounded responsibility: turn a delegated mission result into a machine-readable
receipt that GPT can read remotely. Records evidence only. Never decides
mission success. No AI, no retries, no fallback, no scheduler, no hidden state.
"""

SCHEMA_VERSION = "1.0.0"
NEXT_STATE = "WAIT_GPT"
