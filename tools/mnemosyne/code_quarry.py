import os,re,hashlib,json
from pathlib import Path
root=Path(r'C:\Users\othry\Projects')
repos=[p for p in root.iterdir() if p.is_dir() and (p/'.git').exists()]
exclude={'node_modules','.git','dist','build','__pycache__','.next','.venv','venv','coverage'}
exts={'.ts','.tsx','.js','.jsx','.mjs','.cjs','.py','.sql','.rs','.go','.java','.cs'}
terms=['mnemosyne','great library','knowledge','memory','recall','search','index','rag','retrieval','embedding','vector','sqlite','fts','graph','provenance','snapshot','persistence','concordance','callimachus','muse','obsidian','jarvis','prometheus','chunk','semantic']
rx={t:re.compile(re.escape(t),re.I) for t in terms}
byhash={}; occurrences=0
for repo in repos:
  for dp,dns,fns in os.walk(repo,topdown=True,followlinks=False):
    dns[:]=[d for d in dns if d not in exclude and not os.path.islink(os.path.join(dp,d))]
    for fn in fns:
      p=Path(dp)/fn
      if p.suffix.lower() not in exts: continue
      try:b=p.read_bytes(); text=b.decode('utf8','ignore')
      except OSError: continue
      hits=sorted(t for t,r in rx.items() if r.search(text))
      if not hits: continue
      occurrences+=1; h=hashlib.sha256(b).hexdigest(); rel=str(p.relative_to(repo)).replace('\\','/')
      rec=byhash.setdefault(h,{'sha256':h,'bytes':len(b),'terms':set(),'sources':[]})
      rec['terms'].update(hits); rec['sources'].append({'repo':repo.name,'path':rel})
records=[]
for h,r in byhash.items(): records.append({'sha256':h,'bytes':r['bytes'],'terms':sorted(r['terms']),'sources':sorted(r['sources'],key=lambda x:(x['repo'],x['path']))})
records.sort(key=lambda x:(-len(x['terms']),x['sources'][0]['repo'],x['sources'][0]['path']))
out=Path(r'C:\Users\othry\Projects\othrys-os\docs\V2-010G\MNEMOSYNE_CODE_QUARRY.json')
out.write_text(json.dumps({'schema':'othrys.os.mnemosyne-code-quarry.v1','workspaceCount':len(repos),'occurrences':occurrences,'uniqueFiles':len(records),'terms':terms,'files':records},indent=2)+'\n',encoding='utf8')
print(json.dumps({'workspaceCount':len(repos),'occurrences':occurrences,'uniqueFiles':len(records),'top':[{'terms':len(r['terms']),'source':r['sources'][0],'hits':r['terms']} for r in records[:30]]},indent=2))
