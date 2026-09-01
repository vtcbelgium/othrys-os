import test from 'node:test';
import assert from 'node:assert/strict';
import { collectTrainingEvidence, synthesizeTalosLearning, deriveTalosAdaptations, buildTalosIntelligence } from './talos_learning_core.mjs';
import { loadForgeRoster, loadForgeSparkEvidence, rankForgeBuilders } from '../hephaestus/forge.mjs';

const root=process.cwd();

test('Talos turns Level 3 evidence into verified learning rather than a passive log',()=>{
  const jobs=collectTrainingEvidence(root,3);
  assert.equal(jobs.length,24);
  const learning=synthesizeTalosLearning(jobs,{level:3});
  assert.equal(learning.jobs,24);
  assert.equal(learning.finalPassRate,1);
  assert.ok(Object.keys(learning.builderEvidence).length>1);
  assert.equal(learning.authorityGranted,false);
});

test('Talos emits cross-organ adaptations without minting authority',()=>{
  const intel=buildTalosIntelligence(root,3);
  const a=intel.adaptations;
  assert.equal(a.authorityGranted,false);
  assert.equal(a.executionAuthorityGranted,false);
  assert.equal(a.automaticAdmission,false);
  for(const organ of ['HEPHAESTUS','SWITCHYARD','KRONOS','RHEA','MNEMOSYNE','PROMETHEUS','MYCELIUM','TALOS'])assert.ok(a[organ]);
  assert.equal(a.sourceDigest,intel.learning.evidenceDigest);
});
test('Hephaestus ranking consumes Talos-verified builder evidence',()=>{
  const intel=buildTalosIntelligence(root,3);
  const roster=loadForgeRoster(root), spark=loadForgeSparkEvidence(root);
  const ranked=rankForgeBuilders(roster,{tags:['coding','app'],localPreferred:true,fast:false},{spark,evidence:intel.adaptations.HEPHAESTUS.forgeEvidence});
  const observed=ranked.ranked.filter(x=>intel.learning.builderEvidence[x.id]);
  assert.ok(observed.length>=2);
  for(const row of observed)assert.equal(row.measuredQuality,intel.learning.builderEvidence[row.id].firstPassRate);
  assert.equal(ranked.authorityGranted,false);
});

test('synthetic repeated failures create concrete routing, care and research adaptations',()=>{
  const jobs=[{receipt:{family:'web',builderAttempt:{builder:'local.a',ok:false},operatorRecovery:{used:true},talos:{status:'PASS',checks:[{name:'visible',ok:true}]}},attempts:[{builder_id:'local.a',reason:'NO_ATTEMPT_MUTATION',duration_sec:10}]},{receipt:{family:'web',builderAttempt:{builder:'local.a',ok:false},operatorRecovery:{used:true},talos:{status:'PASS',checks:[{name:'visible',ok:true}]}},attempts:[{builder_id:'local.a',reason:'NO_ATTEMPT_MUTATION',duration_sec:12}]}];
  const learning=synthesizeTalosLearning(jobs,{level:99});
  const a=deriveTalosAdaptations(learning);
  assert.equal(a.HEPHAESTUS.forgeEvidence['local.a'].firstPassRate,0);
  assert.equal(a.RHEA.careSignals[0].reason,'REPEATED_NO_MUTATION');
  assert.ok(a.PROMETHEUS.researchQuestions.length>0);
});

test('verified Talos learning changes an observable future builder decision',()=>{
  const roster=loadForgeRoster(root), spark=loadForgeSparkEvidence(root), task={tags:['coding','app'],localPreferred:true,fast:false};
  const baseline=rankForgeBuilders(roster,task,{spark});
  const intel=buildTalosIntelligence(root,3);
  const adapted=rankForgeBuilders(roster,task,{spark,evidence:intel.adaptations.HEPHAESTUS.forgeEvidence});
  assert.notEqual(baseline.executable[0].id,adapted.executable[0].id);
  assert.equal(baseline.executable[0].id,'local.gemma4-12b');
  assert.equal(adapted.executable[0].id,'local.qwen3.8-27b');
  assert.ok(adapted.ranked.find(x=>x.id==='local.gemma4-12b').learnedPenalty>0);
});
