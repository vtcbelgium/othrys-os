# Biological Mycelium Harvest — 2026-08-29

**Mission:** V2-010M
**Status:** research/adaptation input; not authority.

## Why study the organism

Real fungal mycelium is a decentralized adaptive transport network. Its value is not “many threads”; it is the ability to explore patchy environments cheaply, reinforce productive paths, fuse compatible routes, reroute around damage, recycle unused tissue, and enter survival states under stress.

The strongest OTHRYS lesson is therefore not maximum parallelism. It is dynamic network economy: spend structure only where measured flow, resilience or future option value justifies it.

## Biological mechanisms worth adapting

1. **Tip-local exploration.** Hyphae extend from active tips and branch in response to internal state and external nutrient conditions. OTHRYS analogue: new execution lanes should originate from local demand/capacity evidence, not a global desire for more workers.
2. **Loose hyphae vs cords.** Loose networks are effective for local exploration/uptake; reinforced cords reduce resistance for long-distance resource transport. OTHRYS analogue: cheap exploratory routes vs qualified Rhizomorph/reinforced routes.
3. **Source–sink remodeling.** Valuable new resources thicken useful cords while unrelated mycelium regresses. OTHRYS analogue: project demand creates sinks; successful routes reinforce, idle routes retract.
4. **Anastomosis.** Hyphal fusion creates loops and alternative transport paths. OTHRYS analogue: equivalent computation can fuse, but Claims/authority remain separate and compatibility gates precede sharing.
5. **Limited redundancy.** Robustness can improve sharply with a limited number of cross-links; fully connected networks are unnecessarily expensive. OTHRYS analogue: maintain sparse alternate verification/transport routes rather than all-to-all duplication.
6. **Selective reinforcement + recycling.** Fungal transport networks strengthen productive paths and recycle weak/unused structure, improving both transport and robustness while reducing relative construction cost. OTHRYS analogue: route reinforcement must have a paired decay/retraction law.
7. **Ecological memory.** Prior resource location/size influences later relocation behavior, but the network still remodels when conditions change. OTHRYS analogue: experience can bias among predeclared legal routes, must decay, and may never become current truth by itself.
8. **Damage rerouting.** Loops and fusion allow flow to bypass damage. OTHRYS analogue: preserve independent fallback routes across Legion/T590 and quarantine damaged strands locally instead of restarting the entire organism.
9. **Stress-state transition.** Under adverse conditions fungi redirect growth toward survival/dormant structures. OTHRYS analogue: CONSERVE/RECOVERY should contract work and Sclerotium should preserve only identity, law, provenance and irrecoverable state.
10. **Network is the organism.** Mycelium is not merely a transport layer around a separate organism; topology and resource flow co-determine behavior. OTHRYS analogue: Mycelium telemetry should inform operating posture, but never authority.

## OTHRYS design harvest

- Keep **Hypha** = disposable exploratory worker/lane.
- Re-admit **Rhizomorph** = evidence-qualified reinforced route, not a permanent worker.
- Treat project demand as **sink pressure** and node capability/headroom as **source capacity**.
- Add explicit **construction/coordination cost** and **robustness value** beside latency/throughput; never optimize a single scalar utilization score.
- Add a **cross-link budget**: redundancy should be sparse and evidence-backed. Independent verification is a valuable cross-link; duplicate same-node execution usually is not.
- Require a **retraction pair** for every growth rule. If a mechanism can branch/thicken but cannot thin/retract, it is biologically and operationally incomplete.
- Experience may thicken routes only after repeated verified flow, with holdout/hysteresis and decay. One success is not a cord.
- Damage response is local: quarantine strand/node/route, preserve healthy flow, then re-evaluate.
- Stress transitions should reduce active topology before adding retries.

## Sources studied

- Bebber et al., *Biological solutions to transport network design* — selective reinforcement, recycling, sparse cross-links, efficiency/robustness/cost trade-off.
- Fricker et al., *The Mycelium as a Network* — tip growth, branching, fusion, resource flows and feedback between topology and transport.
- Aleklett et al., *Network traits predict ecological strategies in fungi* — connectivity, construction cost, transport efficiency and robustness as Pareto-like ecological traits.
- Fricker/Boddy group, *Ecological memory and relocation decisions in fungal mycelial networks* — source/sink remodeling, cord reinforcement, regression and abandonment.
- van Iersel et al. 2026, *The mycelial network organization adapts to facilitate new substrate colonization and fruiting in Agaricus bisporus* — loose hyphae for substrate work versus cords for long-distance transport.
- Reviews on sclerotial biogenesis/stress development — survival-state formation under adverse conditions.

## Red-zone ideas studied and rejected/deferred

- **“Fungal nervous system” / brain analogy:** DEFER. Electrical activity exists, but current reviews emphasize major methodological limits and uncertainty about long-distance coordination. OTHRYS gets no electrical-spike architecture or pseudo-neural authority from this analogy.
- **Full mesh resilience:** REJECT. Biology shows selective cross-linking and differentiated link strength outperform uniform material distribution for the cost.
- **Always-on growth:** REJECT. Real networks regress, recycle and sometimes abandon small resources; growth without a paired retraction law is pathological.
- **Global magic optimizer:** REJECT. Useful fungal behavior emerges from local sensing, transport gradients, resource economics and network remodeling; OTHRYS should keep explainable local signals plus external law.
- **Permanent memory equals truth:** REJECT. Ecological history changes relocation behavior, but current source/sink conditions still remodel the network. Experience is preference evidence, not authority.

## Additional inspiration for later missions

- **Directed source/sink flow:** treat demand as sink pressure and available capacity/artifact evidence as sources; route observations should describe where useful work actually flowed.
- **Pulsatile/bidirectional transport:** do not assume one static preferred route. Experience should allow mode-dependent route changes and hysteresis rather than lock-in.
- **Tissue hierarchy:** exploratory Hypha -> reinforced Rhizomorph -> Sclerotium survival body is a more meaningful “3D Mycelium” than literal x/y/z scheduling. These are different temporal/functional layers of one organism.
- **Sparse healing loops:** independent cross-node verification, fallback transport and compatible Anastomosis are valuable loops; redundant same-node copies without failure diversity are usually waste.

## Compatibility / non-self recognition harvest

Filamentous fungi may fuse compatible hyphae, but non-self recognition can suppress fusion before contact or compartmentalize/kill incompatible fusion cells afterward. This is a direct systems lesson: contact/equivalence is not sufficient for trust.

Current adaptation: planning-only Anastomosis now requires both `workKey` and `compatibilityDigest` equality before shareable Claims can map to one producer plan. Independent-verification Claims remain separate regardless. The digest is not authority or authenticity proof; later Artifact reuse must derive compatibility from verified environment, capability version, provenance/freshness and authority envelope.

This also suggests a future containment rule: failed compatibility should isolate only the attempted fusion edge, not poison the entire healthy network.
