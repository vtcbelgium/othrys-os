import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnosticCatalog,DIAGNOSTIC_PACKS } from '../../tools/penta/diagnostics.mjs';
import { SETTINGS_ACTIONS } from '../../tools/penta/settings-actions.mjs';

test('settings diagnostic catalog stays simple and read-only',()=>{const c=diagnosticCatalog();assert.deepEqual(c.map(x=>x.id),['quick','care','intelligence','execution','communications','blood','deep']);assert.ok(c.every(x=>x.settingsButtonReady&&x.mutates===false&&x.authorityGranted===false));});
test('every diagnostic pack has a bounded test surface',()=>{for(const [id,p] of Object.entries(DIAGNOSTIC_PACKS)){assert.ok(p.tests?.length||p.glob,id);assert.ok((p.tests?.length??0)<=12,id);}});
test('settings actions expose tests, benchmark and bounded soak without mutation',()=>{const ids=new Set(SETTINGS_ACTIONS.map(x=>x.id));assert.equal(ids.size,SETTINGS_ACTIONS.length);assert.ok(ids.has('penta-quick'));assert.ok(ids.has('othrys-deep'));assert.ok(ids.has('blood-check'));assert.ok(ids.has('keymaster-inventory'));assert.ok(ids.has('penta-benchmark'));assert.ok(ids.has('penta-loop-100'));assert.ok(SETTINGS_ACTIONS.every(x=>x.mutates===false&&x.authorityGranted===false&&x.executionStarted===false));});
