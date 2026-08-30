import test from 'node:test';
import assert from 'node:assert/strict';
import { createMissionSandbox, sandboxDecision } from './mission_sandbox.mjs';

test('mission sandbox is least-privilege and fail-closed',()=>{const s=createMissionSandbox({missionId:'V2-X',root:'C:/repo',allowedPaths:['runtime/os'],deniedPaths:['runtime/os/secrets'],network:'DENY',secrets:'DENY'});assert.equal(sandboxDecision(s,'runtime/os/a.mjs').allowed,true);assert.equal(sandboxDecision(s,'docs/x.md').allowed,false);assert.equal(sandboxDecision(s,'runtime/os/secrets/x').allowed,false);assert.equal(sandboxDecision(s,'runtime/os/a.mjs',{network:true}).code,'NETWORK_DENIED');assert.equal(sandboxDecision(s,'runtime/os/a.mjs',{secrets:true}).code,'SECRETS_DENIED');assert.equal(s.authorityGranted,false);});

test('path escape is refused',()=>{const s=createMissionSandbox({missionId:'V2-X',root:'C:/repo',allowedPaths:['runtime']});assert.throws(()=>sandboxDecision(s,'../outside'),/SANDBOX_PATH_ESCAPE/);});