import json,time,urllib.request
MODEL='north-mini-code-1.0'; URL='http://127.0.0.1:11434/api/chat'
EVENTS=[
('PROTOCOL','Return exactly this JSON and nothing else: {"ok":true,"items":[1,2,3]}'),
('REPAIR','Fix this JavaScript function. Return only the corrected function, no markdown or prose: function clamp(n,min,max){return Math.min(min,Math.max(max,n))}'),
('REPO','Return exactly one JSON object and nothing else with file=a.mjs and replacement=export const add=(a,b)=>a+b;'),
('TOOLS','Return exactly one JSON object and nothing else: {"tool":"write_file","arguments":{"path":"x.txt","content":"hello"}}')]
def ask(prompt):
 body=json.dumps({'model':MODEL,'messages':[{'role':'user','content':prompt}],'stream':False,'think':True,'options':{'temperature':0,'num_predict':256}}).encode()
 req=urllib.request.Request(URL,data=body,headers={'Content-Type':'application/json'}); t=time.time()
 with urllib.request.urlopen(req,timeout=600) as r: data=json.load(r)
 msg=data.get('message') or {}; return (msg.get('content') or '').strip(),(msg.get('thinking') or '').strip(),round((time.time()-t)*1000)
rows=[]
for event,prompt in EVENTS:
 try:
  text,thinking,ms=ask(prompt); rows.append({'eventId':event,'latencyMs':ms,'text':text,'thinkingChars':len(thinking)})
 except Exception as e: rows.append({'eventId':event,'error':repr(e)})
print(json.dumps(rows,ensure_ascii=False,indent=2))