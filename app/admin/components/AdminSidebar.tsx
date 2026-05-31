'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  LogOut,
  Shield,
  Brain,
  ChevronRight,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const navItems = [
  { label: 'Overview', tab: 'overview', icon: LayoutDashboard },
  { label: 'Pengguna', tab: 'users', icon: Users },
  { label: 'Peminjaman', tab: 'predictions', icon: ClipboardList },
  { label: 'EDA Analytics', tab: 'eda', icon: BarChart3 },
];

export default function AdminSidebar({ mobileOpen, onClose, onLogout, activeTab, onTabChange }: AdminSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-200/40 dark:border-slate-700/30">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" style={{ boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100" style={{ letterSpacing: '-0.03em' }}>
              Admin<span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent ml-0.5">Panel</span>
            </span>
<<<<<<< Updated upstream
            <p className="text-[9px] font-bold text-sky-400/50 uppercase tracking-wider">KreditinAja! Admin</p>
=======
            <p className="text-[9px] font-bold text-slate-400/70 uppercase tracking-wider">CreditSense AI</p>
>>>>>>> Stashed changes
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[9px] font-extrabold text-slate-400/60 uppercase tracking-[0.2em]">Menu</p>
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.label}
              onClick={() => { onTabChange?.(item.tab); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive
                  ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-700/25'
                  : 'text-slate-600/70 dark:text-slate-400/60 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-500' : 'text-slate-400/60 group-hover:text-slate-500'}`} />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400/60" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-200/40 dark:border-slate-700/30 space-y-2">
        <Link href="/" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500/60 dark:text-slate-400/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-all">
          <Brain className="w-4 h-4" /> Ke Halaman Utama
        </Link>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-all">
          <LogOut className="w-4 h-4" /> Logout Admin
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] z-40 glass-card-static border-r border-slate-200/30 dark:border-slate-700/20" style={{ boxShadow: '4px 0 30px rgba(99,102,241,0.04)' }}>
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-[55] transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ backgroundColor: 'rgba(2,6,23,0.3)' }}
        onClick={onClose}
      />

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-[280px] z-[60] flex flex-col transition-transform duration-500 glass-card-static ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/40 dark:border-slate-700/30">
          <span className="text-sm font-black text-slate-800 dark:text-slate-100">Menu Admin</span>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100/40 dark:hover:bg-slate-800/30 transition-colors">
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
