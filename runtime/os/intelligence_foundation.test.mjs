import test from 'node:test';
import assert from 'node:assert/strict';
import { createIntelligenceFoundation } from './intelligence_foundation.mjs';

test('intelligence foundation composes registry and Keymaster view without authority',()=>{const f=createIntelligenceFoundation({capabilities:[{id:'local.search',provider:'othrys',category:'search',features:['search'],freeTier:true,asOf:'2026-08-30'}],now:()=> '2026-08-30T06:00:00Z',keymasterSource:{sourceId:'fixture',available:false,path:null}});f.registry.certify('local.search',{readiness:'READY',health:'HEALTHY'});const v=f.unifiedView();assert.equal(v.registry.ready,1);assert.equal(v.capabilities[0].userMustAct,false);assert.equal(v.credentials.secretValuesExposed,false);assert.equal(v.authorityGranted,false);});