import os from 'node:os';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const once=process.argv.includes('--once');
const intervalMs=Math.max(5000,Number(process.env.OTHRYS_TELEMETRY_INTERVAL_MS??10000));
const configPath=process.env.OTHRYS_TELEMETRY_CONFIG ?? join(process.env.LOCALAPPDATA??'.','OTHRYS','telemetry.env');
const errorPath=join(dirname(configPath),'telemetry-last-error.txt');
function parseEnv(text){const out={};for(const line of text.split(/\r?\n/)){const m=line.match(/^([^#=]+)=(.*)$/);if(m)out[m[1].trim()]=m[2].trim();}return out;}
const config=parseEnv(readFileSync(configPath,'utf8'));
if(!config.OTHRYS_TELEMETRY_TOKEN||!config.OTHRYS_TELEMETRY_URL)throw new Error('OTHRYS_TELEMETRY_CONFIG_INVALID');

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function cpuTimes(){let idle=0,total=0;for(const c of os.cpus()){idle+=c.times.idle;total+=Object.values(c.times).reduce((a,b)=>a+b,0);}return{idle,total};}
async function cpuPercent(){const a=cpuTimes();await sleep(250);const b=cpuTimes();const dt=b.total-a.total,di=b.idle-a.idle;return dt>0?Math.round((100*(1-di/dt))*10)/10:0;}
function gpu(){const p=spawnSync('nvidia-smi',['--query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu','--format=csv,noheader,nounits'],{encoding:'utf8'});if(p.status!==0)throw new Error('NVIDIA_TELEMETRY_UNAVAILABLE');const v=p.stdout.trim().split(/\s*,\s*/).map(Number);if(v.length<4||v.some(Number.isNaN))throw new Error('NVIDIA_TELEMETRY_INVALID');return v;}
async function sample(){
  const [gpuUtil,vramUsed,vramTotal,temp]=gpu();
  const q=spawnSync('ollama',['ps'],{encoding:'utf8'});
  return {token:config.OTHRYS_TELEMETRY_TOKEN,nodeId:'legion',capturedAt:new Date().toISOString(),cpuPercent:await cpuPercent(),ramAvailableMb:Math.round(os.freemem()/1048576),gpuUtilPercent:gpuUtil,vramUsedMb:vramUsed,vramTotalMb:vramTotal,gpuTempC:temp,qwenLoaded:q.status===0&&q.stdout.includes('qwen3:8b')};
}
async function push(){
  const work={schema:'othrys.mycelium.work.v0.1',work_id:`telemetry-${crypto.randomUUID()}`,capability:'telemetry.node-status@1',payload:await sample()};
  const response=await fetch(config.OTHRYS_TELEMETRY_URL.replace(/\/$/,'')+'/work',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(work),signal:AbortSignal.timeout(4000)});
  const result=await response.json();if(!response.ok||!result.ok||result.authorityGranted!==false)throw new Error(result.error??'TELEMETRY_RECEIVER_REJECTED');
  if(existsSync(errorPath))rmSync(errorPath,{force:true});
  return result;
}
do{try{await push();}catch(e){writeFileSync(errorPath,`${new Date().toISOString()} ${e instanceof Error?e.message:String(e)}\n`,'utf8');}if(once)break;await sleep(intervalMs);}while(true);
