# Lost and Found V5 - Complete Installation & Setup Guide ✅

**Version:** V5  
**Last Updated:** December 11, 2025  
**Status:** Ready for Production & Development

---

## 📋 Table of Contents

1. [System Requirements](#-system-requirements)
2. [Database Setup](#-part-1-database-setup)
3. [Environment Configuration](#-part-2-environment-configuration)
4. [Frontend Installation](#-part-3-frontend-installation)
5. [Backend Installation](#-part-4-backend-installation)
6. [Qwen2VL2B Model Setup](#-part-5-qwen2vl2b-ai-model-setup) ⭐ IMPORTANT
7. [Running the Application](#-part-6-running-the-application)
8. [Troubleshooting](#-troubleshooting)

---

## 🖥️ System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **Operating System** | Windows 10+, macOS 10.15+, Ubuntu 18.04+ |
| **Node.js** | v16 LTS or higher |
| **npm** | v8 or higher |
| **Python** | v3.9 or higher |
| **PostgreSQL** | v12 or higher |
| **RAM** | 8GB minimum (16GB+ recommended for ML model) |
| **Disk Space** | 15GB minimum (for node_modules + model weights) |
| **GPU** | Optional but recommended (NVIDIA with CUDA support) |

### Recommended Setup

- **Node.js:** v18 LTS
- **Python:** 3.10 or 3.11
- **PostgreSQL:** v15
- **RAM:** 16GB or more
- **GPU:** NVIDIA RTX 3060 or better
- **SSD Storage:** 20GB+ for best performance

### Prerequisites to Install

1. **Git** - For version control
   - Download: https://git-scm.com/

2. **Node.js + npm** - For frontend and backend
   - Download: https://nodejs.org/ (LTS version)
   - Verify: `node --version` and `npm --version`

3. **Python** - For AI model
   - Download: https://www.python.org/downloads/
   - Verify: `python --version`

4. **PostgreSQL** - For database
   - Download: https://www.postgresql.org/download/
   - Verify: `psql --version`

5. **Visual Studio Code** (Optional but recommended)
   - Download: https://code.visualstudio.com/

---

## 🗄️ Part 1: Database Setup

### Step 1.1: Start PostgreSQL Service

**Windows:**
```bash
# PostgreSQL should start automatically after installation
# If not, start it via Windows Services
```

**macOS:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### Step 1.2: Create Database

#### Option A: Using Command Line (Recommended)

```bash
createdb lostandfound_db
```

#### Option B: Using pgAdmin GUI

1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `lostandfound_db`
4. Owner: `postgres`
5. Click "Save"

### Step 1.3: Run Database Setup Script

The `DATABASE_SETUP_COMPLETE.sql` file contains all necessary tables, migrations, indexes, and default data.

#### Option A: Using pgAdmin

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Select the `lostandfound_db` database
4. Click "Tools" → "Query Tool"
5. Open `DATABASE_SETUP_COMPLETE.sql` file
6. Copy entire content
7. Paste into Query Tool
8. Press **F5** or click "Execute" button
9. Wait for completion (should see success messages)

#### Option B: Using Command Line

```bash
psql -U postgres -d lostandfound_db -f DATABASE_SETUP_COMPLETE.sql
```

### Step 1.4: Verify Database Setup

```bash
psql -U postgres -d lostandfound_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
```

Expected output:
```
         table_name         
-----------------------------
 claims
 items
 matches
 notifications
 office_closures
 office_hours
 pending_registrations
 users
(8 rows)
```

Verify office hours initialized:
```bash
psql -U postgres -d lostandfound_db -c "SELECT day_of_week, opening_time, closing_time, is_open FROM office_hours ORDER BY day_of_week;"
```

Expected: 7 rows (Sunday through Saturday)

---

## 🔧 Part 2: Environment Configuration

### Step 2.1: Create Backend `.env` File

Navigate to the `backend/` directory and create a `.env` file:

**File location:** `backend/.env`

```env
# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/lostandfound_db

# ============================================================================
# SERVER CONFIGURATION
# ============================================================================
PORT=5000
NODE_ENV=development

# ============================================================================
# AUTHENTICATION & SECURITY
# ============================================================================
JWT_SECRET=your_super_secret_jwt_key_with_at_least_32_characters_here_12345
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret_key

# ============================================================================
# EMAIL CONFIGURATION (Gmail with App Password)
# ============================================================================
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password_not_regular_password

# ============================================================================
# FRONTEND CONFIGURATION
# ============================================================================
FRONTEND_URL=http://localhost:5001

# ============================================================================
# QWEN MODEL CONFIGURATION
# ============================================================================
QWEN_MODEL_URL=http://localhost:5000/predict_qwen
QWEN_TIMEOUT=300
```

**⚠️ Important Notes:**

- **DATABASE_URL:** Replace `postgres` and `your_password` with your PostgreSQL credentials
- **JWT_SECRET:** Generate a random 32+ character string (use an online generator or: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- **Google OAuth:**
  - Get from [Google Cloud Console](https://console.cloud.google.com/)
  - Create OAuth 2.0 credentials for Web application
  - Add authorized redirect URI: `http://localhost:5000/auth/callback`
- **Gmail App Password:**
  - Enable 2-Factor Authentication on your Gmail account
  - Generate App Password: https://myaccount.google.com/apppasswords
  - Use this 16-character password, not your regular Gmail password

### Step 2.2: Create Frontend `.env.local` File (Optional)

Create `.env.local` in root directory for frontend environment variables:

**File location:** `.env.local`

```env
VUE_APP_API_URL=http://localhost:5000
VUE_APP_SOCKET_URL=http://localhost:5000
VUE_APP_ENVIRONMENT=development
```

### Step 2.3: Verify Environment Files

Check that files were created:
```bash
# Backend
ls -la backend/.env

# Frontend (optional)
ls -la .env.local
```

Both files should exist before proceeding.

---

## 📦 Part 3: Frontend Installation

### Step 3.1: Install Frontend Dependencies

From the **root directory** of the project:

```bash
npm install
```

This installs all Vue.js and frontend dependencies (~1000+ packages).

**Expected output:**
```
added 1058 packages in 45s
```

### Step 3.2: Verify Frontend Setup

```bash
npm run build
```

Should complete without errors. A `dist/` folder will be created.

**Key Packages Installed:**
- Vue 3 (v3.2.13)
- Vue Router (v4.5.1)
- Pinia (v3.0.4) - State management
- Tailwind CSS (v3.4.13) - Styling
- Axios (v1.12.2) - HTTP client
- Socket.io Client (v4.8.1) - Real-time communication
- QR Code libraries (html5-qrcode, jsqr, vue-qr)
- PDF generation (jsPDF + AutoTable)
- UI Components (lucide-vue-next)
- Image cropping (vue-advanced-cropper)

---

## 🔨 Part 4: Backend Installation

### Step 4.1: Install Backend Dependencies

Navigate to backend directory and install:

```bash
cd backend
npm install
cd ..
```

This installs all Node.js and Express dependencies (~200 packages).

**Expected output:**
```
added 206 packages in 30s
```

### Step 4.2: Test Backend Connection

Start the backend server to verify database connection:

```bash
npm run start:backend
```

**Expected output:**
```
✅ Connected to PostgreSQL database: lostandfound_db
Server running on http://localhost:5000
```

**Successful indicators:**
- ✅ No "connection refused" errors
- ✅ No "database does not exist" errors
- ✅ Server is listening on port 5000

Press `Ctrl+C` to stop the server.

**Key Packages Installed:**
- Express.js (v4.19.2) - Web framework
- PostgreSQL driver - pg (v8.11.3)
- Socket.io (v4.8.1) - Real-time server
- JWT (jsonwebtoken v9.0.2) - Authentication
- Bcrypt (v5.1.1) - Password hashing
- Multer (v2.0.2) - File uploads
- Google Auth (google-auth-library v10.4.0)
- Helmet (v8.1.0) - Security headers
- CORS (v2.8.5) - Cross-origin support
- UUID (v13.0.0) - ID generation

---

## 🤖 Part 5: Qwen2VL2B AI Model Setup ⭐ IMPORTANT

The Qwen2VL2B is a vision-language AI model that generates automatic item descriptions from photos. This is **critical** for the application.

### ⚠️ CRITICAL: Qwen2VL2B Requirements & Pre-Setup Guide

**Before proceeding with this section, ensure you have:**

#### Hardware Requirements for Qwen2VL2B

| Hardware Type | Minimum | Recommended | Performance |
|---------------|---------|-------------|-------------|
| **GPU (NVIDIA)** | NVIDIA GTX 1050 Ti | RTX 3060+ | ⚡ Fast (5-10 sec/image) |
| **GPU (Apple)** | Apple Silicon M1 | M1 Pro/Max | ⚡ Fast (8-15 sec/image) |
| **CPU Only** | Any modern CPU | 8-core+ CPU | 🐢 Slow (30-60 sec/image) |
| **RAM** | 8GB | 16GB+ | Better stability |
| **Disk Space** | 20GB free | 30GB+ free | Model + temps + cache |

#### Software Requirements

```
✅ Python: 3.8, 3.9, 3.10, or 3.11 (3.10 recommended)
✅ CUDA: 11.8 or 12.x (if using NVIDIA GPU)
✅ cuDNN: 8.0+ (if using NVIDIA GPU)
✅ pip: Updated version (pip install --upgrade pip)
```

#### First-Time Setup on New Computer Checklist

- [ ] Python 3.10+ installed
- [ ] NVIDIA CUDA/cuDNN installed (if using NVIDIA GPU)
- [ ] Git cloned from repository
- [ ] Model weights downloaded (13.5GB)
- [ ] Python virtual environment created in `qwen2vl2b/`
- [ ] Dependencies installed via `requirements.txt`
- [ ] Model server started on port 5000
- [ ] Model API tested successfully

### 📥 Important: Downloading Model Weights for New Computers

**⚠️ The model weights (~13.5GB) must be present in `qwen2vl2b/qwen2vl2b/` folder**

When cloning this project on a new computer, the model weights **may not be included** due to file size limitations. Follow these steps:

#### Option A: If Model Weights Are NOT Included (Git LFS or Partial Clone)

1. **Download from Hugging Face Model Hub:**
   ```bash
   cd qwen2vl2b
   
   # Install Git LFS if not already installed
   # Windows: https://git-lfs.com/
   # macOS: brew install git-lfs
   # Linux: sudo apt install git-lfs
   
   git lfs install
   git clone https://huggingface.co/Qwen/Qwen2-VL-2B qwen2vl2b
   ```

   **Time required:** 15-45 minutes (depends on internet speed)

2. **Manual Download Option:**
   - Visit: https://huggingface.co/Qwen/Qwen2-VL-2B
   - Download all model files to `qwen2vl2b/qwen2vl2b/`
   - Ensure these files are present:
     ```
     config.json
     generation_config.json
     model-00001-of-00002.safetensors (8.5 GB)
     model-00002-of-00002.safetensors (5.0 GB)
     model.safetensors.index.json
     preprocessor_config.json
     tokenizer.json
     tokenizer_config.json
     vocab.json
     chat_template.json
     merges.txt
     LICENSE
     ```

#### Option B: If Model Weights ARE Already Included

Verify they're present:
```bash
cd qwen2vl2b/qwen2vl2b
ls -lh  # macOS/Linux
dir     # Windows
```

Should show files totaling ~13.5GB. If files are there, skip download and proceed to Step 5.2.

### Step 5.1: Verify Model Files

The model weights should be pre-downloaded at: `qwen2vl2b/qwen2vl2b/`

**Required files (total ~13.5GB):**

```
qwen2vl2b/
└── qwen2vl2b/
    ├── config.json
    ├── generation_config.json
    ├── model-00001-of-00002.safetensors    (~8.5 GB)
    ├── model-00002-of-00002.safetensors    (~5.0 GB)
    ├── model.safetensors.index.json
    ├── preprocessor_config.json
    ├── tokenizer.json
    ├── tokenizer_config.json
    ├── vocab.json
    ├── chat_template.json
    ├── merges.txt
    └── LICENSE
```

**Verify files exist:**
```bash
cd qwen2vl2b/qwen2vl2b
ls -lh
```

**If files are missing:** Download from [Hugging Face](https://huggingface.co/Qwen/Qwen2-VL-2B)

### Step 5.2: Create Python Virtual Environment

**⚠️ IMPORTANT: Use Python 3.10 or 3.11 for best compatibility**

From the `qwen2vl2b/` directory, create an isolated Python environment:

**Check Python version first:**
```bash
python --version    # Windows/macOS
python3 --version   # Linux
```

Should show 3.10.x, 3.11.x, or 3.12.x. If not, install from https://python.org

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
# You should see (.venv) at the start of your terminal prompt
# Windows example:  (.venv) C:\Users\YourName\...\qwen2vl2b>
# Linux example:    (.venv) user@machine:~/qwen2vl2b$
```

### Step 5.3: Install Python Dependencies from requirements.txt

**Copy and create `requirements.txt` in `qwen2vl2b/` directory if not present:**

The requirements are:
```
torch==2.1.2
transformers==4.36.2
Pillow==10.1.0
Flask==3.0.0
Flask-CORS==4.0.0
numpy==1.24.3
scipy==1.11.4
bitsandbytes==0.42.0
sentencepiece==0.1.99
```

**Install all dependencies at once:**
```bash
# With .venv activated in qwen2vl2b/
pip install --upgrade pip setuptools wheel

pip install -r ../backend/requirements.txt
# OR manually install:
pip install torch transformers Pillow Flask Flask-CORS numpy scipy bitsandbytes sentencepiece
```

**For NVIDIA GPU users (recommended):**
```bash
# Install CUDA-enabled PyTorch for better performance
pip install torch --index-url https://download.pytorch.org/whl/cu118
```

**For Apple Silicon (M1/M2/M3) users:**
```bash
# Optimized for Apple Metal
pip install torch torchvision torchaudio
```

**For CPU-only users:**
```bash
# Standard CPU installation (slower but works)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

**Installation time:** 5-15 minutes (depending on internet speed and hardware)

**Expected output:**
```
Successfully installed torch-... transformers-... Pillow-... Flask-... ...
```

**Key installed packages:**
- **torch** (2.1.2) - PyTorch deep learning framework
- **transformers** (4.36.2) - Hugging Face transformers library for Qwen2VL model
- **Pillow** (10.1.0) - Image processing and manipulation
- **Flask** (3.0.0) - Python web framework for model API
- **Flask-CORS** (4.0.0) - Cross-origin resource sharing support
- **numpy** (1.24.3) - Numerical computing
- **scipy** (1.11.4) - Scientific computing functions
- **bitsandbytes** (0.42.0) - 4-bit quantization optimization for faster inference
- **sentencepiece** (0.1.99) - Tokenizer for Qwen model

### Step 5.4: Test Python Environment

Test that packages are correctly installed (with .venv activated):

```bash
python -c "import torch; print(f'PyTorch version: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}')"
python -c "from transformers import Qwen2VLForConditionalGeneration; print('✅ Qwen model import successful')"
python -c "from flask import Flask; print('✅ Flask import successful')"
python -c "from PIL import Image; print('✅ Pillow import successful')"
```

All four commands should succeed with no errors and show ✅ checkmarks.

**If any command fails:**
- Check that `.venv` is activated
- Run `pip install --upgrade pip` first
- Reinstall the failed package: `pip install --upgrade packagename`

### Step 5.5: Start Qwen Model Server

From the `qwen2vl2b/` directory with `.venv` activated:

**Windows:**
```bash
cd qwen2vl2b
.\.venv\Scripts\activate
python server.py
```

**macOS/Linux:**
```bash
cd qwen2vl2b
source .venv/bin/activate
python server.py
```

**Expected output:**
```
Loading Qwen2-VL-2B model...
-> Detected System: NVIDIA GPU (CUDA)  [or your system type]
Device: cuda  [or cpu/metal]
Loading model weights...
 * Running on http://127.0.0.1:5000
 * WARNING: This is a development server. Do not use it in production.
 * Press CTRL+C to quit
```

**⏳ First startup takes 30-60 seconds** (model loading from disk to memory)
- Subsequent restarts are faster (5-10 seconds)
- If on CPU only: 60-120 seconds first startup, 20-30 seconds after

**Keep this terminal open** - the server must stay running while the application is in use.

**Common Startup Issues:**

| Issue | Solution |
|-------|----------|
| ModuleNotFoundError | Virtual environment not activated, run `source .venv/bin/activate` |
| CUDA out of memory | Model too large for GPU, will fall back to CPU (slower) |
| Port 5000 already in use | Change port: `python server.py --port 5001` |
| Model weights not found | Download model from Hugging Face (Step in Section above) |
| Python version error | Ensure Python 3.10+ is being used in virtual environment |

### Step 5.6: Test Model API (New Terminal)

In another terminal, test that the server is running and responding (with .venv activated in `qwen2vl2b/`):

**Windows (PowerShell):**
```bash
Invoke-WebRequest -Uri "http://localhost:5000/status" -Method GET
```

**Windows (Command Prompt):**
```bash
curl http://localhost:5000/status
```

**macOS/Linux:**
```bash
curl http://localhost:5000/status
```

Should return a JSON response showing server status. Example:
```json
{"status": "running", "model": "Qwen2-VL-2B", "device": "cuda"}
```

### Step 5.7: Full Model Test - Image Captioning

Test actual image caption generation (with .venv activated):

Create a test script `test_qwen_locally.py` in `qwen2vl2b/`:

```python
import torch
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor
from PIL import Image
import os

os.chdir('qwen2vl2b')

print('🔄 Loading Qwen2-VL model...')
processor = AutoProcessor.from_pretrained('./qwen2vl2b')
model = Qwen2VLForConditionalGeneration.from_pretrained(
    './qwen2vl2b', 
    device_map='auto',
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)
print('✅ Model loaded successfully!')

# Create a simple test image
print('🎨 Creating test image...')
test_image = Image.new('RGB', (200, 200), color='blue')

# Test inference
print('🧠 Running inference...')
messages = [
    {'role': 'user', 'content': [
        {'type': 'image', 'image': test_image},
        {'type': 'text', 'text': 'What color is this solid colored square?'}
    ]}
]

text = processor.apply_chat_template(messages, add_generation_prompt=True)
inputs = processor(text=[text], images=[test_image], return_tensors='pt')
inputs = inputs.to('cuda' if torch.cuda.is_available() else 'cpu')

output_ids = model.generate(**inputs, max_new_tokens=128)
result = processor.batch_decode(output_ids, skip_special_tokens=True)[0]

print(f'✅ Model inference successful!')
print(f'Model response: {result[:200]}...')
```

Run it:
```bash
python test_qwen_locally.py
```

Should output model response describing the test image without errors.

**Performance expectations:**
- **NVIDIA GPU:** 5-10 seconds
- **Apple Metal:** 8-15 seconds
- **CPU:** 30-60 seconds

### Step 5.8: Integration with Main Application

The Flask server automatically:
1. Loads the model on startup
2. Creates a `/caption` endpoint for image captioning
3. Handles concurrent requests from the frontend
4. Detects hardware and optimizes accordingly

**To use in your Vue.js frontend:**
```javascript
// File: src/views/YourComponent.vue
async captionImage(imageFile) {
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
    console.error('Caption error:', error);
    return 'Unable to generate description';
  }
}
```

### Step 5.9: Check Hardware Configuration

The model automatically detects your system and optimizes:

```bash
# In Python with .venv activated in qwen2vl2b/
python -c "
import torch
from transformers import Qwen2VLForConditionalGeneration

print('🖥️  System Configuration:')
print(f'PyTorch version: {torch.__version__}')
print(f'CUDA Available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'CUDA Device: {torch.cuda.get_device_name(0)}')
    print(f'CUDA Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB')
print(f'Python device selection: auto (optimized for your hardware)')
"
```

**Auto-detected optimizations:**
- **NVIDIA GPU (CUDA):** 
  - Uses Flash Attention 2
  - 4-bit quantization (bitsandbytes)
  - Device mapping: auto
  - Float16 precision
  - ⚡ Fastest performance

- **Apple Silicon (Metal):** 
  - Metal GPU acceleration
  - Float16 if available
  - Optimized memory usage

- **CPU Only:** 
  - Float32 precision
  - No quantization (stability first)
  - 🐢 Slower but always works

---

## 🚀 Troubleshooting Qwen2VL Setup

### Common Issues & Solutions

#### 1. "ModuleNotFoundError: No module named 'torch'"
```bash
# Solution: Ensure .venv is activated
source .venv/bin/activate  # macOS/Linux
.\.venv\Scripts\activate   # Windows
pip install torch
```

#### 2. "CUDA out of memory"
```bash
# The model will automatically fall back to CPU
# But you can force this by editing server.py
# Change: device_map='auto' to device_map='cpu'
```

#### 3. Port 5000 already in use
```bash
# Use different port
python server.py --port 5001
# Then update frontend to use new port
```

#### 4. Model weights not found
```bash
# Download from Hugging Face
cd qwen2vl2b
git clone https://huggingface.co/Qwen/Qwen2-VL-2B qwen2vl2b
```

#### 5. Slow performance on CPU
This is normal. CPU inference takes 30-60 seconds per image.
Consider:
- Install NVIDIA GPU drivers and CUDA
- Use cloud GPU (Google Colab, Azure ML)
- Pre-generate captions offline

#### 6. "Requirements not met" or Version conflicts
```bash
# Start fresh
deactivate
rm -r .venv  # or rmdir /s .venv on Windows
python -m venv .venv
source .venv/bin/activate  # or .\.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

---

## 🎯 Part 6: Running the Application

### Step 6.1: Startup Checklist

Before running the application, verify all components:

| Component | Command | Status |
|-----------|---------|--------|
| PostgreSQL | `psql -U postgres -c "SELECT 1"` | ✅ Should succeed |
| Database | `psql -U postgres -d lostandfound_db -c "SELECT 1"` | ✅ Should succeed |
| Node.js | `node --version` | ✅ Should show v16+ |
| npm | `npm --version` | ✅ Should show v8+ |
| Python | `python --version` | ✅ Should show v3.9+ |
| Backend `.env` | Check `backend/.env` exists | ✅ Must exist |
| Frontend dependencies | Check `node_modules/` exists | ✅ Must exist |
| Python venv | Check `qwen2vl2b/.venv/` exists | ✅ Must exist |

### Step 6.2: Run All Services (Recommended)

From the **root directory**:

```bash
npm run dev
```

This starts all three services using npm scripts concurrently:

1. **Frontend** - Vue dev server on `http://localhost:5001`
2. **Backend** - Express API on `http://localhost:5000`
3. **AI Model** - Qwen2VL2B on `http://localhost:5000` (Flask)

**Expected output:**
```
> lost-and-found@0.1.0 dev
> concurrently "vue-cli-service serve --port 5001" "cd backend && npm start" "cd qwen2vl2b && .\\.venv\\Scripts\\python.exe server.py"

[0]
[0] App running at:
[0] - Local:   http://localhost:5001/
[0]
[1] ✅ Connected to PostgreSQL database: lostandfound_db
[1] Server running on http://localhost:5000
[2]  * Running on http://127.0.0.1:5000
```

⏳ **Wait 15-30 seconds** for all services to fully start.

Then open your browser: `http://localhost:5001`

### Step 6.3: Access the Application

- **Frontend:** http://localhost:5001
- **Backend API:** http://localhost:5000
- **WebSocket:** ws://localhost:5000

### Step 6.4: Run Individual Services (Alternative)

If you want to start services separately:

**Terminal 1 - Frontend:**
```bash
npm run serve
```

**Terminal 2 - Backend:**
```bash
npm run start:backend
```

**Terminal 3 - AI Model:**
```bash
cd qwen2vl2b
.\.venv\Scripts\activate  # Windows
# or: source .venv/bin/activate  # macOS/Linux
npm run start:model
```

### Step 6.5: Production Build

For production deployment:

```bash
# Build frontend
npm run build

# Start backend (in one terminal)
npm run start:backend

# Start AI model (in another terminal)
cd qwen2vl2b
.\.venv\Scripts\activate
python server.py
```

The frontend will be served from the `dist/` folder.

---

## 🐛 Troubleshooting

### Database Issues

#### Error: "connect ECONNREFUSED 127.0.0.1:5432"
```
Problem: PostgreSQL not running or wrong credentials
Solution:
1. Ensure PostgreSQL service is running
2. Check DATABASE_URL in .env
3. Verify username/password
4. Test: psql -U postgres -d lostandfound_db
```

#### Error: "database 'lostandfound_db' does not exist"
```
Problem: Database not created
Solution:
1. Run: createdb lostandfound_db
2. Run DATABASE_SETUP_COMPLETE.sql
3. Verify: psql -l | grep lostandfound_db
```

#### Error: "relation 'items' does not exist"
```
Problem: Tables not created by SQL script
Solution:
1. Open pgAdmin
2. Connect to lostandfound_db
3. Re-run DATABASE_SETUP_COMPLETE.sql
4. Verify: psql -U postgres -d lostandfound_db -c "\dt"
```

### Backend Issues

#### Error: "EADDRINUSE: address already in use :::5000"
```
Problem: Port 5000 already in use
Solution:
Windows:
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F

macOS/Linux:
  lsof -i :5000
  kill -9 <PID>
```

#### Error: "Cannot find module 'express'"
```
Problem: Dependencies not installed
Solution:
  cd backend
  npm install
  cd ..
```

#### Error: "JWT_SECRET is undefined"
```
Problem: .env file not found or incomplete
Solution:
1. Verify backend/.env exists
2. Check JWT_SECRET is set
3. Restart backend server
```

### Frontend Issues

#### Error: "Cannot find module '@vue/cli-service'"
```
Problem: Frontend dependencies not installed
Solution:
  npm install
```

#### Error: "CORS error" or "localhost:5000 blocked"
```
Problem: Backend CORS not configured
Solution:
1. Check backend is running on port 5000
2. Verify CORS headers in backend
3. Check frontend .env has correct API_URL
```

#### Port 5001 already in use
```
Problem: Another service using port 5001
Solution:
Windows:
  netstat -ano | findstr :5001
  taskkill /PID <PID> /F

macOS/Linux:
  lsof -i :5001
  kill -9 <PID>
```

### Qwen Model Issues

#### Error: "ModuleNotFoundError: No module named 'torch'"
```
Problem: Python dependencies not installed
Solution:
  cd qwen2vl2b
  .\.venv\Scripts\activate  # Windows
  pip install torch transformers Pillow Flask Flask-CORS
```

#### Error: ".venv not found" or "venv not activated"
```
Problem: Virtual environment not created or activated
Solution:
  cd qwen2vl2b
  python -m venv .venv
  .\.venv\Scripts\activate  # Windows
  source .venv/bin/activate  # macOS/Linux
```

#### Error: "Model weights not found"
```
Problem: Qwen model files missing from qwen2vl2b/qwen2vl2b/
Solution:
1. Check if files exist: ls -lh qwen2vl2b/qwen2vl2b/
2. If missing, download from: https://huggingface.co/Qwen/Qwen2-VL-2B
3. Extract to: qwen2vl2b/qwen2vl2b/
```

#### Error: "Timeout waiting for model" or slow inference
```
Problem: Model is slow (normal on CPU)
Solution:
1. First inference is slower (model loading)
2. Subsequent requests are faster
3. GPU greatly improves performance
4. Increase timeout if needed: set QWEN_TIMEOUT=600
```

#### Error: "CUDA out of memory"
```
Problem: GPU memory insufficient
Solution:
1. Check: python -c "import torch; print(torch.cuda.mem_get_info())"
2. Close other GPU-using applications
3. Model uses ~8GB VRAM (can reduce with smaller batch size)
```

#### Model responding with errors in JSON
```
Problem: Model inference failed
Solution:
1. Check image file format (JPEG, PNG supported)
2. Verify image is valid
3. Check server logs for details
4. Try smaller image (model has max resolution)
```

### General Issues

#### Error: "npm ERR! code ERESOLVE"
```
Problem: npm dependency conflict
Solution:
  npm install --legacy-peer-deps
```

#### All services starting but application not loading
```
Problem: Services need more time to start
Solution:
1. Wait full 30 seconds after npm run dev
2. Check each service individually:
   - Frontend: curl http://localhost:5001
   - Backend: curl http://localhost:5000
   - Model: curl http://localhost:5000/predict_qwen
```

#### Changes not reflecting in frontend
```
Problem: Vue dev server cache
Solution:
1. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Restart npm run dev
```

---

## 📊 Application Architecture

```
Lost-and-Found-V5/
│
├── src/                           # Vue.js Frontend (ES6+ modules)
│   ├── components/                # Vue components
│   ├── router/                    # Vue Router configuration
│   ├── stores/                    # Pinia state management
│   ├── views/                     # Page components
│   ├── assets/                    # CSS, images
│   ├── App.vue                    # Root component
│   ├── main.js                    # Entry point
│   ├── socket.js                  # Socket.io configuration
│   └── eventBus.js                # Event bus for communication
│
├── backend/                       # Node.js Express Backend (ESM)
│   ├── routes/                    # API route handlers
│   │   ├── authRoutes.js          # Authentication endpoints
│   │   ├── itemRoutes.js          # Item endpoints
│   │   ├── claimRoutes.js         # Claim endpoints
│   │   ├── profileRoutes.js       # User profile endpoints
│   │   ├── reportRoutes.js        # Item reporting & matching ⭐
│   │   ├── notificationRoutes.js  # Notification endpoints
│   │   └── ...
│   ├── controllers/               # Business logic
│   ├── middleware/                # Authentication & logging
│   ├── services/                  # Email, notifications
│   ├── sql/                       # Database migration scripts
│   ├── scripts/                   # Utility scripts
│   ├── server.js                  # Express server entry point
│   ├── db.js                      # PostgreSQL connection pool
│   └── package.json               # Backend dependencies
│
├── qwen2vl2b/                     # Qwen2VL2B Vision-Language Model
│   ├── server.py                  # Flask API server
│   ├── caption_image.py           # Image caption generation ⭐
│   ├── qwen2vl2b/                 # Model weights (~13.5GB)
│   │   ├── config.json            # Model configuration
│   │   ├── model-00001-of-00002.safetensors
│   │   ├── model-00002-of-00002.safetensors
│   │   ├── tokenizer.json
│   │   └── ... (other model files)
│   ├── images/                    # Uploaded images for processing
│   ├── .venv/                     # Python virtual environment
│   └── requirements.txt           # Python dependencies (implicit)
│
├── public/                        # Static files
│   └── index.html                 # HTML template
│
├── uploads/                       # File uploads
│   ├── items/                     # Item photos
│   └── profile_pictures/          # User avatars
│
├── DATABASE_SETUP_COMPLETE.sql    # Complete database schema
├── DATABASE_SETUP_GUIDE.md        # Database setup instructions
├── INSTALLATION_COMPLETE.md       # Old installation guide
├── Installation_CompleteV5.md     # This file ⭐
├── package.json                   # Frontend dependencies
├── .env.local                     # Frontend environment variables
├── vue.config.js                  # Vue CLI configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── babel.config.js                # Babel transpilation config
├── jsconfig.json                  # JavaScript configuration
├── postcss.config.js              # PostCSS configuration
└── README.md                      # Project README
```

---

## 🔌 Service Communication

```
Frontend (Vue.js)
    ↓ HTTP/WebSocket
Express Backend (Node.js)
    ├─ Database (PostgreSQL)
    └─ AI Model Server (Flask/Python)
        └─ Qwen2VL2B Model
```

### Data Flow: Image Upload Example

1. **User uploads image** in Frontend (Vue.js)
2. **Frontend sends** POST request to `http://localhost:5000/api/items`
3. **Backend receives** and saves image to `uploads/items/`
4. **Backend calls** Qwen API at `http://localhost:5000/predict_qwen`
5. **Flask server** processes image with Qwen2VL2B model
6. **Model generates** JSON with: item_name, color, brand, description
7. **Backend stores** this data in PostgreSQL
8. **Frontend updates** with new item (via WebSocket or polling)

---

## 📈 Performance Optimization

### Frontend Optimization
- ✅ Code splitting enabled
- ✅ Lazy loading routes
- ✅ Tree shaking for unused code
- ✅ Minification in production build
- ✅ Tailwind CSS purging

### Backend Optimization
- ✅ Connection pooling for database
- ✅ Indexing on frequently queried columns
- ✅ Pagination for list endpoints
- ✅ Caching strategies
- ✅ Rate limiting (via Helmet)

### Model Optimization
- ✅ Auto-detects GPU/CPU
- ✅ 4-bit quantization on CUDA
- ✅ Flash Attention 2 on supported GPUs
- ✅ Image resolution optimization
- ✅ Model caching after first load

---

## 🔐 Security Notes

### Environment Variables
- ⚠️ **Never commit `.env` file to git**
- ⚠️ **JWT_SECRET should be random 32+ characters**
- ⚠️ **Keep Google OAuth credentials secret**
- ⚠️ **Gmail App Password, not regular password**

### Database Security
- ✅ SQL injection prevention via parameterized queries
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ CORS configured for known origins

### API Security
- ✅ Helmet headers for protection
- ✅ CORS origin validation
- ✅ Rate limiting on endpoints
- ✅ Input validation on all routes

---

## ✅ Post-Installation Verification

After running `npm run dev`, verify:

### Frontend ✅
```bash
curl http://localhost:5001
# Should return HTML content
```

### Backend ✅
```bash
curl http://localhost:5000/health
# Should return JSON response
```

### Database ✅
```bash
psql -U postgres -d lostandfound_db -c "SELECT COUNT(*) FROM users;"
# Should return: count = 0 (or more if users exist)
```

### AI Model ✅
```bash
curl -X POST -F "file=@test_image.jpg" http://localhost:5000/predict_qwen
# Should return JSON with item description
```

All four checks should succeed.

---

## 🚀 Next Steps

1. ✅ **System Prerequisites** - Installed (Node, Python, PostgreSQL)
2. ✅ **Database Setup** - `lostandfound_db` created and populated
3. ✅ **Backend Configuration** - `.env` file configured with credentials
4. ✅ **Frontend Installation** - All npm packages installed
5. ✅ **Backend Installation** - Express dependencies ready
6. ✅ **Qwen Model Setup** - Python virtual environment and model ready
7. 🔜 **Run Application** - `npm run dev` to start all services
8. 🔜 **Open Browser** - Navigate to `http://localhost:5001`
9. 🔜 **Login/Register** - Create user account
10. 🔜 **Test Features** - Report lost items, test AI caption generation

---

## 📞 Quick Reference

### Essential Commands

| Action | Command |
|--------|---------|
| Start all services | `npm run dev` |
| Start frontend | `npm run serve` |
| Start backend | `npm run start:backend` |
| Start AI model | `npm run start:model` |
| Build frontend | `npm run build` |
| Create database | `createdb lostandfound_db` |
| Setup database | `psql -U postgres -d lostandfound_db -f DATABASE_SETUP_COMPLETE.sql` |
| Create Python venv | `python -m venv .venv` |
| Activate venv (Windows) | `.\.venv\Scripts\activate` |
| Activate venv (Unix) | `source .venv/bin/activate` |
| Install Python packages | `pip install torch transformers Pillow Flask Flask-CORS` |

### Service URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:5001 | 5001 |
| Backend API | http://localhost:5000 | 5000 |
| WebSocket | ws://localhost:5000 | 5000 |
| AI Model | http://localhost:5000/predict_qwen | 5000 |

### Environment Files

| File | Location | Required |
|------|----------|----------|
| Backend config | `backend/.env` | ✅ Yes |
| Frontend config | `.env.local` | ⚠️ Optional |
| Database setup | `DATABASE_SETUP_COMPLETE.sql` | ✅ Yes |

---

## 📄 Important Reminders

- **First time:** Full startup takes 30-60 seconds
- **Model inference:** First image takes ~30s (model loading), subsequent images faster
- **GPU support:** Greatly improves model performance (20-30s → 3-5s per image)
- **Virtual environment:** Must be activated to run Python/Qwen model
- **Database:** Must be running and `lostandfound_db` must exist
- **Port conflicts:** Check 5000 and 5001 are available
- **Environment variables:** Both `.env` files must be correctly configured

---

## 📚 Additional Resources

- **Vue.js Documentation:** https://vuejs.org/
- **Express.js Documentation:** https://expressjs.com/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Qwen2VL Model:** https://huggingface.co/Qwen/Qwen2-VL-2B
- **Socket.io Documentation:** https://socket.io/docs/
- **Tailwind CSS:** https://tailwindcss.com/

---

**Installation Guide V5** ✅  
**Last Updated:** December 11, 2025  
**Version:** 2.0  
**Status:** Complete and Ready for Production
