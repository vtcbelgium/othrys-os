import test from 'node:test';
import assert from 'node:assert/strict';
import { collectTrainingEvidence, synthesizeTalosLearning, deriveTalosAdaptations, buildTalosIntelligence, buildTalosOperationalIntelligence } from './talos_learning_core.mjs';
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

test('Talos can adapt verified Mnemosyne operational evidence without granting authority',()=>{
  const events=[{schema:'othrys.os.mnemosyne-operational-event.v1',status:'PASS',evidence:{phase:'3.5-G',observations:['gateway rollback passed','live estate projection passed']}}];
  const intel=buildTalosOperationalIntelligence(events,{level:3.5});
  assert.equal(intel.schema,'othrys.talos.operational-intelligence.v1');
  assert.equal(intel.learning.jobs,1);
  assert.equal(intel.learning.finalPassRate,1);
  assert.equal(intel.adaptations.authorityGranted,false);
  assert.equal(intel.adaptations.MNEMOSYNE.lessonSummary.weakChecks.length,0);
});

test('operational Builder evidence changes Hephaestus ranking through the existing Talos adaptation',()=>{
  const roster=loadForgeRoster(root), spark=loadForgeSparkEvidence(root), task={tags:['coding','app'],localPreferred:true,fast:false};
  const baseline=rankForgeBuilders(roster,task,{spark});
  const events=[{schema:'othrys.os.mnemosyne-operational-event.v1',status:'PASS',evidence:{phase:'3.5-G',observations:['governed Builder execution passed'],builderEvidence:{id:'local.qwen3-8b',firstPass:true,recovery:false,attempts:1,attemptFailure:false}}}];
  const intel=buildTalosOperationalIntelligence(events,{level:3.5});
  const adapted=rankForgeBuilders(roster,task,{spark,evidence:intel.adaptations.HEPHAESTUS.forgeEvidence});
  assert.equal(intel.adaptations.HEPHAESTUS.forgeEvidence['local.qwen3-8b'].firstPassRate,1);
  assert.notEqual(baseline.executable[0].id,adapted.executable[0].id);
  assert.equal(adapted.executable[0].id,'local.qwen3-8b');
  assert.equal(intel.adaptations.authorityGranted,false);
});
