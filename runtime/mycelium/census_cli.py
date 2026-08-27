import argparse
import json
from pathlib import Path
from node import build_node_envelope, feasible

p=argparse.ArgumentParser()
p.add_argument("--node-id",required=True)
p.add_argument("--root",required=True)
p.add_argument("--worker",required=True)
p.add_argument("--capability",default="")
p.add_argument("--cpu-threads",type=int,default=0)
p.add_argument("--ram-mb",type=int,default=0)
p.add_argument("--gpu-count",type=int,default=0)
p.add_argument("--vram-mb",type=int,default=0)
a=p.parse_args()
env=build_node_envelope(a.node_id,Path(a.root),Path(a.worker))
req={"cpu_threads":a.cpu_threads,"ram_mb":a.ram_mb,"gpu_count":a.gpu_count,"vram_mb":a.vram_mb}
out={"envelope":env,"requested":req,"capability":a.capability,"feasible":feasible(env,a.capability,req) if a.capability else None}
print(json.dumps(out,separators=(",",":")))
