from __future__ import annotations
import importlib.util, json, tempfile, unittest
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('ghf',HERE/'great_harvest_federate.py')
ghf=importlib.util.module_from_spec(spec); spec.loader.exec_module(ghf)

def write_jsonl(path, rows):
    path.write_text(''.join(ghf.stable(r)+'\n' for r in rows),encoding='utf-8')

class FederateTests(unittest.TestCase):
    def test_cross_device_dedup_preserves_locations_and_is_deterministic(self):
        with tempfile.TemporaryDirectory() as td:
            base=Path(td); a=base/'a'; b=base/'b'; root=base/'root'
            a.mkdir(); b.mkdir()
            code={'lineage':'https://example/x','gitObject':'abc','paths':['a.py'],'currentPaths':['a.py'],'historicalOnly':False,'bytes':7,'language':'py','kind':'CODE'}
            live={'sha256':'dead','kind':'CODE','language':'py','bytes':5,'sourceState':'FILESYSTEM_ONLY','lineage':'live:x','workspace':'x','path':'x.py'}
            commit={'lineage':'https://example/x','commit':'c1','subject':'x'}
            for cat in (a,b):
                write_jsonl(cat/'great-harvest-code.jsonl',[code]); write_jsonl(cat/'great-harvest-live.jsonl',[live]); write_jsonl(cat/'great-harvest-commits.jsonl',[commit])
                (cat/'great-harvest-summary.json').write_text(json.dumps({'repositoryIndex':[{'lineage':'https://example/x','workspaces':['x'],'representative':'x'}]}),encoding='utf-8')
            devices=[('A',a),('B',b)]
            code_out=ghf.merge_code(devices); live_out=ghf.merge_live(devices); commits=ghf.merge_commits(devices); repos=ghf.repository_index(devices)
            self.assertEqual(len(code_out),1); self.assertEqual(code_out[0]['devices'],['A','B'])
            self.assertEqual(len(live_out),1); self.assertEqual(len(live_out[0]['locations']),2)
            self.assertEqual(len(commits),1)
            perimeter=[{'device':'A','path':'x','classification':'CANONICAL'}]
            first=ghf.write(root,code_out,commits,live_out,repos,perimeter)
            second=ghf.write(root,ghf.merge_code(devices),ghf.merge_commits(devices),ghf.merge_live(devices),ghf.repository_index(devices),perimeter)
            self.assertEqual(first['catalogSha256'],second['catalogSha256'])
            self.assertEqual(first['liveOnlyDigest'],second['liveOnlyDigest'])
            self.assertEqual(first['workspaceCount'],2)
            self.assertFalse(first['authorityGranted']); self.assertFalse(first['automaticPromotion'])

if __name__=='__main__': unittest.main()
