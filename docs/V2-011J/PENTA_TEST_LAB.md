# V2-011J ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Penta Test Lab

The Pentarchy is treated as the operational core of OTHRYS OS. Tests are grouped by operator intent, not by implementation detail, so a later Settings page can expose simple buttons without inventing new backend logic.

## Settings-ready actions
- Penta Quick Check ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â five-seat readiness + daily Prometheus + Frugal reserve.
- OTHRYS Deep Check ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â every native OS resident test + Talos kernel.
- Care & Recovery ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Rhea + Kronos + Sclerotium.
- Knowledge & Intelligence ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Prometheus + Mnemosyne + context quality.
- Build & Execution ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Talos + Work + Switchyard/Frugal.
- Comms & Credentials ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Hermes + Keymaster.
- Benchmark Penta ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â deterministic hot-path microbenchmarks.
- 10x Loop / 100x Loop ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â bounded repeat/soak checks.

Canonical commands live under `tools/penta/`; the UI should later invoke these exact actions and render their JSON result. No test button may grant authority or mutate production state.

## Current proof
Current proof: Quick 23/23, Care 23/23, Intelligence 50/50, Execution 27/27, Communications 18/18, Deep 242/242. Whole-body is 382/382 across native OS, Hephaestus/Factory/Talos, Mycelium and workers. Pentarchy fault matrix blocks 10/10 missing-evidence faults and refuses authority escalation. Quick soak passed 100/100 cycles.
