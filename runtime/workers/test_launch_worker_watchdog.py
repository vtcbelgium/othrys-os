import importlib.util, json, subprocess, sys, tempfile, time
from pathlib import Path

def test_launcher_exposes_bounded_wait_flag():
    out=subprocess.check_output([sys.executable,str(Path(__file__).with_name('launch_worker.py')),'--help'],text=True)
    assert '--wait' in out

def test_launcher_source_has_timeout_kill_path():
    text=Path(__file__).with_name('launch_worker.py').read_text(encoding='utf-8')
    assert 'timeout_sec' in text and 'timed_out' in text and 'taskkill' in text
