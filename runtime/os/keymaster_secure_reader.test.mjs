import test from 'node:test';
import assert from 'node:assert/strict';
import { createCipheriv, randomBytes } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  discoverSecureVault,
  inventorySecureVault,
  resolveSealedSecureCredential,
  KEYMASTER_SECURE_SCHEMA,
  KEYMASTER_SECURE_SEALED,
} from './keymaster_secure_reader.mjs';

function fixture(){
  const dir=mkdtempSync(join(tmpdir(),'keymaster-secure-'));
  const key=randomBytes(32);
  const iv=randomBytes(12);
  const records={
    GROQ_API_KEY:'groq-secret-fixture',
    OPENROUTER_API_KEY:'router-secret-fixture',
  };
  const cipher=createCipheriv('aes-256-gcm',key,iv);
  const ciphertext=Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(records),'utf8')),
    cipher.final(),
  ]);
  const doc={
    schema:KEYMASTER_SECURE_SCHEMA,
    alg:'AES-256-GCM',
    keyProtection:'TEST',
    createdAt:new Date().toISOString(),
    iv:iv.toString('base64'),
    tag:cipher.getAuthTag().toString('base64'),
    ciphertext:ciphertext.toString('base64'),
  };
  const vaultPath=join(dir,'keymaster.vault.json');
  const wrappedKeyPath=join(dir,'keymaster.master.dpapi');
  writeFileSync(vaultPath,JSON.stringify(doc),'utf8');
  writeFileSync(wrappedKeyPath,Buffer.from('wrapped-test').toString('base64'),'utf8');
  const source={
    sourceId:'fixture-dpapi',
    sourceType:'secure-dpapi-vault',
    available:true,
    paths:{vaultPath,wrappedKeyPath},
  };
  return {source,key,unprotect:()=>key};
}

test('secure inventory exposes names only',()=>{
  const {source,unprotect}=fixture();
  const x=inventorySecureVault(source,{unprotect});
  assert.equal(x.credentialCount,2);
  assert.deepEqual(
    x.credentials.map(c=>c.envVar),
    ['GROQ_API_KEY','OPENROUTER_API_KEY'],
  );
  assert.equal(JSON.stringify(x).includes('groq-secret-fixture'),false);
  assert.equal(x.encryptedAtRest,true);
});

test('secure resolver stays sealed and applies only at use boundary',()=>{
  const {source,unprotect}=fixture();
  const x=resolveSealedSecureCredential(
    'OPENROUTER_API_KEY',
    {consumer:'provider-probe',readOnly:true,authorityGranted:false},
    source,
    {unprotect},
  );
  assert.equal(x.ok,true);
  assert.equal(String(x.value),KEYMASTER_SECURE_SEALED);
  assert.equal(JSON.stringify(x).includes('router-secret-fixture'),false);
  assert.equal(
    x.value.applyToHeader({}).authorization,
    'Bearer router-secret-fixture',
  );
});

test('secure resolver fails closed',()=>{
  const {source,unprotect}=fixture();
  const missing=resolveSealedSecureCredential(
    'MISSING_API_KEY',
    {consumer:'provider-probe',readOnly:true,authorityGranted:false},
    source,
    {unprotect},
  );
  assert.equal(missing.ok,false);
  assert.throws(
    ()=>resolveSealedSecureCredential(
      'GROQ_API_KEY',
      {consumer:'provider-probe',readOnly:false,authorityGranted:false},
      source,
      {unprotect},
    ),
    /DENIED/,
  );
});

test('secure source discovery remains Windows-only',()=>{
  const home=mkdtempSync(join(tmpdir(),'keymaster-home-'));
  assert.equal(discoverSecureVault({home,platform:'linux'}).available,false);
});
