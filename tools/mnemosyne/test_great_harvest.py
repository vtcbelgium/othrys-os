from __future__ import annotations
import json, subprocess, tempfile, unittest
from pathlib import Path
import great_harvest as gh


def git(repo:Path,*args:str):
    p=subprocess.run(['git','-C',str(repo),*args],capture_output=True,text=True,encoding='utf-8',errors='replace')
    if p.returncode:raise RuntimeError(p.stderr)
    return p.stdout.strip()

class GreatHarvestTests(unittest.TestCase):
    def test_history_worktree_dedupe_and_no_payload_copy(self):
        with tempfile.TemporaryDirectory() as td:
            base=Path(td); projects=base/'projects'; projects.mkdir(); root=base/'othrys-v2'; root.mkdir()
            repo=projects/'repo-a'; repo.mkdir(); git(repo,'init'); git(repo,'config','user.email','test@example.com'); git(repo,'config','user.name','Test')
            git(repo,'remote','add','origin','https://example.invalid/demo.git')
            (repo/'src').mkdir(); (repo/'src'/'old.py').write_text("SECRET_SENTINEL='never copy'\ndef old(): return 1\n",encoding='utf-8')
            hidden=repo/'.othrys'/'knowledge'/'catalog'; hidden.mkdir(parents=True); (hidden/'self.jsonl').write_text('{"generated":true}\n',encoding='utf-8')
            docs=repo/'docs'; docs.mkdir(); (docs/'evidence.json').write_text('{"evidence":true}\n',encoding='utf-8')
            git(repo,'add','.'); git(repo,'commit','-m','first implementation')
            (repo/'src'/'old.py').unlink(); (repo/'src'/'live.py').write_text('def live(): return 2\n',encoding='utf-8')
            git(repo,'add','-A'); git(repo,'commit','-m','replace old implementation')
            git(repo,'worktree','add',str(projects/'repo-b'),'-b','side')
            (repo/'src'/'live.py').write_text('def live(): return 3\n',encoding='utf-8')
            loose=projects/'loose-app'; loose.mkdir(); (loose/'app.js').write_text('export const loose=1;\n',encoding='utf-8')
            records,repos,dupes=gh.build_records(projects); commits=gh.build_commits(projects); live=gh.build_live_records(projects)
            s1=gh.write_catalog(root,records,repos,dupes,commits,live)
            records2,repos2,dupes2=gh.build_records(projects); commits2=gh.build_commits(projects)
            live2=gh.build_live_records(projects); s2=gh.write_catalog(root,records2,repos2,dupes2,commits2,live2)
            self.assertEqual(s1['workspaceCount'],2); self.assertEqual(s1['lineageCount'],1)
            self.assertEqual(s1['catalogSha256'],s2['catalogSha256']); self.assertEqual(s1['commitCatalogSha256'],s2['commitCatalogSha256'])
            catalog=(root/'.othrys'/'knowledge'/'catalog'/'great-harvest-code.jsonl').read_text(encoding='utf-8')
            self.assertNotIn('SECRET_SENTINEL',catalog); self.assertNotIn('self.jsonl',catalog); self.assertNotIn('evidence.json',catalog)
            parsed=[json.loads(x) for x in catalog.splitlines()]
            old=[r for r in parsed if 'src/old.py' in r['paths']]
            self.assertTrue(old and old[0]['historicalOnly']); self.assertFalse(old[0]['authorityGranted'])
            self.assertGreaterEqual(s1['commitCount'],2); self.assertFalse(s1['sourcePayloadCopied'])
            self.assertEqual(s1['liveOnlyDigest'],s2['liveOnlyDigest']); self.assertGreaterEqual(s1['liveOnlyCount'],2)
            livecat=(root/'.othrys'/'knowledge'/'catalog'/'great-harvest-live.jsonl').read_text(encoding='utf-8')
            self.assertNotIn('export const loose=1',livecat); self.assertIn('FILESYSTEM_ONLY',livecat); self.assertIn('WORKTREE_MODIFIED',livecat)

if __name__=='__main__':unittest.main()
