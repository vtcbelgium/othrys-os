import { createDecipheriv } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import util from 'node:util';

export const KEYMASTER_SECURE_SCHEMA='othrys.os.keymaster-secure-vault.v1';
export const KEYMASTER_SECURE_SEALED='[KEYMASTER_SECURE_SEALED]';

const clean=v=>typeof v==='string'?v.trim():'';
const envName=v=>typeof v==='string'&&/^[A-Z][A-Z0-9_]{2,127}$/.test(v)?v:null;

export function defaultSecureVaultPaths(home=homedir()){
  const dir=join(home,'.config','othrys');
  return Object.freeze({
    dir,
    vaultPath:join(dir,'keymaster.vault.json'),
    wrappedKeyPath:join(dir,'keymaster.master.dpapi'),
  });
}

function windowsDpapiUnprotect(buffer){
  const script="Add-Type -AssemblyName System.Security;$b=[Convert]::FromBase64String([Console]::In.ReadToEnd());$p=[Security.Cryptography.ProtectedData]::Unprotect($b,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser);[Convert]::ToBase64String($p)";
  const out=execFileSync('powershell.exe',[
    '-NoProfile','-NonInteractive','-Command',script
  ],{
    input:buffer.toString('base64'),
    encoding:'utf8',
    windowsHide:true,
    maxBuffer:1024*1024,
  }).trim();
  return Buffer.from(out,'base64');
}

function openRecords({
  paths=defaultSecureVaultPaths(),
  unprotect=windowsDpapiUnprotect,
}={}){
  if(!existsSync(paths.vaultPath)||!existsSync(paths.wrappedKeyPath)) return null;
  const doc=JSON.parse(readFileSync(paths.vaultPath,'utf8').replace(/^\uFEFF/,''));
  if(doc.schema!==KEYMASTER_SECURE_SCHEMA||doc.alg!=='AES-256-GCM'){
    throw new Error('KEYMASTER_SECURE_VAULT_INVALID');
  }
  const wrapped=Buffer.from(readFileSync(paths.wrappedKeyPath,'utf8').trim(),'base64');
  const key=unprotect(wrapped);
  const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(doc.iv,'base64'));
  decipher.setAuthTag(Buffer.from(doc.tag,'base64'));
  const plain=Buffer.concat([
    decipher.update(Buffer.from(doc.ciphertext,'base64')),
    decipher.final(),
  ]);
  const records=JSON.parse(plain.toString('utf8'));
  if(!records||typeof records!=='object'||Array.isArray(records)){
    throw new Error('KEYMASTER_SECURE_RECORDS_INVALID');
  }
  return records;
}

export function discoverSecureVault({
  home=homedir(),
  platform=process.platform,
}={}){
  const paths=defaultSecureVaultPaths(home);
  const available=platform==='win32'&&
    existsSync(paths.vaultPath)&&
    existsSync(paths.wrappedKeyPath);
  return Object.freeze({
    schema:'othrys.os.keymaster-secure-source.v1',
    sourceId:'windows-dpapi-vault',
    sourceType:'secure-dpapi-vault',
    available,
    paths,
    encryptedAtRest:available,
    keyProtection:available?'WINDOWS_DPAPI_CURRENT_USER':null,
    readOnly:true,
    authorityGranted:false,
    executionStarted:false,
  });
}
export function inventorySecureVault(source=discoverSecureVault(),options={}){
  if(!source?.available){
    return Object.freeze({
      schema:'othrys.os.keymaster-secure-inventory.v1',
      available:false,
      credentialCount:0,
      credentials:[],
      encryptedAtRest:false,
      secretValuesExposed:false,
      authorityGranted:false,
      executionStarted:false,
    });
  }
  const records=openRecords({paths:source.paths,...options});
  const credentials=Object.keys(records)
    .filter(envName)
    .sort()
    .map(envVar=>Object.freeze({
      envVar,
      present:true,
      sourceId:source.sourceId,
      registrySource:'DPAPI_VAULT',
      health:'configured-unverified',
    }));
  return Object.freeze({
    schema:'othrys.os.keymaster-secure-inventory.v1',
    available:true,
    credentialCount:credentials.length,
    credentials:Object.freeze(credentials),
    encryptedAtRest:true,
    keyProtection:'WINDOWS_DPAPI_CURRENT_USER',
    secretValuesExposed:false,
    authorityGranted:false,
    executionStarted:false,
  });
}

export function resolveSealedSecureCredential(name,context={},source=discoverSecureVault(),options={}){
  const key=envName(name);
  if(!key) throw new Error('KEYMASTER_ENV_NAME_INVALID');
  if(context.authorityGranted!==false||
    context.readOnly!==true||
    !clean(context.consumer)){
    throw new Error('KEYMASTER_ACCESS_CONTEXT_DENIED');
  }
  if(!source?.available){
    return Object.freeze({
      ok:false,
      reason:'SOURCE_UNAVAILABLE',
      audit:{envVar:key,outcome:'denied'},
    });
  }
  const records=openRecords({paths:source.paths,...options});
  const raw=records[key];
  if(typeof raw!=='string'||!raw){
    return Object.freeze({
      ok:false,
      reason:'SECRET_ABSENT',
      audit:{envVar:key,outcome:'denied'},
    });
  }
  const sealed={
    reference:`env:${key}`,
    applyToEnv(env,target=key){return {...env,[target]:raw};},
    applyToHeader(headers,header='authorization',prefix='Bearer '){
      return {...headers,[header]:`${prefix}${raw}`};
    },
    toString:()=>KEYMASTER_SECURE_SEALED,
    toJSON:()=>KEYMASTER_SECURE_SEALED,
    [util.inspect.custom]:()=>KEYMASTER_SECURE_SEALED,
  };
  return Object.freeze({
    ok:true,
    value:Object.freeze(sealed),
    audit:Object.freeze({
      envVar:key,
      outcome:'allowed',
      consumer:clean(context.consumer),
      secretExposed:false,
      encryptedAtRest:true,
      sourceId:source.sourceId,
    }),
  });
}
