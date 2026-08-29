import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runOpportunityAction } from './opportunity-action.mjs';
const [opportunityId,choice]=process.argv.slice(2); if(!/^PO-[0-9a-f]{20}$/.test(opportunityId??'')||!['ADD','DENY'].includes(String(choice??'').toUpperCase())) throw new Error('usage: node tools/penta/prometheus-action-by-id.mjs PO-... ADD|DENY');
const dir=join(process.cwd(),'.othrys','runtime','prometheus','newsletter'); if(!existsSync(dir)) throw new Error('PROM_NEWSLETTER_STORE_MISSING');
const files=readdirSync(dir).filter(x=>x.endsWith('.json')).sort().reverse(); let raw=null;
for(const file of files){const report=JSON.parse(readFileSync(join(dir,file),'utf8'));for(const finding of report?.report?.findings??[]){if(finding?.opportunity?.opportunityId===opportunityId){raw=finding.opportunity;break;}}if(raw)break;}
if(!raw) throw new Error('PROM_OPPORTUNITY_NOT_FOUND');
const result=await runOpportunityAction(raw,String(choice).toUpperCase());console.log(JSON.stringify(result,null,2));
