import test from "node:test";
import assert from "node:assert/strict";
import { factoryBuildRequirement } from "./placement.ts";

test("Factory build request is capability-addressed, not host-addressed", () => {
  const r = factoryBuildRequirement();
  assert.equal(r.capability, "engineering.patch");
  assert.deepEqual(r.resources, {cpu_threads:1, ram_mb:1024, gpu_count:0, vram_mb:0});
  assert.equal("node_id" in (r as any), false);
  assert.equal("hostname" in (r as any), false);
});

test("Factory requirement is immutable", () => {
  const r = factoryBuildRequirement();
  assert.equal(Object.isFrozen(r), true);
  assert.equal(Object.isFrozen(r.resources), true);
});
