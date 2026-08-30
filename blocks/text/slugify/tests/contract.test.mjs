import test from 'node:test';import assert from 'node:assert/strict';import {slugify} from '../src/index.mjs';
const cases=[['Hello World','hello-world'],['Caf\u00e9 & Th\u00e9','cafe-and-the'],['  A---B  ','a-b'],['',''],[123,'123'],['Fish & Chips','fish-and-chips'],['___','']];
for(const [input,expected] of cases)test(`slugify ${JSON.stringify(input)}`,()=>assert.equal(slugify(input),expected));

