import test from "node:test";
import assert from "node:assert/strict";
import { runLoop, replay, type LoopDeps } from "./loop.ts";

const policy={maxAttempts:3,baseDelayMs:10,factor:2,maxDelayMs:100};
function deps(work:LoopDeps["work"],verify:LoopDeps["verify"]):LoopDeps {
  let n=0;
  return {work,verify,now:()=>++n*100,iso:()=>`t${n}`};
}

test("retry twice then evidence-gated success",async()=>{
  const run=await runLoop("m-success",policy,deps(
    async a=>a<3?{ok:false,reason:"not yet",retryable:true}:{ok:true,outputRef:"artifact-ok"},
    async ref=>ref==="artifact-ok"));
  assert.equal(run.state,"SUCCEEDED");
  assert.equal(run.attempts,3);
  assert.equal(run.events.filter(e=>e.t==="op.retry_scheduled").length,2);
  assert.equal(replay({...run,events:JSON.parse(JSON.stringify(run.events))}),"SUCCEEDED");
});

test("builder success is rejected until verifier passes",async()=>{
  let checks=0;
  const run=await runLoop("m-verify",policy,deps(
    async()=>({ok:true,outputRef:"candidate"}),async()=>++checks>=2));
  assert.equal(run.state,"SUCCEEDED");
  assert.equal(run.attempts,2);
  assert.equal(checks,2);
});
test("semantic failure does not retry",async()=>{
  const run=await runLoop("m-fail",policy,deps(
    async()=>({ok:false,reason:"bad input",retryable:false}),async()=>true));
  assert.equal(run.state,"FAILED");
  assert.equal(run.attempts,1);
  assert.equal(run.events.some(e=>e.t==="op.retry_scheduled"),false);
});

test("retryable failure dead-letters at budget",async()=>{
  const run=await runLoop("m-dead",{...policy,maxAttempts:2},deps(
    async()=>({ok:false,reason:"still broken",retryable:true}),async()=>true));
  assert.equal(run.state,"DEAD_LETTERED");
  assert.equal(run.attempts,2);
  assert.equal(replay(run),"DEAD_LETTERED");
});

test("verification failure dead-letters instead of fake success",async()=>{
  const run=await runLoop("m-proof",{...policy,maxAttempts:2},deps(
    async()=>({ok:true,outputRef:"bad-artifact"}),async()=>false));
  assert.equal(run.state,"DEAD_LETTERED");
  assert.equal(run.events.some(e=>e.t==="op.succeeded"),false);
  assert.equal(run.events.filter(e=>e.t==="op.validating").length,2);
});