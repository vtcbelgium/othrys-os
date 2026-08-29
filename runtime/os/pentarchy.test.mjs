import test from 'node:test';
import assert from 'node:assert/strict';
import {assessPentarchy,assessSelfHosting,evaluateAutonomyGate,PENTARCHY_SEATS} from './pentarchy.mjs';
const evidence={
 KRONOS:{lifeEvidence:true,boundedWindow:true},
 TALOS:{flowEvidence:true,verificationEvidence:true,terminationEvidence:true},
 PROMETHEUS:{intelligenceEvidence:true},
 MNEMOSYNE:{lineageEvidence:true,lessonEvidence:true},
 HEPHAESTUS:{buildEvidence:true,independentVerification:true},
};
test('Pentarchy has exactly five evidence-gated seats and creates no authority',()=>{
 assert.deepEqual(PENTARCHY_SEATS,['KRONOS','TALOS','PROMETHEUS','MNEMOSYNE','HEPHAESTUS']);
 const out=assessPentarchy({missionId:'V2-X',evidence,authorityGranted:false,executionStarted:false});
 assert.equal(out.ready,true);assert.equal(out.authorityGranted,false);assert.equal(out.executionStarted,false);
});
test('one weak seat keeps the whole Pentarchy unready',()=>{
 const weak={...evidence,MNEMOSYNE:{lineageEvidence:true,lessonEvidence:false}};
 const out=assessPentarchy({missionId:'V2-X',evidence:weak,authorityGranted:false,executionStarted:false});
 assert.equal(out.ready,false);assert.deepEqual(out.seats.MNEMOSYNE.missing,['lessonEvidence']);
});
test('Pentarchy refuses authority or execution claims',()=>assert.throws(()=>assessPentarchy({missionId:'V2-X',evidence,authorityGranted:true,executionStarted:false}),/AUTHORITY/));test('self-hosting ratio exposes external capability debt instead of hiding it',()=>{
 const out=assessSelfHosting({missionId:'V2-X',stage:'ASSISTED',totalSteps:10,othrysSteps:7,externalSteps:3,capabilityDebt:[{capability:'patch synthesis',reason:'no admitted native path',retirementGate:'native builder proves same patch class'}]});
 assert.equal(out.selfWorkRatio,.7);assert.equal(out.normalPathExternalDependency,true);assert.equal(out.capabilityDebt.length,1);assert.equal(out.authorityGranted,false);
});
test('AUTONOMY-L1 stays closed while external dependency remains',()=>{
 const out=evaluateAutonomyGate({pentarchy:{missionId:'V2-X',evidence,authorityGranted:false,executionStarted:false},selfHosting:{missionId:'V2-X',stage:'LEARNED',totalSteps:10,othrysSteps:9,externalSteps:1,capabilityDebt:[]},runs:{completed:100,expected:100,duplicateSideEffects:0,unexplainedStates:0,authorityDrift:0,replayEquality:1,faultRecoveryProven:true,learningImprovementProven:true}});
 assert.equal(out.pentarchyReady,true);assert.equal(out.boundedRuns,true);assert.equal(out.autonomyL1,false);
});
test('AUTONOMY-L1 opens only on full bounded evidence and OTHRYS normal path',()=>{
 const out=evaluateAutonomyGate({pentarchy:{missionId:'V2-X',evidence,authorityGranted:false,executionStarted:false},selfHosting:{missionId:'V2-X',stage:'LEARNED',totalSteps:100,othrysSteps:100,externalSteps:0,capabilityDebt:[]},runs:{completed:100,expected:100,duplicateSideEffects:0,unexplainedStates:0,authorityDrift:0,replayEquality:1,faultRecoveryProven:true,learningImprovementProven:true}});
 assert.equal(out.autonomyL1,true);assert.equal(out.authorityGranted,false);assert.equal(out.executionStarted,false);
});