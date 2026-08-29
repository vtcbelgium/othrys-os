from __future__ import annotations
import argparse, hashlib, json, os, re, shutil, subprocess
from pathlib import Path

DOC_EXT={'.md','.txt','.json','.jsonl','.ndjson','.yaml','.yml','.toml','.csv','.log','.sql','.xml','.html','.rst','.ini','.cfg','.conf'}
EXCLUDE_DIRS={'node_modules','.git','dist','build','__pycache__','.next','.venv','venv','coverage'}
LOCAL_STATE_DIRS={'.othrys/logs','.othrys/runtime'}
LEAK_PATTERNS=[
 ('ghp',re.compile(rb'\bghp_[A-Za-z0-9]{20,}')),
 ('github_pat',re.compile(rb'\bgithub_pat_[A-Za-z0-9_]{20,}')),
 ('gsk',re.compile(rb'\bgsk_[A-Za-z0-9]{20,}')),
 ('akia',re.compile(rb'\bAKIA[A-Z0-9]{12,}')),
 ('jwt',re.compile(rb'\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{6,}')),
 ('xox',re.compile(rb'\bxox[a-zA-Z0-9-]{10,}')),
 ('glpat',re.compile(rb'\bglpat-[A-Za-z0-9_-]{20,}')),
]

def run_git(repo:Path,*args:str)->str|None:
    try:
        p=subprocess.run(['git','-C',str(repo),*args],capture_output=True,text=True,timeout=8)
        return p.stdout.strip() if p.returncode==0 and p.stdout.strip() else None
    except Exception:return None

def repo_meta(repo:Path)->dict:
    origin=run_git(repo,'remote','get-url','origin')
    common=run_git(repo,'rev-parse','--git-common-dir')
    branch=run_git(repo,'branch','--show-current')
    head=run_git(repo,'rev-parse','HEAD')
    lineage=origin or f'local:{repo.name}'
    return {'repo':repo.name,'origin':origin,'branch':branch,'head':head,'lineage':lineage}

def kind_for(repo:Path,p:Path)->list[str]:
    s=(p.name+' '+str(p.parent)).lower(); kinds=['document']
    if any(k in s for k in ['log','ledger','chronicle','receipt','result','evidence','history','journal']): kinds.append('log')
    if re.search(r'(^|[\\/])(books?|book-of-|great-library[\\/]book)',str(p),re.I) or re.search(r'book[_ -]?of|^book',p.name,re.I): kinds.append('book')
    if p.suffix.lower() in {'.json','.jsonl'}: kinds.append('structured')
    return kinds

def leak_name(data:bytes)->str|None:
    for name,rx in LEAK_PATTERNS:
        if rx.search(data): return name
    return None

def iter_docs(repo:Path):
    for dp,dns,fns in os.walk(repo,topdown=True,followlinks=False):
        kept=[]
        for d in dns:
            if d in EXCLUDE_DIRS or os.path.islink(os.path.join(dp,d)): continue
            rel=(Path(dp)/d).relative_to(repo).as_posix()
            if rel in LOCAL_STATE_DIRS: continue
            kept.append(d)
        dns[:]=kept
        for fn in fns:
            p=Path(dp)/fn
            if p.suffix.lower() in DOC_EXT: yield p

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--projects',required=True); ap.add_argument('--othrys-root',required=True); a=ap.parse_args()
    projects=Path(a.projects); root=Path(a.othrys_root); store=root/'.othrys'/'knowledge'; objects=store/'archive'/'objects'; catalog_dir=store/'catalog'
    objects.mkdir(parents=True,exist_ok=True); catalog_dir.mkdir(parents=True,exist_ok=True)
    repos=sorted([p for p in projects.iterdir() if p.is_dir() and (p/'.git').exists()],key=lambda p:p.name.lower())
    metas={r.name:repo_meta(r) for r in repos}; byhash={}; occurrences=0
    for repo in repos:
        meta=metas[repo.name]
        for p in iter_docs(repo):
            if repo.resolve()==root.resolve():
                try: rel_store=p.resolve().relative_to(store.resolve())
                except ValueError: rel_store=None
                if rel_store is not None and rel_store.parts and rel_store.parts[0] in {'archive','catalog'}: continue
            try:data=p.read_bytes()
            except OSError:continue
            occurrences+=1; h=hashlib.sha256(data).hexdigest(); rel=str(p.relative_to(repo)).replace('\\','/')
            rec=byhash.setdefault(h,{'sha256':h,'bytes':len(data),'kinds':set(),'sources':[],'leakPattern':None})
            rec['kinds'].update(kind_for(repo,p)); rec['sources'].append({'repo':repo.name,'path':rel,'lineage':meta['lineage']})
            if rec['leakPattern'] is None: rec['leakPattern']=leak_name(data)
            if rec['leakPattern'] is None:
                dst=objects/h
                if not dst.exists(): dst.write_bytes(data)
    records=[]
    for h in sorted(byhash):
        r=byhash[h]; sources=sorted(r['sources'],key=lambda x:(x['repo'],x['path']))
        records.append({'sha256':h,'bytes':r['bytes'],'kinds':sorted(r['kinds']),'archived':r['leakPattern'] is None,'leakPattern':r['leakPattern'],'sources':sources})
    # Remove any object later found secret-shaped through a duplicate occurrence.
    referenced={r['sha256'] for r in records if r['archived']}
    for r in records:
        if not r['archived']:
            p=objects/r['sha256']
            if p.exists(): p.unlink()
    # The archive is generated/reconstructible. Prune stale objects from older catalogs.
    for p in objects.iterdir():
        if p.is_file() and p.name not in referenced:
            p.unlink()
    cat_path=catalog_dir/'estate-catalog.jsonl'
    cat_bytes=''.join(json.dumps(r,separators=(',',':'),sort_keys=True)+'\n' for r in records).encode()
    cat_path.write_bytes(cat_bytes)
    summary={
      'schema':'othrys.os.mnemosyne-estate.v1','workspaceCount':len(repos),'occurrences':occurrences,'uniqueObjects':len(records),
      'archivedObjects':sum(1 for r in records if r['archived']),'excludedObjects':sum(1 for r in records if not r['archived']),
      'uniqueBytes':sum(r['bytes'] for r in records),'archivedBytes':sum(r['bytes'] for r in records if r['archived']),
      'logObjects':sum(1 for r in records if 'log' in r['kinds']),'bookObjects':sum(1 for r in records if 'book' in r['kinds']),
      'catalogSha256':hashlib.sha256(cat_bytes).hexdigest(),'catalogPath':'.othrys/knowledge/catalog/estate-catalog.jsonl',
      'archivePath':'.othrys/knowledge/archive/objects','authorityGranted':False,'automaticPromotion':False
    }
    (catalog_dir/'estate-summary.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf8')
    repos_out={'schema':'othrys.os.mnemosyne-estate-repos.v1','repositories':[{'repo':metas[r.name]['repo'],'origin':metas[r.name]['origin'],'lineage':metas[r.name]['lineage']} for r in repos]}
    (catalog_dir/'estate-repositories.json').write_text(json.dumps(repos_out,indent=2)+'\n',encoding='utf8')
    print(json.dumps(summary,indent=2))
if __name__=='__main__':main()
