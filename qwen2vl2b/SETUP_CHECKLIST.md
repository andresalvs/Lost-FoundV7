# Qwen2VL2B Setup Checklist for New Computers

**Date:** January 23, 2026  
**For:** Cloning Lost and Found V7 project on a new computer  
**Time Required:** 45-90 minutes (depending on internet speed)

---

## Pre-Setup Verification

- [ ] **Computer has internet connection** (for downloading ~13.5GB model)
- [ ] **Have at least 25GB free disk space** (for model + dependencies + cache)
- [ ] **Administrator access** (for some installations on Windows)
- [ ] **Visual Studio Code or code editor ready** (optional but recommended)

---

## Phase 1: System Requirements (5-10 minutes)

### Python Installation
- [ ] **Check Python version:**
  ```bash
  python --version
  ```
  - [ ] Version is 3.8 or higher (3.10+ recommended)
  - [ ] If older: Install from https://python.org

- [ ] **Verify Python in PATH:**
  ```bash
  python -c "import sys; print(sys.executable)"
  ```
  - [ ] Should show a valid path

### GPU Support (Optional but Recommended)

**If you have NVIDIA GPU:**
- [ ] **NVIDIA CUDA installed** (for GPU acceleration)
  - Check: `nvidia-smi`
  - Install from: https://developer.nvidia.com/cuda-downloads
  - Version needed: CUDA 11.8 or 12.x

- [ ] **CUDA is in system PATH:**
  ```bash
  nvcc --version
  ```

**If you have Apple Silicon (M1/M2/M3):**
- [ ] **Xcode Command Line Tools installed:**
  ```bash
  xcode-select --install
  ```
- [ ] No additional GPU setup needed (Metal automatically used)

**For CPU-only setup:**
- [ ] Proceed to Phase 2 (no GPU drivers needed, but will be slower)

---

## Phase 2: Clone Project & Navigate (5-10 minutes)

- [ ] **Clone project from Git:**
  ```bash
  git clone <repository-url>
  cd Lost-and-Found-V7
  ```

- [ ] **Verify project structure:**
  ```bash
  ls -la qwen2vl2b/
  ```
  - [ ] Should show: `server.py`, `caption_image.py`, `requirements.txt`, `qwen2vl2b/` folder

- [ ] **Check if model weights exist:**
  ```bash
  ls -lh qwen2vl2b/qwen2vl2b/
  ```
  - [ ] **If you see 8+ files totaling ~13.5GB:** Skip to Phase 3
  - [ ] **If folder is empty or missing:** Go to "Phase 2B: Download Model"

### Phase 2B: Download Model Weights (20-60 minutes)

Only do this if model files are NOT in the project!

- [ ] **Download using one of these methods:**

**Option 1: Git LFS (Recommended)**
- [ ] Install Git LFS: https://git-lfs.com/
- [ ] Run in `qwen2vl2b/` folder:
  ```bash
  git lfs install
  git clone https://huggingface.co/Qwen/Qwen2-VL-2B qwen2vl2b
  ```

**Option 2: Hugging Face Hub CLI**
- [ ] Install: `pip install huggingface-hub`
- [ ] Run:
  ```bash
  huggingface-cli download Qwen/Qwen2-VL-2B \
    --local-dir qwen2vl2b/qwen2vl2b \
    --local-dir-use-symlinks False
  ```

**Option 3: Manual Web Download**
- [ ] Go to: https://huggingface.co/Qwen/Qwen2-VL-2B
- [ ] Click "Files and versions"
- [ ] Download each file to `qwen2vl2b/qwen2vl2b/` folder:
  - [ ] model-00001-of-00002.safetensors (8.5 GB)
  - [ ] model-00002-of-00002.safetensors (5.0 GB)
  - [ ] config.json
  - [ ] tokenizer.json
  - [ ] Other config files (see QWEN_SETUP_GUIDE.md)

- [ ] **Verify download completed:**
  ```bash
  cd qwen2vl2b/qwen2vl2b
  ls -lh | grep safetensors
  ```
  - [ ] Should show 2 files totaling ~13.5GB

