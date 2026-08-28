export const MUSES=Object.freeze([
  {name:'calliope',mandate:'canonical documents, architecture and specifications',types:['decision','knowledge'],tags:['architecture','specification','canon','adr']},
  {name:'clio',mandate:'history, chronology, revisions and institutional memory',types:['mission','work','evidence'],tags:['history','timeline','revision','migration']},
  {name:'urania',mandate:'research, measurements, benchmarks and external evidence',types:['research','evidence','capability'],tags:['research','measurement','benchmark','external']},
  {name:'polyhymnia',mandate:'constitution, doctrine, governance and protected principles',types:['decision','knowledge'],tags:['constitution','doctrine','governance','policy']},
  {name:'melpomene',mandate:'failures, incidents, contradictions and lessons',types:['incident','lesson'],tags:['failure','incident','postmortem','risk','conflict','scar']},
  {name:'thalia',mandate:'successes, proven patterns and reusable capability',types:['pattern','capability','lesson'],tags:['success','pattern','reusable','proven']},
  {name:'erato',mandate:'relationships, dependencies and semantic connections',types:[],tags:['relationship','dependency','graph','cross-pollination']},
  {name:'euterpe',mandate:'language, prompts, voice and communication',types:[],tags:['prompt','voice','writing','communication']},
  {name:'terpsichore',mandate:'processes, workflows and operational choreography',types:['work'],tags:['workflow','process','runbook','operations']}
]);
const names=new Set(MUSES.map(x=>x.name));
export function routeToMuses(node){
  const hay=`${node?.title??''} ${(node?.tags??[]).join(' ')} ${node?.description??''}`.toLowerCase();
  const matched=MUSES.filter(m=>m.types.includes(node?.type)||m.tags.some(t=>hay.includes(t))).map(m=>m.name);
  return [...new Set(matched.length?matched:['calliope'])];
}
export function assertMuseNames(values){
  if(!Array.isArray(values)||values.some(x=>!names.has(x))) throw new Error('ATLAS_MUSE_INVALID');
  return values;
}
