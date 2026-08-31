import test from 'node:test'; import assert from 'node:assert/strict';
import {buildSitemapXml} from '../src/index.mjs';
test('builds deterministic sitemap',()=>{const x=buildSitemapXml('https://example.com/',['/','/a','/a']);assert.equal(x,'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com/</loc></url>\n  <url><loc>https://example.com/a</loc></url>\n</urlset>\n');});
test('escapes XML-sensitive query content',()=>{const x=buildSitemapXml('https://example.com/',['/search?q=a&x=b']);assert.match(x,/q=a&amp;x=b/);});
test('preserves first path order while deduping',()=>{const x=buildSitemapXml('https://example.com/',['/b','/a','/b']);assert.ok(x.indexOf('/b</loc>')<x.indexOf('/a</loc>'));});
test('rejects invalid base and paths',()=>{for(const b of ['x','ftp://example.com/','https://example.com/base'])assert.throws(()=>buildSitemapXml(b,[]),/INVALID_BASE_URL/);assert.throws(()=>buildSitemapXml('https://example.com/',['relative']),/INVALID_PATHS/);});
