import { readFileSync } from 'node:fs';
import {
  discoverKeymasterCredentialSource,
  resolveSealedKeymasterCredential,
} from '../os/keymaster_vault.mjs';
import { evaluatePollinationsAdvisory } from '../os/pollinations_transport.mjs';

function input(){
  let value;
  try{value=JSON.parse(readFileSync(0,'utf8'));}catch{throw new Error('ADVISORY_INPUT_INVALID_JSON');}
  if(!value||value.schema!=='othrys.legion.advisory-request.v1') throw new Error('ADVISORY_INPUT_SCHEMA_INVALID');
  const prompt=String(value.prompt??'').trim();
  const context=String(value.context??'').trim();
  if(!prompt||prompt.length>2000) throw new Error('ADVISORY_PROMPT_INVALID');
  if(!context||context.length>14000) throw new Error('ADVISORY_CONTEXT_INVALID');
  return {prompt,context};
}

const SYSTEM=[
  'You are the OTHRYS read-only evidence analyst.',
  'Use only explicit facts from EVIDENCE.',
  'Never infer completion, health, success, or state from names, labels, branch names, filenames, or commit titles.',
  'Do not claim you changed or executed anything.',
  'If evidence is insufficient, say unknown.',
  'Answer in at most three short factual sentences.',
].join(' ');
async function runLocal(prompt,context){
  const response=await fetch('http://127.0.0.1:11434/api/chat',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
      model:process.env.OTHRYS_BRAIN_ADVISORY_MODEL?.trim()||'qwen3-fast:latest',
      messages:[
        {role:'system',content:SYSTEM},
        {role:'user',content:'QUESTION:\n'+prompt+'\n\nEVIDENCE:\n'+context},
      ],
      stream:false,
      think:false,
      keep_alive:'2h',
      options:{temperature:0,num_predict:120},
    }),
    signal:AbortSignal.timeout(35000),
  });
  if(!response.ok) throw new Error('ADVISORY_OLLAMA_HTTP_'+response.status);
  const body=await response.json();
  const answer=String(body?.message?.content??'').trim();
  if(!answer) throw new Error('ADVISORY_EMPTY');
  return Object.freeze({
    provider:'OLLAMA',
    model:String(body?.model??process.env.OTHRYS_BRAIN_ADVISORY_MODEL??'qwen3-fast:latest'),
    text:answer.slice(0,4000),
    local:true,
    costClass:'ZERO',
  });
}
async function runPollinations(prompt,context){
  const source=discoverKeymasterCredentialSource();
  const sealed=resolveSealedKeymasterCredential(
    source,
    'POLLINATIONS_API_KEY',
    {consumer:'legion-brain-advisory',readOnly:true,authorityGranted:false},
  );
  if(!sealed.ok) throw new Error('ADVISORY_POLLINATIONS_CREDENTIAL_UNAVAILABLE');
  const result=await evaluatePollinationsAdvisory({
    sealedCredential:sealed.value,
    prompt,
    context,
    preferredModel:process.env.OTHRYS_BRAIN_POLLINATIONS_MODEL?.trim()||null,
  });
  return Object.freeze({
    provider:'POLLINATIONS',
    model:result.resolvedModel,
    text:result.text,
    local:false,
    costClass:result.costClass,
    estimatedMaxPollen:result.estimatedMaxPollen,
    usage:result.usage,
  });
}

async function main(){
  const {prompt,context}=input();
  const mode=(process.env.OTHRYS_BRAIN_ADVISORY_PROVIDER||'local-first').trim().toLowerCase();
  let result;
  if(mode==='pollinations'){
    result=await runPollinations(prompt,context);
  }else if(mode==='local'){
    result=await runLocal(prompt,context);
  }else if(mode==='local-first'){
    try{
      result=await runLocal(prompt,context);
    }catch(localError){
      if(process.env.OTHRYS_BRAIN_POLLINATIONS_FALLBACK!=='1') throw localError;
      result=await runPollinations(prompt,context);
    }
  }else{
    throw new Error('ADVISORY_PROVIDER_UNSUPPORTED');
  }

  process.stdout.write(JSON.stringify({
    schema:'othrys.legion.advisory-response.v1',
    ...result,
    secretValuesExposed:false,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  }));
}

main().catch(error=>{
  process.stderr.write(String(error?.message??error));
  process.exitCode=1;
});
