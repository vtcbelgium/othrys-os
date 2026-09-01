import {createHash} from 'node:crypto';
const sha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export const TRAINING_LEARNING_ORGANS=Object.freeze(['MNEMOSYNE','HEPHAESTUS','TALOS','PROMETHEUS','KRONOS','RHEA','MYCELIUM','SWITCHYARD']);
export const TRAINING_LEARNING_LAW=Object.freeze({centralVerifier:'TALOS',loop:'OBSERVE -> TALOS VERIFY -> SYNTHESIZE -> CROSS-ORGAN ADAPT -> RE-VERIFY',loggingIsNotLearning:true,verifiedAdaptationRequired:true,authorityGranted:false});
export function createTrainingLearningReceipt(input={}){
  const required=['jobId','level','title','family','contract','startedAt','completedAt','stockCheck','buildAttempts','talos','blockDisposition','nextJob'];
  for(const k of required) if(input[k]===undefined) throw new Error(`TRAINING_LEARNING_REQUIRED:${k}`);
  const organs={
    MNEMOSYNE:{learn:['task contract','stock matches','final artifact','failure/repair lessons','provenance'],adapt:['index verified lessons','increase retrieval weight for proven stock']},
    HEPHAESTUS:{learn:['builder chosen','prompt contract','attempt count','repair cause','first-pass success'],adapt:['builder quality evidence','repair strategy evidence']},
    TALOS:{learn:['oracle fixtures','failure class','repair verification','final pass rate'],adapt:['oracle coverage','failure classifiers','cross-organ synthesis']},
    PROMETHEUS:{learn:['knowledge gaps','research need','external-tech opportunity'],adapt:['focus research on repeated verified gaps']},
    KRONOS:{learn:['wall time','attempt timing','timeouts','sequence progression'],adapt:['bounded timeout recommendations']},
    RHEA:{learn:['failure streak','recovery after repair','latency/resource regression','care signal'],adapt:['diagnostic/care priority']},
    MYCELIUM:{learn:['route/model/device','resource before/after','latency','throttle/pressure','successful trail'],adapt:['placement preference evidence']},
    SWITCHYARD:{learn:['eligible route','selected builder','cost/locality','route outcome'],adapt:['route preference evidence']}
  };
  const body={schema:'othrys.os.training-learning-receipt.v2',...input,learningLaw:TRAINING_LEARNING_LAW,organs,trainingDataClass:'HIGH_VALUE_OPERATIONAL_LEARNING',learningMayAdaptFutureRecommendations:true,learningMayGrantAuthority:false,authorityGranted:false,executionStarted:false};
  return Object.freeze({...body,receiptDigest:sha(body)});
}
