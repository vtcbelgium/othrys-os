export function proposeBuildRoute(preflight:any,selection:any){
  const base={schema:'othrys.os.build-route.v1',missionId:String(preflight?.missionId??''),authorityGranted:false,executionStarted:false};
  if(preflight?.class==='NO_CHANGE') return Object.freeze({...base,status:'NOT_REQUIRED',reason:'PREFLIGHT_NO_CHANGE',selected:null});
  if(preflight?.class==='BLOCKED') return Object.freeze({...base,status:'BLOCKED',reason:String(preflight?.reason??'PREFLIGHT_BLOCKED'),selected:null});
  if(preflight?.class!=='MISSING_WORK') return Object.freeze({...base,status:'BLOCKED',reason:'PREFLIGHT_CLASS_INVALID',selected:null});
  const selected=selection?.selected??null;
  if(!selected) return Object.freeze({...base,status:'BLOCKED',reason:String(selection?.reason??'NO_ROUTE'),selected:null});
  if(selected.providerHealth!=='HEALTHY'||selected.certification!=='CERTIFIED'||!Array.isArray(selected.capabilities)||!selected.capabilities.includes('engineering.build')) return Object.freeze({...base,status:'BLOCKED',reason:'SELECTED_LABOR_NOT_CERTIFIED_HEALTHY_ENGINEERING',selected:null});
  return Object.freeze({...base,status:'ROUTE_PROPOSED',reason:String(selection?.reason??'LOCAL_PRIMARY_AVAILABLE'),selected:{id:selected.id,label:selected.label,capabilities:selected.capabilities,tier:selected.tier,costClass:selected.costClass,locality:selected.locality,providerHealth:selected.providerHealth,certification:selected.certification,measuredTrust:selected.measuredTrust??null}});
}
