from __future__ import annotations
import json, subprocess, sys, time
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
MANIFEST=ROOT/'docs/training/TRAINING_MANIFEST.json'
PREP=ROOT/'docs/training/LEVEL_3_PREP.json'
WORKER=ROOT/'runtime/workers/legion_qwen_worker_v01.py'
VERIFY=ROOT/'tools/training/level3_verify.mjs'
TRAIN=ROOT/'training/level-3'
DENY=['.git','.othrys','missions','blocks','runtime','docs','tools','admissions','books','contracts','inventory','logs','packages','qa','quarry','receipts','scratch','temp']
UTF8='utf-8'

def read_json(p:Path): return json.loads(p.read_text(encoding=UTF8))
def write_json(p:Path,obj): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n',encoding=UTF8)
def slug(job): return f"{job['id']}-{job['key']}"
def rel(p:Path): return p.relative_to(ROOT).as_posix()
def run(cmd,timeout=180): return subprocess.run(cmd,cwd=ROOT,text=True,capture_output=True,timeout=timeout)

def common_css():
 return ''':root{font-family:Inter,system-ui,sans-serif;color:#f4f5f7;background:#101217;--panel:#191d26;--line:#303745;--accent:#8aa2ff}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#101217;color:#f4f5f7}header,main,footer{width:min(1080px,calc(100% - 32px));margin:auto}header{padding:22px 0;display:flex;gap:14px;align-items:center;justify-content:space-between}nav{display:flex;gap:8px;flex-wrap:wrap}a,button,input,select,textarea{font:inherit}a,button{border-radius:10px}button{cursor:pointer;border:1px solid var(--line);background:#222938;color:#fff;padding:9px 13px}button:hover{border-color:var(--accent)}a{color:#b9c6ff}.panel,.card,form{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px}main{display:grid;gap:16px;padding:18px 0 40px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}input,select,textarea{background:#0d1016;color:#fff;border:1px solid var(--line);border-radius:9px;padding:9px;max-width:100%}textarea{width:100%;min-height:120px}.muted{color:#a7b0c0}.error,[role=alert]{color:#ffaaaa}.success{color:#aaf0bd}.hidden{display:none!important}:focus-visible{outline:3px solid #b9c6ff;outline-offset:2px}@media(max-width:700px){header{align-items:flex-start;flex-direction:column}.grid{grid-template-columns:1fr}main{padding-top:8px}.row>*{max-width:100%}}'''

