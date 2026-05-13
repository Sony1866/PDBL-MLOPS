'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Shield, Zap, BarChart3, TrendingUp, Check, Clock, Users, ChevronRight, ArrowRight, Brain, Target, FileCheck, Activity, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

function useScrollReveal(opts: { threshold?: number } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.unobserve(el); } }, { threshold: opts.threshold ?? 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, v] as const;
}

function useCountUp(target: string, active: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    const num = parseInt(target.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num) || num === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1500, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * num));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target]);
  return v;
}

function StatItem({ stat, vis }: { stat: { value: string; label: string; icon: React.ElementType }; vis: boolean }) {
  const cv = useCountUp(stat.value, vis);
  const num = parseInt(stat.value.replace(/[^0-9]/g, ''), 10);
  let d = stat.value;
  if (!isNaN(num) && num > 0) {
    if (stat.value.includes('%')) d = `${vis ? cv : 0}%`;
    else if (stat.value.includes('+')) d = `${vis ? cv : 0}+`;
  }
  return (
    <div className="text-center group">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400/20 to-blue-500/20 dark:from-sky-400/10 dark:to-blue-500/10 mb-3 group-hover:scale-110 transition-transform duration-300">
        <stat.icon className="w-5 h-5 text-sky-500" />
      </div>
      <div className="text-3xl md:text-4xl font-black gradient-text mb-1 tabular-nums" style={{ letterSpacing: '-0.04em' }}>{d}</div>
      <div className="text-[10px] md:text-[11px] text-sky-500/70 dark:text-sky-400/60 font-bold uppercase tracking-[0.15em]">{stat.label}</div>
    </div>
  );
}

