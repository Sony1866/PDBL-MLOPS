'use client';

import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, CheckCircle2, XCircle, TrendingUp, DollarSign, Clock, User, Home as HomeIcon, CreditCard, BarChart3, RefreshCw, ChevronRight, Sparkles, ArrowLeft, FileCheck, AlertCircle, Banknote, Calculator, ShieldCheck, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, PredictionResult } from '../context/AuthContext';
import Header from '../components/Header';

/* ─── Confetti effect ─── */
function Confetti() {
  const colors = ['#0ea5e9', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[999]">
      {Array.from({ length: 45 }).map((_, i) => (
        <div key={i} className="confetti-piece" style={{
          left: `${Math.random() * 100}%`,
          width: `${6 + Math.random() * 8}px`,
          height: `${6 + Math.random() * 8}px`,
          background: colors[Math.floor(Math.random() * colors.length)],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animationDuration: `${2 + Math.random() * 2}s`,
          animationDelay: `${Math.random() * 0.8}s`,
        }} />
      ))}
    </div>
  );
}

/* ─── Neural Network SVG Animation ─── */
function NeuralNetworkAnim() {
  const layers = [3, 5, 5, 3, 1];
  const w = 280, h = 200;
  const nodes: { x: number; y: number; layer: number }[] = [];

  layers.forEach((count, li) => {
    const x = 30 + (li / (layers.length - 1)) * (w - 60);
    for (let ni = 0; ni < count; ni++) {
      const y = (h / 2) - ((count - 1) * 22) / 2 + ni * 22;
      nodes.push({ x, y, layer: li });
    }
  });

  const lines: { x1: number; y1: number; x2: number; y2: number; delay: number }[] = [];
  let idx = 0;
  layers.forEach((count, li) => {
    if (li === layers.length - 1) return;
    const nextStart = layers.slice(0, li + 1).reduce((a, b) => a + b, 0);
    const currStart = layers.slice(0, li).reduce((a, b) => a + b, 0);
    for (let ci = 0; ci < count; ci++) {
      for (let ni = 0; ni < layers[li + 1]; ni++) {
        const from = nodes[currStart + ci];
        const to = nodes[nextStart + ni];
        lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, delay: idx * 0.02 });
        idx++;
      }
    }
  });

  return (
    <svg width={w} height={h} className="mx-auto opacity-70">
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(99,102,241,0.15)" strokeWidth="0.75">
          <animate attributeName="stroke" values="rgba(99,102,241,0.1);rgba(14,165,233,0.6);rgba(99,102,241,0.1)" dur="2s" begin={`${l.delay}s`} repeatCount="indefinite" />
        </line>
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="5" fill="rgba(14,165,233,0.3)" stroke="rgba(14,165,233,0.6)" strokeWidth="1.5">
          <animate attributeName="r" values="3.5;5.5;3.5" dur="1.5s" begin={`${n.layer * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="fill" values="rgba(14,165,233,0.3);rgba(99,102,241,0.7);rgba(14,165,233,0.3)" dur="1.5s" begin={`${n.layer * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

/* ─── Confidence Ring ─── */
function ConfidenceRing({ value, color }: { value: number; color: string }) {
  const r = 45, c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg width="112" height="112" className="rotate-[-90deg] absolute">
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(14,165,233,0.06)" strokeWidth="8" />
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ 
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)',
            filter: `drop-shadow(0 0 4px ${color}40)` 
          }} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black tracking-tight" style={{ color }}>{value}%</span>
        <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Confidence</span>
      </div>
    </div>
  );
}

