import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSkillContract, routeSkill } from './skill_contract.mjs';

test('skill contract is typed, evaluated and authority-free',()=>{const s=validateSkillContract({id:'research.basic',version:'1.0.0',capability:'research.web',inputs:['query'],outputs:['evidence'],tools:['web'],permissions:['network.read'],risk:'LOW',costClass:'ZERO',evaluation:['source-present']});assert.equal(s.authorityGranted,false);assert.deepEqual(s.inputs,['query']);});

test('router fails closed and prefers legal low-risk skill',()=>{const skills=[{id:'a',version:'1',capability:'x',permissions:['network.read'],risk:'LOW',costClass:'ZERO',evaluation:['proof']},{id:'b',version:'1',capability:'x',permissions:['network.write'],risk:'HIGH',costClass:'PAID',evaluation:['proof']}];const r=routeSkill({capability:'x',allowedPermissions:['network.read'],maxRisk:'MEDIUM'},skills);assert.equal(r.selected.id,'a');assert.equal(routeSkill({capability:'y',allowedPermissions:[]},skills).outcome,'NO_LEGAL_SKILL');});