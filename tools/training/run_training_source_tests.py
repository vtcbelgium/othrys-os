import subprocess
from pathlib import Path
root=Path(r'C:\Users\othry\Projects\othrys-v2')
files=sorted([*root.glob('training/level-1/L1-*/*.test.mjs'),*root.glob('training/level-2/L2-*/*.test.mjs')])
files=[str(p.relative_to(root)) for p in files]
print('SOURCE_TEST_FILES',len(files))
r=subprocess.run(['node','--test',*files],cwd=root,text=True,capture_output=True)
print(r.stdout);print(r.stderr);raise SystemExit(r.returncode)
