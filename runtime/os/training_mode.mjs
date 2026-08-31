import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { searchKnowledge } from './mnemosyne.mjs';
export function loadTrainingManifest(root){const m=JSON.parse(readFileSync(join(root,'docs','training','TRAINING_MANIFEST.json'),'utf8'));if(m.schema!=='othrys.os.training-manifest.v1')throw new Error('TRAINING_MANIFEST_INVALID');return m;}
function currentLevel(m){const key=`level${m.currentLevel}`,level=m[key];if(!level)throw new Error('TRAINING_LEVEL_INVALID');return {number:m.currentLevel,data:level};}
function activeLevel(m){const x=currentLevel(m);if(x.data.status!=='ACTIVE')throw new Error('TRAINING_LEVEL_NOT_ACTIVE');return x;}
export function nextTrainingJob(root){const {data}=currentLevel(loadTrainingManifest(root));if(data.status==='COMPLETE')return null;if(data.status!=='ACTIVE')throw new Error('TRAINING_LEVEL_NOT_ACTIVE');return data.jobs.find(x=>x.status==='QUEUED')??null;}
export function prepareTrainingJob(root,manifest,jobId){const m=loadTrainingManifest(root),{number,data}=activeLevel(m),j=data.jobs.find(x=>x.id===jobId);if(!j)throw new Error('TRAINING_JOB_NOT_FOUND');const stock=searchKnowledge(root,manifest,`${j.title} ${j.family} block`,{limit:10});return Object.freeze({schema:'othrys.os.training-job-preflight.v1',level:number,job:j,cycle:m.cycleLaw,stockMatches:stock.results.map(x=>({id:x.id,title:x.title,classification:x.classification,status:x.status,score:x.score,source:x.source})),requiredOrgans:['MNEMOSYNE','HEPHAESTUS','TALOS','SWITCHYARD'],dispositionRequired:true,authorityGranted:false,executionStarted:false});}
