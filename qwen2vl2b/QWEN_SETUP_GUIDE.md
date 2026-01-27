# Qwen2VL-2B Setup Guide for New Computers

**Last Updated:** January 23, 2026  
**Purpose:** Complete guide for setting up Qwen2VL-2B on a fresh computer clone

## ⚡ Quick Start (5 Steps)

1. **Download Model Weights** (if not included)
   ```bash
   cd qwen2vl2b
   git clone https://huggingface.co/Qwen/Qwen2-VL-2B qwen2vl2b
   # OR download manually from: https://huggingface.co/Qwen/Qwen2-VL-2B
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv .venv
   # Windows: .\.venv\Scripts\activate
   # macOS/Linux: source .venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Start Server**
   ```bash
   python server.py
   # Should start on http://127.0.0.1:5000
   ```

5. **Test It Works**
   ```bash
   # In another terminal
   curl http://localhost:5000/status
   ```

---

## 📋 System Requirements

### Minimum (CPU Only)
- OS: Windows 10, macOS 10.15+, or Ubuntu 18.04+
- RAM: 8GB
- Disk: 20GB free space
- Python: 3.8+
- **Performance:** 30-60 seconds per image

### Recommended (with GPU)
- OS: Same as above
- RAM: 16GB+
- GPU: NVIDIA RTX 2060+ OR Apple M1+
- Disk: 25GB+ SSD
- Python: 3.10 or 3.11
- **Performance:** 5-15 seconds per image

---

## 🔧 Detailed Setup Steps

### Step 1: Verify Python Version

```bash
python --version
# Should show Python 3.8 or higher
# Recommended: Python 3.10 or 3.11
```

If version is too old, download from: https://www.python.org/downloads/

### Step 2: Download Model Weights (Critical!)

The model is 13.5GB and must be in `qwen2vl2b/qwen2vl2b/` folder.

**Option A: Using Git LFS (Recommended)**
```bash
cd qwen2vl2b
git lfs install
git clone https://huggingface.co/Qwen/Qwen2-VL-2B qwen2vl2b
```

**Option B: Manual Download**
1. Visit: https://huggingface.co/Qwen/Qwen2-VL-2B
2. Click "Files and versions"
3. Download all files (use your browser's batch download or a tool like `huggingface-hub`)
4. Save to `qwen2vl2b/qwen2vl2b/`

**Option C: Using huggingface_hub CLI**
```bash
pip install huggingface-hub
huggingface-cli download Qwen/Qwen2-VL-2B --local-dir qwen2vl2b/qwen2vl2b --local-dir-use-symlinks False
```

**Verify download:**
```bash
cd qwen2vl2b/qwen2vl2b
ls -lh
# Should show:
# - model-00001-of-00002.safetensors (~8.5 GB)
# - model-00002-of-00002.safetensors (~5.0 GB)
# - Plus all config files (~200 MB total)
```

### Step 3: Create Virtual Environment

This isolates Python packages from your system Python.

**Windows:**
```bash
cd qwen2vl2b
python -m venv .venv
.\.venv\Scripts\activate
```

**macOS/Linux:**
```bash
cd qwen2vl2b
python3 -m venv .venv
source .venv/bin/activate
```

**Verify activation:**
```bash
# You should see (.venv) in your prompt:
# Windows:  (.venv) C:\path\to\qwen2vl2b>
# Linux:    (.venv) user@host:~/qwen2vl2b$
```

### Step 4: Install Dependencies

**Standard Installation (CPU or GPU with auto-detection):**
```bash
# Already in qwen2vl2b with .venv activated
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

**For NVIDIA GPU (Recommended for NVIDIA users):**
```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
# PyTorch will automatically use CUDA if available
```

**For Apple Silicon (M1/M2/M3 Macs):**
```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
# Uses Metal GPU acceleration automatically
```

**For CPU Only (No GPU):**
```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements-cpu.txt
# Uses CPU-optimized torch packages
```

### Step 5: Verify Installation

Test all imports work:

```bash
python -c "import torch; print(f'✅ PyTorch {torch.__version__}')"
python -c "import transformers; print(f'✅ Transformers loaded')"
python -c "from transformers import Qwen2VLForConditionalGeneration; print('✅ Qwen model available')"
python -c "from flask import Flask; print('✅ Flask ready')"
```

All should show ✅. If any fails, check the error message and reinstall that package.

### Step 6: Start the Model Server

**In terminal 1 (keep running):**
```bash
cd qwen2vl2b
# Make sure .venv is activated
python server.py
```

**Expected output:**
```
🔄 Loading system configuration...
-> Detected System: NVIDIA GPU (CUDA)
-> Device: cuda
-> Max Pixels: 1024x1024

Loading Qwen2-VL-2B model...
Qwen2-VL model loaded successfully!

 * Running on http://127.0.0.1:5000
 * WARNING: This is a development server. Do not use it in production.
 * Press CTRL+C to quit
 * Restarting with reloader
```

