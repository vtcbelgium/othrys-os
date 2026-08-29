const SAFE_PROBES=Object.freeze({
  GROQ_API_KEY:{providerId:'groq',url:'https://api.groq.com/openai/v1/models'},
  OPENROUTER_API_KEY:{providerId:'openrouter',url:'https://openrouter.ai/api/v1/models'},
  NVIDIA_API_KEY:{providerId:'nvidia',url:'https://integrate.api.nvidia.com/v1/models'},
  OPENAI_API_KEY:{providerId:'openai',url:'https://api.openai.com/v1/models'},
  GOOGLE_API_KEY:{providerId:'google',url:'https://generativelanguage.googleapis.com/v1beta/models',header:'x-goog-api-key',prefix:''},
  CEREBRAS_API_KEY:{providerId:'cerebras',url:'https://api.cerebras.ai/v1/models'},
  MISTRAL_API_KEY:{providerId:'mistral',url:'https://api.mistral.ai/v1/models'},
  TOGETHER_API_KEY:{providerId:'together',url:'https://api.together.xyz/v1/models'},
  FIREWORKS_API_KEY:{providerId:'fireworks',url:'https://api.fireworks.ai/inference/v1/models'},
  HUGGINGFACE_API_KEY:{providerId:'huggingface',url:'https://router.huggingface.co/v1/models'},
  ANTHROPIC_API_KEY:{providerId:'anthropic',url:'https://api.anthropic.com/v1/models?limit=1',header:'x-api-key',prefix:'',extraHeaders:{'anthropic-version':'2023-06-01'}},
  COHERE_API_KEY:{providerId:'cohere',url:'https://api.cohere.com/v1/models?page_size=1'},
  GITHUB_TOKEN:{providerId:'github',url:'https://api.github.com/user',extraHeaders:{'user-agent':'othrys-keymaster-health'}},
  VERCEL_TOKEN:{providerId:'vercel',url:'https://api.vercel.com/v2/user'},
  SUPABASE_ACCESS_TOKEN:{providerId:'supabase-mgmt',url:'https://api.supabase.com/v1/projects'},
  CLOUDFLARE_API_TOKEN:{providerId:'cloudflare',url:'https://api.cloudflare.com/client/v4/user/tokens/verify'}
});
export { SAFE_PROBES as KEYMASTER_SAFE_PROVIDER_PROBES };
export async function runSafeProviderProbe({envVar,sealedCredential,fetchImpl=fetch,timeoutMs=8000}={}){
  const spec=SAFE_PROBES[envVar]; if(!spec) return Object.freeze({schema:'othrys.os.provider-probe.v1',supported:false,envVar,reason:'NO_SAFE_READ_ONLY_PROBE',authorityGranted:false,executionStarted:false});
  if(!sealedCredential||typeof sealedCredential.applyToHeader!=='function') throw new Error('PROVIDER_PROBE_SEALED_CREDENTIAL_REQUIRED');
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),Math.max(1000,Math.min(15000,timeoutMs)));
  try{
    const header=spec.header??'authorization',prefix=spec.prefix??'Bearer ';
    const headers=sealedCredential.applyToHeader({'accept':'application/json',...(spec.extraHeaders??{})},header,prefix);
    const response=await fetchImpl(spec.url,{method:'GET',headers,signal:ctrl.signal,redirect:'error'});
    let modelCount=null;
    if(response.ok){try{const body=await response.json();const rows=body?.data??body?.models??body?.result??body;modelCount=Array.isArray(rows)?rows.length:null;}catch{}}
    return Object.freeze({schema:'othrys.os.provider-probe.v1',supported:true,providerId:spec.providerId,status:response.status,healthy:response.ok,modelCount,bodyPersisted:false,secretExposed:false,costClass:'ZERO_METADATA',authorityGranted:false,executionStarted:false});
  }catch(error){return Object.freeze({schema:'othrys.os.provider-probe.v1',supported:true,providerId:spec.providerId,status:null,healthy:false,error:String(error?.name??'probe-failed'),bodyPersisted:false,secretExposed:false,costClass:'ZERO_METADATA',authorityGranted:false,executionStarted:false});}
  finally{clearTimeout(timer);}
}
