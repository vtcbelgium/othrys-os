import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/(.:\/)/,'$1');
const pythonCmd=process.platform==='win32'?'python':'python3';
function walk(dir){
  return readdirSync(join(root,dir),{withFileTypes:true}).flatMap(entry=>{
    const rel=join(dir,entry.name);
    return entry.isDirectory()?walk(rel):[rel];
  });
}
const nodeTestsUnder=dir=>walk(dir).filter(p=>/\.test\.(?:mjs|js|ts)$/.test(p)).sort();
const suites=[
  ['runtime-node',process.execPath,['--test',...nodeTestsUnder('runtime')]],
  ['blocks-node',process.execPath,['--test',...nodeTestsUnder('blocks')]],
  ['theia-node',process.execPath,['--test',...nodeTestsUnder('theia')]],
  ['mycelium',pythonCmd,['tools/penta/run-python-tests.py','runtime/mycelium']],
  ['workers',pythonCmd,['tools/penta/run-python-tests.py','runtime/workers']],
  ['aux-python',pythonCmd,['tools/penta/run-python-tests.py','blocks/control_feedback/tests','qa','tools/mnemosyne']]
];
const rows=[]; let total=0,passed=0,failed=0;
for(const [id,cmd,args] of suites){
  const t=performance.now(),run=spawnSync(cmd,args,{cwd:root,encoding:'utf8'}),out=`${run.stdout??''}\n${run.stderr??''}`;
  const count=id.endsWith('-node')?Number(out.match(/(?:ℹ|#) tests (\d+)/)?.[1]??0):Number(out.match(/(\d+) passed/)?.[1]??0);
  const ok=run.status===0; total+=count; if(ok)passed+=count; else failed+=Math.max(1,count);
  rows.push({id,status:ok?'PASS':'FAIL',tests:count,durationMs:+(performance.now()-t).toFixed(2),tail:ok?null:out.slice(-3000)});
}
const result={schema:'othrys.os.whole-body-diagnostic.v1',status:rows.every(x=>x.status==='PASS')?'PASS':'FAIL',tests:total,passed,failed,suites:rows,mutationsPerformed:0,authorityGranted:false,executionStarted:false};
console.log(JSON.stringify(result,null,2));if(result.status!=='PASS')process.exit(1);
