import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const roots=new Set();
let installed=false;

function cleanup(){
  for(const root of roots){
    try{rmSync(root,{recursive:true,force:true});}catch{}
  }
  roots.clear();
}

export function makeTestTemp(prefix='othrys-test-'){
  if(typeof prefix!=='string'||!/^othrys-[a-z0-9-]+$/i.test(prefix)) throw new Error('TEST_TEMP_PREFIX_INVALID');
  if(!installed){ process.once('exit',cleanup); installed=true; }
  const root=mkdtempSync(join(tmpdir(),prefix)); roots.add(root); return root;
}

export function cleanupTestTemps(){ cleanup(); }
