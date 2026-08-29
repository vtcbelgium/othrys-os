from __future__ import annotations
import argparse, json
from pathlib import Path


def load_jsonl(path:Path):
    if not path.exists():return []
    out=[]
    for line in path.read_text(encoding='utf-8').splitlines():
        if line.strip():out.append(json.loads(line))
    return out

def haystack(record:dict)->str:
    fields=[record.get('lineage',''),record.get('workspace',''),record.get('path',''),record.get('sourceState',''),record.get('language',''),record.get('kind',''),record.get('subject','')]
    fields.extend(record.get('paths',[])); fields.extend(record.get('currentPaths',[]))
    return ' '.join(str(x) for x in fields).lower()

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--root',required=True); ap.add_argument('--query',required=True); ap.add_argument('--limit',type=int,default=30)
    args=ap.parse_args(); root=Path(args.root); terms=[t.lower() for t in args.query.split() if t.strip()]
    cat=root/'.othrys'/'knowledge'/'catalog'
    results=[]
    for kind,name in [('code','great-harvest-code.jsonl'),('live','great-harvest-live.jsonl'),('commit','great-harvest-commits.jsonl')]:
        for rec in load_jsonl(cat/name):
            hay=haystack(rec); hits=sum(term in hay for term in terms)
            if hits:results.append((hits,kind,rec))
    results.sort(key=lambda x:(-x[0],x[1],str(x[2].get('lineage','')),str(x[2].get('gitObject',x[2].get('commit','')))))
    payload={'schema':'othrys.os.great-harvest.query.v1','query':args.query,'resultCount':min(len(results),max(1,args.limit)),'results':[{'recordType':record_type,**rec} for _,record_type,rec in results[:max(1,args.limit)]],'authorityGranted':False}
    print(json.dumps(payload,indent=2,ensure_ascii=False))

if __name__=='__main__':main()
