import test from 'node:test';
import assert from 'node:assert/strict';
import { runSafeProviderProbe } from './provider_probe.mjs';
const sealed={applyToHeader(headers){return {...headers,authorization:'Bearer secret-fixture'};}};
test('safe probe returns sanitized health and model count',async()=>{let seen=null;const fetchImpl=async(url,opts)=>{seen={url,headers:opts.headers};return {ok:true,status:200,json:async()=>({data:[{id:'a'},{id:'b'}]})};};const x=await runSafeProviderProbe({envVar:'GROQ_API_KEY',sealedCredential:sealed,fetchImpl});assert.equal(x.healthy,true);assert.equal(x.modelCount,2);assert.equal(x.secretExposed,false);assert.equal(JSON.stringify(x).includes('secret-fixture'),false);assert.equal(seen.headers.authorization,'Bearer secret-fixture');});
test('unknown provider refuses rather than guessing',async()=>{const x=await runSafeProviderProbe({envVar:'MYSTERY_API_KEY',sealedCredential:sealed,fetchImpl:async()=>{throw new Error('should not call')}});assert.equal(x.supported,false);});
test('failed provider probe stays bounded and non-authoritative',async()=>{const x=await runSafeProviderProbe({envVar:'OPENROUTER_API_KEY',sealedCredential:sealed,fetchImpl:async()=>({ok:false,status:401,json:async()=>({secret:'body'})})});assert.equal(x.healthy,false);assert.equal(x.status,401);assert.equal(x.bodyPersisted,false);assert.equal(x.authorityGranted,false);});
