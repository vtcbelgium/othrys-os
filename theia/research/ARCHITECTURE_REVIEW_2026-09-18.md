# THEIA ARCHITECTURE REVIEW — 2026-09-18

**Scope:** second-pass review of the Theia extraction from Hyperion after the initial doctrine was written.

**Verdict:** the separation is sound, but the first draft had several boundary and policy weaknesses. This review records what was found and how the branch was refined.

---

## 1. ACTIVATION STATUS — FIXED

### Finding

The first pass called Theia `ACTIVE` in the Book of Mythology while deliberately leaving her out of the current `books/BOOK_REGISTRY.json`.

That could falsely imply runtime/admission proof.

### Refinement

Added mythology status:

`ACTIVE_STRATEGIC`

Meaning:
- the Titan/domain and doctrine are canonical;
- the architectural boundary is real;
- runtime implementation/admission is incomplete.

Theia remains intentionally outside the runtime Book Registry until implementation/admission evidence exists.

### Law

> **DOCTRINE MAY DEFINE A BOUNDARY. IT MAY NOT PRETEND TO BE IMPLEMENTATION PROOF.**

---

## 2. MYTHOLOGICAL SIGHT VS SOFTWARE VISION — FIXED

### Finding

Theia's association with sight creates an attractive but dangerous scope creep:
- computer vision;
- screen observation;
- visual verification;
- operational observability
could all be pulled under Theia merely because of the name.

That would collide with Visual Control and possible future Argus.

### Refinement

Theia now owns **visual/audiovisual media production**, not all software perception.

Visual Control retains observation/comparison.
Future Argus retains observability if admitted.

### Law

> **MYTHOLOGICAL SIGHT DOES NOT GRANT SOFTWARE OWNERSHIP OF EVERYTHING THAT CAN SEE.**

---

## 3. HYPERION EXTRACTION WAS TOO AGGRESSIVE — FIXED

### Finding

Moving the entire old Media Factory chapter risked moving economic responsibilities out of Hyperion:
- opportunity scoring;
- economic signal interpretation;
- monetization surfaces;
- portfolio decisions.

Those are not production concerns.

### Refinement

Restored to Hyperion:
- media opportunity score;
- economic signal ladder;
- monetization surfaces;
- portfolio/scale interpretation;
- sibling compounding loop.

Theia returns media evidence.
Hyperion interprets economics.

---

## 4. SIBLING INTERFACE NEEDED A REAL SEAM — FIXED

### Finding

"Media Opportunity Packet" and "Media Evidence Packet" were named, but not sufficiently specified for future separation.

### Refinement

Added:
- `theia/THEIA_HYPERION_CONTRACT.md`

It defines:
- Media Opportunity Packet;
- Media Production Contract;
- Media Evidence Packet;
- Hyperion Media Decision Packet;
- property portability contract;
- separation test;
- failure and versioning behavior.

This is one of the most important changes for future standalone Theia.

---

## 5. OPSIS COULD HAVE LEAKED EXTERNAL AUTHORITY — FIXED

### Finding

The initial Opsis state graph flowed from package to publish too naturally.

A domain orchestrator must not infer external side-effect authority.

### Refinement

Added:
- audience classification preflight;
- policy preflight;
- `EXTERNAL_SIDE_EFFECT_AUTHORIZED` state;
- explicit law that Opsis stops at `PACKAGED` unless publication authority exists.

---

## 6. CLIPPING PERMISSION ≠ PLATFORM MONETIZATION — FIXED

### Finding

The initial clipping doctrine correctly prioritized permission/licensing, but that is not enough for YouTube monetization.

YouTube's current reused-content policy says minimally transformed reuse can fail monetization even when the uploader has permission from the original creator.

### Refinement

Clipping now separates four gates:
1. legal/licensed right to publish;
2. platform permission to upload;
3. originality/reused-content eligibility for the intended monetization program;
4. campaign/client permission to monetize/reuse.

### Law

> **PERMISSION IS NOT A YPP PASS.**

---

## 7. CHILD-DIRECTED CONTENT CHANGES THE PRODUCT — FIXED

### Finding

