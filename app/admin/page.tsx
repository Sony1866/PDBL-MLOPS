'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, ClipboardList, CheckCircle2, XCircle, Target,
  BarChart3, Menu, TrendingUp, DollarSign, Brain, Activity,
  Shield, Sparkles, RefreshCw, Database, PieChart as PieIcon
} from 'lucide-react';
import AdminSidebar from './components/AdminSidebar';
import DataTable from './components/DataTable';
import { PieChart, BarChart, LineChart, HistogramChart } from './components/EDACharts';

const BACKEND_URL = 'http://localhost:8000';

/* ─── Types ─── */
interface EDAData {
  totalRecords: number;
  avgMonthlyIncome: number;
  medianMonthlyIncome: number;
  avgDTI: number;
  medianDTI: number;
  avgCreditScore: number;
  avgLoanAmount: number;
  medianLoanAmount: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  loanStatusDistribution: Record<string, number>;
  termDistribution: Record<string, number>;
  prosperRatingDistribution: Record<string, number>;
  employmentDistribution: Record<string, number>;
  incomeRangeDistribution: Record<string, number>;
  occupationTop10: Record<string, number>;
  borrowerStateTop10: Record<string, number>;
  creditScoreRanges: Record<string, number>;
  listingCategoryDistribution: Record<string, number>;
  homeownerDistribution: Record<string, number>;
  dtiHistogram: { label: string; value: number }[];
  creditScoreHistogram: { label: string; value: number }[];
  loanAmountHistogram: { label: string; value: number }[];
  monthlyIncomeHistogram: { label: string; value: number }[];
  loansByYear: { label: string; value: number }[];
  loansByYearMonth: { label: string; value: number }[];
}

interface PredLog {
  id: string;
  timestamp: string;
  inputData: Record<string, string>;
  result: string;
  confidence: number;
  plafon?: number;
  cicilanPerBulan?: number;
  alasanPenolakan?: string[];
  catatanRisiko?: string;
  loanAmount: string;
  loanTerm: string;
  loanPurpose: string;
  creditHistory: string;
  employment: string;
  propertyArea: string;
}

