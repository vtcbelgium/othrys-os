const INTENTS=Object.freeze(['QUESTION','RESEARCH','PLAN','BUILD','OPERATION']);
const clean=v=>String(v??'').trim();

const OPERATION_RE=/\b(status(?!\s+(?:page|site|website|dashboard|component|endpoint)\b)|health|active mission|current mission|which builder|which model|quarry|heartbeat)\b/;
const BUILD_RE=/\b(build|implement|code|create|make|fix|repair|deploy|ship|restart|reconfigure|rotate|revoke|delete|drop|update|change|write|edit|remove|install|uninstall|apply|commit|push|merge|restore|migrate|publish)\b/;
const PLAN_RE=/\b(plan|design|architect|roadmap|spec|blueprint)\b/;
const RESEARCH_RE=/\b(research|investigate|compare|search|find out|look up|study)\b/;
const EXPLANATION_PREFIX_RE=/^(?:please\s+)?(?:what\b|why\b|how\b|explain\b|describe\b|tell me\b|discuss\b)/;
const NEGATION_START_RE=/^(?:please\s+)?(?:do\s+not|don't|dont|never)\b/;
const CONTRAST_RE=/\b(?:but|however|instead|then|just)\b\s*(.+)$/;

function positiveIntentSurface(input){
  const source=clean(input).toLowerCase();
  if(!source||source.length>2000) throw new Error('FRONT_DOOR_INPUT_INVALID');
  const kept=[];
  for(const raw of source.split(/[.!?;\n]+/)){
    let part=raw.trim();
    if(!part) continue;

    if(NEGATION_START_RE.test(part)){
      const contrast=part.match(CONTRAST_RE);
      if(contrast?.[1]) kept.push(contrast[1].trim());
      continue;
    }

    part=part.replace(/\bwithout\b.*$/,' ').trim();
    part=part.replace(/\b(?:do\s+not|don't|dont|never)\b.*$/,' ').trim();
    if(!part) continue;
    if(/^(?:read[- ]only|report only|inspect only|no changes?\b)/.test(part)) continue;
    kept.push(part);
  }
  return kept.join(' ').trim();
}

export function classifyFrontDoorIntent(input){
  const q=positiveIntentSurface(input);
  if(!q) return 'QUESTION';
  if(OPERATION_RE.test(q)) return 'OPERATION';
  if(EXPLANATION_PREFIX_RE.test(q)) return 'QUESTION';
  if(BUILD_RE.test(q)) return 'BUILD';
  if(PLAN_RE.test(q)) return 'PLAN';
  if(RESEARCH_RE.test(q)) return 'RESEARCH';
  return 'QUESTION';
}

export function frontDoorRequiresGovernedMission(input){
  const q=positiveIntentSurface(input);
  if(!q) return false;
  if(EXPLANATION_PREFIX_RE.test(q)&&!OPERATION_RE.test(q)) return false;
  return BUILD_RE.test(q)||PLAN_RE.test(q);
}

export function frontDoorDispatch(intent){
  if(!INTENTS.includes(intent)) throw new Error('FRONT_DOOR_INTENT_INVALID');
  const map={QUESTION:{organs:['MNEMOSYNE'],planner:null,needsModel:false},RESEARCH:{organs:['PROMETHEUS','MNEMOSYNE'],planner:'PROMETHEUS',needsModel:true},PLAN:{organs:['PROMETHEUS','MNEMOSYNE','HEPHAESTUS'],planner:'HEPHAESTUS',needsModel:true},BUILD:{organs:['MNEMOSYNE','HEPHAESTUS','TALOS','SWITCHYARD'],planner:'HEPHAESTUS',needsModel:true},OPERATION:{organs:['KRONOS','RHEA','TALOS','MNEMOSYNE'],planner:null,needsModel:false}};
  return Object.freeze({...map[intent],intent,authorityGranted:false,executionStarted:false});
}
function systemAnswer(q,status){
  const t=clean(q).toLowerCase();
  if(/what is othrys|what's othrys|who are you/.test(t)) return 'OTHRYS OS is the operating surface over the proven V2 machinery: Missions, Titans, Blocks, Mnemosyne, routing, nodes, Factory, Trust Canal and Talos evidence in one governed system.';
  if(/active mission|current mission/.test(t)) return `Active mission: ${status?.activeMission?.mission_id??'none'} · ${status?.activeMission?.status??'UNKNOWN'}.`;
  if(/which builder|builder.*use|which model|model.*build/.test(t)){const s=status?.builderSelection?.selected;return s?`Current engineering route: ${s.id} (${s.label}), ${s.locality}, ${s.costClass}, ${s.certification}.`:'No legal engineering builder is currently selected.';}
  if(/quarry/.test(t)) return status?.quarryClosed===true?'The Great Quarry is CLOSED with zero unreviewed final candidates.':'Quarry closure is not proven by the supplied status.';
  if(/health|does othrys work|are you working/.test(t)) return `OTHRYS body status: ${status?.bodyStatus??'UNKNOWN'}. Deep proof: ${status?.deepProof??'not supplied'}.`;
  return null;
}
export function answerFrontDoor(input,{status={},modelSelection=null}={}){
  const intent=classifyFrontDoorIntent(input),dispatch=frontDoorDispatch(intent),direct=systemAnswer(input,{...status,builderSelection:modelSelection});
  const route=dispatch.needsModel?modelSelection?.selected??null:null;
  let answer=direct;
  if(!answer&&intent==='QUESTION') answer='I can answer project-state questions from Mnemosyne, but this question needs a language-model response path that is not yet admitted here.';
  if(!answer&&intent==='RESEARCH') answer='Prometheus owns this research request; Mnemosyne supplies existing evidence. No research execution has started.';
  if(!answer&&intent==='PLAN') answer='Hephaestus is the planner after Prometheus/Mnemosyne context. This is a planning request only; no build has started.';
  if(!answer&&intent==='BUILD') answer=`Hephaestus owns the build plan and Talos owns independent verification.${route?` Switchyard selects ${route.id} as the current legal engineering builder.`:''} No execution has started.`;
  if(!answer&&intent==='OPERATION') answer='Kronos/Rhea/Talos own this operational question with Mnemosyne supplying state evidence.';
  return Object.freeze({schema:'othrys.os.front-door-turn.v1',input:clean(input),intent,dispatch,answer,modelRoute:route?{id:route.id,label:route.label,reason:modelSelection.reason}:null,missionProposalRecommended:['PLAN','BUILD'].includes(intent),authorityGranted:false,executionStarted:false});
}
