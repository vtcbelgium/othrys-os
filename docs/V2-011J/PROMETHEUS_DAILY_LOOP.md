# Prometheus Daily Loop

Prometheus daily research lives inside the Pentarchy support loop and is triggered only by an explicit Kronos heartbeat. V2 does not invent a second scheduler.

Daily path:
`KRONOS BEAT -> DUE GATE -> PROMETHEUS SCAN ADAPTER -> DAILY REPORT -> MNEMOSYNE INBOX + HERMES MESSAGE INTENT + HARVEST WAKE PROPOSAL`

The loop persists a digest-bound daily report and a small state record. Findings are classified as NEWS, HARVEST or WATCH. High-value unharvested findings can recommend waking the Great Harvest preflight; they do not automatically promote knowledge or mutate code.

The operator message is a Hermes-bound intent. Delivery is a separate concern and cannot be claimed until Hermes/channel evidence exists. Mnemosyne receives the full daily report as INBOX knowledge requiring review.

Historical source: old Hub `hub/prometheus_research/daily_scan.py` already proved a 24-hour optional scan on an existing tick, including orphaned-run protection. V2 adapts the cadence and separation laws rather than copying the old Hub scheduler/UI.
