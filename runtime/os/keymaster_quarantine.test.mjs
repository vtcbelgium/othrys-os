import test from 'node:test';
import assert from 'node:assert/strict';
import { providerQuarantine,activeHealthRows,KEYMASTER_PROVIDER_QUARANTINE } from './keymaster_quarantine.mjs';
test('Together and Fireworks are quarantined from active health',()=>{
 assert.deepEqual(Object.keys(KEYMASTER_PROVIDER_QUARANTINE).sort(),['FIREWORKS_API_KEY','TOGETHER_API_KEY']);
 for(const env of Object.keys(KEYMASTER_PROVIDER_QUARANTINE)){const q=providerQuarantine(env);assert.equal(q.healthExcluded,true);assert.equal(q.routingExcluded,true);}
});
test('quarantine rows cannot degrade active organism health',()=>{
 const active=activeHealthRows([{status:'HEALTHY'},{status:'DEGRADED',quarantined:true}]);
 assert.equal(active.length,1);assert.equal(active[0].status,'HEALTHY');
});
