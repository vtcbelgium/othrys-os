import json,time,urllib.request
MODEL='granite4.2:3b'; URL='http://127.0.0.1:11434/api/chat'
def ask(prompt,tools=None):
    body={'model':MODEL,'messages':[{'role':'user','content':prompt}],'stream':False,'think':False,'options':{'temperature':0,'num_predict':256}}
    if tools: body['tools']=tools
    t=time.time(); req=urllib.request.Request(URL,data=json.dumps(body).encode(),headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=120) as r: data=json.load(r)
    return data,int((time.time()-t)*1000)
rows=[]
def add(event,ok,protocol,latency,detail): rows.append({'eventId':event,'talosPass':ok,'protocolPass':protocol,'latencyMs':latency,'scopeViolations':0,'repairs':0,'detail':detail})
d,ms=ask('Return exactly this JSON and nothing else: {"status":"ok","value":7}')
t=(d.get('message') or {}).get('content','').strip(); add('PROTOCOL',t=='{"status":"ok","value":7}',t.startswith('{') and t.endswith('}'),ms,t[:300])
d,ms=ask('Buggy JS: const clamp=(n,min,max)=>Math.min(min,Math.max(max,n)); Return only the corrected one-line function, no prose.')
t=(d.get('message') or {}).get('content','').strip(); add('REPAIR','Math.max(min' in t and 'Math.min(max' in t,'\n' not in t and len(t)<180,ms,t[:300])
d,ms=ask('Mini repo: src/parser.mjs parses records, src/ui.mjs renders them. Bug: malformed records are accepted. Return exactly the file path that should be patched first, no prose.')
t=(d.get('message') or {}).get('content','').strip(); add('REPO',t=='src/parser.mjs',t=='src/parser.mjs',ms,t[:300])
tools=[{'type':'function','function':{'name':'write_file','description':'write a bounded file','parameters':{'type':'object','properties':{'path':{'type':'string'},'content':{'type':'string'}},'required':['path','content']}}}]
d,ms=ask('Use the write_file tool to create candidate.txt with exact content granite-ok. Do not answer in prose.',tools)
msg=d.get('message') or {}; calls=msg.get('tool_calls') or []
ok=False; detail=str(calls)[:500]
if calls:
    fn=(calls[0].get('function') or {}); a=fn.get('arguments') or {}; ok=fn.get('name')=='write_file' and a.get('path')=='candidate.txt' and a.get('content')=='granite-ok'
add('TOOLS',ok,bool(calls),ms,detail)
out={'model':MODEL,'rows':rows,'passed':sum(r['talosPass'] and r['protocolPass'] for r in rows)}
open(__file__.replace('olympics_probe.py','olympics_raw.json'),'w',encoding='utf-8').write(json.dumps(out,indent=2)+'\n')
print(json.dumps(out))