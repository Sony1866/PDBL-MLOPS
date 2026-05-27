'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, ClipboardList, CheckCircle2, XCircle, Target,
  BarChart3, Menu, TrendingUp, DollarSign, Brain, Activity,
  Shield, Sparkles, RefreshCw
} from 'lucide-react';
import AdminSidebar from './components/AdminSidebar';
import DataTable from './components/DataTable';
import { PieChart, BarChart, LineChart, HistogramChart } from './components/EDACharts';

/* ─── Types ─── */
interface UserData {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  profile: { profileCompleted: boolean; employment?: string; monthlyIncome?: string; education?: string; age?: string; gender?: string };
}
interface PredictionData {
  id: string;
  date: string;
  loanAmount: string;
  loanTerm: string;
  result: 'LAYAK' | 'TIDAK LAYAK';
  confidence: number;
  inputData: Record<string, string>;
  plafon?: number;
  cicilanPerBulan?: number;
  alasanPenolakan?: string[];
  catatanRisiko?: string;
  userId?: string;
  userName?: string;
}

/* ─── Helpers ─── */
function getAllUsersFromStorage(): UserData[] {
  try { return JSON.parse(localStorage.getItem('mlops_users') || '[]'); }
  catch { return []; }
}
function getAllPredictionsFromStorage(users: UserData[]): PredictionData[] {
  const all: PredictionData[] = [];
  users.forEach(u => {
    try {
      const preds = JSON.parse(localStorage.getItem(`mlops_predictions_${u.id}`) || '[]');
      preds.forEach((p: PredictionData) => { all.push({ ...p, userId: u.id, userName: u.fullName }); });
    } catch { /* skip */ }
  });
  // Sort newest first
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return all;
}

