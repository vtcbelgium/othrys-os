import test from 'node:test';
import assert from 'node:assert/strict';
import { cosineSimilarity, rankSemanticMatches, ollamaEmbed } from './local_semantic_search.mjs';

test('semantic ranking is deterministic',()=>{assert.equal(cosineSimilarity([1,0],[1,0]),1);const r=rankSemanticMatches([1,0],[{id:'b',vector:[.5,.5]},{id:'a',vector:[1,0]}]);assert.deepEqual(r.map(x=>x.id),['a','b']);});
test('Ollama adapter is local, zero-paid and authority-free',async()=>{const fetchImpl=async()=>({ok:true,json:async()=>({embeddings:[[1,2],[3,4]]})});const r=await ollamaEmbed(['a','b'],{fetchImpl});assert.equal(r.local,true);assert.equal(r.paidUsage,false);assert.equal(r.authorityGranted,false);assert.deepEqual(r.vectors,[[1,2],[3,4]]);});
test('bad provider shape fails closed',async()=>{const fetchImpl=async()=>({ok:true,json:async()=>({embeddings:[]})});await assert.rejects(()=>ollamaEmbed(['x'],{fetchImpl}),/EMBED_PROVIDER_SHAPE_INVALID/);});