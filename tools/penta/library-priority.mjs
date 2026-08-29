import { readFileSync } from 'node:fs';
const root=new URL('../../',import.meta.url).pathname.replace(/^\/(.:\/)/,'$1');
const read=p=>JSON.parse(readFileSync(`${root}/${p}`,'utf8'));
const seed=read('docs/V2-011J/GREAT_LIBRARY_SEED.json');
const potential=read('docs/V2-011J/GREAT_LIBRARY_POTENTIAL.json');
const blueprintById=new Map(seed.blueprints.map(x=>[x.id,x]));
const capabilityByKey=new Map(seed.blocks.map(x=>[x.id.replace(/^(block|candidate)\./,''),x]));

function primitiveRequirements(id,stack=new Set()){
  if(stack.has(id)) throw new Error(`GREAT_LIBRARY_BLUEPRINT_CYCLE:${id}`);
  const bp=blueprintById.get(id); if(!bp) throw new Error(`GREAT_LIBRARY_BLUEPRINT_UNKNOWN:${id}`);
  const next=new Set(stack); next.add(id); const out=new Set();
  for(const req of bp.requires){
    if(req.startsWith('blueprint.')) for(const x of primitiveRequirements(req,next)) out.add(x);
    else out.add(req);
  }
  return out;
}

export function rankLibraryPrimitives(){
  const counts=new Map();
  for(const idea of potential.ideas){
    for(const req of primitiveRequirements(idea.parentBlueprint)) counts.set(req,(counts.get(req)??0)+1);
  }
  const rows=[...counts].map(([capability,demand])=>{
    const stock=capabilityByKey.get(capability)??null;
    return Object.freeze({capability,demand,potentialCoverage:Number((demand/potential.ideaCount).toFixed(4)),stockId:stock?.id??null,stockStatus:stock?.status??'MISSING_FROM_SEED',evidenceCount:stock?.evidence?.length??0,admitted:stock?.status==='ADMITTED',authorityGranted:false});
  });
  rows.sort((a,b)=>b.demand-a.demand||Number(a.admitted)-Number(b.admitted)||a.capability.localeCompare(b.capability));
  return Object.freeze({schema:'othrys.os.great-library-priority.v1',ideaCount:potential.ideaCount,primitiveCount:rows.length,ranking:Object.freeze(rows),authorityGranted:false,automaticExtraction:false});
}

const result=rankLibraryPrimitives();
if(import.meta.url===new URL(`file:///${process.argv[1]?.replace(/\\/g,'/')}`).href) console.log(JSON.stringify(result,null,2));