/* ─── Mock Credit Card Component ─── */
function CreditCardMockup({ userName, limit }: { userName: string; limit: number }) {
  return (
    <div className="relative overflow-hidden w-full h-52 rounded-[24px] p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col justify-between select-none group transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_25px_60px_rgba(99,102,241,0.2)]">
      {/* Decorative Orbs inside card */}
      <div className="absolute top-[-30px] right-[-30px] w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl pointer-events-none" />
      <div className="absolute bottom-[-20px] left-[20%] w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-xl pointer-events-none" />
      
      {/* Upper row: Chip + Brand */}
      <div className="flex justify-between items-start z-10">
        <div>
          {/* EMV Gold Chip Mockup */}
          <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-300 border border-amber-600/30 flex flex-col justify-around p-1 shadow-inner relative">
            <div className="w-full h-[1px] bg-amber-700/20" />
            <div className="w-full h-[1px] bg-amber-700/20" />
            <div className="w-full h-[1px] bg-amber-700/20" />
            <div className="absolute left-[35%] top-0 bottom-0 w-[1px] bg-amber-700/20" />
            <div className="absolute right-[35%] top-0 bottom-0 w-[1px] bg-amber-700/20" />
          </div>
          {/* Wireless signal icon */}
          <svg className="w-5 h-5 text-slate-400/80 mt-2 rotate-90 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8M12 3v10m-3-3l3-3 3 3" />
          </svg>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <Brain className="w-4 h-4 text-sky-400" />
            <span className="text-[11px] font-black tracking-[0.1em] text-slate-200 uppercase">KreditinAja!</span>
          </div>
          <span className="text-[7px] font-bold text-sky-400/60 uppercase tracking-widest">Premium Active</span>
        </div>
      </div>

      {/* Middle row: Credit Limit Balance */}
      <div className="z-10">
        <span className="text-[8px] font-black text-slate-400/80 uppercase tracking-widest">Approved Credit Limit</span>
        <div className="text-3xl font-black text-emerald-400 tracking-tight mt-0.5 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
          ${limit.toLocaleString('en-US')}
        </div>
      </div>

      {/* Lower row: User name & Verification badge */}
      <div className="flex justify-between items-end z-10">
        <div>
          <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider block">Cardholder</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">{userName || 'Kreditor Terdaftar'}</span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full shadow-inner">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span className="text-[8px] font-extrabold text-emerald-400 uppercase tracking-wider">Verified limit</span>
        </div>
      </div>
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function PredictPage() {
  const { user, isLoggedIn, isLoading, addPrediction, hasActiveLoan, activeLoan } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [formStep, setFormStep] = useState(0);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');

  const [form, setForm] = useState({
    age: '', gender: '', maritalStatus: '', dependents: '',
    education: '', employment: '', monthlyIncome: '', additionalIncome: '',
    loanAmount: '', loanTerm: '', interestRate: '', loanPurpose: '',
    propertyArea: '', creditHistory: 'Baik', coApplicantIncome: '0',
    existingInstallments: '0',
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) { router.push('/login'); return; }
    if (user?.profile && !user.profile.profileCompleted) { router.push('/profile'); return; }
    if (user?.profile) {
      setForm(f => ({ ...f, age: user.profile.age || '', gender: user.profile.gender || '', maritalStatus: user.profile.maritalStatus || '', dependents: user.profile.dependents || '0', education: user.profile.education || '', employment: user.profile.employment || '', monthlyIncome: user.profile.monthlyIncome || '', additionalIncome: user.profile.additionalIncome || '0', existingInstallments: user.profile.existingInstallments || '0' }));
    }
  }, [user, isLoggedIn, isLoading, router]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setLoadingProgress(0);

    const msgs = [
      'Menghubungkan ke server AI...',
      'Preprocessing data nasabah...',
      'Menjalankan model klasifikasi...',
      'Menghitung plafon dengan model regresi...',
      'Menghitung cicilan anuitas...',
      'Menyusun laporan kredit...',
    ];
    let msgIdx = 0;
    setLoadingText(msgs[0]);
    const msgInterval = setInterval(() => {
      msgIdx++;
      if (msgIdx < msgs.length) setLoadingText(msgs[msgIdx]);
    }, 600);
    const progInterval = setInterval(() => {
      setLoadingProgress(p => Math.min(p + Math.random() * 12, 90));
    }, 400);

    try {
      const payload = {
        ...form,
        fullName: user?.profile?.fullName || user?.fullName || '',
        email: user?.profile?.email || user?.email || '',
        phone: user?.profile?.phone || '',
        address: user?.profile?.address || '',
      };

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearInterval(msgInterval);
      clearInterval(progInterval);
      setLoadingProgress(100);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Gagal menghubungi server');
      }

      const data = await response.json();

      const pred: PredictionResult = {
        id: `pred_${Date.now()}`,
        date: new Date().toISOString(),
        loanAmount: form.loanAmount,
        loanTerm: form.loanTerm,
        interestRate: data.bunga_persen || form.interestRate || '0',
        result: data.result,
        confidence: data.confidence,
        inputData: { ...form },
        plafon: data.plafon,
        bungaPersen: data.bunga_persen,
        bungaRate: data.bunga_rate,
        cicilanPerBulan: data.cicilan_per_bulan,
        totalBunga: data.total_bunga,
        totalBayar: data.total_bayar,
        sisaPlafon: data.sisa_plafon,
        nominalDicairkan: data.nominal_dicairkan,
        catatanRisiko: data.catatan_risiko,
        alasanPenolakan: data.alasan_penolakan,
      };

      addPrediction(pred);
      setResult(pred);
      setStep('result');
      if (data.result === 'LAYAK') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } catch (err: unknown) {
      clearInterval(msgInterval);
      clearInterval(progInterval);
      const errorMsg = err instanceof Error ? err.message : 'Tidak dapat terhubung ke server backend.';
      alert(`❌ Error: ${errorMsg}\n\nPastikan backend FastAPI berjalan di http://localhost:8000`);
      setStep('form');
      setLoadingProgress(0);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-12 h-12 border-[3px] border-sky-100 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );

  const formSections = [
    { title: 'Data Pinjaman', icon: CreditCard, fields: [
      { key: 'loanAmount', label: 'Jumlah Pinjaman ($)', icon: DollarSign, type: 'number', placeholder: 'Contoh: 5000', req: true },
      { key: 'loanTerm', label: 'Tenor (Bulan)', icon: Clock, type: 'number', placeholder: '12 / 36 / 60', req: true },
      { key: 'loanPurpose', label: 'Tujuan Pinjaman', icon: FileCheck, type: 'select', options: ['', 'Modal Usaha', 'Pendidikan', 'Renovasi Rumah', 'Kendaraan', 'Kesehatan', 'Lainnya'], req: true },
    ]},
    { title: 'Lokasi & Area', icon: HomeIcon, fields: [
      { key: 'propertyArea', label: 'Area Tempat Tinggal', icon: HomeIcon, type: 'select', options: ['', 'Urban', 'Semiurban', 'Rural'], req: true },
    ]},
  ];

  return (
    <div className="min-h-screen relative transition-colors duration-300 bg-slate-50 dark:bg-slate-950 noise-overlay">
      <div className="gradient-mesh" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <Header />
      {showConfetti && <Confetti />}

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-16">
        {/* ═══ ACTIVE LOAN BLOCKER ═══ */}
        {step === 'form' && hasActiveLoan && activeLoan && (
          <div className="animate-result-reveal">
            <div className="glass-card-static rounded-3xl p-8 text-center" style={{ boxShadow: '0 8px 40px rgba(245,158,11,0.12)' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-5">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-sky-950 dark:text-sky-100 mb-2" style={{ letterSpacing: '-0.03em' }}>Pinjaman Aktif Terdeteksi</h2>
              <p className="text-sm text-sky-700/60 dark:text-sky-300/40 mb-6">Anda masih memiliki pinjaman aktif yang belum lunas. Silakan lunasi pinjaman sebelumnya terlebih dahulu.</p>
              <div className="rounded-2xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(234,179,8,0.05))', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div><p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-wider">Pinjaman</p><p className="text-sm font-black text-sky-900 dark:text-sky-100">${parseInt(activeLoan.loanAmount || '0').toLocaleString('en-US')}</p></div>
                  <div><p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-wider">Tenor</p><p className="text-sm font-black text-sky-900 dark:text-sky-100">{activeLoan.loanTerm} bulan</p></div>
                  <div><p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-wider">Cicilan/Bulan</p><p className="text-sm font-black text-sky-900 dark:text-sky-100">${(activeLoan.cicilanPerBulan || 0).toLocaleString('en-US', {maximumFractionDigits: 0})}</p></div>
                  <div><p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-wider">Tanggal</p><p className="text-sm font-black text-sky-900 dark:text-sky-100">{new Date(activeLoan.date).toLocaleDateString('id-ID')}</p></div>
                </div>
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 6px 24px rgba(14,165,233,0.3)' }}>
                Lihat Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ═══ FORM ═══ */}
        {step === 'form' && !hasActiveLoan && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 mb-3 shadow-inner">
                <Brain className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-[0.15em]">Limit AI Underwriting</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Simulasi Kelayakan</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">Masukkan rencana pinjaman untuk dianalisis oleh KreditinAja! Engine</p>
            </div>

            {/* Stepper buttons */}
            <div className="flex justify-center gap-2 mb-6">
              {formSections.map((s, i) => (
                <button key={i} onClick={() => setFormStep(i)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all duration-300 ${formStep === i ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-md' : 'bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-950'}`}>
                  <s.icon className="w-3.5 h-3.5" /> {s.title}
                </button>
              ))}
            </div>

            {/* Autofill box */}
            <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 mb-3 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Data profil Anda telah dimuat secara otomatis dari akun ✓</p>
            </div>

            {/* USD Warning box */}
            <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-amber-800 dark:text-amber-400">Persyaratan Nominal dalam USD</p>
                <p className="text-[10px] text-amber-700/70 dark:text-amber-500/50 mt-0.5 leading-relaxed">Model dilatih menggunakan standar dataset Prosper (Amerika Serikat). Masukkan gaji & nominal dalam satuan Dolar (USD). Contoh: Gaji $3,000, Pinjaman $2,000.</p>
              </div>
            </div>

            {/* Main Form container */}
            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-[28px] overflow-hidden p-6 shadow-xl relative backdrop-blur-xl">
              <form onSubmit={handlePredict} className="space-y-5">
                {formSections[formStep].fields.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 tracking-wide mb-1.5">
                      {f.label} {f.req && <span className="text-red-500 font-black">*</span>}
                    </label>
                    <div className="relative">
                      <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/60" />
                      {f.type === 'select' ? (
                        <select value={form[f.key as keyof typeof form]} onChange={(e) => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold transition-all duration-300 focus:bg-white dark:focus:bg-slate-950 appearance-none">
                          {f.options?.map(o => {
                            const displayText = (f as any).optionsDisplay ? ((f as any).optionsDisplay as any)[o] : (o || `Pilih ${f.label}`);
                            return <option key={o} value={o}>{displayText}</option>;
                          })}
                        </select>
                      ) : (
                        <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold placeholder:text-slate-400/50 transition-all duration-300 focus:bg-white dark:focus:bg-slate-950"
                          placeholder={f.placeholder} />
                      )}
                    </div>
                  </div>
                ))}

                {/* Nav buttons */}
                <div className="flex gap-3 pt-3">
                  {formStep > 0 && (
                    <button type="button" onClick={() => setFormStep(formStep - 1)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 transition-all">
                      <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                    </button>
                  )}
                  {formStep < formSections.length - 1 ? (
                    <button type="button" onClick={() => setFormStep(formStep + 1)}
                      className="flex-1 group flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5 shadow-md">
                      Lanjut <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button type="submit"
                      className="flex-1 group flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5 shadow-md">
                      <Brain className="w-4 h-4" /> Jalankan Analisis AI <Sparkles className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </>
        )}

        {/* ═══ LOADING STEP ═══ */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-[32px] p-8 text-center w-full max-w-md shadow-xl backdrop-blur-xl">
              <div className="mb-6"><NeuralNetworkAnim /></div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg animate-bounce">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Mengevaluasi Risiko</h2>
              <p className="text-xs text-indigo-500/80 font-bold mb-6 h-4">{loadingText}</p>
              {/* Neon Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2 relative">
                <div className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600" style={{ width: `${loadingProgress}%` }} />
              </div>
              <p className="text-[11px] font-black text-slate-400 tabular-nums">{Math.round(loadingProgress)}%</p>
            </div>
          </div>
        )}

        {/* ═══ RESULT STEP (BEAUTIFUL MATERIAL 3 REDESIGN) ═══ */}
        {step === 'result' && result && (
          <div className="animate-result-reveal">
            
            {/* 1. HIGH-END VERDICT HERO CARD (Ditched solid saturated box) */}
            <div className={`rounded-[32px] p-8 text-center relative overflow-hidden border mb-6 shadow-xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 ${
              result.result === 'LAYAK' ? 'border-emerald-500/20' : 'border-rose-500/20'
            }`}>
              {/* Blurred background radial glow */}
              <div className={`absolute top-[-50px] left-[50%] -translate-x-1/2 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-40 ${
                result.result === 'LAYAK' ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
              
              <div className="relative flex flex-col items-center">
                {/* Secure Approved/Rejected Status Badge */}
                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-6 ${
                  result.result === 'LAYAK' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    result.result === 'LAYAK' ? 'bg-emerald-500 animate-ping' : 'bg-rose-500 animate-ping'
                  }`} />
                  {result.result === 'LAYAK' ? 'Approved Limit Active' : 'Application Unapproved'}
                </div>

                {/* Sophisticated Status Message */}
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2 leading-none">
                  Pengajuan {result.result === 'LAYAK' ? 'Disetujui ✓' : 'Ditolak ✗'}
                </h1>
                
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold max-w-sm leading-relaxed">
                  {result.result === 'LAYAK'
                    ? 'Selamat! Analisis underwriting KreditinAja! Engine menyatakan profil Anda aman untuk mendapatkan pencairan fasilitas limit kredit.'
                    : 'Mohon maaf, saat ini profil kelayakan Anda tidak memenuhi standar manajemen risiko aman pendaftaran kami.'}
                </p>

                {/* Subtitle Badge */}
                {result.catatanRisiko && (
                  <span className="inline-flex mt-4 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                    {result.catatanRisiko}
                  </span>
                )}
              </div>
            </div>

            {/* 2. DASHBOARD-STYLE ASYMMETRIC GRID (Ditched basic layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              
              {/* Visual Ring (Futuristic Radar) */}
              <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-[28px] p-6 flex flex-col items-center justify-center shadow-md select-none">
                <ConfidenceRing value={result.confidence} color={result.result === 'LAYAK' ? '#10b981' : '#ef4444'} />
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-3">Statistical Accuracy</p>
              </div>

              {/* IF APPROVED: Render gorgeous premium Credit Card Mockup! */}
              {result.result === 'LAYAK' && result.plafon ? (
                <CreditCardMockup userName={user?.fullName || ''} limit={result.plafon} />
              ) : (
                /* IF REJECTED: Render Summary card */
                <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-[28px] p-6 space-y-2.5 shadow-md">
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                    <BarChart3 className="w-4 h-4 text-indigo-500" /> Ringkasan Analisis
                  </h3>
                  {[
                    { l: 'Rencana Pinjaman', v: `$${parseInt(result.loanAmount || '0').toLocaleString('en-US')}` },
                    { l: 'Tenor Rencana', v: `${result.loanTerm} Bulan` },
                    { l: 'Tujuan Pinjaman', v: result.inputData.loanPurpose },
                    { l: 'Riwayat Kredit', v: result.inputData.creditHistory },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                      <span className="text-slate-500 dark:text-slate-500 font-semibold">{r.l}</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{r.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. ADDITIONAL DETAILS */}
            {/* IF APPROVED: Detailed payment metrics */}
            {result.result === 'LAYAK' && result.plafon && (
              <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-[28px] p-6 mb-6 shadow-md">
                <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-4 uppercase tracking-widest">
                  <Banknote className="w-4 h-4" /> Rencana Pembayaran & Tagihan
                </h3>
                
                {/* Nominal and Term Pill Cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-2xl p-4 text-center bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Nominal Dicairkan</p>
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      ${(result.nominalDicairkan || 0).toLocaleString('en-US')}
                    </p>
                  </div>
                  <div className="rounded-2xl p-4 text-center bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Tenor Kredit</p>
                    <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                      {result.loanTerm} <span className="text-xs font-semibold text-slate-500">Bulan</span>
                    </p>
                  </div>
                </div>

                {/* Visual Limit Allocation Bar (Kredivo Style) */}
                {(() => {
                  const totalPlafon = result.plafon || 0;
                  const usedAmount = result.nominalDicairkan || 0;
                  const remainingLimit = result.sisaPlafon || 0;
                  const usedPercent = totalPlafon > 0 ? Math.min(100, Math.max(0, (usedAmount / totalPlafon) * 100)) : 0;
                  const remainingPercent = 100 - usedPercent;
                  
                  return (
                    <div className="bg-slate-50/70 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 mb-4 space-y-3">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[9px]">Alokasi Limit Kredit</span>
                        <span className="font-black text-indigo-600 dark:text-indigo-400">{Math.round(usedPercent)}% Terpakai</span>
                      </div>
                      
                      {/* Bar */}
                      <div className="w-full h-3 rounded-full bg-slate-200/60 dark:bg-slate-800 overflow-hidden flex">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-indigo-600 transition-all duration-1000 ease-out" style={{ width: `${usedPercent}%` }} />
                        <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${remainingPercent}%` }} />
                      </div>
                      
                      {/* Labels with exact values */}
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                        <div className="flex flex-col">
                          <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[8px]">Total Limit (Plafon)</span>
                          <span className="font-black text-slate-800 dark:text-slate-200">${totalPlafon.toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex flex-col border-x border-slate-200/50 dark:border-slate-800/50">
                          <span className="text-rose-500/80 font-bold uppercase tracking-wider text-[8px]">Telah Digunakan</span>
                          <span className="font-black text-rose-600 dark:text-rose-400">${usedAmount.toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-emerald-500 font-bold uppercase tracking-wider text-[8px]">Sisa Limit Tersedia</span>
                          <span className="font-black text-emerald-500">${remainingLimit.toLocaleString('en-US')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Tagihan details row */}
                {[
                  { icon: Calculator, l: 'Cicilan Bulanan (Anuitas)', v: `$${(result.cicilanPerBulan || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / bln` },
                  { icon: TrendingUp,  l: 'Estimasi Suku Bunga (APR)',  v: result.bungaPersen || '-' },
                  { icon: DollarSign,  l: 'Total Beban Bunga',         v: `$${(result.totalBunga || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` },
                  { icon: BarChart3,   l: 'Total Pengembalian',        v: `$${(result.totalBayar || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` },
                  { icon: Banknote,    l: 'Sisa Saldo Plafon Kredit',  v: `$${(result.sisaPlafon || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-2.5 border-b border-slate-100 dark:border-slate-800/40 last:border-0">
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
                      <r.icon className="w-3.5 h-3.5 text-slate-400" /> {r.l}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{r.v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* IF REJECTED: Detailed credit policy warnings */}
            {result.result === 'TIDAK LAYAK' && result.alasanPenolakan && result.alasanPenolakan.length > 0 && (
              <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-[28px] p-6 mb-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-rose-500/5 blur-xl pointer-events-none" />
                <h3 className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-4 uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" /> Faktor Penghambat Kelayakan
                </h3>
                <ul className="space-y-3">
                  {result.alasanPenolakan.map((alasan, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      <span className="mt-0.5 w-5 h-5 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0 font-black" style={{ fontSize: '10px' }}>{i + 1}</span>
                      <div className="mt-0.5 leading-relaxed">{alasan}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Futuristic Actions CTA */}
            <div className="flex gap-3">
              <button onClick={() => { setStep('form'); setResult(null); setFormStep(0); }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-black text-xs tracking-wider uppercase bg-indigo-600 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 shadow-md shadow-indigo-600/10">
                <RefreshCw className="w-3.5 h-3.5" /> Analisis Ulang
              </button>
              <Link href="/dashboard" className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-xs tracking-wider uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all hover:-translate-y-0.5 shadow-sm">
                Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
