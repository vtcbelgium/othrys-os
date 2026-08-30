import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
export function usageTotals(rows,scope={}){
  const hit=rows.filter(x=>(!scope.consumer||x.consumer===scope.consumer)&&(!scope.provider||x.provider===scope.provider)&&(!scope.grantId||x.grantId===scope.grantId));
  return Object.freeze({requests:hit.length,cost:hit.reduce((a,x)=>a+Math.max(0,Number(x.cost??0)),0),tokens:hit.reduce((a,x)=>a+Math.max(0,Number(x.tokens??0)),0)});
}
export function openCredentialUsageLedger(path){
  const read=()=>{if(!existsSync(path))return [];return readFileSync(path,'utf8').split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line));};
  const append=raw=>{const rows=read();if(!raw?.idempotencyKey||!raw?.consumer||!raw?.provider||!raw?.grantId)throw new Error('USAGE_ENTRY_INVALID');const prior=rows.find(x=>x.idempotencyKey===raw.idempotencyKey);if(prior)return Object.freeze({status:'EXISTS',entry:prior,totals:usageTotals(rows,{consumer:raw.consumer,provider:raw.provider,grantId:raw.grantId})});const entry=Object.freeze({schema:'othrys.os.credential-usage.v1',idempotencyKey:String(raw.idempotencyKey),consumer:String(raw.consumer),provider:String(raw.provider),grantId:String(raw.grantId),cost:Math.max(0,Number(raw.cost??0)),tokens:Math.max(0,Number(raw.tokens??0)),at:String(raw.at),secretExposed:false,authorityGranted:false});mkdirSync(dirname(path),{recursive:true});appendFileSync(path,JSON.stringify(entry)+'\n','utf8');const next=[...rows,entry];return Object.freeze({status:'APPENDED',entry,totals:usageTotals(next,{consumer:entry.consumer,provider:entry.provider,grantId:entry.grantId})});};
  return Object.freeze({path,read:()=>Object.freeze(read()),append,totals:scope=>usageTotals(read(),scope),authorityGranted:false,executionStarted:false});
}