**First startup takes:** 30-60 seconds (model loading)  
**Subsequent starts take:** 5-10 seconds

### Step 7: Test the Server (New Terminal)

**Terminal 2 (keep .venv activated here too):**

```bash
# Test server is running
curl http://localhost:5000/status

# Expected response:
# {"status": "running", "model": "Qwen2-VL-2B", "device": "cuda"}
```

### Step 8: Test Image Captioning

Create a test file: `test_caption.py`

```python
import requests
from PIL import Image
import io

# Create a test image
img = Image.new('RGB', (300, 300), color='green')
img_bytes = io.BytesIO()
img.save(img_bytes, format='PNG')
img_bytes.seek(0)

# Send to server
files = {'image': ('test.png', img_bytes, 'image/png')}
response = requests.post('http://localhost:5000/caption', files=files)

print(response.json())
# Should return: {"caption": "A solid green square", ...}
```

Run it:
```bash
python test_caption.py
```

---

## 🐛 Troubleshooting

### Issue: "Module not found"
```bash
# Solution: Activate virtual environment
source .venv/bin/activate  # macOS/Linux
.\.venv\Scripts\activate   # Windows
```

### Issue: "CUDA out of memory"
Model will automatically fall back to CPU. This is normal.

To force CPU:
```bash
# Edit server.py, change this line:
# device_map='auto'
# to:
# device_map='cpu'
```

### Issue: "Port 5000 already in use"
```bash
# Use different port
python server.py --port 5001
```

### Issue: "Model not found"
Model weights (13.5GB) are missing. Download them:
```bash
cd qwen2vl2b
git clone https://huggingface.co/Qwen/Qwen2-VL-2B qwen2vl2b
```

### Issue: Slow performance (60+ seconds per image)
This means it's running on CPU. To speed up:
- Install NVIDIA GPU drivers + CUDA
- OR use Apple Metal (M1/M2/M3 Macs)
- OR run on cloud GPU (Google Colab, Azure ML)

### Issue: Virtual environment issues
```bash
# Fresh start
deactivate
rm -r .venv  # Windows: rmdir /s .venv
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 📦 Dependencies Explained

| Package | Version | Purpose |
|---------|---------|---------|
| torch | 2.1.2 | Deep learning framework |
| transformers | 4.36.2 | Qwen model + preprocessing |
| Pillow | 10.1.0 | Image processing |
| Flask | 3.0.0 | Web server |
| Flask-CORS | 4.0.0 | Cross-origin requests |
| numpy | 1.24.3 | Numerical computing |
| scipy | 1.11.4 | Scientific functions |
| bitsandbytes | 0.42.0 | 4-bit optimization |
| sentencepiece | 0.1.99 | Tokenizer |

---

## 🚀 Performance Tips

### Speed Up Image Processing

1. **Use GPU** (if available)
   - NVIDIA: Already optimized
   - Apple: Metal GPU automatically used
   
2. **Pre-process images**
   - Resize to 512x512 max before sending
   - Use JPEG compression
   
3. **Batch processing**
   - Send multiple images in parallel requests
   - Server uses multithreading

4. **Cache descriptions**
   - Store generated captions in database
   - Reuse for duplicate items

### Reduce Memory Usage

1. **Enable quantization** (4-bit)
   - Already enabled in server.py
   - Saves 75% memory with minimal quality loss

2. **Lower max_pixels**
   - Edit in server.py
   - Default: 1024x1024
   - Reduce to 512x512 for more speed, less memory

---

## 🔗 Integration with Main App

The Flask server exposes API endpoints:

```
GET  /status              - Server status
POST /caption             - Generate image caption
POST /caption_batch       - Multiple images
GET  /health              - Health check
```

**Frontend usage example (Vue.js):**

```javascript
async generateCaption(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await fetch('http://localhost:5000/caption', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Caption generation failed');
    const data = await response.json();
    return data.caption;
  } catch (error) {
    console.error('Error:', error);
    return 'Could not generate description';
  }
}
```

---

## ✅ Checklist for New Computer Setup

- [ ] Python 3.10+ installed
- [ ] Model weights downloaded (13.5GB in `qwen2vl2b/qwen2vl2b/`)
- [ ] Virtual environment created (`.venv/`)
- [ ] Dependencies installed from `requirements.txt`
- [ ] `python -c "import torch; print(torch.__version__)"` works
- [ ] Server starts: `python server.py` (no errors)
- [ ] Server responds: `curl http://localhost:5000/status` (returns JSON)
- [ ] Test caption works: `python test_caption.py` (returns description)
- [ ] Frontend connects to `http://localhost:5000`

---

## 📞 Support

If issues persist:
1. Check error messages carefully
2. Try the troubleshooting section above
3. Ensure all dependencies are installed: `pip list`
4. Try fresh virtual environment
5. Check Hugging Face Qwen model docs: https://huggingface.co/Qwen/Qwen2-VL-2B

---

**Version:** 1.0  
**Created:** January 23, 2026  
**Last Updated:** January 23, 2026
