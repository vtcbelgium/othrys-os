import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export class MissionIdPolicyError extends Error {
  code:string;
  constructor(code:string){super(code);this.code=code;this.name='MissionIdPolicyError';}
}

const PRIMARY=/^V2-(\d{3})([A-Z])\.json$/;
const PRIMARY_LIKE=/^V2-\d{3}[A-Z].*\.json$/;

export function nextPrimaryMissionId(missionsDir:string):string {
  const names=readdirSync(missionsDir).filter(n=>n.endsWith('.json')&&!n.endsWith('.result.json'));
  const seen=new Set<string>();
  const primaries:{id:string,n:number,l:string}[]=[];
  for(const name of names){
    const m=name.match(PRIMARY);
    if(m){
      const id=name.slice(0,-5);
      if(seen.has(id)) throw new MissionIdPolicyError('MISSION_ID_DUPLICATE');
      seen.add(id); primaries.push({id,n:Number(m[1]),l:m[2]}); continue;
    }
    if(PRIMARY_LIKE.test(name) && !/^V2-\d{3}[A-Z]\.[A-Z0-9]+\.json$/.test(name)) throw new MissionIdPolicyError('MISSION_ID_FILENAME_AMBIGUOUS');
  }
  if(!primaries.length) throw new MissionIdPolicyError('MISSION_ID_SEQUENCE_EMPTY');
  primaries.sort((a,b)=>a.n-b.n||a.l.localeCompare(b.l));
  const top=primaries.at(-1)!;
  let n=top.n, code=top.l.charCodeAt(0)+1;
  if(code>90){n+=1;code=65;}
  if(n>999) throw new MissionIdPolicyError('MISSION_ID_SEQUENCE_EXHAUSTED');
  const next=`V2-${String(n).padStart(3,'0')}${String.fromCharCode(code)}`;
  if(existsSync(join(missionsDir,`${next}.json`))||existsSync(join(missionsDir,`${next}.result.json`))) throw new MissionIdPolicyError('MISSION_ID_TARGET_COLLISION');
  return next;
}
