# Qwen2VL-2B Quick Setup Reference

**For detailed setup instructions, see:**

## 📚 Documentation Files

1. **[qwen2vl2b/SETUP_CHECKLIST.md](qwen2vl2b/SETUP_CHECKLIST.md)** ⭐ START HERE
   - Step-by-step checklist for new computers
   - Estimated time: 45-90 minutes
   - All phases clearly marked with progress tracking

2. **[qwen2vl2b/QWEN_SETUP_GUIDE.md](qwen2vl2b/QWEN_SETUP_GUIDE.md)** 
   - Comprehensive guide with detailed explanations
   - Troubleshooting section
   - Performance tips and optimization

3. **[Installation_CompleteV5.md](Installation_CompleteV5.md)** 
   - Section: "Part 5: Qwen2VL2B AI Model Setup"
   - Integrated with full project setup
   - Hardware requirements and system setup

4. **[qwen2vl2b/requirements.txt](qwen2vl2b/requirements.txt)**
   - Python package dependencies
   - Use: `pip install -r requirements.txt`

---

## ⚡ 5-Minute Quick Start

```bash
# 1. Navigate to qwen2vl2b
cd qwen2vl2b

# 2. Create & activate virtual environment
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# OR: .\.venv\Scripts\activate  # Windows

# 3. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Start server
python server.py
# Keep this terminal open!

# 5. Test (in new terminal)
curl http://localhost:5000/status
```

---

## ⚠️ Critical: Model Weights

**The model (~13.5GB) is NOT included by default!**

Must be in: `qwen2vl2b/qwen2vl2b/` folder

Download from: https://huggingface.co/Qwen/Qwen2-VL-2B

See: [SETUP_CHECKLIST.md - Phase 2B](qwen2vl2b/SETUP_CHECKLIST.md#phase-2b-download-model-weights)

---

## 📋 System Requirements

| Item | Minimum | Recommended |
|------|---------|-------------|
| Python | 3.8+ | 3.10 or 3.11 |
| RAM | 8GB | 16GB+ |
| Disk | 20GB free | 30GB+ SSD |
| GPU | Optional | NVIDIA/Apple M1+ |

---

## 🎯 For New Computer Setup

**Follow in this order:**

1. Read: [SETUP_CHECKLIST.md](qwen2vl2b/SETUP_CHECKLIST.md)
2. Follow each phase with checkboxes
3. Refer to: [QWEN_SETUP_GUIDE.md](qwen2vl2b/QWEN_SETUP_GUIDE.md) for details
4. Troubleshoot with: [QWEN_SETUP_GUIDE.md - Troubleshooting](qwen2vl2b/QWEN_SETUP_GUIDE.md#-troubleshooting)

---

## ✅ Verify Installation

```bash
# All should show ✅ 
python -c "import torch; print('✅ PyTorch')"
python -c "from transformers import Qwen2VLForConditionalGeneration; print('✅ Qwen')"
python -c "from flask import Flask; print('✅ Flask')"
python -c "from PIL import Image; print('✅ Pillow')"
```

---

## 🚀 Running the Full Application

**Terminal 1: Qwen Server**
```bash
cd qwen2vl2b
source .venv/bin/activate
python server.py
```

**Terminal 2: Backend**
```bash
cd backend
npm start
```

**Terminal 3: Frontend**
```bash
npm run serve
```

Then visit: http://localhost:8080

---

## 📞 Need Help?

- **Detailed setup:** [QWEN_SETUP_GUIDE.md](qwen2vl2b/QWEN_SETUP_GUIDE.md#-troubleshooting)
- **Step-by-step:** [SETUP_CHECKLIST.md](qwen2vl2b/SETUP_CHECKLIST.md)
- **Qwen2VL Docs:** https://huggingface.co/Qwen/Qwen2-VL-2B

---

**Last Updated:** January 23, 2026  
**Project:** Lost and Found V7
