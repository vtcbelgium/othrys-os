const SAFE_PROBES=Object.freeze({
  GROQ_API_KEY:{providerId:'groq',url:'https://api.groq.com/openai/v1/models',header:'authorization',prefix:'Bearer '},
  OPENROUTER_API_KEY:{providerId:'openrouter',url:'https://openrouter.ai/api/v1/models',header:'authorization',prefix:'Bearer '},
  NVIDIA_API_KEY:{providerId:'nvidia',url:'https://integrate.api.nvidia.com/v1/models',header:'authorization',prefix:'Bearer '},
  OPENAI_API_KEY:{providerId:'openai',url:'https://api.openai.com/v1/models',header:'authorization',prefix:'Bearer '},
  GOOGLE_API_KEY:{providerId:'google',url:'https://generativelanguage.googleapis.com/v1beta/models',header:'x-goog-api-key',prefix:''},
  CEREBRAS_API_KEY:{providerId:'cerebras',url:'https://api.cerebras.ai/v1/models',header:'authorization',prefix:'Bearer '},
  MISTRAL_API_KEY:{providerId:'mistral',url:'https://api.mistral.ai/v1/models',header:'authorization',prefix:'Bearer '},
  TOGETHER_API_KEY:{providerId:'together',url:'https://api.together.xyz/v1/models',header:'authorization',prefix:'Bearer '},
  FIREWORKS_API_KEY:{providerId:'fireworks',url:'https://api.fireworks.ai/inference/v1/models',header:'authorization',prefix:'Bearer '},
  HUGGINGFACE_API_KEY:{providerId:'huggingface',url:'https://router.huggingface.co/v1/models',header:'authorization',prefix:'Bearer '}
});
export { SAFE_PROBES as KEYMASTER_SAFE_PROVIDER_PROBES };

export async function runSafeProviderProbe({envVar,sealedCredential,fetchImpl=fetch,timeoutMs=8000}={}){
  const spec=SAFE_PROBES[envVar]; if(!spec) return Object.freeze({schema:'othrys.os.provider-probe.v1',supported:false,envVar,reason:'NO_SAFE_READ_ONLY_PROBE',authorityGranted:false,executionStarted:false});
  if(!sealedCredential||typeof sealedCredential.applyToHeader!=='function') throw new Error('PROVIDER_PROBE_SEALED_CREDENTIAL_REQUIRED');
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),Math.max(1000,Math.min(15000,timeoutMs)));
  try{const headers=sealedCredential.applyToHeader({'accept':'application/json'},spec.header,spec.prefix);const response=await fetchImpl(spec.url,{method:'GET',headers,signal:ctrl.signal,redirect:'error'});let modelCount=null;if(response.ok){try{const body=await response.json();const rows=body?.data??body?.models??body;modelCount=Array.isArray(rows)?rows.length:null;}catch{}}return Object.freeze({schema:'othrys.os.provider-probe.v1',supported:true,providerId:spec.providerId,status:response.status,healthy:response.ok,modelCount,bodyPersisted:false,secretExposed:false,costClass:'ZERO_METADATA',authorityGranted:false,executionStarted:false});}
  catch(error){return Object.freeze({schema:'othrys.os.provider-probe.v1',supported:true,providerId:spec.providerId,status:null,healthy:false,error:String(error?.name??'probe-failed'),bodyPersisted:false,secretExposed:false,costClass:'ZERO_METADATA',authorityGranted:false,executionStarted:false});}
  finally{clearTimeout(timer);}
}
