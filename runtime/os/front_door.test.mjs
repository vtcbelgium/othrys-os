import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyFrontDoorIntent,frontDoorDispatch,answerFrontDoor} from './front_door.mjs';
const selection={selected:{id:'qwen3-builder',label:'Qwen3 8B · Legion',locality:'LOCAL',costClass:'ZERO',certification:'CERTIFIED'},reason:'NATIVE_SWITCHYARD_SELECTED'};
const status={activeMission:{mission_id:'V2-011J',status:'RUNNING'},quarryClosed:true,bodyStatus:'PASS',deepProof:'310/310 PASS'};
test('simple language routes to the correct organs',()=>{
 assert.equal(classifyFrontDoorIntent('What is OTHRYS?'),'QUESTION');assert.deepEqual(frontDoorDispatch('QUESTION').organs,['MNEMOSYNE']);
 assert.deepEqual(frontDoorDispatch(classifyFrontDoorIntent('Research local speech models')).organs,['PROMETHEUS','MNEMOSYNE']);
 assert.equal(frontDoorDispatch(classifyFrontDoorIntent('Plan a tiny website')).planner,'HEPHAESTUS');
 assert.deepEqual(frontDoorDispatch(classifyFrontDoorIntent('Build a tiny website')).organs,['MNEMOSYNE','HEPHAESTUS','TALOS','SWITCHYARD']);
});
test('simple questions answer from project truth and build stays inert',()=>{
 const who=answerFrontDoor('What is OTHRYS?', {status,modelSelection:selection}); assert.match(who.answer,/operating surface/i);assert.equal(who.intent,'QUESTION');
 const mission=answerFrontDoor('What is the active mission?',{status,modelSelection:selection});assert.match(mission.answer,/V2-011J/);
 const build=answerFrontDoor('Build a hello world page',{status,modelSelection:selection});assert.equal(build.intent,'BUILD');assert.equal(build.dispatch.planner,'HEPHAESTUS');assert.equal(build.modelRoute.id,'qwen3-builder');assert.equal(build.executionStarted,false);assert.equal(build.missionProposalRecommended,true);
});
test('operation status wakes care/time/proof, not builder',()=>{const turn=answerFrontDoor('Does OTHRYS work? health status',{status,modelSelection:selection});assert.equal(turn.intent,'OPERATION');assert.deepEqual(turn.dispatch.organs,['KRONOS','RHEA','TALOS','MNEMOSYNE']);assert.match(turn.answer,/PASS/);});
