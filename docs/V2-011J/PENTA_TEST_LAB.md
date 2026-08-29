# V2-011J Ã¢â‚¬â€ Penta Test Lab

The Pentarchy is treated as the operational core of OTHRYS OS. Tests are grouped by operator intent, not by implementation detail, so a later Settings page can expose simple buttons without inventing new backend logic.

## Settings-ready actions
- Penta Quick Check Ã¢â‚¬â€ five-seat readiness + daily Prometheus + Frugal reserve.
- OTHRYS Deep Check Ã¢â‚¬â€ every native OS resident test + Talos kernel.
- Care & Recovery Ã¢â‚¬â€ Rhea + Kronos + Sclerotium.
- Knowledge & Intelligence Ã¢â‚¬â€ Prometheus + Mnemosyne + context quality.
- Build & Execution Ã¢â‚¬â€ Talos + Work + Switchyard/Frugal.
- Comms & Credentials Ã¢â‚¬â€ Hermes + Keymaster.
- Benchmark Penta Ã¢â‚¬â€ deterministic hot-path microbenchmarks.
- 10x Loop / 100x Loop Ã¢â‚¬â€ bounded repeat/soak checks.

Canonical commands live under `tools/penta/`; the UI should later invoke these exact actions and render their JSON result. No test button may grant authority or mutate production state.

## Current proof
At introduction: Quick 21/21, Care 23/23, Intelligence 48/48, Execution 25/25, Communications 18/18, Deep 233/233. Whole-body proof is 373/373 across native OS, Hephaestus/Factory/Talos, Mycelium and workers. Quick soak passed 100/100 cycles (1,900 test executions).


