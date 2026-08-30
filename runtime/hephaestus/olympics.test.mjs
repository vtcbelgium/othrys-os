import test from 'node:test';import assert from 'node:assert/strict';
import {createOlympicsCard,olympicsStandings,qualificationDecision} from './olympics.mjs';
test('Olympics ranks proven quality before speed',()=>{const cards=[createOlympicsCard({builderId:'fast',eventId:'SPRINT',talosPass:false,latencyMs:10}),createOlympicsCard({builderId:'good',eventId:'SPRINT',talosPass:true,latencyMs:100})];assert.equal(olympicsStandings(cards)[0].builderId,'good');});
test('Olympics never auto-enables a builder',()=>{const row={builderId:'x',events:4,firstPassRate:1,protocolRate:1,violations:0};const d=qualificationDecision(row);assert.equal(d.state,'QUALIFICATION_CANDIDATE');assert.equal(d.automaticExecutionEnable,false);assert.equal(d.talosQualificationRequired,true);});
