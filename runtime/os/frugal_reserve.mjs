const COST_RANK=Object.freeze({ZERO:0,LOW:1,PAID:2});
const clean=v=>typeof v==='string'?v.trim():'';
const base=body=>Object.freeze({...body,authorityGranted:false,executionStarted:false});

function usage(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) throw new Error('FRUGAL_USAGE_REQUIRED');
  const id=clean(raw.id),remaining=Number(raw.remainingFraction);
  if(!id||!Number.isFinite(remaining)||remaining<0||remaining>1) throw new Error('FRUGAL_USAGE_INVALID');
  return Object.freeze({id,remainingFraction:remaining,resetAt:raw.resetAt==null?null:clean(raw.resetAt),metered:raw.metered!==false});
}

export function classifyFrugalReserve(raw,{reserveFloor=0.10}={}){
  const u=usage(raw);
  if(!Number.isFinite(reserveFloor)||reserveFloor<0||reserveFloor>0.5) throw new Error('FRUGAL_RESERVE_FLOOR_INVALID');
  const band=!u.metered?'UNMETERED':u.remainingFraction<=0?'EXHAUSTED':u.remainingFraction<=reserveFloor?'RESERVE':'AVAILABLE';
  return base({schema:'othrys.os.frugal-reserve.v1',...u,reserveFloor,band,preserveForFallback:band==='RESERVE'});
}

export function selectFrugalContinuityRoute({currentId,candidates,usageById,reserveFloor=0.10}={}){
  currentId=clean(currentId);
  if(!currentId||!Array.isArray(candidates)||!usageById||typeof usageById!=='object') throw new Error('FRUGAL_CONTINUITY_INPUT_INVALID');
  const rows=candidates.map(c=>{
    if(!c||typeof c!=='object'||!clean(c.id)||!(c.costClass in COST_RANK)||c.legal!==true||c.providerHealth!=='HEALTHY') return null;
    const u=classifyFrugalReserve({id:c.id,...(usageById[c.id]??{remainingFraction:1,metered:false})},{reserveFloor});
    return Object.freeze({candidate:c,usage:u});
  }).filter(Boolean);
  const current=rows.find(x=>x.candidate.id===currentId)??null;
  const ranked=[...rows].filter(x=>!['EXHAUSTED','RESERVE'].includes(x.usage.band)).sort((a,b)=>COST_RANK[a.candidate.costClass]-COST_RANK[b.candidate.costClass]||(a.candidate.locality==='LOCAL'?0:1)-(b.candidate.locality==='LOCAL'?0:1)||(b.candidate.measuredTrust??-1)-(a.candidate.measuredTrust??-1)||a.candidate.id.localeCompare(b.candidate.id));
  const switchNeeded=current==null||['EXHAUSTED','RESERVE'].includes(current.usage.band);
  const selected=switchNeeded?(ranked[0]??null):current;
  const paid=selected?.candidate.costClass==='PAID'||selected?.candidate.paidApprovalRequired===true;
  return base({schema:'othrys.os.frugal-continuity.v1',currentId,currentBand:current?.usage.band??'UNKNOWN',switchRecommended:switchNeeded&&!!selected&&!paid,selectedId:paid?null:(selected?.candidate.id??null),paidApprovalRequired:paid,reason:!switchNeeded?'CURRENT_ROUTE_HEALTHY':!selected?'NO_FREE_CONTINUITY_ROUTE':paid?'PAID_STOP_REQUIRES_APPROVAL':'RESERVE_PRESERVED_SWITCH_EARLY'});
}
export function evaluateFrugalTaskFit(raw,{estimatedFraction=0,reserveFloor=0.10}={}){
  const u=classifyFrugalReserve(raw,{reserveFloor});
  if(!Number.isFinite(estimatedFraction)||estimatedFraction<0||estimatedFraction>1) throw new Error('FRUGAL_TASK_ESTIMATE_INVALID');
  const projected=u.metered?Math.max(0,u.remainingFraction-estimatedFraction):1;
  const fits=u.band==='UNMETERED'||(u.band==='AVAILABLE'&&projected>=reserveFloor);
  return base({schema:'othrys.os.frugal-task-fit.v1',id:u.id,band:u.band,remainingFraction:u.remainingFraction,estimatedFraction,projectedRemainingFraction:projected,fits,preserveReserve:!fits&&u.metered});
}

export function buildFreeConsumptionPlan({candidates,usageById,estimatedFraction=0,reserveFloor=0.10}={}){
  if(!Array.isArray(candidates)||!usageById||typeof usageById!=='object') throw new Error('FRUGAL_POOL_INPUT_INVALID');
  const rows=[];
  for(const c of candidates){
    if(!c||c.legal!==true||c.providerHealth!=='HEALTHY'||!clean(c.id)||(c.costClass!=='ZERO'&&c.costClass!=='LOW')) continue;
    const raw={id:c.id,...(usageById[c.id]??{remainingFraction:1,metered:false})};
    const fit=evaluateFrugalTaskFit(raw,{estimatedFraction,reserveFloor});
    rows.push(Object.freeze({id:c.id,costClass:c.costClass,locality:c.locality,measuredTrust:c.measuredTrust??null,fit}));
  }
  rows.sort((a,b)=>(a.costClass==='ZERO'?0:1)-(b.costClass==='ZERO'?0:1)||(a.fit.band==='UNMETERED'?0:1)-(b.fit.band==='UNMETERED'?0:1)||(b.fit.projectedRemainingFraction-a.fit.projectedRemainingFraction)||(b.measuredTrust??-1)-(a.measuredTrust??-1)||a.id.localeCompare(b.id));
  const usable=rows.filter(x=>x.fit.fits);
  return base({schema:'othrys.os.free-consumption-plan.v1',estimatedFraction,reserveFloor,ordered:Object.freeze(rows),usable:Object.freeze(usable.map(x=>x.id)),selectedId:usable[0]?.id??null,paidRoutesIncluded:false});
}