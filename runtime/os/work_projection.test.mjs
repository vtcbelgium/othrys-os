import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { projectMissionWork } from "./work_projection.mjs";

test("governed Web activation plus canonical verified apply projects SHIP COMPLETE", () => {
  const root=mkdtempSync(join(tmpdir(),"othrys-web-work-"));
  try{
    mkdirSync(join(root,"missions","web-plans"),{recursive:true});
    writeFileSync(join(root,"missions","V2-011O.json"),JSON.stringify({
      mission_id:"V2-011O",
      title:"Smoke",
      objective:"Create smoke doc",
      status:"CANONICAL_UNACTIVATED",
      authorityGranted:false,
      executionStarted:false
    }));
    writeFileSync(join(root,"missions","web-plans","WEB-SMOKE.activation.json"),JSON.stringify({
      schema:"othrys.os.web-command-activation-scope.v1",
      webCommandId:"WEB-SMOKE",
      canonicalMissionId:"V2-011O",
      allowedWritePaths:["docs/BUILDER-SMOKE-TEST.md"],
      authorityGranted:false,
      executionStarted:false
    }));
    writeFileSync(join(root,"missions","V2-011O.result.json"),JSON.stringify({
      mission_id:"V2-011O",
      verdict:"PASS",
      canonical_apply_commit:"a".repeat(40),
      changed_files:["docs/BUILDER-SMOKE-TEST.md"],
      independent_verification:"PASS"
    }));
    const work=projectMissionWork(root,{active_mission:{mission_id:"V2-011K",status:"RUNNING"}},"V2-011O");
    assert.equal(work.approval,"NOT_REQUIRED");
    assert.equal(work.status,"COMPLETE");
    assert.equal(work.phase,"SHIP");
    assert.ok(work.phases.every(p=>p.status==="COMPLETE"));
    assert.ok(work.artifacts.some(a=>a.id==="web-activation"&&a.present===true));
  }finally{rmSync(root,{recursive:true,force:true});}
});

test("unactivated Web mission without activation evidence remains gated", () => {
  const root=mkdtempSync(join(tmpdir(),"othrys-web-work-gated-"));
  try{
    mkdirSync(join(root,"missions"),{recursive:true});
    writeFileSync(join(root,"missions","V2-011P.json"),JSON.stringify({
      mission_id:"V2-011P",
      title:"Gated",
      objective:"Wait",
      status:"CANONICAL_UNACTIVATED"
    }));
    const work=projectMissionWork(root,{active_mission:null},"V2-011P");
    assert.equal(work.approval,"ACTIVATION_REQUIRED");
    assert.equal(work.status,"UNACTIVATED");
    assert.equal(work.phase,"BUILD");
  }finally{rmSync(root,{recursive:true,force:true});}
});
