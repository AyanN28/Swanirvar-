from pathlib import Path
import os, sys, subprocess
ROOT=Path(__file__).resolve().parent
os.environ.setdefault("SWANIRVAR_DATA_DIR", str(ROOT/"runtime"))
subprocess.run([sys.executable,"-m","uvicorn","backend.app:app","--host","127.0.0.1","--port","8000"],cwd=ROOT,check=True)
