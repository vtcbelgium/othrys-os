import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrometheusDailyReport} from './prometheus_daily.mjs';
import {createTelegramPrometheusPayload,parseTelegramPrometheusCallback} from './telegram_prometheus.mjs';
const finding={title:'New free API',source:'official',summary:'Useful free API.',kind:'HARVEST',lens:'AI',score:.95,url:'https://example.com/api',type:'API',freeTier:true,requiresAccount:false,credentialEnvVar:null};
test('Telegram payload keeps newsletter concise and buttons carry only action identity',()=>{const r=createPrometheusDailyReport({runId:'r1',completedAt:'2026-08-29T21:00:00Z',findings:[finding]});const x=createTelegramPrometheusPayload(r);assert.equal(x.reply_markup.inline_keyboard.length,1);assert.match(x.reply_markup.inline_keyboard[0][0].callback_data,/^prom:add:PO-/);assert.equal(JSON.stringify(x).includes('secret'),false);assert.equal(x.deliveryStarted,false);});
test('callback parser yields Add/Deny request, not authority',()=>{const r=createPrometheusDailyReport({runId:'r1',completedAt:'2026-08-29T21:00:00Z',findings:[finding]});const p=createTelegramPrometheusPayload(r),d=parseTelegramPrometheusCallback(p.reply_markup.inline_keyboard[0][0].callback_data);assert.equal(d.decision,'ADD');assert.equal(d.answerCallbackRequired,true);assert.equal(d.authorityGranted,false);});
test('arbitrary callback is refused',()=>assert.throws(()=>parseTelegramPrometheusCallback('prom:add:whatever'),/INVALID/));
