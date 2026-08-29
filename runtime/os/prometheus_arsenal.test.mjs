import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePrometheusOpportunity, decidePrometheusOpportunity, createArsenalIntakeRequest, PROMETHEUS_NEWSLETTER_PROFILE } from './prometheus_arsenal.mjs';
const item=(o={})=>({title:'Groq free API',summary:'Useful free inference capacity.',source:'prometheus',url:'https://example.com/groq',type:'API',score:.9,harvestable:true,freeTier:true,requiresAccount:true,credentialEnvVar:'GROQ_API_KEY',...o});

test('opportunity identity is deterministic',()=>assert.equal(normalizePrometheusOpportunity(item()).opportunityId,normalizePrometheusOpportunity(item()).opportunityId));
test('deny is terminal and inert',()=>{const d=decidePrometheusOpportunity(item(),{decision:'DENY'});assert.equal(d.state,'DENIED');assert.equal(d.executionStarted,false);});
test('existing Keymaster credential makes ADD qualification-ready',()=>{const d=decidePrometheusOpportunity(item(),{decision:'ADD',credentialInventory:[{envVar:'GROQ_API_KEY',present:true}]});assert.equal(d.state,'QUALIFICATION_READY');const r=createArsenalIntakeRequest(item(),d);assert.equal(r.paidUsageAllowed,false);assert.equal(r.autoEnable,false);});
test('missing account/key prompts operator instead of failing or auto-signup',()=>{const d=decidePrometheusOpportunity(item(),{decision:'ADD',credentialInventory:[]});assert.equal(d.state,'ACCOUNT_REQUIRED');assert.equal(d.nextAction,'PROMPT_OPERATOR_ACCOUNT_SETUP');});
test('paid or unknown-free candidates cannot enter automatic arsenal intake',()=>{const x=item({freeTier:false,requiresAccount:false,credentialEnvVar:null});const d=decidePrometheusOpportunity(x,{decision:'ADD'});assert.throws(()=>createArsenalIntakeRequest(x,d),/FREE_TIER_REQUIRED/);});
test('newsletter stays concise and watches Syntra-relevant topics',()=>{assert.ok(PROMETHEUS_NEWSLETTER_PROFILE.maxItems<=10);assert.equal(PROMETHEUS_NEWSLETTER_PROFILE.lenses.some(x=>x.id==='syntra'),true);});
