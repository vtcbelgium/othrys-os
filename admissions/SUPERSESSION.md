# Block #1 admission supersession ledger

**One Capability Block. Two admission records. One active.**

This file exists because FOUNDATION_LAWS §20 forbids mutating an admitted record and
V2-001D §1 forbids modifying the `0.1.0` file — so the status of `0.1.0` cannot be
written *inside* `0.1.0`. It is written here instead.

This is a ledger, not a registry, resolver or version manager. It resolves nothing,
executes nothing, and covers no Block but this one.

| Version | Digest | Status | Admitted by | Record |
|---|---|---|---|---|
| `0.1.0` | `32b34548…d363d7b` | **HISTORICAL / SUPERSEDED** | V2-001A.R | `admissions/block.media.image-prep@0.1.0.json` |
| `0.1.1` | `48afa7ac…7b3b55bd` | **ACTIVE_ADMITTED** | V2-001D | `admissions/block.media.image-prep@0.1.1.json` |

`capability_blocks_admitted = 1`. Two records describe two specimens of the **same**
Block, not two Blocks. **Block #2 remains FORBIDDEN.**

## What SUPERSEDED does and does not mean

`0.1.0` remains **valid historical evidence**. Its record is byte-unmodified, its
receipts are unrewritten, and it stays fully reconstructible from `othrys-blocks`
commit `09efbc7088c320a8bb0ae6de0566a764e502115c`, which no mission has touched. Its
`RUNTIME_PROVEN` result from V2-001B.T remains true *of `0.1.0`*.

Superseded means: **not the specimen to mount.** `0.1.1` is.

## Why

`0.1.0` carried two defects, both proven on LEGION by the V2 aggressive QA suite and
recorded in `qa/block.media.image-prep/AGGRESSIVE_TEST_EVIDENCE.md`:

1. parameterized SVG MIME (`image/svg+xml;charset=utf-8`) bypassed rejection;
2. an extreme aspect downscale (`4096x1` @ `longEdge 1200`) rounded a raster dimension
   to zero and surfaced `encode_failed`.

Repaired by V2-001C as a **PATCH** (Book of Blocks §9 — compatible correction, no
declared contract change). Promoted by V2-001D on host runtime proof:
node **10/10**, canonical browser **29/29**, aggressive **18/18**, zero failures.

The defect history is deliberately preserved. A Block that was never wrong is a Block
nobody tested hard enough.

## Rollback

Re-admission of `0.1.0` would require a new admission mission — a different digest is
a different specimen and there is no silent path back. Nothing here deletes, rewrites
or weakens the `0.1.0` evidence needed to do it.

## Known technical debt

`DIGEST_CANONICALIZATION_PENDING` — the admitted digest procedure hashes **working-tree
bytes**, so both digests reproduce only on a checkout that materialises line endings
identically (CRLF on Windows). Applies to `0.1.0` and `0.1.1` alike. Deliberately not
solved in V2-001D.

`qa/block.media.image-prep/digest.test.mjs` pins the live tree to the `0.1.0`
admission. Two of its three tests now fail **by design** — that is the tamper detector
correctly reporting that the specimen moved. It was **not** edited. The active proof is
the separate `digest-0.1.1.test.mjs`; both histories stand.
