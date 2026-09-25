from __future__ import annotations
import importlib.util, inspect, sys, tempfile, traceback, unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))

def load(path:Path):
    name='othrys_test_'+path.stem+'_'+str(abs(hash(str(path))))
    spec=importlib.util.spec_from_file_location(name,path)
    if spec is None or spec.loader is None: raise RuntimeError(f'LOAD_FAILED:{path}')
    parent=str(path.parent.resolve()); sys.path.insert(0,parent)
    try:
        mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod
    finally:
        try: sys.path.remove(parent)
        except ValueError: pass

def main(argv:list[str])->int:
    if len(argv)<2:
        print('usage: run-python-tests.py <dir> [<dir>...]',file=sys.stderr); return 2
    files=[]
    for raw in argv[1:]:
        p=(ROOT/raw).resolve() if not Path(raw).is_absolute() else Path(raw)
        files += sorted(p.glob('test_*.py')) if p.is_dir() else [p]
    total=passed=failed=0
    for path in files:
        try: mod=load(path)
        except Exception:
            total+=1; failed+=1; print(f'FAIL import {path.relative_to(ROOT)}'); traceback.print_exc(); continue
        suite=unittest.defaultTestLoader.loadTestsFromModule(mod)
        if suite.countTestCases():
            result=unittest.TextTestRunner(stream=sys.stdout,verbosity=0).run(suite)
            n=result.testsRun; total+=n; failed+=len(result.failures)+len(result.errors); passed+=n-len(result.failures)-len(result.errors)
        for name,fn in sorted(inspect.getmembers(mod,inspect.isfunction)):
            if not name.startswith('test_') or fn.__module__!=mod.__name__: continue
            total+=1
            try:
                params=list(inspect.signature(fn).parameters)
                if not params: fn()
                elif params==['tmp_path']:
                    with tempfile.TemporaryDirectory(prefix='othrys-test-') as td: fn(Path(td))
                else: raise RuntimeError('UNSUPPORTED_TEST_FIXTURE:'+','.join(params))
                passed+=1; print(f'PASS {path.name}::{name}')
            except Exception:
                failed+=1; print(f'FAIL {path.name}::{name}'); traceback.print_exc()
    print(f'{passed} passed')
    if failed: print(f'{failed} failed')
    return 0 if failed==0 else 1

if __name__=='__main__': raise SystemExit(main(sys.argv))
