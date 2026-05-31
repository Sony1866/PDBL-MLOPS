'use client';

import React from 'react';
import { Shield, Cpu, BarChart3, ExternalLink, Mail, Heart, Code2, Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative py-12 px-4 md:px-6 border-t border-sky-100/50 dark:border-sky-800/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-extrabold text-sky-900 dark:text-sky-100" style={{ letterSpacing: '-0.02em' }}>
                KreditinAja!
              </span>
            </div>
            <p className="text-sm text-sky-700/60 dark:text-sky-300/50 leading-relaxed max-w-xs">
              Platform analisis risiko dan deteksi kelayakan nasabah pinjaman berbasis MLOps dengan algoritma Gradient Boosting.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-sky-900 dark:text-sky-100 mb-3">Platform</h4>
            <div className="space-y-2">
              {[
                { label: 'Beranda', href: '/' },
                { label: 'Prediksi', href: '/predict' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Profil', href: '/profile' },
              ].map((link) => (
                <a key={link.label} href={link.href} className="block text-sm text-sky-700/60 dark:text-sky-300/50 hover:text-sky-600 dark:hover:text-sky-300 transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-sky-900 dark:text-sky-100 mb-3">Teknologi</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-sky-700/60 dark:text-sky-300/50">
                <BarChart3 className="w-4 h-4" /> Gradient Boosting Algorithm
              </div>
              <div className="flex items-center gap-2 text-sm text-sky-700/60 dark:text-sky-300/50">
                <ExternalLink className="w-4 h-4" /> MLOps Pipeline
              </div>
              <div className="flex items-center gap-2 text-sm text-sky-700/60 dark:text-sky-300/50">
                <Shield className="w-4 h-4" /> Data Encrypted & Secure
              </div>
            </div>

            {/* Tech Stack Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { label: 'Next.js', color: 'from-slate-700 to-slate-900' },
                { label: 'FastAPI', color: 'from-emerald-500 to-teal-600' },
                { label: 'Docker', color: 'from-sky-500 to-blue-600' },
              ].map((tech) => (
                <span key={tech.label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${tech.color} text-white text-[9px] font-bold tracking-wider shadow-sm`}>
                  <Code2 className="w-2.5 h-2.5" /> {tech.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright & Credits Section */}
        <div className="pt-6 border-t border-sky-100/50 dark:border-sky-800/30">
          {/* Main Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-xs text-sky-500/60 dark:text-sky-400/50">
                © {new Date().getFullYear()} KreditinAja! — MLOps Gradient Boosting Platform.
              </p>
              <p className="text-[10px] text-sky-500/40 dark:text-sky-400/35">
                Seluruh hak cipta dilindungi undang-undang. Dilarang memperbanyak tanpa izin.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/Sony1866/PDBL-MLOPS" target="_blank" rel="noopener" className="text-sky-500/50 hover:text-sky-600 transition-colors" title="GitHub Repository">
                <ExternalLink className="w-4 h-4" />
              </a>
              <a href="mailto:info@kreditinaja.id" className="text-sky-500/50 hover:text-sky-600 transition-colors" title="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Team & University Credits */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4 border-t border-sky-100/30 dark:border-sky-800/20">
            <div className="flex items-center gap-2 text-[10px] text-sky-500/45 dark:text-sky-400/35 font-semibold">
              <Layers className="w-3 h-3" />
              <span>Proyek Berbasis Pembelajaran (PBL) — MLOps Kelayakan Nasabah Pinjaman</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-sky-500/45 dark:text-sky-400/35 font-semibold">
              <span>Dibuat dengan</span>
              <Heart className="w-3 h-3 text-rose-400/60 fill-rose-400/40" />
              <span>oleh Tim PBL MLOPS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
