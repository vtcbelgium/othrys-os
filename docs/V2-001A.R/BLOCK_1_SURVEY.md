# V2-001A.R — candidate survey (compact)

Base `75098688a4ab72ec29ac352862a7afa7dd85206f`, gate PASS.
Stock inspected: `C:\Users\othry\Projects\othrys-blocks\blocks` — ten directories.

| Candidate | Passport | Version | Maturity claim | Verdict |
|---|---|---|---|---|
| `ai/provider-router` | **no `BLOCK.md`** | pkg 0.1.0 | none recorded | rejected |
| `analytics/event-log` | **no `BLOCK.md`** | pkg 0.1.0 | none recorded | rejected |
| `analytics/visit-tracking` | **no `BLOCK.md`** | pkg 0.1.0 | none recorded | rejected |
| `auth/supabase-session` | **no `BLOCK.md`** | pkg 0.1.0 | none recorded | rejected |
| `knowledge/grounded-retrieval` | **no `BLOCK.md`** | pkg 0.1.0 | none recorded | rejected |
| `knowledge/source-extraction` | **no `BLOCK.md`** | pkg 0.1.0 | none recorded | rejected |
| `learning/gap-engine` | **no `BLOCK.md`** | pkg 0.1.0 | none recorded | rejected |
| `learning/mastery-ledger` | **no `BLOCK.md`** | pkg 0.1.0 | none recorded | rejected |
| `monetization/affiliate-offer` | `BLOCK.md` | 0.1.0 | REUSABLE (BLOCK-002-TRANSPLANT-001) | runner-up |
| `media/image-prep` | `BLOCK.md` | 0.1.0 | REUSABLE (VTC-BLOCK-TRANSPLANT-001) | **selected** |

**Why the eight were rejected in one line each:** none carries a `BLOCK.md`
Passport, so none records a canonical `block_id`, a maturity, provenance or
consumer evidence. Book of Blocks §16 requires stable ID + exact version +
provenance digest + contract/evidence identity for a complete Block reference,
and FOUNDATION_LAWS §4/§5/§7 make identity, provenance and honest maturity
admission prerequisites. A package version alone is not an identity. They remain
**available legacy stock**, not admissible today, and nothing here promotes or
demotes them.

**Runner-up, and why not it.** `block.monetization.affiliate-offer` is a genuine
peer: same version, same Passport discipline, REUSABLE with a named transplant
and a second consumer in `oros/`. It lost on risk, not quality. Its capability is
network-facing (HTTPS merchant offers, visible disclosure, fail-closed
requirements), which Book of Blocks §17 calls a poor first-block candidate —
"high-risk capabilities require deeper review". `block.media.image-prep` is
local-only: no network, no secrets, no permissions, no persisted state. For the
first admission the point is to prove the admission machinery, not to take on the
largest trust surface.

**Selected: `block.media.image-prep` @ `0.1.0`.** Evidence, not the prompt's hint:

- Passport present with id, version, visibility, maturity, contract, effects and limitations.
- Provenance **independently verified** against the origin repository — commit `032a47ca` and blob `b3f9bbe6` both exist in `vtc-platform`, and `git rev-parse 032a47ca:src/whiteSquare.js` returns exactly that blob.
- Second consumer **verified from source**: `oros-image-prep-transplant` depends on `file:../../othrys-blocks/blocks/media/image-prep` and ships a `same-source.mjs` test — same canonical source, not a copy.
- Its own node contract suite runs offline here and passes 4/4, including two negative controls.
- Zero runtime dependencies; the only dependency is a browser test harness.
- Independently referenced by the accepted `oros-zero` blueprint at `maturity_at_resolution: REUSABLE`.

Nothing was copied, moved, renamed, edited or repaired. The digest is identical
before and after the test run.
