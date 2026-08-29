import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root=resolve(import.meta.dirname,'../..');
const law=readFileSync(join(root,'LOOP_LAWS.md'),'utf8');

test('Loop Laws keep continuation externally bounded',()=>{
  assert.match(law,/No loop may continue merely because an AI wants another turn/);
  assert.match(law,/No unbounded `while true`/);
  assert.match(law,/A worker-emitted DONE\/NEXT\/COMPLETE sentinel is only a proposal/);
  assert.match(law,/Continuation authority flows from outside inward/);
});

test('Loop Laws require goal-grounded diagnosis before correction',()=>{
  assert.match(law,/COMPARE STATE TO GOAL/);
  assert.match(law,/structured diagnosis: failure class, causal evidence, changed assumption and allowed next action/);
  assert.match(law,/FIRST CAUSAL BLOCKER LAW/);
});

test('Loop Laws optimize toward less agentic future execution',()=>{
  assert.match(law,/TRACE COMPRESSION LAW/);
  assert.match(law,/deterministic recipe\/meta-tool\/Block candidate/);
  assert.match(law,/CAPABILITY-GATED LOOP FREEDOM/);
  assert.match(law,/LOOP OPTIMIZATION TELEMETRY/);
});

test('Loop optimization metrics never become authority',()=>{
  assert.match(law,/Metrics optimize processing; they do not grant authority or prove correctness by themselves/);
  assert.match(law,/capable optimizer allowed to rewrite its objective, evaluator or total budget/);
});
