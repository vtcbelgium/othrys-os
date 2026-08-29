import test from 'node:test';
import assert from 'node:assert/strict';
import {createVisualObservation,classifyVisualFreshness,evaluateVisualObservation,compareVisualObservations,createTalosVisualVerificationCandidate,createVisualInputIntent} from './visual_control.mjs';

const frame=(overrides={})=>createVisualObservation({nodeId:'legion',surfaceId:'browser:command-deck',captureSource:'fixture',capturedAt:'2026-08-29T17:00:00Z',viewport:{width:1400,height:900},image:{sha256:'a'.repeat(64),bytes:4096,nonblank:true},uiMetadata:{activeWindow:'Command Deck'},...overrides});

test('observation is finite evidence, not raw pixels or authority',()=>{const x=frame();assert.equal(x.rawImageIncluded,false);assert.equal(x.authorityGranted,false);assert.equal(x.executionStarted,false);assert.match(x.evidenceDigest,/^[a-f0-9]{64}$/);});
test('freshness fails closed for stale and future frames',()=>{const x=frame();assert.equal(classifyVisualFreshness(x,{now:'2026-08-29T17:00:04Z'}),'FRESH');assert.equal(classifyVisualFreshness(x,{now:'2026-08-29T17:00:06Z'}),'STALE');assert.equal(classifyVisualFreshness(x,{now:'2026-08-29T16:59:58Z'}),'FUTURE');});
test('blank or stale evidence is unusable',()=>{const blank=frame({image:{sha256:'b'.repeat(64),bytes:4096,nonblank:false}});assert.equal(evaluateVisualObservation(blank,{now:'2026-08-29T17:00:00Z'}).usable,false);assert.equal(evaluateVisualObservation(frame(),{now:'2026-08-29T17:01:00Z'}).usable,false);});
test('same-surface before after delta is observable but not verified success',()=>{const a=frame(),b=frame({capturedAt:'2026-08-29T17:00:01Z',image:{sha256:'c'.repeat(64),bytes:5000,nonblank:true}});const c=compareVisualObservations(a,b);assert.equal(c.comparable,true);assert.equal(c.visualDeltaObserved,true);assert.equal(c.verificationComplete,false);});
test('cross viewport comparison fails closed',()=>{const c=compareVisualObservations(frame(),frame({viewport:{width:1000,height:700}}));assert.equal(c.comparable,false);assert.equal(c.visualDeltaObserved,false);});
test('Talos candidate never self-certifies',()=>{const c=compareVisualObservations(frame(),frame({capturedAt:'2026-08-29T17:00:01Z',uiMetadata:{activeWindow:'Changed'}}));const v=createTalosVisualVerificationCandidate(c,{intentId:'intent-1'});assert.equal(v.talosVerificationRequired,true);assert.equal(v.verificationComplete,false);assert.equal(v.successClaimed,false);});
test('input control remains explicitly unadmitted',()=>assert.throws(()=>createVisualInputIntent(),/NOT_ADMITTED/));
