import test from 'node:test';import assert from 'node:assert/strict';import {buildUtmUrl} from '../src/index.mjs';
test('basic',()=>assert.equal(buildUtmUrl('https://e.com/a',{utm_source:'x',utm_medium:'email',utm_campaign:'launch'}),'https://e.com/a?utm_campaign=launch&utm_medium=email&utm_source=x'));
test('preserve unrelated replace utm fragment',()=>assert.equal(buildUtmUrl('https://e.com/a?z=9&utm_source=old#frag',{utm_source:'new',utm_medium:'m',utm_campaign:'c'}),'https://e.com/a?utm_campaign=c&utm_medium=m&utm_source=new&z=9'));
test('optional trim',()=>assert.equal(buildUtmUrl('https://e.com',{utm_source:' x ',utm_medium:' m ',utm_campaign:' c ',utm_term:' t '}),'https://e.com/?utm_campaign=c&utm_medium=m&utm_source=x&utm_term=t'));
test('blank optional removes existing',()=>assert.equal(buildUtmUrl('https://e.com/?utm_term=old',{utm_source:'x',utm_medium:'m',utm_campaign:'c',utm_term:' '}),'https://e.com/?utm_campaign=c&utm_medium=m&utm_source=x'));
test('required blank',()=>assert.throws(()=>buildUtmUrl('https://e.com',{utm_source:'',utm_medium:'m',utm_campaign:'c'}),RangeError));
test('unknown field',()=>assert.throws(()=>buildUtmUrl('https://e.com',{utm_source:'x',utm_medium:'m',utm_campaign:'c',foo:'x'}),RangeError));
test('reject ftp',()=>assert.throws(()=>buildUtmUrl('ftp://e.com',{utm_source:'x',utm_medium:'m',utm_campaign:'c'}),TypeError));
