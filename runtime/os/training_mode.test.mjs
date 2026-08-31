import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProjectManifest} from './project_manifest.mjs';
import {loadTrainingManifest,nextTrainingJob,prepareTrainingJob} from './training_mode.mjs';
const root=process.cwd();
test('Level 2 graduation closes the level without authority or automatic Level 3 advance',()=>{const m=loadTrainingManifest(root);assert.equal(m.currentLevel,2);assert.equal(m.levels[0].status,'COMPLETE');assert.equal(m.levels[1].status,'COMPLETE');assert.ok(m.levels.slice(2).every(x=>x.status==='LOCKED'));assert.equal(m.level2.status,'COMPLETE');assert.equal(m.level2.jobs.length,24);assert.ok(m.level2.jobs.every(x=>x.status==='COMPLETE'));assert.equal(m.level2.completedJobs,24);assert.equal(m.automaticAdmission,false);assert.equal(m.automaticLevelAdvance,false);assert.equal(m.authorityGranted,false);});
test('completed current level has no next job and cannot prepare more work until explicit advance',()=>{assert.equal(nextTrainingJob(root),null);assert.throws(()=>prepareTrainingJob(root,loadProjectManifest(root),'L2-024'),/TRAINING_LEVEL_NOT_ACTIVE/);});
