from __future__ import annotations
import argparse, hashlib, json, os, subprocess
from collections import Counter, defaultdict
from pathlib import Path

SCHEMA='othrys.os.great-harvest.code-lineage.v1'
CODE_EXT={'.py','.js','.mjs','.cjs','.ts','.tsx','.jsx','.java','.go','.rs','.cs','.c','.cc','.cpp','.h','.hpp','.sh','.bash','.zsh','.ps1','.psm1','.sql','.rb','.php','.swift','.kt','.kts','.dart','.lua','.r','.m','.mm','.fs','.fsx','.ex','.exs','.erl','.hrl','.clj','.cljs','.scala','.sol','.vue','.svelte','.css','.scss','.less'}
CONFIG_EXT={'.json','.jsonl','.yaml','.yml','.toml','.ini','.cfg','.conf','.xml','.gradle','.properties'}
SPECIAL={'Dockerfile','Makefile','CMakeLists.txt','Jenkinsfile','Procfile','Gemfile','Rakefile'}
SKIP_NAMES={'package-lock.json','pnpm-lock.yaml','yarn.lock','Cargo.lock','poetry.lock','uv.lock'}
SKIP_DIRS={'node_modules','.git','.venv','venv','dist','build','coverage','.next','__pycache__'}
DISPOSABLE_WORKSPACES={'_tc_scratch'}

def run(repo:Path,*args:str,timeout:int=60,input_text:str|None=None)->str:
    p=subprocess.run(['git','-C',str(repo),*args],input=input_text,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=timeout)
    if p.returncode!=0: raise RuntimeError(f"git {' '.join(args)} failed: {p.stderr.strip()}")
    return p.stdout

def code_kind(path:str)->str|None:
    name=Path(path).name; ext=Path(path).suffix.lower()
    if name in SKIP_NAMES:return None
    if ext in CODE_EXT or name in SPECIAL:return 'CODE'
    if ext in CONFIG_EXT:return 'CONFIG'
    return None

def indexable_path(path:str)->bool:
    rel=path.replace('\\','/')
    if rel.startswith('./'):rel=rel[2:]
    blocked=('.othrys/','docs/','missions/','receipts/','admissions/','state/')
    if rel in {'GPT_STATE.json'} or rel.startswith(blocked):return False
    return code_kind(rel) is not None

def lang(path:str)->str:
    name=Path(path).name; ext=Path(path).suffix.lower()
    return name if name in SPECIAL else (ext[1:] or 'unknown')

def discover_workspaces(projects:Path)->list[Path]:
    out=[]
    for dp,dns,_ in os.walk(projects,topdown=True):
        dns[:]=[d for d in dns if d not in SKIP_DIRS and not d.startswith('.')]
        p=Path(dp)
        if p!=projects and (p/'.git').exists():
            if p.name not in DISPOSABLE_WORKSPACES:out.append(p)
            dns[:]=[]
    return sorted(out,key=lambda x:x.as_posix().lower())

def normalize_origin(origin:str)->str:
    value=origin.strip()
    if value.startswith('git@github.com:'):value='https://github.com/'+value[len('git@github.com:'):]
    value=value.rstrip('/')
    if value.lower().endswith('.git'):value=value[:-4]
    return value.lower()

def repo_meta(repo:Path)->dict:
    remotes=run(repo,'remote').split()
    origin=run(repo,'remote','get-url','origin').strip() if 'origin' in remotes else ''
    head=run(repo,'rev-parse','HEAD').strip(); branch=run(repo,'branch','--show-current').strip()
    lineage=normalize_origin(origin) if origin else f'local:{repo.name}'
    return {'workspace':repo.name,'origin':origin or None,'lineage':lineage,'head':head,'branch':branch or None}

def recovered_worktree_meta(repo:Path,projects:Path)->dict|None:
    gitfile=repo/'.git'
    if not gitfile.is_file():return None
    text=gitfile.read_text(encoding='utf-8',errors='ignore').strip().replace('\\','/')
    marker='/Projects/'
    if marker not in text or '/.git/worktrees/' not in text:return None
    tail=text.split(marker,1)[1]; parent_name=tail.split('/.git/worktrees/',1)[0].split('/')[0]
    wt_name=tail.rsplit('/',1)[-1]; parent=projects/parent_name
    if not (parent/'.git').exists():return None
    parent_meta=repo_meta(parent); head_file=parent/'.git'/'worktrees'/wt_name/'HEAD'
    if not head_file.exists():return None
    head_text=head_file.read_text(encoding='utf-8').strip(); branch=None
    if head_text.startswith('ref: '):
        ref=head_text[5:]; branch=ref.removeprefix('refs/heads/'); head=run(parent,'rev-parse',ref).strip()
    else:head=head_text
    return {'workspace':repo.name,'origin':parent_meta['origin'],'lineage':parent_meta['lineage'],'head':head,'branch':branch,'recoveredBrokenPointer':True}

