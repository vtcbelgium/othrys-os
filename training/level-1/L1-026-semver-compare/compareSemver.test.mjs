import test from 'node:test';import assert from 'node:assert/strict';import {compareSemver} from './compareSemver.mjs';
test('core',()=>{assert.equal(compareSemver('1.2.3','1.2.4'),-1);assert.equal(compareSemver('2.0.0','1.9.9'),1)});
test('build ignored',()=>assert.equal(compareSemver('1.0.0+a','1.0.0+b'),0));
test('release above prerelease',()=>assert.equal(compareSemver('1.0.0','1.0.0-alpha'),1));
test('official chain',()=>{const v=['1.0.0-alpha','1.0.0-alpha.1','1.0.0-alpha.beta','1.0.0-beta','1.0.0-beta.2','1.0.0-beta.11','1.0.0-rc.1','1.0.0'];for(let i=0;i<v.length-1;i++) assert.equal(compareSemver(v[i],v[i+1]),-1)});
test('numeric vs lexical',()=>assert.equal(compareSemver('1.0.0-1','1.0.0-a'),-1));
test('invalid leading zero',()=>assert.throws(()=>compareSemver('1.01.0','1.1.0'),RangeError));
test('invalid prerelease zero',()=>assert.throws(()=>compareSemver('1.0.0-01','1.0.0-1'),RangeError));
test('type',()=>assert.throws(()=>compareSemver(1,'1.0.0'),TypeError));
