import test from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';import {join} from 'node:path';import {tmpdir} from 'node:os';import {prepareChangeApplyRequest} from './change_apply.ts';
function fx(base='a'.repeat(40)){const d=mkdtempSync(join(tmpdir(),'change-apply-')),m=join(d,'missions','change-candidates');mkdirSync(m,{recursive:true});const id='CHANGE-0123456789abcdef01234567';writeFileSync(join(m,`${id}.json`),JSON.stringify({schema:'othrys.os.change-candidate.v1',candidateId:id,missionId:'V2-009A',baseSha:base,patchDigest:'b'.repeat(64),status:'VERIFIED_CHANGE_CANDIDATE',applied:false})+'\n');return {d,id};}

test('fresh candidate is eligible only for apply request',()=>{const f=fx();try{const r=prepareChangeApplyRequest(f.d,f.id,'a'.repeat(40));assert.equal(r.status,'APPLY_REQUEST_ELIGIBLE');assert.equal(r.authorityGranted,false);assert.equal(r.applied,false);assert.equal(r.targetSha,'a'.repeat(40));}finally{rmSync(f.d,{recursive:true,force:true});}});

test('stale candidate is rejected before request admission',()=>{const f=fx();try{assert.throws(()=>prepareChangeApplyRequest(f.d,f.id,'c'.repeat(40)),/CHANGE_NOT_FRESH/);}finally{rmSync(f.d,{recursive:true,force:true});}});

test('malformed candidate identity fails closed',()=>{const f=fx();try{assert.throws(()=>prepareChangeApplyRequest(f.d,'bad','a'.repeat(40)),/CHANGE_CANDIDATE_ID_INVALID/);}finally{rmSync(f.d,{recursive:true,force:true});}});
