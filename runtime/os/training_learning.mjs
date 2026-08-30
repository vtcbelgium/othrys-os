import {createHash} from 'node:crypto';
const sha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export const TRAINING_LEARNING_ORGANS=Object.freeze(['MNEMOSYNE','HEPHAESTUS','TALOS','PROMETHEUS','KRONOS','RHEA','MYCELIUM','SWITCHYARD']);
export function createTrainingLearningReceipt(input={}){
  const required=['jobId','level','title','family','contract','startedAt','completedAt','stockCheck','buildAttempts','talos','blockDisposition','nextJob'];
  for(const k of required) if(input[k]===undefined) throw new Error(`TRAINING_LEARNING_REQUIRED:${k}`);
  const organs={
    MNEMOSYNE:{learn:['task contract','stock matches','final artifact','failure/repair lessons','provenance']},
    HEPHAESTUS:{learn:['builder chosen','prompt contract','attempt count','repair cause','first-pass success']},
    TALOS:{learn:['oracle fixtures','failure class','repair verification','final pass rate']},
    PROMETHEUS:{learn:['knowledge gaps','research need','external-tech opportunity']},
    KRONOS:{learn:['wall time','attempt timing','timeouts','sequence progression']},
    RHEA:{learn:['failure streak','recovery after repair','latency/resource regression','care signal']},
    MYCELIUM:{learn:['route/model/device','resource before/after','latency','throttle/pressure','successful trail']},
    SWITCHYARD:{learn:['eligible route','selected builder','cost/locality','route outcome']}
  };
  const body={schema:'othrys.os.training-learning-receipt.v1',...input,organs,trainingDataClass:'HIGH_VALUE_OPERATIONAL_LEARNING',learningMayInformFutureRecommendations:true,learningMayGrantAuthority:false,authorityGranted:false,executionStarted:false};
  return Object.freeze({...body,receiptDigest:sha(body)});
}
