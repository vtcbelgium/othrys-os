import { discoverKeymasterEnvSource, inventoryKeymasterEnv, resolveSealedEnvCredential } from '../../runtime/os/keymaster_vault.mjs';
import { KEYMASTER_SAFE_PROVIDER_PROBES, runSafeProviderProbe } from '../../runtime/os/provider_probe.mjs';
import { classifyCredentialHealth,KEYMASTER_ACTION_REQUIRED } from '../../runtime/os/keymaster.mjs';
import { providerQuarantine,activeHealthRows } from '../../runtime/os/keymaster_quarantine.mjs';
const source=discoverKeymasterEnvSource(), inventory=inventoryKeymasterEnv(source), rows=[], now=new Date().toISOString();
for(const item of inventory.credentials??[]){
  const quarantine=providerQuarantine(item.envVar);
  if(quarantine){rows.push({envVar:item.envVar,status:'QUARANTINED',healthState:'quarantined',actionRequired:false,probeSupported:false,quarantined:true,quarantineReason:quarantine.reason,providerId:quarantine.providerId});continue;}
  if(item.present===false){rows.push({envVar:item.envVar,status:'ABSENT',healthState:'missing',actionRequired:true,probeSupported:false});continue;}
  if(!(item.envVar in KEYMASTER_SAFE_PROVIDER_PROBES)){rows.push({envVar:item.envVar,status:'CONFIGURED_UNVERIFIED',healthState:'configured-unverified',actionRequired:false,probeSupported:false});continue;}
  const sealed=resolveSealedEnvCredential(source,item.envVar,{consumer:'keymaster-live-health',readOnly:true,authorityGranted:false});
  const probe=sealed.ok?await runSafeProviderProbe({envVar:item.envVar,sealedCredential:sealed.value}):{healthy:false,supported:true,status:null,reason:sealed.reason};
  const healthState=classifyCredentialHealth({present:true,enabled:true,now,httpStatus:probe.status??null});
  rows.push({envVar:item.envVar,status:probe.healthy?'HEALTHY':'DEGRADED',healthState,actionRequired:KEYMASTER_ACTION_REQUIRED.includes(healthState),probeSupported:true,providerId:probe.providerId??null,httpStatus:probe.status??null,modelCount:probe.modelCount??null});
}
const active=activeHealthRows(rows), checked=active.filter(x=>x.probeSupported), result={schema:'othrys.os.keymaster-live-health.v1',credentialCount:rows.length,probed:checked.length,healthy:checked.filter(x=>x.status==='HEALTHY').length,degraded:checked.filter(x=>x.status==='DEGRADED').length,actionRequired:active.filter(x=>x.actionRequired).length,quarantined:rows.filter(x=>x.quarantined).length,configuredUnverified:rows.filter(x=>x.status==='CONFIGURED_UNVERIFIED').length,absent:rows.filter(x=>x.status==='ABSENT').length,statuses:rows,secretValuesExposed:false,authorityGranted:false,executionStarted:false};
console.log(JSON.stringify(result,null,2)); if(process.argv.includes('--strict')&&result.actionRequired>0)process.exitCode=1;
