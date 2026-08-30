export const LOCAL_SEARCH_SCHEMA='othrys.os.local-semantic-search.v1';
export const DEFAULT_EMBED_MODEL='embeddinggemma:latest';
export function cosineSimilarity(a,b){
  if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length||!a.length)throw new Error('EMBEDDING_SHAPE_INVALID');
  let dot=0,aa=0,bb=0;for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];}return dot/(Math.sqrt(aa)*Math.sqrt(bb)||1);
}
export function rankSemanticMatches(queryVector,documents,{limit=8}={}){
  const rows=documents.map(d=>({id:String(d.id),score:cosineSimilarity(queryVector,d.vector),metadata:d.metadata??null})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  return Object.freeze(rows.slice(0,Math.max(1,Math.trunc(limit))).map(x=>Object.freeze(x)));
}
export async function ollamaEmbed(input,{endpoint='http://127.0.0.1:11434',model=DEFAULT_EMBED_MODEL,fetchImpl=fetch}={}){
  const values=Array.isArray(input)?input:[input];if(!values.length||values.some(x=>typeof x!=='string'||!x.trim()))throw new Error('EMBED_INPUT_INVALID');
  const r=await fetchImpl(`${endpoint}/api/embed`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model,input:values})});if(!r.ok)throw new Error(`EMBED_PROVIDER_${r.status}`);
  const body=await r.json();if(!Array.isArray(body.embeddings)||body.embeddings.length!==values.length)throw new Error('EMBED_PROVIDER_SHAPE_INVALID');
  return Object.freeze({schema:'othrys.os.embedding-result.v1',model,vectors:Object.freeze(body.embeddings.map(x=>Object.freeze(x))),local:true,paidUsage:false,authorityGranted:false,executionStarted:false});
}
