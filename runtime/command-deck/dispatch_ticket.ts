import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class DispatchTicketError extends Error { code:string; constructor(code:string){super(code);this.code=code;this.name='DispatchTicketError';} }
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
export function consumePermitForDispatch(permitPath:string,requestPath:string,outDir:string,nowIso:string){
  if(!existsSync(permitPath)||!existsSync(requestPath)) throw new DispatchTicketError('DISPATCH_EVIDENCE_MISSING');
  const permitRaw=readFileSync(permitPath,'utf8'),requestRaw=readFileSync(requestPath,'utf8');let permit:any,req:any;try{permit=JSON.parse(permitRaw);req=JSON.parse(requestRaw)}catch{throw new DispatchTicketError('DISPATCH_EVIDENCE_INVALID')}
  if(permit.schema!=='othrys.os.launch-permit.v1'||permit.status!=='PERMIT_READY_NOT_STARTED'||permit.oneShot!==true||permit.consumed!==false||permit.executionStarted!==false) throw new DispatchTicketError('PERMIT_NOT_DISPATCHABLE');
  const now=Date.parse(nowIso),expires=Date.parse(String(permit.expiresAt));if(!Number.isFinite(now)||!Number.isFinite(expires)||now>expires) throw new DispatchTicketError('PERMIT_EXPIRED');
  const permitDigest=sha(permitRaw);if(req.schema_version!=='othrys.worker-request.v0.1'||req.metadata?.permit_id!==permit.permitId||req.metadata?.permit_digest!==permitDigest||req.metadata?.mission_id!==permit.missionId||req.metadata?.builder_id!==permit.builderId) throw new DispatchTicketError('REQUEST_PERMIT_MISMATCH');
  const ticketId=`DISPATCH-${String(req.job_id).replace(/^JOB-/,'')}`,ticket={schema:'othrys.os.dispatch-ticket.v1',ticketId,jobId:req.job_id,missionId:permit.missionId,builderId:permit.builderId,permitId:permit.permitId,originalPermitDigest:permitDigest,requestDigest:sha(requestRaw),consumedAt:new Date(now).toISOString(),status:'DISPATCH_AUTHORIZED',authorityGranted:true,executionStarted:false};
  const consumed={...permit,consumed:true,consumedAt:ticket.consumedAt,status:'PERMIT_CONSUMED_FOR_DISPATCH'};const consumedText=JSON.stringify(consumed,null,2)+'\n';
  writeFileSync(permitPath,consumedText,'utf8');mkdirSync(outDir,{recursive:true});const ticketPath=join(outDir,`${ticketId}.json`),ticketText=JSON.stringify(ticket,null,2)+'\n';
  if(existsSync(ticketPath)){if(readFileSync(ticketPath,'utf8')!==ticketText)throw new DispatchTicketError('DISPATCH_TICKET_CONFLICT');return {ticket,ticketPath,permit:consumed,created:false};}
  writeFileSync(ticketPath,ticketText,'utf8');return {ticket,ticketPath,permit:consumed,created:true};
}
