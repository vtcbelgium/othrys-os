import { createHash } from 'node:crypto';

export const LOOP_TRACE_SCHEMA='othrys.os.loop-trace.v1';
export const FAILURE_SCHEMA='othrys.os.loop-failure-diagnosis.v1';
const TERMINAL=new Set(['PASS','FAIL','BLOCKED','STALL','CANCELLED','WAIT','CONTINUE_PROPOSED']);
const FAILURE_CLASS=new Set(['TRANSIENT','SEMANTIC','VERIFICATION','ENVIRONMENT','AUTHORITY','UNKNOWN']);
const FORBIDDEN_KEYS=new Set(['reasoning','chainOfThought','prompt','rawPrompt','hiddenReasoning']);
const clean=v=>typeof v==='string'?v.trim():'';
const sha=v=>createHash('sha256').update(String(v),'utf8').digest('hex');
function strictObject(value,keys,code){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error(code);
  for(const k of Object.keys(value)) if(!keys.has(k)||FORBIDDEN_KEYS.has(k)) throw new Error(code);
}

export function diagnoseLoopFailure(input){
  const keys=new Set(['failureClass','evidenceRef','changedAssumption','nextAction']); strictObject(input,keys,'LOOP_DIAGNOSIS_INVALID');
  const failureClass=clean(input.failureClass).toUpperCase(),evidenceRef=clean(input.evidenceRef),changedAssumption=clean(input.changedAssumption),nextAction=clean(input.nextAction);
  if(!FAILURE_CLASS.has(failureClass)||!evidenceRef||!changedAssumption||!nextAction) throw new Error('LOOP_DIAGNOSIS_INVALID');
  if(failureClass==='UNKNOWN'&&nextAction!=='STOP') throw new Error('UNKNOWN_FAILURE_MUST_STOP');
  return Object.freeze({schema:FAILURE_SCHEMA,failureClass,evidenceRef,changedAssumption,nextAction,authorityGranted:false});
}

export function makeLoopTrace(input){
  const keys=new Set(['loopId','componentId','attempt','triggerRef','stateBeforeDigest','stateAfterDigest','goalDigest','actionKind','actionDigest','semanticProgress','verifierStatus','terminalState','budgetRemaining','failureDiagnosis']); strictObject(input,keys,'LOOP_TRACE_INVALID');
  const loopId=clean(input.loopId),componentId=clean(input.componentId),triggerRef=clean(input.triggerRef),actionKind=clean(input.actionKind),verifierStatus=clean(input.verifierStatus).toUpperCase(),terminalState=clean(input.terminalState).toUpperCase();
  if(!loopId||!componentId||!triggerRef||!actionKind||!Number.isInteger(input.attempt)||input.attempt<1||typeof input.semanticProgress!=='boolean') throw new Error('LOOP_TRACE_INVALID');
  for(const d of [input.stateBeforeDigest,input.stateAfterDigest,input.goalDigest,input.actionDigest]) if(!/^[0-9a-f]{64}$/.test(String(d??''))) throw new Error('LOOP_TRACE_DIGEST_INVALID');
  if(!['PASS','FAIL','BLOCKED','NOT_RUN'].includes(verifierStatus)||!TERMINAL.has(terminalState)) throw new Error('LOOP_TRACE_STATE_INVALID');
  if(terminalState==='PASS'&&verifierStatus!=='PASS') throw new Error('LOOP_PASS_REQUIRES_VERIFIER_PASS');
  if(input.semanticProgress===true&&input.stateAfterDigest===input.stateBeforeDigest&&verifierStatus!=='PASS') throw new Error('SEMANTIC_PROGRESS_REQUIRES_DELTA');
  if(!input.budgetRemaining||typeof input.budgetRemaining!=='object'||Array.isArray(input.budgetRemaining)) throw new Error('LOOP_TRACE_BUDGET_INVALID');
  for(const [k,v] of Object.entries(input.budgetRemaining)) if(!Number.isFinite(v)||v<0) throw new Error(`LOOP_TRACE_BUDGET_INVALID:${k}`);
  if(terminalState==='CONTINUE_PROPOSED'&&'attempts' in input.budgetRemaining&&input.budgetRemaining.attempts<1) throw new Error('LOOP_CONTINUE_WITHOUT_BUDGET');
  const failureDiagnosis=input.failureDiagnosis?diagnoseLoopFailure(input.failureDiagnosis):null;
  if(verifierStatus==='FAIL'&&!failureDiagnosis) throw new Error('FAILED_TRACE_REQUIRES_DIAGNOSIS');
  return Object.freeze({schema:LOOP_TRACE_SCHEMA,loopId,componentId,attempt:input.attempt,triggerRef,stateBeforeDigest:input.stateBeforeDigest,stateAfterDigest:input.stateAfterDigest,goalDigest:input.goalDigest,actionKind,actionDigest:input.actionDigest,semanticProgress:input.semanticProgress,verifierStatus,terminalState,budgetRemaining:Object.freeze({...input.budgetRemaining}),failureDiagnosis,authorityGranted:false,continuationAuthorized:false,traceDigest:sha(JSON.stringify(input))});
}

