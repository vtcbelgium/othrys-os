import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { verifyNoMissionBrainResult } from './brain_no_mission_result.mjs';

function id(value){
  const text=String(value??'').trim();
  if(!/^WEB-[A-Z0-9-]+$/.test(text)) throw new Error('BRAIN_RESULT_WEB_ID_INVALID');
  return text;
}

export function webBrainResultPath(root,webCommandId){
  return join(root,'missions','web-plans',id(webCommandId)+'.brain-result.json');
}

export function readWebBrainResult(root,webCommandId,{decision}={}){
  const path=webBrainResultPath(root,webCommandId);
  if(!existsSync(path)) return null;
  const value=JSON.parse(readFileSync(path,'utf8'));
  return verifyNoMissionBrainResult(value,{decision});
}

export function persistWebBrainResult(root,webCommandId,result,{decision}={}){
  const verified=verifyNoMissionBrainResult(result,{decision});
  const path=webBrainResultPath(root,webCommandId);
  mkdirSync(dirname(path),{recursive:true});
  const text=JSON.stringify(verified,null,2)+'\n';
  if(existsSync(path)){
    if(readFileSync(path,'utf8')!==text) throw new Error('BRAIN_RESULT_CONFLICT');
    return Object.freeze({path,result:verified,created:false});
  }
  const temp=path+'.tmp-'+process.pid;
  writeFileSync(temp,text,{encoding:'utf8',mode:0o600});
  renameSync(temp,path);
  return Object.freeze({path,result:verified,created:true});
}
