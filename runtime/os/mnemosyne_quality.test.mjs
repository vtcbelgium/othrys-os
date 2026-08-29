import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { inspectMnemosyneQuality } from './mnemosyne_quality.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..','..');

test('quality inspection is read-only and authority-free on the live house fixture',()=>{
  const report=inspectMnemosyneQuality(root);
  assert.equal(report.schema,'othrys.os.mnemosyne-quality.v1');
  assert.equal(report.authorityGranted,false);
  assert.equal(report.mutationPerformed,false);
  assert.equal(typeof report.ok,'boolean');
  assert.equal(report.defectCount,report.findings.filter(x=>x.severity!=='info').length);
});
test('quality inspection surfaces unresolved provenance without mutating the house',()=>{
  const nowhere=mkdtempSync(join(tmpdir(),'othrys-missing-projects-'));
  try{
    const report=inspectMnemosyneQuality(root,{projectsRoot:nowhere});
    const finding=report.findings.find(x=>x.kind==='source-ref-missing');
    assert.ok(finding);
    assert.equal(finding.severity,'medium');
    assert.equal(finding.authorityGranted,false);
    assert.equal(report.mutationPerformed,false);
  }finally{
    rmSync(nowhere,{recursive:true,force:true});
  }
});
test('quality inspection includes machine-grounded Hecatoncheires posture',()=>{
  const report=inspectMnemosyneQuality(root);
  const finding=report.findings.find(x=>x.kind==='hecatoncheires-posture');
  assert.ok(finding);
  assert.equal(finding.severity,'info');
  assert.deepEqual(finding.evidence.counts,{PRESENT_AND_TESTED:3,PARTIAL:4,ABSENT:4});
  assert.equal(finding.authorityGranted,false);
});
test('quality inspection verifies permanent Great Harvest integrity',()=>{
  const report=inspectMnemosyneQuality(root);
  const finding=report.findings.find(x=>x.kind==='great-harvest-integrity');
  assert.ok(finding);
  assert.equal(finding.severity,'info');
  assert.ok(finding.evidence.indexedObjects>0);
  assert.ok(finding.evidence.historicalOnlyObjects>0);
  assert.equal(finding.authorityGranted,false);
});
