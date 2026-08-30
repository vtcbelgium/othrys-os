import test from 'node:test';import assert from 'node:assert/strict';import {normalizePortablePath} from '../src/index.mjs';
test('windows drive',()=>assert.equal(normalizePortablePath('C:\\a\\..\\b'),'c:/b'));
test('relative dots',()=>assert.equal(normalizePortablePath('a/./b/../c'),'a/c'));
test('leading relative dotdot',()=>assert.equal(normalizePortablePath('../../a'),'../../a'));
test('absolute cannot escape',()=>assert.equal(normalizePortablePath('/../../a'),'/a'));
test('unc',()=>assert.equal(normalizePortablePath('\\\\server\\share\\a\\..'),'//server/share'));
test('collapse and strip',()=>assert.equal(normalizePortablePath('a///b/'),'a/b'));
test('empty resolved relative',()=>assert.equal(normalizePortablePath('a/..'),'.'));
test('bad',()=>assert.throws(()=>normalizePortablePath(''),TypeError));
