import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inventoryKeymasterEnv, resolveSealedEnvCredential, SEALED_MARKER } from './keymaster_vault.mjs';

const fixture=()=>{const dir=mkdtempSync(join(tmpdir(),'keymaster-'));const path=join(dir,'.env');writeFileSync(path,'GROQ_API_KEY=super-secret-fixture\nPUBLIC_SETTING=yes\nOPENROUTER_API_KEY=router-fixture\n');return {sourceId:'fixture',available:true,path};};

test('inventory exposes names and health, never values',()=>{const x=inventoryKeymasterEnv(fixture());assert.equal(x.credentialCount,2);assert.deepEqual(x.credentials.map(c=>c.envVar),['GROQ_API_KEY','OPENROUTER_API_KEY']);assert.equal(JSON.stringify(x).includes('super-secret-fixture'),false);});
test('sealed resolver never serializes secret material',()=>{const x=resolveSealedEnvCredential(fixture(),'GROQ_API_KEY',{consumer:'provider-probe',readOnly:true,authorityGranted:false});assert.equal(x.ok,true);assert.equal(String(x.value),SEALED_MARKER);assert.equal(JSON.stringify(x.value),`"${SEALED_MARKER}"`);assert.equal(JSON.stringify(x).includes('super-secret-fixture'),false);});
test('sealed secret applies only at explicit use boundary',()=>{const x=resolveSealedEnvCredential(fixture(),'GROQ_API_KEY',{consumer:'provider-probe',readOnly:true,authorityGranted:false});assert.equal(x.value.applyToHeader({}).authorization,'Bearer super-secret-fixture');});
test('missing or unauthorized access fails closed',()=>{const s=fixture();assert.equal(resolveSealedEnvCredential(s,'MISSING_API_KEY',{consumer:'x',readOnly:true,authorityGranted:false}).ok,false);assert.throws(()=>resolveSealedEnvCredential(s,'GROQ_API_KEY',{consumer:'x',readOnly:false,authorityGranted:false}),/DENIED/);});