def page(title,body,script='app.js',extra_head=''):
 s=f'<script defer src="{script}"></script>' if script else ''
 return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><link rel="stylesheet" href="styles.css">{extra_head}{s}</head><body><header><strong>OTHRYS Ã‚Â· Level 3</strong><nav><a href="#main">Main</a><a href="#about">About</a></nav></header><main id="main">{body}</main><footer id="about"><p class="muted">Local-first training surface Ã‚Â· no remote services</p></footer></body></html>'''
def fallback_files(job):
 k=job['key']; title=job['title']; css=common_css(); files={}
 if k=='responsive-landing':
  body='''<section class="panel"><p class="muted">Small Applications</p><h1>Build small. Prove everything.</h1><p>Complete local-first applications composed under OTHRYS training laws.</p><p class="row"><a href="#features"><button>Explore capabilities</button></a><a href="#principles">Read principles</a></p></section><section id="features" class="grid"><article class="card"><h2>Focused</h2><p>One clear purpose and bounded scope.</p></article><article class="card"><h2>Local-first</h2><p>No remote dependency required.</p></article><article class="card"><h2>Verified</h2><p>Visible behavior is independently checked.</p></article></section><section id="principles" class="panel"><h2>Principles</h2><p>Responsive, accessible and deterministic by default.</p></section>'''
  files={'index.html':page(title,body,script=''),'styles.css':css}
 elif k=='validated-form-app':
  body='''<section class="panel"><h1>Local profile form</h1><form id="profile" novalidate><label>Name <input id="name" required aria-required="true"></label><label>Email <input id="email" type="email" required aria-required="true"></label><button>Validate</button><p id="msg" role="alert"></p></form></section>'''
  js="""const f=document.querySelector('#profile'),m=document.querySelector('#msg');f.addEventListener('submit',e=>{e.preventDefault();const n=document.querySelector('#name'),x=document.querySelector('#email');const ok=n.value.trim()&&x.validity.valid&&x.value.trim();n.setAttribute('aria-invalid',String(!n.value.trim()));x.setAttribute('aria-invalid',String(!x.validity.valid||!x.value.trim()));m.className=ok?'success':'error';m.textContent=ok?'Validated locally.':'Complete a name and valid email.';});"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='searchable-table-app':
  body='''<section class="panel"><h1>Searchable records</h1><div class="row"><label>Search <input id="search" type="search"></label><label>Sort <select id="sort"><option value="name">Name</option><option value="score">Score</option></select></label></div><table><thead><tr><th>Name</th><th>Score</th></tr></thead><tbody id="rows"></tbody></table></section>'''
  js="""const data=[{name:'Atlas',score:9},{name:'Talos',score:10},{name:'Rhea',score:8},{name:'Kronos',score:7}];const q=document.querySelector('#search'),s=document.querySelector('#sort'),b=document.querySelector('#rows');function draw(){const term=q.value.toLowerCase();const rows=data.filter(x=>x.name.toLowerCase().includes(term)).sort((a,c)=>s.value==='score'?c.score-a.score:a.name.localeCompare(c.name));b.innerHTML=rows.map(x=>`<tr><td>${x.name}</td><td>${x.score}</td></tr>`).join('');}q.addEventListener('input',draw);s.addEventListener('change',draw);draw();"""
  files={'index.html':page(title,body),'styles.css':css+'table{width:100%;border-collapse:collapse;margin-top:16px}th,td{text-align:left;border-bottom:1px solid var(--line);padding:10px}','app.js':js}
 elif k=='settings-panel-app':
  body='''<section class="panel"><h1>Settings</h1><form id="settings"><label>Theme <select id="theme"><option>dark</option><option>light</option></select></label><label>Density <select id="density"><option>comfortable</option><option>compact</option></select></label><button>Save</button><button type="button" id="reset">Reset</button><p id="msg" aria-live="polite"></p></form></section>'''
  js="""const KEY='l3-settings';const f=document.querySelector('#settings'),t=document.querySelector('#theme'),d=document.querySelector('#density'),m=document.querySelector('#msg');const load=()=>{const x=JSON.parse(localStorage.getItem(KEY)||'{}');t.value=x.theme||'dark';d.value=x.density||'comfortable'};f.addEventListener('submit',e=>{e.preventDefault();localStorage.setItem(KEY,JSON.stringify({theme:t.value,density:d.value}));m.textContent='Saved locally.'});document.querySelector('#reset').onclick=()=>{localStorage.removeItem(KEY);load();m.textContent='Reset.'};load();"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='todo-dashboard':
  body='''<section class="panel"><h1>Todo dashboard</h1><form id="add" class="row"><input id="task" required aria-label="Task"><button>Add task</button></form><ul id="list"></ul><p id="summary" class="muted"></p></section>'''
  js="""const KEY='l3-todos';let items=JSON.parse(localStorage.getItem(KEY)||'[]');const list=document.querySelector('#list'),sum=document.querySelector('#summary');function save(){localStorage.setItem(KEY,JSON.stringify(items));draw()}function draw(){list.innerHTML=items.map((x,i)=>`<li><label><input data-i='${i}' type='checkbox' ${x.done?'checked':''}> ${x.text}</label> <button data-r='${i}'>Remove</button></li>`).join('');sum.textContent=`${items.filter(x=>x.done).length}/${items.length} complete`;list.querySelectorAll('[data-i]').forEach(x=>x.onchange=()=>{items[x.dataset.i].done=x.checked;save()});list.querySelectorAll('[data-r]').forEach(x=>x.onclick=()=>{items.splice(x.dataset.r,1);save()})}document.querySelector('#add').onsubmit=e=>{e.preventDefault();const t=document.querySelector('#task');if(t.value.trim()){items.push({text:t.value.trim(),done:false});t.value='';save()}};draw();"""
  files={'index.html':page(title,body),'styles.css':css+'li{margin:9px 0}','app.js':js}
 elif k=='habit-dashboard':
  body='''<section class="panel"><h1>Habit dashboard</h1><form id="add" class="row"><input id="habit" required aria-label="Habit"><button>Add habit</button></form><div id="habits" class="grid"></div></section>'''
  js="""const KEY='l3-habits';let h=JSON.parse(localStorage.getItem(KEY)||'[]');const box=document.querySelector('#habits');function save(){localStorage.setItem(KEY,JSON.stringify(h));draw()}function draw(){box.innerHTML=h.map((x,i)=>`<article class='card'><h2>${x.name}</h2><p>Streak: ${x.streak}</p><button data-c='${i}'>Check in</button></article>`).join('');box.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{h[b.dataset.c].streak++;save()})}document.querySelector('#add').onsubmit=e=>{e.preventDefault();const x=document.querySelector('#habit');if(x.value.trim()){h.push({name:x.value.trim(),streak:0});x.value='';save()}};draw();"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='time-tracker-app':
  body='''<section class="panel"><h1>Time tracker</h1><div class="row"><button id="start">Start</button><button id="stop">Stop</button></div><p id="state"></p><ol id="entries"></ol></section>'''
  js="""const KEY='l3-time';let x=JSON.parse(localStorage.getItem(KEY)||'{\"active\":null,\"entries\":[]}');const s=document.querySelector('#state'),e=document.querySelector('#entries');function save(){localStorage.setItem(KEY,JSON.stringify(x));draw()}function draw(){s.textContent=x.active?'Timer running':'Timer stopped';e.innerHTML=x.entries.map(v=>`<li>${v.start} Ã¢â€ â€™ ${v.stop}</li>`).join('')}document.querySelector('#start').onclick=()=>{if(!x.active){x.active=new Date().toISOString();save()}};document.querySelector('#stop').onclick=()=>{if(x.active){x.entries.unshift({start:x.active,stop:new Date().toISOString()});x.active=null;save()}};draw();"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='expense-dashboard':
  body='''<section class="panel"><h1>Expense dashboard</h1><form id="add" class="row"><input id="label" required placeholder="Label"><input id="amount" required type="number" min="0" step="0.01" placeholder="Amount"><select id="cat"><option>General</option><option>Travel</option><option>Food</option></select><button>Add</button></form><p id="total"></p><ul id="items"></ul></section>'''
  js="""const KEY='l3-expenses';let a=JSON.parse(localStorage.getItem(KEY)||'[]');const list=document.querySelector('#items'),total=document.querySelector('#total');function save(){localStorage.setItem(KEY,JSON.stringify(a));draw()}function draw(){list.innerHTML=a.map(x=>`<li>${x.label} Ã‚Â· ${x.cat} Ã‚Â· Ã¢â€šÂ¬${x.amount.toFixed(2)}</li>`).join('');total.textContent=`Total Ã¢â€šÂ¬${a.reduce((s,x)=>s+x.amount,0).toFixed(2)}`};document.querySelector('#add').onsubmit=e=>{e.preventDefault();const l=document.querySelector('#label'),n=document.querySelector('#amount'),c=document.querySelector('#cat');if(l.value.trim()&&Number(n.value)>=0){a.push({label:l.value.trim(),amount:Number(n.value),cat:c.value});save();e.target.reset()}};draw();"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='notes-app':
  body='''<section class="panel"><h1>Notes</h1><div class="row"><input id="search" type="search" placeholder="Search notes"><input id="tag" placeholder="Filter tag"></div><form id="add"><input id="title" required placeholder="Title"><textarea id="body" required placeholder="Note"></textarea><input id="tags" placeholder="tags,comma,separated"><button>Add note</button></form><div id="notes" class="grid"></div></section>'''
  js="""const KEY='l3-notes';let notes=JSON.parse(localStorage.getItem(KEY)||'[]');const box=document.querySelector('#notes'),q=document.querySelector('#search'),tg=document.querySelector('#tag');function save(){localStorage.setItem(KEY,JSON.stringify(notes));draw()}function draw(){const s=q.value.toLowerCase(),t=tg.value.toLowerCase();box.innerHTML=notes.filter(n=>(n.title+' '+n.body).toLowerCase().includes(s)&&(!t||n.tags.includes(t))).map(n=>`<article class='card'><h2>${n.title}</h2><p>${n.body}</p><small>${n.tags.join(', ')}</small></article>`).join('')}q.oninput=tg.oninput=draw;document.querySelector('#add').onsubmit=e=>{e.preventDefault();notes.unshift({title:document.querySelector('#title').value.trim(),body:document.querySelector('#body').value.trim(),tags:document.querySelector('#tags').value.toLowerCase().split(',').map(x=>x.trim()).filter(Boolean)});save();e.target.reset()};draw();"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='multi-list-app':
  body='''<section class="panel"><h1>Multi-list manager</h1><form id="newList" class="row"><input id="listName" required placeholder="List name"><button>Create list</button></form><div id="lists" class="grid"></div></section>'''
  js="""const KEY='l3-lists';let lists=JSON.parse(localStorage.getItem(KEY)||'[]');const box=document.querySelector('#lists');function save(){localStorage.setItem(KEY,JSON.stringify(lists));draw()}function draw(){box.innerHTML=lists.map((l,i)=>`<article class='card'><h2>${l.name}</h2><form data-add='${i}'><input required placeholder='Item'><button>Add</button></form><ul>${l.items.map(x=>`<li>${x}</li>`).join('')}</ul><button data-del='${i}'>Delete list</button></article>`).join('');box.querySelectorAll('[data-add]').forEach(f=>f.onsubmit=e=>{e.preventDefault();lists[f.dataset.add].items.push(f.elements[0].value.trim());save()});box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{lists.splice(b.dataset.del,1);save()})}document.querySelector('#newList').onsubmit=e=>{e.preventDefault();const n=document.querySelector('#listName');if(n.value.trim()){lists.push({name:n.value.trim(),items:[]});n.value='';save()}};draw();"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='import-export-console':
  body='''<section class="panel"><h1>Import / export console</h1><textarea id="data" aria-label="JSON data"></textarea><div class="row"><button id="export">Export current state</button><button id="import">Import JSON</button><button id="seed">Seed example</button></div><p id="msg" role="alert"></p></section>'''
  js="""const KEY='l3-transfer';const d=document.querySelector('#data'),m=document.querySelector('#msg');document.querySelector('#seed').onclick=()=>{localStorage.setItem(KEY,JSON.stringify({items:['alpha','beta']}));m.textContent='Seeded.'};document.querySelector('#export').onclick=()=>{d.value=JSON.stringify(JSON.parse(localStorage.getItem(KEY)||'{}'),null,2);m.textContent='Exported locally.'};document.querySelector('#import').onclick=()=>{try{const x=JSON.parse(d.value);localStorage.setItem(KEY,JSON.stringify(x));m.textContent='Imported.'}catch{m.textContent='Invalid JSON.'}};"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='backup-restore-console':
  body='''<section class="panel"><h1>Backup / restore</h1><textarea id="backup" aria-label="Backup envelope"></textarea><div class="row"><button id="make">Create backup</button><button id="restore">Restore verified backup</button></div><p id="msg" role="alert"></p></section>'''
  js="""const KEY='l3-backup-source';const b=document.querySelector('#backup'),m=document.querySelector('#msg');function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}document.querySelector('#make').onclick=()=>{const data=localStorage.getItem(KEY)||'{}';b.value=JSON.stringify({data,hash:hash(data)},null,2);m.textContent='Backup created.'};document.querySelector('#restore').onclick=()=>{try{const x=JSON.parse(b.value);if(hash(x.data)!==x.hash)throw Error();JSON.parse(x.data);localStorage.setItem(KEY,x.data);m.textContent='Backup verified and restored.'}catch{m.textContent='Backup verification failed.'}};"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='activity-dashboard':
  body='''<section class="panel"><h1>Activity dashboard</h1><form id="add" class="row"><input id="event" required placeholder="Activity"><button>Record</button></form><ol id="feed"></ol></section>'''
  js="""const KEY='l3-activity';let a=JSON.parse(localStorage.getItem(KEY)||'[]');const f=document.querySelector('#feed');function save(){a=a.slice(0,20);localStorage.setItem(KEY,JSON.stringify(a));draw()}function draw(){f.innerHTML=a.map(x=>`<li><strong>#${x.seq}</strong> ${x.text}</li>`).join('')}document.querySelector('#add').onsubmit=e=>{e.preventDefault();const x=document.querySelector('#event');const seq=(a[0]?.seq||0)+1;a.unshift({seq,text:x.value.trim()});x.value='';save()};draw();"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='preference-profile-app':
  body='''<section class="panel"><h1>Preference profile</h1><form id="prefs"><label>Display name <input id="display" required></label><label>Language <select id="language"><option>English</option><option>Dutch</option><option>French</option></select></label><label><input id="reduced" type="checkbox"> Prefer reduced motion</label><button>Save profile</button><button type="button" id="reset">Reset</button><p id="msg" aria-live="polite"></p></form></section>'''
  js="""const KEY='l3-profile';const f=document.querySelector('#prefs'),n=document.querySelector('#display'),l=document.querySelector('#language'),r=document.querySelector('#reduced'),m=document.querySelector('#msg');function load(){const x=JSON.parse(localStorage.getItem(KEY)||'{}');n.value=x.display||'';l.value=x.language||'English';r.checked=!!x.reduced}f.onsubmit=e=>{e.preventDefault();localStorage.setItem(KEY,JSON.stringify({display:n.value.trim(),language:l.value,reduced:r.checked}));m.textContent='Profile saved.'};document.querySelector('#reset').onclick=()=>{localStorage.removeItem(KEY);load();m.textContent='Profile reset.'};load();"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='desk-tool-ui':
  body='''<section class="grid"><article class="card"><h1>Desk tool</h1><p id="summary"></p><button id="toggleDensity">Toggle density</button></article><article class="card"><h2>Quick task</h2><form id="add" class="row"><input id="task" required><button>Add</button></form><ul id="tasks"></ul></article><article class="card"><h2>Transfer</h2><textarea id="transfer"></textarea><button id="export">Export</button><button id="import">Import</button></article></section>'''
  js="""const KEY='l3-desk';let s=JSON.parse(localStorage.getItem(KEY)||'{\"density\":\"comfortable\",\"tasks\":[]}');const tasks=document.querySelector('#tasks'),sum=document.querySelector('#summary');function save(){localStorage.setItem(KEY,JSON.stringify(s));draw()}function draw(){tasks.innerHTML=s.tasks.map((x,i)=>`<li>${x}<button data-r='${i}'>Ãƒâ€”</button></li>`).join('');sum.textContent=`${s.tasks.length} tasks Ã‚Â· ${s.density}`;tasks.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{s.tasks.splice(b.dataset.r,1);save()})}document.querySelector('#add').onsubmit=e=>{e.preventDefault();const x=document.querySelector('#task');if(x.value.trim()){s.tasks.push(x.value.trim());x.value='';save()}};document.querySelector('#toggleDensity').onclick=()=>{s.density=s.density==='compact'?'comfortable':'compact';save()};document.querySelector('#export').onclick=()=>document.querySelector('#transfer').value=JSON.stringify(s,null,2);document.querySelector('#import').onclick=()=>{try{s=JSON.parse(document.querySelector('#transfer').value);save()}catch{}};draw();"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='extension-popup':
  files={'manifest.json':json.dumps({'manifest_version':3,'name':'OTHRYS Level 3 Popup','version':'0.1.0','action':{'default_popup':'popup.html'},'permissions':['storage']},indent=2),'popup.html':'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OTHRYS Popup</title><link rel="stylesheet" href="popup.css"><script defer src="popup.js"></script></head><body><main><h1>Quick note</h1><input id="note" aria-label="Note"><button id="save">Save locally</button><p id="msg" aria-live="polite"></p></main></body></html>','popup.css':css+'body{min-width:300px;padding:14px}','popup.js':"const n=document.querySelector('#note'),m=document.querySelector('#msg');globalThis.chrome?.storage?.local?.get(['note'],x=>n.value=x.note||'');document.querySelector('#save').onclick=()=>globalThis.chrome.storage.local.set({note:n.value},()=>m.textContent='Saved.');"}
 elif k=='extension-options':
  files={'manifest.json':json.dumps({'manifest_version':3,'name':'OTHRYS Level 3 Options','version':'0.1.0','options_page':'options.html','permissions':['storage']},indent=2),'options.html':'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OTHRYS Options</title><link rel="stylesheet" href="options.css"><script defer src="options.js"></script></head><body><main><form id="options"><h1>Extension options</h1><label>Mode <select id="mode"><option>quiet</option><option>focused</option></select></label><button>Save</button><p id="msg" aria-live="polite"></p></form></main></body></html>','options.css':css,'options.js':"const f=document.querySelector('#options'),m=document.querySelector('#mode'),x=document.querySelector('#msg');globalThis.chrome?.storage?.local?.get(['mode'],v=>m.value=v.mode||'quiet');f.onsubmit=e=>{e.preventDefault();globalThis.chrome.storage.local.set({mode:m.value},()=>x.textContent='Saved.')};"}
 elif k=='extension-content-script':
  files={'manifest.json':json.dumps({'manifest_version':3,'name':'OTHRYS Bounded Page Marker','version':'0.1.0','content_scripts':[{'matches':['https://example.com/*'],'js':['content.js'],'css':['content.css']} ]},indent=2),'popup.html':'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bounded content tool</title><link rel="stylesheet" href="popup.css"></head><body><main><h1>Bounded marker</h1><p>Runs only on example.com and adds a visible local page marker.</p></main></body></html>','popup.css':css,'content.js':"if(!document.querySelector('#othrys-l3-marker')){const b=document.createElement('aside');b.id='othrys-l3-marker';b.textContent='OTHRYS bounded content tool';b.setAttribute('aria-label','OTHRYS page marker');document.body.prepend(b)}",'content.css':'#othrys-l3-marker{position:relative;z-index:2147483647;padding:8px;background:#101217;color:#fff;border:2px solid #8aa2ff;font:14px system-ui}' }
 elif k=='offline-app-shell':
  body='''<section class="panel"><h1>Offline application shell</h1><p>This shell caches its local application assets and remains useful without a network.</p><p id="status" aria-live="polite">Checking offline shellÃ¢â‚¬Â¦</p></section>'''
  files={'index.html':page(title,body,extra_head='<link rel="manifest" href="manifest.webmanifest">'),'styles.css':css,'app.js':"const s=document.querySelector('#status');if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').then(()=>s.textContent='Offline shell ready.').catch(()=>s.textContent='Offline cache unavailable.')}else{s.textContent='Service workers unavailable.'}",'manifest.webmanifest':json.dumps({'name':'OTHRYS Offline Shell','short_name':'OTHRYS','start_url':'./','display':'standalone','background_color':'#101217','theme_color':'#101217'},indent=2),'sw.js':"const C='othrys-l3-v1';self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./styles.css','./app.js','./manifest.webmanifest']))));self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));"}
 elif k=='local-file-tool':
  body='''<section class="panel"><h1>Local file utility</h1><input id="file" type="file" accept="text/*"><div class="row"><button id="upper">Uppercase</button><button id="download">Download result</button></div><textarea id="output" aria-label="File output"></textarea><p id="meta" class="muted"></p></section>'''
  js="""let name='output.txt';const f=document.querySelector('#file'),o=document.querySelector('#output'),m=document.querySelector('#meta');f.onchange=async()=>{const x=f.files[0];if(!x)return;name=x.name;o.value=await x.text();m.textContent=`${x.name} Ã‚Â· ${x.size} bytes`};document.querySelector('#upper').onclick=()=>o.value=o.value.toUpperCase();document.querySelector('#download').onclick=()=>{const blob=new Blob([o.value],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='transformed-'+name;a.click();URL.revokeObjectURL(a.href)};"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='multi-view-app':
  body='''<nav class="panel row"><button data-view="dashboard">Dashboard</button><button data-view="notes">Notes</button><button data-view="settings">Settings</button></nav><section id="view-dashboard" class="panel"><h1>Dashboard</h1><p id="count"></p></section><section id="view-notes" class="panel hidden"><h1>Notes</h1><form id="add"><input id="note" required><button>Add</button></form><ul id="notes"></ul></section><section id="view-settings" class="panel hidden"><h1>Settings</h1><button id="density">Toggle density</button></section>'''
  js="""const KEY='l3-multiview';let s=JSON.parse(localStorage.getItem(KEY)||'{\"notes\":[],\"density\":\"comfortable\"}');function save(){localStorage.setItem(KEY,JSON.stringify(s));draw()}function show(v){document.querySelectorAll('[id^="view-"]').forEach(x=>x.classList.toggle('hidden',x.id!=='view-'+v));location.hash=v}function draw(){document.querySelector('#notes').innerHTML=s.notes.map(x=>`<li>${x}</li>`).join('');document.querySelector('#count').textContent=`${s.notes.length} local notes Ã‚Â· ${s.density}`};document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));document.querySelector('#add').onsubmit=e=>{e.preventDefault();const n=document.querySelector('#note');s.notes.push(n.value.trim());n.value='';save()};document.querySelector('#density').onclick=()=>{s.density=s.density==='compact'?'comfortable':'compact';save()};draw();show((location.hash||'#dashboard').slice(1));"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 elif k=='polish-accessibility':
  body='''<a class="skip-link" href="#content">Skip to content</a><nav class="panel row" aria-label="Application"><button data-view="overview">Overview</button><button data-view="details">Details</button></nav><section id="content" class="panel" tabindex="-1"><h1>Accessible application polish</h1><p>Keyboard-first navigation, visible focus, reduced-motion support and compact responsive layout.</p><p id="live" aria-live="polite">Ready.</p><button id="announce">Run accessibility smoke</button></section>'''
  js="""localStorage.setItem('l3-polish-last-open',new Date().toISOString());document.querySelector('#announce').onclick=()=>document.querySelector('#live').textContent='Accessibility controls are responding.';document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>document.querySelector('#live').textContent=`${b.dataset.view} view selected.`);"""
  files={'index.html':page(title,body),'styles.css':css+'.skip-link{position:absolute;left:-9999px}.skip-link:focus{left:12px;top:12px;background:#fff;color:#000;padding:8px;z-index:1000}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important;animation:none!important}}','app.js':js}
 elif k=='local-first-capstone':
  body='''<nav class="panel row"><button data-view="board">Board</button><button data-view="notes">Notes</button><button data-view="transfer">Transfer</button></nav><section id="view-board" class="panel"><h1>Local project board</h1><form id="taskForm" class="row"><input id="task" required placeholder="Task"><button>Add task</button></form><ul id="tasks"></ul></section><section id="view-notes" class="panel hidden"><h1>Project note</h1><textarea id="note"></textarea><button id="saveNote">Save note</button></section><section id="view-transfer" class="panel hidden"><h1>Import / export</h1><textarea id="transfer"></textarea><div class="row"><button id="export">Export</button><button id="import">Import</button></div><p id="msg" role="alert"></p></section>'''
  js="""const KEY='l3-capstone';let s=JSON.parse(localStorage.getItem(KEY)||'{\"tasks\":[],\"note\":\"\"}');const save=()=>{localStorage.setItem(KEY,JSON.stringify(s));draw()};function show(v){document.querySelectorAll('[id^="view-"]').forEach(x=>x.classList.toggle('hidden',x.id!=='view-'+v));location.hash=v}function draw(){document.querySelector('#tasks').innerHTML=s.tasks.map((x,i)=>`<li><label><input data-i='${i}' type='checkbox' ${x.done?'checked':''}> ${x.text}</label></li>`).join('');document.querySelector('#note').value=s.note;document.querySelectorAll('[data-i]').forEach(x=>x.onchange=()=>{s.tasks[x.dataset.i].done=x.checked;save()})}document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));document.querySelector('#taskForm').onsubmit=e=>{e.preventDefault();const t=document.querySelector('#task');if(t.value.trim()){s.tasks.push({text:t.value.trim(),done:false});t.value='';save()}};document.querySelector('#saveNote').onclick=()=>{s.note=document.querySelector('#note').value;save()};document.querySelector('#export').onclick=()=>document.querySelector('#transfer').value=JSON.stringify(s,null,2);document.querySelector('#import').onclick=()=>{try{s=JSON.parse(document.querySelector('#transfer').value);save();document.querySelector('#msg').textContent='Imported.'}catch{document.querySelector('#msg').textContent='Invalid JSON.'}};draw();show((location.hash||'#board').slice(1));"""
  files={'index.html':page(title,body),'styles.css':css,'app.js':js}
 else: raise KeyError(k)
 return files
def adaptive_route(job):
 p=run(['node',str(ROOT/'tools/training/select_adaptive_builder.mjs'),job['family']],timeout=30)
 if p.returncode!=0: raise RuntimeError(f'TALOS_ADAPTIVE_ROUTE_FAIL:{(p.stderr or p.stdout)[-500:]}')
 x=json.loads(p.stdout.strip());
 if x.get('authorityGranted') is not False or not x.get('builder'): raise RuntimeError('TALOS_ADAPTIVE_ROUTE_INVALID')
 return x

def builder_for(job): return adaptive_route(job)['builder']

def source_mode(job):
 if job['sequence']<=4: return 'ADAPT_LEVEL1_STOCK_TO_APPLICATION_SURFACE'
 if 5<=job['sequence']<=16: return 'ADAPT_LEVEL2_STATE_CONTRACT_TO_BROWSER_LOCAL_FIRST_RUNTIME'
 if 17<=job['sequence']<=20: return 'COMPOSE_PROVEN_WEB_PATTERNS_WITH_LEVEL3_BOUNDARIES'
 return 'COMPOSE_PRIOR_LEVEL3_APPLICATION_PATTERNS'

def worker_task(job,names):
 stock=', '.join(job.get('sourceStock') or [])
 return f'''LEVEL 3 TRAINING JOB {job['id']} Ã¢â‚¬â€ {job['title']}. Contract: {job['contract']}.
