'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('mlops_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('mlops_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('mlops_theme', 'light');
      }
      return next;
    });
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-[72px] h-[34px] rounded-full bg-slate-200/60 dark:bg-slate-700/40" />
    );
  }

  return (
    <button
      onClick={toggle}
      className="group relative flex items-center w-[72px] h-[34px] rounded-full p-[3px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #1e293b, #0f172a)'
          : 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
        border: `1.5px solid ${isDark ? 'rgba(14,165,233,0.2)' : 'rgba(14,165,233,0.25)'}`,
        boxShadow: isDark
          ? '0 2px 12px rgba(14,165,233,0.1), inset 0 1px 2px rgba(0,0,0,0.3)'
          : '0 2px 12px rgba(14,165,233,0.12), inset 0 1px 2px rgba(255,255,255,0.8)',
      }}
      aria-label={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
    >
      {/* Track decorative stars (visible in dark mode) */}
      <div className={`absolute inset-0 rounded-full overflow-hidden transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[8px] left-[10px] w-[2px] h-[2px] rounded-full bg-sky-400/50" />
        <div className="absolute top-[15px] left-[16px] w-[1.5px] h-[1.5px] rounded-full bg-indigo-400/40" />
        <div className="absolute top-[22px] left-[8px] w-[1px] h-[1px] rounded-full bg-sky-300/30" />
        <div className="absolute top-[10px] left-[22px] w-[1px] h-[1px] rounded-full bg-violet-400/40" />
      </div>

      {/* Track decorative clouds/rays (visible in light mode) */}
      <div className={`absolute inset-0 rounded-full overflow-hidden transition-opacity duration-500 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute top-[12px] right-[10px] w-[6px] h-[3px] rounded-full bg-white/50" />
        <div className="absolute top-[18px] right-[16px] w-[4px] h-[2px] rounded-full bg-white/40" />
      </div>

      {/* Sliding thumb */}
      <div
        className="relative w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          transform: isDark ? 'translateX(38px)' : 'translateX(0px)',
          background: isDark
            ? 'linear-gradient(145deg, #334155, #1e293b)'
            : 'linear-gradient(145deg, #ffffff, #f0f9ff)',
          boxShadow: isDark
            ? '0 2px 8px rgba(0,0,0,0.4), 0 0 12px rgba(99,102,241,0.15), inset 0 1px 1px rgba(255,255,255,0.05)'
            : '0 2px 8px rgba(14,165,233,0.2), 0 0 12px rgba(250,204,21,0.1), inset 0 1px 1px rgba(255,255,255,0.9)',
        }}
      >
        {/* Sun icon */}
        <Sun
          className="absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            width: '15px',
            height: '15px',
            color: '#f59e0b',
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'scale(0.3) rotate(-90deg)' : 'scale(1) rotate(0deg)',
            filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.4))',
          }}
        />
        {/* Moon icon */}
        <Moon
          className="absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            width: '14px',
            height: '14px',
            color: '#818cf8',
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'scale(1) rotate(0deg)' : 'scale(0.3) rotate(90deg)',
            filter: 'drop-shadow(0 0 3px rgba(129,140,248,0.5))',
          }}
        />
      </div>
    </button>
  );
}
