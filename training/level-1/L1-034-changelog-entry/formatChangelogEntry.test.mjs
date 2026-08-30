import test from 'node:test';
import assert from 'node:assert/strict';
import {formatChangelogEntry} from './formatChangelogEntry.mjs';

test('basic',()=>assert.equal(formatChangelogEntry({type:'fixed',summary:'Handle timeout'}),'- **fixed:** Handle timeout'));
test('scope breaking issue',()=>assert.equal(formatChangelogEntry({type:'fixed',scope:' api ',summary:' Handle   timeout ',breaking:true,issue:123}),'- **fixed(api):** Handle timeout [BREAKING] (#123)'));
test('string issue',()=>assert.equal(formatChangelogEntry({type:'added',summary:'X',issue:'ABC-7'}),'- **added:** X (#ABC-7)'));
test('newline collapsed',()=>assert.equal(formatChangelogEntry({type:'changed',summary:'A\nB'}),'- **changed:** A B'));
test('bad type',()=>assert.throws(()=>formatChangelogEntry({type:'feat',summary:'X'}),RangeError));
test('empty summary',()=>assert.throws(()=>formatChangelogEntry({type:'fixed',summary:'   '}),RangeError));
test('unknown key',()=>assert.throws(()=>formatChangelogEntry({type:'fixed',summary:'X',extra:1}),RangeError));
test('no mutation',()=>{const x={type:'fixed',scope:' a ',summary:' x '};formatChangelogEntry(x);assert.deepEqual(x,{type:'fixed',scope:' a ',summary:' x '})});
