import test from 'node:test';
import assert from 'node:assert/strict';
import { createMoneyPrinterTurboAdapter } from './adapter.mjs';

test('health reports healthy only on pong', async () => {
  const adapter = createMoneyPrinterTurboAdapter({
    fetchImpl: async () => new Response(JSON.stringify('pong'), { status: 200 }),
  });
  const health = await adapter.health();
  assert.equal(health.health, 'HEALTHY');
  assert.equal(health.provider, 'moneyprinterturbo');
});

test('video request stays provider-bound and local by default', async () => {
  let seen;
  const adapter = createMoneyPrinterTurboAdapter({
    baseUrl: 'http://127.0.0.1:8080',
    apiKey: 'redacted-test-key',
    fetchImpl: async (url, init) => {
      seen = { url, init, body: JSON.parse(init.body) };
      return new Response(JSON.stringify({ status: 200, data: { task_id: 'task-1' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  });
  const result = await adapter.createVideo({
    subject: 'SSH',
    script: 'SSH creates an encrypted remote shell.',
    materials: ['clip.mp4'],
  });
  assert.equal(result.task_id, 'task-1');
  assert.equal(seen.url, 'http://127.0.0.1:8080/api/v1/videos');
  assert.equal(seen.init.headers.get('x-api-key'), 'redacted-test-key');
  assert.equal(seen.body.video_source, 'local');
  assert.equal(seen.body.video_materials[0].url, 'clip.mp4');
  assert.equal(seen.body.voice_name, 'no-voice');
  assert.equal(seen.body.bgm_volume, 0);
});

test('waitForTask stops on completion without re-submitting work', async () => {
  let calls = 0;
  const adapter = createMoneyPrinterTurboAdapter({
    fetchImpl: async () => {
      calls += 1;
      const data = calls === 1
        ? { task_id: 'task-2', state: 4, progress: 40 }
        : { task_id: 'task-2', state: 1, progress: 100, videos: ['/tasks/final.mp4'] };
      return new Response(JSON.stringify({ status: 200, data }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  });
  const result = await adapter.waitForTask('task-2', { pollMs: 1, timeoutMs: 100 });
  assert.equal(result.state, 1);
  assert.equal(calls, 2);
});

test('artifact download is authenticated and task-scoped', async () => {
  let seenHeaders;
  const adapter = createMoneyPrinterTurboAdapter({
    apiKey: 'redacted-test-key',
    fetchImpl: async (_url, init) => {
      seenHeaders = init.headers;
      return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
    },
  });
  const result = await adapter.downloadArtifact('/tasks/task-3/final.mp4');
  assert.equal(result.bytes.length, 3);
  assert.equal(seenHeaders.get('x-api-key'), 'redacted-test-key');
  await assert.rejects(
    () => adapter.downloadArtifact('https://example.com/file.mp4'),
    /MPT_ARTIFACT_URI_INVALID/
  );
});

test('unadmitted media providers fail closed before any paid request', async () => {
  let calls = 0;
  const adapter = createMoneyPrinterTurboAdapter({
    fetchImpl: async () => {
      calls += 1;
      throw new Error('should not be called');
    },
  });
  await assert.rejects(
    () => adapter.createVideo({ script: 'x', videoSource: 'wavespeed' }),
    /MPT_VIDEO_SOURCE_NOT_ADMITTED/
  );
  assert.equal(calls, 0);
});

test('standalone subtitle generation stays on the local no-cost path', async () => {
  let seen;
  const adapter=createMoneyPrinterTurboAdapter({
    fetchImpl: async (url,init) => {
      seen={url,body:JSON.parse(init.body)};
      return new Response(JSON.stringify({status:200,data:{task_id:'subtitle-1'}}),{status:200,headers:{'content-type':'application/json'}});
    },
  });
  const result=await adapter.createSubtitle({script:'Hello Theia'});
  assert.equal(result.task_id,'subtitle-1');
  assert.equal(seen.url,'http://127.0.0.1:18080/api/v1/subtitle');
  assert.equal(seen.body.voice_name,'no-voice');
  assert.equal(seen.body.video_source,'local');
  assert.equal(seen.body.bgm_volume,0);
});

test('AI-backed script, term and social metadata tasks are gated by default', async () => {
  let calls=0;
  const adapter=createMoneyPrinterTurboAdapter({fetchImpl:async()=>{calls+=1;throw new Error('should not be called');}});
  await assert.rejects(()=>adapter.createScript({subject:'SSH'}),/MPT_AI_TASK_NOT_ADMITTED/);
  await assert.rejects(()=>adapter.createTerms({script:'SSH'}),/MPT_AI_TASK_NOT_ADMITTED/);
  await assert.rejects(()=>adapter.createSocialMetadata({script:'SSH'}),/MPT_AI_TASK_NOT_ADMITTED/);
  assert.equal(calls,0);
});

test('AI-backed endpoints become available only after explicit admission', async () => {
  const urls=[];
  const adapter=createMoneyPrinterTurboAdapter({
    allowAiTasks:true,
    fetchImpl:async(url)=>{urls.push(url);return new Response(JSON.stringify({status:200,data:{ok:true}}),{status:200,headers:{'content-type':'application/json'}});},
  });
  await adapter.createScript({subject:'SSH'});
  await adapter.createTerms({script:'SSH'});
  await adapter.createSocialMetadata({script:'SSH'});
  assert.deepEqual(urls.map(x=>new URL(x).pathname),['/api/v1/scripts','/api/v1/terms','/api/v1/social-metadata']);
});

test('media inventories normalize upstream file envelopes to arrays', async () => {
  const adapter=createMoneyPrinterTurboAdapter({
    fetchImpl:async(url)=>{
      const name=String(url).includes('video_materials')?'clip.mp4':'song.mp3';
      return new Response(JSON.stringify({status:200,data:{files:[{name,file:name,size:42}]}}),{status:200,headers:{'content-type':'application/json'}});
    },
  });
  assert.deepEqual(await adapter.listMaterials(),[{name:'clip.mp4',file:'clip.mp4',size:42}]);
  assert.deepEqual(await adapter.listMusics(),[{name:'song.mp3',file:'song.mp3',size:42}]);
});
