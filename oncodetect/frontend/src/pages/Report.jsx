import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/usePatient';
import api from '../lib/api';
import DisclaimerBanner from '../components/DisclaimerBanner';

const TRIAGE_CFG = {
  high:     { label: 'CRITICAL',     color: '#FF4444',  bg: 'rgba(255,68,68,0.08)',    border: 'rgba(255,68,68,0.25)' },
  moderate: { label: 'OBSERVATION',  color: '#FFBC42',  bg: 'rgba(255,188,66,0.08)',   border: 'rgba(255,188,66,0.25)' },
  low:      { label: 'NORMAL',       color: '#00D4A8',  bg: 'rgba(0,212,168,0.08)',    border: 'rgba(0,212,168,0.25)' },
};

const ORGAN_LABELS = { brain: 'Brain MRI', lung: 'Lung X-Ray', breast: 'Breast Mammogram' };

export default function Report() {
  const navigate = useNavigate();
  const { patientData, reportData, resetPatient, addToast } = usePatient();
  const [barWidth, setBarWidth] = useState(0);
  const [view, setView] = useState('doctor');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!reportData) {
      addToast('No report found — redirecting.', 'info');
      navigate('/');
      return;
    }
    const t = setTimeout(() => setBarWidth((reportData.probabilityScore || 0) * 100), 600);
    return () => clearTimeout(t);
  }, [reportData, navigate, addToast]);

  if (!reportData) return null;

  const triageKey = reportData.triageLevel?.toLowerCase() || 'moderate';
  const triage = TRIAGE_CFG[triageKey] || TRIAGE_CFG.moderate;
  const probPct = Math.round((reportData.probabilityScore || 0) * 100);
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      addToast('Generating PDF...', 'info');
      const payload = {
        ...reportData,
        patientName: patientData?.name,
        heatmapBase64: reportData.heatmapBase64?.trim().replace(/\s/g, '') || null,
      };
      const res = await api.post('/api/report/generate', payload, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `OncoDetect_${patientData?.name?.replace(/\s+/g,'_') || 'Report'}.pdf`;
      a.click();
      addToast('PDF downloaded.', 'success');
    } catch {
      addToast('PDF generation failed.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-5">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00D4A8] mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            Clinical Output
          </p>
          <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-[#FAFAFA]">Diagnostics Assessment</h1>
          <p className="text-[10px] font-mono text-[#444] mt-2 uppercase tracking-widest">{reportData.reportId || 'OD-FINAL-TX'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-[#444] uppercase">Generated On</p>
          <p className="text-sm font-headline font-bold text-[#FAFAFA] mt-1 uppercase">{timestamp} UTC</p>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-min">

        {/* Patient + Triage Banner */}
        <div className="md:col-span-8 bg-[#0a0a0a] border border-white/[0.06] p-7">
          <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#444] mb-5">Patient Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              ['ID', patientData?.patientId || patientData?.name || 'ANON'],
              ['Modality', ORGAN_LABELS[patientData?.organType] || patientData?.organType || '--'],
              ['Age', patientData?.age ? `${patientData.age} YRS` : '--'],
              ['Gender', patientData?.gender?.toUpperCase() || 'U'],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-[9px] font-mono text-[#444] uppercase tracking-widest block mb-1">{k}</span>
                <span className="text-sm font-headline font-bold text-[#FAFAFA] uppercase">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-4 p-7 flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ background: triage.bg, border: `1px solid ${triage.border}` }}>
          <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest mb-2">Triage Status</span>
          <span className="text-3xl font-headline font-black uppercase tracking-widest" style={{ color: triage.color }}>{triage.label}</span>
        </div>

        {/* Probability Meter */}
        <div className="md:col-span-12 bg-[#0a0a0a] border border-white/[0.06] p-7">
          <div className="flex justify-between items-end mb-5">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#444]">Cancer Probability Matrix</h2>
            <span className="text-4xl font-headline font-bold" style={{ color: triage.color }}>{probPct}<span className="text-xl">%</span></span>
          </div>
          <div className="h-4 w-full bg-white/[0.04] overflow-hidden border border-white/[0.04] mb-3">
            <div className="h-full transition-all duration-[2000ms] ease-out" style={{ width: `${barWidth}%`, backgroundColor: triage.color, boxShadow: `0 0 14px ${triage.color}60` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#333] uppercase">
            <span>0% — LOW</span>
            <span>30% — MODERATE</span>
            <span>60% — HIGH</span>
          </div>
        </div>

        {/* Heatmap */}
        <div className="md:col-span-5 bg-[#0a0a0a] border border-white/[0.06] p-5">
          <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#444] mb-4">Vision Attention Density</h2>
          <div className="aspect-[4/5] bg-black relative overflow-hidden border border-white/[0.06] flex items-center justify-center">
            {reportData.heatmapBase64 ? (
              <img src={`data:image/png;base64,${reportData.heatmapBase64}`} alt="Heatmap" className="w-full h-full object-cover mix-blend-screen opacity-90 grayscale" />
            ) : (
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQmXgGZ1VOrM1c0NIsDq_WzB-yT1y5F9XkQ8ZlJ5_gB8V2T2CzvG4aM8h6QfMhPZpX8N8mQwPExf3J3C3Q8XhZyT5z1-7C6G7Z7-7f9u3z9u8Y2b9A9-0a6k6H8T5w4U9e2-1Z9n-u-f-4K9w5E7g8_1s-w-6FzUaZb1Uq3f2v"
                alt="Fallback" className="w-full h-full object-cover mix-blend-screen opacity-80 grayscale"
              />
            )}
            <div className="absolute inset-0 scanline opacity-20 pointer-events-none"></div>
            <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 border border-white/10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00D4A8] animate-pulse rounded-full"></span>
              <span className="font-mono text-[9px] text-[#00D4A8] uppercase">Active</span>
            </div>
            {/* Corner brackets */}
            {['top-2 left-2 border-t-2 border-l-2','top-2 right-2 border-t-2 border-r-2','bottom-2 left-2 border-b-2 border-l-2','bottom-2 right-2 border-b-2 border-r-2'].map((cls, i) => (
              <div key={i} className={`absolute w-4 h-4 ${cls} border-[#00D4A8]/50`}></div>
            ))}
          </div>
        </div>

        {/* Clinical Context */}
        <div className="md:col-span-7 flex flex-col gap-5">
          {/* Reasoning Trace */}
          <div className="bg-[#050505] border border-white/[0.06] p-0 flex-1">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-sm text-[#00D4A8]">memory</span>
                <h2 className="text-[10px] font-mono uppercase tracking-widest text-[#444]">LPU Reasoning Trace</h2>
              </div>
              <div className="flex border border-white/[0.06]">
                {['doctor','patient'].map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest font-mono cursor-pointer transition-all ${view === v ? 'bg-[#00D4A8] text-[#050505]' : 'text-[#444] hover:text-[#FAFAFA]'}`}>
                    {v === 'doctor' ? 'Medical' : 'Plain'}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 max-h-52 overflow-y-auto custom-scrollbar">
              <p className="text-sm text-[#FAFAFA]/80 leading-relaxed font-body whitespace-pre-wrap">
                {view === 'doctor' ? (reportData.reasoningTrace || reportData.doctorExplanation || 'Reasoning trace not available.') : (reportData.patientExplanation || 'Plain-language summary not available.')}
              </p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-[#0a0a0a] border border-white/[0.06] p-6 border-l-2 border-l-[#00D4A8]">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-[#00D4A8] mb-3">Clinical Recommendation</h2>
            <p className="text-sm text-[#FAFAFA] leading-relaxed font-body font-medium">
              {reportData.triageRecommendation || 'Expedited review is required based on system confidence intervals.'}
            </p>
            {reportData.recommendations?.length > 0 && (
              <ul className="mt-4 space-y-2">
                {reportData.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#444] font-mono">
                    <span className="material-symbols-outlined text-[14px] text-[#00D4A8] mt-0.5">chevron_right</span>
                    {rec}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Risk Summary */}
          <div className="p-5 border" style={{ background: triage.bg, borderColor: triage.border }}>
            <p className="text-[10px] font-mono font-black uppercase tracking-widest mb-2" style={{ color: triage.color }}>Clinical Risk Assessment</p>
            <p className="text-sm text-[#FAFAFA] leading-relaxed font-body">
              {reportData.riskSummary || 'Risk profile generated from vision and clinical context integration.'}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="md:col-span-12">
          <DisclaimerBanner />
        </div>
      </div>

      {/* Actions */}
      <footer className="mt-10 flex flex-col md:flex-row justify-between items-center gap-5 py-6 border-t border-white/[0.06] print:hidden">
        <button onClick={() => { resetPatient(); navigate('/'); }}
          className="text-[10px] font-mono uppercase tracking-widest text-[#444] hover:text-[#FAFAFA] transition-colors cursor-pointer">
          Initialize New Process
        </button>
        <div className="flex gap-3">
          <button onClick={() => window.print()}
            className="px-6 py-3 border border-white/10 text-[#FAFAFA] text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-white/[0.04] transition-all cursor-pointer">
            Print
          </button>
          <button onClick={handleDownloadPDF} disabled={isDownloading}
            className="px-8 py-3 bg-[#00D4A8] text-[#050505] text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#00a882] hover:shadow-[0_0_25px_rgba(0,212,168,0.4)] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60">
            {isDownloading && <span className="material-symbols-outlined text-sm" style={{ animation: 'spin 1.2s linear infinite' }}>sync</span>}
            Download PDF
          </button>
        </div>
      </footer>
    </div>
  );
}
