import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const HECATONCHEIRES_SCHEMA='othrys.os.hecatoncheires-posture.v1';
export const HECATONCHEIRES_STATUSES=Object.freeze(['PRESENT_AND_TESTED','PARTIAL','ABSENT']);

const clean=value=>String(value??'').trim();
const safeRelative=value=>{
  const p=clean(value).replaceAll('\\','/');
  return p&&!p.startsWith('/')&&!/^[A-Za-z]:\//.test(p)&&!p.split('/').includes('..');
};

export function validateHecatoncheiresPosture(root,posture){
  const issues=[];
  if(posture?.schema!==HECATONCHEIRES_SCHEMA) issues.push('schema');
  if(posture?.authorityGranted!==false) issues.push('authority');
  const hands=Array.isArray(posture?.hands)?posture.hands:[];
  const ids=new Set();
  for(const hand of hands){
    if(!Number.isInteger(hand.id)||hand.id<1||hand.id>11||ids.has(hand.id)) issues.push(`id:${hand.id}`); else ids.add(hand.id);
    if(!HECATONCHEIRES_STATUSES.includes(hand.status)) issues.push(`status:${hand.id}`);
    if(!clean(hand.hand)||!clean(hand.gap)) issues.push(`description:${hand.id}`);
    const mechanisms=Array.isArray(hand.mechanisms)?hand.mechanisms:[];
    const tests=Array.isArray(hand.tests)?hand.tests:[];
    const signals=Array.isArray(hand.signals)?hand.signals:[];    if(hand.status==='ABSENT'&&(mechanisms.length||tests.length||signals.length)) issues.push(`absent-evidence:${hand.id}`);
    if(hand.status!=='ABSENT'&&(!mechanisms.length||!tests.length||!signals.length)) issues.push(`evidence-required:${hand.id}`);
    for(const rel of [...mechanisms,...tests]){
      if(!safeRelative(rel)){issues.push(`path:${hand.id}:${rel}`);continue;}
      if(!existsSync(resolve(root,rel))) issues.push(`missing:${hand.id}:${rel}`);
    }
    if(hand.status!=='ABSENT'){
      const testBodies=tests.filter(safeRelative).filter(rel=>existsSync(resolve(root,rel))).map(rel=>readFileSync(resolve(root,rel),'utf8'));
      for(const signal of signals) if(!testBodies.some(body=>body.includes(signal))) issues.push(`signal:${hand.id}:${signal}`);
    }
  }
  if(ids.size!==11) issues.push(`hand-count:${ids.size}`);
  for(let id=1;id<=11;id++) if(!ids.has(id)) issues.push(`missing-hand:${id}`);
  return Object.freeze(issues);
}

export function inspectHecatoncheiresPosture(root){
  const path=join(root,'docs','HECATONCHEIRES_POSTURE.json');
  if(!existsSync(path)) return Object.freeze({schema:'othrys.os.hecatoncheires-inspection.v1',ok:false,issues:['posture-missing'],counts:{PRESENT_AND_TESTED:0,PARTIAL:0,ABSENT:0},hands:[],authorityGranted:false,mutationPerformed:false});
  const posture=JSON.parse(readFileSync(path,'utf8'));
  const issues=validateHecatoncheiresPosture(root,posture);
  const counts=Object.fromEntries(HECATONCHEIRES_STATUSES.map(status=>[status,posture.hands.filter(x=>x.status===status).length]));
  return Object.freeze({schema:'othrys.os.hecatoncheires-inspection.v1',ok:issues.length===0,issues,counts,hands:posture.hands.map(x=>({id:x.id,hand:x.hand,status:x.status,gap:x.gap})),authorityGranted:false,mutationPerformed:false});
}
