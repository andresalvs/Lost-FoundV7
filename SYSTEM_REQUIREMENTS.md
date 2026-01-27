# Lost and Found V7 - System Requirements

**Project Version:** 0.1.0  
**Last Updated:** January 23, 2026  
**Status:** Production Ready

---

## 🖥️ Operating System Requirements

| OS | Minimum | Recommended |
|----|---------|-------------|
| **Windows** | Windows 10 (Build 1909+) | Windows 11 |
| **macOS** | macOS 10.15 Catalina | macOS 13+ |
| **Linux** | Ubuntu 18.04 LTS | Ubuntu 22.04 LTS |

---

## 📦 Core Runtime Requirements

### Node.js & npm (Frontend & Backend)
```
Node.js:    v16.x LTS or higher (v18+ recommended)
npm:        v8.0.0 or higher (v9+ recommended)
```

**Download:** https://nodejs.org/

**Verify:**
```bash
node --version    # Should be v16+
npm --version     # Should be v8+
```

### Python (Qwen2VL AI Model)
```
Python:     3.8, 3.9, 3.10, 3.11, 3.12 (3.10+ recommended)
pip:        Latest version (run: pip install --upgrade pip)
```

**Download:** https://python.org/

**Verify:**
```bash
python --version  # Should be 3.8+
pip --version     # Latest version
```

### PostgreSQL (Database)
```
PostgreSQL: v12 or higher (v14+ recommended)
psql CLI:   Included with PostgreSQL
```

**Download:** https://postgresql.org/download/

**Verify:**
```bash
psql --version    # Should be v12+
```

---

## 💾 Disk Space Requirements

| Component | Space Required | Notes |
|-----------|-----------------|-------|
| **Project source** | 500 MB | Repository clone |
| **Frontend node_modules** | 1.2 GB | npm dependencies |
| **Backend node_modules** | 300 MB | Express/Node packages |
| **Qwen2VL model weights** | 13.5 GB | AI model (required) |
| **Python venv** | 500 MB | Virtual environment |
| **PostgreSQL database** | 100 MB+ | Data storage |
| **Uploaded files cache** | 500 MB+ | Images/uploads |
| **Logs & temp files** | 100 MB | Runtime data |
| **TOTAL** | **~16 GB** | **Minimum ~20 GB free** |

**Recommendation:** 25GB+ SSD space for comfortable operation

---

## 🧠 Memory Requirements

| Component | Minimum | Recommended | Peak |
|-----------|---------|-------------|------|
| **Frontend Dev** | 2 GB | 4 GB | 6 GB |
| **Backend (Node.js)** | 512 MB | 1 GB | 2 GB |
| **Qwen2VL Model** | 6 GB | 10+ GB | 12 GB |
| **PostgreSQL** | 512 MB | 2 GB | 4 GB |
| **OS & System** | 2 GB | 4 GB | 6 GB |
| **TOTAL** | **8 GB** | **16+ GB** | **24+ GB** |

---

## 🚀 GPU Support (Optional but Recommended)

### NVIDIA GPU (Fastest)
```
Requirements:
- NVIDIA GPU with CUDA compute capability 3.5+
- RTX 2060 or better recommended
- NVIDIA Driver: Latest version
- CUDA Toolkit: 11.8 or 12.x
- cuDNN: 8.0+

Performance: 5-10 seconds per image

Install from:
- NVIDIA Drivers: https://nvidia.com/Download/driverDetails.aspx
- CUDA Toolkit: https://developer.nvidia.com/cuda-downloads
- cuDNN: https://developer.nvidia.com/cudnn
```

### Apple Silicon (M1/M2/M3 Mac)
```
Requirements:
- Apple Silicon processor (M1, M1 Pro, M1 Max, M2, M3, etc.)
- macOS 12.0+
- Xcode Command Line Tools

Performance: 8-15 seconds per image

Install:
xcode-select --install
```

### CPU Only
```
Requirements:
- Any modern processor (Intel/AMD x86-64)
- No additional drivers needed

Performance: 30-60 seconds per image
```

---

## 📋 Detailed Dependencies

### Frontend (Vue.js 3)

```json
Core:
- vue: ^3.2.13
- vue-router: ^4.5.1
- pinia: ^3.0.4

UI & Components:
- lucide-vue-next: ^0.540.0
- vue-advanced-cropper: ^2.8.9
- tailwindcss: ^3.4.13

Utilities:
- axios: ^1.12.2
- fuse.js: ^7.1.0
- jspdf: ^3.0.3
- jspdf-autotable: ^5.0.2
- mitt: ^3.0.1

QR Code:
- html5-qrcode: ^2.3.8
- jsqr: ^1.4.0
- vue-qr: ^4.0.9

Authentication:
- jwt-decode: ^4.0.0

Database:
- @supabase/supabase-js: ^2.58.0

Real-time Communication:
- socket.io-client: ^4.8.1

Dev Dependencies:
- @vue/cli-service: ~5.0.0
- @vue/cli-plugin-babel: ~5.0.0
- @vue/cli-plugin-eslint: ~5.0.0
- eslint: ^7.32.0
- eslint-plugin-vue: ^8.0.3
- concurrently: ^9.2.1
- autoprefixer: ^10.4.21
- postcss: ^8.5.6
```

### Backend (Express.js)

```json
Core Framework:
- express: ^4.19.2

Database:
- pg: ^8.11.3

Authentication & Security:
- bcrypt: ^5.1.1
- jsonwebtoken: ^9.0.2
- helmet: ^8.1.0

Google Integration:
- google-auth-library: ^10.4.0
- googleapis: ^165.0.0

File Upload:
- multer: ^2.0.2

Utilities:
- cors: ^2.8.5
- dotenv: ^16.4.5
- uuid: ^13.0.0

Real-time Communication:
- socket.io: ^4.8.1
```

