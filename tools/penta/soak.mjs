import { spawnSync } from 'node:child_process';

const cycles=Math.max(1,Math.min(100,Number(process.argv[2]??10)));
const pack=process.argv[3]??'quick';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/(.:\/)/,'$1');
const rows=[]; let pass=0;
for(let i=1;i<=cycles;i++){
  const started=performance.now();
  const run=spawnSync(process.execPath,['tools/penta/run-diagnostics.mjs',pack],{cwd:root,encoding:'utf8'});
  let result=null; try{result=JSON.parse(run.stdout)}catch{}
  const ok=run.status===0&&result?.status==='PASS'; if(ok)pass++;
  rows.push({cycle:i,status:ok?'PASS':'FAIL',tests:result?.tests??0,durationMs:+(performance.now()-started).toFixed(2)});
  if(!ok) break;
}
const durations=rows.map(x=>x.durationMs).sort((a,b)=>a-b);
const pick=p=>durations[Math.min(durations.length-1,Math.floor((durations.length-1)*p))]??0;
const out={schema:'othrys.os.pentarchy-soak.v1',pack,requestedCycles:cycles,completedCycles:rows.length,passedCycles:pass,status:pass===cycles?'PASS':'FAIL',p50Ms:pick(.5),p95Ms:pick(.95),rows,authorityGranted:false,executionStarted:false};
console.log(JSON.stringify(out,null,2));
if(out.status!=='PASS')process.exit(1);