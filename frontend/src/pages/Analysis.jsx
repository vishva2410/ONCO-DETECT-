import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/usePatient';
import Navbar from '../components/Navbar';
import api from '../lib/api';

export default function Analysis() {
  const navigate = useNavigate();
  const { patientData, scanFile, scanPreviewUrl, setReportData, addToast } = usePatient();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const apiCalled = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  const logPool = useMemo(() => [
    { t: '12:44:02', msg: 'INIT_INGESTION: Stream stability established', type: 'secondary' },
    { t: '12:44:05', msg: 'BUFFER: 100% Sequence parity verified', type: 'secondary' },
    { t: '12:44:08', msg: 'PRE_PROC: Morphological noise reduction (σ=1.2)', type: 'secondary' },
    { t: '12:44:12', msg: 'VISION_ENG: Executing Tensor_Map_Redistribution', type: 'primary' },
    { t: '12:44:15', msg: 'LAYER_14: Convolutional filters stabilizing', type: 'primary' },
    { t: '12:44:18', msg: 'LAYER_18: Anomaly localized at [44.22, 12.81]', type: 'primary' },
    { t: '12:44:20', msg: 'ANOMALY_CONF: Confidence calculated', type: 'primary' },
    { t: '12:44:22', msg: 'WAITING FOR CL_LOGIC_INVOCATION...', type: 'pulse' },
  ], []);

  // Call the actual backend API
  useEffect(() => {
    if (!patientData.name || !scanFile) {
      navigate('/new-analysis');
      return;
    }

    if (apiCalled.current) return;
    apiCalled.current = true;
    let isActive = true;

    const callApi = async () => {
      try {
        // Build FormData exactly as the backend /api/analyze expects
        const formData = new FormData();
        formData.append('patient_data', JSON.stringify({
          name: patientData.name,
          age: patientData.age,
          gender: patientData.gender,
          organType: patientData.organType,
          symptoms: patientData.symptoms || '',
          smokingHistory: patientData.smokingHistory || false,
          familyHistory: patientData.familyHistory || false,
        }));
        formData.append('scan_file', scanFile);

        const res = await api.post('/api/analyze', formData);
        
        // Store full report data in context
        if (!isActive) return;
        setReportData(res.data);

        // Navigate to report page using the reportId
        const reportId = res.data.reportId;
        if (reportId) {
          addToast('Analysis complete. Opening clinical report...', 'success');
          navigate(`/report/${reportId}`);
        } else {
          // No reportId returned — just show inline
          addToast('Analysis complete.', 'success');
          navigate('/dashboard');
        }
      } catch (err) {
        if (!isActive) return;
        console.error('Analysis API error:', err);
        const msg = err.response?.data?.detail || 'Analysis failed. Please try again.';
        setError(msg);
        addToast(msg, 'error');
      } finally {
        apiCalled.current = false;
      }
    };

    // Start the API call immediately
    callApi();
    return () => {
      isActive = false;
      apiCalled.current = false;
    };
  }, [patientData, scanFile, navigate, addToast, setReportData, retryCount]);

  // Animate progress bar independently
  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) {
          clearInterval(interval);
          return 95; // Hold at 95% until API responds
        }
        return p + 0.8;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [error]);

  const logs = useMemo(() => {
    const logIdx = Math.floor((progress / 100) * logPool.length);
    return logPool.slice(0, logIdx);
  }, [progress, logPool]);

  const step = Math.min(5, Math.floor((progress / 100) * 6));

  const steps = [
    { id: '01', label: 'Ingestion', icon: 'cloud_download' },
    { id: '02', label: 'Preprocessing', icon: 'architecture' },
    { id: '03', label: 'Vision Signal', icon: 'visibility' },
    { id: '04', label: 'Clinical Logic', icon: 'account_tree' },
    { id: '05', label: 'LLM Reasoning', icon: 'psychology' },
    { id: '06', label: 'Final Report', icon: 'assignment_turned_in' },
  ];

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 h-full bg-surface-container-low hidden md:flex flex-col py-4 gap-2 text-sm font-medium border-r border-outline-variant/10 shrink-0">
          <div className="px-4 py-4 mb-6">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">System Load</span>
                <span className="text-[10px] font-bold text-secondary uppercase">24%</span>
              </div>
              <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                <div className="bg-secondary h-full w-[24%] transition-all duration-1000"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 px-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-container/10 text-primary border-l-4 border-primary-container transition-all">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
              <span className="font-headline font-bold uppercase tracking-wider text-xs">Scanning</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant/40 hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-lg">query_stats</span>
              <span className="font-headline font-bold uppercase tracking-wider text-xs">Telemetry</span>
            </div>
          </div>
        </aside>

        {/* Clinical Observatory Main */}
        <main className="flex-1 overflow-hidden relative flex flex-col p-8">
          <div className="data-grid-overlay absolute inset-0 opacity-10 pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-headline uppercase">Sequence: LIVE_ANALYSIS_{patientData.name?.substring(0,4).toUpperCase() || 'SYS'}</h1>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-md">
                  <span className={`w-2 h-2 rounded-full ${error ? 'bg-error' : 'bg-primary animate-pulse'} shadow-[0_0_8px_var(--color-primary)]`}></span>
                  <span className={`text-[10px] font-bold ${error ? 'text-error' : 'text-primary'} tracking-[0.2em] uppercase`}>{error ? 'Error' : 'Active Processing'}</span>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Organ: {patientData.organType?.toUpperCase()}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-on-surface-variant tracking-[0.2em] uppercase mb-1">Execution Frame</p>
              <p className="text-3xl font-black text-primary tracking-tighter font-headline">{progress.toFixed(1)}%</p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="relative z-10 mb-8 p-6 bg-error/10 border border-error/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-error text-3xl">error</span>
                <div>
                  <p className="text-sm font-bold text-error uppercase tracking-wider">Analysis Failed</p>
                  <p className="text-xs text-on-surface-variant mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  apiCalled.current = false;
                  setError(null);
                  setProgress(0);
                  setRetryCount(count => count + 1);
                }}
                className="px-6 py-3 bg-error text-on-error text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:brightness-110 transition-all font-headline"
              >
                Retry Analysis
              </button>
            </div>
          )}

          {/* Analysis Workspace */}
          <div className="flex-1 grid grid-cols-12 gap-8 relative z-10 min-h-0">
            {/* Center Core */}
            <div className="col-span-12 md:col-span-8 flex flex-col gap-6 min-h-0">
              <div className="flex-1 glass-panel rounded-2xl relative overflow-hidden flex items-center justify-center border border-white/5 shadow-2xl bg-black/20">
                <div className="scanline"></div>
                {/* HUD Overlays */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] font-bold text-primary/60 flex flex-col gap-1 uppercase tracking-widest font-mono">
                      <span>V_ARRAY: ENABLED</span>
                      <span>SIG_STRENGTH: 98.2%</span>
                    </div>
                    <div className="w-28 h-28 border border-primary/10 rounded-full flex items-center justify-center relative">
                      <div className="w-24 h-24 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <span className="absolute text-[10px] font-bold text-primary tracking-widest font-headline">SCAN</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="p-4 bg-black/60 border border-white/5 rounded-xl backdrop-blur-md">
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-3">Diagnostic Stream</p>
                      <div className="w-48 h-32 rounded-lg bg-surface-container-highest flex items-center justify-center overflow-hidden border border-white/10 relative">
                        <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                        <span className="material-symbols-outlined text-4xl text-primary/30">biotech</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       {[0,1,2].map(i => <div key={i} className={`w-12 h-1 ${i <= Math.floor(progress/33) ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>)}
                    </div>
                  </div>
                </div>

                {/* Scan Visualizer */}
                <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-xl overflow-hidden border border-primary/30 shadow-[0_0_30px_rgba(0,112,243,0.2)] bg-black/50 flex items-center justify-center">
                  {scanPreviewUrl ? (
                    <>
                      <img src={scanPreviewUrl} alt="Scan preview" className="w-full h-full object-contain opacity-80 mix-blend-screen" />
                      {/* Scanning Line overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/40 to-transparent h-[10%] w-full animate-scanline"></div>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,112,243,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,112,243,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                      {/* Targeting Corner Brackets */}
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/80"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/80"></div>
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/80"></div>
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/80"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-32 h-32 border border-primary/30 rounded-full animate-ping opacity-20"></div>
                         <div className="absolute top-[20%] left-[30%] w-12 h-12 border border-secondary/50 rounded-full animate-[ping_2s_infinite] opacity-40 mix-blend-screen"></div>
                         <div className="absolute bottom-[25%] right-[20%] w-8 h-8 border border-error/50 rounded-full animate-[ping_3s_infinite_1s] opacity-40 mix-blend-screen"></div>
                         <div className="absolute top-[60%] left-[60%] w-16 h-16 border border-tertiary/30 rounded-full animate-[ping_2.5s_infinite_0.5s] opacity-30 mix-blend-screen"></div>
                      </div>
                    </>
                  ) : (
                    <div className="text-secondary/50 font-mono text-xs uppercase text-center animate-pulse">
                      <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                      <br/>Awaiting Visual Data Stream...
                    </div>
                  )}
                </div>
              </div>

              {/* Pipeline Track */}
              <div className="h-32 flex gap-4 shrink-0">
                {steps.map((s, i) => {
                  const isDone = i < step;
                  const isCurrent = i === step;
                  return (
                    <div key={s.id} className={`flex-1 rounded-xl p-4 border-l-4 flex flex-col justify-between transition-all duration-500 ${
                      isDone ? 'bg-secondary/5 border-secondary' :
                      isCurrent ? 'bg-primary/5 border-primary shadow-lg scale-105' :
                      'bg-surface-container-low border-outline-variant/20 opacity-40'
                    }`}>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isDone ? 'text-secondary' : isCurrent ? 'text-primary' : 'text-on-surface-variant'}`}>{s.id} {s.label}</span>
                      <span className={`material-symbols-outlined text-2xl ${isDone ? 'text-secondary' : isCurrent ? 'text-primary animate-pulse' : 'text-on-surface-variant'}`} style={isDone || isCurrent ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        {s.icon}
                      </span>
                      <span className="text-[9px] font-bold text-on-surface/40 uppercase tracking-tighter">
                        {isDone ? 'SYNCHRONIZED' : isCurrent ? 'PROCESSING...' : 'QUEUED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terminal Sidebar */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6 min-h-0">
              <div className="flex-1 bg-black/40 border border-outline-variant/10 rounded-2xl flex flex-col overflow-hidden font-mono shadow-2xl relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(174,198,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none animate-grid-scroll"></div>
                <div className="bg-surface-container-low px-5 py-3 border-b border-outline-variant/10 flex justify-between items-center relative z-10">
                  <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest font-headline flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    Telemetry Console
                  </span>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-error/40 border border-error/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-tertiary/40 border border-tertiary/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary/40 border border-secondary/20"></div>
                  </div>
                </div>
                <div className="flex-1 p-5 text-[#aec6ff]/80 text-[11px] overflow-y-auto flex flex-col gap-3 leading-relaxed relative z-10">
                  {logs.map((L, i) => (
                    <div key={i} className="flex gap-3 animate-type-fade">
                      <span className="text-on-surface-variant/40 shrink-0">[{L.t}]</span>
                      <span className={`animate-typecode ${L.type === 'primary' ? 'text-primary font-bold drop-shadow-[0_0_5px_rgba(0,112,243,0.8)]' : L.type === 'pulse' ? 'text-secondary animate-pulse font-black' : 'text-primary/70'}`}>
                        {L.msg}
                      </span>
                    </div>
                  ))}
                  {logs.length < logPool.length && !error && <div className="animate-pulse text-primary font-bold">_</div>}
                </div>
              </div>

              {/* Resource Cluster */}
              <div className="h-52 glass-panel rounded-2xl border border-white/5 p-6 flex flex-col justify-between shadow-xl bg-black/10">
                <h3 className="text-[10px] font-bold text-on-surface tracking-[0.2em] uppercase mb-4 font-headline">Resource Allocation</h3>
                <div className="space-y-5">
                  {[
                    { label: 'GPU CLUSTER ALPHA', value: 88, color: 'bg-primary' },
                    { label: 'NEURAL ENGINE LOAD', value: 42, color: 'bg-secondary' },
                    { label: 'VRAM SATURATION', value: 65, color: 'bg-tertiary' },
                  ].map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{r.label}</span>
                        <span className={`text-[10px] font-bold uppercase ${r.color === 'bg-primary' ? 'text-primary' : r.color === 'bg-secondary' ? 'text-secondary' : 'text-tertiary'}`}>{r.value}%</span>
                      </div>
                      <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                        <div className={`h-full ${r.color} transition-all duration-1000`} style={{ width: `${r.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="mt-8 flex justify-between items-end relative z-10 shrink-0">
            <div className="flex gap-10">
              {[
                { label: 'Sequence ID', val: `ONCO-${patientData.organType?.toUpperCase()}-PRO-1` },
                { label: 'Uptime', val: '00:14:22:04' },
                { label: 'Mode', val: 'LOCAL PROTOTYPE' },
              ].map((m, i) => (
                <div key={i}>
                  <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mb-1.5">{m.label}</p>
                  <p className="text-[11px] font-mono text-on-surface/60 font-bold">{m.val}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-surface-bright transition-all border border-outline-variant/10 font-headline"
              >
                Abort_Sequence
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
