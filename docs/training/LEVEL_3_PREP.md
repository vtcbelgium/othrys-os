# OTHRYS Training Mode — Level 3 Preparation

**Level:** 3 — Small Applications  
**State:** PREPARED / LOCKED  
**Mission:** V2-011K  
**Activation:** explicit operator transition only

## Double-check gate

Level 2 remains closed and verified: 24/24 jobs COMPLETE, 181/181 Level 2 source tests PASS, 181/181 Level 2 candidate tests PASS, combined Level 1+2 source proof 486/486 PASS, combined candidate proof 486/486 PASS, and runtime proof 346/346 PASS.

A receipt audit found four historical Level 2 jobs without canonical `LEARNING_RECEIPT.json` files: L2-008 through L2-011. Their raw worker evidence, manifest lessons and live Talos proofs were inspected; canonical learning receipts were added without rewriting the original worker evidence. Level 2 now has 24/24 job learning receipts.

## Level 3 purpose

Level 3 moves from isolated durable primitives to complete, single-purpose applications. The curriculum deliberately stays below Level 4: no external auth, database, email, remote API or paid service dependency is required.

The central law changes from **build a primitive** to **compose proven primitives into a usable surface**. Stock-first and composition-first are mandatory. A new implementation is justified only when the existing Block/Blueprint stock cannot satisfy the declared application contract.

## Verification law

Every job must have deterministic core tests plus application-visible proof. Where a browser surface exists, Talos must verify rendering/interaction with the available browser harness, including a bounded responsive check and keyboard/accessibility smoke. Extensions must prove minimal permissions and stay MV3. File tools may touch only user-selected/local training paths.

No worker `ok:true` can satisfy the application gate by itself. Talos independently verifies behavior, state round-trip, failure preservation and visible interaction. Failed repairs remain learning evidence. Operator recovery, if eventually required, remains capability debt.

## Curriculum shape

The prepared curriculum contains 24 jobs. It begins with static/responsive web surfaces, then binds Level 2 state Blocks into complete local applications, then exercises browser-extension and offline/local-file surfaces, and ends with multi-view composition, accessibility/polish and a local-first capstone.

## Prepared sequence

L3-001–004: static information page, responsive landing page, validated form app, searchable table app.  
L3-005–016: settings, todo, habit, time, expense, notes, multi-list, import/export, backup/restore, activity, preferences and composed desk-tool applications.  
L3-017–020: MV3 popup, options surface, bounded content-script tool and offline application shell.  
L3-021–024: local-file utility, multi-view composition, accessibility/polish pass and local-first capstone.

The machine-readable contracts and quality gates are in `docs/training/LEVEL_3_PREP.json`.

## Activation checklist

1. Re-read `LEVEL_2_MILESTONE.json` and verify status COMPLETE.
2. Require 24/24 Level 2 learning receipts and no queued Level 2 job.
3. Re-run the graduation/control gate before activation.
4. Confirm Level 3 is still LOCKED and `currentLevel` remains 2 before transition.
5. On explicit activation only, materialize the prepared jobs into the canonical manifest, set Level 3 ACTIVE/currentLevel 3, and keep Level 4 LOCKED.
6. Re-run `training_mode` tests immediately after the transition before any L3-001 builder execution.

Preparation itself grants no authority and does not start Level 3.