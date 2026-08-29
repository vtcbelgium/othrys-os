import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { discoverKeymasterEnvSource, inventoryKeymasterEnv, resolveSealedEnvCredential } from '../../runtime/os/keymaster_vault.mjs';
import { runSafeProviderProbe } from '../../runtime/os/provider_probe.mjs';
import { normalizePrometheusOpportunity, decidePrometheusOpportunity, createArsenalIntakeRequest } from '../../runtime/os/prometheus_arsenal.mjs';

export async function runOpportunityAction(raw,choice,{root=process.cwd(),fetchImpl=fetch}={}){
  const item=normalizePrometheusOpportunity(raw), keySource=discoverKeymasterEnvSource(), inventory=inventoryKeymasterEnv(keySource);
  const decision=decidePrometheusOpportunity(raw,{decision:choice,credentialInventory:inventory.credentials??[]});
  const record={schema:'othrys.os.prometheus-opportunity-action.v1',item,decision,basicProbe:null,authorityGranted:false,executionStarted:false};
  if(decision.decision==='ADD'&&decision.state==='QUALIFICATION_READY'){
    try{
      if(item.credentialEnvVar){const resolved=resolveSealedEnvCredential(keySource,item.credentialEnvVar,{consumer:'prometheus-arsenal-basic-probe',readOnly:true,authorityGranted:false});record.basicProbe=resolved.ok?await runSafeProviderProbe({envVar:item.credentialEnvVar,sealedCredential:resolved.value,fetchImpl,timeoutMs:8000}):{supported:false,healthy:false,reason:resolved.reason};}
      else {const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),8000);try{const r=await fetchImpl(item.url,{method:'HEAD',signal:ctrl.signal,redirect:'follow'});record.basicProbe={reachable:r.ok||r.status<500,status:r.status,method:'HEAD',bodyRead:false};}finally{clearTimeout(timer);}}
    }catch(error){record.basicProbe={reachable:false,status:null,error:String(error?.name??'probe-failed')};}
    record.intake=createArsenalIntakeRequest(raw,decision); const intakeDir=join(root,'.othrys','runtime','keymaster','intake');mkdirSync(intakeDir,{recursive:true});writeFileSync(join(intakeDir,`${item.opportunityId}.json`),JSON.stringify(record.intake,null,2)+'\n');
  }
  const dir=join(root,'.othrys','runtime','prometheus','decisions');mkdirSync(dir,{recursive:true});writeFileSync(join(dir,`${item.opportunityId}.json`),JSON.stringify(record,null,2)+'\n');return record;
}
if(import.meta.url===pathToFileURL(process.argv[1]??'').href){
  const [file,choice]=process.argv.slice(2); if(!file||!choice) throw new Error('usage: node tools/penta/opportunity-action.mjs <opportunity.json> ADD|DENY');
  const rawText=readFileSync(file,'utf8'), raw=JSON.parse(rawText.charCodeAt(0)===0xFEFF?rawText.slice(1):rawText);
  console.log(JSON.stringify(await runOpportunityAction(raw,choice),null,2));
}
