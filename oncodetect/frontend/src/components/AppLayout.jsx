import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function AppLayout({ children, hideNavs = false }) {
  const navigate = useNavigate();

  if (hideNavs) {
    return (
      <div className="bg-[#050505] text-[#FAFAFA] min-h-screen overflow-x-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="bg-[#050505] text-[#FAFAFA] min-h-screen overflow-x-hidden flex flex-col">
      
      {/* ─── Top Navigation Bar ─────────────────── */}
      <nav className="fixed top-0 left-0 right-0 h-14 flex justify-between items-center px-6 z-50 border-b border-white/[0.06] bg-[#050505]/90 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/dashboard')} className="text-lg font-bold tracking-[0.2em] text-[#00D4A8] font-headline uppercase cursor-pointer">
            OncoDetect
          </button>
          <div className="hidden md:flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4A8] animate-pulse"></span>
            <span className="text-[10px] font-mono text-[#00D4A8] tracking-widest uppercase ml-1">API: ONLINE</span>
            <span className="text-[10px] font-mono text-[#444] tracking-widest uppercase ml-4">NODE: ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="text-[#444] hover:text-[#00D4A8] transition-colors p-2 rounded cursor-pointer">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <button className="text-[#444] hover:text-[#00D4A8] transition-colors p-2 rounded cursor-pointer">
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
          <div className="w-8 h-8 ml-2 bg-[#111] border border-white/10 rounded-full flex items-center justify-center overflow-hidden cursor-pointer">
            <span className="material-symbols-outlined text-sm text-[#444]">person</span>
          </div>
        </div>
      </nav>

      {/* ─── Side Navigation Rail ─────────────── */}
      <aside className="fixed left-0 top-14 bottom-0 w-[60px] hover:w-56 transition-all duration-300 z-40 bg-[#080808] border-r border-white/[0.06] flex flex-col pt-4 group overflow-hidden">
        <div className="flex flex-col gap-1">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `
              flex items-center px-4 py-3 transition-all duration-200 relative
              ${isActive 
                ? 'text-[#00D4A8] bg-[#00D4A8]/[0.06] border-l-2 border-[#00D4A8]' 
                : 'text-[#444] hover:text-[#FAFAFA] hover:bg-white/[0.03] border-l-2 border-transparent'
              }
            `}
          >
            <span className="material-symbols-outlined min-w-[28px] text-xl">dashboard</span>
            <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide">Dashboard</span>
          </NavLink>

          <NavLink 
            to="/new-analysis"
            className={({ isActive }) => `
              flex items-center px-4 py-3 transition-all duration-200 relative
              ${isActive 
                ? 'text-[#00D4A8] bg-[#00D4A8]/[0.06] border-l-2 border-[#00D4A8]' 
                : 'text-[#444] hover:text-[#FAFAFA] hover:bg-white/[0.03] border-l-2 border-transparent'
              }
            `}
          >
            <span className="material-symbols-outlined min-w-[28px] text-xl">person_search</span>
            <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide">New Analysis</span>
          </NavLink>

          <NavLink 
            to="/report"
            className={({ isActive }) => `
              flex items-center px-4 py-3 transition-all duration-200 relative
              ${isActive 
                ? 'text-[#00D4A8] bg-[#00D4A8]/[0.06] border-l-2 border-[#00D4A8]' 
                : 'text-[#444] hover:text-[#FAFAFA] hover:bg-white/[0.03] border-l-2 border-transparent'
              }
            `}
          >
            <span className="material-symbols-outlined min-w-[28px] text-xl">inventory_2</span>
            <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide">Archives</span>
          </NavLink>
        </div>

        <div className="mt-auto flex flex-col gap-1 pb-4">
          <button className="flex items-center px-4 py-3 text-[#333] hover:text-[#FAFAFA] hover:bg-white/[0.03] transition-all cursor-pointer w-full">
            <span className="material-symbols-outlined min-w-[28px] text-xl">help</span>
            <span className="ml-3 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Help</span>
          </button>
          <button className="flex items-center px-4 py-3 text-[#333] hover:text-[#FAFAFA] hover:bg-white/[0.03] transition-all cursor-pointer w-full">
            <span className="material-symbols-outlined min-w-[28px] text-xl">terminal</span>
            <span className="ml-3 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Console</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────── */}
      <main className="ml-[60px] mt-14 mb-10 px-8 py-8 flex-1 min-h-screen">
        {children}
      </main>

      {/* ─── Footer Telemetry ─────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 h-9 flex justify-between items-center px-6 z-50 bg-[#080808]/90 border-t border-white/[0.06] backdrop-blur-md ml-[60px]">
        <span className="text-[10px] font-mono text-[#333] uppercase tracking-widest">
          <span className="text-[#00D4A8]">ONCO_DETECT TELEMETRY: 102.4 GB/S</span>
          <span className="mx-3 text-[#222]">|</span>
          LATENCY: 12MS
        </span>
        <div className="flex gap-6">
          <a href="#" className="text-[10px] font-mono text-[#333] hover:text-[#FAFAFA] uppercase tracking-widest transition-colors hidden md:inline">v2.0-Final</a>
          <a href="#" className="text-[10px] font-mono text-[#333] hover:text-[#FAFAFA] uppercase tracking-widest transition-colors">SYSTEM LOGS</a>
          <a href="#" className="text-[10px] font-mono text-[#333] hover:text-[#FAFAFA] uppercase tracking-widest transition-colors">PRIVACY</a>
        </div>
      </footer>
    </div>
  );
}
