import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/(.:\/)/,'$1');
const buildTests=['runtime/hephaestus','runtime/factory','runtime/talos-kernel'].flatMap(d=>readdirSync(join(root,d)).filter(n=>n.endsWith('.test.ts')).map(n=>`${d}/${n}`));
const suites=[
  ['os-deep',process.execPath,['tools/penta/run-diagnostics.mjs','deep']],
  ['build-core',process.execPath,['--test',...buildTests]],
  ['mycelium','python',['-m','pytest','-q','runtime/mycelium']],
  ['workers','python',['-m','pytest','-q','runtime/workers']]
];
const rows=[]; let total=0,passed=0,failed=0;
for(const [id,cmd,args] of suites){
  const t=performance.now(),run=spawnSync(cmd,args,{cwd:root,encoding:'utf8'}),out=`${run.stdout??''}\n${run.stderr??''}`;
  const count=id==='os-deep'?Number(run.stdout.match(/"tests":\s*(\d+)/)?.[1]??0):id==='build-core'?Number(out.match(/(?:ℹ|#) tests (\d+)/)?.[1]??0):Number(out.match(/(\d+) passed/)?.[1]??0);
  const ok=run.status===0; total+=count; if(ok)passed+=count; else failed+=Math.max(1,count);
  rows.push({id,status:ok?'PASS':'FAIL',tests:count,durationMs:+(performance.now()-t).toFixed(2),tail:ok?null:out.slice(-3000)});
}
const result={schema:'othrys.os.whole-body-diagnostic.v1',status:rows.every(x=>x.status==='PASS')?'PASS':'FAIL',tests:total,passed,failed,suites:rows,mutationsPerformed:0,authorityGranted:false,executionStarted:false};
console.log(JSON.stringify(result,null,2));if(result.status!=='PASS')process.exit(1);