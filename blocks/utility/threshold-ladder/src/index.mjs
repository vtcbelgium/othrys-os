function valid(rungs){return Array.isArray(rungs)&&rungs.length>0&&rungs.every((r,i)=>r&&Number.isFinite(r.threshold)&&(i===0||r.threshold>rungs[i-1].threshold));}
export function resolveThreshold(value,rungs){
  if(!Number.isFinite(value)) throw new TypeError('INVALID_VALUE');
  if(!valid(rungs)) throw new Error('INVALID_LADDER');
  let index=0; for(let i=0;i<rungs.length;i++) if(value>=rungs[i].threshold) index=i;
  const current=structuredClone(rungs[index]), next=index+1<rungs.length?structuredClone(rungs[index+1]):null;
  const progress=next?Math.max(0,Math.min(1,(value-current.threshold)/(next.threshold-current.threshold))):1;
  return Object.freeze({index,current,next,progress});
}
