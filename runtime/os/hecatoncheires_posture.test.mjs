import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inspectHecatoncheiresPosture, validateHecatoncheiresPosture } from './hecatoncheires_posture.mjs';

const root=resolve(import.meta.dirname,'../..');
const posture=JSON.parse(readFileSync(resolve(root,'docs/HECATONCHEIRES_POSTURE.json'),'utf8'));

test('current Hecatoncheires posture is honest, complete and authority-free',()=>{
  const report=inspectHecatoncheiresPosture(root);
  assert.equal(report.ok,true,report.issues.join('\n'));
  assert.equal(report.authorityGranted,false);
  assert.equal(report.mutationPerformed,false);
  assert.deepEqual(report.counts,{PRESENT_AND_TESTED:3,PARTIAL:4,ABSENT:4});
  assert.equal(report.hands.length,11);
});

test('PRESENT_AND_TESTED cannot survive missing proof or invented signals',()=>{
  const forged=structuredClone(posture);
  forged.hands[0].tests=['runtime/os/does-not-exist.test.mjs'];
  forged.hands[0].signals=['imaginary security proof'];
  const issues=validateHecatoncheiresPosture(root,forged);
  assert.ok(issues.some(x=>x.startsWith('missing:1:')));
  assert.ok(issues.some(x=>x.startsWith('signal:1:')));
});
test('all cited current security proof tests execute green',async()=>{
  const { spawnSync }=await import('node:child_process');
  const proofTests=[...new Set(posture.hands.filter(x=>x.status!=='ABSENT').flatMap(x=>x.tests??[]))].sort();
  assert.ok(proofTests.length>0);
  const run=spawnSync(process.execPath,['--test',...proofTests],{cwd:root,encoding:'utf8',timeout:120000});
  assert.equal(run.status,0,`${run.stdout}\n${run.stderr}`);
});
