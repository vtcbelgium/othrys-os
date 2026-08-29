import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { assessPentarchy } from '../../runtime/os/pentarchy.mjs';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/(.:\/)/,'$1');
function diagnostic(id){const r=spawnSync(process.execPath,['tools/penta/run-diagnostics.mjs',id],{cwd:root,encoding:'utf8'});let body=null;try{body=JSON.parse(r.stdout)}catch{}return {id,pass:r.status===0&&body?.status==='PASS',result:body};}
const care=diagnostic('care'),execution=diagnostic('execution'),intelligence=diagnostic('intelligence');
const buildFiles=['runtime/hephaestus','runtime/factory'].flatMap(d=>readdirSync(join(root,d)).filter(n=>n.endsWith('.test.ts')).map(n=>`${d}/${n}`));
const buildRun=spawnSync(process.execPath,['--test',...buildFiles],{cwd:root,encoding:'utf8'}),buildPass=buildRun.status===0;
const evidence={KRONOS:{lifeEvidence:care.pass,boundedWindow:care.pass},TALOS:{flowEvidence:execution.pass,verificationEvidence:execution.pass,terminationEvidence:execution.pass},PROMETHEUS:{intelligenceEvidence:intelligence.pass},MNEMOSYNE:{lineageEvidence:intelligence.pass,lessonEvidence:intelligence.pass},HEPHAESTUS:{buildEvidence:buildPass,independentVerification:buildPass}};
const penta=assessPentarchy({missionId:'settings-penta-status',evidence,authorityGranted:false,executionStarted:false});
const result={schema:'othrys.os.pentarchy-status.v1',ready:penta.ready,seats:penta.seats,proof:{care:care.result,execution:execution.result,intelligence:intelligence.result,buildCore:{status:buildPass?'PASS':'FAIL'}},authorityGranted:false,executionStarted:false};
console.log(JSON.stringify(result,null,2));if(!result.ready)process.exit(1);