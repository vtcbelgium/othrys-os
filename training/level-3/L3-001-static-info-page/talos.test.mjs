import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..','..','..');
const html=readFileSync(resolve(here,'index.html'),'utf8');
const css=readFileSync(resolve(here,'styles.css'),'utf8');

test('static contract is semantic, local and responsive',()=>{
  assert.match(html,/<!DOCTYPE html>/i);
  assert.match(html,/<meta name="viewport"/i);
  assert.equal((html.match(/<h1\b/gi)||[]).length,1);
  assert.ok((html.match(/<section\b/gi)||[]).length>=3);
  assert.ok((html.match(/<nav\b/gi)||[]).length>=1);
  assert.match(html,/LEVEL 3 ACTIVE/);
  assert.doesNotMatch(html,/<script\b|<form\b|https?:\/\/|src=/i);
  assert.match(css,/:focus-visible/);
  assert.match(css,/@media\s*\(max-width:\s*700px\)/);
  assert.doesNotMatch(css,/@import|url\s*\(/i);
});

async function withBrowser(fn){
  const requireFromBlocks=createRequire(resolve(root,'..','othrys-blocks','packages','media-image-prep','package.json'));
  const {chromium}=requireFromBlocks('playwright');
  const server=createServer((req,res)=>{
    res.statusCode=200;
    res.setHeader('content-type',req.url?.endsWith('.css')?'text/css':'text/html');
    res.end(req.url?.endsWith('.css')?css:html);
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const port=server.address().port;
  const browser=await chromium.launch({headless:true});
  try { await fn(browser,`http://127.0.0.1:${port}/`); }
  finally { await browser.close(); await new Promise(r=>server.close(r)); }
}
test('Talos desktop visible proof',async()=>withBrowser(async(browser,url)=>{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(url,{waitUntil:'load'});
  assert.equal(await page.locator('h1').textContent(),'Othrys Level 3 Small Applications');
  assert.equal(await page.locator('nav a').count(),3);
  assert.equal(await page.locator('section').count(),3);
  assert.equal(await page.locator('.card').count(),3);
  assert.equal(await page.locator('.badge').isVisible(),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);
}));

test('Talos mobile and keyboard proof',async()=>withBrowser(async(browser,url)=>{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(url,{waitUntil:'load'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('.site-nav').evaluate(el=>getComputedStyle(el).flexDirection),'column');
  await page.keyboard.press('Tab');
  const focused=await page.evaluate(()=>({tag:document.activeElement?.tagName,outline:getComputedStyle(document.activeElement).outlineStyle}));
  assert.equal(focused.tag,'A');
  assert.notEqual(focused.outline,'none');
  assert.equal(await page.locator('.badge').isVisible(),true);
}));
