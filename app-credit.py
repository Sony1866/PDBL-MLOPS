import pandas as pd
import numpy as np
import scipy.stats as stats
import warnings

from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
from xgboost import XGBRegressor

# Mengabaikan FutureWarning bawaan Pandas agar log di terminal terlihat lebih bersih
warnings.filterwarnings("ignore", category=FutureWarning)

# =====================================================================
# TAHAP 1: PERSIAPAN DATA HISTORIS & FEATURE ENGINEERING
# =====================================================================
print("1. Memuat dan Memproses Data Historis...")
# FIX: Menambahkan low_memory=False untuk mencegah DtypeWarning
df = pd.read_csv(r'/home/sony/Downloads/prosperLoanData.csv', low_memory=False)

# Membuang baris yang tidak memiliki target (Nominal Pinjaman)
df.dropna(subset=['LoanOriginalAmount'], inplace=True)

# Memilih fitur prediktor yang relevan
features = [
    'Term', 'ProsperScore', 'EmploymentStatus', 'IsBorrowerHomeowner', 
    'CreditScoreRangeLower', 'DebtToIncomeRatio', 'StatedMonthlyIncome', 
    'TotalCreditLinespast7years', 'BankcardUtilization', 'AvailableBankcardCredit', 
    'MonthlyLoanPayment', 'BorrowerRate', 
    'LoanOriginalAmount' # Target
]

df_sub = df[features].copy()

# Feature Engineering: Membuat kolom estimasi total beban utang bulanan
df_sub['TotalDebtEstimation'] = df_sub['StatedMonthlyIncome'] * df_sub['DebtToIncomeRatio']

# Transformasi Target: Memastikan pinjaman adalah bilangan bulat absolut (tanpa koma)
df_sub['LoanOriginalAmount'] = df_sub['LoanOriginalAmount'].round().astype(int)

# Memisahkan Input (X) dan Target (y)
X = df_sub.drop(columns=['LoanOriginalAmount'])
y = df_sub['LoanOriginalAmount']

# Pembagian data Train dan Test (80% Train, 20% Test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# =====================================================================
# TAHAP 2: MEMBANGUN PIPELINE PREPROCESSING
# =====================================================================
print("2. Membangun Pipeline Preprocessing...")

# FIX: Menambahkan .tolist() agar tidak terjadi bentrok tipe data Pandas baru dengan Scikit-Learn
numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
categorical_features = X.select_dtypes(include=['object', 'string', 'bool']).columns.tolist()

numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# =====================================================================
# TAHAP 3: TRAINING & HYPERPARAMETER TUNING (XGBOOST)
# =====================================================================
print("3. Memulai Pelatihan dan Tuning Model (XGBRegressor)...")
xgb_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('model', XGBRegressor(random_state=42, n_jobs=-1))
])

# Ruang parameter tuning
param_distributions = {
    'model__n_estimators': stats.randint(150, 250),
    'model__learning_rate': stats.uniform(0.05, 0.1),
    'model__max_depth': stats.randint(4, 7),
    'model__subsample': stats.uniform(0.7, 0.3)
}

random_search = RandomizedSearchCV(
    estimator=xgb_pipeline,
    param_distributions=param_distributions,
    n_iter=10,             
    scoring='r2',          
    cv=3,                  
    verbose=1,
    random_state=42
)

# Melatih model
random_search.fit(X_train, y_train)
best_model = random_search.best_estimator_

# =====================================================================
# TAHAP 4: EVALUASI AKURASI MODEL (DATA TESTING)
# =====================================================================
print("\n4. Mengevaluasi Akurasi Model...")
y_pred_mentah = best_model.predict(X_test)
y_pred = np.round(y_pred_mentah).astype(int)

akurasi_r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)

print("="*50)
print("LAPORAN EVALUASI MODEL REGRESI")
print("="*50)
print(f"Akurasi Varians (R-Squared) : {akurasi_r2 * 100:.2f}%")
print(f"Rata-rata Meleset (MAE)     : ${mae:,.0f} per nasabah")
print("="*50)

