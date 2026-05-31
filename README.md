# KreditinAja! — MLOps Gradient Boosting Platform

> Platform deteksi kelayakan nasabah dalam mengajukan pinjaman berbasis Machine Learning Operations menggunakan algoritma Gradient Boosting.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![DVC](https://img.shields.io/badge/DVC-Data%20Version%20Control-945DD6)

---

## 📋 Deskripsi

**KreditinAja!** adalah aplikasi web full-stack yang mengintegrasikan kecerdasan buatan dan MLOps pipeline untuk menilai kelayakan kredit nasabah secara instan, adil, dan transparan. Platform ini dibangun sebagai Proyek Berbasis Pembelajaran (PBL) MLOps.

### Fitur Utama
- 🤖 **AI Underwriting** — Prediksi kelayakan kredit menggunakan model Gradient Boosting (LightGBM/XGBoost) dengan akurasi 95.7%
- 💰 **Estimasi Plafon & Cicilan** — Perhitungan plafon kredit dan simulasi angsuran bulanan berbasis model regresi
- 📊 **EDA Dashboard** — Eksplorasi data analitik dari dataset Prosper Loan
- 🔐 **Admin Panel** — Manajemen pengguna dan peminjaman (port terpisah)
- 🌓 **Dark/Light Mode** — Toggle slider untuk mode gelap dan terang
- 🐳 **Dockerized** — Deployment siap pakai dengan Docker Compose

---

## 🏗️ Arsitektur

```
┌─────────────────────────┐    ┌─────────────────────────┐
│    Frontend (Next.js)    │────│    Backend (FastAPI)     │
│    Port: 3000            │    │    Port: 8000            │
│                          │    │                          │
│  • Landing Page          │    │  • /predict endpoint     │
│  • Prediction Form       │    │  • /admin endpoints      │
│  • User Dashboard        │    │  • /eda-stats endpoint   │
│  • Admin Panel (:3001)   │    │  • ML Model Inference    │
└─────────────────────────┘    └─────────────────────────┘
                                         │
                                  ┌──────┴──────┐
                                  │  ML Models   │
                                  │  (.pkl)      │
                                  │              │
                                  │ • Klasifikasi│
                                  │ • Regresi    │
                                  │ • Threshold  │
                                  └──────────────┘
```

---

## 📁 Struktur Folder

```
PDBL-MLOPS/
├── .github/workflows/ci.yml   # CI/CD Pipeline (GitHub Actions)
├── .dvc/                       # DVC configuration
├── Dataset/                    # Dataset (DVC tracked)
├── app/                        # Next.js App Router
│   ├── components/             # Shared components (Header, Footer, ThemeToggle)
│   ├── context/                # React context (Auth)
│   ├── admin/                  # Admin panel
│   ├── predict/                # Prediction page
│   ├── dashboard/              # User dashboard
│   ├── profile/                # User profile
│   ├── login/                  # Login page
│   └── register/               # Register page
├── backend/                    # FastAPI backend
│   ├── Dockerfile              # Backend Docker image
│   ├── requirements.txt        # Python dependencies
│   ├── main.py                 # API server & endpoints
│   ├── predictor.py            # ML model loader & inference
│   ├── schemas.py              # Pydantic schemas
│   └── admin_schemas.py        # Admin schemas
├── Dockerfile                  # Frontend Docker image (multi-stage)
├── docker-compose.yml          # Full-stack orchestration
├── railway.toml                # Railway deployment config (frontend)
├── *.pkl                       # Trained ML model files
└── package.json                # Node.js dependencies
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 20
- **Python** ≥ 3.11
- **Docker** & **Docker Compose** (opsional)

### Development (Lokal)

```bash
# 1. Clone repository
git clone https://github.com/Sony1866/PDBL-MLOPS.git
cd PDBL-MLOPS

# 2. Install frontend dependencies
npm install

# 3. Jalankan frontend
npm run dev              # Port 3000 (User)
npm run dev:admin        # Port 3001 (Admin)

# 4. Jalankan backend (terminal baru)
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Docker

```bash
# Build & jalankan semua services
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## ☁️ Deploy ke Railway

### Langkah 1: Persiapan
1. Buat akun di [railway.app](https://railway.app)
2. Install Railway CLI: `npm install -g @railway/cli`
3. Login: `railway login`

### Langkah 2: Buat Project
```bash
railway init
```

### Langkah 3: Deploy Backend
```bash
# Dari root project
railway service create backend
railway service set --root-directory backend
railway up
```

Set environment variables di Railway Dashboard:
```
PORT=8000
MODEL_DIR=/app/models
```

### Langkah 4: Deploy Frontend
```bash
railway service create frontend
railway up
```

Set environment variables:
```
PORT=3000
NEXT_PUBLIC_API_URL=https://<backend-service-url>.railway.app
```

### Langkah 5: Model Files
Model `.pkl` files sudah termasuk di repository (~7MB total). Mereka akan otomatis ter-copy saat Docker build. Untuk backend, pastikan `MODEL_DIR` environment variable menunjuk ke lokasi model files yang benar.

> **Catatan**: Railway mendukung **monorepo** deployment. Satu repository bisa memiliki beberapa services dengan root directory berbeda.

---

## 🧪 CI/CD Pipeline

Pipeline otomatis berjalan di GitHub Actions saat push/PR ke branch `main`:

1. **Frontend** — Lint & Build (Node.js 20)
2. **Backend** — Verify imports (Python 3.11)
3. **Docker** — Build images (setelah job 1 & 2 berhasil)

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4, Lucide Icons |
| **Backend** | FastAPI, Uvicorn, Pydantic |
| **ML Models** | Scikit-learn, XGBoost, LightGBM, Imbalanced-learn |
| **Data** | Pandas, NumPy, SciPy |
| **MLOps** | DVC, Docker, GitHub Actions |
| **Deployment** | Railway, Docker Compose |

---

## 📜 Lisensi

© 2026 KreditinAja! — Proyek Berbasis Pembelajaran (PBL) MLOps.  
Seluruh hak cipta dilindungi undang-undang.

Dibuat dengan ❤️ oleh Tim PBL MLOPS
