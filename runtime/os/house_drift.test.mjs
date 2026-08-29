import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root=resolve(import.meta.dirname,'../..');
const read=name=>readFileSync(join(root,name),'utf8');

test('TEMP_LIBRARY current Block map covers every active admission',()=>{
  const library=read('TEMP_LIBRARY.md');
  const admissions=join(root,'admissions');
  const active=readdirSync(admissions)
    .filter(name=>name.endsWith('.json'))
    .map(name=>JSON.parse(readFileSync(join(admissions,name),'utf8')))
    .filter(record=>record.admission_status==='ACTIVE_ADMITTED');
  assert.ok(active.length>=1,'no active Block admissions found');
  for(const record of active){
    assert.match(library,new RegExp(record.block_id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),
      `TEMP_LIBRARY missing active admission ${record.block_id}`);
  }
});