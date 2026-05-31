"""
predictor.py — Adaptasi dari coba final pbl.py untuk FastAPI
Alur: Klasifikasi (ACCEPT/REJECT) → Regresi (plafon) → Hitung cicilan
"""
import os
import sys
import numpy as np
import pandas as pd
import joblib
from schemas import PredictInput, PredictOutput

# Fix encoding untuk Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# ── Path ke file .pkl (berada di root project, satu level di atas backend/) ──
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_KLAS = os.path.join(BASE_DIR, "model_tuned_final.pkl")
MODEL_THR  = os.path.join(BASE_DIR, "threshold_tuned.pkl")
MODEL_REG  = os.path.join(BASE_DIR, "best_model_regresi2.pkl")


# ══════════════════════════════════════════════════════════════════════════
# MAPPING HELPER — konversi field frontend ke format model
# ══════════════════════════════════════════════════════════════════════════

EMPLOYMENT_MAP = {
    "PNS"              : "Employed",
    "Karyawan Swasta"  : "Employed",
    "Wiraswasta"       : "Self-employed",
    "Freelancer"       : "Self-employed",
    "Tidak Bekerja"    : "Not employed",
    "Ibu Rumah Tangga" : "Not employed",
    "Mahasiswa"        : "Not employed",
}

OCCUPATION_MAP = {
    "PNS"              : "Government",
    "Karyawan Swasta"  : "Professional",
    "Wiraswasta"       : "Self Employed",
    "Freelancer"       : "Other",
    "Tidak Bekerja"    : "Other",
    "Ibu Rumah Tangga" : "Homemaker",
    "Mahasiswa"        : "Student",
}

LOAN_PURPOSE_MAP = {
    "Modal Usaha"    : 3,   # Business
    "Pendidikan"     : 5,   # Student Use
    "Renovasi Rumah" : 2,   # Home Improvement
    "Kendaraan"      : 7,   # Auto
    "Kesehatan"      : 11,  # Medical/Dental
    "Lainnya"        : 0,   # Other
}

AREA_STATE_MAP = {
    "Urban"     : "CA",
    "Semiurban" : "TX",
    "Rural"     : "GA",
}

CREDIT_HISTORY_MAP = {
    # (tunggakan_saat_ini, tunggakan_7tahun, catatan_buruk)
    "Baik"          : (0, 0, 0),
    "Cukup"         : (0, 2, 0),
    "Buruk"         : (2, 5, 1),
    "Belum Pernah"  : (0, 0, 0),
}


# ══════════════════════════════════════════════════════════════════════════
# PREDICTOR CLASS
# ══════════════════════════════════════════════════════════════════════════