---

## Phase 3: Python Virtual Environment (5 minutes)

**Location:** Inside `qwen2vl2b/` folder

- [ ] **Navigate to qwen2vl2b:**
  ```bash
  cd qwen2vl2b
  pwd  # Verify you're in correct location
  ```

- [ ] **Create virtual environment:**
  
  **Windows:**
  ```bash
  python -m venv .venv
  .\.venv\Scripts\activate
  ```
  
  **macOS/Linux:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

- [ ] **Verify activation:**
  - [ ] Should see `(.venv)` at start of terminal prompt
  - [ ] Example: `(.venv) C:\path\qwen2vl2b>` or `(.venv) user@mac:qwen2vl2b$`

---

## Phase 4: Install Python Dependencies (10-20 minutes)

**Virtual environment must be activated!**

- [ ] **Upgrade pip first:**
  ```bash
  pip install --upgrade pip setuptools wheel
  ```

- [ ] **Install dependencies from requirements.txt:**
  ```bash
  pip install -r requirements.txt
  ```
  - [ ] Watch for any error messages
  - [ ] Installation typically takes 5-15 minutes

- [ ] **Verify all packages installed:**
  ```bash
  pip list | grep -E "torch|transformers|Flask|Pillow"
  ```
  - [ ] Should show torch, transformers, Flask, Pillow with versions

---

## Phase 5: Verify Installation (5-10 minutes)

**Virtual environment must be activated!**

- [ ] **Test PyTorch:**
  ```bash
  python -c "import torch; print(f'PyTorch version: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}')"
  ```
  - [ ] Should show PyTorch version and CUDA availability

- [ ] **Test Transformers (Qwen model):**
  ```bash
  python -c "from transformers import Qwen2VLForConditionalGeneration, AutoProcessor; print('✅ Qwen model packages available')"
  ```
  - [ ] Should show ✅ message without errors

- [ ] **Test Flask:**
  ```bash
  python -c "from flask import Flask; print('✅ Flask ready')"
  ```
  - [ ] Should show ✅ message

- [ ] **Test image processing:**
  ```bash
  python -c "from PIL import Image; print('✅ Pillow ready')"
  ```
  - [ ] Should show ✅ message

---

## Phase 6: Start Model Server (5-10 minutes)

**Keep this terminal open!**

- [ ] **Ensure you're in `qwen2vl2b/` folder with .venv activated**

- [ ] **Start the server:**
  ```bash
  python server.py
  ```

- [ ] **Wait for startup (first time takes 30-60 seconds):**
  - [ ] Look for: `"Running on http://127.0.0.1:5000"`
  - [ ] Look for: `"Qwen2-VL model loaded successfully"`

- [ ] **Note the startup messages:**
  - [ ] Check what device is detected (CUDA/CPU/Metal)
  - [ ] Check model loading time

- [ ] **Leave this terminal open** (server must stay running)

---

## Phase 7: Test Server API (5 minutes)

**Open NEW terminal** (keep server running in previous terminal)

- [ ] **Navigate to qwen2vl2b and activate .venv:**
  ```bash
  cd qwen2vl2b
  source .venv/bin/activate  # or .\.venv\Scripts\activate
  ```

- [ ] **Check server status:**
  ```bash
  curl http://localhost:5000/status
  # or on Windows PowerShell:
  # Invoke-WebRequest http://localhost:5000/status
  ```
  - [ ] Should return JSON with status info
  - [ ] Example: `{"status": "running", "model": "Qwen2-VL-2B"}`

- [ ] **Test image captioning:**
  ```bash
  # Create quick test
  python -c "
import requests
from PIL import Image
import io

img = Image.new('RGB', (200, 200), color='blue')
img_bytes = io.BytesIO()
img.save(img_bytes, format='PNG')
img_bytes.seek(0)

response = requests.post('http://localhost:5000/caption', 
                        files={'image': ('test.png', img_bytes, 'image/png')})
print(response.json())
"
  ```
  - [ ] Should return a caption describing the image

