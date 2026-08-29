const SAFE_PROBES=Object.freeze({
  GROQ_API_KEY:{providerId:'groq',url:'https://api.groq.com/openai/v1/models',auth:'bearer',costClass:'ZERO'},
  OPENROUTER_API_KEY:{providerId:'openrouter',url:'https://openrouter.ai/api/v1/models',auth:'bearer',costClass:'ZERO'},
  NVIDIA_API_KEY:{providerId:'nvidia',url:'https://integrate.api.nvidia.com/v1/models',auth:'bearer',costClass:'ZERO'}
});
export { SAFE_PROBES as KEYMASTER_SAFE_PROVIDER_PROBES };

export async function runSafeProviderProbe({envVar,sealedCredential,fetchImpl=fetch,timeoutMs=8000}={}){
  const spec=SAFE_PROBES[envVar]; if(!spec) return Object.freeze({schema:'othrys.os.provider-probe.v1',supported:false,envVar,reason:'NO_SAFE_READ_ONLY_PROBE',authorityGranted:false,executionStarted:false});
  if(!sealedCredential||typeof sealedCredential.applyToHeader!=='function') throw new Error('PROVIDER_PROBE_SEALED_CREDENTIAL_REQUIRED');
  if(spec.costClass!=='ZERO') throw new Error('PROVIDER_PROBE_ZERO_COST_REQUIRED');
  const ctrl=new AbortController(), timer=setTimeout(()=>ctrl.abort(),Math.max(1000,Math.min(15000,timeoutMs)));
  try{
    const headers=sealedCredential.applyToHeader({'accept':'application/json'});
    const response=await fetchImpl(spec.url,{method:'GET',headers,signal:ctrl.signal,redirect:'error'});
    let modelCount=null; if(response.ok){try{const body=await response.json();modelCount=Array.isArray(body?.data)?body.data.length:Array.isArray(body)?body.length:null;}catch{}}
    return Object.freeze({schema:'othrys.os.provider-probe.v1',supported:true,providerId:spec.providerId,status:response.status,healthy:response.ok,modelCount,bodyPersisted:false,secretExposed:false,costClass:'ZERO',authorityGranted:false,executionStarted:false});
  }catch(error){return Object.freeze({schema:'othrys.os.provider-probe.v1',supported:true,providerId:spec.providerId,status:null,healthy:false,error:String(error?.name??'probe-failed'),bodyPersisted:false,secretExposed:false,costClass:'ZERO',authorityGranted:false,executionStarted:false});}
  finally{clearTimeout(timer);}
}
