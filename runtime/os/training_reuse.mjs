import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

export function extractNamedFunction(source, name){
  const needle='function '+name+'('; const start=source.indexOf(needle); if(start<0) throw new Error('TRAINING_REUSE_FUNCTION_NOT_FOUND');
  const brace=source.indexOf('{',start); if(brace<0) throw new Error('TRAINING_REUSE_FUNCTION_INVALID');
  let depth=0,end=-1; for(let i=brace;i<source.length;i++){const ch=source[i]; if(ch==='{')depth++; else if(ch==='}'){depth--; if(depth===0){end=i+1;break;}}}
  if(end<0) throw new Error('TRAINING_REUSE_FUNCTION_UNCLOSED'); return source.slice(start,end);
}

export function adaptTypescriptFunctionToEsm(fnText,name){
  const head=new RegExp('function\\s+'+name+'\\s*\\(([^)]*)\\)\\s*(?::\\s*[^\\{]+)?\\s*\\{');
  return fnText.replace(head,(_,params)=>{const clean=params.replace(/:\s*[^,)=]+/g,'').trim(); return 'export function '+name+'('+clean+') {';});
}

export function materializeFunction({root='.',sourcePath,functionName,outputPath}){
  const src=readFileSync(sourcePath,'utf8'); const extracted=extractNamedFunction(src,functionName); const esm=adaptTypescriptFunctionToEsm(extracted,functionName)+'\n';
  const out=join(root,outputPath); mkdirSync(dirname(out),{recursive:true}); writeFileSync(out,esm,'utf8');
  return Object.freeze({schema:'othrys.os.training-reuse-materialization.v1',functionName,sourcePath,outputPath,bytes:Buffer.byteLength(esm),authorityGranted:false});
}