export function analyzeLoopTraces(traces){
  const rows=Array.isArray(traces)?traces:[];
  for(const row of rows) if(row?.schema!==LOOP_TRACE_SCHEMA||row.authorityGranted!==false) throw new Error('LOOP_TRACE_SET_INVALID');
  const attempts=rows.length,progress=rows.filter(x=>x.semanticProgress).length,passes=rows.filter(x=>x.verifierStatus==='PASS').length;
  let zeroStreak=0,maxZeroProgressStreak=0; for(const row of rows){zeroStreak=row.semanticProgress?0:zeroStreak+1;maxZeroProgressStreak=Math.max(maxZeroProgressStreak,zeroStreak);}
  const actions=new Map(),failures=new Map();
  for(const row of rows){
    const a=`${row.loopId}:${row.actionDigest}`; actions.set(a,(actions.get(a)??0)+1);
    if(row.failureDiagnosis){const f=`${row.loopId}:${row.failureDiagnosis.failureClass}:${row.failureDiagnosis.evidenceRef}`;failures.set(f,(failures.get(f)??0)+1);}
  }
  const repeatedActions=[...actions.entries()].filter(([,n])=>n>1).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  const repeatedFailures=[...failures.entries()].filter(([,n])=>n>1).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  const compressionCandidates=[];
  for(const [key,count] of actions){
    if(count<3)continue;
    const [loopId,actionDigest]=key.split(':'); const family=rows.filter(x=>x.loopId===loopId&&x.actionDigest===actionDigest);
    if(family.every(x=>x.semanticProgress&&x.verifierStatus==='PASS')) compressionCandidates.push({loopId,actionDigest,count,status:'CANDIDATE_ONLY',authorityGranted:false});
  }
  const redundantActionCount=repeatedActions.reduce((n,[,c])=>n+c-1,0);
  const health=attempts===0?'NO_EVIDENCE':repeatedFailures.length||maxZeroProgressStreak>=2?'STALL_RISK':passes>0&&progress>0?'HEALTHY':'OBSERVE';
  const optimizationSignals=[]; if(repeatedFailures.length)optimizationSignals.push('DIAGNOSE_REPEATED_FAILURE'); if(maxZeroProgressStreak>=2)optimizationSignals.push('STOP_ZERO_PROGRESS'); if(compressionCandidates.length)optimizationSignals.push('REVIEW_TRACE_COMPRESSION'); if(!optimizationSignals.length&&health==='HEALTHY')optimizationSignals.push('KEEP_CURRENT_LOOP');
  return Object.freeze({schema:'othrys.os.loop-analysis.v1',attempts,progressRate:attempts?progress/attempts:0,verifierPassRate:attempts?passes/attempts:0,redundantActionCount,redundantActionRate:attempts?redundantActionCount/attempts:0,maxZeroProgressStreak,health,optimizationSignals:Object.freeze(optimizationSignals),repeatedActions:Object.freeze(repeatedActions),repeatedFailures:Object.freeze(repeatedFailures),compressionCandidates:Object.freeze(compressionCandidates),authorityGranted:false,automaticPromotion:false});
}
