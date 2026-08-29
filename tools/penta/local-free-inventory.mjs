import { spawnSync } from 'node:child_process';
const run=spawnSync('ollama',['list'],{encoding:'utf8'});
if(run.status!==0){console.log(JSON.stringify({schema:'othrys.os.local-free-inventory.v1',status:'OLLAMA_UNAVAILABLE',models:[],authorityGranted:false,executionStarted:false},null,2));process.exit(1);}
const lines=run.stdout.trim().split(/\r?\n/).slice(1),models=[];
for(const line of lines){const name=line.trim().split(/\s{2,}/)[0];if(!name)continue;models.push({id:`ollama:${name}`,model:name,class:name.includes('embed')?'EMBEDDING':'INFERENCE',marginalCost:'ZERO',locality:'LOCAL',available:true,qualification:'REQUIRED_UNLESS_ALREADY_CERTIFIED'});}
console.log(JSON.stringify({schema:'othrys.os.local-free-inventory.v1',status:'READY',modelCount:models.length,models,automaticAdmission:false,authorityGranted:false,executionStarted:false},null,2));