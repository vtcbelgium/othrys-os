import {createHash} from 'node:crypto';
const sha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export const OLYMPICS_EVENTS=Object.freeze([
 {id:'SPRINT',tags:['tiny-patch','fast'],weight:1},
 {id:'PROTOCOL',tags:['instruction-following','structured-output'],weight:1.2},
 {id:'REPAIR',tags:['debugging','repair'],weight:1.5},
 {id:'REPO',tags:['repo-scale','agentic-coding'],weight:2},
 {id:'TOOLS',tags:['tool-use','agentic-coding'],weight:1.5},
 {id:'ENDURANCE',tags:['long-context','long-horizon'],weight:1.8}
]);
export function createOlympicsCard({builderId,eventId,talosPass,latencyMs,scopeViolations=0,repairs=0,protocolPass=true,mycelium={}}){
 if(!builderId||!OLYMPICS_EVENTS.some(x=>x.id===eventId))throw new Error('OLYMPICS_CARD_INVALID');
 const body={schema:'othrys.hephaestus.olympics-card.v1',builderId,eventId,talosPass:talosPass===true,latencyMs:Number(latencyMs),scopeViolations:Number(scopeViolations),repairs:Number(repairs),protocolPass:protocolPass===true,mycelium:{...mycelium},authorityGranted:false,executionStarted:false};
 return Object.freeze({...body,cardDigest:sha(body)});
}
export function olympicsStandings(cards=[]){const map=new Map();for(const c of cards){const r=map.get(c.builderId)??{builderId:c.builderId,events:0,passes:0,latency:0,violations:0,repairs:0,protocol:0};r.events++;r.passes+=c.talosPass?1:0;r.latency+=c.latencyMs;r.violations+=c.scopeViolations;r.repairs+=c.repairs;r.protocol+=c.protocolPass?1:0;map.set(c.builderId,r);}return [...map.values()].map(r=>({...r,firstPassRate:r.events?r.passes/r.events:0,protocolRate:r.events?r.protocol/r.events:0,medianLatencyMs:Math.round(r.latency/r.events)})).sort((a,b)=>b.firstPassRate-a.firstPassRate||b.protocolRate-a.protocolRate||a.medianLatencyMs-b.medianLatencyMs);}
export function qualificationDecision(row,{minimumEvents=4}={}){const qualified=row.events>=minimumEvents&&row.firstPassRate>=.75&&row.protocolRate>=.75&&row.violations===0;return Object.freeze({schema:'othrys.hephaestus.olympics-decision.v1',builderId:row.builderId,state:qualified?'QUALIFICATION_CANDIDATE':'KEEP_TESTING',qualifiedByOlympics:qualified,automaticExecutionEnable:false,talosQualificationRequired:true,authorityGranted:false,executionStarted:false});}
