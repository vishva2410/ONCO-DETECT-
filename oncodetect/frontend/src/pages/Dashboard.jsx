import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [latencyAnim, setLatencyAnim] = useState(1.4);
  const [time, setTime] = useState(new Date());

  // Update live clock
  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  // Animate latency number
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyAnim(prev => parseFloat((1.2 + Math.random() * 0.6).toFixed(1)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fmt = time.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const timeFmt = time.toLocaleTimeString('en-US', { hour12: false });

  return (
    <div>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <span className="text-[10px] font-bold font-mono uppercase tracking-[0.25em] text-[#00D4A8] mb-2 block">System Hub / Diagnostics</span>
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-[#FAFAFA]">Mission Control</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-[#444] font-mono uppercase tracking-widest">{fmt.toUpperCase()} — {timeFmt} UTC</span>
            <span className="h-[1px] w-8 bg-white/10"></span>
            <span className="flex items-center gap-1.5 text-[10px] text-[#00D4A8] font-bold uppercase tracking-tighter">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4A8] animate-pulse"></span>
              Stable
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/new-analysis')}
          className="flex items-center gap-3 px-8 py-4 bg-[#00D4A8] text-[#050505] font-bold uppercase tracking-widest text-[11px] hover:bg-[#00a882] hover:shadow-[0_0_30px_rgba(0,212,168,0.4)] transition-all duration-300 cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Start New Analysis
        </button>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-min">
        
        {/* Active Triage Count */}
        <div className="md:col-span-3 bg-[#0a0a0a] border border-white/[0.06] border-l-2 border-l-[#00D4A8] p-7 group hover:bg-[#111] transition-colors">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#444] mb-5">Active Triage</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-headline font-bold text-[#FAFAFA]">14</span>
            <span className="text-[#00D4A8] font-headline font-medium text-lg">Cases</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-[#00D4A8]">trending_up</span>
            <span className="text-xs font-mono text-[#444]">+2 from previous hour</span>
          </div>
        </div>

        {/* Throughput */}
        <div className="md:col-span-5 bg-[#0a0a0a] border border-white/[0.06] p-7">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#444]">System Throughput</h3>
            <span className="text-[10px] font-bold bg-[#00D4A8]/10 text-[#00D4A8] px-2 py-0.5">REAL-TIME</span>
          </div>
          <div className="flex items-center gap-8">
            <div>
              <div className="text-3xl font-headline font-bold text-[#FAFAFA]">
                {latencyAnim}<span className="text-sm font-normal text-[#444] ml-1">s/scan</span>
              </div>
              <p className="text-[10px] font-mono text-[#444] mt-1 uppercase">Latency avg</p>
            </div>
            <div className="flex-1 h-12 flex items-end gap-1">
              {[40, 60, 55, 80, 100, 70, 50].map((h, i) => (
                <div key={i} className="w-full bg-[#00D4A8]/60 transition-all duration-700 rounded-sm" style={{ height: `${h}%`, opacity: 0.3 + (h / 100) * 0.7 }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="md:col-span-4 bg-[#0a0a0a] border border-white/[0.06] p-7">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#444] mb-5">Global Risk Distribution</h3>
          <div className="space-y-4">
            {[
              { label: 'High Priority', pct: '12%', w: '12%', color: '#FF4444' },
              { label: 'Observation', pct: '34%', w: '34%', color: '#FFBC42' },
              { label: 'Low Risk', pct: '54%', w: '54%', color: '#00D4A8' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-[10px] font-bold mb-1.5">
                  <span className="font-mono uppercase" style={{ color: item.color }}>{item.label}</span>
                  <span className="text-[#FAFAFA]">{item.pct}</span>
                </div>
                <div className="h-1 w-full bg-white/[0.05] overflow-hidden">
                  <div className="h-full transition-all duration-1000" style={{ width: item.w, backgroundColor: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Case Pipeline */}
        <div className="md:col-span-8 bg-[#0a0a0a] border border-white/[0.06]">
          <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#444]">Live Case Pipeline</h3>
            <button onClick={() => navigate('/report')} className="text-[10px] font-bold text-[#00D4A8] hover:underline cursor-pointer uppercase tracking-wider">View Archive</button>
          </div>
          <div className="p-2 space-y-1">
            {[
              { id: '8842-X', type: 'Lung', tag: 'CT-Axial', icon: 'radiology', time: '14:01:22', status: 'CRITICAL', conf: '94.2% Conf.', statusColor: '#FF4444', statusBg: 'rgba(255,68,68,0.1)' },
              { id: '9120-K', type: 'Hepatic', tag: 'MRI-T2', icon: 'biotech', time: '13:58:10', status: 'NORMAL', conf: 'Preprocessing', statusColor: '#00D4A8', statusBg: 'rgba(0,212,168,0.1)' },
              { id: '7731-M', type: 'Neural', tag: 'PET-Scan', icon: 'neurology', time: '13:45:33', status: 'OBSERVATION', conf: 'Analysing...', statusColor: '#FFBC42', statusBg: 'rgba(255,188,66,0.1)' },
            ].map((c, i) => (
              <div
                key={i}
                onClick={() => navigate('/report')}
                className="bg-[#050505] p-4 flex items-center justify-between hover:bg-[#0e0e0e] transition-all group cursor-pointer border border-transparent hover:border-white/[0.06]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#444] text-lg">{c.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#FAFAFA]">Patient #{c.id}</h4>
                    <p className="text-[10px] font-mono text-[#444] uppercase tracking-tighter">{c.type} / {c.tag}</p>
                  </div>
                </div>
                <div className="hidden lg:block text-center">
                  <p className="text-[10px] font-mono text-[#333] uppercase">Received</p>
                  <p className="text-xs font-headline font-medium text-[#FAFAFA]">{c.time}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 border" style={{ color: c.statusColor, borderColor: `${c.statusColor}44`, backgroundColor: c.statusBg }}>{c.status}</span>
                    <p className="text-[10px] font-mono text-[#444] mt-1">{c.conf}</p>
                  </div>
                  <span className="material-symbols-outlined text-[#333] group-hover:text-[#00D4A8] transition-colors">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Neural Lattice */}
        <div className="md:col-span-4 bg-[#0a0a0a] border border-white/[0.06] relative overflow-hidden group min-h-[280px]">
          <div className="absolute inset-0 scanline opacity-20 z-10 pointer-events-none"></div>
          <img 
            className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-screen group-hover:opacity-50 transition-all duration-700 scale-105 group-hover:scale-100"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBQl8fcCqfi0aopUlSI9DqqaFTFgzGKjj-1sUhTMJ_nmn3P9Li0lcszGBJSyycqNO_gIGKqhLnTEKUMsS8XTQT76M3RcIwqy2gP9IA5qlj6qmJF9rFSgSZx5_6RLV6ZEQP94Ru1py64LBybHhIt7c7LqkkOP6v6KzGtsV0V6C8D0QS3TfQQqC-8P8E1gheyNSLg3vIZSPSHTtFXhib_XUpgJnKvpLppoAD9WgibIOdZ679EG0I8qk6Q_T-afCCplvfcEeXF2OYhPqE"
            alt="Neural Viz"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-0"></div>
          <div className="absolute bottom-0 left-0 p-6 w-full z-20">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#00D4A8] mb-2">Neural Lattice Status</h3>
            <p className="text-xs text-[#7A8DA8] leading-relaxed">Core diagnostic engine at peak efficiency. No anomalies detected in logic gates.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
