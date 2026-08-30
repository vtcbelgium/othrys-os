import test from 'node:test';import assert from 'node:assert/strict';import {urlNormalize} from '../src/index.mjs';
test('lowercase/default port/root slash/fragment',()=>assert.equal(urlNormalize('HTTP://Example.COM:80/#x'),'http://example.com'));
test('https default port',()=>assert.equal(urlNormalize('https://EXAMPLE.com:443/a'),'https://example.com/a'));
test('sort query key then value duplicates',()=>assert.equal(urlNormalize('https://e.com/?b=2&a=z&a=a'),'https://e.com/?a=a&a=z&b=2'));
test('root slash kept with query',()=>assert.equal(urlNormalize('https://e.com/?x=1'),'https://e.com/?x=1'));
test('non-root trailing slash preserved',()=>assert.equal(urlNormalize('https://e.com/a/'),'https://e.com/a/'));
test('reject ftp',()=>assert.throws(()=>urlNormalize('ftp://e.com/a'),TypeError));
test('reject relative',()=>assert.throws(()=>urlNormalize('/a'),TypeError));
