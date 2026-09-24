import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  discoverKeymasterCredentialSource,
  resolveSealedKeymasterCredential,
} from '../os/keymaster_vault.mjs';
import { searchTavilyBasic } from '../os/prometheus_news_search.mjs';

function input(){
  let value;
  try{value=JSON.parse(readFileSync(0,'utf8'));}catch{throw new Error('RESEARCH_INPUT_INVALID_JSON');}
  if(!value||value.schema!=='othrys.legion.research-request.v1') throw new Error('RESEARCH_INPUT_SCHEMA_INVALID');
  const query=String(value.query??'').trim();
  const maxResults=Number(value.maxResults??5);
  if(!query||query.length>1000) throw new Error('RESEARCH_QUERY_INVALID');
  if(!Number.isInteger(maxResults)||maxResults<1||maxResults>5) throw new Error('RESEARCH_MAX_RESULTS_INVALID');
  return {query,maxResults};
}

async function main(){
  const {query,maxResults}=input();
  const source=discoverKeymasterCredentialSource();
  const sealed=resolveSealedKeymasterCredential(
    source,
    'TAVILY_API_KEY',
    {consumer:'legion-brain-research',readOnly:true,authorityGranted:false},
  );
  if(!sealed.ok) throw new Error('RESEARCH_TAVILY_CREDENTIAL_UNAVAILABLE');
  const out=await searchTavilyBasic({
    sealedCredential:sealed.value,
    query,
    maxResults,
    timeRange:undefined,
  });
  if(!out.ok) throw new Error('RESEARCH_PROVIDER_HTTP_'+out.status);
  process.stdout.write(JSON.stringify({
    schema:'othrys.legion.research-response.v1',
    findings:out.results,
    creditsUsed:out.creditsUsed,
    secretValuesExposed:false,
    authorityGranted:false,
    actionApplied:false,
    executionStarted:false,
  }));
}
main().catch(error=>{
  process.stderr.write(String(error?.message??error));
  process.exitCode=1;
});
