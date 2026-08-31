import test from 'node:test'; import assert from 'node:assert/strict';
import {isSlugLike,slugDisplayLabel,chooseDisplayLabel} from '../src/index.mjs';
test('detects lowercase hyphen slugs only',()=>{assert.equal(isSlugLike('gi-joe-1984-baroness'),true);assert.equal(isSlugLike('Baroness'),false);assert.equal(isSlugLike('one'),false);});
test('drops prefix through release year and title cases',()=>{assert.equal(slugDisplayLabel('gi-joe-1984-baroness'),'Baroness');assert.equal(slugDisplayLabel('1984-snake-eyes'),'Snake Eyes');});
test('generic slug humanization works',()=>{assert.equal(slugDisplayLabel('hello-world'),'Hello World');assert.equal(slugDisplayLabel(''), 'Unknown');assert.equal(slugDisplayLabel('',{fallback:'N/A'}),'N/A');});
test('real name wins, slug-like name falls back to id',()=>{assert.equal(chooseDisplayLabel('Baroness','gi-joe-1984-baroness'),'Baroness');assert.equal(chooseDisplayLabel('gi-joe-1984-baroness','1984-baroness'),'Baroness');});
