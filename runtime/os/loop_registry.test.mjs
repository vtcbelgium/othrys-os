import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loopRegistry, loopOptimizationPlan } from './loop_registry.mjs';

const root=resolve(import.meta.dirname,'../..');
const registry=loopRegistry(root);

test('registry maps only real source-backed current loops',()=>{
  assert.equal(registry.schema,'othrys.os.loop-registry.v1');
  assert.equal(registry.authorityGranted,false); assert.equal(registry.executionStarted,false);
  assert.deepEqual(registry.loops.map(x=>x.id),[
    'command-deck.admission-watcher','mycelium.telemetry-push','othrys-os.housekeeper','talos.retry-replay','factory.build-attempts','factory.refinement','hephaestus.repair-attempts'
  ]);
  for(const row of registry.loops){assert.equal(row.sourcePresent,true,row.id);assert.equal(row.contractPresent,true,row.id);assert.equal(row.authorityGranted,false,row.id);}
});

test('registry owners agree with component contract owners',()=>{
  for(const row of registry.loops){
    const doc=readFileSync(join(root,'contracts','components',`${row.componentId}.md`),'utf8');
    const owner=doc.match(/^\*\*Owner:\*\*\s*`([^`]+)`/m)?.[1];
    assert.equal(row.owner,owner,row.id);
  }
});

test('polling/cadence loops expose explicit cheap budgets',()=>{
  const byId=new Map(registry.loops.map(x=>[x.id,x]));
  assert.match(byId.get('command-deck.admission-watcher').budget,/>=1000ms/);
  assert.match(byId.get('mycelium.telemetry-push').budget,/>=5000ms/);
  assert.match(byId.get('othrys-os.housekeeper').budget,/>=60000ms/);
  assert.equal(byId.get('talos.retry-replay').optimization,'REFERENCE_LOOP');
});

test('no registered loop can grant continuation or execution authority',()=>{
  for(const row of registry.loops){
    assert.equal('continuationAuthorized' in row,false,row.id);
    assert.equal('executionStarted' in row,false,row.id);
  }
});

test('every registry claim is grounded in concrete source signals',()=>{
  for(const row of registry.loops){
    const source=readFileSync(join(root,...row.source.split('/')),'utf8');
    assert.ok(Array.isArray(row.signals)&&row.signals.length>=2,`${row.id}: source signals missing`);
    for(const signal of row.signals) assert.ok(source.includes(signal),`${row.id}: missing source signal ${signal}`);
  }
});

test('every free-running production loop is registered',()=>{
  const production=[
    'runtime/command-deck/admission_watcher.ts',
    'runtime/command-deck/push-legion-telemetry.mjs',
    'runtime/os/housekeeper_daemon.mjs',
  ];
  const registered=new Set(registry.loops.map(x=>x.source));
  for(const rel of production){
    const source=readFileSync(join(root,...rel.split('/')),'utf8');
    assert.match(source,/(?:while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\))/i,`${rel}: expected free-running loop shape`);
    assert.equal(registered.has(rel),true,`${rel}: free-running loop not registered`);
  }
});

test('optimization plan prioritizes diagnosis and evidence before runtime change',()=>{
  const plan=loopOptimizationPlan(root);
  assert.equal(plan.authorityGranted,false);
  assert.equal(plan.automaticMutation,false);
  assert.equal(plan.automaticPromotion,false);
  const byId=new Map(plan.recommendations.map(x=>[x.loopId,x]));
  assert.equal(byId.get('hephaestus.repair-attempts').priority,'P0');
  assert.equal(byId.get('hephaestus.repair-attempts').decision,'WEAVE_DIAGNOSIS');
  assert.equal(byId.get('command-deck.admission-watcher').decision,'MEASURE_THEN_ADAPT');
  assert.equal(byId.get('talos.retry-replay').decision,'KEEP_REFERENCE');
  assert.equal(byId.get('factory.build-attempts').decision,'CAPTURE_TRACES');
});

test('runtime-wide free-running loop scan has no unregistered production loops',()=>{
  const candidates=[];
  const walk=dir=>{for(const name of readdirSync(dir)){const p=join(dir,name),st=statSync(p);if(st.isDirectory())walk(p);else if(/\.(?:ts|js|mjs|py)$/.test(name)&&!name.includes('.test.'))candidates.push(p);}};
  walk(join(root,'runtime'));
  const registered=new Set(registry.loops.map(x=>join(root,...x.source.split('/'))));
  const own=join(root,'runtime','os','loop_registry.mjs');
  const unregistered=[];
  for(const p of candidates){
    if(p===own)continue;
    const source=readFileSync(p,'utf8');
    if(/while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/i.test(source)&&!registered.has(p))unregistered.push(p.slice(root.length+1));
  }
  assert.deepEqual(unregistered,[]);
});

test('registered loop budgets remain aligned with component contracts',()=>{
  for(const row of registry.loops){
    const contract=readFileSync(join(root,'contracts','components',`${row.componentId}.md`),'utf8');
    assert.ok(Array.isArray(row.contractSignals)&&row.contractSignals.length>=1,`${row.id}: contract signals missing`);
    for(const signal of row.contractSignals)assert.ok(contract.includes(signal),`${row.id}: contract drift ${signal}`);
  }
});
