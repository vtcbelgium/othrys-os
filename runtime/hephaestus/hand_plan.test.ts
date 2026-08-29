import assert from "node:assert/strict";
import test from "node:test";
import type { FrozenEngineeringPlan } from "./contracts.ts";
import { planEngineeringHands } from "./hand_plan.ts";

function plan(paths=["src/a.ts","src/b.ts"]): FrozenEngineeringPlan {
  return Object.freeze({
    missionId:"V2-HANDS-001", commandDigest:"a".repeat(64), acceptanceDigest:"b".repeat(64),
    title:"Hands", goal:"Build safely", constraints:[], workspace:"C:/scratch",
    allowedPaths:Object.freeze(paths), forbiddenPaths:Object.freeze([]),
    acceptance:Object.freeze({commands:Object.freeze(["node verify.mjs"]),criteria:Object.freeze(["PASS"])}),
    maxAttempts:3, buildTask:"bounded",
  });
}

test("disjoint slices preserve frozen acceptance and cannot grant authority",()=>{
  const p=plan();
  const out=planEngineeringHands(p,[{handId:"left",allowedPaths:["src/a.ts"]},{handId:"right",allowedPaths:["src/b.ts"]}],"DISJOINT_SLICES");
  assert.equal(out.handCount,2); assert.equal(out.fanInPolicy,"VERIFY_MERGE_DISJOINT");
  assert.equal(out.acceptanceDigest,p.acceptanceDigest); assert.equal(out.authorityGranted,false); assert.equal(out.executionStarted,false);
  assert.ok(out.hands.every(h=>h.workspacePolicy==="SEPARATE_WORKTREE_REQUIRED"&&h.authorityGranted===false));
});
test("disjoint slices reject overlap and out-of-scope paths",()=>{
  const p=plan();
  assert.throws(()=>planEngineeringHands(p,[{handId:"a",allowedPaths:["src/a.ts"]},{handId:"b",allowedPaths:["src/a.ts"]}],"DISJOINT_SLICES"),/HAND_SCOPE_OVERLAP/);
  assert.throws(()=>planEngineeringHands(p,[{handId:"a",allowedPaths:["other.ts"]}],"DISJOINT_SLICES"),/HAND_SCOPE_VIOLATION/);
});

test("alternative candidates require identical scope and select exactly one at fan-in",()=>{
  const p=plan(["src/a.ts"]);
  const out=planEngineeringHands(p,[{handId:"candidate-a",allowedPaths:["src/a.ts"]},{handId:"candidate-b",allowedPaths:["src/a.ts"]}],"ALTERNATIVE_CANDIDATES");
  assert.equal(out.fanInPolicy,"VERIFY_SELECT_ONE"); assert.equal(out.handCount,2);
  assert.throws(()=>planEngineeringHands(plan(),[{handId:"a",allowedPaths:["src/a.ts"]},{handId:"b",allowedPaths:["src/b.ts"]}],"ALTERNATIVE_CANDIDATES"),/ALTERNATIVE_SCOPE_MISMATCH/);
});

test("hand width, ids and duplicate path claims fail closed",()=>{
  const p=plan();
  assert.throws(()=>planEngineeringHands(p,[],"DISJOINT_SLICES"),/HAND_BUDGET_INVALID/);
  assert.throws(()=>planEngineeringHands(p,[1,2,3,4].map(i=>({handId:`h${i}`,allowedPaths:["src/a.ts"]})),"ALTERNATIVE_CANDIDATES"),/HAND_BUDGET_INVALID/);
  assert.throws(()=>planEngineeringHands(p,[{handId:"BAD ID",allowedPaths:["src/a.ts"]}],"DISJOINT_SLICES"),/HAND_ID_INVALID/);
  assert.throws(()=>planEngineeringHands(p,[{handId:"a",allowedPaths:["src/a.ts","src/a.ts"]}],"DISJOINT_SLICES"),/HAND_PATH_DUPLICATE/);
});
