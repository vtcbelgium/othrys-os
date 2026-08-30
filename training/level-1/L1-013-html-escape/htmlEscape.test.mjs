import test from 'node:test';import assert from 'node:assert/strict';import {htmlEscape,htmlUnescape} from './htmlEscape.mjs';
test('escape five',()=>assert.equal(htmlEscape(`&<>"'`),'&amp;&lt;&gt;&quot;&#39;'));
test('unescape five',()=>assert.equal(htmlUnescape('&amp;&lt;&gt;&quot;&#39;'),`&<>"'`));
test('hex apostrophe',()=>assert.equal(htmlUnescape('&#x27;'),"'"));
test('unknown preserved',()=>assert.equal(htmlUnescape('&copy;'),'&copy;'));
test('nonrecursive unescape',()=>assert.equal(htmlUnescape('&amp;lt;'),'&lt;'));
test('null undefined empty',()=>{assert.equal(htmlEscape(null),'');assert.equal(htmlUnescape(undefined),'')});
test('roundtrip',()=>{const s='a & <b> "x"';assert.equal(htmlUnescape(htmlEscape(s)),s)});
