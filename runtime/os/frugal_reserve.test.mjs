import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyFrugalReserve,selectFrugalContinuityRoute,evaluateFrugalTaskFit,buildFreeConsumptionPlan} from './frugal_reserve.mjs';

const c=(id,costClass='ZERO',locality='REMOTE',trust=.8)=>({id,costClass,locality,measuredTrust:trust,legal:true,providerHealth:'HEALTHY',paidApprovalRequired:costClass==='PAID'});

test('10 percent reserve is preserved before hard exhaustion',()=>{assert.equal(classifyFrugalReserve({id:'a',remainingFraction:.11}).band,'AVAILABLE');const x=classifyFrugalReserve({id:'a',remainingFraction:.10});assert.equal(x.band,'RESERVE');assert.equal(x.preserveForFallback,true);});
test('unmetered local capacity is always available',()=>assert.equal(classifyFrugalReserve({id:'local',remainingFraction:0,metered:false}).band,'UNMETERED'));
test('continuity switches early from reserve to another zero-cost route',()=>{const x=selectFrugalContinuityRoute({currentId:'free-a',candidates:[c('free-a'),c('local','ZERO','LOCAL',.7),c('free-b')],usageById:{'free-a':{remainingFraction:.08},local:{remainingFraction:0,metered:false},'free-b':{remainingFraction:.9}}});assert.equal(x.switchRecommended,true);assert.equal(x.selectedId,'local');assert.equal(x.reason,'RESERVE_PRESERVED_SWITCH_EARLY');});
test('healthy current free route remains stable',()=>{const x=selectFrugalContinuityRoute({currentId:'free-a',candidates:[c('free-a'),c('free-b')],usageById:{'free-a':{remainingFraction:.5},'free-b':{remainingFraction:.8}}});assert.equal(x.switchRecommended,false);assert.equal(x.selectedId,'free-a');});
test('paid route never auto-selects',()=>{const x=selectFrugalContinuityRoute({currentId:'free-a',candidates:[c('free-a'),c('paid','PAID')],usageById:{'free-a':{remainingFraction:0},paid:{remainingFraction:1}}});assert.equal(x.selectedId,null);assert.equal(x.paidApprovalRequired,true);});
test('task fit preserves recovery reserve before starting expensive work',()=>{const x=evaluateFrugalTaskFit({id:'free',remainingFraction:.18},{estimatedFraction:.09,reserveFloor:.10});assert.equal(x.fits,false);assert.equal(x.preserveReserve,true);});
test('free pool consumes unmetered zero-marginal capacity before metered quotas',()=>{const plan=buildFreeConsumptionPlan({candidates:[c('remote-free'),c('local-zero','ZERO','LOCAL',.7),c('subscription','LOW','REMOTE',.9),c('paid','PAID')],usageById:{'remote-free':{remainingFraction:.9},'local-zero':{remainingFraction:0,metered:false},subscription:{remainingFraction:.95}},estimatedFraction:.05});assert.equal(plan.selectedId,'local-zero');assert.equal(plan.paidRoutesIncluded,false);assert.deepEqual(plan.usable,['local-zero','remote-free','subscription']);});


