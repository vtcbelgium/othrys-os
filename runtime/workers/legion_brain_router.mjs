import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import {
  discoverKeymasterCredentialSource,
  resolveSealedKeymasterCredential,
} from '../os/keymaster_vault.mjs';
import { evaluateJevViaOpenRouter } from '../os/jev_openrouter_transport.mjs';
import { createJevTrainingRun, createJevObservation } from '../os/jev_cortex.mjs';

const ROOT=resolve(import.meta.dirname,'../..');

function readInput(){
  const raw=readFileSync(0,'utf8');
  let value;
  try{ value=JSON.parse(raw); }catch{ throw new Error('BRAIN_INPUT_INVALID_JSON'); }
  if(!value||typeof value!=='object'||Array.isArray(value)) throw new Error('BRAIN_INPUT_INVALID');
  if(value.schema!=='othrys.legion.brain-request.v1') throw new Error('BRAIN_INPUT_SCHEMA_INVALID');
  const state=String(value.state??'').trim();
  if(!state||state.length>2000) throw new Error('BRAIN_STATE_INVALID');
  const model=String(value.model??'jev-1.13.0').trim();
  if(model!=='jev-1.13.0'&&model!=='jev-latest') throw new Error('BRAIN_MODEL_NOT_ADMITTED');
  return {state,model};
}

async function main(){
  const {state,model}=readInput();
  const qdoc=JSON.parse(readFileSync(resolve(ROOT,'training/jev/question-sets.json'),'utf8'));
  const questions=qdoc.questionSets?.['router.v1']?.questions;
  if(!questions) throw new Error('BRAIN_QUESTION_SET_MISSING');

  const source=discoverKeymasterCredentialSource();
  const sealed=resolveSealedKeymasterCredential(
    source,
    'OPENROUTER_API_KEY',
    {consumer:'legion-brain-router',readOnly:true,authorityGranted:false},
  );
  if(!sealed.ok) throw new Error('BRAIN_OPENROUTER_CREDENTIAL_UNAVAILABLE');

  const started=performance.now();
  const remote=await evaluateJevViaOpenRouter({
    sealedCredential:sealed.value,
    model,
    state,
    questions,
  });
  const latencyMs=Math.round((performance.now()-started)*100)/100;

  const run=createJevTrainingRun({
    circuitId:'router',
    provider:'OPENROUTER',
    requestedModel:model,
    questionSetId:'router.v1',
    state,
  });
  const observation=createJevObservation({
    run,
    resolvedModel:remote.resolvedModel,
    answers:remote.answers,
    usage:remote.usage,
  });

  process.stdout.write(JSON.stringify({
    schema:'othrys.legion.brain-response.v1',
    observation,
    transport:{
      provider:'OPENROUTER',
      latencyMs,
      actualCostUsd:remote.actualCostUsd,
      postflightBudgetStatus:remote.postflightBudgetStatus,
      costGuard:remote.costGuard,
    },
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
