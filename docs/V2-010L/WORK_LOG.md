# V2-010L WORK LOG

**Status:** RUNNING
**Start:** 2026-08-29
**Base:** `241dd8f175cc85b8aae47527c6e97dd0a283998b`

## Intake evidence
- V2-010K closed with exact T590 proof commit green.
- Baseline stress: Mycelium 10,000 chaos routes / 0 failures; 20,000 concurrent read-only route calls / 32 threads / 0 failures; Hephaestus authority suite 50x / 0 failures; full Node suite 10x / 0 failed runs; Python suites 10x / 0 failed suites.
- Current Mycelium selects one feasible node per request and sorts the full candidate list. First optimization target is algorithmic waste before adding channels.
- Multichannel is allowed only as a bounded placement plan for independent/read-only or isolated work. It does not launch workers.

## First optimization
- Replaced full sort for single-route selection with `min()` over feasible candidates: same deterministic score, less algorithmic work. Synthetic 10k-node/100-route baseline improved from ~929.7 ms to ~886.7 ms (~4.6%); modest but free.
- Added bounded authority-free `route_plan()` for 1..8 channels. Width >1 is legal only for `INDEPENDENT_READ_ONLY`, `ISOLATED_SHARD`, or `ALTERNATIVE_CANDIDATE`; shared mutation is rejected. Duplicate envelopes for one node cannot fake additional channels.
- Three-channel planning over 10k synthetic nodes measured ~9.87 ms/plan. This is planning only; no worker launch or throughput claim is made yet.
- Hephaestus remains single-mutation-boundary today. Multi-hand Hephaestus requires isolated workspaces/slices or alternative candidates plus one external verifier/merge gate before it can be activated safely.
- Multichannel planner stress: 20,000 width-3 plans across 32 caller threads, 0 failures, ~0.290 ms/plan over a 256-node synthetic colony.
- Activation stress exposed a malformed hand-built Work record digest and then a stale Command Deck test server process. Work was rematerialized through the canonical `work_record.mjs` API; stale test server was removed. Deck 14/14, full Node 287/287, Mycelium 29/29 and worker Python 10/10 returned green. This is now part of the housekeeping evidence.
- Deep scheduling harvest compared Ray, Dask, Borg, Kubernetes, Slurm, Nomad, Erlang/OTP and Celery. Kept logical resources, pack/spread, saturation/backpressure, strict placement, restart-intensity law and duration-class lanes; rejected heavyweight control planes and unsafe overcommit.
- Live colony census: Legion advertises 30 CPU threads / 27.9 GB RAM / 1 GPU / 7.6 GB VRAM; T590 advertises 6 CPU threads / 11.0 GB RAM / no GPU.
- LAN probe Legion -> T590 wired: 20/20 ping, 0% loss, ~0-1 ms RTT. 64 MiB curl transfer measured ~116 MB/s (~930 Mbit/s); an initial PowerShell downloader result (~11.3 Mbit/s) was correctly identified as client overhead, not LAN capacity. Temporary probe server/file removed.
- Parallel full-runtime proof: Legion 287/287 in ~3.68 s while T590 simultaneously ran 287/287 in ~3.29 s. Compared with sequential ~6.7 s, two independent verification lanes reduce wall clock by roughly 45% without shared mutation.
- Planner v0.2 adds cumulative capacity accounting, PACK/SPREAD/STRICT_PACK/STRICT_SPREAD, SATISFIED/PARTIAL/INFEASIBLE result state and balanced SPREAD reuse.
- Optional CPU/GPU pressure now affects route score; saturated right-sized nodes yield to healthier feasible nodes. Mycelium direct and discovery suite both 20/20.