function dictToChartData(d: Record<string, number>) {
  return Object.entries(d).map(([label, value]) => ({ label, value }));
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [eda, setEda] = useState<EDAData | null>(null);
  const [predictions, setPredictions] = useState<PredLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'eda' | 'predictions'>('overview');

  const getToken = () => {
    try {
      const s = JSON.parse(localStorage.getItem('mlops_admin_session') || '{}');
      return s.token || '';
    } catch { return ''; }
  };

  useEffect(() => {
    const session = localStorage.getItem('mlops_admin_session');
    if (!session) { router.push('/admin/login'); return; }
    loadData();
  }, [router]);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    const token = getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [edaRes, predRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/eda`, { headers }),
        fetch(`${BACKEND_URL}/admin/predictions`, { headers }),
      ]);

      if (edaRes.status === 401 || predRes.status === 401) {
        localStorage.removeItem('mlops_admin_session');
        router.push('/admin/login');
        return;
      }

      if (edaRes.ok) {
        const edaData = await edaRes.json();
        setEda(edaData);
      }
      if (predRes.ok) {
        const predData = await predRes.json();
        setPredictions(predData.predictions || []);
      }
    } catch {
      setError('Gagal terhubung ke backend. Pastikan server berjalan di localhost:8000');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('mlops_admin_session');
    router.push('/admin/login');
  };

  // ── Prediction stats ──
  const predStats = useMemo(() => {
    const total = predictions.length;
    const layak = predictions.filter(p => p.result === 'LAYAK').length;
    const tidakLayak = total - layak;
    const avgConf = total > 0 ? Math.round(predictions.reduce((s, p) => s + p.confidence, 0) / total * 10) / 10 : 0;
    const approvalRate = total > 0 ? Math.round((layak / total) * 1000) / 10 : 0;
    return { total, layak, tidakLayak, avgConf, approvalRate };
  }, [predictions]);

  // ── Table columns ──
  const predColumns = [
    { key: 'timestamp', label: 'Waktu', sortable: true, render: (v: unknown) => {
      const d = new Date(String(v));
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }},
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
    { key: 'employment', label: 'Pekerjaan', sortable: true },
    { key: 'creditHistory', label: 'Kredit', sortable: true },
  ];

  const predTableData = predictions.map(p => ({ ...p }));

  // ── Summary cards ──
  const overviewCards = [
    { label: 'Data CSV Records', value: eda?.totalRecords?.toLocaleString() || '0', icon: Database, gradient: 'from-cyan-400 to-blue-500', shadow: 'rgba(14,165,233,0.25)' },
    { label: 'Total Prediksi User', value: predStats.total, icon: ClipboardList, gradient: 'from-indigo-400 to-purple-500', shadow: 'rgba(99,102,241,0.25)' },
    { label: 'Disetujui', value: predStats.layak, icon: CheckCircle2, gradient: 'from-emerald-400 to-green-500', shadow: 'rgba(16,185,129,0.25)' },
    { label: 'Ditolak', value: predStats.tidakLayak, icon: XCircle, gradient: 'from-red-400 to-rose-500', shadow: 'rgba(239,68,68,0.25)' },
    { label: 'Approval Rate', value: `${predStats.approvalRate}%`, icon: TrendingUp, gradient: 'from-amber-400 to-orange-500', shadow: 'rgba(245,158,11,0.25)' },
    { label: 'Avg Confidence', value: `${predStats.avgConf}%`, icon: Target, gradient: 'from-sky-400 to-blue-600', shadow: 'rgba(14,165,233,0.25)' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin-slow mx-auto mb-4" />
          <p className="text-xs font-bold text-sky-500/60">Loading dataset & predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative transition-colors duration-300 noise-overlay">
      <div className="gradient-mesh" /><div className="orb orb-1" /><div className="orb orb-2" />

      <AdminSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

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
          {error && (
            <div className="px-5 py-4 rounded-2xl bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 text-red-500 text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* ═══ TAB NAVIGATION ═══ */}
          <div className="flex gap-2">
            {([
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'eda', label: 'EDA Dataset', icon: BarChart3 },
              { key: 'predictions', label: 'Prediksi User', icon: ClipboardList },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-lg'
                    : 'glass-card-static text-sky-600 dark:text-sky-400 hover:shadow-md'
                }`}>
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && (
            <>
              <section>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {overviewCards.map((c, i) => (
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

              {/* Dataset summary cards */}
              {eda && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="w-4 h-4 text-sky-500" />
                    <h2 className="text-sm font-black text-sky-900 dark:text-sky-100">Dataset Statistics (prosperLoanData.csv)</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { l: 'Avg Monthly Income', v: `$${eda.avgMonthlyIncome.toLocaleString('en-US', {maximumFractionDigits:0})}` },
                      { l: 'Avg Credit Score', v: eda.avgCreditScore.toFixed(0) },
                      { l: 'Avg DTI Ratio', v: `${(eda.avgDTI * 100).toFixed(1)}%` },
                      { l: 'Avg Loan Amount', v: `$${eda.avgLoanAmount.toLocaleString('en-US', {maximumFractionDigits:0})}` },
                    ].map((s, i) => (
                      <div key={i} className="glass-card-static rounded-2xl p-4 text-center">
                        <p className="text-lg font-black text-sky-900 dark:text-sky-100">{s.v}</p>
                        <p className="text-[9px] font-bold text-sky-500/60 uppercase tracking-wider mt-1">{s.l}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Quick charts */}
              {eda && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PieChart
                    title="Distribusi Loan Status"
                    data={dictToChartData(eda.loanStatusDistribution).slice(0, 6).map((d, i) => ({
                      ...d, color: ['#10b981','#ef4444','#f59e0b','#6366f1','#0ea5e9','#ec4899'][i]
                    }))}
                  />
                  <BarChart title="Distribusi Prosper Rating" data={dictToChartData(eda.prosperRatingDistribution)} />
                </div>
              )}

              {/* Prediction results quick */}
              {predStats.total > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PieChart
                    title="Hasil Prediksi User"
                    data={[
                      { label: 'LAYAK', value: predStats.layak, color: '#10b981' },
                      { label: 'TIDAK LAYAK', value: predStats.tidakLayak, color: '#ef4444' },
                    ]}
                  />
                  <BarChart
                    title="Tujuan Pinjaman User"
                    data={dictToChartData(
                      predictions.reduce((acc, p) => {
                        const k = p.loanPurpose || 'Lainnya';
                        acc[k] = (acc[k] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )}
                  />
                </div>
              )}
            </>
          )}

          {/* ═══ EDA TAB ═══ */}
          {activeTab === 'eda' && eda && (
            <>
              <section id="eda">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-4 h-4 text-sky-500" />
                  <h2 className="text-sm font-black text-sky-900 dark:text-sky-100">Exploratory Data Analysis — prosperLoanData.csv</h2>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100/50 dark:bg-indigo-900/20 border border-indigo-200/30 dark:border-indigo-700/20">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                    <span className="text-[9px] font-bold text-indigo-500/80 uppercase tracking-wider">{eda.totalRecords.toLocaleString()} Records</span>
                  </div>
                </div>

                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <PieChart
                    title="Distribusi Loan Status"
                    data={dictToChartData(eda.loanStatusDistribution).slice(0, 8).map((d, i) => ({
                      ...d, color: ['#10b981','#ef4444','#f59e0b','#6366f1','#0ea5e9','#ec4899','#14b8a6','#8b5cf6'][i]
                    }))}
                  />
                  <PieChart
                    title="Homeowner vs Non-Homeowner"
                    data={dictToChartData(eda.homeownerDistribution).map((d, i) => ({
                      ...d, label: d.label === 'True' ? 'Homeowner' : 'Non-Homeowner',
                      color: ['#0ea5e9','#f59e0b'][i]
                    }))}
                  />
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <BarChart title="Distribusi Prosper Rating" data={dictToChartData(eda.prosperRatingDistribution)} />
                  <BarChart title="Distribusi Employment Status" data={dictToChartData(eda.employmentDistribution)} />
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <BarChart title="Top 10 Occupation" data={dictToChartData(eda.occupationTop10)} />
                  <BarChart title="Top 10 Borrower State" data={dictToChartData(eda.borrowerStateTop10)} />
                </div>

                {/* Row 4: Histograms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <HistogramChart title="Distribusi Credit Score" data={eda.creditScoreHistogram} color="#0ea5e9" />
                  <HistogramChart title="Distribusi DTI Ratio" data={eda.dtiHistogram} color="#6366f1" />
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <HistogramChart title="Distribusi Loan Amount" data={eda.loanAmountHistogram} color="#10b981" />
                  <HistogramChart title="Distribusi Monthly Income" data={eda.monthlyIncomeHistogram} color="#f59e0b" />
                </div>

                {/* Row 6 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <BarChart title="Distribusi Tenor (Bulan)" data={dictToChartData(eda.termDistribution)} />
                  <BarChart title="Distribusi Income Range" data={dictToChartData(eda.incomeRangeDistribution)} />
                </div>

                {/* Row 7: Time series */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <LineChart title="Jumlah Loan per Tahun" data={eda.loansByYear} color="#0ea5e9" />
                  <BarChart title="Listing Category (Top 10)" data={dictToChartData(eda.listingCategoryDistribution)} />
                </div>
              </section>
            </>
          )}

          {/* ═══ PREDICTIONS TAB ═══ */}
          {activeTab === 'predictions' && (
            <section id="predictions">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-4 h-4 text-sky-500" />
                <h2 className="text-sm font-black text-sky-900 dark:text-sky-100">Riwayat Prediksi User (Diterima / Ditolak)</h2>
                <span className="text-[10px] font-bold text-sky-400/50 px-2 py-0.5 rounded-full bg-sky-100/40 dark:bg-sky-800/20">{predictions.length}</span>
              </div>

              {predictions.length === 0 ? (
                <div className="glass-card-static rounded-2xl p-12 text-center">
                  <Brain className="w-12 h-12 text-sky-300/40 mx-auto mb-3" />
                  <p className="text-sm font-bold text-sky-700/50 dark:text-sky-300/40">Belum ada prediksi user</p>
                  <p className="text-xs text-sky-500/40 mt-1">Data akan muncul setelah user melakukan prediksi di halaman Predict</p>
                </div>
              ) : (
                <>
                  {/* Prediction stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { l: 'Total Prediksi', v: predStats.total, g: 'from-indigo-400 to-purple-500' },
                      { l: 'Diterima (LAYAK)', v: predStats.layak, g: 'from-emerald-400 to-green-500' },
                      { l: 'Ditolak (TIDAK LAYAK)', v: predStats.tidakLayak, g: 'from-red-400 to-rose-500' },
                      { l: 'Approval Rate', v: `${predStats.approvalRate}%`, g: 'from-amber-400 to-orange-500' },
                    ].map((c, i) => (
                      <div key={i} className="glass-card-static rounded-2xl p-4 text-center relative overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${c.g}`} />
                        <p className="text-xl font-black text-sky-900 dark:text-sky-100">{c.v}</p>
                        <p className="text-[9px] font-bold text-sky-500/60 uppercase tracking-wider mt-1">{c.l}</p>
                      </div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <PieChart
                      title="Distribusi Hasil Prediksi"
                      data={[
                        { label: 'LAYAK (Diterima)', value: predStats.layak, color: '#10b981' },
                        { label: 'TIDAK LAYAK (Ditolak)', value: predStats.tidakLayak, color: '#ef4444' },
                      ]}
                    />
                    <BarChart
                      title="Pekerjaan Pemohon"
                      data={dictToChartData(
                        predictions.reduce((acc, p) => {
                          const k = p.employment || 'Unknown';
                          acc[k] = (acc[k] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      )}
                    />
                  </div>

                  {/* Table */}
                  <DataTable
                    columns={predColumns}
                    data={predTableData}
                    searchKeys={['result', 'loanPurpose', 'employment', 'creditHistory']}
                    pageSize={10}
                    emptyMessage="Belum ada data prediksi"
                  />
                </>
              )}
            </section>
          )}

          <div className="h-8" />
        </div>
      </main>
    </div>
  );
}
