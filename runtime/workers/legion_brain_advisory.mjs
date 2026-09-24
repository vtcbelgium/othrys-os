import { readFileSync } from 'node:fs';

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

async function main(){
  const {prompt,context}=input();
  const system=[
    'You are the OTHRYS read-only evidence analyst.',
    'Use only explicit facts from EVIDENCE.',
    'Never infer completion, health, success, or state from names, labels, branch names, filenames, or commit titles.',
    'Do not claim you changed or executed anything.',
    'If evidence is insufficient, say unknown.',
    'Answer in at most three short factual sentences.',
  ].join(' ');
  const response=await fetch('http://127.0.0.1:11434/api/chat',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
      model:process.env.OTHRYS_BRAIN_ADVISORY_MODEL?.trim()||'qwen3-fast:latest',
      messages:[
        {role:'system',content:system},
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
  process.stdout.write(JSON.stringify({
    schema:'othrys.legion.advisory-response.v1',
    model:String(body?.model??process.env.OTHRYS_BRAIN_ADVISORY_MODEL??'qwen3-fast:latest'),
    text:answer.slice(0,4000),
    local:true,
    costClass:'ZERO',
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  }));
}
main().catch(error=>{
  process.stderr.write(String(error?.message??error));
  process.exitCode=1;
});
