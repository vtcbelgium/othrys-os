import { readFileSync } from 'node:fs';
import { admitDeckIntent } from './intent_bridge.ts';

const args=process.argv.slice(2);
function value(flag:string){const i=args.indexOf(flag);if(i<0||!args[i+1])throw new Error(`MISSING_${flag.slice(2).toUpperCase()}`);return args[i+1];}
const intentPath=value('--intent');
const ledgerPath=value('--ledger');
const raw=JSON.parse(readFileSync(intentPath,'utf8'));
const result=admitDeckIntent(raw,ledgerPath);
process.stdout.write(JSON.stringify(result,null,2)+'\n');
