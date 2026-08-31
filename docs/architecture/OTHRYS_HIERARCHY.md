# OTHRYS Hierarchy — canonical house map

**Status:** ACTIVE OTHRYS OS architecture map. This document reconciles current V2 implementation with harvested constitutional Oros/Constellation and Block doctrine. It grants no execution authority.

## One-sentence model
**OTHRYS OS governs. A Blueprint describes one Oros. Factory composes it from eligible Blocks, Bridges and explicit product code. The Oros owns runtime reality. Its Micro-Constellation and Stars observe/manage that reality. Titans belong to OTHRYS and learn through evidence.**

## Authority hierarchy
```text
OTHRYS OS — control plane
└─ Great Constellation — portfolio/institutional projection
   └─ Titans — governed specialist authorities
      └─ Oroi — sovereign product worlds governed by OTHRYS
         ├─ exactly one canonical Blueprint
         ├─ Factory-resolved composition
         │  ├─ eligible Capability Blocks
         │  ├─ Bridges / provider adapters
         │  ├─ explicit product adapters
         │  └─ product-specific code
         ├─ Oros runtime reality — authoritative
         └─ Micro-Constellation — bounded management projection
            └─ Stars 0..N — managed operational domains
```

Blocks/Bridges sit on the **composition axis**, not the authority tree. Missions/Work sit on the **execution axis**. Mnemosyne/Atlas/Great Library sit on the **knowledge axis**. Mycelium/Hermes sit on the **transport/connection axis**. These axes support the hierarchy but do not replace it.
## Species table
| Species | What it is | Owns | Must never become |
|---|---|---|---|
| OTHRYS OS | control plane / operating environment | governance, institutional services, training, evidence, orchestration | customer business/Oros |
| Oros | sovereign product world | product reality, domain data, product lifecycle | control plane or reusable library |
| Blueprint | desired-state contract for exactly one Oros | capability need, outcomes, constraints, reuse policy | runtime truth or implementation |
| Capability Block | reusable user-meaningful product capability | its bounded implementation + contract + proof | Star, Titan, whole Oros |
| Primitive | small reusable deterministic operation | narrow helper contract | official Capability Block by naming alone |
| Bridge | provider/integration implementation of an edge | provider-specific transport/integration | provider-neutral Block identity |
| Adapter | explicit product-specific glue | local integration mapping | hidden fork of canonical Block |
| Factory | governed composition/build process | exact resolution and construction under mission authority | product truth or maturity authority |
| `oros.lock` | exact composition receipt | version/digest/provenance/evidence record | authority or desired-state contract |
| Micro-Constellation | bounded management projection over one Oros | derived operational understanding | Oros runtime truth |
| Star | managed operational domain in a Micro-Constellation | observation/management of a domain | Block or product implementation |
| Titan | OTHRYS specialist authority/organ | bounded institutional responsibility | tenant-owned agent or Block |

## Three state boundaries
1. **Desired state:** Blueprint says what the Oros should need.
2. **Resolved state:** Factory selects exact eligible versions and records the composition receipt.
3. **Actual state:** the running Oros is reality; Talos/Stars compare evidence against desired/resolved state.

A mismatch never gets papered over by rewriting whichever document is inconvenient. It becomes drift evidence.
## Product construction loop
```text
venture thesis / operator objective
        ↓
Blueprint capability demand
        ↓
Factory resolves eligible Block + Bridge + Adapter edges
        ↓
Hephaestus performs bounded construction
        ↓
Talos independently verifies Block contracts + whole-Oros contract
        ↓
Oros runs as authoritative reality
        ↓
Micro-Constellation / Stars observe health, business and capability signals
        ↓
Titans propose maintenance/optimisation through governed Missions
        ↓
Mnemosyne + Great Library retain provenance, failures, compatibility edges and learning
        ↺ next Oros becomes cheaper/faster/safer
```

## PandaOS alignment
The PandaOS harvest remains on track where it maps durable project state, explicit roles, visible permission modes, evidence-vs-approval gates, local/model routing and inspectable knowledge into stronger OTHRYS-native owners. Panda Work State maps to Missions/Work — **not Blueprint**. Panda skills inspire capability UX — **not automatic Block admission**. Panda Atlas inspires knowledge ergonomics — **not authority or opaque memory**.

The remaining Panda-class gaps are primarily operator UX and real autonomous-operation evidence, not a need to rebuild the backend hierarchy.

## Naming law
- Singular: `Oros`; plural: `Oroi`.
- Use `project` only for a generic development/work container; use `Oros` only after governed Oros identity exists.
- `Block` without qualifier means Capability Block in product architecture. Small Level 1/2 units are Forge Primitives unless separately promoted.
- `Constellation` never means a bag of Blocks. It is an intelligence/management projection.
- `Star` never means a service package. It is a managed domain in a Micro-Constellation.

## Canonical books
- `books/book-of-othrys-os/README.md`
- `books/book-of-oroi-projects/README.md`
- `books/book-of-blueprints/README.md`
- `books/book-of-blocks/README.md`
- `books/book-of-constellations/README.md`
- `books/book-of-factory/README.md`

If another document conflicts with this map, preserve the contradictory source as provenance and reconcile it explicitly; do not silently create a second truth.