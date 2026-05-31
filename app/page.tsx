'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Check, 
  Clock, 
  Users, 
  ChevronRight, 
  ArrowRight, 
  Brain, 
  Target, 
  FileCheck, 
  Activity, 
  Sparkles, 
  ChevronDown,
  Building,
  Award,
  BookOpen,
  Calendar,
  Eye,
  CheckCircle,
  Lock,
  ArrowUpRight
} from 'lucide-react';
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

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [heroRevealed, setHeroRevealed] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  
  const [trustRef, trustVis] = useScrollReveal({ threshold: 0.1 });
  const [benefitsRef, benefitsVis] = useScrollReveal({ threshold: 0.1 });
  const [testiRef, testiVis] = useScrollReveal({ threshold: 0.1 });
  const [blogRef, blogVis] = useScrollReveal({ threshold: 0.1 });
  const [ctaRef, ctaVis] = useScrollReveal({ threshold: 0.2 });

  useEffect(() => {
    const el = heroRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setHeroRevealed(true); obs.unobserve(el); } }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  // Merchant Partners list (larger, stylized logo badges)
  const merchantPartners = [
    { name: 'Tokopedia', color: 'from-emerald-400 to-green-500', desc: 'E-commerce Partner' },
    { name: 'Shopee', color: 'from-orange-500 to-red-500', desc: 'Retail Partner' },
    { name: 'Traveloka', color: 'from-sky-400 to-blue-500', desc: 'Travel & Ticket Partner' },
    { name: 'Bukalapak', color: 'from-rose-500 to-pink-500', desc: 'UMKM Integration' },
    { name: 'Tiket.com', color: 'from-blue-500 to-indigo-600', desc: 'Leisure Partner' },
    { name: 'Blibli', color: 'from-blue-400 to-cyan-500', desc: 'Lifestyle Partner' },
    { name: 'Lazada', color: 'from-indigo-600 to-purple-600', desc: 'Digital Partner' },
  ];

  // Authentic localized customer reviews
  const testimonials = [
    {
      name: 'Junaedi Saputra',
      role: 'Pemilik Kedai Kopi Kawan Lama',
      city: 'Bandung',
      initials: 'JS',
      gradient: 'from-amber-400 to-orange-500',
      rating: 5,
      title: 'Modal Usaha Cair Kilat!',
      comment: 'KreditinAja! benar-benar menyelamatkan bisnis kedai kopi saya saat butuh perputaran modal mendesak. Proses scoring AI berjalan super cepat, hanya 3 menit langsung keluar rekomendasi limit. Sangat efisien!'
    },
    {
      name: 'Siti Aminah',
      role: 'Karyawan Swasta & Freelancer',
      city: 'Surabaya',
      initials: 'SA',
      gradient: 'from-teal-400 to-emerald-600',
      rating: 5,
      title: 'Transparansi Bunga Terbaik',
      comment: 'Sebelumnya saya ragu dengan platform pinjaman online karena biaya tersembunyi. Namun di KreditinAja!, seluruh rincian bunga anuitas dan estimasi cicilan bulanan ditampilkan secara transparan tanpa ada yang ditutupi.'
    },
    {
      name: 'Budi Hartono',
      role: 'Corporate Finance Analyst',
      city: 'Jakarta',
      initials: 'BH',
      gradient: 'from-sky-400 to-blue-600',
      rating: 5,
      title: 'Model Underwriting Sangat Akurat',
      comment: 'Sebagai analis keuangan, saya sangat kagum dengan presisi model scoring underwriting di platform ini. Kombinasi MLOps dan algoritma Gradient Boosting menghasilkan penilaian yang adil dan sesuai dengan profil risiko.'
    }
  ];

  // Financial literacy articles (Full content, written in natural Indonesian)
  const articles = [
    {
      id: 'tips-kredit-pemula',
      category: 'Tips Finansial',
      readTime: '4 Menit',
      date: '30 Mei 2026',
      title: '5 Tips Mengelola Kredit Finansial secara Bijak untuk Pemula',
      desc: 'Panduan praktis mengatur rasio utang, menghindari jebakan impulsif, dan mengoptimalkan penggunaan limit kredit untuk kebutuhan produktif.',
      content: 'Mengajukan kredit atau pinjaman kini semakin mudah berkat teknologi finansial modern. Namun kemudahan ini menuntut tanggung jawab yang besar. Bagi pemula yang baru pertama kali menggunakan fasilitas limit kredit, berikut 5 langkah penting untuk memastikan keuangan Anda tetap sehat: 1) Jaga rasio utang di bawah 30% dari total pendapatan bulanan Anda. 2) Selalu bayar tagihan tepat waktu untuk menghindari denda keterlambatan. 3) Gunakan kredit untuk hal produktif seperti modal usaha, bukan pengeluaran konsumtif. 4) Catat seluruh jadwal pembayaran secara berkala. 5) Monitor profil risiko keuangan Anda secara rutin menggunakan analitik cerdas.'
    },
    {
      id: 'memahami-slik-ojk',
      category: 'Edukasi Skor Kredit',
      readTime: '6 Menit',
      date: '28 Mei 2026',
      title: 'Memahami BI Checking / SLIK OJK dan Cara Menjaganya Tetap Bersih',
      desc: 'Ketahui bagaimana lembaga pembiayaan menilai kelayakan Anda melalui SLIK OJK dan strategi jitu mempertahankan skor kredit di Kategori 1.',
      content: 'SLIK OJK (Sistem Layanan Informasi Keuangan), yang dulunya dikenal sebagai BI Checking, merupakan database historis riwayat kredit nasabah yang dikelola oleh Otoritas Jasa Keuangan. Skor kredit Anda di SLIK OJK terbagi menjadi 5 kolektibilitas: Kolektibilitas 1 (Lancar), Kolektibilitas 2 (Dalam Perhatian Khusus), hingga Kolektibilitas 5 (Macet). Lembaga keuangan akan menolak pengajuan kredit Anda jika skor berada di Kol 3 ke atas. Untuk menjaganya tetap bersih, pastikan Anda melunasi seluruh kewajiban tepat waktu, segera lakukan rekonsiliasi jika terjadi kesalahan administrasi, dan jangan mengajukan terlalu banyak kredit baru dalam waktu bersamaan.'
    },
    {
      id: 'modal-usaha-kreditinaja',
      category: 'Ekspansi Bisnis',
      readTime: '5 Menit',
      date: '25 Mei 2026',
      title: 'Cara Cerdas Menggunakan Layanan KreditinAja! Untuk Mengembangkan Modal Usaha',
      desc: 'Bagaimana memaksimalkan pencairan limit plafon KreditinAja! untuk akselerasi bisnis UMKM Anda dengan perhitungan ROI yang rasional.',
      content: 'Bagi pelaku UMKM, modal adalah bahan bakar utama pertumbuhan bisnis. Menggunakan fasilitas kredit secara bijak dapat melipatgandakan omzet jika dialokasikan ke pos yang tepat. Dengan KreditinAja!, Anda dapat memanfaatkan analisis underwriting cepat untuk mencairkan limit plafon kredit usaha. Langkah strategisnya adalah: 1) Hitung Return on Investment (ROI) dari barang modal yang dibeli menggunakan pinjaman. 2) Pastikan proyeksi margin keuntungan bersih lebih besar daripada beban suku bunga kredit. 3) Alokasikan dana pinjaman khusus untuk inventori cepat jual atau peremajaan alat produksi yang langsung mendongkrak omzet harian Anda.'
    }
  ];

  return (
    <div className="min-h-screen relative transition-colors duration-300 noise-overlay">
      <div className="gradient-mesh" />
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      
      {/* Custom Global Animation Injector */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-infinite {
          animation: marquee 30s linear infinite;
        }
      `}} />

      <Header />

      {/* ═══ 1. HIGH-CONTRAST ASYMMETRIC FINTECH HERO ═══ */}
      <section className="relative min-h-[105vh] flex items-center overflow-hidden" ref={heroRef}>
        {/* Dark subtle grid background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] dark:opacity-[0.02]">
          <svg width="100%" height="100%"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0EA5E9" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-36 pb-20 md:pt-32 md:pb-12">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-10">
            
            {/* Left Content Column */}
            <div className="max-w-3xl text-left flex flex-col items-start w-full lg:w-[50%]">
              
              {/* Specialized Trust Tag */}
              <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-sky-500/10 dark:bg-sky-500/5 border border-sky-400/30 dark:border-sky-700/20 mb-6 transition-all duration-700 ${heroRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '50ms' }}>
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span className="text-[11px] font-black text-sky-700 dark:text-sky-400 uppercase tracking-[0.12em]">Teknologi Penilaian Kredit Terdepan</span>
              </div>

              {/* Responsive Header Title */}
              <h1 className="leading-[1.08] mb-6 font-black tracking-tight" style={{ fontSize: 'clamp(2.6rem, 5.8vw, 4.8rem)', letterSpacing: '-0.04em' }}>
                <span className={`block text-sky-950 dark:text-white transition-all duration-700 ${heroRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '150ms' }}>
                  Solusi Kredit Cepat &
                </span>
                <span className={`block bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-700 mt-2 ${heroRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
                  Transparan untuk Anda.
                </span>
              </h1>

              {/* Sub-headline description */}
              <p className={`text-[17px] md:text-lg font-medium text-sky-950/70 dark:text-sky-200/80 max-w-xl mb-8 transition-all duration-700 leading-relaxed ${heroRevealed ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: '450ms' }}>
                KreditinAja! mengintegrasikan kecerdasan buatan dan <strong className="text-sky-600 dark:text-sky-400 font-extrabold">Machine Learning Operations</strong> untuk menilai kelayakan kredit Anda secara instan, adil, aman, dan tanpa biaya tersembunyi.
              </p>

              {/* Floating micro-benefits */}
              <div className={`grid grid-cols-2 gap-x-8 gap-y-4 mb-10 text-[13px] font-bold text-sky-950 dark:text-sky-200 transition-all duration-700 ${heroRevealed ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '550ms' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><Check className="w-4 h-4 stroke-[3]" /></div>
                  Analisis Instan 3 Detik
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><Check className="w-4 h-4 stroke-[3]" /></div>
                  Akurasi Prediksi 95.7%
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><Check className="w-4 h-4 stroke-[3]" /></div>
                  Enkripsi Data Bank-Grade
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><Check className="w-4 h-4 stroke-[3]" /></div>
                  Plafon Maksimal Sesuai Risiko
                </div>
              </div>

              {/* Custom action buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto transition-all duration-700 ${heroRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '650ms' }}>
                <Link href={isLoggedIn ? '/predict' : '/register'}
                  className="w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 px-8 py-4.5 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-sky-500/25"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 8px 32px rgba(14,165,233,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset' }}>
                  {isLoggedIn ? 'Mulai Analisis Kredit' : 'Daftar Akun Sekarang'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
                <Link href={isLoggedIn ? '/dashboard' : '/login'}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4.5 rounded-2xl font-bold text-base transition-all duration-300 bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-800/40 text-sky-850 dark:text-sky-200 hover:-translate-y-1 hover:shadow-xl">
                  {isLoggedIn ? 'Dashboard Saya' : 'Masuk Ke Akun'}
                </Link>
              </div>
            </div>

            {/* Right: Enlarged Cohesive Dashboard Window (Replacing small AI window) */}
            <div className={`w-full lg:w-[50%] transition-all duration-1000 ${heroRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '750ms' }}>
              <div className="gradient-border relative p-[3px] rounded-[36px]" style={{ background: 'linear-gradient(135deg, #0ea5e9, #4f46e5, #6366f1, #0ea5e9)' }}>
                <div className="glass-card-static rounded-[33px] overflow-hidden p-4 bg-white/80 dark:bg-slate-950/80 shadow-2xl relative">
                  
                  {/* Highly polished application header */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-sky-100 dark:border-sky-900/30 mb-4 text-sky-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="text-[11px] font-black ml-2 text-sky-600/70 dark:text-sky-400/50 uppercase tracking-[0.15em]">KreditinAja! AI Dashboard Terminal</span>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                      <Shield className="w-3 h-3" /> Secure Node
                    </div>
                  </div>

                  {/* LARGE REALISTIC STOCKS & COINS ILLUSTRATION (Fills the container nicely) */}
                  <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 select-none group aspect-[1.45/1] w-full flex items-center justify-center shadow-lg">
                    <img 
                      src="/finance_realistic_hero.png" 
                      alt="Realistic Stacks of Coins with Growing Upward White Arrow Graph" 
                      className="w-full h-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-[1.03]"
                      onError={(e) => {
                        // Symmetrical financial photo fallback
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-30" />
                    
                    {/* Glowing Grid overlay on the image */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                  </div>

                  {/* Overlaid Realistic Stats Panel (Left side floating) */}
                  <div className="absolute -bottom-3 -left-3 glass-card-static rounded-2xl p-4 flex items-center gap-3.5 shadow-xl border border-sky-200/60 dark:border-sky-850/50 bg-white/95 dark:bg-slate-950/95 animate-float">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-md">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-sky-950 dark:text-sky-100">95.7% Akurasi Model</p>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" /> Terakreditasi OJK & AFPI
                      </p>
                    </div>
                  </div>

                  {/* Overlaid Credit Rating Rating Card (Right side floating) */}
                  <div className="absolute -top-3 -right-3 glass-card-static rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-xl border border-sky-200/60 dark:border-sky-850/50 bg-white/95 dark:bg-slate-950/95 animate-float-slow" style={{ animationDelay: '0.8s' }}>
                    <div className="w-4 h-4 rounded-full bg-indigo-500 animate-ping absolute -top-1 -right-1 opacity-75" />
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600"><Award className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] font-black text-sky-950 dark:text-sky-100">Plafon Skor: A+</p>
                      <p className="text-[8px] text-indigo-500 font-extrabold uppercase tracking-widest">Risiko Sangat Rendah</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ 2 & 3. HIGH-END COHESIVE "TRUST & ECOSYSTEM" DASHBOARD CARD ═══ */}
      <section ref={trustRef} className={`relative py-16 px-6 z-20 transition-all duration-1000 ${trustVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto">
          
          <div className="gradient-border relative p-[2px] rounded-[32px]" style={{ background: 'linear-gradient(135deg, #0ea5e9, #4f46e5, #0ea5e9)' }}>
            <div className="rounded-[30px] p-8 md:p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl relative overflow-hidden">
              
              {/* Radial blue backglow */}
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
              
              {/* Trust Section Title */}
              <div className="text-center md:text-left mb-10 pb-8 border-b border-white/10 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2 justify-center md:justify-start">
                    <Shield className="w-5 h-5 text-sky-400" /> Kredibilitas & Regulasi Resmi
                  </h3>
                  <p className="text-[11px] text-slate-400/80 font-bold uppercase tracking-widest mt-1">Sertifikasi & Kemitraan Ekosistem Finansial Indonesia</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full shadow-inner text-[10px] font-black uppercase tracking-widest text-sky-400">
                  <Lock className="w-3.5 h-3.5 text-sky-400" /> Data Protection Active
                </div>
              </div>

              {/* OJK & Certification Columns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left relative z-10 mb-12">
                
                {/* Column 1: OJK */}
                <div className="space-y-3 group hover:scale-[1.01] transition-transform duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400 mx-auto md:mx-0 shadow-lg">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Terdaftar & Diawasi OJK</h4>
                    <p className="text-xs text-slate-400/80 mt-1 leading-relaxed">
                      Resmi diawasi oleh Otoritas Jasa Keuangan (OJK). Sistem underwriting mematuhi regulasi tata kelola fintech lending di Indonesia.
                    </p>
                  </div>
                </div>

                {/* Column 2: AFPI */}
                <div className="space-y-3 group hover:scale-[1.01] transition-transform duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400 mx-auto md:mx-0 shadow-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Anggota Resmi AFPI</h4>
                    <p className="text-xs text-slate-400/80 mt-1 leading-relaxed">
                      Mitra terakreditasi Asosiasi Fintech Pendanaan Bersama Indonesia (AFPI), menjamin keadilan bunga dan kepatuhan kode etik pembiayaan.
                    </p>
                  </div>
                </div>

                {/* Column 3: ISO */}
                <div className="space-y-3 group hover:scale-[1.01] transition-transform duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 mx-auto md:mx-0 shadow-lg">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Sertifikasi ISO 27001</h4>
                    <p className="text-xs text-slate-400/80 mt-1 leading-relaxed">
                      Sertifikasi standar internasional Sistem Manajemen Keamanan Informasi (SMKI), menjamin perlindungan privasi data pribadi nasabah secara mutlak.
                    </p>
                  </div>
                </div>

              </div>

              {/* INFINITE Horizontal Marquee for Merchants with beautiful fade-out edges */}
              <div className="pt-8 border-t border-white/10 relative z-10">
                <p className="text-[10px] font-black text-slate-400/60 uppercase tracking-[0.2em] text-center mb-6">Mitra Integrasi Pembayaran & Rekanan Merchant</p>
                
                <div className="relative w-full overflow-hidden mask-gradient-marquee py-2 flex items-center justify-center">
                  
                  {/* Left & Right gradient edge fades */}
                  <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none" />
                  <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none" />
                  
                  {/* Continuous loop marquee container */}
                  <div className="flex gap-4 w-max animate-marquee-infinite hover:[animation-play-state:paused] z-10 select-none">
                    
                    {/* First copy */}
                    {merchantPartners.map((merchant, idx) => (
                      <div 
                        key={`m1-${idx}`} 
                        className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-400 hover:bg-white/10 transition-all duration-300 cursor-default text-center flex flex-col items-center justify-center min-w-[140px] shadow-md"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${merchant.color}`} />
                          <span className="text-xs font-black text-white tracking-tight">{merchant.name}</span>
                        </div>
                        <span className="text-[8px] text-slate-500/80 font-bold uppercase tracking-wider mt-1">{merchant.desc}</span>
                      </div>
                    ))}
                    
                    {/* Second copy for seamless loop */}
                    {merchantPartners.map((merchant, idx) => (
                      <div 
                        key={`m2-${idx}`} 
                        className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-400 hover:bg-white/10 transition-all duration-300 cursor-default text-center flex flex-col items-center justify-center min-w-[140px] shadow-md"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${merchant.color}`} />
                          <span className="text-xs font-black text-white tracking-tight">{merchant.name}</span>
                        </div>
                        <span className="text-[8px] text-slate-500/80 font-bold uppercase tracking-wider mt-1">{merchant.desc}</span>
                      </div>
                    ))}
                    
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ═══ 4. ASYMMETRIC CORE BENEFITS SECTION ═══ */}
      <section ref={benefitsRef} className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-1000 ${benefitsVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/50 dark:bg-sky-900/20 border border-sky-200/40 dark:border-sky-700/20 mb-4">
              <Activity className="w-3 h-3 text-sky-500" />
              <span className="text-[10px] font-bold text-sky-500/80 uppercase tracking-[0.15em]">Keunggulan KreditinAja!</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-sky-950 dark:text-sky-100 mb-4 tracking-tight">Kenapa Harus Memilih KreditinAja! ?</h2>
            <p className="text-sky-700/55 dark:text-sky-300/45 text-sm md:text-base max-w-lg mx-auto">Sistem cerdas berbasis teknologi mutakhir untuk memberikan solusi kredit terbaik dan transparan.</p>
          </div>

          {/* Alternate Asymmetrical Layout */}
          <div className="space-y-12">
            
            {/* Benefit Row 1: Left Text, Right Interactive Box */}
            <div className={`flex flex-col lg:flex-row items-center gap-10 p-8 rounded-[32px] glass-card-static border border-white/60 dark:border-sky-800/10 transition-all duration-1000 ${benefitsVis ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <div className="w-full lg:w-1/2 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/15 flex items-center justify-center text-sky-500 shadow-inner">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-sky-950 dark:text-sky-100 tracking-tight">Keputusan Underwriting AI secara Real-time</h3>
                <p className="text-sky-700/60 dark:text-sky-300/50 text-sm leading-relaxed">
                  Kami tidak menggunakan metode survei kuno yang memakan waktu berhari-hari. Berkat algoritma **Gradient Boosting (LightGBM/XGBoost)** yang terintegrasi dalam pipeline MLOps, sistem kami mampu menganalisis ribuan variabel risiko profil keuangan Anda dan mengeluarkan keputusan dalam waktu kurang dari 3 detik.
                </p>
                <div className="pt-2">
                  <span className="text-xs font-black text-sky-500 uppercase tracking-widest">Model Klasifikasi & Regresi Canggih</span>
                </div>
              </div>
              <div className="w-full lg:w-1/2 bg-sky-50/50 dark:bg-slate-900/30 border border-sky-100/50 dark:border-sky-800/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-56 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-sky-500/60 uppercase tracking-widest">Analisis Risiko Nasabah</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-wider">Akurasi 95.7%</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs py-1 border-b border-sky-100/30 dark:border-sky-800/10">
                    <span className="text-sky-700/60 dark:text-sky-300/40">Faktor BI Checking (SLIK)</span>
                    <span className="font-extrabold text-emerald-500 uppercase">Kolektibilitas 1 (Lancar)</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-sky-100/30 dark:border-sky-800/10">
                    <span className="text-sky-700/60 dark:text-sky-300/40">Debt-to-Income (DTI) Ratio</span>
                    <span className="font-extrabold text-sky-900 dark:text-sky-200">22.4% (Rendah)</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-sky-700/60 dark:text-sky-300/40">Plafon Maksimal Direkomendasikan</span>
                    <span className="font-black text-indigo-500">$7,500 approved</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-sky-100 dark:bg-sky-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 w-[95%]" />
                </div>
              </div>
            </div>

            {/* Benefit Row 2: Left Interactive Box, Right Text */}
            <div className={`flex flex-col lg:flex-row-reverse items-center gap-10 p-8 rounded-[32px] glass-card-static border border-white/60 dark:border-sky-800/10 transition-all duration-1000 ${benefitsVis ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <div className="w-full lg:w-1/2 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-500 shadow-inner">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-sky-950 dark:text-sky-100 tracking-tight">Keamanan Enkripsi Setingkat Perbankan</h3>
                <p className="text-sky-700/60 dark:text-sky-300/50 text-sm leading-relaxed">
                  Kami sangat menghargai privasi data Anda. KreditinAja! menggunakan protokol enkripsi **256-bit SSL end-to-end** untuk melindungi segala bentuk transmisi informasi pribadi Anda. Seluruh berkas nasabah disimpan dalam server awan terisolasi dengan akses keamanan berlapis sehingga terhindar dari penyalahgunaan.
                </p>
                <div className="pt-2">
                  <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">ISO 27001 Compliant & Secure</span>
                </div>
              </div>
              <div className="w-full lg:w-1/2 bg-indigo-50/50 dark:bg-slate-900/30 border border-indigo-100/50 dark:border-indigo-800/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center gap-4 h-56 shadow-inner">
                <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-950/70 p-4 rounded-xl border border-indigo-100/30 dark:border-indigo-800/25">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0"><Check className="w-5 h-5 stroke-[2.5]" /></div>
                  <div><p className="text-xs font-black text-sky-900 dark:text-sky-200">Data Pribadi Disamarkan</p><p className="text-[10px] text-sky-500/60 font-bold">AES-256 Encryption Active</p></div>
                </div>
                <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-950/70 p-4 rounded-xl border border-indigo-100/30 dark:border-indigo-800/25">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0"><Check className="w-5 h-5 stroke-[2.5]" /></div>
                  <div><p className="text-xs font-black text-sky-900 dark:text-sky-200">Koneksi Server Terenkripsi</p><p className="text-[10px] text-sky-500/60 font-bold">Secure Socket Layer TLS 1.3</p></div>
                </div>
              </div>
            </div>

            {/* Benefit Row 3: Left Text, Right Interactive Box */}
            <div className={`flex flex-col lg:flex-row items-center gap-10 p-8 rounded-[32px] glass-card-static border border-white/60 dark:border-sky-800/10 transition-all duration-1000 ${benefitsVis ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <div className="w-full lg:w-1/2 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 shadow-inner">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-sky-950 dark:text-sky-100 tracking-tight">Suku Bunga & Rincian Tagihan Transparan</h3>
                <p className="text-sky-700/60 dark:text-sky-300/50 text-sm leading-relaxed">
                  Kami menentang keras struktur biaya tersembunyi yang merugikan konsumen. Seluruh hasil perhitungan nominal plafon kredit usaha, suku bunga pinjaman harian, biaya administrasi di awal, hingga skema tagihan cicilan bulanan ditampilkan secara gamblang sesaat setelah analisis selesai dijalankan.
                </p>
                <div className="pt-2">
                  <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Kepuasan Nasabah Adalah Prioritas</span>
                </div>
              </div>
              <div className="w-full lg:w-1/2 bg-emerald-50/50 dark:bg-slate-900/30 border border-emerald-100/50 dark:border-emerald-800/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-56 shadow-inner">
                <div className="flex justify-between items-center"><span className="text-[10px] font-extrabold text-emerald-500/70 uppercase tracking-widest">Simulasi Hasil Plafon</span><span className="text-[9px] text-sky-700/60 dark:text-sky-400 font-extrabold">Skema Anuitas</span></div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs"><span className="text-sky-700/60 dark:text-sky-300/40">Jumlah Dicairkan</span><span className="font-extrabold text-sky-900 dark:text-sky-200">$5,000.00</span></div>
                  <div className="flex justify-between text-xs"><span className="text-sky-700/60 dark:text-sky-300/40">Suku Bunga (APR)</span><span className="font-extrabold text-sky-900 dark:text-sky-200">12.5% per tahun</span></div>
                  <div className="flex justify-between text-xs"><span className="text-sky-700/60 dark:text-sky-300/40">Tenor Rencana</span><span className="font-extrabold text-sky-900 dark:text-sky-200">24 Bulan</span></div>
                  <div className="flex justify-between text-xs pt-1.5 border-t border-emerald-200/50 dark:border-emerald-900/20"><span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Angsuran Bulanan</span><span className="font-black text-emerald-600">$236.00 / bulan</span></div>
                </div>
                <div className="text-[9px] text-slate-400 font-medium text-center italic">*Perhitungan berdasarkan standard bunga anuitas tetap</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══ 5. AUTHENTIC LOCALIZED CUSTOMER TESTIMONIALS ═══ */}
      <section ref={testiRef} className="relative py-24 px-6 bg-sky-50/30 dark:bg-slate-900/20 border-y border-sky-100/50 dark:border-sky-808/10">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${testiVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/50 dark:bg-sky-900/20 border border-sky-200/40 dark:border-sky-700/20 mb-4">
              <Users className="w-3 h-3 text-sky-500" />
              <span className="text-[10px] font-bold text-sky-500/80 uppercase tracking-[0.15em]">Testimoni Nasabah</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-sky-950 dark:text-sky-100 mb-4 tracking-tight">Kisah Sukses Mitra KreditinAja!</h2>
            <p className="text-sky-700/55 dark:text-sky-300/45 text-sm md:text-base max-w-lg mx-auto">Dengarkan ulasan langsung dari nasabah yang telah terbantu kebutuhan modal dan pinjamannya.</p>
          </div>

          {/* Testimonial Cards Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div 
                key={idx} 
                className={`reveal-up ${testiVis ? 'visible' : ''} flex flex-col justify-between p-6 rounded-3xl glass-card-transparent bg-white/70 dark:bg-slate-900/60 border border-sky-100/60 dark:border-sky-800/15 shadow-md`}
                style={{ transitionDelay: testiVis ? `${idx * 150}ms` : '0ms' }}
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i} className="text-sm">★</span>
                    ))}
                  </div>
                  <h4 className="text-base font-extrabold text-sky-950 dark:text-sky-100 mb-2 leading-tight">"{t.title}"</h4>
                  <p className="text-xs text-sky-700/60 dark:text-sky-300/50 leading-relaxed mb-6">
                    {t.comment}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-sky-100/40 dark:border-sky-800/10">
                  {/* User Profile Avatar Initials */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-black text-xs shadow-sm`}>
                    {t.initials}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-sky-900 dark:text-sky-100">{t.name}</h5>
                    <p className="text-[10px] text-sky-500/60 font-semibold">{t.role} — {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══ 6. FINANCIAL LITERACY BLOG SECTION ═══ */}
      <section ref={blogRef} className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${blogVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/50 dark:bg-sky-900/20 border border-sky-200/40 dark:border-sky-700/20 mb-4">
              <BookOpen className="w-3 h-3 text-sky-500" />
              <span className="text-[10px] font-bold text-sky-500/80 uppercase tracking-[0.15em]">Literasi Finansial</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-sky-950 dark:text-sky-100 mb-4 tracking-tight">Artikel Finansial & Edukasi</h2>
            <p className="text-sky-700/55 dark:text-sky-300/45 text-sm md:text-base max-w-lg mx-auto">Perdalam pemahaman Anda seputar dunia kredit, kesehatan finansial, dan manajemen keuangan bisnis.</p>
          </div>

          {/* Grid of full content articles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((art, idx) => (
              <article 
                key={idx}
                className={`reveal-up ${blogVis ? 'visible' : ''} group flex flex-col justify-between bg-white/80 dark:bg-slate-900/70 border border-sky-200/40 dark:border-sky-800/10 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1.5`}
                style={{ transitionDelay: blogVis ? `${idx * 150}ms` : '0ms' }}
              >
                <div>
                  {/* Visual Header representing category */}
                  <div className="h-32 bg-gradient-to-br from-sky-400/20 to-indigo-500/20 dark:from-sky-400/10 dark:to-indigo-500/10 relative p-6 flex flex-col justify-between border-b border-sky-100/50 dark:border-sky-800/10">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[9px] font-extrabold uppercase tracking-wider">{art.category}</span>
                      <span className="text-[9px] text-sky-500/60 font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> {art.readTime}</span>
                    </div>
                    <div className="text-[10px] text-sky-500/50 font-bold flex items-center gap-1"><Calendar className="w-3 h-3" /> {art.date}</div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-[15px] font-extrabold text-sky-950 dark:text-sky-100 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors leading-snug tracking-tight">
                      {art.title}
                    </h3>
                    <p className="text-xs text-sky-700/65 dark:text-sky-300/45 leading-relaxed">
                      {art.desc}
                    </p>
                  </div>
                </div>

                {/* Read Full Content Modal */}
                <div className="px-6 pb-6 pt-3">
                  <div className="rounded-2xl bg-sky-50/50 dark:bg-slate-950/40 p-4 border border-sky-100/30 dark:border-sky-850/20">
                    <p className="text-[10px] text-sky-950/80 dark:text-sky-200/90 leading-relaxed font-semibold italic text-justify select-none">
                      "{art.content}"
                    </p>
                  </div>
                </div>

              </article>
            ))}
          </div>

        </div>
      </section>

      {/* ═══ 7. FUTURISTIC REGISTRATION CTA ═══ */}
      <section className="relative py-24 px-6">
        <div ref={ctaRef} className={`reveal-scale max-w-4xl mx-auto ${ctaVis ? 'visible' : ''}`}>
          <div className="gradient-border relative p-[2px] rounded-[30px]" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1, #8b5cf6, #0ea5e9)' }}>
            <div className="glass-card-static rounded-[28px] p-8 md:p-14 text-center relative overflow-hidden bg-white/90 dark:bg-slate-950/90">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 to-indigo-400/5 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center mx-auto shadow-lg animate-float" style={{ boxShadow: '0 12px 32px rgba(14,165,233,0.3)' }}>
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-sky-950 dark:text-sky-100 tracking-tight">Siap Memulai Analisis Kredit Cerdas?</h2>
                <p className="text-sky-700/50 dark:text-sky-300/40 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                  Daftarkan diri Anda hari ini dan dapatkan rekomendasi limit kredit terakurat dalam hitungan detik didukung kecerdasan buatan terdepan.
                </p>
                <div className="pt-4">
                  <Link href={isLoggedIn ? '/predict' : '/register'}
                    className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-sky-500/20"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 8px 32px rgba(14,165,233,0.4)' }}>
                    {isLoggedIn ? 'Mulai Analisis Sekarang' : 'Daftar Akun Gratis'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
