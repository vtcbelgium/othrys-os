const endpoint=process.env.OLLAMA_URL??'http://127.0.0.1:11434';
const model=process.env.OTHRYS_EMBED_MODEL??'embeddinggemma:latest';
const docs=[
['keymaster','Keymaster custodies credential references and sealed secret use without exposing values.'],
['prometheus','Prometheus discovers technologies, gathers evidence and recommends capabilities without authority.'],
['mnemosyne','Mnemosyne preserves explicit knowledge, provenance, history and reviewed lessons.'],
['hephaestus','Hephaestus constructs and integrates software from governed engineering plans.'],
['talos','Talos independently verifies execution, evidence, retries, replay and termination.'],
['kronos','Kronos owns lifecycle timing, heartbeat, cadence, supervision and cancellation contracts.'],
['switchyard','Switchyard selects legal healthy model routes by capability, cost, locality and measured trust.'],
['rhea','Rhea watches organism vitality and opens evidence-led care without taking execution authority.'],
['hermes','Hermes carries provider-neutral communication intents and durable acknowledgement semantics.'],
['visual','Visual Control records screen observations and comparison evidence before any input authority.'],
['sclerotium','Sclerotium preserves minimal recovery evidence and classifies what to rebuild, reacquire or rebind.'],
['mycelium','Mycelium coordinates bounded compute across nodes while avoiding shared mutation and resource waste.']
];
const queries=[['keymaster','Which organ handles API key custody?'],['prometheus','Who researches new tools and sources?'],['mnemosyne','Where are lessons and provenance remembered?'],['hephaestus','Who builds and integrates code?'],['talos','Which organ independently checks whether execution really passed?'],['kronos','Who owns heartbeat and timing?'],['switchyard','What chooses the cheapest healthy legal model route?'],['rhea','Which organ monitors health and care?'],['hermes','What carries messages and acknowledgements?'],['visual','Where do screen observations live before computer control is allowed?'],['sclerotium','What survives a crash so the system can recover?'],['mycelium','What coordinates compute capacity across machines?']];const cosine=(a,b)=>{let dot=0,aa=0,bb=0;for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];}return dot/(Math.sqrt(aa)*Math.sqrt(bb)||1);};
async function embed(input){const started=performance.now();const r=await fetch(`${endpoint}/api/embed`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model,input})});if(!r.ok)throw new Error(`OLLAMA_EMBED_${r.status}`);const body=await r.json();return {vectors:body.embeddings,ms:+(performance.now()-started).toFixed(2)};}
await embed(['warmup']);
const d=await embed(docs.map(x=>x[1])),q=await embed(queries.map(x=>x[1]));
const rows=queries.map(([expected,text],i)=>{const ranked=docs.map(([id],j)=>({id,score:cosine(q.vectors[i],d.vectors[j])})).sort((a,b)=>b.score-a.score);return {query:text,expected,top1:ranked[0].id,score:+ranked[0].score.toFixed(4),pass:ranked[0].id===expected,top3:ranked.slice(0,3)};});
const pass=rows.filter(x=>x.pass).length,accuracy=pass/rows.length;
const out={schema:'othrys.os.local-semantic-search-benchmark.v1',model,documentCount:docs.length,queryCount:queries.length,accuracy:+accuracy.toFixed(4),docEmbedMs:d.ms,queryEmbedMs:q.ms,status:accuracy>=.83?'PASS':'FAIL',rows,freeLocal:true,authorityGranted:false,executionStarted:false};
console.log(JSON.stringify(out,null,2));if(out.status!=='PASS')process.exit(1);