class Predictor:
    def __init__(self):
        self.models_loaded = False
        self._load_models()

    def _load_models(self):
        """Load semua model .pkl saat startup."""
        try:
            self.pipe_klasifikasi = joblib.load(MODEL_KLAS)
            self.threshold        = joblib.load(MODEL_THR)
            self.model_regresi    = joblib.load(MODEL_REG)
            self.models_loaded    = True
            print("[OK] Semua model berhasil di-load")
            print(f"     Threshold klasifikasi : {self.threshold:.4f}")
        except FileNotFoundError as e:
            print(f"[ERROR] Model tidak ditemukan: {e}")
            print(f"        Pastikan file .pkl ada di: {BASE_DIR}")
            self.models_loaded = False

    # ------------------------------------------------------------------
    # PUBLIC METHOD
    # ------------------------------------------------------------------
    def predict(self, data: PredictInput) -> PredictOutput:
        if not self.models_loaded:
            raise RuntimeError(
                "Model belum di-load. Pastikan file .pkl ada di root project."
            )

        # ── A. Parse & mapping input ──────────────────────────────────
        input_user = self._map_input(data)

        # ── B. Hitung fitur teknis (sama seperti coba final pbl.py) ──
        gaji       = input_user["gaji_bulanan"]
        hutang     = input_user["hutang_saat_ini"]
        sisa_limit = input_user["sisa_limit_kartu_kredit"]

        dti = hutang / gaji if gaji > 0 else 0.99

        # Estimasi credit score berbasis riwayat kredit, status pekerjaan, dan kapasitas pendapatan
        credit_history_status = input_user["credit_history_status"]
        if credit_history_status == "Buruk":
            base_score = 520
        elif credit_history_status == "Cukup":
            base_score = 610
        elif credit_history_status == "Belum Pernah":
            base_score = 590
        else: # "Baik"
            base_score = 700

        # Penyesuaian kepemilikan rumah & DTI
        if input_user["punya_rumah"] and dti < 0.30:
            base_score += 40
        elif dti < 0.40:
            base_score += 20
        elif dti >= 0.60:
            base_score -= 50

        # Pembatasan (Cap) kelayakan jika gaji bulanan tidak realistis (< $200) atau kecil (< $1,000)
        # Gaji $20/bulan sangat tidak realistis di AS dan dianggap berisiko tinggi (out-of-distribution)
        if gaji < 200:
            base_score = min(base_score, 520)
        elif gaji < 1000:
            base_score = min(base_score, 600)

        # Penyesuaian berdasarkan status pekerjaan
        if input_user["status_pekerjaan"] == "Not employed":
            base_score = min(base_score, 540)
        elif input_user["status_pekerjaan"] == "Self-employed" and gaji < 1000:
            base_score = min(base_score, 580)
        elif data.employment == "Mahasiswa":
            base_score = min(base_score, 600)

        credit_score = max(520, min(850, base_score))

        # Prosper score & rating disesuaikan agar berkorelasi kuat dengan credit_score, gaji, dan DTI
        if credit_score >= 720 and dti < 0.30 and gaji >= 2000:
            prosper_score, prosper_rating_num, prosper_rating_alpha = 9, 6, "A"
        elif credit_score >= 660 and dti < 0.40 and gaji >= 1000:
            prosper_score, prosper_rating_num, prosper_rating_alpha = 7, 4, "B"
        elif credit_score >= 600 and gaji >= 500:
            prosper_score, prosper_rating_num, prosper_rating_alpha = 5, 3, "C"
        else:
            prosper_score, prosper_rating_num, prosper_rating_alpha = 3, 2, "D"

        total_limit    = sisa_limit + hutang
        bankcard_util  = min(hutang / total_limit, 1.0) if total_limit > 0 else 0.0
        cicilan_kartu  = input_user["cicilan_bulanan_kartu"]
        revolving_util = min((cicilan_kartu * 12) / (gaji * 12 + 1), 2.0)
        jumlah_cl      = input_user["jumlah_credit_line"]
        income_per_cl  = gaji / (jumlah_cl + 1)
        tunggakan_ini  = input_user["tunggakan_saat_ini"]
        tunggakan_7    = input_user["tunggakan_7tahun"]
        catatan_buruk  = input_user["catatan_buruk"]
        delinq_comp    = tunggakan_ini * 3 + tunggakan_7 + catatan_buruk * 2

        if gaji < 1667:
            income_range = "$1-24,999"
        elif gaji < 4167:
            income_range = "$25,000-49,999"
        elif gaji < 8333:
            income_range = "$50,000-74,999"
        else:
            income_range = "$75,000+"

        tenor = input_user["tenor_bulan"]
        if tenor <= 12:
            bunga = 0.08
        elif tenor <= 36:
            bunga = 0.15
        else:
            bunga = 0.22

        # ── C. STEP 1 — KLASIFIKASI ───────────────────────────────────
        data_klas = {
            "CreditScoreRangeLower"             : credit_score,
            "DebtToIncomeRatio"                 : round(dti, 4),
            "ProsperScore"                      : prosper_score,
            "ProsperRating (numeric)"           : prosper_rating_num,
            "ProsperRating (Alpha)"             : prosper_rating_alpha,
            "BankcardUtilization"               : round(bankcard_util, 4),
            "IncomeRange"                       : income_range,
            "revolving_util"                    : round(revolving_util, 4),
            "income_per_credit_line"            : round(income_per_cl, 4),
            "delinq_composite"                  : delinq_comp,
            "StatedMonthlyIncome"               : gaji,
            "EmploymentStatus"                  : input_user["status_pekerjaan"],
            "IsBorrowerHomeowner"               : input_user["punya_rumah"],
            "AvailableBankcardCredit"           : sisa_limit,
            "OpenRevolvingMonthlyPayment"       : cicilan_kartu,
            "TotalCreditLinespast7years"        : input_user["riwayat_kredit_tahun"] * 2,
            "CurrentCreditLines"                : jumlah_cl,
            "OpenRevolvingAccounts"             : max(1, jumlah_cl - 1),
            "CurrentDelinquencies"              : tunggakan_ini,
            "DelinquenciesLast7Years"           : tunggakan_7,
            "TotalInquiries"                    : input_user["jumlah_pengajuan_kredit"],
            "InquiriesLast6Months"              : min(input_user["jumlah_pengajuan_kredit"], 3),
            "EmploymentStatusDuration"          : input_user["lama_kerja_bulan"],
            "RevolvingCreditBalance"            : hutang,
            "TradesNeverDelinquent (percentage)": 1.0 if tunggakan_7 == 0 else 0.7,
            "ListingCategory (numeric)"         : input_user["tujuan_pinjaman"],
            "BorrowerState"                     : input_user["borrower_state"],
            "Occupation"                        : input_user["occupation"],
        }

        df_klas = pd.DataFrame([data_klas])
        proba   = float(self.pipe_klasifikasi.predict_proba(df_klas)[0, 1])
        is_accept = proba >= self.threshold

        # Guardrail Bisnis Tambahan: Pendapatan minimal bulanan (OJK / Bank Standard)
        if gaji < 300:
            is_accept = False

        # ── D. REJECT ─────────────────────────────────────────────────
        if not is_accept:
            alasan = []
            if gaji < 300:
                alasan.append(f"Pendapatan bulanan (${gaji:,.0f} USD) belum memenuhi batas minimum persyaratan ($300 USD)")
            if dti > 0.50:
                alasan.append(f"Rasio hutang terlalu tinggi ({dti:.0%})")
            if credit_score < 600:
                alasan.append(f"Skor kredit rendah ({credit_score})")
            if tunggakan_ini > 0:
                alasan.append(f"Memiliki {tunggakan_ini} tunggakan aktif")
            if not alasan:
                alasan.append("Profil kredit tidak memenuhi kriteria minimum")

            confidence = round((1 - proba) * 100, 1)
            return PredictOutput(
                result="TIDAK LAYAK",
                confidence=confidence,
                alasan_penolakan=alasan,
            )

        # ── E. STEP 2 — REGRESI (plafon) ─────────────────────────────
        # Hitung fitur-fitur baru (V3)
        net_monthly_cap = max(0.0, gaji * (0.43 - min(dti, 0.43)))
        cs_mid          = (credit_score + (credit_score + 19)) / 2
        tot_debt_month  = gaji * min(dti, 1.0)
        delinq_comp     = tunggakan_ini * 3 + tunggakan_7 * 1 + catatan_buruk * 2
        rev_pressure    = cicilan_kartu / (gaji + 1)
        inq_density     = min(input_user["jumlah_pengajuan_kredit"], 3) / max(1.0, float(input_user["riwayat_kredit_tahun"] * 2))
        inc_per_cl      = gaji / max(1.0, float(jumlah_cl))
        avail_cred_rat  = sisa_limit / (sisa_limit + hutang + 1)
        
        # Penuhi kolom pre-loan yang wajib
        emp_duration    = float(input_user["lama_kerja_bulan"])
        borrower_state  = input_user["borrower_state"]
        amt_delinquent  = 0.0 # Default pre-loan
        pub_rec_12m     = min(catatan_buruk, 1.0)
        trades_opened_6m = 0.0

        data_reg = {
            "Term"                               : tenor,
            "ListingCategory (numeric)"          : input_user["tujuan_pinjaman"],
            "ProsperScore"                       : prosper_score,
            "ProsperRating (numeric)"            : prosper_rating_num,
            "EmploymentStatus"                   : input_user["status_pekerjaan"],
            "IsBorrowerHomeowner"                : int(input_user["punya_rumah"]),
            "Occupation"                         : input_user["occupation"],
            "EmploymentStatusDuration"           : emp_duration,
            "BorrowerState"                      : borrower_state,
            "StatedMonthlyIncome"                : gaji,
            "IncomeVerifiable"                   : 1,
            "DebtToIncomeRatio"                  : round(dti, 4),
            "IncomeRange"                        : income_range,
            "CreditScoreRangeLower"              : credit_score,
            "CreditScoreRangeUpper"              : credit_score + 19,
            "TotalCreditLinespast7years"         : input_user["riwayat_kredit_tahun"] * 2,
            "OpenCreditLines"                    : jumlah_cl,
            "CurrentCreditLines"                 : jumlah_cl,
            "TotalTrades"                        : input_user["riwayat_kredit_tahun"] * 2,
            "TradesNeverDelinquent (percentage)" : 1.0 if tunggakan_7 == 0 else 0.7,
            "BankcardUtilization"                : round(bankcard_util, 4),
            "AvailableBankcardCredit"            : sisa_limit,
            "RevolvingCreditBalance"             : hutang,
            "OpenRevolvingAccounts"              : max(1, jumlah_cl - 1),
            "OpenRevolvingMonthlyPayment"        : cicilan_kartu,
            "InquiriesLast6Months"               : min(input_user["jumlah_pengajuan_kredit"], 3),
            "TotalInquiries"                     : input_user["jumlah_pengajuan_kredit"],
            "CurrentDelinquencies"               : tunggakan_ini,
            "AmountDelinquent"                   : amt_delinquent,
            "DelinquenciesLast7Years"            : tunggakan_7,
            "PublicRecordsLast10Years"           : catatan_buruk,
            "PublicRecordsLast12Months"          : pub_rec_12m,
            "TradesOpenedLast6Months"            : trades_opened_6m,
            "net_monthly_capacity"               : round(net_monthly_cap, 4),
            "credit_score_mid"                   : round(cs_mid, 4),
            "total_debt_monthly"                 : round(tot_debt_month, 4),
            "delinq_composite"                   : delinq_comp,
            "revolving_pressure"                 : round(rev_pressure, 4),
            "inquiry_density"                    : round(inq_density, 4),
            "income_per_credit_line"             : round(inc_per_cl, 4),
            "available_credit_ratio"             : round(avail_cred_rat, 4),
        }

        df_reg   = pd.DataFrame([data_reg])
        plafon   = int(np.round(self.model_regresi.predict(df_reg)[0]))
        # Clip plafon ke batas aman sistem [PLAFON_MIN, PLAFON_MAX] ($1,000 - $35,000)
        plafon   = max(1000, min(35000, plafon))
        nominal  = input_user["nominal_dicairkan"]

        # Kredivo Style Rule: Jika nominal pinjaman yang diminta melebihi plafon limit, maka transaksi REJECT!
        if nominal > plafon:
            return PredictOutput(
                result="TIDAK LAYAK",
                confidence=95.0,
                alasan_penolakan=[
                    f"Nominal pengajuan (${nominal:,.0f} USD) melebihi limit kredit maksimal Anda (${plafon:,.0f} USD). Silakan ajukan nominal di bawah limit Anda."
                ]
            )

        # Nominal disetujui sama dengan nominal belanja karena berada di bawah limit
        nominal_final = nominal

        # ── F. STEP 3 — Hitung cicilan anuitas ───────────────────────
        bunga_per_bulan = bunga / 12
        if bunga_per_bulan > 0 and tenor > 0:
            cicilan = nominal_final * (
                bunga_per_bulan * (1 + bunga_per_bulan) ** tenor
            ) / ((1 + bunga_per_bulan) ** tenor - 1)
        else:
            cicilan = nominal_final / tenor if tenor > 0 else nominal_final

        total_bayar = cicilan * tenor
        total_bunga = total_bayar - nominal_final
        sisa_plafon = plafon - nominal_final

        # Catatan risiko berdasarkan credit score & DTI
        if credit_score >= 720 and dti < 0.30:
            catatan_risiko = "Profil sangat sehat — risiko sangat rendah"
        elif credit_score >= 660:
            catatan_risiko = "Profil sehat — risiko rendah"
        elif credit_score >= 600:
            catatan_risiko = "Profil cukup — risiko sedang"
        else:
            catatan_risiko = "DTI tinggi — risiko sedang-tinggi"

        confidence = round(proba * 100, 1)

        return PredictOutput(
            result="LAYAK",
            confidence=confidence,
            plafon=plafon,
            bunga_persen=f"{bunga * 100:.0f}%",
            bunga_rate=bunga,
            cicilan_per_bulan=round(cicilan, 2),
            total_bunga=round(total_bunga, 2),
            total_bayar=round(total_bayar, 2),
            sisa_plafon=round(sisa_plafon, 2),
            catatan_risiko=catatan_risiko,
            nominal_dicairkan=int(nominal_final),
        )

    # ------------------------------------------------------------------
    # PRIVATE — mapping frontend form → format input_user
    # ------------------------------------------------------------------
    def _map_input(self, data: PredictInput) -> dict:
        # ── BI Checking Automatic Underwriting Simulation based on DTI ──
        gaji = float(data.monthlyIncome or "0")
        cicilan_aktif = float(data.existingInstallments or "0")
        nik = data.nikProfile or "DTI-Simulated"
        
        # Hitung Rasio Utang terhadap Pendapatan (Debt-to-Income / DTI)
        dti_ratio = (cicilan_aktif / gaji) if gaji > 0 else 0.0
        
        # Simulasikan parameter SLIK OJK secara otomatis berdasarkan DTI:
        if dti_ratio == 0.0:
            # Nasabah dengan profil bersih tanpa utang aktif (Kredit Sangat Baik / Score Tinggi)
            tunggakan_ini, tunggakan_7, catatan_buruk = (0, 0, 0)
            credit_history = "Baik"
            hutang = 0.0
        elif dti_ratio <= 0.35:
            # Nasabah dengan cicilan aktif sehat/wajar (DTI <= 35%)
            tunggakan_ini, tunggakan_7, catatan_buruk = (0, 1, 0)
            credit_history = "Cukup"
            hutang = cicilan_aktif
        else:
            # Nasabah dengan beban cicilan terlampau besar (> 35% - batas aman underwriting)
            # Secara otomatis disimulasikan memiliki riwayat buruk / gagal bayar aktif
            tunggakan_ini, tunggakan_7, catatan_buruk = (3, 5, 2)
            credit_history = "Buruk"
            hutang = cicilan_aktif

        # Employment
        status_pekerjaan = EMPLOYMENT_MAP.get(data.employment, "Other")
        occupation       = OCCUPATION_MAP.get(data.employment, "Other")

        # Loan purpose numeric
        tujuan_pinjaman  = LOAN_PURPOSE_MAP.get(data.loanPurpose, 0)

        # Borrower state dari propertyArea
        borrower_state   = AREA_STATE_MAP.get(data.propertyArea, "CA")

        # Kepemilikan rumah — Urban → True, sisanya → False
        punya_rumah = (data.propertyArea == "Urban")

        # Estimasi riwayat kredit dari usia & dependents
        age              = max(int(data.age or "25"), 18)
        riwayat_kredit   = max(1, (age - 18) // 4)  #  estimasi kasar

        # Credit line dari dependents (proxy)
        dependents       = int(data.dependents or "0")
        jumlah_cl        = max(2, dependents + 3)

        # Gaji & hutang
        gaji             = float(data.monthlyIncome or "0")
        sisa_limit       = float(data.additionalIncome or "0") * 0.5  # estimasi sisa limit

        # Cicilan kartu estimasi
        cicilan_kartu    = hutang * 0.1

        return {
            "borrower_state"          : borrower_state,
            "occupation"              : occupation,
            "gaji_bulanan"            : gaji,
            "status_pekerjaan"        : status_pekerjaan,
            "punya_rumah"             : punya_rumah,
            "tenor_bulan"             : int(data.loanTerm or "36"),
            "hutang_saat_ini"         : hutang,
            "sisa_limit_kartu_kredit" : max(sisa_limit, 0),
            "cicilan_bulanan_kartu"   : cicilan_kartu,
            "jumlah_credit_line"      : jumlah_cl,
            "riwayat_kredit_tahun"    : riwayat_kredit,
            "tunggakan_saat_ini"      : tunggakan_ini,
            "tunggakan_7tahun"        : tunggakan_7,
            "catatan_buruk"           : catatan_buruk,
            "credit_history_status"   : credit_history,
            "jumlah_pengajuan_kredit" : 1,
            "lama_kerja_bulan"        : max(12, age * 3),
            "tujuan_pinjaman"         : tujuan_pinjaman,
            "nominal_dicairkan"       : float(data.loanAmount or "0"),
            "nik_profile"             : nik,
        }