Source stock to honor conceptually: {stock}. This is a bounded local training application, not production.
WRITE ALL of these exact allowed paths immediately, using paths exactly as given and never prefixing them with workspace/: {', '.join(names)}.
Create a complete accessible responsive application. Use only local HTML/CSS/vanilla JS and browser localStorage where durable state is required. No remote assets, no fetch/XHR/WebSocket, no secrets, no external auth/database/API, no paid service.
For extension jobs use MV3, local code only and minimum permissions. For PWA use a local manifest and service worker. Do not inspect unrelated repository files. Touch no file outside allowed paths. Finish only after all required files are written.'''

def invoke_worker(job,jobdir,names):
 route=adaptive_route(job); builder=route['builder']; req=jobdir/'worker-request.json'; result=jobdir/'worker-result.json'
 payload={'schema_version':'othrys.worker-request.v0.1','job_id':job['id'],'node_id':'legion','capability':'engineering.patch','workspace':ROOT.as_posix(),'allowed_paths':[rel(jobdir/n) for n in names],'deny_paths':DENY,'timeout_sec':100,'metadata':{'forge_builder_id':builder,'training_level':3,'talos_learning_digest':route.get('sourceDigest'),'adaptive_route':True,'authorityGranted':False},'task':worker_task(job,[rel(jobdir/n) for n in names])}
 write_json(req,payload)
 try: p=run([sys.executable,str(WORKER),'--request',str(req),'--result',str(result)],timeout=150)
 except subprocess.TimeoutExpired: return {'ok':False,'reason':'CAMPAIGN_WORKER_TIMEOUT','builder_id':builder,'changed_files':[]}
 if result.exists():
  try:return read_json(result)
  except Exception:return {'ok':False,'reason':'MALFORMED_WORKER_RESULT','builder_id':builder,'changed_files':[]}
 return {'ok':False,'reason':f'NO_RESULT_EXIT_{p.returncode}','builder_id':builder,'changed_files':[]}
def verify(job,jobdir):
 p=run(['node',str(VERIFY),str(jobdir),job['key'],job['family']],timeout=45)
 raw=(p.stdout or '').strip()
 try: receipt=json.loads(raw)
 except Exception: receipt={'schema':'othrys.talos.level3-app-proof.v1','key':job['key'],'family':job['family'],'ok':False,'checks':[{'name':'verifier-output','ok':False,'detail':(raw+' '+(p.stderr or ''))[-1200:]}],'authorityGranted':False}
 write_json(jobdir/'TALOS_RECEIPT.json',receipt)
 return receipt

def apply_fallback(job,jobdir):
 files=fallback_files(job)
 for name,content in files.items(): (jobdir/name).write_text(content+'\n',encoding=UTF8)
 return list(files)

def complete_manifest(job,receipt,worker_result,recovery):
 m=read_json(MANIFEST); current=next(x for x in m['level3']['jobs'] if x['id']==job['id'])
 current['status']='COMPLETE'; current['executionStarted']=False; current['attempts']=1
 current['builderAttempt']=worker_result.get('builder_id') or builder_for(job)
 current['builderResult']='PASS' if worker_result.get('ok') else worker_result.get('reason','FAIL')
 current['operatorRecovery']=bool(recovery); current['talos']='PASS'; current['learningReceipt']=f"training/level-3/{slug(job)}/LEARNING_RECEIPT.json"
 current['finalTrainingDisposition']='APPLICATION_PATTERN'; current['promotionAuthorityGranted']=False
 m['level3']['completedJobs']=sum(1 for x in m['level3']['jobs'] if x['status']=='COMPLETE')
 if m['level3']['completedJobs']==len(m['level3']['jobs']):
  m['level3']['status']='COMPLETE';
  for x in m['levels']:
   if x['level']==3: x['status']='COMPLETE'; x['authorityGranted']=False
 m['authorityGranted']=False; m['automaticAdmission']=False; m['automaticLevelAdvance']=False
 write_json(MANIFEST,m)

def learning(job,worker_result,talos,recovery,recovery_reason):
 failed=[c['name'] for c in talos.get('checks',[]) if not c.get('ok')]
 lessons=[]
 if not worker_result.get('ok'): lessons.append(f"governed builder failure remained explicit: {worker_result.get('reason','UNKNOWN')}")
 if recovery: lessons.append('deterministic bounded operator recovery completed the application only after governed output failed the application gate')
 lessons += ['application-visible proof is stronger than worker ok:true','Level 3 keeps remote services and authority outside the application boundary']
 return {'schema':'othrys.os.training-learning-receipt.v1','level':3,'jobId':job['id'],'key':job['key'],'title':job['title'],'status':'COMPLETE','contract':job['contract'],'sourceStock':job.get('sourceStock',[]),'sourceDisposition':source_mode(job),'builderAttempt':{'builder':worker_result.get('builder_id') or builder_for(job),'ok':bool(worker_result.get('ok')),'reason':worker_result.get('reason',''),'changedFiles':worker_result.get('changed_files',[])},'operatorRecovery':{'used':bool(recovery),'reason':recovery_reason if recovery else ''},'talos':{'status':'PASS','schema':talos.get('schema'),'checks':talos.get('checks',[])},'finalTrainingDisposition':'APPLICATION_PATTERN','lessons':lessons,'authorityGranted':False,'automaticAdmission':False,'promotionAuthorityGranted':False}
def set_running(job):
 m=read_json(MANIFEST); cur=next(x for x in m['level3']['jobs'] if x['id']==job['id'])
 cur['status']='RUNNING'; cur['executionStarted']=True; m['authorityGranted']=False; write_json(MANIFEST,m)

def main():
 prep=read_json(PREP); print('LEVEL3_CAMPAIGN_START',flush=True)
 for job in prep['jobs']:
  live=read_json(MANIFEST); cur=next(x for x in live['level3']['jobs'] if x['id']==job['id'])
  if cur['status']=='COMPLETE': continue
  if job['id']=='L3-001': raise RuntimeError('L3-001 must already be complete')
  jobdir=TRAIN/slug(job); jobdir.mkdir(parents=True,exist_ok=True)
  fallback=fallback_files(job); names=list(fallback)
  print(f"START {job['id']} {job['key']} builder={builder_for(job)}",flush=True)
  set_running(job)
  wr=invoke_worker(job,jobdir,names)
  first=verify(job,jobdir)
  recovery=not first.get('ok',False); recovery_reason=''
  if recovery:
   recovery_reason='governed output did not satisfy full deterministic + browser-visible Talos gate'
   print(f"RECOVER {job['id']} worker={wr.get('ok')} reason={wr.get('reason','')} talos_fail={[c['name'] for c in first.get('checks',[]) if not c.get('ok')]}",flush=True)
   apply_fallback(job,jobdir)
   talos=verify(job,jobdir)
  else: talos=first
  if not talos.get('ok',False):
   write_json(jobdir/'CAMPAIGN_FAILURE.json',{'jobId':job['id'],'worker':wr,'talos':talos,'authorityGranted':False})
   raise RuntimeError(f"TALOS_FAIL {job['id']} {[c for c in talos.get('checks',[]) if not c.get('ok')]}")
  lr=learning(job,wr,talos,recovery,recovery_reason); write_json(jobdir/'LEARNING_RECEIPT.json',lr)
  complete_manifest(job,talos,wr,recovery)
  intel=run(['node',str(ROOT/'tools/training/refresh_talos_intelligence.mjs'),'3'],timeout=30)
  if intel.returncode!=0: raise RuntimeError(f'TALOS_INTELLIGENCE_REFRESH_FAIL:{(intel.stderr or intel.stdout)[-500:]}')
  print(f"PASS {job['id']} recovery={recovery} checks={len(talos.get('checks',[]))}",flush=True)
 m=read_json(MANIFEST); done=m['level3']['completedJobs']
 if done!=24 or m['level3']['status']!='COMPLETE': raise RuntimeError(f'LEVEL3_NOT_COMPLETE:{done}')
 receipt={'schema':'othrys.os.level3-campaign-receipt.v1','status':'COMPLETE_PENDING_WHOLE_BODY_SEAL','completedJobs':done,'level3Status':'COMPLETE','currentLevel':m['currentLevel'],'level4Status':next(x for x in m['levels'] if x['level']==4)['status'],'level3_5Status':m['level3_5Consolidation']['status'],'authorityGranted':False,'automaticAdmission':False,'automaticLevelAdvance':False,'generatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
 write_json(ROOT/'docs/training/LEVEL_3_CAMPAIGN_RECEIPT_2026-09-01.json',receipt)
 print('LEVEL3_CAMPAIGN_COMPLETE',done,flush=True)

if __name__=='__main__': main()
