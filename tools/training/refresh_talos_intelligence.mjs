import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildTalosIntelligence } from '../../runtime/os/talos_learning_core.mjs';

const root=resolve(import.meta.dirname,'..','..');
const level=Number(process.argv[2]??3);
if(!Number.isInteger(level)||level<1)throw new Error('LEVEL_REQUIRED');
const intel=buildTalosIntelligence(root,level);
const out=resolve(root,'docs','training',`TALOS_LEVEL${level}_INTELLIGENCE_LIVE.json`);
writeFileSync(out,JSON.stringify(intel,null,2)+'\n');
console.log(JSON.stringify({schema:intel.schema,level,jobs:intel.learning.jobs,finalPassRate:intel.learning.finalPassRate,recoveryRate:intel.learning.operatorRecoveryRate,adaptationDigest:intel.adaptations.adaptationDigest,authorityGranted:false}));