/* ═══════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth check & load data
  useEffect(() => {
    const session = localStorage.getItem('mlops_admin_session');
    if (!session) { router.push('/admin/login'); return; }
    loadData();
  }, [router]);

  const loadData = () => {
    setIsLoading(true);
    const u = getAllUsersFromStorage();
    const p = getAllPredictionsFromStorage(u);
    setUsers(u);
    setPredictions(p);
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('mlops_admin_session');
    router.push('/admin/login');
  };

  // ── Computed stats ──
  const stats = useMemo(() => {
    const total = predictions.length;
    const layak = predictions.filter(p => p.result === 'LAYAK').length;
    const tidakLayak = total - layak;
    const avgConf = total > 0 ? Math.round(predictions.reduce((s, p) => s + p.confidence, 0) / total * 10) / 10 : 0;
    const approvalRate = total > 0 ? Math.round((layak / total) * 1000) / 10 : 0;
    return { total, layak, tidakLayak, avgConf, approvalRate };
  }, [predictions]);

  // ── EDA: Loan Purpose Distribution ──
  const purposeData = useMemo(() => {
    const map: Record<string, number> = {};
    predictions.forEach(p => {
      const purpose = p.inputData?.loanPurpose || 'Lainnya';
      map[purpose] = (map[purpose] || 0) + 1;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [predictions]);

  // ── EDA: Credit History Distribution ──
  const creditData = useMemo(() => {
    const map: Record<string, number> = {};
    predictions.forEach(p => {
      const ch = p.inputData?.creditHistory || 'Unknown';
      map[ch] = (map[ch] || 0) + 1;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [predictions]);

  // ── EDA: Property Area Distribution ──
  const areaData = useMemo(() => {
    const map: Record<string, number> = {};
    predictions.forEach(p => {
      const area = p.inputData?.propertyArea || 'Unknown';
      map[area] = (map[area] || 0) + 1;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [predictions]);

  // ── EDA: Daily Trend ──
  const dailyTrend = useMemo(() => {
    const map: Record<string, number> = {};
    predictions.forEach(p => {
      const day = new Date(p.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value })).reverse().slice(-14);
  }, [predictions]);

  // ── EDA: Confidence Distribution ──
  const confDist = useMemo(() => {
    const buckets: Record<string, number> = { '0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0 };
    predictions.forEach(p => {
      const c = p.confidence;
      if (c < 20) buckets['0-20']++;
      else if (c < 40) buckets['20-40']++;
      else if (c < 60) buckets['40-60']++;
      else if (c < 80) buckets['60-80']++;
      else buckets['80-100']++;
    });
    return Object.entries(buckets).map(([label, value]) => ({ label: label + '%', value }));
  }, [predictions]);

  // ── EDA: Loan Amount Ranges ──
  const loanRanges = useMemo(() => {
    const buckets: Record<string, number> = { '$0-1k': 0, '$1k-5k': 0, '$5k-10k': 0, '$10k-25k': 0, '$25k+': 0 };
    predictions.forEach(p => {
      const amt = parseInt(p.loanAmount || '0');
      if (amt < 1000) buckets['$0-1k']++;
      else if (amt < 5000) buckets['$1k-5k']++;
      else if (amt < 10000) buckets['$5k-10k']++;
      else if (amt < 25000) buckets['$10k-25k']++;
      else buckets['$25k+']++;
    });
    return Object.entries(buckets).map(([label, value]) => ({ label, value }));
  }, [predictions]);

  // ── EDA: Employment Distribution ──
  const employmentData = useMemo(() => {
    const map: Record<string, number> = {};
    predictions.forEach(p => {
      const emp = p.inputData?.employment || 'Unknown';
      map[emp] = (map[emp] || 0) + 1;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [predictions]);

  // ── Table columns ──
  const userColumns = [
    { key: 'fullName', label: 'Nama', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'createdAt', label: 'Terdaftar', sortable: true, render: (v: unknown) => new Date(String(v)).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { key: 'profileCompleted', label: 'Profil', render: (v: unknown) => (
      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${v ? 'bg-emerald-100/60 dark:bg-emerald-900/20 text-emerald-600' : 'bg-amber-100/60 dark:bg-amber-900/20 text-amber-600'}`}>
        {v ? 'Lengkap' : 'Belum'}
      </span>
    )},
    { key: 'predCount', label: 'Prediksi', sortable: true },
  ];

  const predColumns = [
    { key: 'userName', label: 'User', sortable: true },
    { key: 'result', label: 'Hasil', sortable: true, render: (v: unknown) => (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${v === 'LAYAK' ? 'bg-emerald-100/60 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-100/60 dark:bg-red-900/20 text-red-500'}`}>
        {v === 'LAYAK' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {String(v)}
      </span>
    )},
    { key: 'confidence', label: 'Confidence', sortable: true, render: (v: unknown) => `${v}%` },
    { key: 'loanAmount', label: 'Pinjaman', sortable: true, render: (v: unknown) => `$${parseInt(String(v) || '0').toLocaleString('en-US')}` },
    { key: 'loanTerm', label: 'Tenor', render: (v: unknown) => `${v} bln` },
    { key: 'loanPurpose', label: 'Tujuan', sortable: true },
    { key: 'date', label: 'Tanggal', sortable: true, render: (v: unknown) => new Date(String(v)).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
  ];

  const userTableData = users.map(u => ({
    ...u,
    profileCompleted: u.profile?.profileCompleted || false,
    predCount: predictions.filter(p => p.userId === u.id).length,
  }));

  const predTableData = predictions.map(p => ({
    ...p,
    loanPurpose: p.inputData?.loanPurpose || '-',
  }));

  // ── Summary cards ──
  const summaryCards = [
    { label: 'Total Pengguna', value: users.length, icon: Users, gradient: 'from-cyan-400 to-blue-500', shadow: 'rgba(14,165,233,0.25)' },
    { label: 'Total Prediksi', value: stats.total, icon: ClipboardList, gradient: 'from-indigo-400 to-purple-500', shadow: 'rgba(99,102,241,0.25)' },
    { label: 'Disetujui', value: stats.layak, icon: CheckCircle2, gradient: 'from-emerald-400 to-green-500', shadow: 'rgba(16,185,129,0.25)' },
    { label: 'Ditolak', value: stats.tidakLayak, icon: XCircle, gradient: 'from-red-400 to-rose-500', shadow: 'rgba(239,68,68,0.25)' },
    { label: 'Approval Rate', value: `${stats.approvalRate}%`, icon: TrendingUp, gradient: 'from-amber-400 to-orange-500', shadow: 'rgba(245,158,11,0.25)' },
    { label: 'Avg Confidence', value: `${stats.avgConf}%`, icon: Target, gradient: 'from-sky-400 to-blue-600', shadow: 'rgba(14,165,233,0.25)' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin-slow" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative transition-colors duration-300 noise-overlay">
      <div className="gradient-mesh" /><div className="orb orb-1" /><div className="orb orb-2" />

      <AdminSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

      {/* Main content */}
      <main className="lg:ml-[260px] relative z-10 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 glass-card-static border-b border-sky-100/30 dark:border-sky-800/20 px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-sky-100/40 dark:hover:bg-sky-800/20 transition-colors">
              <Menu className="w-5 h-5 text-sky-700 dark:text-sky-300" />
            </button>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/20">
                <Shield className="w-2.5 h-2.5 text-amber-500" />
                <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-wider">Admin Dashboard</span>
              </div>
              <h1 className="text-lg font-black text-sky-950 dark:text-sky-100 mt-0.5" style={{ letterSpacing: '-0.03em' }}>
                Monitoring Panel
              </h1>
            </div>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card-static text-xs font-bold text-sky-700 dark:text-sky-300 hover:shadow-md transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="px-4 lg:px-8 py-6 space-y-8">
          {/* ═══ SUMMARY CARDS ═══ */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {summaryCards.map((c, i) => (
                <div key={i} className="glass-card-static rounded-2xl p-4 relative overflow-hidden group" style={{ boxShadow: `0 4px 20px ${c.shadow.replace('0.25', '0.06')}` }}>
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${c.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xl font-black text-sky-900 dark:text-sky-100 tabular-nums" style={{ letterSpacing: '-0.03em' }}>{c.value}</p>
                      <p className="text-[9px] font-bold text-sky-500/60 uppercase tracking-wider mt-0.5">{c.label}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.gradient} flex items-center justify-center flex-shrink-0 opacity-80`} style={{ boxShadow: `0 3px 10px ${c.shadow}` }}>
                      <c.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ USER TABLE ═══ */}
          <section id="users">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-sky-500" />
              <h2 className="text-sm font-black text-sky-900 dark:text-sky-100">Daftar Pengguna</h2>
              <span className="text-[10px] font-bold text-sky-400/50 px-2 py-0.5 rounded-full bg-sky-100/40 dark:bg-sky-800/20">{users.length}</span>
            </div>
            <DataTable
              columns={userColumns}
              data={userTableData}
              searchKeys={['fullName', 'email']}
              pageSize={8}
              emptyMessage="Belum ada pengguna terdaftar"
            />
          </section>

          {/* ═══ PREDICTION TABLE ═══ */}
          <section id="predictions">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-4 h-4 text-sky-500" />
              <h2 className="text-sm font-black text-sky-900 dark:text-sky-100">Riwayat Peminjaman</h2>
              <span className="text-[10px] font-bold text-sky-400/50 px-2 py-0.5 rounded-full bg-sky-100/40 dark:bg-sky-800/20">{predictions.length}</span>
            </div>
            <DataTable
              columns={predColumns}
              data={predTableData}
              searchKeys={['userName', 'result', 'loanPurpose']}
              pageSize={10}
              emptyMessage="Belum ada data peminjaman"
            />
          </section>

          {/* ═══ EDA ANALYTICS ═══ */}
          <section id="eda">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4 text-sky-500" />
              <h2 className="text-sm font-black text-sky-900 dark:text-sky-100">Exploratory Data Analysis</h2>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100/50 dark:bg-indigo-900/20 border border-indigo-200/30 dark:border-indigo-700/20">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                <span className="text-[9px] font-bold text-indigo-500/80 uppercase tracking-wider">Analytics</span>
              </div>
            </div>

            {/* Row 1: Pie + Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <PieChart
                title="Distribusi Hasil Prediksi"
                data={[
                  { label: 'LAYAK', value: stats.layak, color: '#10b981' },
                  { label: 'TIDAK LAYAK', value: stats.tidakLayak, color: '#ef4444' },
                ]}
              />
              <BarChart
                title="Tujuan Pinjaman"
                data={purposeData}
              />
            </div>

            {/* Row 2: Bar + Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <BarChart
                title="Riwayat Kredit"
                data={creditData}
              />
              <BarChart
                title="Area Tempat Tinggal"
                data={areaData}
              />
            </div>

            {/* Row 3: Line + Histogram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <LineChart
                title="Trend Prediksi Harian"
                data={dailyTrend}
                color="#0ea5e9"
              />
              <HistogramChart
                title="Distribusi Confidence Level"
                data={confDist}
                color="#6366f1"
              />
            </div>

            {/* Row 4: Bar + Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BarChart
                title="Range Jumlah Pinjaman"
                data={loanRanges}
              />
              <BarChart
                title="Distribusi Pekerjaan"
                data={employmentData}
              />
            </div>
          </section>

          {/* Footer spacer */}
          <div className="h-8" />
        </div>
      </main>
    </div>
  );
}
