from __future__ import annotations

import os
import platform
import shutil
import subprocess
from pathlib import Path
from typing import Any

WORKER_CAPABILITY = "engineering.patch"


def _text(*args: str) -> str:
    try:
        return subprocess.check_output(args, text=True, encoding="utf-8", errors="replace", timeout=8).strip()
    except Exception:
        return ""


def _memory_mb() -> int:
    if os.name == "nt":
        import ctypes
        class M(ctypes.Structure):
            _fields_=[("dwLength",ctypes.c_ulong),("dwMemoryLoad",ctypes.c_ulong),("ullTotalPhys",ctypes.c_ulonglong),("ullAvailPhys",ctypes.c_ulonglong),("ullTotalPageFile",ctypes.c_ulonglong),("ullAvailPageFile",ctypes.c_ulonglong),("ullTotalVirtual",ctypes.c_ulonglong),("ullAvailVirtual",ctypes.c_ulonglong),("sullAvailExtendedVirtual",ctypes.c_ulonglong)]
        m=M(); m.dwLength=ctypes.sizeof(M); ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m)); return int(m.ullTotalPhys//(1024*1024))
    try:
        page_size = int(os.sysconf("SC_PAGE_SIZE"))
        pages = int(os.sysconf("SC_PHYS_PAGES"))
        return int((page_size * pages) // (1024 * 1024))
    except (AttributeError, OSError, ValueError):
        try:
            for line in Path("/proc/meminfo").read_text(encoding="utf-8").splitlines():
                if line.startswith("MemTotal:"):
                    return int(line.split()[1]) // 1024
        except (OSError, ValueError, IndexError):
            pass
    return 0


def _gpu() -> dict[str, Any]:
    raw=_text("nvidia-smi","--query-gpu=name,memory.total,memory.used,utilization.gpu,temperature.gpu,power.draw","--format=csv,noheader,nounits")
    if not raw: return {"available":False}
    p=[x.strip() for x in raw.splitlines()[0].split(",")]
    return {"available":True,"name":p[0],"memory_total_mb":int(float(p[1])),"memory_used_mb":int(float(p[2])),"utilization_pct":int(float(p[3])),"temperature_c":int(float(p[4])),"power_w":float(p[5])}


def census(root: Path) -> dict[str, Any]:
    ram=_memory_mb(); disk=shutil.disk_usage(root); gpu=_gpu(); logical=os.cpu_count() or 1
    models=_text("ollama","list")
    return {"hostname":platform.node(),"platform":platform.platform(),"logical_cpus":logical,"ram_total_mb":ram,"disk_free_mb":int(disk.free//(1024*1024)),"gpu":gpu,"runtimes":{"python":platform.python_version(),"node":_text("node","--version"),"git":_text("git","--version"),"ollama":bool(models)},"ollama_models":models}


def _env_ceiling(name: str, default: int, maximum: int, minimum: int = 0) -> int:
    raw=os.getenv(name)
    try:
        value=int(raw) if raw is not None else default
    except ValueError:
        value=default
    return max(minimum,min(value,maximum))


def advertised_capacity(physical: dict[str, Any]) -> dict[str, Any]:
    gpu=physical["gpu"]; logical=int(physical["logical_cpus"]); ram=int(physical["ram_total_mb"]); vram=int(gpu.get("memory_total_mb",0))
    cpu=_env_ceiling("OTHRYS_CPU_THREADS",max(1,logical-2),logical,1)
    ram_mb=_env_ceiling("OTHRYS_RAM_MB",max(2048,ram-4096),ram,512)
    gpu_count=_env_ceiling("OTHRYS_GPU_COUNT",1 if gpu.get("available") else 0,1 if gpu.get("available") else 0,0)
    vram_mb=_env_ceiling("OTHRYS_VRAM_MB",max(0,vram-512),vram,0) if gpu_count else 0
    return {"cpu_threads":cpu,"ram_mb":ram_mb,"gpu_count":gpu_count,"vram_mb":vram_mb,"owner_policy":os.getenv("OTHRYS_OWNER_POLICY","PRIMARY_V2_WITH_OS_RESERVE"),"ceiling_source":"OWNER_ENV_OR_SAFE_DEFAULT"}


def capabilities(physical: dict[str, Any], worker_path: Path) -> list[str]:
    out=["verification.local", "verification.sha256@1"]
    if physical["runtimes"]["git"]: out.append("git.local")
    if physical["runtimes"]["node"]: out.append("node.local")
    if physical["runtimes"]["ollama"] and worker_path.exists() and "qwen3:8b" in physical["ollama_models"]: out.append(WORKER_CAPABILITY)
    return out


def build_node_envelope(node_id: str, root: Path, worker_path: Path) -> dict[str, Any]:
    physical=census(root); advertised=advertised_capacity(physical); caps=capabilities(physical,worker_path)
    return {"schema":"othrys.mycelium.node-envelope.v0.1","node_id":node_id,"authorityGranted":False,"physical":physical,"advertised":advertised,"capabilities":caps,"health":{"state":"READY" if caps else "DEGRADED","gpu_busy":bool(physical["gpu"].get("utilization_pct",0)>=90)},"routing":{"hardcoded_hostname":False,"distributed":False}}


def feasible(envelope: dict[str, Any], capability: str, request: dict[str, int]) -> bool:
    if envelope.get("authorityGranted") is not False: return False
    if capability not in envelope.get("capabilities",[]): return False
    cap=envelope.get("advertised",{})
    return all(int(request.get(k,0))<=int(cap.get(k,0)) for k in ("cpu_threads","ram_mb","gpu_count","vram_mb"))


def select_node(envelopes: list[dict[str, Any]], capability: str, request: dict[str, int]) -> dict[str, Any] | None:
    candidates = [e for e in envelopes if feasible(e, capability, request)]
    if not candidates:
        return None
    needs_gpu = int(request.get("gpu_count", 0)) > 0 or int(request.get("vram_mb", 0)) > 0
    def score(e: dict[str, Any]):
        cap = e.get("advertised", {})
        node_id = str(e.get("node_id", ""))
        if needs_gpu:
            return (-int(cap.get("gpu_count", 0)), -int(cap.get("vram_mb", 0)), node_id)
        return (int(cap.get("gpu_count", 0)), int(cap.get("cpu_threads", 0)), node_id)
    return sorted(candidates, key=score)[0]
