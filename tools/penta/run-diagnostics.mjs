import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DIAGNOSTIC_PACKS,diagnosticCatalog } from './diagnostics.mjs';

const root=new URL('../../',import.meta.url).pathname.replace(/^\/(.:\/)/,'$1');
const packId=process.argv[2]??'quick';
if(packId==='catalog'){console.log(JSON.stringify({schema:'othrys.os.settings-diagnostics.v1',packs:diagnosticCatalog()},null,2));process.exit(0);}
const pack=DIAGNOSTIC_PACKS[packId]; if(!pack){console.error(`Unknown pack: ${packId}`);process.exit(2);}
let files=pack.tests??[];
if(pack.glob){files=readdirSync(join(root,'runtime','os')).filter(n=>n.endsWith('.test.mjs')).map(n=>`runtime/os/${n}`);}
files=[...files,...(pack.extra??[])];
const started=performance.now();
const run=spawnSync(process.execPath,['--test',...files],{cwd:root,encoding:'utf8'});
const output=`${run.stdout??''}\n${run.stderr??''}`;
const value=name=>Number(output.match(new RegExp(`(?:ℹ|#) ${name} (\\d+)`))?.[1]??0);
const result={schema:'othrys.os.diagnostic-result.v1',packId,label:pack.label,status:run.status===0?'PASS':'FAIL',tests:value('tests'),passed:value('pass'),failed:value('fail'),durationMs:Math.round((performance.now()-started)*100)/100,mutationsPerformed:0,authorityGranted:false,executionStarted:false};
console.log(JSON.stringify(result,null,2));
if(run.status!==0){console.error(output.slice(-12000));process.exit(run.status??1);}