function FeatureCard({ f, i }: { f: { icon: React.ElementType; title: string; desc: string; gradient: string; stats: string; badge?: string }; i: number }) {
  const [ref, vis] = useScrollReveal({ threshold: 0.15 });
  return (
    <div ref={ref} className={`reveal-up ${vis ? 'visible' : ''}`} style={{ transitionDelay: vis ? `${i * 80}ms` : '0ms' }}>
      <div className="glass-card relative h-full rounded-3xl overflow-hidden group cursor-default" style={{ boxShadow: '0 4px 30px rgba(14,165,233,0.06)' }}>
        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${f.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
        {f.badge && <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 text-[9px] font-extrabold uppercase tracking-wider">{f.badge}</div>}
        <div className="p-6">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} shadow-lg mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
            <f.icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-[17px] font-extrabold text-sky-950 dark:text-sky-100 mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors" style={{ letterSpacing: '-0.02em' }}>{f.title}</h3>
          <p className="text-sky-700/55 dark:text-sky-300/45 text-[13px] leading-relaxed mb-4" style={{ lineHeight: '1.75' }}>{f.desc}</p>
          <div className="flex items-center justify-between pt-3 border-t border-sky-100/40 dark:border-sky-800/20">
            <span className="text-[11px] font-bold text-sky-500/80 dark:text-sky-400/60">{f.stats}</span>
            <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-800/30 flex items-center justify-center group-hover:bg-sky-500 transition-colors duration-300">
              <ChevronRight className="w-3 h-3 text-sky-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorksStep({ step, i, vis }: { step: { num: string; title: string; desc: string; icon: React.ElementType; color: string }; i: number; vis: boolean }) {
  return (
    <div className={`reveal-up ${vis ? 'visible' : ''} relative`} style={{ transitionDelay: vis ? `${i * 150}ms` : '0ms' }}>
      <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`} style={{ boxShadow: `0 8px 30px ${step.color.includes('emerald') ? 'rgba(16,185,129,0.3)' : step.color.includes('sky') ? 'rgba(14,165,233,0.3)' : step.color.includes('indigo') ? 'rgba(99,102,241,0.3)' : 'rgba(168,85,247,0.3)'}` }}>
          <step.icon className="w-7 h-7 text-white" />
        </div>
        <div className="text-[10px] font-extrabold text-sky-400/60 uppercase tracking-[0.2em] mb-2">Step {step.num}</div>
        <h4 className="text-[15px] font-extrabold text-sky-950 dark:text-sky-100 mb-1.5" style={{ letterSpacing: '-0.02em' }}>{step.title}</h4>
        <p className="text-[12px] text-sky-700/50 dark:text-sky-300/40 leading-relaxed max-w-[200px]">{step.desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [heroRevealed, setHeroRevealed] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const [statsRef, statsVis] = useScrollReveal({ threshold: 0.2 });
  const [featRef, featVis] = useScrollReveal({ threshold: 0.1 });
  const [howRef, howVis] = useScrollReveal({ threshold: 0.1 });
  const [ctaRef, ctaVis] = useScrollReveal({ threshold: 0.2 });

  useEffect(() => {
    const el = heroRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setHeroRevealed(true); obs.unobserve(el); } }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const features = [
    { icon: Brain, title: "Prediksi AI Cerdas", desc: "Analisis kelayakan dengan algoritma Gradient Boosting yang telah dilatih ribuan data historis", gradient: "from-cyan-400 to-blue-500", stats: "Gradient Boosting", badge: "AI" },
    { icon: Zap, title: "Hasil Real-time", desc: "Proses prediksi selesai dalam hitungan detik, tanpa antri atau menunggu", gradient: "from-sky-400 to-blue-600", stats: "< 3 detik" },
    { icon: Shield, title: "Data Terenkripsi", desc: "Informasi pribadi Anda dilindungi enkripsi end-to-end", gradient: "from-blue-400 to-indigo-600", stats: "256-bit SSL" },
    { icon: BarChart3, title: "Analisis Mendalam", desc: "Laporan detail faktor-faktor yang mempengaruhi keputusan ML model", gradient: "from-indigo-400 to-blue-700", stats: "Full Report" },
    { icon: Target, title: "Akurasi 95%+", desc: "Model divalidasi dengan cross-validation dan monitoring performa berkelanjutan", gradient: "from-blue-500 to-cyan-600", stats: "Validated", badge: "TOP" },
    { icon: Activity, title: "MLOps Pipeline", desc: "Continuous integration, deployment dan monitoring model secara otomatis", gradient: "from-cyan-500 to-blue-700", stats: "CI/CD" },
    { icon: FileCheck, title: "Riwayat Lengkap", desc: "Semua hasil prediksi tersimpan aman dan bisa diakses kapan saja", gradient: "from-blue-600 to-indigo-800", stats: "Cloud Saved" },
    { icon: Users, title: "Multi User", desc: "Sistem akun terpisah dengan akses aman untuk setiap pengguna", gradient: "from-indigo-600 to-purple-800", stats: "Secure Access" },
  ];

  const stats = [
    { value: "95%", label: "Akurasi Model", icon: Target },
    { value: "5000+", label: "Data Training", icon: BarChart3 },
    { value: "3+", label: "Detik Proses", icon: Clock },
    { value: "100%", label: "Data Aman", icon: Shield },
  ];

  const steps = [
    { num: "01", title: "Isi Data", desc: "Masukkan informasi pribadi dan data keuangan Anda", icon: FileCheck, color: "from-sky-400 to-blue-500" },
    { num: "02", title: "Proses AI", desc: "Model Gradient Boosting menganalisis kelayakan Anda", icon: Brain, color: "from-blue-500 to-indigo-600" },
    { num: "03", title: "Hasil Prediksi", desc: "Dapatkan keputusan LAYAK atau TIDAK LAYAK", icon: Target, color: "from-indigo-500 to-purple-600" },
    { num: "04", title: "Laporan Detail", desc: "Lihat faktor pendukung dan analisis mendalam", icon: BarChart3, color: "from-emerald-400 to-green-500" },
  ];

  return (
    <div className="min-h-screen relative transition-colors duration-300 noise-overlay">
      <div className="gradient-mesh" />
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      <Header />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden" ref={heroRef}>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] dark:opacity-[0.02]">
          <svg width="100%" height="100%"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0EA5E9" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 pb-16 md:pt-20 md:pb-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="max-w-3xl text-left flex flex-col items-start w-full lg:w-[55%]">
              {/* Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100/60 dark:bg-sky-900/30 border border-sky-200/50 dark:border-sky-700/30 mb-6 transition-all duration-700 ${heroRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '50ms' }}>
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-[0.1em]">MLOps · Gradient Boosting</span>
              </div>

              <h1 className="leading-[1.05] mb-8" style={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                {['Deteksi', 'Kelayakan', 'Nasabah', 'Pinjaman'].map((w, i) => (
                  <span key={w} className={`block transition-all duration-700 ${i < 3 ? 'text-sky-950 dark:text-white' : 'gradient-text'} ${i > 0 ? 'mt-1' : ''}`}
                    style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)', opacity: heroRevealed ? 1 : 0, transform: heroRevealed ? 'translateY(0)' : 'translateY(30px)', transitionDelay: `${100 + i * 100}ms`, transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}>
                    {w}
                  </span>
                ))}
              </h1>

              <p className="text-[17px] md:text-xl font-medium text-sky-800/70 dark:text-sky-300/80 max-w-xl mb-10 transition-all duration-700"
                style={{ opacity: heroRevealed ? 1 : 0, transitionDelay: '550ms', lineHeight: '1.7' }}>
                Platform prediksi kelayakan pinjaman berbasis <strong className="text-sky-600 dark:text-sky-400">Machine Learning Operations</strong> dengan algoritma Gradient Boosting. Akurat, cepat, dan terpercaya.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto transition-all duration-700"
                style={{ opacity: heroRevealed ? 1 : 0, transform: heroRevealed ? 'translateY(0)' : 'translateY(16px)', transitionDelay: '650ms' }}>
                <Link href={isLoggedIn ? '/predict' : '/register'}
                  className="w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:-translate-y-1"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 8px 32px rgba(14,165,233,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset' }}>
                  {isLoggedIn ? 'Mulai Prediksi' : 'Mulai Sekarang'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
                <Link href={isLoggedIn ? '/dashboard' : '/login'}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 glass-card-static text-sky-800 dark:text-sky-200 hover:-translate-y-1 hover:shadow-lg">
                  {isLoggedIn ? 'Dashboard' : 'Sudah Punya Akun'}
                </Link>
              </div>
            </div>

            {/* Right: ML Visual Card */}
            <div className={`w-full lg:w-[45%] max-w-[400px] mx-auto transition-all duration-1000 ${heroRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '800ms' }}>
              <div className="gradient-border">
                <div className="glass-card-static rounded-[22px] p-8 relative overflow-hidden">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center mb-6 animate-float" style={{ boxShadow: '0 12px 40px rgba(14,165,233,0.35)' }}>
                      <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-sky-950 dark:text-sky-100 mb-1" style={{ letterSpacing: '-0.03em' }}>Gradient Boosting</h3>
                    <p className="text-xs text-sky-500/60 dark:text-sky-400/50 font-semibold mb-6">Machine Learning Operations Pipeline</p>
                    <div className="w-full space-y-2.5">
                      {[{ l: 'Akurasi Model', v: '95.7%', c: 'text-emerald-500' }, { l: 'Precision', v: '94.2%', c: 'text-blue-500' }, { l: 'Recall', v: '93.8%', c: 'text-indigo-500' }, { l: 'F1-Score', v: '94.0%', c: 'text-purple-500' }].map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-sky-50/60 dark:bg-sky-900/20 border border-sky-100/30 dark:border-sky-800/20">
                          <span className="text-xs font-bold text-sky-700/70 dark:text-sky-300/60">{m.l}</span>
                          <span className={`text-sm font-black ${m.c}`}>{m.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Decorative corner */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-sky-400/10 to-indigo-400/10" />
                  <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-400/10" />
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-2 right-4 glass-card-static rounded-2xl px-4 py-2.5 flex items-center gap-2 animate-float-slow" style={{ boxShadow: '0 8px 24px rgba(14,165,233,0.12)' }}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>
                <div><p className="text-[11px] font-extrabold text-sky-900 dark:text-sky-100">MLOps Ready</p><p className="text-[9px] text-sky-500/60 font-bold">Auto Pipeline</p></div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className={`hidden md:flex justify-center mt-12 transition-all duration-700 ${heroRevealed ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '1200ms' }}>
            <div className="flex flex-col items-center gap-2 animate-float">
              <span className="text-[10px] font-bold text-sky-400/50 uppercase tracking-[0.2em]">Scroll</span>
              <ChevronDown className="w-4 h-4 text-sky-400/40" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="relative px-4 md:px-6 py-8 md:py-12">
        <div ref={statsRef} className={`reveal-up max-w-4xl mx-auto glass-card-static rounded-3xl py-10 px-6 md:px-16 ${statsVis ? 'visible' : ''}`} style={{ boxShadow: '0 8px 50px rgba(14,165,233,0.08)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className={`reveal-up ${statsVis ? 'visible' : ''}`} style={{ transitionDelay: statsVis ? `${i * 100}ms` : '0ms' }}>
                <StatItem stat={s} vis={statsVis} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div ref={featRef} className={`reveal-up text-center mb-12 md:mb-16 ${featVis ? 'visible' : ''}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/50 dark:bg-sky-900/20 border border-sky-200/40 dark:border-sky-700/20 mb-4">
              <Sparkles className="w-3 h-3 text-sky-500" />
              <span className="text-[10px] font-bold text-sky-500/80 uppercase tracking-[0.15em]">Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-sky-950 dark:text-sky-100 mb-3" style={{ letterSpacing: '-0.04em' }}>Fitur Unggulan Platform</h2>
            <p className="text-sky-700/50 dark:text-sky-300/40 text-sm md:text-base max-w-lg mx-auto">Teknologi ML terdepan untuk analisis kelayakan pinjaman yang presisi</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => <FeatureCard key={i} f={f} i={i} />)}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="relative py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div ref={howRef} className={`reveal-up text-center mb-12 md:mb-16 ${howVis ? 'visible' : ''}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/50 dark:bg-sky-900/20 border border-sky-200/40 dark:border-sky-700/20 mb-4">
              <Activity className="w-3 h-3 text-sky-500" />
              <span className="text-[10px] font-bold text-sky-500/80 uppercase tracking-[0.15em]">How it works</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-sky-950 dark:text-sky-100 mb-3" style={{ letterSpacing: '-0.04em' }}>Cara Kerja Platform</h2>
            <p className="text-sky-700/50 dark:text-sky-300/40 text-sm md:text-base max-w-lg mx-auto">Empat langkah sederhana untuk mendapatkan hasil prediksi</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-sky-300/30 via-indigo-300/30 to-emerald-300/30 dark:from-sky-700/20 dark:via-indigo-700/20 dark:to-emerald-700/20" />
            {steps.map((s, i) => <HowItWorksStep key={i} step={s} i={i} vis={howVis} />)}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-16 md:py-24 px-4 md:px-6">
        <div ref={ctaRef} className={`reveal-scale max-w-3xl mx-auto ${ctaVis ? 'visible' : ''}`}>
          <div className="gradient-border">
            <div className="glass-card-static rounded-[22px] p-8 md:p-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 to-indigo-400/5" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center mx-auto mb-6" style={{ boxShadow: '0 12px 32px rgba(14,165,233,0.3)' }}>
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-sky-950 dark:text-sky-100 mb-3" style={{ letterSpacing: '-0.04em' }}>Siap Cek Kelayakan?</h2>
                <p className="text-sky-700/50 dark:text-sky-300/40 text-sm md:text-base max-w-md mx-auto mb-8">Daftar gratis dan dapatkan hasil prediksi kelayakan pinjaman Anda dalam hitungan detik.</p>
                <Link href={isLoggedIn ? '/predict' : '/register'}
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:-translate-y-1"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 8px 32px rgba(14,165,233,0.4)' }}>
                  {isLoggedIn ? 'Mulai Prediksi' : 'Daftar Gratis'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
