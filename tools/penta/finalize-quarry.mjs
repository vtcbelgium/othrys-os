import { readFileSync, writeFileSync } from 'node:fs';
const root=process.cwd();
const censusPath=`${root}/docs/V2-011J/FINAL_QUARRY_CENSUS.json`;
const libraryPath=`${root}/docs/V2-011J/GREAT_LIBRARY_SEED.json`;
const census=JSON.parse(readFileSync(censusPath,'utf8'));
const library=JSON.parse(readFileSync(libraryPath,'utf8'));
const native={
  'candidate.os.capability-registry':'runtime/os/capability_registry.mjs',
  'candidate.os.credential-broker':'runtime/os/credential_broker.mjs + runtime/os/credential_usage_ledger.mjs',
  'candidate.os.intelligence-foundation':'runtime/os/intelligence_foundation.mjs',
  'candidate.triad.machine-covenant':'runtime/os/triad_covenant.mjs',
  'candidate.ai.skill-contract':'runtime/os/skill_contract.mjs',
  'candidate.security.mission-sandbox':'runtime/os/mission_sandbox.mjs',
  'candidate.security.execution-sandbox':'runtime/os/mission_sandbox.mjs',
  'candidate.ops.assurance-test-centre':'tools/penta/diagnostics.mjs',
  'candidate.ops.sclerotium-recovery':'runtime/os/sclerotium.mjs',
  'candidate.ops.soak-controller':'tools/penta/soak.mjs',
  'candidate.os.bridge-recovery':'runtime/talos-kernel',
  'candidate.ops.scheduled-reinspection':'runtime/os/housekeeper_daemon.mjs',
};const agpl=new Set(['candidate.ai.deep-research-workspace','candidate.ai.blind-model-compare','candidate.comms.email-workbench','candidate.product.notes-tasks-calendar']);
const finalRows=census.candidates.map(c=>{
  let finalDisposition,target=null,reason='';
  if(native[c.id]){finalDisposition='IMPLEMENTED_OR_MERGED_NATIVE';target=native[c.id];reason='Useful invariant already has or now has a V2-native implementation.';}
  else if(agpl.has(c.id)){finalDisposition='REFERENCE_ONLY_LICENSE_BOUND';target='Great Library reference';reason='Odysseus/PewDiePie lineage is AGPL-3.0-or-later; concepts only, no code transplant.';}
  else if(c.disposition==='BLUEPRINT'){finalDisposition='BLUEPRINT_LIBRARY';target='Great Library blueprint';reason='Product-shaped composition; retain without OS coupling.';}
  else if(c.disposition==='REFERENCE'){finalDisposition='REFERENCE_LIBRARY';target='Great Library reference';reason='Proven lesson/pattern, not a new native subsystem.';}
  else {finalDisposition='BLOCK_LIBRARY';target='Great Library block quarry';reason='Useful capability, but premature or duplicate to wire into current OS.';}
  return Object.freeze({...c,finalDisposition,target,closeoutReason:reason,reviewed:true,authorityGranted:false,executionStarted:false});
});
const counts=finalRows.reduce((a,x)=>(a[x.finalDisposition]=(a[x.finalDisposition]??0)+1,a),{});
const closed={...census,status:'CLOSED',closedAt:new Date().toISOString(),unreviewed:0,finalCounts:counts,candidates:finalRows,odysseusPolicy:{lineage:'PewDiePie/archdaemon Odysseus -> odysseus-dev',license:'AGPL-3.0-or-later',codeTransplantAllowed:false,conceptHarvestAllowed:true},authorityGranted:false,executionStarted:false};
writeFileSync(censusPath,`${JSON.stringify(closed,null,2)}\n`);
const byId=new Map(finalRows.map(x=>[x.id,x]));
library.blocks=(library.blocks??[]).map(b=>{const f=byId.get(b.id);return f?{...b,status:f.finalDisposition,implementationTarget:f.target,closeoutReason:f.closeoutReason,reviewed:true,authorityGranted:false}:b;});
library.finalQuarry=Object.freeze({schema:'othrys.os.great-library-quarry-closeout.v1',status:'CLOSED',candidateCount:finalRows.length,unreviewed:0,counts,odysseusCodeTransplantAllowed:false,authorityGranted:false,executionStarted:false});
writeFileSync(libraryPath,`${JSON.stringify(library,null,2)}\n`);
console.log(JSON.stringify({status:'CLOSED',candidates:finalRows.length,unreviewed:0,counts},null,2));