def batch_blob_meta(repo:Path,oids:set[str])->dict[str,tuple[str,int]]:
    if not oids:return {}
    payload=''.join(f'{oid}\n' for oid in sorted(oids))
    out=run(repo,'cat-file','--batch-check=%(objectname) %(objecttype) %(objectsize)',input_text=payload,timeout=120)
    meta={}
    for line in out.splitlines():
        parts=line.split()
        if len(parts)==3 and parts[1]=='blob':meta[parts[0]]=(parts[1],int(parts[2]))
    return meta

def current_map(repo:Path)->dict[str,set[str]]:
    out=defaultdict(set)
    for line in run(repo,'ls-files','-s').splitlines():
        try:
            left,path=line.split('\t',1); oid=left.split()[1]
        except Exception:continue
        if indexable_path(path):out[oid].add(path.replace('\\','/'))
    return out

def historical_map(repo:Path)->dict[str,set[str]]:
    out=defaultdict(set); candidate=set()
    for line in run(repo,'rev-list','--objects','--all',timeout=180).splitlines():
        parts=line.split(' ',1)
        if len(parts)!=2:continue
        oid,path=parts; path=path.strip().replace('\\','/')
        if indexable_path(path):out[oid].add(path); candidate.add(oid)
    valid=batch_blob_meta(repo,candidate)
    return {oid:paths for oid,paths in out.items() if oid in valid}

def representative_groups(projects:Path):
    metas=[]
    for repo in discover_workspaces(projects):
        try:metas.append((repo,repo_meta(repo)))
        except Exception:
            recovered=recovered_worktree_meta(repo,projects)
            if recovered:metas.append((repo,recovered))
    groups=defaultdict(list)
    for repo,meta in metas:groups[meta['lineage']].append((repo,meta))
    selected=[]
    for lineage,members in sorted(groups.items()):
        members.sort(key=lambda x:(len(x[0].name),x[0].name.lower()))
        selected.append((lineage,members[0],members))
    return selected

def build_records(projects:Path):
    records=[]; repos=[]; global_oid_lineages=defaultdict(set)
    for lineage,(repo,meta),members in representative_groups(projects):
        current=current_map(repo); hist=historical_map(repo); all_oids=set(current)|set(hist)
        blobmeta=batch_blob_meta(repo,all_oids)
        refs=[x for x in run(repo,'for-each-ref','--format=%(refname) %(objectname)','refs/heads','refs/remotes').splitlines() if x]
        recovered=sorted(m[0].name for m in members if m[1].get('recoveredBrokenPointer'))
        repos.append({'lineage':lineage,'representative':repo.name,'workspaces':sorted(m[0].name for m in members),'head':meta['head'],'branch':meta['branch'],'refCount':len(refs),'refDigest':hashlib.sha256('\n'.join(sorted(refs)).encode()).hexdigest(),'recoveredBrokenPointers':recovered})
        for oid in sorted(all_oids):
            paths=sorted(hist.get(oid,set())|current.get(oid,set())); cur=sorted(current.get(oid,set()))
            if not paths:continue
            _,size=blobmeta.get(oid,('blob',0)); global_oid_lineages[oid].add(lineage)
            records.append({'schema':SCHEMA,'lineage':lineage,'gitObject':oid,'bytes':size,'kind':code_kind(paths[0]),'language':lang(paths[0]),'paths':paths,'currentPaths':cur,'historicalOnly':not bool(cur),'retrieval':f'git show {oid}','authorityGranted':False,'automaticPromotion':False})
    return records,repos,global_oid_lineages

def build_commits(projects:Path):
    commits=[]
    for lineage,(repo,_),_members in representative_groups(projects):
        seen=set()
        raw=run(repo,'log','--all','--date=iso-strict','--pretty=%H%x09%aI%x09%s',timeout=180)
        for line in raw.splitlines():
            parts=line.split('\t',2)
            if len(parts)!=3 or parts[0] in seen:continue
            seen.add(parts[0]); commits.append({'schema':'othrys.os.great-harvest.commit.v1','lineage':lineage,'commit':parts[0],'authoredAt':parts[1],'subject':parts[2],'retrieval':f"git show {parts[0]}",'authorityGranted':False,'automaticPromotion':False})
    return sorted(commits,key=lambda r:(r['lineage'],r['commit']))

def live_file_record(projects:Path, workspace:str, lineage:str, rel_path:str, full_path:Path, source_state:str)->dict:
    data=full_path.read_bytes(); digest=hashlib.sha256(data).hexdigest()
    return {'schema':'othrys.os.great-harvest.live-code.v1','sourceState':source_state,'lineage':lineage,'workspace':workspace,'path':rel_path.replace('\\','/'),'sha256':digest,'bytes':len(data),'kind':code_kind(rel_path),'language':lang(rel_path),'retrieval':f'filesystem:{rel_path.replace(chr(92),chr(47))}','durableProvenance':False,'authorityGranted':False,'automaticPromotion':False}

