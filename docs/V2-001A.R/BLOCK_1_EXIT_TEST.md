# V2-001A.R — Block #1 exit test

Every answer below is readable from repository files with no chat, GPT or Claude
memory. The single machine-readable source is
[`admissions/block.media.image-prep@0.1.0.json`](../../admissions/block.media.image-prep@0.1.0.json).

| Question | Answer | Where |
|---|---|---|
| WHAT is canonical Block #1? | `block.media.image-prep` | admission `block_id` |
| WHERE is its canonical implementation? | `othrys-blocks/blocks/media/image-prep` at repo commit `09efbc70` (`C:\Users\othry\Projects\othrys-blocks`) | admission `source` |
| WHAT exact version was admitted? | `0.1.0` | admission `block_version` |
| WHAT exact digest identifies it? | `32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b` | admission `package_tree_digest.value` |
| WHAT capability does it provide? | Prepare a user-supplied raster image for consistent product/catalog display: optional long-edge downscale, JPEG normalisation, optional square compose | admission `capability` |
| WHAT is its public contract? | ESM `prepareImage(source, options) -> Promise<PrepareResult>` | admission `contract`, and the Block's own `BLOCK.md` |
| WHAT does it provide? | `prepare.downscale`, `prepare.normalize.jpeg`, `prepare.square` | admission `contract.provides` |
| WHAT does it require? | Browser Canvas 2D, `Image`, `FileReader`, `canvas.toBlob`, `getImageData`; host supplies a `Blob`/`File` | admission `contract.requires` |
| WHAT Ports exist? | **None as runtime Ports.** `media.image.prepared@1` is a documentation name only, by the Block's own statement. No Port was invented | admission `ports` |
| WHAT runtime/dependencies? | Chromium with real Canvas 2D; zero runtime dependencies, one dev dependency (`@playwright/test`) | admission `runtime`, `dependencies` |
| DOES it use the network? | No — `NONE` on the core path | admission `network` |
| DOES it require secrets? | No — `NONE`, and no permissions | admission `secrets`, `permissions` |
| WHAT side effects? | None: no filesystem, process, network or persisted state. Return-value metadata only | admission `side_effects` |
| HOW does it fail? | Typed `ImagePrepError`: `decode_failed`, `encode_failed`, `unsupported_type`, `canvas_unavailable`. Errors are raised, never swallowed | admission `failure_behaviour` |
| WHAT tests prove it? | Its own node contract suite, run 2026-08-24: 4 passed, 0 failed, two of them negative controls. The Playwright Chromium suite was **NOT_OBSERVED** — not installed, no egress — and is therefore not claimed | admission `test_evidence` |
| WHAT provenance proves its origin? | `vtc-platform` commit `032a47ca`, file `src/whiteSquare.js`, blob `b3f9bbe6` — all three verified to exist in the origin repository | admission `provenance` |
| WHAT justifies its maturity? | `REUSABLE` under Book of Blocks §7: the same canonical source consumed by the origin and by an independent second Oros with no fork or copy. Corroborated here by the consumer's `file:` dependency and its `same-source.mjs` test; the transplant suite itself was not re-run by V2 | admission `consumer_evidence` |
| HOW is the exact specimen reconstructed? | Check out `othrys-blocks` at `09efbc70`, take `blocks/media/image-prep`, recompute the digest with the documented procedure, compare against `package_tree_digest` and the 14-entry manifest | admission `reconstruction` |
| WHAT if it is unavailable or the digest changes? | Block #1 is **not present**. V2 fails explicitly. No fallback, no substitute version, no repair, no silent re-admission — a different digest is a different specimen and needs a new admission mission | admission `reconstruction.if_unavailable` |

## Tamper proof

The admission is binding, not decorative. Appending a single newline to
`src/config.js` in a throwaway copy changes the digest from
`32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b` to
`d8bdf25fcfd9d81142c820f880f6ce7938ffdcf3f460ed6c46dc7785b196b8e1`.
The canonical specimen was verified unchanged afterwards. A wrong `block_id` or
`block_version` fails on direct comparison with the recorded values; a wrong body
fails on the digest and on the per-file manifest.

The digest was computed twice by independent methods — `sha256sum` with
`LC_ALL=C` ordering, and Python `hashlib` — and both returned the same value.

## What this admission is not

It is not composition. V2 is control plane, not an Oros (ADR-0050), so
FOUNDATION_LAWS' foundation exit test question "Where is it mounted in the Oros?"
still has no answer. **Block #2 therefore remains FORBIDDEN**, unchanged by this
mission and not by invention: admission is not mounting, and the foundation exit
test is not met.