---

## Phase 8: Integration Check (5 minutes)

- [ ] **Check main application files:**
  ```bash
  cd ..  # Back to Lost-and-Found-V7 root
  ls -la src/
  ls -la backend/
  ```
  - [ ] Verify frontend (Vue.js in src/) exists
  - [ ] Verify backend (Node.js in backend/) exists

- [ ] **Verify Flask server is still running:**
  - [ ] Check previous terminal with server.py
  - [ ] Should still show no errors

---

## Phase 9: Full System Integration (Optional but Recommended)

- [ ] **In new terminal, go to backend folder:**
  ```bash
  cd backend
  npm install
  npm start
  ```
  - [ ] Backend should start successfully

- [ ] **In another terminal, start frontend:**
  ```bash
  cd ..  # Back to root
  npm install
  npm run serve
  ```
  - [ ] Frontend should start on http://localhost:8080 (or similar)

- [ ] **Test in browser:**
  - [ ] Open http://localhost:8080
  - [ ] Test uploading an item image
  - [ ] Verify caption is generated (may take 5-60 seconds depending on GPU)

---

## Troubleshooting Checklist

If something goes wrong:

- [ ] **Error: "ModuleNotFoundError"**
  - [ ] Activate .venv: `source .venv/bin/activate` (or Windows equivalent)
  - [ ] Reinstall: `pip install -r requirements.txt`

- [ ] **Error: "CUDA out of memory"**
  - [ ] Normal - will fall back to CPU
  - [ ] To force CPU: edit server.py, change `device_map='auto'` to `device_map='cpu'`

- [ ] **Error: "Port 5000 already in use"**
  - [ ] Use different port: `python server.py --port 5001`
  - [ ] Update frontend to use new port

- [ ] **Error: "Model weights not found"**
  - [ ] Download from Phase 2B above
  - [ ] Verify files are in `qwen2vl2b/qwen2vl2b/` (not in root `qwen2vl2b/`)

- [ ] **Slow performance (60+ seconds per image)**
  - [ ] This means CPU-only mode (normal)
  - [ ] To speed up: install NVIDIA drivers/CUDA or use Apple GPU

- [ ] **Virtual environment issues**
  - [ ] Start fresh:
    ```bash
    deactivate
    rm -r .venv  # Windows: rmdir /s .venv
    python -m venv .venv
    source .venv/bin/activate  # Windows: .\.venv\Scripts\activate
    pip install --upgrade pip
    pip install -r requirements.txt
    ```

---

## Success Indicators

You'll know everything is working when:

- [ ] ✅ Server starts without errors (shows "Running on http://127.0.0.1:5000")
- [ ] ✅ Status endpoint returns JSON: `curl http://localhost:5000/status`
- [ ] ✅ Image caption generation works (returns description)
- [ ] ✅ Frontend can upload images
- [ ] ✅ Generated captions appear in the application
- [ ] ✅ Performance is acceptable (5-10 sec with GPU, 30-60 sec with CPU)

---

## Quick Reference - Running the Application

**Every time you start developing:**

**Terminal 1 - Qwen Model Server:**
```bash
cd qwen2vl2b
source .venv/bin/activate    # macOS/Linux or .\.venv\Scripts\activate on Windows
python server.py
# Keep this running!
```

**Terminal 2 - Backend (Node.js):**
```bash
cd backend
npm start
```

**Terminal 3 - Frontend (Vue.js):**
```bash
cd ..
npm run serve
```

Then open: http://localhost:8080

---

## Support & Documentation

- **Qwen Model Docs:** https://huggingface.co/Qwen/Qwen2-VL-2B
- **Setup Guide:** See `QWEN_SETUP_GUIDE.md` in this folder
- **Main Project Guide:** See `Installation_CompleteV5.md` in project root
- **Troubleshooting:** See `QWEN_SETUP_GUIDE.md` > Troubleshooting section

---

**Version:** 1.0  
**Created:** January 23, 2026  
**Status:** Ready for Use
