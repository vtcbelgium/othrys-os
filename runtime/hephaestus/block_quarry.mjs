import { createHash } from 'node:crypto';

export const QUARRY_SCHEMA='othrys.hephaestus.block-quarry-assessment.v1';
export const REGION_CLASSES=Object.freeze(['CAPABILITY','HOST_CONFIG','BRIDGE','CALLER','DEBT','FALSE_POSITIVE']);
const AFTER=new Set(['REMOVED','REPLACED_BY_BLOCK','PRESERVED','IGNORED']);
const HEX64=/^[0-9a-f]{64}$/;
const clean=v=>String(v??'').trim();
const sha=v=>createHash('sha256').update(v).digest('hex');

function validateRegion(r){
  if(!r||typeof r!=='object') throw new Error('QUARRY_REGION_INVALID');
  const keys=['regionId','path','sha256','classification','duplicateOfTarget','afterExtractionStatus','rationale'];
  if(Object.keys(r).some(k=>!keys.includes(k))||keys.some(k=>!(k in r))) throw new Error('QUARRY_REGION_FIELDS_INVALID');
  if(!clean(r.regionId)||!clean(r.path)||!HEX64.test(r.sha256)||!REGION_CLASSES.includes(r.classification)||typeof r.duplicateOfTarget!=='boolean'||!AFTER.has(r.afterExtractionStatus)||!clean(r.rationale)) throw new Error('QUARRY_REGION_VALUE_INVALID');
  if(r.classification==='CAPABILITY'&&!['REMOVED','REPLACED_BY_BLOCK'].includes(r.afterExtractionStatus)) throw new Error('CAPABILITY_NOT_EXTINGUISHED');
  if(['HOST_CONFIG','BRIDGE','CALLER','DEBT'].includes(r.classification)&&r.afterExtractionStatus!=='PRESERVED') throw new Error('HOST_GLUE_DELETION_FORBIDDEN');
  if(r.classification==='FALSE_POSITIVE'&&!['PRESERVED','IGNORED'].includes(r.afterExtractionStatus)) throw new Error('FALSE_POSITIVE_MUTATION_FORBIDDEN');
  return r;
}

export function assessBlockExtraction(input){
  if(!input||typeof input!=='object') throw new Error('QUARRY_INPUT_INVALID');
  const allowed=['candidateId','sourceLineage','sourceCommit','targetBlock','regions'];
  if(Object.keys(input).some(k=>!allowed.includes(k))||allowed.some(k=>!(k in input))) throw new Error('QUARRY_INPUT_FIELDS_INVALID');
  if(!clean(input.candidateId)||!clean(input.sourceLineage)||!HEX64.test(input.sourceCommit)) throw new Error('QUARRY_SOURCE_IDENTITY_INVALID');
  const target=input.targetBlock;
  if(!target||Object.keys(target).some(k=>!['blockId','canonicalPath','canonicalExists'].includes(k))||!clean(target.blockId)||!clean(target.canonicalPath)||typeof target.canonicalExists!=='boolean') throw new Error('QUARRY_TARGET_INVALID');
  if(!Array.isArray(input.regions)||!input.regions.length) throw new Error('QUARRY_REGIONS_REQUIRED');
  const seen=new Set(),regions=input.regions.map(r=>{validateRegion(r);if(seen.has(r.regionId))throw new Error('QUARRY_REGION_DUPLICATE');seen.add(r.regionId);return Object.freeze({...r});});
  const capabilities=regions.filter(r=>r.classification==='CAPABILITY');
  if(!capabilities.length) throw new Error('QUARRY_CAPABILITY_REQUIRED');
  if(target.canonicalExists&&capabilities.some(r=>!r.duplicateOfTarget)) throw new Error('COMPETING_CANONICAL_IMPLEMENTATION');
  const duplicateBefore=capabilities.filter(r=>r.duplicateOfTarget).length;
  const duplicateAfter=capabilities.filter(r=>r.duplicateOfTarget&&r.afterExtractionStatus==='PRESERVED').length;
  const hostClasses=new Set(['HOST_CONFIG','BRIDGE','CALLER','DEBT']);
  const preservedHost=regions.filter(r=>hostClasses.has(r.classification)&&r.afterExtractionStatus==='PRESERVED').length;
  const hostTotal=regions.filter(r=>hostClasses.has(r.classification)).length;
  const falsePositives=regions.filter(r=>r.classification==='FALSE_POSITIVE').length;
  const extinctionProven=duplicateBefore>0&&duplicateAfter===0;
  const body={schema:QUARRY_SCHEMA,candidateId:input.candidateId,sourceLineage:input.sourceLineage,sourceCommit:input.sourceCommit,targetBlock:Object.freeze({...target}),regions:Object.freeze(regions),counts:Object.freeze({regions:regions.length,capabilities:capabilities.length,duplicateCapabilityBefore:duplicateBefore,duplicateCapabilityAfter:duplicateAfter,hostGluePreserved:preservedHost,hostGlueTotal:hostTotal,falsePositives}),status:extinctionProven?'EXTINCTION_PROVEN':'EXTRACTION_READY',extinctionProven,allRegionsClassified:true,hostGluePreserved:preservedHost===hostTotal,admissionGranted:false,deletionGranted:false,authorityGranted:false,executionStarted:false};
  return Object.freeze({...body,assessmentDigest:sha(JSON.stringify(body))});
}
