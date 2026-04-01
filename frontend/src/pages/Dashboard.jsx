import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { getApiErrorMessage } from '../lib/api';
import { useAuth } from '../context/useAuth';

function normalizeTriageLevel(level) {
  return String(level || 'low').toUpperCase();
}

function formatDate(value) {
  if (!value) return 'No timestamp';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    Promise.all([api.get('/api/reports'), api.get('/api/health')])
      .then(([reportsResponse, healthResponse]) => {
        if (!isActive) return;
        setReports(reportsResponse.data || []);
        setHealth(healthResponse.data || null);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(getApiErrorMessage(err, 'Dashboard data could not be loaded.'));
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const summary = useMemo(() => {
    const normalized = reports.map((report) => normalizeTriageLevel(report.triage_level));
    return {
      total: reports.length,
      high: normalized.filter((level) => level === 'HIGH').length,
      moderate: normalized.filter((level) => level === 'MODERATE').length,
      low: normalized.filter((level) => level === 'LOW').length,
    };
  }, [reports]);

  const recentReports = reports.slice(0, 5);

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 h-full bg-surface-container-low hidden md:flex flex-col py-4 gap-2 text-sm font-medium border-r border-outline-variant/5 shrink-0">
          <div className="px-4 py-6 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">account_circle</span>
            </div>
            <div>
              <p className="text-on-surface font-semibold font-headline">{user?.username || 'Authenticated User'}</p>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">Local review session</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <Link to="/dashboard" className="mx-2 px-4 py-3 bg-primary-container/10 text-primary border-l-4 border-primary-container flex items-center gap-3 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              <span>Overview</span>
            </Link>
            <Link to="/new-analysis" className="mx-2 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface flex items-center gap-3 transition-all">
              <span className="material-symbols-outlined">biotech</span>
              <span>New Analysis</span>
            </Link>
            <Link to="/history" className="mx-2 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface flex items-center gap-3 transition-all">
              <span className="material-symbols-outlined">description</span>
              <span>History</span>
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
            <div className="border-t border-outline-variant/10 pt-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              Backend: {health?.status || 'Checking'}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative">
          <div className="data-grid-overlay absolute inset-0 opacity-10 pointer-events-none"></div>
          <div className="p-8 max-w-[1400px] mx-auto relative z-10">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-primary text-[10px] tracking-[0.2em] uppercase font-bold mb-2">Clinical Observatory</p>
                <h1 className="text-4xl font-bold tracking-tight">System Overview</h1>
                <p className="text-sm text-on-surface-variant mt-3 max-w-2xl">
                  This local dashboard reflects the actual project state: report volume, triage mix, backend readiness, and whether LLM enhancement is available.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-surface-container rounded-lg border border-outline-variant/10 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-secondary shadow-[0_0_8px_#4edea3]' : 'bg-tertiary'}`}></div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                    API: {health?.status === 'ok' ? 'Ready' : loading ? 'Checking' : 'Needs attention'}
                  </span>
                </div>
              </div>
            </header>

            {error && (
              <div className="mb-8 rounded-2xl border border-error/30 bg-error/10 p-5 text-sm text-error">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    label: 'Reports Stored',
                    value: summary.total,
                    note: 'Total analyses saved to the local database.',
                    accent: 'bg-primary',
                  },
                  {
                    label: 'High Priority Cases',
                    value: summary.high,
                    note: 'Reports currently marked as high triage.',
                    accent: 'bg-error',
                  },
                  {
                    label: 'Backend Health',
                    value: health?.database === 'up' ? 'Healthy' : loading ? 'Checking' : 'Offline',
                    note: 'Database connectivity and API health endpoint status.',
                    accent: 'bg-secondary',
                  },
                  {
                    label: 'LLM Mode',
                    value: health?.llmConfigured ? 'Enhanced' : loading ? 'Checking' : 'Fallback',
                    note: health?.llmConfigured ? 'Groq-powered reasoning is configured.' : 'Template fallback will be used if LLM access is unavailable.',
                    accent: 'bg-tertiary',
                  },
                ].map((card) => (
                  <div key={card.label} className="bg-surface-container-low rounded-xl p-6 relative overflow-hidden border border-outline-variant/5">
                    <div className={`absolute top-0 left-0 w-1 h-full ${card.accent}`}></div>
                    <div className="flex justify-between items-start mb-8">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">{card.label}</span>
                      <span className="material-symbols-outlined text-on-surface-variant">monitoring</span>
                    </div>
                    <div className="mb-3">
                      <p className="text-4xl font-bold mb-1">{card.value}</p>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">{card.note}</p>
                  </div>
                ))}

                <div className="md:col-span-2 bg-gradient-to-br from-primary-container to-[#0059c5] rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute -right-10 -bottom-10 opacity-10">
                    <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
                  </div>
                  <div className="relative z-10 max-w-md">
                    <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Run a new local analysis</h2>
                    <p className="text-white/80 text-sm mb-6 leading-relaxed">
                      Upload a supported image, provide basic context, and generate a clinician-facing report with audit notes and PDF export.
                    </p>
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
                      {[
                        `${summary.high} high-priority reports`,
                        `${summary.moderate} moderate-priority reports`,
                        `${summary.low} low-priority reports`,
                      ].map((text) => (
                        <div key={text} className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-secondary"></div>
                          <span className="text-xs text-white/90 font-bold uppercase tracking-wider">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 bg-surface-container-low rounded-xl p-6 flex flex-col border border-outline-variant/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-on-surface">Recent Reports</h3>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest bg-surface-container-highest px-2 py-1 rounded font-bold">
                    {recentReports.length} visible
                  </span>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {loading && (
                    <p className="text-[10px] text-on-surface-variant text-center py-8 uppercase tracking-[0.2em]">Loading reports...</p>
                  )}
                  {!loading && recentReports.length === 0 && (
                    <p className="text-[10px] text-on-surface-variant text-center py-8 uppercase tracking-[0.2em]">No analyses yet.</p>
                  )}
                  {recentReports.map((report) => {
                    const triage = normalizeTriageLevel(report.triage_level);
                    const probability = typeof report.probability_score === 'number' ? Math.round(report.probability_score * 100) : 0;
                    const triageColor = triage === 'HIGH' ? 'bg-error' : triage === 'MODERATE' ? 'bg-tertiary' : 'bg-secondary';
                    const triageText = triage === 'HIGH' ? 'text-error' : triage === 'MODERATE' ? 'text-tertiary' : 'text-secondary';

                    return (
                      <Link
                        to={`/report/${report.id}`}
                        key={report.id}
                        className="p-4 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer group block border border-outline-variant/5"
                      >
                        <div className="flex justify-between items-start mb-3 gap-4">
                          <div>
                            <p className="font-bold text-on-surface">{report.patient_name || 'Anonymous'}</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{formatDate(report.created_at)}</p>
                          </div>
                          <div className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter ${triage === 'HIGH' ? 'bg-error-container text-on-error-container' : triage === 'MODERATE' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                            {triage}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="text-[10px] text-on-surface uppercase tracking-wider font-bold mb-2">{report.organ_type}</div>
                            <div className="h-1 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                              <div className={`h-full ${triageColor}`} style={{ width: `${probability}%` }}></div>
                            </div>
                          </div>
                          <div className={`text-xl font-bold ${triageText}`}>{probability}%</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  to="/history"
                  className="mt-6 w-full py-3 border border-outline-variant/20 text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-surface-container-highest transition-colors text-center block rounded-lg"
                >
                  View Full History
                </Link>
              </div>

              <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6 mt-2">
                {[
                  { icon: 'warning', color: 'text-error', label: 'High', value: summary.high },
                  { icon: 'schedule', color: 'text-tertiary', label: 'Moderate', value: summary.moderate },
                  { icon: 'task_alt', color: 'text-secondary', label: 'Low', value: summary.low },
                  { icon: 'cloud_done', color: 'text-primary', label: 'Uploads', value: `${health?.allowedOrgans?.length || 3} organ types` },
                ].map((metric) => (
                  <div key={metric.label} className="bg-surface-container-low border border-outline-variant/5 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <span className={`material-symbols-outlined ${metric.color} mb-3 text-2xl`}>{metric.icon}</span>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{metric.label}</p>
                    <p className="text-lg font-bold tracking-tight">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <footer className="mt-16 pb-12 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-8">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-bold">OncoDetect local build</p>
                <div className="flex gap-6">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Prototype mode</span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Deployment-ready pass in progress</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-surface-container-high px-5 py-2 rounded-full border border-white/5">
                <div className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-secondary animate-pulse' : 'bg-tertiary'}`}></div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-bold">Database: {health?.database || 'unknown'}</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
