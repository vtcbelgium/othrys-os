import { createHash } from 'node:crypto';
import { makeLoopTrace } from './loop_trace.mjs';

const sha=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value),'utf8').digest('hex');
const eventTypes=events=>events.map(e=>e.t);

export function projectTalosLoopRun(run){
  if(!run||typeof run!=='object'||!Array.isArray(run.events)||!run.missionId) throw new Error('TALOS_LOOP_RUN_INVALID');
  const received=run.events.find(e=>e.t==='op.received');
  const maxAttempts=Number(received?.maxAttempts??run.attempts??0);
  if(!Number.isInteger(maxAttempts)||maxAttempts<1) throw new Error('TALOS_LOOP_BUDGET_INVALID');
  const starts=run.events.map((e,i)=>e.t==='op.running'?i:-1).filter(i=>i>=0);
  const goalDigest=sha({missionId:run.missionId,target:'SUCCEEDED',maxAttempts});
  const traces=[];
  for(let n=0;n<starts.length;n++){
    const start=starts[n],end=n+1<starts.length?starts[n+1]:run.events.length;
    const segment=run.events.slice(start,end),attempt=Number(segment[0]?.attempt??n+1);
    const terminal=segment.find(e=>['op.succeeded','op.failed','op.dead_lettered','op.retry_scheduled'].includes(e.t));
    if(!terminal) continue;
    const prefixBefore=run.events.slice(0,start),prefixAfter=run.events.slice(0,end);
    let verifierStatus='NOT_RUN',terminalState='WAIT',semanticProgress=false,failureDiagnosis=null;
    if(terminal.t==='op.succeeded') {verifierStatus='PASS';terminalState='PASS';semanticProgress=true;}
    else if(terminal.t==='op.failed') {terminalState='FAIL';failureDiagnosis={failureClass:'SEMANTIC',evidenceRef:`talos:${run.missionId}:event:${run.events.indexOf(terminal)}`,changedAssumption:'worker result is not retryable inside the frozen contract',nextAction:'STOP'};}
    else if(terminal.t==='op.retry_scheduled') {
      verifierStatus=segment.some(e=>e.t==='op.validating')?'FAIL':'NOT_RUN'; terminalState='CONTINUE_PROPOSED';
      failureDiagnosis={failureClass:verifierStatus==='FAIL'?'VERIFICATION':'TRANSIENT',evidenceRef:`talos:${run.missionId}:event:${run.events.indexOf(terminal)}`,changedAssumption:verifierStatus==='FAIL'?'candidate did not satisfy independent verification':'worker operation failed in a retryable way',nextAction:'RETRY_WITHIN_REMAINING_BUDGET'};
    } else {verifierStatus=segment.some(e=>e.t==='op.validating')?'FAIL':'NOT_RUN';terminalState='FAIL';failureDiagnosis={failureClass:verifierStatus==='FAIL'?'VERIFICATION':'TRANSIENT',evidenceRef:`talos:${run.missionId}:event:${run.events.indexOf(terminal)}`,changedAssumption:'attempt budget is exhausted',nextAction:'STOP'};}
    traces.push(makeLoopTrace({loopId:'talos.retry-replay',componentId:'talos',attempt,triggerRef:`mission:${run.missionId}`,stateBeforeDigest:sha(prefixBefore),stateAfterDigest:sha(prefixAfter),goalDigest,actionKind:'TALOS_ATTEMPT',actionDigest:sha(eventTypes(segment)),semanticProgress,verifierStatus,terminalState,budgetRemaining:{attempts:Math.max(0,maxAttempts-attempt)},failureDiagnosis}));
  }
  return Object.freeze({schema:'othrys.os.loop-projection.v1',source:'talos-loop-run',missionId:run.missionId,traces:Object.freeze(traces),authorityGranted:false,executionStarted:false});
}
