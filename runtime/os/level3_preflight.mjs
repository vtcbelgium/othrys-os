import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const readJson=(root,rel)=>JSON.parse(readFileSync(join(root,...rel.split('/')),'utf8'));

export function level3Readiness(root=process.cwd()){
  const manifest=readJson(root,'docs/training/TRAINING_MANIFEST.json');
  const prep=readJson(root,'docs/training/LEVEL_3_PREP.json');
  const seal=readJson(root,'docs/training/milestones/LEVEL2_SOLID_FOUNDATION_2026-09-01.json');
  const legacy=readJson(root,'docs/harvest/LEGACY_ROUTE_CLOSED_2026-09-01.json');
  const l3=manifest.levels.find(x=>x.level===3);
  const ids=prep.jobs.map(x=>x.id), seq=prep.jobs.map(x=>x.sequence);
  const checks={
    currentLevel2:manifest.currentLevel===2,
    level2Complete:manifest.level2?.status==='COMPLETE'&&manifest.level2.jobs?.length===24&&manifest.level2.jobs.every(x=>x.status==='COMPLETE'),
    level3Locked:l3?.status==='LOCKED'&&l3?.authorityGranted===false,
    controlsClosed:manifest.automaticLevelAdvance===false&&manifest.automaticAdmission===false&&manifest.authorityGranted===false,
    consolidationComplete:manifest.level2_5Consolidation?.status==='COMPLETE',
    level2Seal:seal.status==='SEALED_PENDING_OPERATOR_ADVANCE_ONLY'&&seal.level3Status==='LOCKED'&&seal.authorityGranted===false,
    legacyClosed:legacy.status==='CLOSED'&&legacy.level3Unlocked===false&&legacy.legion?.liveExecutableLegacyDependencyHits===0,
    prepLocked:prep.status==='PREPARED_LOCKED'&&prep.laws?.operatorActivationRequired===true,
    curriculum24:prep.jobs.length===24&&new Set(ids).size===24&&new Set(seq).size===24,
    allPrepared:prep.jobs.every(x=>x.status==='PREPARED'&&x.authorityGranted===false&&x.executionStarted===false),
    noAutomaticAdmission:prep.jobs.every(x=>x.automaticAdmission===false),
  };
  return Object.freeze({schema:'othrys.os.level3-readiness.v1',ready:Object.values(checks).every(Boolean),checks:Object.freeze(checks),authorityGranted:false,executionStarted:false,level3Unlocked:false});
}

export function projectLevel3Activation(root=process.cwd()){
  const readiness=level3Readiness(root);
  if(!readiness.ready) throw new Error('LEVEL3_NOT_READY');
  const manifest=readJson(root,'docs/training/TRAINING_MANIFEST.json');
  const prep=readJson(root,'docs/training/LEVEL_3_PREP.json');
  const projected=structuredClone(manifest);
  projected.currentLevel=3;
  projected.levels=projected.levels.map(x=>x.level===3?{...x,status:'ACTIVE',authorityGranted:false}:x);
  projected.level3={
    status:'ACTIVE',targetJobs:prep.jobs.length,completedJobs:0,
    jobs:prep.jobs.map(x=>({...x,status:'QUEUED',authorityGranted:false,executionStarted:false})),
  };
  projected.authorityGranted=false;
  projected.automaticAdmission=false;
  projected.automaticLevelAdvance=false;
  return Object.freeze({schema:'othrys.os.level3-activation-projection.v1',manifest:Object.freeze(projected),writesPerformed:false,executionStarted:false,authorityGranted:false});
}