### Python (Qwen2VL AI Model)

```
Core ML:
- torch: 2.1.2
- transformers: 4.36.2

Image Processing:
- Pillow: 10.1.0

Web Framework:
- Flask: 3.0.0
- Flask-CORS: 4.0.0

Scientific Computing:
- numpy: 1.24.3
- scipy: 1.11.4

Model Optimization:
- bitsandbytes: 0.42.0
- sentencepiece: 0.1.99

See: qwen2vl2b/requirements.txt for full details
```

---

## 🔗 External Services

### Database
- **PostgreSQL Server:** v12+
- **Database Name:** lostandfound_db
- **Connection:** localhost:5432 (default)

### Email Service (Optional)
- **SMTP Server:** For sending notifications
- **Port:** 587 (TLS) or 465 (SSL)
- **Provider Examples:** Gmail, SendGrid, AWS SES

### Google OAuth (Optional)
- **Google Cloud Project:** For OAuth integration
- **OAuth 2.0 Client ID:** Required
- **Authorized JavaScript origins:** http://localhost:5001, http://localhost:8080

---

## 🌐 Port Requirements

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Frontend Dev Server | 5001 | HTTP | Vue.js dev server |
| Backend API | 3000 | HTTP | Express.js server |
| Qwen2VL Model | 5000 | HTTP | AI model Flask server |
| PostgreSQL | 5432 | TCP | Database |
| WebSocket | 3000 | WS | Real-time updates |

**Ensure these ports are available and not blocked by firewall.**

---

## 🔐 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/lostandfound_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5001
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend (.env.local)
```
VUE_APP_API_URL=http://localhost:3000
VUE_APP_MODEL_URL=http://localhost:5000
VUE_APP_SUPABASE_URL=your-supabase-url
VUE_APP_SUPABASE_KEY=your-supabase-key
```

### Qwen2VL (.env)
```
FLASK_PORT=5000
MODEL_DEVICE=auto
MODEL_DTYPE=float16
MAX_PIXELS=1024
ENABLE_QUANTIZATION=True
```

---

## ✅ Pre-Installation Checklist

### System Check
- [ ] Operating System: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- [ ] Disk Space: 25GB+ free
- [ ] RAM: 16GB+ (8GB minimum)
- [ ] Stable internet connection (for dependencies)

### Software Check
- [ ] Node.js: v16+ installed
- [ ] npm: v8+ installed
- [ ] Python: 3.10+ installed
- [ ] PostgreSQL: v12+ installed
- [ ] Git: Installed for cloning

### Network Check
- [ ] Ports 5001, 3000, 5000, 5432 are available
- [ ] Firewall allows local connections
- [ ] No VPN blocking local ports

### GPU (Optional)
- [ ] NVIDIA: Driver + CUDA installed (for GPU acceleration)
- [ ] Apple: Xcode Command Line Tools installed
- [ ] CPU-only setup is fine (will be slower)

---

## 📖 Setup Instructions

### Quick Setup
```bash
# 1. Clone project
git clone <repository-url>
cd Lost-and-Found-V7

# 2. Install frontend
npm install

# 3. Install backend
cd backend && npm install && cd ..

# 4. Setup Qwen2VL (Python)
cd qwen2vl2b
python -m venv .venv
source .venv/bin/activate  # macOS/Linux or .\.venv\Scripts\activate
pip install -r requirements.txt

# 5. Start all services
npm run dev  # Or npm run serve
```

### Detailed Setup
See: [Installation_CompleteV5.md](../Installation_CompleteV5.md)

---

## 🔄 Runtime Services

All three services must run together:

```bash
# Terminal 1: Frontend + Backend
npm run dev

# Terminal 2: Python Model (if not included in dev)
cd qwen2vl2b && python server.py
```

Or individually:
```bash
# Terminal 1: Frontend
npm run serve

# Terminal 2: Backend
cd backend && npm start

# Terminal 3: Qwen Model
cd qwen2vl2b && python server.py
```

---

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Find process using port
lsof -i :3000        # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>        # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### "npm command not found"
```bash
# Install Node.js from https://nodejs.org/
# Or reinstall npm globally
npm install -g npm@latest
```

### "Python module not found"
```bash
# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
.\.venv\Scripts\activate   # Windows

# Reinstall requirements
pip install -r requirements.txt
```

### "Database connection refused"
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Or restart PostgreSQL
# Windows: Services app → PostgreSQL → Restart
# macOS: brew services restart postgresql
# Linux: sudo systemctl restart postgresql
```

---

## 📚 Additional Resources

### Documentation
- [Installation_CompleteV5.md](../Installation_CompleteV5.md) - Complete setup guide
- [QWEN_SETUP.md](../QWEN_SETUP.md) - AI model setup
- [README.md](../README.md) - Project overview

### Official Sites
- Node.js: https://nodejs.org/
- Python: https://python.org/
- PostgreSQL: https://postgresql.org/
- Vue.js: https://vuejs.org/
- Express: https://expressjs.com/

### External Services
- Supabase: https://supabase.io/
- Google Cloud: https://cloud.google.com/
- Gmail API: https://developers.google.com/gmail/

---

## 📞 Support

### Issues with Setup?
See [Installation_CompleteV5.md - Troubleshooting](../Installation_CompleteV5.md#troubleshooting)

### Issues with Qwen2VL?
See [QWEN_SETUP.md](../QWEN_SETUP.md)

### Git Issues?
See [Git Setup Guide](https://git-scm.com/book/en/v2)

---

**Version:** 1.0  
**Created:** January 23, 2026  
**Project:** Lost and Found V7  
**Status:** Complete
