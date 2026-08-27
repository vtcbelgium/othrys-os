import test from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { FactoryRejectedError, makeEngineeringCommand, parseOrosBrief, resolveExactBlocks } from "./plan.ts";

const root = resolve(import.meta.dirname, "../..");
const good = {
  orosId: "oros-find-item-v2",
  name: "Find This Item",
  productType: "node-cli",
  objective: "Turn a user search query into a truthful sponsored marketplace offer.",
  exactBlocks: [{ blockId: "block.monetization.affiliate-offer", blockVersion: "0.1.0", admissionPath: "admissions/block.monetization.affiliate-offer@0.1.0.json" }],
};

test("strict brief freezes exact refs", () => {
  const brief = parseOrosBrief(good);
  assert.equal(brief.exactBlocks[0].blockId, "block.monetization.affiliate-offer");
  assert.ok(Object.isFrozen(brief));
  assert.ok(Object.isFrozen(brief.exactBlocks));
});

test("extra brief field is refused", () => {
  assert.throws(() => parseOrosBrief({ ...good, resolver: "auto" }), (e) => e instanceof FactoryRejectedError && e.code === "EXTRA_BRIEF_FIELD");
});

test("eligible exact Block resolves", () => {
  const blocks = resolveExactBlocks(root, parseOrosBrief(good));
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].maturity, "REUSABLE");
  assert.equal(blocks[0].canonicalPath, "blocks/monetization/affiliate-offer");
});
test("RAW Block is refused for Factory reuse", () => {
  const raw = { ...good, exactBlocks: [{ blockId: "block.analytics.visit-tracking", blockVersion: "0.1.1", admissionPath: "admissions/block.analytics.visit-tracking@0.1.1.json" }] };
  assert.throws(() => resolveExactBlocks(root, parseOrosBrief(raw)), (e) => e instanceof FactoryRejectedError && e.code === "BLOCK_MATURITY_INELIGIBLE");
});

test("identity mismatch fails closed", () => {
  const bad = { ...good, exactBlocks: [{ ...good.exactBlocks[0], blockVersion: "9.9.9" }] };
  assert.throws(() => resolveExactBlocks(root, parseOrosBrief(bad)), (e) => e instanceof FactoryRejectedError && e.code === "BLOCK_IDENTITY_MISMATCH");
});

test("engineering command preserves operator acceptance", () => {
  const brief = parseOrosBrief(good);
  const blocks = resolveExactBlocks(root, brief);
  const cmd = makeEngineeringCommand(brief, blocks, "C:/tmp/oros", ["index.mjs"]);
  assert.equal(cmd.maxAttempts, 3);
  assert.deepEqual(cmd.allowedPaths, ["index.mjs"]);
  assert.match(cmd.goal, /block\.monetization\.affiliate-offer@0\.1\.0/);
  assert.ok(cmd.constraints.includes("operator acceptance remains required"));
});