Mipi was described as primary-school/family oriented but the first draft did not make audience classification a hard pre-publication gate.

On YouTube, made-for-kids classification disables/restricts important features including personalized ads, comments, notifications, memberships and several routing/commerce surfaces.

### Refinement

Added Theia audience states:
- `CHILD_DIRECTED`;
- `GENERAL_AUDIENCE_FAMILY_SAFE`;
- `MIXED/UNCERTAIN_REVIEW_REQUIRED`.

Mipi remains unresolved until the real creative positioning is chosen.

Economics must adapt to classification; classification must never adapt to desired economics.

---

## 8. EU AI TRANSPARENCY IS LIVE — FIXED

### Finding

Theia is being designed in September 2026. EU AI Act Article 50 transparency rules are already applicable from 2 August 2026.

The first draft treated AI disclosure mainly as a platform concern.

### Refinement

Added:
- Policy/Disclosure Adapter faculty;
- AI transparency state in the Media Production Contract;
- EU Article 50 review requirement;
- dated policy evidence in the research dossier.

The Book does not hard-code every legal interpretation; it requires dated jurisdiction/provider evidence.

---

## 9. IP CHAIN OF TITLE NEEDED TO BE STRONGER — FIXED

### Finding

A media/IP factory can create commercially valuable characters while accidentally weakening ownership clarity if the "asset" is mostly raw model output.

### Refinement

Added human-authorship/chain-of-title doctrine:
- original human-authored/approved property bible;
- human editorial/story decisions;
- art direction;
- selection/arrangement/modification;
- provider terms snapshots;
- contractor assignments;
- generated-asset lineage.

The goal is not "avoid AI".
The goal is **human-authored IP with AI-assisted production**.

---

## 10. MIPI NAME IS NOT GLOBALLY BLANK — GATED, NOT REJECTED

### Finding

Preliminary search found:
- MIPI Alliance trademark registrations in technical fields;
- a 2018 pet-story publication using "Mipi" for a puppy.

This does not establish a conflicting entertainment trademark or require a rename.

### Refinement

Mipi remains the canonical internal name.

Before public brand lock, merchandise, licensing or filing:
- EU/Benelux/international trademark search;
- entertainment/publishing/toy/software class review;
- channel/book/app/domain/social collision review.

### Law

> **MIPI'S NAME IS CANON; COMMERCIAL CLEARANCE IS A GATE.**

---

## 11. MIPI'S FIRST SEEDS WERE TOO GENERIC — FIXED

### Finding

The original 20 episode list was a good factual inventory but could easily become:
"generic explainer + cat mascot."

That would weaken the IP.

### Refinement

The first pilot set is now character-first:
- Mipi wants the warm manhole cover as a bed -> why are covers round?
- Mipi takes the lazy shortcut -> why do old streets twist?
- popcorn wakes him -> why does it pop?
- migrating birds offend his sense of energy conservation -> why migrate?
- he pushes a door at the hinge to avoid walking -> why is the handle far away?
- he hunts the "other cat" in an echo cave -> how does echo work?

### Law

> **MIPI DOES NOT VISIT A FACT. MIPI STUMBLES INTO A PROBLEM THAT REVEALS THE FACT.**

---

## 12. PRACTICAL DAD PILOT HAD TOO MUCH SAFETY SURFACE — FIXED

### Finding

The content inventory included jump-starting, electrical and other tasks too early.

Theia should validate instructional sequencing/animation on low-consequence tasks before teaching high-consequence physical procedures.

### Refinement

Created:
- Tier A: safe first pilots;
- Tier B: after QA matures;
- Tier C: principles + authoritative manual/professional routing.

First five recommended tests:
- tie;
- button;
- screwdriver bit;
- tape measure;
- spirit level.

---

## 13. THEIA ARMS NEEDED COMPOSITION — FIXED

### Finding

Clipping and Explainer could become parallel silos.

### Refinement

Explicit cross-arm loops added.

Example:

    podcast/interview
      -> clipping finds strong moment
      -> explainer independently explains concept
      -> two different artifacts, two different provenance/rights lineages

