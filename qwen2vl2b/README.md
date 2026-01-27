# Qwen2VL-2B AI Model Server

This folder contains the AI model server for automatic item description generation using Qwen2VL-2B (Vision-Language model).

**Status:** Production Ready  
**Model:** Qwen2VL-2B (2 billion parameters, ~13.5GB)  
**Framework:** Flask + PyTorch + Transformers  
**Last Updated:** January 23, 2026

---

## 🚀 Quick Start

```bash
# 1. Setup virtual environment
python -m venv .venv
source .venv/bin/activate  # macOS/Linux or .\.venv\Scripts\activate on Windows

# 2. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 3. Start server
python server.py

# 4. Test (in new terminal)
curl http://localhost:5000/status
```

Server runs on: `http://127.0.0.1:5000`

---

## 📋 Setup for New Computers

### Step 1: Read Documentation (Pick ONE)

**Option A: Checklist approach (RECOMMENDED)**
→ [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- 9 phases with checkboxes
- Estimated time: 45-90 minutes
- Best for first-time setup

**Option B: Comprehensive guide**
→ [QWEN_SETUP_GUIDE.md](QWEN_SETUP_GUIDE.md)
- Detailed explanations
- Troubleshooting section
- Performance optimization tips

**Option C: Quick reference**
→ [../QWEN_SETUP.md](../QWEN_SETUP.md)
- 5-minute quick start
- Links to other resources

### Step 2: Download Model Weights (13.5GB)

**⚠️ CRITICAL: Model must be in `qwen2vl2b/` subfolder**

**Method 1: Git LFS**
```bash
git lfs install
git clone https://huggingface.co/Qwen/Qwen2-VL-2B qwen2vl2b
```

**Method 2: Hugging Face Hub CLI**
```bash
pip install huggingface-hub
huggingface-cli download Qwen/Qwen2-VL-2B \
  --local-dir qwen2vl2b \
  --local-dir-use-symlinks False
```

**Method 3: Manual Download**
- Visit: https://huggingface.co/Qwen/Qwen2-VL-2B
- Download files to `qwen2vl2b/` subfolder

### Step 3: Follow Setup Checklist

See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for all phases.

---

## 📁 Folder Structure

```
qwen2vl2b/
├── 📄 server.py                     Flask server (main entry point)
├── 📄 caption_image.py              Image processing & model loading
│
├── 📄 SETUP_CHECKLIST.md            ⭐ Step-by-step setup guide
├── 📄 QWEN_SETUP_GUIDE.md           Detailed guide with troubleshooting
├── 📄 requirements.txt              Python dependencies
├── 📄 .env.example                  Configuration template
│
├── .venv/                           Virtual environment (after setup)
├── images/                          Uploaded images folder
│
└── qwen2vl2b/                       Model weights (~13.5GB)
    ├── model-00001-of-00002.safetensors
    ├── model-00002-of-00002.safetensors
    ├── config.json
    ├── tokenizer.json
    ├── vocab.json
    └── ... (other config files)
```

---

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` for your setup:
```bash
FLASK_PORT=5000                    # Server port
MODEL_DEVICE=auto                  # auto, cuda, cpu, or mps
MODEL_DTYPE=float16                # float16 (GPU) or float32 (CPU)
MAX_PIXELS=1024                    # Max image size
ENABLE_QUANTIZATION=True           # 4-bit quantization
```

### Hardware Presets

**For NVIDIA GPU (fastest):**
```bash
MODEL_DEVICE=cuda
MODEL_DTYPE=float16
ENABLE_QUANTIZATION=True
```

**For Apple Silicon M1/M2/M3:**
```bash
MODEL_DEVICE=mps
MODEL_DTYPE=float16
ENABLE_QUANTIZATION=False
```

**For CPU only:**
```bash
MODEL_DEVICE=cpu
MODEL_DTYPE=float32
ENABLE_QUANTIZATION=False
```

---

## 🎯 Usage

### Start Server

```bash
python server.py
```

Expected output:
```
Loading Qwen2-VL-2B model...
Model loaded successfully on device: cuda
 * Running on http://127.0.0.1:5000
 * WARNING: This is a development server. Do not use it in production.
```

### API Endpoints

#### 1. Status Check
```bash
curl http://localhost:5000/status
```

Response:
```json
{
  "status": "running",
  "model": "Qwen2-VL-2B",
  "device": "cuda",
  "available": true
}
```

#### 2. Generate Caption (Single Image)
```bash
curl -X POST -F "image=@image.jpg" http://localhost:5000/caption
```

Response:
```json
{
  "caption": "A black and white photograph showing...",
  "confidence": 0.92,
  "processing_time": 5.3
}
```

#### 3. Batch Caption Generation
```bash
curl -X POST -F "image=@img1.jpg" -F "image=@img2.jpg" \
  http://localhost:5000/caption_batch
```

#### 4. Health Check
```bash
curl http://localhost:5000/health
```

---

## ⚡ Performance

### Expected Times

| Device | First Request | Subsequent Requests |
|--------|---------------|-------------------|
| NVIDIA GPU (CUDA) | 10-30 sec | 5-15 sec |
| Apple Metal (M1+) | 15-30 sec | 8-20 sec |
| CPU only | 60-120 sec | 30-60 sec |

### Optimization Tips

1. **Enable GPU** if available (5-20x faster)
2. **Use quantization** (4-bit reduces memory 75%)
3. **Batch multiple images** for efficiency
4. **Cache results** for duplicate items
5. **Resize images** to 512x512 for faster processing

---

## 🐛 Troubleshooting

### Common Issues

**"Module not found"**
```bash
# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
.\.venv\Scripts\activate   # Windows
```

**"CUDA out of memory"**
- Model will fall back to CPU (slower but works)
- To force CPU: Edit `.env` → `MODEL_DEVICE=cpu`

**"Port 5000 already in use"**
```bash
python server.py --port 5001
```

**"Model weights not found"**
- Download model (see "Step 2" above)
- Verify: `ls -lh qwen2vl2b/` should show ~13.5GB

**"Slow performance (60+ seconds)"**
- This is CPU-only mode (expected)
- Install NVIDIA drivers/CUDA for GPU acceleration

### More Help

See [QWEN_SETUP_GUIDE.md - Troubleshooting](QWEN_SETUP_GUIDE.md#-troubleshooting)

---

## 📚 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) | Step-by-step setup | 45-90 min |
| [QWEN_SETUP_GUIDE.md](QWEN_SETUP_GUIDE.md) | Detailed guide | 15 min read + time |
| [../QWEN_SETUP.md](../QWEN_SETUP.md) | Quick reference | 2 min |
| [.env.example](.env.example) | Configuration options | 5 min |
| This file (README.md) | Folder overview | 5 min |

---

## 🔐 Requirements

### System
- **Python:** 3.8+ (3.10+ recommended)
- **RAM:** 8GB minimum (16GB+ recommended)
- **Disk:** 20GB free space (for model + cache)
- **GPU:** Optional but recommended for speed

### Python Packages
See [requirements.txt](requirements.txt) for full list:
- torch (2.1.2)
- transformers (4.36.2)
- Flask (3.0.0)
- Pillow (10.1.0)
- numpy, scipy, bitsandbytes, etc.

---

## 🔗 Integration with Main App

The Flask server integrates with the Vue.js frontend:

```javascript
// Example: Generate caption in Vue.js
async generateCaption(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await fetch('http://localhost:5000/caption', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    return data.caption;
  } catch (error) {
    return 'Unable to generate description';
  }
}
```

---

## 📞 Support

### For Setup Issues
→ [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)

### For Details & Troubleshooting
→ [QWEN_SETUP_GUIDE.md](QWEN_SETUP_GUIDE.md)

### For Quick Reference
→ [../QWEN_SETUP.md](../QWEN_SETUP.md)

### For Configuration
→ [.env.example](.env.example)

### External Resources
- **Qwen2VL Model:** https://huggingface.co/Qwen/Qwen2-VL-2B
- **PyTorch:** https://pytorch.org
- **Flask:** https://flask.palletsprojects.com

---

## ✅ Success Criteria

You'll know everything is working when:

- ✅ Server starts: `python server.py` (no errors)
- ✅ Status returns: `curl http://localhost:5000/status` (returns JSON)
- ✅ Caption works: Send image, get description back
- ✅ Performance: Reasonable speed for your hardware
- ✅ Frontend: Can upload images and see captions

---

## 📝 Notes

- **First startup takes 30-60 seconds** (model loading)
- **Keep server running** during development (use separate terminal)
- **GPU optional but recommended** (5-20x faster)
- **Model files required** (13.5GB from Hugging Face)
- **CORS enabled** for frontend access

---

**Version:** 1.0  
**Created:** January 23, 2026  
**Status:** Production Ready  
**Project:** Lost and Found V7
