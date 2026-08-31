import subprocess
from pathlib import Path
root=Path(r'C:\Users\othry\Projects\othrys-os')
files=['runtime/os/training_mode.test.mjs','runtime/os/training_learning.test.mjs']
r=subprocess.run(['node','--test',*files],cwd=root,text=True,capture_output=True)
print(r.stdout);print(r.stderr);raise SystemExit(r.returncode)
