"""
main.py — FastAPI entry point untuk PDBL-MLOPS Backend
Jalankan: python main.py
Docs    : http://localhost:8000/docs
"""
import sys
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PredictInput, PredictOutput
from predictor import Predictor
import uvicorn

# ── Init FastAPI ──────────────────────────────────────────────────────────
app = FastAPI(
    title="PDBL-MLOPS Loan Prediction API",
    description=(
        "API prediksi kelayakan pinjaman menggunakan dua model ML:\n"
        "1. Klasifikasi (LightGBM/XGBoost) → ACCEPT/REJECT\n"
        "2. Regresi (XGBoost) → Plafon maksimal\n"
        "Terinspirasi dari Prosper Marketplace dataset."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS — izinkan request dari Next.js dev server ────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model sekali saat startup ───────────────────────────────────────
predictor = Predictor()


# ══════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════

@app.get("/", tags=["Info"])
def root():
    """Root endpoint — daftar semua endpoint yang tersedia."""
    return {
        "app"      : "PDBL-MLOPS Loan Prediction API",
        "status"   : "running",
        "endpoints": {
            "docs"   : "http://localhost:8000/docs",
            "health" : "http://localhost:8000/health",
            "predict": "POST http://localhost:8000/predict",
        }
    }


@app.get("/health", tags=["Monitoring"])
def health_check():
    """Cek apakah backend dan model berjalan normal."""
    return {
        "status"        : "ok",
        "models_loaded" : predictor.models_loaded,
        "message"       : (
            "Semua model ready" if predictor.models_loaded
            else "Model belum di-load. Cek file .pkl di root project."
        ),
    }


@app.post("/predict", response_model=PredictOutput, tags=["Prediction"])
def predict(data: PredictInput):
    """
    Prediksi kelayakan pinjaman nasabah.

    **Alur:**
    1. Hitung fitur teknis (DTI, credit score, prosper score) dari input user
    2. Klasifikasi → LAYAK / TIDAK LAYAK
    3. Jika LAYAK → Regresi untuk hitung plafon maksimal
    4. Hitung cicilan anuitas dari nominal yang diajukan

    **Returns:**
    - `result`: "LAYAK" atau "TIDAK LAYAK"
    - `confidence`: tingkat keyakinan model (%)
    - `plafon`: plafon maksimal yang bisa dicairkan (jika LAYAK)
    - `cicilan_per_bulan`: cicilan bulanan (jika LAYAK)
    - `alasan_penolakan`: alasan jika TIDAK LAYAK
    """
    try:
        result = predictor.predict(data)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")


# ══════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 55)
    print("  PDBL-MLOPS Backend API")
    print("=" * 55)
    print("  URL   : http://localhost:8000")
    print("  Docs  : http://localhost:8000/docs")
    print("=" * 55)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
