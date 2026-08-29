import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const LOOP_REGISTRY_SCHEMA='othrys.os.loop-registry.v1';

const LOOPS=Object.freeze([
  {id:'command-deck.admission-watcher',componentId:'command-deck',owner:'GPT_CONTROL',kind:'POLL',source:'runtime/command-deck/admission_watcher.ts',trigger:'intent inbox observation',budget:'poll >=1000ms; --once supported',verifier:'Trust Canal admission result',terminal:['ONCE_COMPLETE','PROCESS_STOP'],optimization:'EVENT_TRIGGER_CANDIDATE',signals:['--once','pollMs','setTimeout','admitCompleteIntents'],contractSignals:['>=1000ms','default 5000ms','--once']},
  {id:'mycelium.telemetry-push',componentId:'mycelium',owner:'GPT_CONTROL',kind:'CADENCE',source:'runtime/command-deck/push-legion-telemetry.mjs',trigger:'node health sampling cadence',budget:'interval >=5000ms; request timeout 4000ms; --once supported',verifier:'receiver ok + authorityGranted false',terminal:['ONCE_COMPLETE','PROCESS_STOP'],optimization:'ADAPTIVE_CADENCE_CANDIDATE',signals:['--once','intervalMs','AbortSignal.timeout(4000)','await push()'],contractSignals:['>=5000ms','default 10000ms','4000ms']},
  {id:'othrys-os.housekeeper',componentId:'othrys-os',owner:'GPT_CONTROL',kind:'CADENCE',source:'runtime/os/housekeeper_daemon.mjs',trigger:'housekeeping cadence',budget:'interval >=60000ms; full verification every 12 cycles',verifier:'fast/full tests + Mnemosyne quality',terminal:['PROCESS_STOP'],optimization:'KEEP_CHEAP_FAST_PATH',signals:['for(;;)','cycleNo%12===0','verifyFast()','inspectMnemosyneQuality'],contractSignals:['>=60s','default 5m','every 12 cycles']},
  {id:'talos.retry-replay',componentId:'talos',owner:'TALOS',kind:'RETRY',source:'runtime/talos-kernel/loop.ts',trigger:'admitted verification work',budget:'RetryPolicy.maxAttempts with bounded exponential backoff',verifier:'deps.verify external evidence gate',terminal:['SUCCEEDED','FAILED','DEAD_LETTERED'],optimization:'REFERENCE_LOOP',signals:['policy.maxAttempts','deps.verify','op.dead_lettered','decideRetry'],contractSignals:['default 3','1s base','factor 2','60s cap']},
  {id:'factory.build-attempts',componentId:'factory',owner:'GPT_CONTROL',kind:'ATTEMPT',source:'runtime/factory/plan.ts',trigger:'admitted Factory build plan',budget:'maxAttempts=3 in engineering command',verifier:'independent product verifier',terminal:['VERIFIED_CANDIDATE','FAIL','BLOCKED'],optimization:'TRACE_COMPRESSION_CANDIDATE',signals:['maxAttempts: 3','independent product verifier must pass'],contractSignals:['maxAttempts=3']},
  {id:'factory.refinement',componentId:'factory',owner:'GPT_CONTROL',kind:'GATED_REFINEMENT',source:'runtime/factory/ai_refine.ts',trigger:'qualified critique with negative gap evidence',budget:'bounded by mission; no free-running loop',verifier:'qualified evidence + candidate identity + operator gate',terminal:['NO_CHANGE_JUSTIFIED','WAITING_OPERATOR_ACCEPTANCE','FAIL'],optimization:'KEEP_GATED',signals:['NO_CHANGE_JUSTIFIED','REFINE_ALLOWED','gapEvidence','authorityGranted: false'],contractSignals:['negative gap evidence']},
  {id:'hephaestus.repair-attempts',componentId:'hephaestus',owner:'HEPHAESTUS',kind:'ATTEMPT',source:'runtime/hephaestus/authority.ts',trigger:'admitted engineering request or verifier failure packet',budget:'1..5 attempts by frozen engineering command',verifier:'Talos / frozen acceptance checks',terminal:['CANDIDATE_FOR_REVIEW','BLOCKED','ATTEMPTS_EXHAUSTED'],optimization:'STRUCTURED_DIAGNOSIS',signals:['MAX_ATTEMPTS_INVALID','failurePacket','smallest correction','verifyMutationScope'],contractSignals:['1..5 attempts']},
]);

export function loopRegistry(root){
  const rows=LOOPS.map(row=>{
    const sourcePath=join(root,...row.source.split('/'));
    const contractPath=join(root,'contracts','components',`${row.componentId}.md`);
    return Object.freeze({...row,sourcePresent:existsSync(sourcePath),contractPresent:existsSync(contractPath),authorityGranted:false});
  });
  return Object.freeze({schema:LOOP_REGISTRY_SCHEMA,loops:Object.freeze(rows),authorityGranted:false,executionStarted:false});
}

export function loopOptimizationPlan(root){
  const registry=loopRegistry(root);
  const policy={
    EVENT_TRIGGER_CANDIDATE:{priority:'P1',decision:'MEASURE_THEN_ADAPT',nextEvidence:'idle/no-work poll ratio + event reliability'},
    ADAPTIVE_CADENCE_CANDIDATE:{priority:'P2',decision:'MEASURE_THEN_ADAPT',nextEvidence:'state-change rate + stale-telemetry tolerance'},
    KEEP_CHEAP_FAST_PATH:{priority:'P3',decision:'KEEP',nextEvidence:'fast/full pass yield and runtime cost'},
    REFERENCE_LOOP:{priority:'P3',decision:'KEEP_REFERENCE',nextEvidence:'retry classification + verifier yield'},
    TRACE_COMPRESSION_CANDIDATE:{priority:'P1',decision:'CAPTURE_TRACES',nextEvidence:'3+ repeated externally-passing action families'},
    KEEP_GATED:{priority:'P3',decision:'KEEP',nextEvidence:'gap-to-mutation yield and operator rejection rate'},
    STRUCTURED_DIAGNOSIS:{priority:'P0',decision:'WEAVE_DIAGNOSIS',nextEvidence:'first-causal-blocker resolution + repeated-failure rate'},
  };
  const recommendations=registry.loops.map(loop=>Object.freeze({loopId:loop.id,componentId:loop.componentId,...policy[loop.optimization],authorityGranted:false})).sort((a,b)=>a.priority.localeCompare(b.priority)||a.loopId.localeCompare(b.loopId));
  return Object.freeze({schema:'othrys.os.loop-optimization-plan.v1',recommendations:Object.freeze(recommendations),authorityGranted:false,automaticMutation:false,automaticPromotion:false});
}
