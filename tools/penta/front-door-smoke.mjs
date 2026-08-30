process.env.OTHRYS_DECK_TOKEN='front-door-smoke';
process.env.OTHRYS_DECK_BIND='127.0.0.1';
process.env.OTHRYS_DECK_PORT='18803';
process.env.OTHRYS_DECK_NO_START='1';
const {startServer}=await import('../../runtime/command-deck/server.mjs');
const server=startServer(); await new Promise(r=>setTimeout(r,80));
const questions=['What is OTHRYS?','What is the active mission?','Which builder would you use?','Research local voice models','Plan a tiny status page','Build a hello world page','Does OTHRYS work? health status'];
const rows=[];
try{
 for(const input of questions){
  const r=await fetch('http://127.0.0.1:18803/api/chat',{method:'POST',headers:{'Content-Type':'application/json','X-OTHRYS-DECK-TOKEN':'front-door-smoke'},body:JSON.stringify({input,preference:'auto'})});
  const b=await r.json(); const t=b.turn;
  rows.push({input,http:r.status,intent:t?.intent??null,organs:t?.dispatch?.organs??[],planner:t?.dispatch?.planner??null,model:t?.modelRoute?.id??null,answer:t?.answer??null,executionStarted:t?.executionStarted??null});
 }
}finally{await new Promise(r=>server.close(r));}
const pass=rows.every(x=>x.http===200&&x.executionStarted===false)&&rows.find(x=>x.input.startsWith('Build'))?.model==='qwen3-builder'&&rows.find(x=>x.input.startsWith('Plan'))?.planner==='HEPHAESTUS'&&rows.find(x=>x.input.startsWith('Research'))?.planner==='PROMETHEUS';
const out={schema:'othrys.os.front-door-smoke.v1',status:pass?'PASS':'FAIL',rows,authorityGranted:false,executionStarted:false};
if(process.argv.includes('--write')){const {writeFileSync}=await import('node:fs');writeFileSync('docs/V2-011J/FRONT_DOOR_SMOKE.json',JSON.stringify(out,null,2)+'\n','utf8');}
console.log(JSON.stringify(out,null,2));
if(!pass)process.exit(1);
