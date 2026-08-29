from __future__ import annotations
import argparse, hashlib, json
from collections import Counter, defaultdict
from pathlib import Path


def load_jsonl(path: Path) -> list[dict]:
    if not path.exists(): return []
    return [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]


def stable(value) -> str:
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False)


def parse_device(value: str) -> tuple[str, Path]:
    name, sep, path = value.partition('=')
    if not sep or not name or not path: raise ValueError('DEVICE_FORMAT_NAME_EQUALS_PATH')
    return name, Path(path)


def digest(body: str) -> str:
    return hashlib.sha256(body.encode()).hexdigest()

def merge_code(devices: list[tuple[str, Path]]) -> list[dict]:
    merged = {}
    for device, cat in devices:
        for rec in load_jsonl(cat/'great-harvest-code.jsonl'):
            key=(rec['lineage'],rec['gitObject'])
            cur=merged.setdefault(key,{**rec,'devices':[],'devicePaths':{}})
            cur['devices']=sorted(set(cur['devices'])|{device})
            cur['paths']=sorted(set(cur.get('paths',[]))|set(rec.get('paths',[])))
            cur['currentPaths']=sorted(set(cur.get('currentPaths',[]))|set(rec.get('currentPaths',[])))
            cur['historicalOnly']=not bool(cur['currentPaths'])
            cur['devicePaths'][device]=sorted(set(rec.get('paths',[])))
    return sorted(merged.values(),key=lambda r:(r['lineage'],r['gitObject']))


def merge_commits(devices: list[tuple[str, Path]]) -> list[dict]:
    merged={}
    for device,cat in devices:
        for rec in load_jsonl(cat/'great-harvest-commits.jsonl'):
            key=(rec['lineage'],rec['commit']); cur=merged.setdefault(key,{**rec,'devices':[]})
            cur['devices']=sorted(set(cur['devices'])|{device})
    return sorted(merged.values(),key=lambda r:(r['lineage'],r['commit']))

def merge_live(devices: list[tuple[str, Path]]) -> list[dict]:
    merged={}
    for device,cat in devices:
        for rec in load_jsonl(cat/'great-harvest-live.jsonl'):
            key=(rec['sha256'],rec.get('kind'),rec.get('language'))
            cur=merged.setdefault(key,{**rec,'devices':[],'locations':[],'sourceStates':[]})
            cur['devices']=sorted(set(cur['devices'])|{device})
            cur['sourceStates']=sorted(set(cur['sourceStates'])|{rec['sourceState']})
            loc={'device':device,'lineage':rec.get('lineage'),'workspace':rec.get('workspace'),'path':rec.get('path'),'sourceState':rec.get('sourceState'),'retrieval':f"filesystem@{device}:{rec.get('path','')}"}
            if loc not in cur['locations']: cur['locations'].append(loc)
            cur['locations']=sorted(cur['locations'],key=lambda x:(x['device'],str(x['lineage']),str(x['path'])))
            cur['retrieval']='MULTI_LOCATION' if len(cur['locations'])>1 else loc['retrieval']
    return sorted(merged.values(),key=lambda r:(r['sha256'],r.get('language','')))

def repository_index(devices: list[tuple[str, Path]]) -> list[dict]:
    out=[]
    for device,cat in devices:
        summary=json.loads((cat/'great-harvest-summary.json').read_text(encoding='utf-8'))
        for rec in summary.get('repositoryIndex',[]): out.append({**rec,'device':device})
    return sorted(out,key=lambda r:(r['lineage'],r['device'],r['representative']))


def write(root:Path, code:list[dict], commits:list[dict], live:list[dict], repos:list[dict], perimeter:list[dict]):
    cat=root/'.othrys'/'knowledge'/'catalog'; cat.mkdir(parents=True,exist_ok=True)
    bodies={
      'great-harvest-code.jsonl': ''.join(stable(r)+'\n' for r in code),
      'great-harvest-commits.jsonl': ''.join(stable(r)+'\n' for r in commits),
      'great-harvest-live.jsonl': ''.join(stable(r)+'\n' for r in live),
      'great-harvest-perimeter.jsonl': ''.join(stable(r)+'\n' for r in perimeter)}
    for name,body in bodies.items(): (cat/name).write_text(body,encoding='utf-8',newline='\n')
    oid_lineages=defaultdict(set)
    for r in code: oid_lineages[r['gitObject']].add(r['lineage'])
    langs=Counter(r['language'] for r in code); kinds=Counter(r['kind'] for r in code)
    classes=Counter(r['classification'] for r in perimeter); pdevices=Counter(r.get('device','UNKNOWN') for r in perimeter)
    summary={'schema':'othrys.os.great-harvest.summary.v1','workspaceCount':len({(r['device'],w) for r in repos for w in r.get('workspaces',[])}),'lineageCount':len(set(r['lineage'] for r in repos)),
      'indexedObjects':len(code),'currentObjects':sum(not r['historicalOnly'] for r in code),'historicalOnlyObjects':sum(r['historicalOnly'] for r in code),
      'indexedBytes':sum(r['bytes'] for r in code),'crossLineageDuplicateObjects':sum(len(v)>1 for v in oid_lineages.values()),'kinds':dict(sorted(kinds.items())),
      'languages':dict(sorted(langs.items(),key=lambda kv:(-kv[1],kv[0]))),'catalogSha256':digest(bodies['great-harvest-code.jsonl']),'catalogPath':'.othrys/knowledge/catalog/great-harvest-code.jsonl',
      'commitCount':len(commits),'commitCatalogSha256':digest(bodies['great-harvest-commits.jsonl']),'commitCatalogPath':'.othrys/knowledge/catalog/great-harvest-commits.jsonl',
      'liveOnlyCount':len(live),'liveOnlyLocationCount':sum(len(r.get('locations',[])) for r in live),'liveOnlyBytes':sum(r['bytes'] for r in live),'liveOnlyDigest':digest(bodies['great-harvest-live.jsonl']),'liveOnlyCatalogPath':'.othrys/knowledge/catalog/great-harvest-live.jsonl',
      'liveOnlyStates':dict(sorted(Counter(r['sourceState'] for r in live).items())),'repositoryIndex':repos,'perimeterCount':len(perimeter),'perimeterDigest':digest(bodies['great-harvest-perimeter.jsonl']),
      'perimeterCatalogPath':'.othrys/knowledge/catalog/great-harvest-perimeter.jsonl','perimeterClassifications':dict(sorted(classes.items())),'perimeterDevices':dict(sorted(pdevices.items())),
      'sourcePayloadCopied':False,'authorityGranted':False,'automaticPromotion':False}
    (cat/'great-harvest-summary.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8',newline='\n')
    return summary

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--device',action='append',required=True); ap.add_argument('--othrys-root',required=True); ap.add_argument('--perimeter-manifest',required=True)
    args=ap.parse_args(); devices=[parse_device(v) for v in args.device]
    perimeter_value=json.loads(Path(args.perimeter_manifest).read_text(encoding='utf-8'))
    perimeter=[]
    for r in perimeter_value.get('roots',[]): perimeter.append({**r,'authorityGranted':False,'automaticPromotion':False})
    summary=write(Path(args.othrys_root),merge_code(devices),merge_commits(devices),merge_live(devices),repository_index(devices),sorted(perimeter,key=lambda r:(r.get('device',''),r.get('path',''))))
    print(json.dumps(summary,indent=2,ensure_ascii=False))

if __name__=='__main__': main()
