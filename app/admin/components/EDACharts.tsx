'use client';

import React, { useRef, useEffect, useState } from 'react';

const CHART_COLORS = [
  '#0ea5e9', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
];

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.unobserve(el); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

/* ═══ EMPTY STATE ═══ */
const EmptyChart = React.forwardRef<HTMLDivElement, { title: string }>(({ title }, ref) => (
  <div ref={ref} className="glass-card-static rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(14,165,233,0.06)' }}>
    <h4 className="text-xs font-extrabold text-sky-900 dark:text-sky-100 mb-4">{title}</h4>
    <div className="flex items-center justify-center h-40">
      <p className="text-xs text-sky-400/50 font-semibold">Belum ada data</p>
    </div>
  </div>
));
EmptyChart.displayName = 'EmptyChart';

/* ═══ PIE CHART ═══ */
interface PieChartProps {
  data: { label: string; value: number; color?: string }[];
  title: string;
  size?: number;
}

export function PieChart({ data, title, size = 200 }: PieChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <EmptyChart title={title} ref={ref} />;

  const cx = size / 2, cy = size / 2, r = size / 2 - 10;
  let cumAngle = -90;

  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const color = d.color || CHART_COLORS[i % CHART_COLORS.length];
    return { pathD, color, label: d.label, value: d.value, pct: ((d.value / total) * 100).toFixed(1) };
  });

  return (
    <div ref={ref} className="glass-card-static rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(14,165,233,0.06)' }}>
      <h4 className="text-xs font-extrabold text-sky-900 dark:text-sky-100 mb-4">{title}</h4>
      <div className="flex flex-col items-center gap-4">
        <svg width={size} height={size} className="transition-all duration-700" style={{ opacity: inView ? 1 : 0, transform: inView ? 'scale(1)' : 'scale(0.7)' }}>
          {slices.map((s, i) => (
            <path key={i} d={s.pathD} fill={s.color} stroke="white" strokeWidth="2" className="hover:opacity-80 transition-opacity cursor-default">
              <title>{s.label}: {s.value} ({s.pct}%)</title>
            </path>
          ))}
          <circle cx={cx} cy={cy} r={r * 0.55} fill="white" className="dark:fill-[#0f172a]" />
          <text x={cx} y={cy - 6} textAnchor="middle" className="fill-sky-900 dark:fill-sky-100" fontSize="18" fontWeight="900">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="fill-sky-500/60" fontSize="9" fontWeight="700">TOTAL</text>
        </svg>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[10px] font-bold text-sky-700/60 dark:text-sky-300/50">{s.label} ({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ BAR CHART ═══ */
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  title: string;
  height?: number;
}

