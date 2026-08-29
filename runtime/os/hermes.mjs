import { createHash } from 'node:crypto';
import { looksSecretShaped } from './keymaster.mjs';

export const HERMES_DIRECTIONS=Object.freeze(['INBOUND','OUTBOUND','INTERNAL']);
export const HERMES_PROCESSING_STATES=Object.freeze(['RECEIVED','AUTHENTICATED','NORMALIZED','VALIDATED','PERSISTED','ACCEPTED','REJECTED']);
export const HERMES_DELIVERY_STATES=Object.freeze(['QUEUED','SENDING','SENT','FAILED','RETRY_PENDING','DEAD_LETTER']);
const PROCESSING_TRANSITIONS=Object.freeze({RECEIVED:['AUTHENTICATED','REJECTED'],AUTHENTICATED:['NORMALIZED','REJECTED'],NORMALIZED:['VALIDATED','REJECTED'],VALIDATED:['PERSISTED','REJECTED'],PERSISTED:['ACCEPTED'],ACCEPTED:[],REJECTED:[]});
const DELIVERY_TRANSITIONS=Object.freeze({QUEUED:['SENDING','FAILED'],SENDING:['SENT','FAILED'],SENT:[],FAILED:['RETRY_PENDING','DEAD_LETTER'],RETRY_PENDING:['SENDING','DEAD_LETTER'],DEAD_LETTER:[]});
const FORBIDDEN_KEYS=new Set(['secret','secretvalue','apikey','token','password','passwd','authorization','bearer','connectionstring','accesstoken','refreshtoken','sessiontoken','clientsecret','privatekey','credential','credentials','secretreference']);
const clean=v=>typeof v==='string'?v.trim():'';
const normalized=k=>String(k).toLowerCase().replace(/[_-]/g,'');
const digest=v=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
const base=body=>Object.freeze({...body,authorityGranted:false,executionStarted:false});

function assertId(value,label){
  if(!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/.test(clean(value))) throw new Error(`HERMES_${label}_INVALID`);
  return clean(value);
}
function assertTimestamp(value,label='TIMESTAMP'){
  const v=clean(value); if(!v||Number.isNaN(Date.parse(v))) throw new Error(`HERMES_${label}_INVALID`); return v;
}
function assertSecretFree(value,path='root'){
  if(Array.isArray(value)){value.forEach((v,i)=>assertSecretFree(v,`${path}[${i}]`));return;}
  if(value&&typeof value==='object'){
    for(const [k,v] of Object.entries(value)){
      if(FORBIDDEN_KEYS.has(normalized(k))) throw new Error(`HERMES_SECRET_FIELD_FORBIDDEN:${path}.${k}`);
      assertSecretFree(v,`${path}.${k}`);
    }
    return;
  }
  if(typeof value==='string'&&looksSecretShaped(value)) throw new Error(`HERMES_SECRET_VALUE_FORBIDDEN:${path}`);
}
function boundedObject(value,label,maxBytes){
  if(value===undefined||value===null) return Object.freeze({});
  if(!value||typeof value!=='object'||Array.isArray(value)) throw new Error(`HERMES_${label}_INVALID`);
  assertSecretFree(value,label.toLowerCase());
  if(Buffer.byteLength(JSON.stringify(value),'utf8')>maxBytes) throw new Error(`HERMES_${label}_TOO_LARGE`);
  return Object.freeze(structuredClone(value));
}

export function deriveActorScopedIdempotencyKey(actorId,sourceKey){
  const actor=assertId(actorId,'ACTOR_ID'), source=assertId(sourceKey,'SOURCE_KEY');
  return `hermes:${actor}:${digest([actor,source]).slice(0,32)}`;
}

export function createHermesEnvelope(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) throw new Error('HERMES_ENVELOPE_INVALID');
  const messageId=assertId(raw.messageId,'MESSAGE_ID');
  const conversationId=assertId(raw.conversationId,'CONVERSATION_ID');
  const sender=assertId(raw.sender,'SENDER');
  const recipients=Array.isArray(raw.recipients)?raw.recipients.map(v=>assertId(v,'RECIPIENT')):[];
  if(recipients.length<1||recipients.length>16||new Set(recipients).size!==recipients.length) throw new Error('HERMES_RECIPIENTS_INVALID');
  const channel=assertId(raw.channel,'CHANNEL');
  const direction=clean(raw.direction);
  if(!HERMES_DIRECTIONS.includes(direction)) throw new Error('HERMES_DIRECTION_INVALID');
  const timestamp=assertTimestamp(raw.timestamp);
  const replyTo=raw.replyTo===null||raw.replyTo===undefined?null:assertId(raw.replyTo,'REPLY_TO');
  const idempotencyKey=assertId(raw.idempotencyKey,'IDEMPOTENCY_KEY');
  const payload=boundedObject(raw.payload,'PAYLOAD',32768);
  const context=boundedObject(raw.context,'CONTEXT',8192);
  const metadata=boundedObject(raw.metadata,'METADATA',8192);
  const body={schema:'othrys.os.hermes-message.v1',messageId,conversationId,sender,recipients:Object.freeze(recipients),channel,direction,timestamp,payload,context,metadata,replyTo,idempotencyKey,persistenceRequired:true,ackAllowed:false};
  assertSecretFree(body);
  return base({...body,envelopeDigest:digest(body)});
}

