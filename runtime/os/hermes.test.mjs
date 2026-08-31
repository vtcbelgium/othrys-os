import test from 'node:test';
import assert from 'node:assert/strict';
import { assessHermesLimbo, canAcknowledgeHermes, createHermesDeliveryIntent, createHermesEnvelope, deliveryTransition, deriveActorScopedIdempotencyKey, evaluateConversationOrder, evaluateHermesBinding, processingTransition } from './hermes.mjs';

const now='2026-08-29T20:00:00.000Z';
const env=(over={})=>({messageId:'msg-001',conversationId:'conv-001',sender:'operator',recipients:['prometheus'],channel:'command-deck',direction:'INTERNAL',timestamp:now,payload:{text:'research the repo'},context:{projectId:'othrys-v2'},metadata:{source:'tablet'},replyTo:null,idempotencyKey:'idem-001',...over});

test('normalized envelope is authority-free and persistence-honest',()=>{
  const e=createHermesEnvelope(env());
  assert.equal(e.schema,'othrys.os.hermes-message.v1'); assert.equal(e.persistenceRequired,true); assert.equal(e.ackAllowed,false); assert.equal(e.authorityGranted,false); assert.equal(e.executionStarted,false);
});

test('actor-scoped idempotency is deterministic and actor-separated',()=>{
  const a=deriveActorScopedIdempotencyKey('operator','client-17');
  assert.equal(a,deriveActorScopedIdempotencyKey('operator','client-17')); assert.notEqual(a,deriveActorScopedIdempotencyKey('prometheus','client-17'));
});
test('secret-bearing communication fails closed',()=>{
  assert.throws(()=>createHermesEnvelope(env({metadata:{token:'abc'}})),/HERMES_SECRET_FIELD_FORBIDDEN/);
  assert.throws(()=>createHermesEnvelope(env({payload:{text:['sk','proj','abcdefghijklmnopqrstuvwxyz0123456789ABCD'].join('-')}})),/HERMES_SECRET_VALUE_FORBIDDEN/);
});

test('processing cannot fake durable acceptance or ACK',()=>{
  assert.throws(()=>processingTransition('VALIDATED','PERSISTED'),/HERMES_DURABLE_RECEIPT_REQUIRED/);
  const persisted=processingTransition('VALIDATED','PERSISTED',{durableReceiptRef:'receipt:001'}); assert.equal(persisted.authorityGranted,false);
  assert.equal(canAcknowledgeHermes('ACCEPTED'),false); assert.equal(canAcknowledgeHermes('ACCEPTED',{durableReceiptRef:'receipt:001'}),true);
});

test('processing and delivery transitions fail closed independently',()=>{
  assert.equal(processingTransition('RECEIVED','AUTHENTICATED').to,'AUTHENTICATED');
  assert.throws(()=>processingTransition('RECEIVED','ACCEPTED'),/FORBIDDEN/);
  assert.equal(deliveryTransition('FAILED','RETRY_PENDING').retryExecuted,false);
  assert.throws(()=>deliveryTransition('QUEUED','SENT'),/FORBIDDEN/);
});
test('channel binding is default deny',()=>{
  const yes=evaluateHermesBinding({sender:'operator',recipient:'prometheus',channel:'command-deck',capability:'research.read',bindings:[{sender:'operator',recipient:'prometheus',channel:'command-deck',capability:'research.read',enabled:true}]});
  const no=evaluateHermesBinding({sender:'operator',recipient:'prometheus',channel:'command-deck',capability:'research.write',bindings:[]});
  assert.equal(yes.allowed,true); assert.equal(no.allowed,false); assert.equal(no.defaultDeny,true);
});

test('delivery intent never starts delivery and external direction stays Trust-Canal gated',()=>{
  const bindings=[{sender:'operator',recipient:'prometheus',channel:'command-deck',capability:'research.read',enabled:true}];
  const internal=createHermesDeliveryIntent(env(),{recipient:'prometheus',capability:'research.read',requestedAt:now,bindings});
  const outbound=createHermesDeliveryIntent(env({direction:'OUTBOUND'}),{recipient:'prometheus',capability:'research.read',requestedAt:now,bindings});
  assert.equal(internal.deliveryStarted,false); assert.equal(internal.requiresTrustCanal,false); assert.equal(outbound.requiresTrustCanal,true); assert.equal(outbound.executionStarted,false);
});

test('conversation ordering reports explicit finite anomalies',()=>{
  assert.equal(evaluateConversationOrder([{messageId:'m1',conversationId:'c1',sequence:1},{messageId:'m2',conversationId:'c1',sequence:2}]).ordered,true);
  const bad=evaluateConversationOrder([{messageId:'m1',conversationId:'c1',sequence:2},{messageId:'m2',conversationId:'c1',sequence:2}]);
  assert.equal(bad.ordered,false); assert.equal(bad.anomalies.length,2);
});
test('limbo is observable but never auto-retried',()=>{
  const a=assessHermesLimbo({processingState:'VALIDATED',deliveryState:'FAILED',lastChangedAt:'2026-08-29T19:00:00.000Z',now,maxIdleMs:900000});
  assert.equal(a.inLimbo,true); assert.equal(a.recommendation,'OPERATOR_REVIEW'); assert.equal(a.retryExecuted,false); assert.equal(a.authorityGranted,false);
});

test('terminal accepted message still needs durable receipt for ACK',()=>{
  const no=assessHermesLimbo({processingState:'ACCEPTED',deliveryState:'SENT',lastChangedAt:now,now});
  const yes=assessHermesLimbo({processingState:'ACCEPTED',deliveryState:'SENT',durableReceiptRef:'receipt:001',lastChangedAt:now,now});
  assert.equal(no.ackAllowed,false); assert.equal(yes.ackAllowed,true); assert.equal(yes.terminalDelivery,true);
});
