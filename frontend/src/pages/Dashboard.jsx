import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get('/api/reports').then(r => setReports(r.data || [])).catch(() => {});
  }, []);

  const getTriageBadge = (level) => {
    const m = {
      'HIGH':     { bg: 'bg-error-container', text: 'text-on-error-container' },
      'MODERATE': { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container' },
      'LOW':      { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
    };
    return m[level] || m['LOW'];
  };

  const getTriageColor = (level) => {
    return { HIGH: 'bg-error', MODERATE: 'bg-tertiary', LOW: 'bg-secondary' }[level] || 'bg-secondary';
  };

  const organIcon = (o) => {
    return { brain: 'psychology', lung: 'pulmonology', breast: 'female' }[o] || 'biotech';
  };

  const organLabel = (o) => {
    return { brain: 'Cerebral', lung: 'Pulmonary', breast: 'Mammary' }[o] || o;
  };

  const recentReports = reports.slice(0, 3);

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 h-full bg-surface-container-low hidden md:flex flex-col py-4 gap-2 text-sm font-medium border-r border-outline-variant/5 shrink-0">
          <div className="px-4 py-6 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">account_circle</span>
            </div>
            <div>
              <p className="text-on-surface font-semibold font-headline">Dr. Aris</p>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">Oncology Lead</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <Link to="/dashboard" className="mx-2 px-4 py-3 bg-primary-container/10 text-primary border-l-4 border-primary-container flex items-center gap-3 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              <span>Overview</span>
            </Link>
            <Link to="/new-analysis" className="mx-2 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface flex items-center gap-3 transition-all">
              <span className="material-symbols-outlined">biotech</span>
              <span>Scanning</span>
            </Link>
            <Link to="/history" className="mx-2 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface flex items-center gap-3 transition-all">
              <span className="material-symbols-outlined">description</span>
              <span>Reports</span>
            </Link>
          </div>

          <div className="mt-auto px-4 pb-4 flex flex-col gap-4">
            <button
              onClick={() => navigate('/new-analysis')}
              className="w-full py-3 bg-primary-container text-on-primary-container font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20 hover:brightness-110 transition-all font-headline"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Start New Scan
            </button>
            <div className="flex flex-col gap-1 border-t border-outline-variant/10 pt-4">
              <div className="px-2 py-2 text-on-surface-variant flex items-center gap-3 text-[10px] uppercase tracking-widest">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>System Status</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="data-grid-overlay absolute inset-0 opacity-10 pointer-events-none"></div>
          <div className="p-8 max-w-[1400px] mx-auto relative z-10">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-primary text-[10px] tracking-[0.2em] uppercase font-bold mb-2">Clinical Observatory</p>
                <h1 className="text-4xl font-bold tracking-tight">System Overview</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-surface-container rounded-lg border border-outline-variant/10 flex items-center gap-3">
                  <div className="w-2   h-2 rounded-full bg-secondary shadow-[0_0_8px_#4edea3]"></div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">AI Inference Engine: Online</span>
                </div>
              </div>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left 8 columns */}
              <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scanner Status */}
                <div className="bg-surface-container-low rounded-xl p-6 relative overflow-hidden border border-outline-variant/5">
                  <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Scanner Cluster 01</span>
                    <span className="material-symbols-outlined text-on-surface-variant">biotech</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-4xl font-bold mb-1">98.4<span className="text-primary text-xl">%</span></p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Availability Index (Last 24h)</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold">
                      <span className="text-on-surface-variant">Current Load</span>
                      <span className="text-on-surface">42%</span>
                    </div>
                    <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-[42%]"></div>
                    </div>
                  </div>
                </div>

                {/* Telemetry */}
                <div className="bg-surface-container-low rounded-xl p-6 relative overflow-hidden border border-outline-variant/5">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Global Telemetry</span>
                    <span className="material-symbols-outlined text-on-surface-variant">query_stats</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-bold">{reports.length > 0 ? reports.length.toLocaleString() : '0'}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Scans Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-headline">12ms</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Latency</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-outline-variant/10">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-container/20 text-primary rounded">OPTIMAL</span>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Calibration: PASS</span>
                    </div>
                  </div>
                </div>

                {/* CTA Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-primary-container to-[#0059c5] rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute -right-10 -bottom-10 opacity-10">
                    <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
                  </div>
                  <div className="relative z-10 max-w-md">
                    <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Initiate Advanced Oncology Analysis</h2>
                    <p className="text-white/80 text-sm mb-6 leading-relaxed">Deploy high-fidelity AI models for multi-spectral organ scan triage. Precision detection with 99.8% resolution accuracy.</p>
                    <button
                      onClick={() => navigate('/new-analysis')}
                      className="px-8 py-3 bg-white text-[#001a43] font-extrabold rounded-lg flex items-center gap-3 hover:bg-surface-dim transition-all active:scale-95 shadow-xl font-headline"
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                      Start New Analysis
                    </button>
                  </div>
                  <div className="relative z-10 hidden lg:block bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10 shrink-0">
                    <div className="space-y-4">
                      {['Trained on 5M+ images', 'Real-time sync active', 'FDA Class II Certified'].map((t,i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-secondary"></div>
                          <span className="text-xs text-white/90 font-bold uppercase tracking-wider">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 4 columns — Triage List */}
              <div className="md:col-span-4 bg-surface-container-low rounded-xl p-6 flex flex-col border border-outline-variant/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-on-surface">Recent Triage</h3>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest bg-surface-container-highest px-2 py-1 rounded font-bold">Live Updates</span>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {recentReports.length === 0 && (
                    <p className="text-[10px] text-on-surface-variant text-center py-8 uppercase tracking-[0.2em]">No triage records yet.</p>
                  )}
                  {recentReports.map((r, idx) => {
                    const badge = getTriageBadge(r.triage_level);
                    const barColor = getTriageColor(r.triage_level);
                    const prob = typeof r.probability_score === 'number' ? Math.round(r.probability_score * 100) : 0;
                    return (
                      <Link
                        to={`/report/${r.id}`}
                        key={idx}
                        className="p-4 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer group block border border-outline-variant/5"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-[10px] text-on-surface-variant mb-1 font-bold uppercase tracking-widest">Patient ID</p>
                            <p className="font-bold text-on-surface font-mono">{r.patient_name || `#OD-${r.id}`}</p>
                          </div>
                          <div className={`px-2 py-1 ${badge.bg} ${badge.text} text-[10px] font-bold rounded uppercase tracking-tighter`}>
                            {r.triage_level || 'LOW'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="material-symbols-outlined text-xs text-on-surface-variant">{organIcon(r.organ_type)}</span>
                              <span className="text-[10px] text-on-surface font-bold uppercase tracking-wider">{organLabel(r.organ_type)}</span>
                            </div>
                            <div className="h-1 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                              <div className={`h-full ${barColor}`} style={{ width: `${prob}%` }}></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xl font-bold ${barColor === 'bg-error' ? 'text-error' : barColor === 'bg-tertiary' ? 'text-tertiary' : 'text-secondary'}`}>
                              {prob}%
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  to="/history"
                  className="mt-6 w-full py-3 border border-outline-variant/20 text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-surface-container-highest transition-colors text-center block rounded-lg"
                >
                  View Full Registry
                </Link>
              </div>

              {/* Bottom intelligence row */}
              <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6 mt-2">
                {[
                  { icon: 'dns', color: 'text-primary', label: 'Node Status', value: '3/3' },
                  { icon: 'memory', color: 'text-secondary', label: 'ML Logic', value: 'Neural_01' },
                  { icon: 'update', color: 'text-tertiary', label: 'Sync', value: 'Active' },
                  { icon: 'security', color: 'text-on-surface-variant', label: 'Encryption', value: 'AES-256' },
                ].map((m, i) => (
                  <div key={i} className="bg-surface-container-low border border-outline-variant/5 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <span className={`material-symbols-outlined ${m.color} mb-3 text-2xl`}>{m.icon}</span>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{m.label}</p>
                    <p className="text-lg font-bold tracking-tight">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 pb-12 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-8">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-bold">© 2025 OncoDetect Systems</p>
                <div className="flex gap-6">
                  <span className="text-[10px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer uppercase font-bold tracking-widest">Compliance</span>
                  <span className="text-[10px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer uppercase font-bold tracking-widest">API Documentation</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-surface-container-high px-5 py-2 rounded-full border border-white/5">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-bold">Node: CN-WASH-DC-04 [PROD]</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
