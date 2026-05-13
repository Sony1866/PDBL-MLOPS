'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brain, ArrowRight, CheckCircle2, XCircle, TrendingUp, DollarSign, Clock, User, Home as HomeIcon, CreditCard, BarChart3, RefreshCw, ChevronRight, Sparkles, ArrowLeft, FileCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, PredictionResult } from '../context/AuthContext';
import Header from '../components/Header';

/* ─── Confetti effect ─── */
function Confetti() {
  const colors = ['#0ea5e9', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[999]">
      {Array.from({ length: 40 }).map((_, i) => (
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
      const y = (h / 2) - ((count - 1) * 20) / 2 + ni * 20;
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
    <svg width={w} height={h} className="mx-auto opacity-60">
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(14,165,233,0.15)" strokeWidth="0.5">
          <animate attributeName="stroke" values="rgba(14,165,233,0.1);rgba(99,102,241,0.5);rgba(14,165,233,0.1)" dur="2s" begin={`${l.delay}s`} repeatCount="indefinite" />
        </line>
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="4" fill="rgba(14,165,233,0.3)" stroke="rgba(14,165,233,0.5)" strokeWidth="1">
          <animate attributeName="r" values="3;5;3" dur="1.5s" begin={`${n.layer * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="fill" values="rgba(14,165,233,0.3);rgba(99,102,241,0.6);rgba(14,165,233,0.3)" dur="1.5s" begin={`${n.layer * 0.3}s`} repeatCount="indefinite" />
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
    <div className="relative w-28 h-28">
      <svg width="112" height="112" className="rotate-[-90deg]">
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(14,165,233,0.1)" strokeWidth="8" />
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color, letterSpacing: '-0.03em' }}>{value}%</span>
        <span className="text-[9px] font-bold text-sky-500/60 uppercase tracking-wider">Confidence</span>
      </div>
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function PredictPage() {
  const { user, isLoggedIn, isLoading, addPrediction } = useAuth();
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
    propertyArea: '', creditHistory: '', coApplicantIncome: '',
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) { router.push('/login'); return; }
    if (user?.profile && !user.profile.profileCompleted) { router.push('/profile'); return; }
    if (user?.profile) {
      setForm(f => ({ ...f, age: user.profile.age || '', gender: user.profile.gender || '', maritalStatus: user.profile.maritalStatus || '', dependents: user.profile.dependents || '0', education: user.profile.education || '', employment: user.profile.employment || '', monthlyIncome: user.profile.monthlyIncome || '', additionalIncome: user.profile.additionalIncome || '0' }));
    }
  }, [user, isLoggedIn, isLoading, router]);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setLoadingProgress(0);

    const msgs = ['Memuat model Gradient Boosting...', 'Preprocessing data nasabah...', 'Feature engineering...', 'Running prediction pipeline...', 'Menghitung confidence score...', 'Generating laporan...'];
    let msgIdx = 0;
    setLoadingText(msgs[0]);
    const msgInterval = setInterval(() => { msgIdx++; if (msgIdx < msgs.length) setLoadingText(msgs[msgIdx]); }, 500);
    const progInterval = setInterval(() => { setLoadingProgress(p => Math.min(p + Math.random() * 15, 95)); }, 400);

    setTimeout(() => {
      clearInterval(msgInterval); clearInterval(progInterval);
      setLoadingProgress(100);

      const income = parseFloat(form.monthlyIncome) || 0;
      const addInc = parseFloat(form.additionalIncome) || 0;
      const total = income + addInc;
      const loan = parseFloat(form.loanAmount) || 0;
      const term = parseFloat(form.loanTerm) || 12;
      const dti = total > 0 ? ((loan / term) / total) * 100 : 100;
      let score = 50;
      if (total >= 10000000) score += 15; else if (total >= 5000000) score += 10; else if (total >= 3000000) score += 5; else score -= 10;
      if (dti < 30) score += 20; else if (dti < 50) score += 5; else score -= 15;
      if (form.creditHistory === 'Baik') score += 15; else if (form.creditHistory === 'Cukup') score += 5; else if (form.creditHistory === 'Buruk') score -= 20;
      if (['PNS', 'Karyawan Swasta'].includes(form.employment)) score += 10; else if (form.employment === 'Wiraswasta') score += 5;
      if (['S1', 'S2', 'S3'].includes(form.education)) score += 5;
      const age = parseInt(form.age) || 0;
      if (age >= 25 && age <= 55) score += 5;
      if (form.propertyArea === 'Urban') score += 5; else if (form.propertyArea === 'Semiurban') score += 3;
      score = Math.max(0, Math.min(100, score));
      const isLayak = score >= 55;
      const conf = Math.min(98, Math.max(60, score + Math.random() * 10 - 5));

      const pred: PredictionResult = {
        id: `pred_${Date.now()}`, date: new Date().toISOString(),
        loanAmount: form.loanAmount, loanTerm: form.loanTerm, interestRate: form.interestRate || '0',
        result: isLayak ? 'LAYAK' : 'TIDAK LAYAK', confidence: Math.round(conf * 10) / 10, inputData: { ...form },
      };
      addPrediction(pred); setResult(pred); setStep('result');
      if (isLayak) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000); }
    }, 3000);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin-slow" /></div>;

  const formSections = [
    { title: 'Data Pinjaman', icon: CreditCard, fields: [
      { key: 'loanAmount', label: 'Jumlah Pinjaman (Rp)', icon: DollarSign, type: 'number', placeholder: 'Contoh: 50000000', req: true },
      { key: 'loanTerm', label: 'Tenor (Bulan)', icon: Clock, type: 'number', placeholder: 'Contoh: 36', req: true },
      { key: 'interestRate', label: 'Suku Bunga (%/tahun)', icon: TrendingUp, type: 'number', placeholder: 'Contoh: 12', req: false },
      { key: 'loanPurpose', label: 'Tujuan Pinjaman', icon: FileCheck, type: 'select', options: ['', 'Modal Usaha', 'Pendidikan', 'Renovasi Rumah', 'Kendaraan', 'Kesehatan', 'Lainnya'], req: true },
    ]},
    { title: 'Data Tambahan', icon: BarChart3, fields: [
      { key: 'creditHistory', label: 'Riwayat Kredit', icon: BarChart3, type: 'select', options: ['', 'Baik', 'Cukup', 'Buruk', 'Belum Pernah'], req: true },
      { key: 'coApplicantIncome', label: 'Pendapatan Pasangan (Rp)', icon: DollarSign, type: 'number', placeholder: '0 jika tidak ada', req: false },
      { key: 'propertyArea', label: 'Area Tempat Tinggal', icon: HomeIcon, type: 'select', options: ['', 'Urban', 'Semiurban', 'Rural'], req: true },
    ]},
  ];

  return (
    <div className="min-h-screen relative transition-colors duration-300 noise-overlay">
      <div className="gradient-mesh" /><div className="orb orb-1" /><div className="orb orb-2" />
      <Header />
      {showConfetti && <Confetti />}

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-16">
        {/* ═══ FORM ═══ */}
        {step === 'form' && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/50 dark:bg-sky-900/20 border border-sky-200/40 dark:border-sky-700/20 mb-4">
                <Brain className="w-3 h-3 text-sky-500" /><span className="text-[10px] font-bold text-sky-500/80 uppercase tracking-[0.15em]">AI Prediction</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-sky-950 dark:text-sky-100 mb-2" style={{ letterSpacing: '-0.03em' }}>Prediksi Kelayakan</h1>
              <p className="text-sky-700/50 dark:text-sky-300/40 text-sm">Isi data pinjaman untuk mendapatkan hasil analisis</p>
            </div>

            {/* Progress stepper */}
            <div className="flex items-center justify-center gap-3 mb-8">
              {formSections.map((s, i) => (
                <button key={i} onClick={() => setFormStep(i)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${formStep === i ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg' : 'glass-card-static text-sky-600 dark:text-sky-400'}`}>
                  <s.icon className="w-3.5 h-3.5" /> {s.title}
                </button>
              ))}
            </div>

            {/* Auto-fill notice */}
            <div className="glass-card-static rounded-2xl px-5 py-3.5 mb-6 flex items-center gap-3" style={{ boxShadow: '0 4px 20px rgba(14,165,233,0.06)' }}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-white" /></div>
              <p className="text-xs font-semibold text-sky-700/60 dark:text-sky-300/50">Data profil terisi otomatis dari akun Anda ✓</p>
            </div>

            {/* Form card */}
            <div className="glass-card-static rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(14,165,233,0.08)' }}>
              <div className="px-6 py-6">
                <form onSubmit={handlePredict} className="space-y-4">
                  {formSections[formStep].fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-sky-700 dark:text-sky-300 mb-1.5">
                        {f.label} {f.req && <span className="text-red-400">*</span>}
                      </label>
                      <div className="relative">
                        <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400/60" />
                        {f.type === 'select' ? (
                          <select value={form[f.key as keyof typeof form]} onChange={(e) => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-sky-50/60 dark:bg-sky-900/20 border border-sky-200/40 dark:border-sky-700/30 text-sky-900 dark:text-sky-100 text-sm font-medium transition-all appearance-none">
                            {f.options?.map(o => <option key={o} value={o}>{o || `Pilih ${f.label}`}</option>)}
                          </select>
                        ) : (
                          <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-sky-50/60 dark:bg-sky-900/20 border border-sky-200/40 dark:border-sky-700/30 text-sky-900 dark:text-sky-100 text-sm font-medium placeholder:text-sky-400/40 transition-all"
                            placeholder={f.placeholder} />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-4">
                    {formStep > 0 && (
                      <button type="button" onClick={() => setFormStep(formStep - 1)}
                        className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm glass-card-static text-sky-700 dark:text-sky-300 hover:shadow-lg transition-all">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                      </button>
                    )}
                    {formStep < formSections.length - 1 ? (
                      <button type="button" onClick={() => setFormStep(formStep + 1)}
                        className="flex-1 group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-300 hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 6px 24px rgba(14,165,233,0.3)' }}>
                        Lanjut <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <button type="submit"
                        className="flex-1 group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-300 hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 6px 24px rgba(14,165,233,0.3)' }}>
                        <Brain className="w-4 h-4" /> Analisis Kelayakan <Sparkles className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        {/* ═══ LOADING ═══ */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[65vh] gap-6">
            <div className="glass-card-static rounded-3xl p-10 text-center w-full max-w-md" style={{ boxShadow: '0 16px 60px rgba(14,165,233,0.12)' }}>
              <div className="mb-6"><NeuralNetworkAnim /></div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center mx-auto mb-5" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}>
                <Brain className="w-8 h-8 text-white animate-spin-slow" />
              </div>
              <h2 className="text-lg font-black text-sky-950 dark:text-sky-100 mb-1">Menganalisis Data</h2>
              <p className="text-xs text-sky-500/60 font-semibold mb-6 h-4">{loadingText}</p>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-sky-100 dark:bg-sky-800/30 overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${loadingProgress}%`, background: 'linear-gradient(90deg, #0ea5e9, #6366f1)' }} />
              </div>
              <p className="text-[11px] font-bold text-sky-400/60 tabular-nums">{Math.round(loadingProgress)}%</p>
            </div>
          </div>
        )}

        {/* ═══ RESULT ═══ */}
        {step === 'result' && result && (
          <div className="animate-result-reveal">
            {/* Result hero */}
            <div className="gradient-border mb-6">
              <div className={`rounded-[22px] px-6 py-10 text-center relative overflow-hidden ${result.result === 'LAYAK' ? 'bg-gradient-to-br from-emerald-500/90 to-green-600/90' : 'bg-gradient-to-br from-red-500/90 to-rose-600/90'}`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm mb-4">
                    {result.result === 'LAYAK' ? <CheckCircle2 className="w-10 h-10 text-white" /> : <XCircle className="w-10 h-10 text-white" />}
                  </div>
                  <h1 className="text-4xl font-black text-white mb-2" style={{ letterSpacing: '-0.03em' }}>{result.result}</h1>
                  <p className="text-white/70 text-sm font-semibold">
                    {result.result === 'LAYAK' ? 'Selamat! Anda memenuhi kriteria kelayakan pinjaman 🎉' : 'Mohon maaf, saat ini belum memenuhi kriteria'}
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence + Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="glass-card-static rounded-3xl p-6 flex flex-col items-center justify-center" style={{ boxShadow: '0 8px 30px rgba(14,165,233,0.08)' }}>
                <ConfidenceRing value={result.confidence} color={result.result === 'LAYAK' ? '#10b981' : '#ef4444'} />
                <p className="text-xs font-bold text-sky-700/50 dark:text-sky-300/40 mt-2">Model Confidence Level</p>
              </div>
              <div className="glass-card-static rounded-3xl p-6 space-y-2.5" style={{ boxShadow: '0 8px 30px rgba(14,165,233,0.08)' }}>
                <h3 className="text-xs font-extrabold text-sky-900 dark:text-sky-100 flex items-center gap-1.5 mb-3"><BarChart3 className="w-3.5 h-3.5 text-sky-500" /> Ringkasan</h3>
                {[
                  { l: 'Pinjaman', v: `Rp ${parseInt(result.loanAmount || '0').toLocaleString('id-ID')}` },
                  { l: 'Tenor', v: `${result.loanTerm} bulan` },
                  { l: 'Tujuan', v: result.inputData.loanPurpose },
                  { l: 'Kredit', v: result.inputData.creditHistory },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between text-xs py-1.5 border-b border-sky-100/30 dark:border-sky-800/20 last:border-0">
                    <span className="text-sky-600/60 dark:text-sky-400/50 font-medium">{r.l}</span>
                    <span className="font-bold text-sky-900 dark:text-sky-100">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => { setStep('form'); setResult(null); setFormStep(0); }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 6px 24px rgba(14,165,233,0.3)' }}>
                <RefreshCw className="w-4 h-4" /> Prediksi Lagi
              </button>
              <Link href="/dashboard" className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm glass-card-static text-sky-700 dark:text-sky-300 hover:shadow-lg transition-all">
                Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
