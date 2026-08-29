import test from 'node:test';
import assert from 'node:assert/strict';
import { createKronosHeartbeat } from './kronos.mjs';
import { createPrometheusKronosBeat, verifyPrometheusKronosBeat } from './kronos_prometheus_beat.mjs';

const heartbeat=()=>createKronosHeartbeat({bootId:'boot-prom-1',sequence:1,timestamp:'2026-08-29T21:10:00.000Z',uptimeMs:1000,lifecycleState:'ALIVE',components:[{componentId:'prometheus',mandatory:true,band:'ready',evidenceRef:'prometheus:resident',leaseExpiresAt:Date.parse('2026-08-29T22:10:00.000Z')} ]});
test('first Prometheus beat is due and authority-free',()=>{const b=createPrometheusKronosBeat({heartbeat:heartbeat(),now:'2026-08-29T21:10:00.000Z'});assert.equal(b.due,true);assert.equal(b.prometheusMayRun,true);assert.equal(b.schedulerInvented,false);assert.equal(verifyPrometheusKronosBeat(b),true);});
test('special beat waits until daily interval',()=>{const b=createPrometheusKronosBeat({heartbeat:heartbeat(),lastCompletedAt:'2026-08-29T20:30:00.000Z',now:'2026-08-29T21:10:00.000Z'});assert.equal(b.due,false);assert.equal(b.prometheusMayRun,false);});
