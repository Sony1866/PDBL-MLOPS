from pydantic import BaseModel
from typing import Optional, List, Literal


class PredictInput(BaseModel):
    # ── Data Profil User (auto-fill dari AuthContext) ──
    age: str = ""
    gender: str = ""
    maritalStatus: str = ""
    dependents: str = "0"
    education: str = ""
    employment: str = ""
    monthlyIncome: str = "0"
    additionalIncome: str = "0"

    # ── Data Pinjaman (diisi user di form) ──
    loanAmount: str = "0"
    loanTerm: str = "36"
    interestRate: str = "0"
    loanPurpose: str = "Lainnya"
    propertyArea: str = "Urban"
    creditHistory: str = "Baik"        # Default: Baik (tidak ditampilkan di form)
    coApplicantIncome: str = "0"        # Default: 0 (tidak ditampilkan di form)
    existingInstallments: str = "0"
    
    # ── Sandbox Simulation ──
    nikProfile: Optional[str] = "3171-JUNA"
    
    # ── Data Kontak User (diisi otomatis oleh frontend dari profil) ──
    fullName: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""


class PredictOutput(BaseModel):
    """
    Response dari endpoint /predict
    """
    result: Literal["LAYAK", "TIDAK LAYAK"]
    confidence: float                        # persentase 0–100

    # ── Jika LAYAK ──
    plafon: Optional[int] = None             # plafon maksimal dari model regresi
    bunga_persen: Optional[str] = None       # "15%"
    bunga_rate: Optional[float] = None       # 0.15
    cicilan_per_bulan: Optional[float] = None
    total_bunga: Optional[float] = None
    total_bayar: Optional[float] = None
    sisa_plafon: Optional[float] = None
    catatan_risiko: Optional[str] = None
    nominal_dicairkan: Optional[int] = None

    # ── Jika TIDAK LAYAK ──
    alasan_penolakan: Optional[List[str]] = None