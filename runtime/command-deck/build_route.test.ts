import test from 'node:test';import assert from 'node:assert/strict';import {proposeBuildRoute} from './build_route.ts';
const sel={selected:{id:'qwen3-builder',label:'Qwen3 8B · Legion',class:'LOCAL ENGINEERING',status:'PRIMARY',available:true,evidence:'V2-002C'},reason:'PRIMARY_LOCAL_AVAILABLE'};

test('MISSING_WORK proposes local primary route without execution',()=>{const r=proposeBuildRoute({missionId:'V2-009A',class:'MISSING_WORK'},sel);assert.equal(r.status,'ROUTE_PROPOSED');assert.equal(r.selected.id,'qwen3-builder');assert.equal(r.authorityGranted,false);assert.equal(r.executionStarted,false);});

test('NO_CHANGE never routes',()=>{const r=proposeBuildRoute({missionId:'V2-009A',class:'NO_CHANGE'},sel);assert.equal(r.status,'NOT_REQUIRED');assert.equal(r.selected,null);});

test('BLOCKED never routes',()=>{const r=proposeBuildRoute({missionId:'V2-009A',class:'BLOCKED',reason:'X'},sel);assert.equal(r.status,'BLOCKED');assert.equal(r.selected,null);});

test('unavailable or non-primary labor fails closed',()=>{assert.equal(proposeBuildRoute({missionId:'V2-009A',class:'MISSING_WORK'},{selected:null,reason:'NO_PRIMARY'}).status,'BLOCKED');assert.equal(proposeBuildRoute({missionId:'V2-009A',class:'MISSING_WORK'},{selected:{...sel.selected,status:'ADVISORY ONLY'}}).status,'BLOCKED');});
