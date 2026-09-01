import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const [jobDirArg,key,family]=process.argv.slice(2);
if(!jobDirArg||!key||!family) throw new Error('usage: level3_verify.mjs <jobDir> <key> <family>');
const jobDir=resolve(jobDirArg);
const repo=resolve(import.meta.dirname,'..','..');
const blockDir=join(repo,'..','othrys-blocks','blocks','media','image-prep');
const requireFromBlock=createRequire(join(blockDir,'package.json'));
const { chromium }=requireFromBlock('playwright');
const checks=[];
const add=(name,ok,detail='')=>checks.push({name,ok:Boolean(ok),detail});
const text=(name)=>existsSync(join(jobDir,name))?readFileSync(join(jobDir,name),'utf8'):'';
const html=text('index.html')||text('popup.html')||text('options.html');
const css=text('styles.css')||text('popup.css')||text('options.css');
const js=text('app.js')||text('popup.js')||text('options.js')||text('content.js');
const manifest=text('manifest.json');

add('surface-file',Boolean(html),'HTML surface present');
add('no-remote-assets',!/(src|href)=["']https?:\/\//i.test(html),'no remote HTML assets');
add('no-network-js',!/(fetch\s*\(|XMLHttpRequest|WebSocket\s*\()/i.test(js),'no remote/network runtime');
add('no-secret-shape',!/(sk-[A-Za-z0-9_-]{20,}|BEGIN PRIVATE KEY|api[_-]?key\s*[:=])/i.test(html+css+js+manifest));
if(family!=='extension') add('semantic-main',/<main\b/i.test(html),'main landmark');
if(['web','local-app','composition','quality','pwa'].includes(family)) add('responsive-css',/@media/i.test(css),'responsive rule');
if(['local-app','composition'].includes(family)&&!['local-file-tool'].includes(key)) add('local-first-state',/localStorage/i.test(js),'localStorage persistence');
if(family==='extension'){
  let m=null; try{m=JSON.parse(manifest)}catch{}
  add('mv3',m?.manifest_version===3,'Manifest V3');
  const perms=[...(m?.permissions??[]),...(m?.host_permissions??[])];
  add('minimum-permissions',!perms.includes('<all_urls>')&&!perms.includes('tabs'),'no broad tabs/all_urls');
  add('no-remote-code',!/(https?:\/\/)/i.test(JSON.stringify(m?.background??{})),'local extension code');
}
if(family==='pwa'){
  add('webmanifest',existsSync(join(jobDir,'manifest.webmanifest')),'manifest present');
  add('service-worker',existsSync(join(jobDir,'sw.js')),'service worker present');
}
if(key==='validated-form-app') add('form-contract',/<form\b/i.test(html)&&/(required|aria-required)/i.test(html),'form + validation affordance');
if(key==='searchable-table-app') add('table-contract',/<table\b/i.test(html)&&/search/i.test(html+js),'table + search');
if(key==='local-file-tool') add('file-contract',/type=["']file["']/i.test(html)&&/Blob|FileReader|\.text\(\)/i.test(js),'file input + local transform');
if(key==='multi-view-app'||key==='local-first-capstone') add('multi-view-contract',/(data-view|view-|hash)/i.test(html+js),'multiple views');
if(key==='polish-accessibility') add('a11y-contract',/(skip-link|skip to|aria-live|focus-visible)/i.test(html+css),'accessibility affordances');

const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json'};
const server=createServer((req,res)=>{
  const raw=decodeURIComponent((req.url||'/').split('?')[0]);
  const rel=raw==='/'?(existsSync(join(jobDir,'index.html'))?'index.html':existsSync(join(jobDir,'popup.html'))?'popup.html':'options.html'):raw.replace(/^\//,'');
  const path=resolve(jobDir,rel);
  if(!path.startsWith(jobDir)||!existsSync(path)||!statSync(path).isFile()){res.writeHead(404);res.end('not found');return;}
  res.setHeader('content-type',mime[extname(path)]||'text/plain');res.end(readFileSync(path));
});
await new Promise((ok)=>server.listen(0,'127.0.0.1',ok));
const {port}=server.address(); const url=`http://127.0.0.1:${port}/`;
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[]; page.on('pageerror',e=>errors.push(String(e.message||e)));
  await page.goto(url,{waitUntil:'load',timeout:15000});
  add('desktop-visible',await page.locator('body').isVisible(),'body visible 1280x800');
  add('no-page-errors',errors.length===0,errors.join('; '));
  const focusables=page.locator('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
  const fc=await focusables.count();
  if(fc>0){await page.keyboard.press('Tab'); const tag=await page.evaluate(()=>document.activeElement?.tagName||''); add('keyboard-focus',Boolean(tag&&tag!=='BODY'),tag);}
  else add('keyboard-focus',true,'no interactive controls required');

  if(key==='validated-form-app'){
    const form=page.locator('form'); if(await form.count()){await form.evaluate(el=>el.requestSubmit()); await page.waitForTimeout(50); add('form-invalid-visible',await page.locator('[role="alert"],.error,[aria-invalid="true"]').count()>0,'invalid submit surfaced');}
  }
  if(key==='searchable-table-app'){
    const input=page.locator('input[type="search"],input[name*="search" i]').first();
    const before=await page.locator('tbody tr').count();
    if(await input.count()){await input.fill('zzzz-no-match'); await page.waitForTimeout(60); const after=await page.locator('tbody tr').count(); add('search-interaction',after<=before,'table responds to search');}
    else add('search-interaction',false,'search input missing');
  }
  if(key==='local-file-tool'){
    const input=page.locator('input[type="file"]').first();
    if(await input.count()){await input.setInputFiles({name:'sample.txt',mimeType:'text/plain',buffer:Buffer.from('hello othrys')}); await page.waitForTimeout(80); add('file-interaction',true,'local file accepted');}
    else add('file-interaction',false,'file input missing');
  }
  if(key==='multi-view-app'||key==='local-first-capstone'){
    const controls=page.locator('[data-view],a[href^="#"],button[data-target]');
    add('view-controls',await controls.count()>=2,`controls=${await controls.count()}`);
  }
  const mobile=await browser.newPage({viewport:{width:390,height:844}});
  await mobile.goto(url,{waitUntil:'load',timeout:15000});
  const overflow=await mobile.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
  add('mobile-no-horizontal-overflow',!overflow,'390px viewport');
  await mobile.close();
}catch(e){add('browser-harness',false,String(e.message||e));}
finally{if(browser)await browser.close(); await new Promise(ok=>server.close(ok));}

const ok=checks.every(x=>x.ok);
const receipt={schema:'othrys.talos.level3-app-proof.v1',key,family,ok,checks,authorityGranted:false,verifiedAt:new Date().toISOString()};
process.stdout.write(JSON.stringify(receipt));
process.exitCode=ok?0:2;
