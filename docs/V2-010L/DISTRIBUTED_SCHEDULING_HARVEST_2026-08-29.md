# Distributed Scheduling Harvest — 2026-08-29

**Status:** RESEARCH / GATED. No authority.
**Mission:** V2-010L Housekeeping Optimization / Multichannel Study.

## Live colony reality
- Legion advertises 30 CPU threads, 27.9 GB RAM, 1 GPU and 7.6 GB VRAM.
- T590 advertises 6 CPU threads, 11.0 GB RAM and no GPU.
- Therefore OTHRYS should optimize an asymmetric two-node colony, not imitate a homogeneous datacenter.

## Harvested patterns
- Ray: logical resource envelopes, custom resources, PACK/SPREAD placement groups, bounded retry, explicit task resources.
- Dask: saturation-aware queues, work stealing, task state machine, keep scheduler overhead small relative to work duration.
- Borg: admission control, packing, overcommit only with isolation, machine sharing, declarative jobs, simulation before policy changes.
- Kubernetes: topology spread / max-skew as a failure-domain and contention control.
- Slurm: heterogeneous all-or-nothing components and backfill; useful caution that coupled multi-resource jobs can deadlock placement.
- Durable workflow systems: execution ownership must remain separate from placement/routing.

## OTHRYS adaptations
- Mycelium may choose PACK/SPREAD/AUTO placement but never execute or grant authority.
- Talos retains leases, retries, terminal truth and reassignment.
- Trust Canal retains admission and authority.
- Hephaestus may gain multiple hands only through isolated workspaces/shards or alternative candidates.
- Same-path concurrent mutation remains forbidden.

## Red-zone thresholds
- Channel width stays hard-bounded at 8 until real worker throughput proves a higher value useful.
- A placement may reuse one node only while cumulative declared CPU/RAM/GPU/VRAM remains inside advertised capacity.
- Alternative candidates default SPREAD to reduce correlated failure and reviewer bias.
- Independent read-only and isolated shards default PACK to preserve the other node for different work.
- Do not implement work stealing until there is a durable queue/lease boundary to steal from.
- Do not implement distributed shared object storage/CAS until integrity, freshness and trust are separately proven.
- Do not overcommit CPU/RAM merely because Borg/Ray can; OTHRYS lacks process isolation today.
- Do not use network fan-out for sub-10ms work; scheduler/network overhead can dominate.

## Ferrari path
1. Measure real task classes: verification, indexing, build, AI inference, browser/visual proof.
2. Give each class a resource envelope and minimum useful task duration.
3. Add saturation score from queue depth + CPU/GPU pressure + latency, not machine identity.
4. Add bounded PACK/SPREAD placement plans with cumulative capacity accounting.
5. Add isolated Hephaestus hands only where changed-path sets are disjoint or candidates are separate.
6. Add Talos fan-in: one verifier decision over multiple candidate/shard receipts.
7. Later qualify work stealing for queued read-only shards only.
8. Simulate overload/node-loss before increasing channel caps.

## Rejected for current house
- Kubernetes/Ray/Dask as runtime dependencies: too much control-plane weight for two nodes today.
- Unbounded actors/workers, automatic autoscaling, same-workspace multi-writer builds.
- GPU sharing/overcommit before model-specific VRAM and thermal measurements exist.

## Build-system harvest
- Buck2/Bazel remote execution fingerprints command + inputs, checks an action cache, and executes only on a miss. This is more valuable than duplicating deterministic work.
- Buck2 deferred materialization shows another useful law: keep intermediate artifacts remote/content-addressed until a consumer actually needs the bytes.
- Nix remote builds reinforce capability/platform-based delegation and realise-or-fetch semantics.
- OTHRYS adaptation candidate: `ActionFingerprint -> verified receipt/artifact digest -> reuse if environment/capability/acceptance identity still matches`. This remains harvest only; Mnemosyne is not to be abused as a build cache.
- Do not add Buck2, Bazel, Nix, Buildbarn or a distributed CAS to the current two-node house merely to copy their architecture.

## Hephaestus hand threshold
- Coding multiplicity cap remains 3 because coordination and candidate-review cost grows quickly; planner width is not proof of useful physical execution width.
- Current hardware has only one `engineering.patch` node (Legion), so multi-node AI Hephaestus is not currently available.
- Legal future execution shapes: isolated disjoint worktrees or isolated same-scope candidate races followed by one Talos fan-in decision.