Mipi:

    Story Forge
      -> Explainer faculties
      -> Helios primary episode
      -> Clipping/Repurposing
      -> Eos-native derivative

---

## 14. HELIOS / EOS / SELENE BOUNDARIES — REFINED

### Helios

Not defined by video length.
He is the **full primary expression**.

### Eos

Discovery/first-contact role.
Can be clips or original short-native media.

### Selene

Audience-facing continuity/cycle/return.
Does **not** become storage, archive authority or Mnemosyne.

---

## 15. VOLATILE FACTS WERE TOO CLOSE TO CANON — FIXED

### Finding

The Book of Theia contained a "current research basis" section with vendor/platform facts.

Those will age.

### Refinement

The canonical Book now points to dated policy/research dossiers.
Vendor/platform/legal specifics stay in dated evidence.

### Law

> **POLICY MEMORY NEEDS A DATE. ARCHITECTURE NEEDS A BOUNDARY.**

---

## 16. REMAINING OPEN QUESTIONS

These are intentionally not decided by this refactor:

1. Is the cat property ultimately child-directed or genuinely general-audience family animation?
2. What is the cat property's final public character/series name?
3. What is the cat property's final visual design?
4. Is the cat narrator-led, voiced, or hybrid?
5. Does the cat need a companion/foil character?
6. Does any long arc deserve canon?
7. What SaaS should be used for the first animation proof?
8. When does programmatic rendering beat SaaS?
9. What is the first authorized clipping dataset/source?
10. Does "Practical Cartoon Dad" need a permanent property, or is it just the first Explainer test?
11. Which Theia Blocks are worth admitting after pilots?
12. Does Opsis earn runtime implementation at all, or can existing Mission/Work + composition satisfy the need initially?
13. At what evidence threshold does Theia become a standalone service/Star?

These are experiment questions, not missing architecture.

---

## 17. CURRENT ARCHITECTURAL SHAPE

    PROMETHEUS
       discovery/evidence
           |
           v
    MNEMOSYNE / ATLAS
       memory/context
           |
           v
    HYPERION
       economic bet
           |
       opportunity packet
           v
    THEIA
       media domain
           |
          OPSIS
      domain orchestration
           |
     +-----+------+------+
     |            |      |
    CLIP      EXPLAIN   STORY/IP
     |            |      |
     +------ shared faculties
                   |
              QA / RIGHTS /
          AUDIENCE / DISCLOSURE
                   |
              AUTHORIZED
               PUBLISH
                   |
               REALITY
                   |
          media evidence packet
                   |
               HYPERION

Helios, Eos and Selene remain media-role foundations, not extra runtime gods.

---

## 18. HYPERION SUB-ARMS STILL HAD HIDDEN MEDIA OWNERSHIP — FIXED

### Finding

The top-level Hyperion split was correct, but several specialist Arm books still carried old assumptions:
- Distributor owned native media packaging;
- Laboratory's media tests did not state who produces variants;
- Oracle fed Story Forge directly;
- Magnifier could read as executing media localization;
- Vault duplicated character bibles and rights ledgers.

That would slowly reconstruct Media Factory inside Hyperion through side doors.

### Refinement

- **Distributor** now owns distribution strategy/economics; Theia packages and publishes media.
- **Laboratory** owns experiment contracts; Theia produces media variants under its gates.
- **Oracle** interprets media evidence economically and returns conclusions through the sibling contract.
- **Magnifier** chooses where economic scale deserves testing; Theia executes media/IP localization/expansion.
- **Vault** preserves transferable commercial asset packets and links to Theia's canonical property/provenance records instead of duplicating them.

> **A CLEAN TOP-LEVEL BOUNDARY IS USELESS IF SUBSYSTEMS QUIETLY RECREATE THE OLD BLOB.**

---

## 19. LOCALIZATION INVESTMENT BOUNDARY — FIXED

### Finding

Theia's localization chapter still mixed two questions:
- should OTHRYS invest in a language/market?
- how should the media be localized well?

### Refinement

Hyperion/Magnifier owns the market/investment choice.
Theia owns localization feasibility, adaptation, QA, rights/disclosure differences and derivative production.