export function processingTransition(from,to,{durableReceiptRef=null}={}){
  if(!HERMES_PROCESSING_STATES.includes(from)||!HERMES_PROCESSING_STATES.includes(to)) throw new Error('HERMES_PROCESSING_STATE_INVALID');
  if(!PROCESSING_TRANSITIONS[from].includes(to)) throw new Error('HERMES_PROCESSING_TRANSITION_FORBIDDEN');
  if(to==='PERSISTED'&&!clean(durableReceiptRef)) throw new Error('HERMES_DURABLE_RECEIPT_REQUIRED');
  return base({schema:'othrys.os.hermes-processing-transition.v1',from,to,durableReceiptRef:to==='PERSISTED'?clean(durableReceiptRef):null});
}
export function canAcknowledgeHermes(processingState,{durableReceiptRef=null}={}){
  return processingState==='ACCEPTED'&&Boolean(clean(durableReceiptRef));
}

export function deliveryTransition(from,to){
  if(!HERMES_DELIVERY_STATES.includes(from)||!HERMES_DELIVERY_STATES.includes(to)) throw new Error('HERMES_DELIVERY_STATE_INVALID');
  if(!DELIVERY_TRANSITIONS[from].includes(to)) throw new Error('HERMES_DELIVERY_TRANSITION_FORBIDDEN');
  return base({schema:'othrys.os.hermes-delivery-transition.v1',from,to,retryExecuted:false});
}

export function evaluateHermesBinding({sender,recipient,channel,capability,bindings}){
  sender=assertId(sender,'SENDER'); recipient=assertId(recipient,'RECIPIENT'); channel=assertId(channel,'CHANNEL'); capability=assertId(capability,'CAPABILITY');
  if(!Array.isArray(bindings)) throw new Error('HERMES_BINDINGS_INVALID');
  const allowed=bindings.some(b=>b&&b.sender===sender&&b.recipient===recipient&&b.channel===channel&&b.capability===capability&&b.enabled===true);
  return base({schema:'othrys.os.hermes-binding-decision.v1',sender,recipient,channel,capability,allowed,defaultDeny:true});
}

export function evaluateConversationOrder(messages){
  if(!Array.isArray(messages)||messages.length===0) throw new Error('HERMES_CONVERSATION_SEQUENCE_INVALID');
  const rows=messages.map(m=>({messageId:assertId(m.messageId,'MESSAGE_ID'),conversationId:assertId(m.conversationId,'CONVERSATION_ID'),sequence:Number(m.sequence)}));
  const conversationId=rows[0].conversationId;
  if(rows.some(r=>r.conversationId!==conversationId||!Number.isSafeInteger(r.sequence)||r.sequence<0)) throw new Error('HERMES_CONVERSATION_SEQUENCE_INVALID');
  const seen=new Set(), anomalies=[];
  for(let i=0;i<rows.length;i++){
    if(seen.has(rows[i].sequence)) anomalies.push({messageId:rows[i].messageId,reason:'DUPLICATE_SEQUENCE'});
    seen.add(rows[i].sequence);
    if(i>0&&rows[i].sequence<=rows[i-1].sequence) anomalies.push({messageId:rows[i].messageId,reason:'NON_MONOTONIC'});
  }
  return base({schema:'othrys.os.hermes-conversation-order.v1',conversationId,ordered:anomalies.length===0,anomalies:Object.freeze(anomalies)});
}
export function createHermesDeliveryIntent(envelope,{recipient,capability,requestedAt,bindings}={}){
  const e=createHermesEnvelope(envelope);
  recipient=assertId(recipient,'RECIPIENT'); capability=assertId(capability,'CAPABILITY'); requestedAt=assertTimestamp(requestedAt,'REQUESTED_AT');
  if(!e.recipients.includes(recipient)) throw new Error('HERMES_RECIPIENT_NOT_IN_ENVELOPE');
  const binding=evaluateHermesBinding({sender:e.sender,recipient,channel:e.channel,capability,bindings});
  if(!binding.allowed) throw new Error('HERMES_BINDING_DENIED');
  return base({schema:'othrys.os.hermes-delivery-intent.v1',messageId:e.messageId,conversationId:e.conversationId,recipient,channel:e.channel,capability,requestedAt,requiresAdapter:true,requiresTrustCanal:e.direction!=='INTERNAL',deliveryStarted:false,providerMutation:false});
}

export function assessHermesLimbo({processingState,deliveryState,durableReceiptRef=null,lastChangedAt,now,maxIdleMs=900000}){
  if(!HERMES_PROCESSING_STATES.includes(processingState)||!HERMES_DELIVERY_STATES.includes(deliveryState)) throw new Error('HERMES_LIMBO_STATE_INVALID');
  lastChangedAt=assertTimestamp(lastChangedAt,'LAST_CHANGED_AT'); now=assertTimestamp(now,'NOW');
  if(!Number.isSafeInteger(maxIdleMs)||maxIdleMs<1000) throw new Error('HERMES_LIMBO_BUDGET_INVALID');
  const idleMs=Date.parse(now)-Date.parse(lastChangedAt); if(idleMs<0) throw new Error('HERMES_LIMBO_TIME_INVALID');
  const terminalProcessing=['ACCEPTED','REJECTED'].includes(processingState), terminalDelivery=['SENT','DEAD_LETTER'].includes(deliveryState);
  const ackAllowed=canAcknowledgeHermes(processingState,{durableReceiptRef});
  const inLimbo=!terminalDelivery&&idleMs>maxIdleMs;
  return base({schema:'othrys.os.hermes-limbo-assessment.v1',processingState,deliveryState,idleMs,inLimbo,terminalProcessing,terminalDelivery,ackAllowed,recommendation:inLimbo?'OPERATOR_REVIEW':'NONE',retryExecuted:false});
}
