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
from admin_schemas import AdminLoginRequest, AdminLoginResponse, BulkDataRequest, EDAStats
from predictor import Predictor
import uvicorn

# ── Admin credentials ────────────────────────────────────────────────────
ADMIN_EMAIL = "admin@creditsense.ai"
ADMIN_PASSWORD = "admin123"

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
            "docs"        : "http://localhost:8000/docs",
            "health"      : "http://localhost:8000/health",
            "predict"     : "POST http://localhost:8000/predict",
            "admin_login" : "POST http://localhost:8000/admin/login",
            "admin_stats" : "POST http://localhost:8000/admin/stats",
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
# ADMIN ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════

@app.post("/admin/login", response_model=AdminLoginResponse, tags=["Admin"])
def admin_login(data: AdminLoginRequest):
    """Login admin — validasi credential."""
    if data.email == ADMIN_EMAIL and data.password == ADMIN_PASSWORD:
        import time, hashlib
        token = hashlib.sha256(f"admin_{time.time()}".encode()).hexdigest()[:32]
        return AdminLoginResponse(success=True, token=token)
    return AdminLoginResponse(success=False, error="Email atau password admin salah")


@app.post("/admin/stats", response_model=EDAStats, tags=["Admin"])
def admin_stats(data: BulkDataRequest):
    """
    Hitung statistik EDA dari data yang dikirim frontend.
    Frontend mengirim semua users + predictions dari localStorage.
    """
    users = data.users
    predictions = data.predictions

    total_users = len(users)
    total_preds = len(predictions)
    layak = sum(1 for p in predictions if p.get("result") == "LAYAK")
    tidak_layak = total_preds - layak
    approval_rate = round((layak / total_preds * 100), 1) if total_preds > 0 else 0.0
    avg_conf = round(sum(p.get("confidence", 0) for p in predictions) / total_preds, 1) if total_preds > 0 else 0.0

    # Distribusi tujuan pinjaman
    purpose_dist = {}
    credit_dist = {}
    area_dist = {}
    emp_dist = {}
    for p in predictions:
        inp = p.get("inputData", {})
        purpose = inp.get("loanPurpose", "Lainnya")
        purpose_dist[purpose] = purpose_dist.get(purpose, 0) + 1
        credit = inp.get("creditHistory", "Unknown")
        credit_dist[credit] = credit_dist.get(credit, 0) + 1
        area = inp.get("propertyArea", "Unknown")
        area_dist[area] = area_dist.get(area, 0) + 1
        emp = inp.get("employment", "Unknown")
        emp_dist[emp] = emp_dist.get(emp, 0) + 1

    # Loan amount ranges
    ranges = {"$0-1k": 0, "$1k-5k": 0, "$5k-10k": 0, "$10k-25k": 0, "$25k+": 0}
    for p in predictions:
        amt = int(p.get("loanAmount", "0") or "0")
        if amt < 1000: ranges["$0-1k"] += 1
        elif amt < 5000: ranges["$1k-5k"] += 1
        elif amt < 10000: ranges["$5k-10k"] += 1
        elif amt < 25000: ranges["$10k-25k"] += 1
        else: ranges["$25k+"] += 1

    return EDAStats(
        totalUsers=total_users,
        totalPredictions=total_preds,
        layakCount=layak,
        tidakLayakCount=tidak_layak,
        approvalRate=approval_rate,
        avgConfidence=avg_conf,
        loanPurposeDistribution=purpose_dist,
        creditHistoryDistribution=credit_dist,
        propertyAreaDistribution=area_dist,
        employmentDistribution=emp_dist,
        loanAmountRanges=ranges,
    )


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
