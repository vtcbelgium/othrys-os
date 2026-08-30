export const TRIAD_OFFICES=Object.freeze({PROMETHEUS:Object.freeze(['discovery','research','evidence','evaluation','capability-intelligence','technology-watch','recommendations']),MNEMOSYNE:Object.freeze(['institutional-memory','knowledge','relationships','retrieval','history','traceability','admission-policy']),HEPHAESTUS:Object.freeze(['construction','engineering','integration','infrastructure','verification','delivery'])});
export const TRIAD_LOOP=Object.freeze(['PROMETHEUS_DISCOVERY','MNEMOSYNE_ADMISSION','HEPHAESTUS_CONSTRUCTION','TALOS_VERIFICATION','MNEMOSYNE_OUTCOME','PROMETHEUS_REASSESSMENT']);
export function inspectTriadCovenant(){
  const rows=Object.entries(TRIAD_OFFICES), claims=new Map(), duplicates=[];
  for(const [office,domains] of rows)for(const d of domains){if(claims.has(d))duplicates.push({domain:d,owners:[claims.get(d),office]});else claims.set(d,office);}
  const loopClosed=TRIAD_LOOP[0]==='PROMETHEUS_DISCOVERY'&&TRIAD_LOOP.at(-1)==='PROMETHEUS_REASSESSMENT'&&TRIAD_LOOP.includes('MNEMOSYNE_OUTCOME');
  return Object.freeze({schema:'othrys.os.triad-covenant.v1',offices:Object.freeze(rows.map(([id,domains])=>Object.freeze({id,domains}))),domainCount:claims.size,duplicateOwnership:Object.freeze(duplicates),exclusiveOwnership:duplicates.length===0,loop:Object.freeze([...TRIAD_LOOP]),loopClosed,authorityGranted:false,executionStarted:false});
}