export function BarChart({ data, title, height = 220 }: BarChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  if (data.length === 0) return <EmptyChart title={title} ref={ref} />;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.min(40, Math.max(16, (300 / data.length) - 8));
  const chartWidth = data.length * (barWidth + 12) + 40;

  return (
    <div ref={ref} className="glass-card-static rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(14,165,233,0.06)' }}>
      <h4 className="text-xs font-extrabold text-sky-900 dark:text-sky-100 mb-4">{title}</h4>
      <div className="overflow-x-auto">
        <svg width={Math.max(chartWidth, 280)} height={height + 40} className="mx-auto">
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
            <g key={i}>
              <line x1="35" y1={height - f * (height - 20)} x2={chartWidth} y2={height - f * (height - 20)} stroke="rgba(14,165,233,0.08)" strokeWidth="1" strokeDasharray="4,4" />
              <text x="30" y={height - f * (height - 20) + 4} textAnchor="end" className="fill-sky-400/50" fontSize="9" fontWeight="600">{Math.round(maxVal * f)}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const barH = (d.value / maxVal) * (height - 20);
            const x = 45 + i * (barWidth + 12);
            const y = height - barH;
            const color = d.color || CHART_COLORS[i % CHART_COLORS.length];
            return (
              <g key={i}>
                <rect x={x} y={inView ? y : height} width={barWidth} height={inView ? barH : 0} rx="4" fill={color} className="transition-all duration-700 ease-out hover:opacity-80" style={{ transitionDelay: `${i * 80}ms` }}>
                  <title>{d.label}: {d.value}</title>
                </rect>
                <text x={x + barWidth / 2} y={inView ? y - 6 : height - 6} textAnchor="middle" className="fill-sky-700 dark:fill-sky-300 transition-all duration-700" fontSize="9" fontWeight="800" style={{ transitionDelay: `${i * 80}ms`, opacity: inView ? 1 : 0 }}>{d.value}</text>
                <text x={x + barWidth / 2} y={height + 16} textAnchor="middle" className="fill-sky-500/60" fontSize="8" fontWeight="600">{d.label.length > 8 ? d.label.slice(0, 7) + '…' : d.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ═══ LINE CHART ═══ */
interface LineChartProps {
  data: { label: string; value: number }[];
  title: string;
  color?: string;
  height?: number;
}

export function LineChart({ data, title, color = '#0ea5e9', height = 180 }: LineChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  if (data.length === 0) return <EmptyChart title={title} ref={ref} />;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const pad = { top: 10, right: 20, bottom: 30, left: 40 };
  const w = Math.max(data.length * 50, 300);
  const plotW = w - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const points = data.map((d, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * plotW,
    y: pad.top + plotH - (d.value / maxVal) * plotH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - pad.bottom} L ${points[0].x} ${height - pad.bottom} Z`;

  return (
    <div ref={ref} className="glass-card-static rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(14,165,233,0.06)' }}>
      <h4 className="text-xs font-extrabold text-sky-900 dark:text-sky-100 mb-4">{title}</h4>
      <div className="overflow-x-auto">
        <svg width={w} height={height} className="mx-auto">
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
            <g key={i}>
              <line x1={pad.left} y1={pad.top + plotH - f * plotH} x2={w - pad.right} y2={pad.top + plotH - f * plotH} stroke="rgba(14,165,233,0.06)" strokeWidth="1" />
              <text x={pad.left - 6} y={pad.top + plotH - f * plotH + 3} textAnchor="end" className="fill-sky-400/50" fontSize="8" fontWeight="600">{Math.round(maxVal * f)}</text>
            </g>
          ))}
          <path d={areaPath} fill={`${color}15`} className="transition-opacity duration-1000" style={{ opacity: inView ? 1 : 0 }} />
          <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000" strokeDasharray={inView ? '0' : '2000'} strokeDashoffset={inView ? '0' : '2000'} />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={inView ? 4 : 0} fill={color} stroke="white" strokeWidth="2" className="transition-all duration-500" style={{ transitionDelay: `${i * 60}ms` }}>
                <title>{p.label}: {p.value}</title>
              </circle>
              <text x={p.x} y={height - pad.bottom + 14} textAnchor="middle" className="fill-sky-500/60" fontSize="7" fontWeight="600">{p.label.length > 6 ? p.label.slice(0, 5) + '…' : p.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ═══ HISTOGRAM CHART ═══ */
interface HistogramProps {
  data: { label: string; value: number }[];
  title: string;
  color?: string;
  height?: number;
}

export function HistogramChart({ data, title, color = '#6366f1', height = 200 }: HistogramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  if (data.length === 0) return <EmptyChart title={title} ref={ref} />;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max(20, Math.min(50, 300 / data.length));
  const chartW = data.length * (barW + 2) + 60;

  return (
    <div ref={ref} className="glass-card-static rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(14,165,233,0.06)' }}>
      <h4 className="text-xs font-extrabold text-sky-900 dark:text-sky-100 mb-4">{title}</h4>
      <div className="overflow-x-auto">
        <svg width={Math.max(chartW, 280)} height={height + 30} className="mx-auto">
          {data.map((d, i) => {
            const barH = (d.value / maxVal) * (height - 20);
            const x = 45 + i * (barW + 2);
            const y = height - barH;
            return (
              <g key={i}>
                <rect x={x} y={inView ? y : height} width={barW} height={inView ? barH : 0} fill={color} opacity="0.8" className="transition-all duration-500 hover:opacity-100" style={{ transitionDelay: `${i * 50}ms` }}>
                  <title>{d.label}: {d.value}</title>
                </rect>
                <text x={x + barW / 2} y={inView ? y - 4 : height - 4} textAnchor="middle" className="fill-sky-700 dark:fill-sky-300 transition-all duration-500" fontSize="8" fontWeight="700" style={{ transitionDelay: `${i * 50}ms`, opacity: inView ? 1 : 0 }}>{d.value}</text>
                <text x={x + barW / 2} y={height + 14} textAnchor="middle" className="fill-sky-500/60" fontSize="7" fontWeight="600">{d.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
