import { createHash } from 'node:crypto';
const sha=v=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
const clean=v=>typeof v==='string'?v.trim():'';
const TYPES=new Set(['AI_NEWS','TECH_NEWS','CURRICULUM_WATCH','API','MODEL','TOOL','SOURCE']);
const DECISIONS=new Set(['ADD','DENY']);

export function normalizePrometheusOpportunity(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) throw new Error('PROM_OPPORTUNITY_INVALID');
  const title=clean(raw.title),summary=clean(raw.summary),source=clean(raw.source),url=clean(raw.url),type=clean(raw.type).toUpperCase();
  if(!title||!summary||summary.length>1200||!source||!url||!/^https:\/\//.test(url)||!TYPES.has(type)) throw new Error('PROM_OPPORTUNITY_INVALID');
  const score=Number(raw.score); if(!Number.isFinite(score)||score<0||score>1) throw new Error('PROM_OPPORTUNITY_SCORE_INVALID');
  const body={title,summary,source,url,type,score,harvestable:raw.harvestable===true,freeTier:raw.freeTier===true,requiresAccount:raw.requiresAccount===true,credentialEnvVar:raw.credentialEnvVar==null?null:clean(raw.credentialEnvVar),alreadyKnown:raw.alreadyKnown===true};
  return Object.freeze({...body,opportunityId:`PO-${sha(body).slice(0,20)}`});
}

export function decidePrometheusOpportunity(raw,{decision,credentialInventory=[]}={}){
  const item=normalizePrometheusOpportunity(raw),choice=clean(decision).toUpperCase(); if(!DECISIONS.has(choice)) throw new Error('PROM_OPPORTUNITY_DECISION_INVALID');
  if(choice==='DENY') return Object.freeze({schema:'othrys.os.prometheus-opportunity-decision.v1',opportunityId:item.opportunityId,decision:'DENY',state:'DENIED',nextAction:'NONE',authorityGranted:false,executionStarted:false});
  const credentialPresent=item.credentialEnvVar?credentialInventory.some(x=>x.envVar===item.credentialEnvVar&&x.present===true):true;
  let state='QUALIFICATION_READY',nextAction='RUN_BASIC_QUALIFICATION';
  if(item.requiresAccount&&!credentialPresent){state='ACCOUNT_REQUIRED';nextAction='PROMPT_OPERATOR_ACCOUNT_SETUP';}
  else if(item.credentialEnvVar&&!credentialPresent){state='CREDENTIAL_REQUIRED';nextAction='PROMPT_OPERATOR_CREDENTIAL_SETUP';}
  else if(!item.harvestable){state='RESEARCH_ONLY';nextAction='SAVE_NO_INSTALL';}
  return Object.freeze({schema:'othrys.os.prometheus-opportunity-decision.v1',opportunityId:item.opportunityId,decision:'ADD',state,nextAction,credentialEnvVar:item.credentialEnvVar,freeTier:item.freeTier,autoEnable:false,qualificationRequired:state==='QUALIFICATION_READY',authorityGranted:false,executionStarted:false});
}
export function createArsenalIntakeRequest(raw,decision){
  const item=normalizePrometheusOpportunity(raw);
  if(!decision||decision.schema!=='othrys.os.prometheus-opportunity-decision.v1'||decision.opportunityId!==item.opportunityId||decision.decision!=='ADD') throw new Error('PROM_ARSENAL_DECISION_REQUIRED');
  if(decision.state!=='QUALIFICATION_READY') throw new Error(`PROM_ARSENAL_NOT_READY:${decision.state}`);
  if(item.freeTier!==true) throw new Error('PROM_ARSENAL_FREE_TIER_REQUIRED');
  const body={schema:'othrys.os.arsenal-intake-request.v1',opportunityId:item.opportunityId,title:item.title,type:item.type,sourceUrl:item.url,credentialEnvVar:item.credentialEnvVar,requestedTests:Object.freeze(['IDENTITY','CONNECTIVITY','CAPABILITY','FREE_COST_GUARD','SECRET_LEAK_GUARD']),targetOwner:'keymaster',qualificationOwner:'talos',discoveryOwner:'prometheus',autoEnable:false,paidUsageAllowed:false};
  return Object.freeze({...body,requestDigest:sha(body),authorityGranted:false,executionStarted:false});
}

export const PROMETHEUS_NEWSLETTER_PROFILE=Object.freeze({schema:'othrys.os.prometheus-newsletter-profile.v1',maxItems:8,lenses:Object.freeze([
  {id:'ai',label:'AI',weight:1,include:['models','agents','APIs','open source','research','providers']},
  {id:'tech',label:'Tech',weight:.55,include:['developer tools','automation','hardware','cloud','security']},
  {id:'curriculum',label:'Curriculum Watch',weight:.75,include:['AI automation','AI architecture','agents','APIs','n8n','workflow automation','RAG','LLM engineering']}
]),preferActionable:true,preferFree:true,authorityGranted:false,executionStarted:false});
