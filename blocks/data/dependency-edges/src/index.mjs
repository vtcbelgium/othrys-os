const plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
export function buildDependencyEdges(nodes,{rootId='core'}={}){
  if(!Array.isArray(nodes)||typeof rootId!=='string'||!rootId) throw new TypeError('INVALID_INPUT');
  const visible=nodes.filter(n=>n?.visibility!=='hidden'); const ids=new Set();
  for(const n of visible){if(!plain(n)||typeof n.id!=='string'||!n.id||ids.has(n.id)||('dependencies'in n&&!Array.isArray(n.dependencies)))throw new Error('INVALID_NODE');ids.add(n.id);}
  const out=[];
  for(const n of visible){out.push({id:`root:${n.id}`,source:rootId,target:n.id,kind:'root',status:n.status??null});for(const dep of n.dependencies||[]){if(typeof dep!=='string')throw new Error('INVALID_NODE');if(ids.has(dep))out.push({id:`dep:${n.id}:${dep}`,source:n.id,target:dep,kind:'dependency',status:n.status??null});}}
  return structuredClone(out);
}
