import test from 'node:test';
import assert from 'node:assert/strict';
import { assessBlockExtraction } from './block_quarry.mjs';

const H=c=>c.repeat(64);
const base={candidateId:'quarry-image-prep',sourceLineage:'https://github.com/vtcbelgium/vtc-platform',sourceCommit:H('a'),targetBlock:{blockId:'block.media.image-prep',canonicalPath:'blocks/media/image-prep',canonicalExists:true}};
const region=(regionId,path,classification,afterExtractionStatus,duplicateOfTarget=false,rationale='evidence-backed classification')=>({regionId,path,sha256:H(regionId[0]<'g'?'b':'c'),classification,duplicateOfTarget,afterExtractionStatus,rationale});

test('image-prep extraction proof extinguishes duplicate capability while preserving host glue',()=>{
  const x=assessBlockExtraction({...base,regions:[
    region('compose','src/whiteSquare.js','CAPABILITY','REPLACED_BY_BLOCK',true,'square compose moved to canonical Block'),
    region('accessory','src/App.jsx#uploadAccPhoto','CAPABILITY','REMOVED',true,'duplicate square compose deleted'),
    region('adapter','src/whiteSquare.js#adapter','BRIDGE','PRESERVED',false,'host adapter keeps optional background removal and typed error mapping'),
    region('caller','src/ScanFlow.jsx#saveFigure','CALLER','PRESERVED',false,'product caller remains'),
    region('config','src/whiteSquare.js#VTC_CATALOG_TILE','HOST_CONFIG','PRESERVED',false,'VTC product knobs remain host-owned'),
    region('downscale','src/CollectionTab.jsx#compressImage','FALSE_POSITIVE','PRESERVED',false,'distinct long-edge behavior is not square compose')
  ]});
  assert.equal(x.status,'EXTINCTION_PROVEN'); assert.equal(x.extinctionProven,true);
  assert.equal(x.counts.duplicateCapabilityBefore,2); assert.equal(x.counts.duplicateCapabilityAfter,0);
  assert.equal(x.hostGluePreserved,true); assert.equal(x.admissionGranted,false); assert.equal(x.deletionGranted,false); assert.equal(x.authorityGranted,false);
});

test('affiliate-offer fixture preserves callers and proves independent URL algorithm extinction',()=>{
  const x=assessBlockExtraction({candidateId:'quarry-affiliate',sourceLineage:base.sourceLineage,sourceCommit:H('d'),targetBlock:{blockId:'block.monetization.affiliate-offer',canonicalPath:'blocks/monetization/affiliate-offer',canonicalExists:true},regions:[
    region('affiliate','src/affiliate.js','CAPABILITY','REMOVED',true,'independent ebaySearchUrl implementation removed'),
    region('market','src/components/MarketLinks.jsx','CALLER','PRESERVED',false,'caller uses host disclosure plus Block glue'),
    region('affiliateconfig','src/affiliateConfig.js','HOST_CONFIG','PRESERVED',false,'campaign and disclosure configuration remains host-owned')
  ]});
  assert.equal(x.status,'EXTINCTION_PROVEN'); assert.equal(x.counts.hostGluePreserved,2); assert.equal(x.counts.hostGlueTotal,2);
});

test('visit-tracking extraction map separates capability from bridges, callers and debt',()=>{
  const x=assessBlockExtraction({candidateId:'quarry-visit',sourceLineage:base.sourceLineage,sourceCommit:H('e'),targetBlock:{blockId:'block.analytics.visit-tracking',canonicalPath:'blocks/analytics/visit-tracking',canonicalExists:true},regions:[
    region('track','src/track.js','CAPABILITY','REPLACED_BY_BLOCK',true,'pageview beacon replaced by canonical installVisitBeacon'),
    region('hit','api/hit.js','CAPABILITY','REPLACED_BY_BLOCK',true,'hashing and normalization moved to Block core/ingest handler'),
    region('storage','src/visitTrackingStorage.js','BRIDGE','PRESERVED',false,'host storage integration remains pluggable bridge'),
    region('endpoint','api/hit.js#endpoint','CALLER','PRESERVED',false,'host endpoint remains wrapper around Block handler'),
    region('chatdebt','api/chat.js','DEBT','PRESERVED',false,'separate SHA-256 IP hashing was explicitly untouched debt')
  ]});
  assert.equal(x.status,'EXTINCTION_PROVEN'); assert.equal(x.extinctionProven,true); assert.equal(x.hostGluePreserved,true);
});

test('host glue deletion and capability survival fail closed',()=>{
  assert.throws(()=>assessBlockExtraction({...base,regions:[region('cap','src/a.js','CAPABILITY','PRESERVED',true)]}),/CAPABILITY_NOT_EXTINGUISHED/);
  assert.throws(()=>assessBlockExtraction({...base,regions:[region('cap','src/a.js','CAPABILITY','REMOVED',true),region('bridge','src/b.js','BRIDGE','REMOVED',false)]}),/HOST_GLUE_DELETION_FORBIDDEN/);
});

test('existing canonical Block forbids a competing novel capability implementation',()=>{
  assert.throws(()=>assessBlockExtraction({...base,regions:[region('novel','src/new.js','CAPABILITY','REPLACED_BY_BLOCK',false)]}),/COMPETING_CANONICAL_IMPLEMENTATION/);
});

test('no capability target and unclassified/extra evidence are rejected',()=>{
  assert.throws(()=>assessBlockExtraction({...base,regions:[region('calleronly','src/x.js','CALLER','PRESERVED',false)]}),/QUARRY_CAPABILITY_REQUIRED/);
  assert.throws(()=>assessBlockExtraction({...base,regions:[{...region('capx','src/x.js','CAPABILITY','REMOVED',true),classification:'MAYBE'}]}),/QUARRY_REGION_VALUE_INVALID/);
  assert.throws(()=>assessBlockExtraction({...base,regions:[{...region('capy','src/y.js','CAPABILITY','REMOVED',true),score:0.99}]}),/QUARRY_REGION_FIELDS_INVALID/);
});

test('assessment digest is deterministic and cannot grant admission or deletion',()=>{
  const input={...base,regions:[region('capz','src/z.js','CAPABILITY','REMOVED',true)]};
  const a=assessBlockExtraction(input),b=assessBlockExtraction(input);
  assert.equal(a.assessmentDigest,b.assessmentDigest); assert.equal(a.admissionGranted,false); assert.equal(a.deletionGranted,false); assert.equal(a.executionStarted,false);
});
