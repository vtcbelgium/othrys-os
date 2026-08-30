import { createCapabilityRegistry } from './capability_registry.mjs';
import { discoverKeymasterEnvSource, inventoryKeymasterEnv } from './keymaster_vault.mjs';

export const INTELLIGENCE_FOUNDATION_SCHEMA='othrys.os.intelligence-foundation.v1';
export function createIntelligenceFoundation({capabilities=[],now=()=>new Date().toISOString(),keymasterSource=discoverKeymasterEnvSource()}={}){
  const registry=createCapabilityRegistry(capabilities,{now});
  const credentials=inventoryKeymasterEnv(keymasterSource);
  const credentialByEnv=new Map((credentials.credentials??[]).map(x=>[x.envVar,x]));
  const unifiedView=()=>Object.freeze({schema:INTELLIGENCE_FOUNDATION_SCHEMA,generatedAt:now(),capabilities:Object.freeze(registry.all().map(c=>Object.freeze({id:c.id,provider:c.provider,category:c.category,readiness:c.readiness,health:c.health,credentialRequired:Boolean(c.credentialEnv),credentialPresent:c.credentialEnv?credentialByEnv.get(c.credentialEnv)?.present===true:true,userMustAct:c.readiness==='DISABLED'||c.health==='DOWN'||(Boolean(c.credentialEnv)&&credentialByEnv.get(c.credentialEnv)?.present!==true)}))),registry:registry.summary(),credentials:Object.freeze({available:credentials.available,credentialCount:credentials.credentialCount??0,present:(credentials.credentials??[]).filter(x=>x.present).length,secretValuesExposed:false}),authorityGranted:false,executionStarted:false});
  return Object.freeze({schema:INTELLIGENCE_FOUNDATION_SCHEMA,registry,credentials,unifiedView,authorityGranted:false,executionStarted:false});
}
