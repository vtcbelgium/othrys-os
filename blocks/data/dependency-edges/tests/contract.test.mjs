import test from 'node:test'; import assert from 'node:assert/strict';
import {buildDependencyEdges} from '../src/index.mjs';
const nodes=[{id:'a',status:'ok',dependencies:['b','missing']},{id:'b',status:'warn'},{id:'c',visibility:'hidden',dependencies:['a']}];
test('builds root and visible dependency edges',()=>{assert.deepEqual(buildDependencyEdges(nodes),[{id:'root:a',source:'core',target:'a',kind:'root',status:'ok'},{id:'dep:a:b',source:'a',target:'b',kind:'dependency',status:'ok'},{id:'root:b',source:'core',target:'b',kind:'root',status:'warn'}]);});
test('custom root id works',()=>{assert.equal(buildDependencyEdges([{id:'x'}],{rootId:'hub'})[0].source,'hub');});
test('hidden nodes and missing deps do not leak edges',()=>{const x=buildDependencyEdges(nodes);assert.equal(x.some(e=>e.target==='c'||e.target==='missing'),false);});
test('duplicate ids and bad dependencies fail closed',()=>{assert.throws(()=>buildDependencyEdges([{id:'x'},{id:'x'}]),/INVALID_NODE/);assert.throws(()=>buildDependencyEdges([{id:'x',dependencies:'y'}]),/INVALID_NODE/);});
test('does not mutate caller input',()=>{const n=[{id:'x',dependencies:[]}];buildDependencyEdges(n);assert.deepEqual(n,[{id:'x',dependencies:[]}]);});
