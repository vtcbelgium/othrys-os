import { spawnSync } from 'node:child_process';
const model=process.argv[2];if(!model){console.error('usage: node tools/penta/local-model-smoke.mjs <ollama-model>');process.exit(2);}
const cases=[
  ['instruction','Reply with exactly OTHRYS_OK and nothing else.',x=>x.trim()==='OTHRYS_OK'],
  ['structured','Return only valid JSON with keys a and b, where a=2 and b=3.',x=>{try{const j=JSON.parse(x.trim());return j.a===2&&j.b===3}catch{return false}}],
  ['repair','Return only the corrected one-line JavaScript function: function add(a,b){return a-b}',x=>/function\s+add\s*\(a\s*,\s*b\)\s*\{\s*return\s+a\s*\+\s*b\s*;?\s*\}/.test(x.trim())]
];
const rows=[];let score=0,totalMs=0;
for(const [id,prompt,check] of cases){const t=performance.now();const run=spawnSync('ollama',['run',model,prompt],{encoding:'utf8',timeout:90000});const ms=performance.now()-t,total=run.stdout??'',ok=run.status===0&&check(total);if(ok)score++;totalMs+=ms;rows.push({id,status:ok?'PASS':'FAIL',durationMs:+ms.toFixed(1),exitCode:run.status,outputPreview:total.trim().slice(0,180)});}
console.log(JSON.stringify({schema:'othrys.os.local-model-smoke.v1',model,score,maxScore:cases.length,status:score===cases.length?'PASS':'PARTIAL',durationMs:+totalMs.toFixed(1),rows,certificationGranted:false,authorityGranted:false,executionStarted:false},null,2));