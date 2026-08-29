import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePrometheusReportChannel} from './prometheus_channel_policy.mjs';
test('existing GPT report stays default',()=>{const x=resolvePrometheusReportChannel({});assert.equal(x.effective,'GPT_ONLY');assert.equal(x.gptExistingFlowPreserved,true);});
test('Telegram preference fails safely until bot binding exists',()=>{const x=resolvePrometheusReportChannel({preference:'TELEGRAM',telegramReady:false});assert.equal(x.effective,'GPT_ONLY');assert.deepEqual(x.blockers,['TELEGRAM_NOT_READY']);});
test('both channels can coexist without changing authority',()=>{const x=resolvePrometheusReportChannel({preference:'BOTH',telegramReady:true,appReady:true});assert.equal(x.effective,'BOTH');assert.equal(x.authorityGranted,false);});
