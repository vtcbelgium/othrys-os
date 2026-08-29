import { createHash } from 'node:crypto';

export const VISUAL_OBSERVATION_SCHEMA='othrys.os.visual-observation.v1';
export const VISUAL_FRESHNESS=Object.freeze(['FRESH','STALE','FUTURE','UNKNOWN']);
const clean=v=>typeof v==='string'?v.trim():'';
const digest=v=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
const base=body=>Object.freeze({...body,authorityGranted:false,executionStarted:false});

function id(v,label){const x=clean(v);if(!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/.test(x))throw new Error(`VISUAL_${label}_INVALID`);return x;}
function timestamp(v,label){const x=clean(v);if(!x||Number.isNaN(Date.parse(x)))throw new Error(`VISUAL_${label}_INVALID`);return x;}
function positiveInt(v,label,max=16384){if(!Number.isInteger(v)||v<1||v>max)throw new Error(`VISUAL_${label}_INVALID`);return v;}
function sha(v){const x=clean(v).toLowerCase();if(!/^[a-f0-9]{64}$/.test(x))throw new Error('VISUAL_IMAGE_DIGEST_INVALID');return x;}
function boundedMeta(v,label,max=16384){if(v==null)return Object.freeze({});if(typeof v!=='object'||Array.isArray(v))throw new Error(`VISUAL_${label}_INVALID`);const s=JSON.stringify(v);if(Buffer.byteLength(s)>max)throw new Error(`VISUAL_${label}_TOO_LARGE`);return Object.freeze(structuredClone(v));}

export function createVisualObservation(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('VISUAL_OBSERVATION_INVALID');
  const body={schema:VISUAL_OBSERVATION_SCHEMA,nodeId:id(raw.nodeId,'NODE_ID'),surfaceId:id(raw.surfaceId,'SURFACE_ID'),captureSource:id(raw.captureSource,'CAPTURE_SOURCE'),capturedAt:timestamp(raw.capturedAt,'CAPTURED_AT'),viewport:Object.freeze({width:positiveInt(raw.viewport?.width,'VIEWPORT_WIDTH'),height:positiveInt(raw.viewport?.height,'VIEWPORT_HEIGHT')}),image:Object.freeze({sha256:sha(raw.image?.sha256),bytes:positiveInt(raw.image?.bytes,'IMAGE_BYTES',100_000_000),nonblank:raw.image?.nonblank===true}),uiMetadata:boundedMeta(raw.uiMetadata,'UI_METADATA'),rawImageIncluded:false};
  return base({...body,evidenceDigest:digest(body)});
}

export function classifyVisualFreshness(observation,{now,maxAgeMs=5000,maxFutureSkewMs=1000}={}){
  if(!observation||observation.schema!==VISUAL_OBSERVATION_SCHEMA)return 'UNKNOWN';
  if(!Number.isFinite(maxAgeMs)||maxAgeMs<0||!Number.isFinite(maxFutureSkewMs)||maxFutureSkewMs<0)throw new Error('VISUAL_FRESHNESS_POLICY_INVALID');
  const n=Date.parse(timestamp(now,'NOW')), t=Date.parse(observation.capturedAt), age=n-t;
  if(age < -maxFutureSkewMs)return 'FUTURE';
  if(age > maxAgeMs)return 'STALE';
  return 'FRESH';
}

export function evaluateVisualObservation(observation,{now,maxAgeMs=5000,maxFutureSkewMs=1000}={}){
  const freshness=classifyVisualFreshness(observation,{now,maxAgeMs,maxFutureSkewMs});
  const reasons=[];
  if(freshness!=='FRESH')reasons.push(`FRAME_${freshness}`);
  if(observation?.image?.nonblank!==true)reasons.push('FRAME_BLANK_OR_UNPROVEN');
  return base({schema:'othrys.os.visual-observation-assessment.v1',evidenceDigest:observation?.evidenceDigest||null,freshness,usable:reasons.length===0,reasons:Object.freeze(reasons)});
}

export function compareVisualObservations(before,after){
  if(before?.schema!==VISUAL_OBSERVATION_SCHEMA||after?.schema!==VISUAL_OBSERVATION_SCHEMA)throw new Error('VISUAL_COMPARISON_OBSERVATION_INVALID');
  const sameNode=before.nodeId===after.nodeId, sameSurface=before.surfaceId===after.surfaceId;
  const sameViewport=before.viewport.width===after.viewport.width&&before.viewport.height===after.viewport.height;
  const chronological=Date.parse(after.capturedAt)>=Date.parse(before.capturedAt);
  const imageChanged=before.image.sha256!==after.image.sha256;
  const metadataChanged=digest(before.uiMetadata)!==digest(after.uiMetadata);
  const comparable=sameNode&&sameSurface&&sameViewport&&chronological&&before.image.nonblank&&after.image.nonblank;
  return base({schema:'othrys.os.visual-comparison.v1',beforeDigest:before.evidenceDigest,afterDigest:after.evidenceDigest,sameNode,sameSurface,sameViewport,chronological,comparable,imageChanged,metadataChanged,visualDeltaObserved:comparable&&(imageChanged||metadataChanged),verificationComplete:false});
}

export function createTalosVisualVerificationCandidate(comparison,{intentId=null}={}){
  if(!comparison||comparison.schema!=='othrys.os.visual-comparison.v1')throw new Error('VISUAL_COMPARISON_INVALID');
  return base({schema:'othrys.os.visual-verification-candidate.v1',intentId:intentId===null?null:id(intentId,'INTENT_ID'),comparisonDigest:digest(comparison),comparable:comparison.comparable===true,visualDeltaObserved:comparison.visualDeltaObserved===true,talosVerificationRequired:true,verificationComplete:false,successClaimed:false});
}

export function createVisualInputIntent(){throw new Error('VISUAL_INPUT_CONTROL_NOT_ADMITTED');}