def build_live_records(projects:Path)->list[dict]:
    records=[]; workspaces=discover_workspaces(projects); roots={w.resolve() for w in workspaces}
    for repo in workspaces:
        try: meta=repo_meta(repo)
        except Exception:
            recovered=recovered_worktree_meta(repo,projects); meta=recovered or {'lineage':f'local:{repo.name}'}
        try: raw=run(repo,'status','--porcelain=v1','--untracked-files=all')
        except Exception: raw=''
        for line in raw.splitlines():
            if len(line)<4: continue
            status=line[:2]; rel=line[3:].strip().strip('"').replace('\\','/')
            if ' -> ' in rel: rel=rel.split(' -> ',1)[1]
            if not indexable_path(rel): continue
            full=repo/rel
            if not full.is_file(): continue
            state='WORKTREE_UNTRACKED' if status=='??' else 'WORKTREE_MODIFIED'
            try: records.append(live_file_record(projects,repo.name,meta['lineage'],rel,full,state))
            except OSError: pass
    for dp,dns,fns in os.walk(projects,topdown=True):
        p=Path(dp)
        dns[:]=[d for d in dns if d not in SKIP_DIRS and not d.startswith('.')]
        if p.resolve() in roots:
            dns[:]=[]; continue
        if (p/'.git').exists():
            dns[:]=[]; continue
        for fn in fns:
            full=p/fn
            try: rel=full.relative_to(projects).as_posix()
            except ValueError: continue
            if not indexable_path(rel): continue
            parts=Path(rel).parts
            workspace='/'.join(parts[:2]) if parts and parts[0].lower()=='oros' and len(parts)>1 else (parts[0] if parts else 'projects')
            try: records.append(live_file_record(projects,workspace,f'livefs:{workspace.lower()}',rel,full,'FILESYSTEM_ONLY'))
            except OSError: pass
    dedup={}
    for rec in records:
        key=(rec['sourceState'],rec['lineage'],rec['workspace'],rec['path']); dedup[key]=rec
    return sorted(dedup.values(),key=lambda r:(r['sourceState'],r['lineage'],r['workspace'],r['path']))

def stable_json(value)->str:
    return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False)

def write_catalog(root:Path,records:list[dict],repos:list[dict],oid_lineages:dict[str,set[str]],commits:list[dict],live_records:list[dict]|None=None):
    catalog_dir=root/'.othrys'/'knowledge'/'catalog'; catalog_dir.mkdir(parents=True,exist_ok=True)
    records=sorted(records,key=lambda r:(r['lineage'],r['gitObject']))
    body=''.join(stable_json(r)+'\n' for r in records)
    catalog=(catalog_dir/'great-harvest-code.jsonl'); catalog.write_text(body,encoding='utf-8',newline='\n')
    commit_body=''.join(stable_json(r)+'\n' for r in commits); (catalog_dir/'great-harvest-commits.jsonl').write_text(commit_body,encoding='utf-8',newline='\n')
    live_records=live_records or []; live_body=''.join(stable_json(r)+'\n' for r in live_records); (catalog_dir/'great-harvest-live.jsonl').write_text(live_body,encoding='utf-8',newline='\n')
    languages=Counter(r['language'] for r in records); kinds=Counter(r['kind'] for r in records)
    summary={'schema':'othrys.os.great-harvest.summary.v1','workspaceCount':sum(len(r['workspaces']) for r in repos),'lineageCount':len(repos),'indexedObjects':len(records),'currentObjects':sum(not r['historicalOnly'] for r in records),'historicalOnlyObjects':sum(r['historicalOnly'] for r in records),'indexedBytes':sum(r['bytes'] for r in records),'crossLineageDuplicateObjects':sum(len(v)>1 for v in oid_lineages.values()),'kinds':dict(sorted(kinds.items())),'languages':dict(sorted(languages.items(),key=lambda kv:(-kv[1],kv[0]))),'catalogSha256':hashlib.sha256(body.encode()).hexdigest(),'catalogPath':'.othrys/knowledge/catalog/great-harvest-code.jsonl','commitCount':len(commits),'commitCatalogSha256':hashlib.sha256(commit_body.encode()).hexdigest(),'commitCatalogPath':'.othrys/knowledge/catalog/great-harvest-commits.jsonl','liveOnlyCount':len(live_records),'liveOnlyBytes':sum(r['bytes'] for r in live_records),'liveOnlyDigest':hashlib.sha256(live_body.encode()).hexdigest(),'liveOnlyCatalogPath':'.othrys/knowledge/catalog/great-harvest-live.jsonl','liveOnlyStates':dict(sorted(Counter(r['sourceState'] for r in live_records).items())),'repositoryIndex':repos,'sourcePayloadCopied':False,'authorityGranted':False,'automaticPromotion':False}
    summary_path=catalog_dir/'great-harvest-summary.json'
    summary_path.write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8',newline='\n')
    return summary

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--projects',required=True); ap.add_argument('--othrys-root',required=True)
    args=ap.parse_args(); projects=Path(args.projects); root=Path(args.othrys_root)
    records,repos,dupes=build_records(projects); commits=build_commits(projects); live_records=build_live_records(projects); summary=write_catalog(root,records,repos,dupes,commits,live_records)
    print(json.dumps(summary,indent=2,ensure_ascii=False))

if __name__=='__main__':main()
