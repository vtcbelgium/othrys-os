import { resolve } from 'node:path';
import { loadForgeRoster, loadForgeSparkEvidence, rankForgeBuilders } from '../../runtime/hephaestus/forge.mjs';
import { buildTalosIntelligence } from '../../runtime/os/talos_learning_core.mjs';

const root=resolve(import.meta.dirname,'..','..');
const family=process.argv[2]??'local-app';
const tagsByFamily={web:['coding','small','web'],extension:['coding','agentic','repo'],pwa:['coding','web'],composition:['coding','agentic','repo'],quality:['coding','repair'], 'local-app':['coding','app']};
const intel=buildTalosIntelligence(root,3);
const ranking=rankForgeBuilders(loadForgeRoster(root),{tags:tagsByFamily[family]??['coding'],localPreferred:true,fast:family==='web'},{spark:loadForgeSparkEvidence(root),evidence:intel.adaptations.HEPHAESTUS.forgeEvidence});
const selected=ranking.executable[0];
if(!selected)throw new Error('NO_ADAPTIVE_BUILDER');
console.log(JSON.stringify({builder:selected.id,score:selected.score,measuredQuality:selected.measuredQuality,measuredLatencyMs:selected.measuredLatencyMs,sourceDigest:intel.learning.evidenceDigest,authorityGranted:false}));
