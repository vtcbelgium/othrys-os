import subprocess
from pathlib import Path
root=Path(r'C:\Users\othry\Projects\othrys-v2')
files=sorted(str(p.relative_to(root)) for p in root.glob('blocks/*/*/tests/contract.test.mjs'))
print('BLOCK_CONTRACT_FILES',len(files))
r=subprocess.run(['node','--test',*files],cwd=root,text=True,capture_output=True)
print(r.stdout)
print(r.stderr)
raise SystemExit(r.returncode)