# =====================================================================
# TAHAP 5: SIMULASI BACKEND APLIKASI (LOGIKA BISNIS + INFERENCE)
# =====================================================================
def proses_pengajuan_pinjaman(model, input_user_murni):
    """
    Fungsi Backend: Menerima input murni dari nasabah, 
    menerapkan aturan bank (Business Logic), lalu memprediksi Limit Pinjaman.
    """
    # A. LOGIKA BISNIS BANK (Mengisi kekosongan data otomatis)
    
    if input_user_murni['Tenor_Bulan'] <= 12:
        bunga_ditetapkan = 0.08  
    elif input_user_murni['Tenor_Bulan'] <= 36:
        bunga_ditetapkan = 0.15  
    else:
        bunga_ditetapkan = 0.22  
        
    dti_dihitung = input_user_murni['Hutang_Saat_Ini'] / input_user_murni['Gaji_Bulanan']
    
    if input_user_murni['Sisa_Limit_Kartu_Kredit'] == 0 and input_user_murni['Hutang_Saat_Ini'] == 0:
        skor_kredit = 700
        prosper_score = 6
        riwayat_kredit = 0
        utilitas_kartu = 0.0
    else:
        skor_kredit = 600 if dti_dihitung > 0.40 else 720
        prosper_score = 3 if dti_dihitung > 0.40 else 8
        riwayat_kredit = 5 
        utilitas_kartu = 1.0 if input_user_murni['Sisa_Limit_Kartu_Kredit'] == 0 else 0.5 
            
    # B. PENYUSUNAN DATA UNTUK MODEL ML
    data_untuk_model = {
        'Term': input_user_murni['Tenor_Bulan'],
        'ProsperScore': prosper_score,
        'EmploymentStatus': input_user_murni['Pekerjaan'],
        'IsBorrowerHomeowner': input_user_murni['Punya_Rumah'],
        'CreditScoreRangeLower': skor_kredit,
        'DebtToIncomeRatio': dti_dihitung,
        'StatedMonthlyIncome': input_user_murni['Gaji_Bulanan'],
        'TotalCreditLinespast7years': riwayat_kredit,
        'BankcardUtilization': utilitas_kartu,
        'AvailableBankcardCredit': input_user_murni['Sisa_Limit_Kartu_Kredit'],
        'MonthlyLoanPayment': input_user_murni['Sanggup_Cicil_Bulan'],
        'BorrowerRate': bunga_ditetapkan
    }
    
    df_input = pd.DataFrame([data_untuk_model])
    
    df_input['TotalDebtEstimation'] = df_input['StatedMonthlyIncome'] * df_input['DebtToIncomeRatio']
    
    # C. PREDIKSI FINAL OLEH XGBOOST
    prediksi_mentah = model.predict(df_input)
    limit_final = np.round(prediksi_mentah[0]).astype(int)
    
    return limit_final, bunga_ditetapkan

# =====================================================================
# TAHAP 6: DEMO / UJI COBA INPUT PENGGUNA
# =====================================================================
print("\n5. Simulasi Pengajuan dari Sistem Aplikasi...")

input_user_1 = {
    'Gaji_Bulanan': 5500.0,
    'Pekerjaan': 'Employed',
    'Punya_Rumah': True,
    'Tenor_Bulan': 36,               
    'Sanggup_Cicil_Bulan': 250.0,    
    'Hutang_Saat_Ini': 1000.0,       
    'Sisa_Limit_Kartu_Kredit': 500.0   
}

input_user_2 = {
    'Gaji_Bulanan': 2000.0,
    'Pekerjaan': 'Self-employed',
    'Punya_Rumah': False,
    'Tenor_Bulan': 60,               
    'Sanggup_Cicil_Bulan': 100.0,    
    'Hutang_Saat_Ini': 1500.0,       
    'Sisa_Limit_Kartu_Kredit': 0.0   
}

limit_1, bunga_1 = proses_pengajuan_pinjaman(best_model, input_user_1)
limit_2, bunga_2 = proses_pengajuan_pinjaman(best_model, input_user_2)

print("\n--- Nasabah 1 (Profil Sehat) ---")
print(f"Bunga Ditetapkan : {bunga_1 * 100}%")
print(f"Prediksi Plafon  : ${limit_1:,.0f}")

print("\n--- Nasabah 2 (Profil Berisiko) ---")
print(f"Bunga Ditetapkan : {bunga_2 * 100}%")
print(f"Prediksi Plafon  : ${limit_2:,.0f}")