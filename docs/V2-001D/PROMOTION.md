# V2-001D — Block #1 promoted to `0.1.1`

Promotion mission. No Block code, no new Block tests, no Oros, no mount, no Block #2,
no registry, no resolver, no architecture. Records only.

## Verdict

| | |
|---|---|
| Old active | `0.1.0` — digest `32b34548…d363d7b` — **HISTORICAL / SUPERSEDED** |
| New active | `0.1.1` — digest `48afa7ac…7b3b55bd` — **ACTIVE_ADMITTED** |
| Runtime | `RUNTIME_PROVEN` on LEGION |
| Blocks admitted | **1** (two records, one Block, one active specimen) |
| Block #2 | **FORBIDDEN** |

## §2 — digest verified before anything else

Recomputed by the admitted `sha256-of-manifest` procedure over the live 14-file tree:

```
48afa7ac082db75b40278bf71ff552f6ff0ca4e1429006f759dec4c37b3b55bd
```

Exact match to the expected candidate digest. `package.json` and `src/config.js` both
declare `0.1.1`, and every file's content matches the committed repair `b4171d3`
(CRLF-normalised). The specimen being promoted is the specimen V2-001C produced.

## §3 — runtime proof recorded

Supplied by the operator from the LEGION Windows host. Evidence class
**`HOST_SUPPLIED_TRUSTED`** — the delegate has no Windows shell and **did not witness
these runs**. Under Book of GPT law 29 the host is the competent authority for host
runtime; this record is exactly as strong as that attestation and no stronger.

| Suite | Result |
|---|---|
| Node (`npm.cmd run test:node`) | **10 / 10 PASS** |
| Canonical browser (`npm.cmd run test:browser`) | **29 / 29 PASS** |
| Aggressive (`node_modules\.othrys-aggressive`) | **18 / 18 PASS** |

Runtime: Node `24.18.1`, Playwright `1.62.1`, Chromium `151.0.7922.34`. Zero failures.

The aggressive suite scored `16 / 18` against `0.1.0` — the two failures were the
defect proofs. They now pass. That is the cleanest possible confirmation that this
promotion fixed what it claimed to fix.

### What the delegate verified independently

Nothing was re-run except the digest check and the Node suite. What could be checked
from here, was:

- **Digest** — exact match (above).
- **Node suite** — re-run in the delegate's Linux VM: **10 tests, 10 pass, 0 fail**,
  agreeing with the host.
- **Cardinality** — `playwright test --list` enumerates exactly **29** canonical tests
  and exactly **18** aggressive tests against this specimen. All three reported totals
  match the real suite sizes, so the numbers came from this Block and not another tree.
- **Harness identity** — the staged copy at
  `node_modules/.othrys-aggressive/{adversarial.spec.js,playwright.config.js}` is
  byte-identical (CRLF-normalised) to the V2 sources in `qa/block.media.image-prep/`.
  The aggressive run used the V2 suite, unmodified.

None of this proves the browser runs happened. Together with the attestation it closes
off the ways the numbers could have been wrong.

## §4 — new admission record

`admissions/block.media.image-prep@0.1.1.json` — a **separate** file. Binds identity,
version, digest and full 14-entry manifest, canonical source (`othrys-blocks`
`b4171d3`, branch `mission/block-003-extract-001`), provenance **continuity** (same
origin lineage `vtc-platform 032a47ca` / blob `b3f9bbe6`, plus the V2-001C repair
lineage and the exact implementation delta), maturity, contract, runtime, dependencies,
network, secrets, permissions, side effects, failure behaviour, test evidence, repair
evidence and reconstruction data.

Two things it records that a naive promotion would have skipped:

- **Maturity stays `REUSABLE`.** A PATCH repair is not a maturity promotion (Book of
  Blocks §7 — maturity is evidence, not branding). Not CERTIFIED, not GOLDEN.
- **The contract is marked unchanged from `0.1.0`.** Both repairs make the
  implementation *conform* to the declared contract rather than alter it. That is
  precisely what makes the bump a PATCH, and it is written into the record so nobody
  later mistakes a bug fix for a contract revision.

`admissions/block.media.image-prep@0.1.0.json` is **byte-unmodified**.

## §5 — supersession

Recorded in `admissions/SUPERSESSION.md`, because §1 forbids modifying the `0.1.0`
record and the status of `0.1.0` therefore cannot be written inside it. That ledger
resolves nothing and executes nothing — it is two rows and an explanation.

`SUPERSEDED` means **not the specimen to mount**. It does not mean wrong, deleted or
downgraded: `0.1.0`'s record, receipts and `RUNTIME_PROVEN` result from V2-001B.T all
stand, and it remains fully reconstructible from `othrys-blocks` `09efbc70`, which no
mission has touched. Rollback would need a new admission mission — a different digest
is a different specimen.

## §7 — digest QA, both histories kept

`qa/block.media.image-prep/digest.test.mjs` was **not edited**. It pins the live tree
to the `0.1.0` admission, so two of its three tests now fail *by design* — the tamper
detector correctly reporting that the specimen moved. Editing it to match new behaviour
is how a suite stops being evidence.

The active proof is the new, separate `qa/block.media.image-prep/digest-0.1.1.test.mjs`
(5 tests): the live tree matches the `0.1.1` manifest and digest; the digest is stable
across ten reads; the live tree is provably **no longer** `0.1.0` while `0.1.0`'s record
is still intact; exactly six of fourteen files differ from the `0.1.0` manifest; and
manifest tampering is still detected. Like its predecessor it hardcodes `C:\Users\…`
paths, so it is a Windows-host test by construction and was not run here.

### `DIGEST_CANONICALIZATION_PENDING`

The admitted procedure hashes **working-tree bytes**, so both digests reproduce only on
a checkout that materialises line endings identically (CRLF on Windows). This applies
to `0.1.0` exactly as much as to `0.1.1` — it is not a defect introduced by the repair.
Recorded as technical debt in `GPT_STATE.json`, the `0.1.1` admission record and
`SUPERSESSION.md`. **Deliberately not solved in this mission.**

## §8 — no drift

Created or modified: nothing outside V2 records. Specifically **not** touched —
`oros/oros-zero` and any Oros; Block #2 (still FORBIDDEN, foundation question 5 still
open); registry, resolver, orchestrator, scheduler (none exist, none created); Control
Feedback (`git diff HEAD -- blocks/` empty); any other Block in `othrys-blocks`; the
`0.1.0` admission record; `qa/AGGRESSIVE_TEST_EVIDENCE.md`, `adversarial.spec.js`,
`digest.test.mjs`.

**No legacy mutation.** `othrys-blocks` HEAD is still `b4171d3`, its working tree
unchanged, digest identical at mission start and end. This mission wrote nothing to the
legacy repository — it only read it.

## Standing blocker, worth repeating

`othrys-blocks` still has **no configured remote**. The admitted specimen and the
repair commit `b4171d3` cannot be pushed by anyone. V2 now records an ACTIVE admission
whose canonical source exists on exactly one machine.
