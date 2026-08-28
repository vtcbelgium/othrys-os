import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const PROJECT_SCHEMA='othrys.os.project.v1';

function requiredString(value,name){
  if(typeof value!=='string'||!value.trim()) throw new Error(`INVALID_${name}`);
  return value;
}

function uniqueIds(items,name){
  if(!Array.isArray(items)) throw new Error(`INVALID_${name}`);
  const ids=new Set();
  for(const item of items){
    const id=requiredString(item?.id,`${name}_ID`);
    if(ids.has(id)) throw new Error(`DUPLICATE_${name}_ID`);
    ids.add(id);
  }
  return items;
}

export function validateProjectManifest(manifest){
  if(!manifest||manifest.schema!==PROJECT_SCHEMA) throw new Error('INVALID_PROJECT_SCHEMA');
  requiredString(manifest.projectId,'PROJECT_ID');
  requiredString(manifest.label,'PROJECT_LABEL');
  if(manifest.kind!=='CONTROL_PLANE'&&manifest.kind!=='OROS') throw new Error('INVALID_PROJECT_KIND');
  if(manifest.canonicalRoot!=='.') throw new Error('INVALID_CANONICAL_ROOT');
  uniqueIds(manifest.authorities,'AUTHORITIES');
  uniqueIds(manifest.systems,'SYSTEMS');
  uniqueIds(manifest.capabilities,'CAPABILITIES');
  uniqueIds(manifest.integrations,'INTEGRATIONS');
  uniqueIds(manifest.knowledge,'KNOWLEDGE');
  uniqueIds(manifest.modelPolicy?.requests,'MODELS');
  if(!Array.isArray(manifest.work?.phases)||manifest.work.phases.length<4) throw new Error('INVALID_WORK_PHASES');
  if(manifest.authorityGranted===true||manifest.executionStarted===true) throw new Error('PROJECT_MANIFEST_CANNOT_GRANT_AUTHORITY');
  return Object.freeze(manifest);
}

export function loadProjectManifest(root,file='.othrys/project.json'){
  const path=join(root,file);
  if(!existsSync(path)) throw new Error('PROJECT_MANIFEST_NOT_FOUND');
  return validateProjectManifest(JSON.parse(readFileSync(path,'utf8')));
}