> **HYPERION CHOOSES THE MARKET. THEIA MAKES THE MEDIA NATIVE TO IT.**

---

## 20. THEIA NEEDED A CANONICAL LAYER MODEL — FIXED

### Finding

The design was coherent conceptually but still mixed several abstraction levels in the main Book:
- Titan/domain doctrine;
- Opsis orchestration;
- Arms;
- reusable faculties;
- properties;
- children;
- providers.

Without a canonical layer model, implementation could turn those into peer services or duplicate responsibility.

### Refinement

Created `theia/ARCHITECTURE.md` with the canonical topology:

    THEIA DOMAIN
      -> OPSIS CONTROL PLANE
          -> ARMS
          -> SHARED FACULTIES
              -> ADAPTERS
                  -> ARTIFACTS / EVIDENCE

Cross-cutting:
- properties = portable identity/canon;
- Helios/Eos/Selene = expression roles;
- rights/policy/QA/audience = gates;
- Hyperion contract = economic seam.

> **DO NOT ADD A COMPONENT WHEN A CONTRACT OR LABEL WILL DO.**

---

## 21. OPSIS WAS TOO LINEAR — FIXED

### Finding

The original Opsis state model implied one artifact moving through one long sequence.

Real media work fans out:
- one source can create several derivatives;
- one episode can create several Eos artifacts;
- localization can branch;
- one failed derivative should not invalidate the successful primary artifact.

### Refinement

Opsis is now modelled as a **production-graph control plane** with separate:
- run;
- graph;
- artifact lifecycle;
- independent gate vector.

Rights, audience, policy, disclosure, evidence, budget and authority are gates, not fake sequential milestones.

> **ONE RUN MAY HAVE MANY ARTIFACTS. EVERY ARTIFACT KEEPS ITS OWN EVIDENCE.**

---

## 22. SIBLING CONTRACT WAS SINGLE-ARTIFACT — FIXED

### Finding

The Hyperion↔Theia production contract still contained one singular `artifact`, contradicting the new graph model.

### Refinement

The production and evidence schemas moved to v2:
- `requested_artifacts[]`;
- contract-local artifact keys;
- explicit derivative lineage;
- optional Helios/Eos/Selene expression roles;
- artifact-level receipts and telemetry;
- run-level aggregate evidence.

Hyperion receives the aggregate without losing distinctions between artifacts.

---

## 23. CHILDREN WERE TOO EASY TO MISREAD AS PIPELINES — FIXED

### Finding

Helios, Eos and Selene were correctly bounded but still visually resembled three parallel format systems.

That is inaccurate because Selene is orthogonal to Helios/Eos.

### Refinement

The children are now explicitly **composable audience-facing expression roles**:
- Helios = full/canonical expression;
- Eos = first-contact/discovery;
- Selene = continuity/return.

A flagship recurring episode may be Helios + Selene.
A recurring short may be Eos + Selene.

Property-level duration targets are pilot hypotheses, not definitions of the children.

---

## 24. MIPI NAME STATE WAS TOO STRONG — FIXED

### Finding

The character concept was useful, but prior wording made `Mipi` sound like a locked public brand even while name collision research remained active.

### Refinement

`Mipi` is now only the stable **internal property codename/ID**.

The character concept remains canon:
- curious;
- lazy;
- warm;
- adventure/learning engine.

The public character/property name is deliberately unresolved and the naming search is parked until the property has enough evidence to deserve clearance effort.

> **THE CHARACTER IS CANON. THE PUBLIC NAME IS NOT.**

---

## 25. REVIEW CONCLUSION

The first refactor had the right central idea:

> **HYPERION OWNS THE ECONOMIC BET. THEIA OWNS THE MEDIA MACHINE.**

After refinement, the seam is substantially stronger:
- less scope collision;
- safer external side effects;
- more accurate clipping economics;
- current child-content constraints;
- current EU AI-transparency reality;
- stronger IP chain of title;
- stronger character concept without premature public-name lock;
- safer practical-dad pilot;
- cleaner Hyperion sub-arm seams;
- cleaner future standalone contract.

The next useful evidence should come from **pilots**, not more ontology.

No runtime implementation is authorized by this review.
