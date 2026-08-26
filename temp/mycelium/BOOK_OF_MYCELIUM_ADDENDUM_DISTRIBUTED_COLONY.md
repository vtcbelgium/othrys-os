# Book of Mycelium — V2 Addendum: Distributed Colony / Device Fabric

**Status:** TEMPORARY STUDY ADDENDUM · NO RUNTIME AUTHORITY  
**Date:** 2026-08-26  
**Source checked:** Hub permanent `docs/mycelium/DNA.md`, Mycelium campaign/evidence, V2 architecture discussion, external distributed-resource patterns.  
**Purpose:** preserve the multi-device direction without prematurely authorizing Distributed Colony.

## Canonical correction

The recovered Mycelium Book/DNA already anticipated this direction. Mycelium is a **bounded morphogenetic computational fabric**, not an agent, Titan, lawgiver, or second scheduler/authority plane.

Existing permanent laws remain binding:
- **DO NOT MAKE THE ORGANISM BUSIER. MAKE IT MORE CAPABLE WHILE REQUIRING LESS WORK.**
- **SHARE COMPUTATION. NEVER SHARE AUTHORITY.**
- Growth follows useful demand; idle/inefficient growth retracts.
- Adaptation may choose among predeclared legal routes; it may never invent authority or legality.
- `WorkKey`, `Claim`, and `Artifact` remain distinct; safe equivalent work may anastomose.

The old freeze explicitly forbade `distributed Mycelium / distributed CAS` and marked **Distributed Colony = LATER**. This addendum does not override that freeze. It records the V2 target for later qualification.
## V2 Distributed Colony target

An OTHRYS installation may later register its host as a **resource patch / execution node**. The node inventories physical capability, but advertises only the bounded capacity its owner permits OTHRYS to use.

Node census candidates:
- CPU / RAM / disk / GPU / VRAM / accelerator type
- OS, runtimes, browsers, local models and certified worker capabilities
- network/latency, power/battery, thermal/load/idle state
- allowed directories and security/trust posture
- operator resource ceilings and availability mode

**Physical capacity != advertised capacity.** A machine may expose only a fraction of what it owns. This matches mature logical-resource scheduling patterns: tasks request capabilities/resources and feasible nodes advertise bounded logical capacity rather than surrendering the whole physical host.

### Initial physical colony

- **Legion:** Node #1 / primary V2 execution substrate; GPU local AI + heavy CPU verification/build work.
- **ThinkPad T590:** future Node #2; Linux/CPU/network/background worker and first cross-machine proof target.
- **RTX 3090 Ti desktop:** future burst node, explicitly `PERSONAL_FIRST`; OTHRYS may borrow only operator-advertised idle capacity and must retract immediately when personal demand wins.
- **Samsung tablet:** edge/QA/operator node; Android/PWA/browser/visual proof, not assumed to be a build server.
- **Phone:** operator cockpit; intent/approval/observation, not an execution worker by default.
## Boundary with Talos

Do **not** turn Mycelium into another Talos.

- **Talos owns:** mission lifecycle, leases, attempts, retries, timeout, replay, dead-letter, terminal execution truth.
- **Mycelium owns:** sensed execution topology, resource economy, lawful route preference, growth/retraction, safe compute reuse, and later cross-node availability.
- **Trust Canal owns:** admission/binding/authority before work enters execution.
- **Titans own:** domain judgement; they may multiply hands but never transfer authority to Hyphae/nodes.

Talos asks for a bounded worker capability. Mycelium may later answer which certified node/route is currently feasible and metabolically preferable. Talos retains the lease and lifecycle.

## Distributed invariants to prove before activation

1. Node discovery never grants authority.
2. Node identity, trust evidence and advertised resource envelope are explicit.
3. Work is capability/resource-addressed, not hard-coded to a hostname.
4. Personal-first/owner policy outranks Mycelium optimization.
5. Loss of a node is ordinary damage: quarantine/retract; Talos lease/retry handles work continuity.
6. Cross-node artifacts preserve WorkKey/Claim/Artifact provenance; no unsafe Claim fusion.
7. Distributed CAS remains forbidden until integrity, provenance, freshness, compatibility and trust are separately proven.
8. No secret or authority-bearing work migrates merely because another node is faster.
9. Scheduling preference is derived/disposable; deleting it returns to deterministic legal routing.
10. Success is measured as verified useful work per metabolic cost, not CPU/GPU utilization for its own sake.
## Build implication for current V2

Do **not** implement Distributed Colony now. Make the current Legion worker contract **node-neutral from its first version** so distribution does not require architectural surgery later.

Recommended proof ladder:
1. Legion alone: census -> advertised envelope -> worker capability -> Talos lease -> measured execution.
2. T590: join as a second trusted resource patch; prove remote CPU/Linux work without changing mission semantics.
3. Failure drill: remove T590 mid-job; prove lease expiry/retry/reassignment without fabricated continuity.
4. Personal desktop: join with `PERSONAL_FIRST` policy and intentionally small advertised capacity; prove immediate throttle/retraction on owner activity.
5. Only after those proofs: study cross-node CAS/anastomosis and richer colony routing.

The goal is not maximum hardware utilization. The goal is a colony that **removes duplicated work, exploits genuinely spare capacity, survives node loss, and never shares authority merely because it shares compute.**

## External pattern note

Ray's current resource model is useful comparative evidence, not an implementation mandate: it separates physical from logical resources, lets tasks declare CPU/GPU/custom requirements, and schedules only on feasible nodes. Ray clusters also distinguish a control/head role from worker nodes. These ideas support Mycelium's planned resource-patch model, but V2 should quarry its own proven Mycelium/Talos contracts before adopting another framework.