"""
admin_schemas.py — Pydantic models untuk Admin API
"""
from pydantic import BaseModel
from typing import Optional, List, Literal


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminLoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    error: Optional[str] = None


class UserInfo(BaseModel):
    id: str
    fullName: str
    email: str
    createdAt: str
    profileCompleted: bool = False
    predictionCount: int = 0


class PredictionInfo(BaseModel):
    id: str
    userId: str
    userName: str
    date: str
    loanAmount: str
    loanTerm: str
    result: Literal["LAYAK", "TIDAK LAYAK"]
    confidence: float
    loanPurpose: str = ""
    creditHistory: str = ""
    plafon: Optional[int] = None
    cicilanPerBulan: Optional[float] = None
    alasanPenolakan: Optional[List[str]] = None


class BulkDataRequest(BaseModel):
    """Data yang dikirim dari frontend (localStorage) ke backend admin"""
    users: List[dict]
    predictions: List[dict]


class EDAStats(BaseModel):
    totalUsers: int = 0
    totalPredictions: int = 0
    layakCount: int = 0
    tidakLayakCount: int = 0
    approvalRate: float = 0.0
    avgConfidence: float = 0.0

    # Distribusi
    loanPurposeDistribution: dict = {}
    creditHistoryDistribution: dict = {}
    propertyAreaDistribution: dict = {}
    employmentDistribution: dict = {}
    resultByPurpose: dict = {}
    loanAmountRanges: dict = {}
    confidenceDistribution: List[dict] = []
    dailyTrend: List[dict] = []
