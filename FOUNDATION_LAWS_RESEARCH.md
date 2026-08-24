# OTHRYS V2 FOUNDATION LAWS — RESEARCH BASIS

**Purpose:** evidence/reference for `FOUNDATION_LAWS.md`. This file is not runtime authority.

## Existing OTHRYS canon recovered first

Source: `LEGACY_INVENTORY.md`, section `BLOCK / OROS / BLUEPRINT CANON`.

Recovered law already present in OTHRYS:

- Book of Blocks: one coherent capability, explicit `provides / requires / optional`, bounded authority/data/side effects/trust, independent verification, provenance, maturity, Ports and Bridges/Adapters; explicitly warns against premature universal Port registries/resolvers.
- Book of Hephaestus: Block anatomy is **Contract -> Socket -> Capsule -> Manifest**; Blueprint is Oros chassis; Oros Zero starts with one Block and advances slowly.
  - **Correction (V2-000C.R):** a direct search of the recovered repositories found no occurrence of `SOCKET` or `CAPSULE` in Block or Oros doctrine. The canonical terms are **Port** (Book of Blocks §0.2) and the Block directory (`othrys-blocks/docs/CONVENTION.md`). This research line is kept as the record of what was believed; it is not authority.
- Block Composition Law: Blueprint declares desired capability/range; exact Block/Bridge/version/digest/provenance is resolved later; `oros.lock` records actual composition; no silent upgrade/fork/secret grant; normal reuse requires appropriate maturity.
- ADR-0050 Oros law: Oros is authoritative operational reality; Blueprint is canonical desired structure; external projections are not runtime truth.

V2 therefore does not create a new Block system. It makes these existing rules stricter at the first two-Block boundary.

## External standards/patterns studied

### Semantic Versioning 2.0.0
Source: https://semver.org/

Useful principles:
- declare a precise public API first;
- MAJOR/MINOR/PATCH communicates compatibility change;
- once a version is released, its contents must not be modified;
- `0.y.z` explicitly signals initial development instability.

V2 adoption:
- Block Contract is the public API;
- released Block versions are immutable;
- changed public behaviour creates a new version rather than rewriting an admitted version.

### OCI Image/Descriptor specifications
Sources:
- https://specs.opencontainers.org/image-spec/
- https://specs.opencontainers.org/image-spec/manifest/
- https://specs.opencontainers.org/image-spec/descriptor/

Useful principles:
- manifests describe components and metadata;
- references are content-addressable by cryptographic digest;
- descriptors bind media type/size/digest to referenced content;
- a named object can be independently verified against its digest.

V2 adoption:
- Block identity is not just `id + version`; exact admitted bytes/package/tree are bound to a digest;
- manifest and executable substance are distinguishable but linked;
- composition records exact digests so same-name substitution cannot pass unnoticed.

### SLSA v1.2 provenance
Sources:
- https://slsa.dev/spec/v1.2/
- https://slsa.dev/spec/v1.2/provenance

Useful principles:
- provenance explains where, when and how an artifact was produced;
- consumers verify provenance downstream rather than trusting the producer's claim;
- build inputs/dependencies should be resolved and recorded;
- external parameters are untrusted inputs;
- provenance should identify the produced artifact unambiguously.

V2 adoption:
- provenance is part of Block admission evidence;
- source revision, builder/extraction process and dependencies are recorded when known;
- unknown provenance is explicit rather than invented;
- exact artifact digest is the anchor between build evidence and admitted Block.

### Kubernetes admission control
Sources:
- https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/
- https://kubernetes.io/docs/concepts/cluster-administration/admission-webhooks-good-practices/

Useful principles:
- validate objects before they become accepted runtime state;
- mutation and validation are separate concerns;
- validating controls should see the final object state when enforcement depends on it;
- admission components are part of the control plane and must avoid dependency loops;
- auditability/unique identity matters.

V2 adoption:
- discovery never equals admission;
- admission validates the final exact Block version/digest before mount;
- admission does not silently repair the candidate it is judging;
- admission remains small and deterministic at this stage.

Note: Kubernetes recommends fail-open behaviour for some *mutating webhook availability* scenarios plus later validation. That availability trade-off is not copied blindly. OTHRYS foundation admission is local, deterministic and security/authority-bearing, so unknown/invalid admission state fails closed under Book of GPT law.

### The Update Framework (TUF)
Sources:
- https://theupdateframework.io/docs/security/
- https://theupdateframework.github.io/specification/v1.0.28/

Useful principles:
- detect rollback to older metadata/artifacts;
- detect freeze/stale metadata;
- prevent mix-and-match states that never existed together;
- version and trusted metadata progression are explicit;
- invalid update evidence aborts rather than silently accepting stale state.

V2 adoption:
- no silent Block downgrade;
- exact composition is a coherent set, not independent latest-version guesses;
- updates are new admissions and composition changes;
- stale or contradictory metadata is observable failure.

## Design conclusions for the empty house

### Do not build a universal registry yet
The earlier temptation to build a "tiny Block Registry" is corrected by existing OTHRYS doctrine. At this stage V2 may keep a **readable index** of known/admitted Blocks, but the index does not resolve versions, grant authority or determine runtime truth.

### Contract and artifact identity are separate
A stable Contract describes compatibility. A digest identifies exact implementation content. Both are required: semantic compatibility without content identity permits substitution; content identity without a declared Contract provides no composition meaning.

### Maturity and health are separate axes
The recovered OTHRYS maturity ladder records accumulated evidence over the Block's life. Current health says whether a particular environment can run it now. Do not demote historical evidence because a dependency is temporarily down; do not call a GOLDEN Block healthy without a current health check.

### Admission and promotion are separate
Admission answers: **may this exact candidate be mounted here now?**
Promotion answers: **has this Block accumulated enough evidence to earn a higher reusable maturity?**
A Block can be admitted experimentally without being promoted to REUSABLE/CERTIFIED, if the Oros policy explicitly permits that experiment.

### Block #2 is the architectural proof
One Block proves almost nothing about composition because the house can accidentally be shaped around it. The second Block is therefore used to test repeatability, declared communication, removal and replacement before expanding the runtime.

## Practical foundation sequence

`RECOVER CANON -> DECLARE CONTRACT -> BIND VERSION+DIGEST -> RECORD PROVENANCE -> ADMIT -> MOUNT -> VERIFY -> UNMOUNT -> FAIL LOUDLY -> REPLACE/REBUILD -> FREEZE`

Only after this is boringly repeatable should V2 consider a resolver, richer registry, marketplace, automatic promotion or broad plugin host.