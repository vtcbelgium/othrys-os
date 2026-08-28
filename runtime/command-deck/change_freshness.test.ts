import test from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';import {join} from 'node:path';import {tmpdir} from 'node:os';import {classifyChangeFreshness} from './change_freshness.ts';
function fx(base='a'.repeat(40)){const d=mkdtempSync(join(tmpdir(),'freshness-')),p=join(d,'candidate.json');writeFileSync(p,JSON.stringify({schema:'othrys.os.change-candidate.v1',candidateId:'CHANGE-0123456789abcdef01234567',missionId:'V2-009A',baseSha:base,status:'VERIFIED_CHANGE_CANDIDATE',applied:false})+'\n');return {d,p};}

test('exact base match is FRESH and apply-request eligible',()=>{const f=fx();try{const r=classifyChangeFreshness(f.p,'a'.repeat(40));assert.equal(r.status,'FRESH');assert.equal(r.fresh,true);assert.equal(r.applyEligible,true);assert.equal(r.authorityGranted,false);}finally{rmSync(f.d,{recursive:true,force:true});}});

test('base mismatch is STALE_BASE and fails apply eligibility',()=>{const f=fx();try{const r=classifyChangeFreshness(f.p,'b'.repeat(40));assert.equal(r.status,'STALE_BASE');assert.equal(r.fresh,false);assert.equal(r.applyEligible,false);assert.equal(r.reason,'BASE_SHA_MISMATCH');}finally{rmSync(f.d,{recursive:true,force:true});}});

test('malformed git identities fail closed',()=>{const f=fx('bad');try{assert.throws(()=>classifyChangeFreshness(f.p,'a'.repeat(40)),/GIT_IDENTITY_INVALID/);assert.throws(()=>classifyChangeFreshness(f.p,'bad'),/GIT_IDENTITY_INVALID/);}finally{rmSync(f.d,{recursive:true,force:true});}});
