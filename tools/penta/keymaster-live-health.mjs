import { discoverKeymasterEnvSource, inventoryKeymasterEnv, resolveSealedEnvCredential } from '../../runtime/os/keymaster_vault.mjs';
import { KEYMASTER_SAFE_PROVIDER_PROBES, runSafeProviderProbe } from '../../runtime/os/provider_probe.mjs';
const source=discoverKeymasterEnvSource(), inventory=inventoryKeymasterEnv(source), rows=[];
for(const item of inventory.credentials??[]){
  if(item.present===false){rows.push({envVar:item.envVar,status:'ABSENT',probeSupported:false});continue;}
  if(!(item.envVar in KEYMASTER_SAFE_PROVIDER_PROBES)){rows.push({envVar:item.envVar,status:'CONFIGURED_UNVERIFIED',probeSupported:false});continue;}
  const sealed=resolveSealedEnvCredential(source,item.envVar,{consumer:'keymaster-live-health',readOnly:true,authorityGranted:false});
  const probe=sealed.ok?await runSafeProviderProbe({envVar:item.envVar,sealedCredential:sealed.value}):{healthy:false,supported:true,reason:sealed.reason};
  rows.push({envVar:item.envVar,status:probe.healthy?'HEALTHY':'DEGRADED',probeSupported:true,providerId:probe.providerId??null,httpStatus:probe.status??null,modelCount:probe.modelCount??null});
}
const checked=rows.filter(x=>x.probeSupported), result={schema:'othrys.os.keymaster-live-health.v1',credentialCount:rows.length,probed:checked.length,healthy:checked.filter(x=>x.status==='HEALTHY').length,degraded:checked.filter(x=>x.status==='DEGRADED').length,configuredUnverified:rows.filter(x=>x.status==='CONFIGURED_UNVERIFIED').length,absent:rows.filter(x=>x.status==='ABSENT').length,statuses:rows,secretValuesExposed:false,authorityGranted:false,executionStarted:false};
console.log(JSON.stringify(result,null,2)); if(process.argv.includes('--strict')&&result.degraded>0)process.exitCode=1;
