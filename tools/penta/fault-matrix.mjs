import { assessPentarchy } from '../../runtime/os/pentarchy.mjs';

const req={KRONOS:['lifeEvidence','boundedWindow'],TALOS:['flowEvidence','verificationEvidence','terminationEvidence'],PROMETHEUS:['intelligenceEvidence'],MNEMOSYNE:['lineageEvidence','lessonEvidence'],HEPHAESTUS:['buildEvidence','independentVerification']};
const base=Object.fromEntries(Object.entries(req).map(([seat,keys])=>[seat,Object.fromEntries(keys.map(k=>[k,true]))]));
const rows=[];
for(const [seat,keys] of Object.entries(req))for(const key of keys){
  const evidence=structuredClone(base);evidence[seat][key]=false;
  const out=assessPentarchy({missionId:'penta-fault-matrix',evidence,authorityGranted:false,executionStarted:false});
  rows.push({seat,key,blocked:out.ready===false,missing:out.seats[seat].missing});
}
let authorityRefused=false;try{assessPentarchy({missionId:'penta-fault-matrix',evidence:base,authorityGranted:true,executionStarted:false});}catch{authorityRefused=true;}
const pass=rows.every(x=>x.blocked&&x.missing.includes(x.key))&&authorityRefused;
console.log(JSON.stringify({schema:'othrys.os.pentarchy-fault-matrix.v1',status:pass?'PASS':'FAIL',faultsInjected:rows.length,faultsBlocked:rows.filter(x=>x.blocked).length,authorityEscalationRefused:authorityRefused,rows,authorityGranted:false,executionStarted:false},null,2));
if(!pass)process.exit(1);