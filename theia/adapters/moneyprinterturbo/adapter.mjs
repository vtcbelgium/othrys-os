import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

export const MPT_ADAPTER_SCHEMA = 'othrys.theia.adapter.moneyprinterturbo.v1';
export const MPT_COMPLETE = 1;
export const MPT_FAILED = -1;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const normalizeBaseUrl = value => String(value || 'http://127.0.0.1:8080').replace(/\/+$/, '');

function unwrapResponse(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('MPT_INVALID_RESPONSE');
  if (Number(payload.status) >= 400) {
    const error = new Error(payload.message || 'MPT_REQUEST_FAILED');
    error.code = 'MPT_REQUEST_FAILED';
    error.payload = payload;
    throw error;
  }
  return payload.data;
}

export function createMoneyPrinterTurboAdapter(options = {}) {
  const baseUrl = normalizeBaseUrl(options.baseUrl || process.env.MPT_BASE_URL);
  const apiKey = options.apiKey ?? process.env.MPT_API_KEY ?? '';
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const allowedVideoSources = new Set(options.allowedVideoSources ?? ['local']);
  if (typeof fetchImpl !== 'function') throw new Error('MPT_FETCH_REQUIRED');

  async function request(path, init = {}) {
    const headers = new Headers(init.headers || {});
    if (apiKey) headers.set('x-api-key', apiKey);
    const response = await fetchImpl(`${baseUrl}${path}`, { ...init, headers });
    let payload;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    if (!response.ok) {
      const error = new Error(payload?.message || `MPT_HTTP_${response.status}`);
      error.code = 'MPT_HTTP_ERROR';
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  async function health() {
    const response = await fetchImpl(`${baseUrl}/ping`);
    const body = await response.text();
    return Object.freeze({
      schema: MPT_ADAPTER_SCHEMA,
      provider: 'moneyprinterturbo',
      health: response.ok && body.includes('pong') ? 'HEALTHY' : 'DEGRADED',
      baseUrl,
    });
  }

  async function uploadMaterial(filePath) {
    const bytes = await readFile(filePath);
    const form = new FormData();
    form.set('file', new Blob([bytes]), basename(filePath));
    const payload = await request('/api/v1/video_materials', { method: 'POST', body: form });
    return unwrapResponse(payload);
  }
  async function createAudio(input) {
    const payload = await request('/api/v1/audio', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        video_script: input.script,
        video_language: input.language || '',
        voice_name: input.voiceName || 'no-voice',
        voice_volume: input.voiceVolume ?? 1,
        voice_rate: input.voiceRate ?? 1,
        bgm_type: '',
        bgm_volume: 0,
        video_source: 'local',
      }),
    });
    return unwrapResponse(payload);
  }

  async function createVideo(input) {
    const videoSource = input.videoSource || 'local';
    if (!allowedVideoSources.has(videoSource)) {
      const error = new Error('MPT_VIDEO_SOURCE_NOT_ADMITTED');
      error.code = 'MPT_VIDEO_SOURCE_NOT_ADMITTED';
      error.videoSource = videoSource;
      throw error;
    }
    const materials = (input.materials || []).map(item =>
      typeof item === 'string' ? { provider: 'local', url: item, duration: 0 } : item
    );
    const payload = await request('/api/v1/videos', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        video_subject: input.subject || 'Theia render',
        video_script: input.script || '',
        video_terms: input.videoTerms || [],
        video_aspect: input.aspect || '9:16',
        video_fit_mode: input.fitMode || 'cover',
        video_concat_mode: input.concatMode || 'sequential',
        video_clip_duration: input.clipDuration ?? 4,
        video_clip_speed: input.clipSpeed ?? 1,
        video_count: input.videoCount ?? 1,
        video_source: videoSource,
        video_materials: materials,
        video_language: input.language || '',
        voice_name: input.voiceName || 'no-voice',
        voice_volume: input.voiceVolume ?? 1,
        voice_rate: input.voiceRate ?? 1,
        bgm_type: input.bgmType || '',
        bgm_file: input.bgmFile || '',
        bgm_volume: input.bgmVolume ?? 0,
        subtitle_enabled: input.subtitles !== false,
        subtitle_position: input.subtitlePosition || 'bottom',
        subtitle_display_mode: input.subtitleDisplayMode || 'sentence',
        subtitle_animation: input.subtitleAnimation || 'none',
        font_size: input.fontSize ?? 60,
        text_fore_color: input.textColor || '#FFFFFF',
        stroke_color: input.strokeColor || '#000000',
        stroke_width: input.strokeWidth ?? 1.5,
        n_threads: input.threads ?? 2,
      }),
    });
    return unwrapResponse(payload);
  }

  async function listTasks({ page = 1, pageSize = 20 } = {}) {
    const payload = await request(`/api/v1/tasks?page=${page}&page_size=${pageSize}`);
    return unwrapResponse(payload);
  }

  async function getTask(taskId) {
    const payload = await request(`/api/v1/tasks/${encodeURIComponent(taskId)}`);
    return unwrapResponse(payload);
  }

  async function deleteTask(taskId) {
    const payload = await request(`/api/v1/tasks/${encodeURIComponent(taskId)}`, {
      method: 'DELETE',
    });
    return payload;
  }

  async function downloadArtifact(uri, { destination } = {}) {
    if (typeof uri !== 'string' || !uri.startsWith('/tasks/')) {
      throw new Error('MPT_ARTIFACT_URI_INVALID');
    }
    const headers = new Headers();
    if (apiKey) headers.set('x-api-key', apiKey);
    const response = await fetchImpl(`${baseUrl}${uri}`, { headers });
    if (!response.ok) throw new Error(`MPT_ARTIFACT_HTTP_${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (destination) await writeFile(destination, bytes);
    return Object.freeze({ uri, destination: destination || null, bytes });
  }

  async function waitForTask(taskId, options = {}) {
    const pollMs = options.pollMs ?? 1000;
    const timeoutMs = options.timeoutMs ?? 120000;
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const task = await getTask(taskId);
      if (Number(task.state) === MPT_COMPLETE) return task;
      if (Number(task.state) === MPT_FAILED) {
        const error = new Error(task.error || 'MPT_TASK_FAILED');
        error.code = 'MPT_TASK_FAILED';
        error.task = task;
        throw error;
      }
      await sleep(pollMs);
    }
    const error = new Error('MPT_TASK_TIMEOUT');
    error.code = 'MPT_TASK_TIMEOUT';
    throw error;
  }

  return Object.freeze({
    schema: MPT_ADAPTER_SCHEMA,
    provider: 'moneyprinterturbo',
    baseUrl,
    health,
    uploadMaterial,
    createAudio,
    createVideo,
    listTasks,
    getTask,
    deleteTask,
    downloadArtifact,
    waitForTask,
  });
}
