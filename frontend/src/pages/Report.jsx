import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { getApiErrorMessage } from '../lib/api';
import { usePatient } from '../context/usePatient';

function normalizeTriageLevel(level) {
  return String(level || 'low').toLowerCase();
}

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = usePatient();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [animProb, setAnimProb] = useState(0);

  useEffect(() => {
    let interval;

    api.get(`/api/reports/${id}`)
      .then((response) => {
        setReport(response.data);
        const target = Math.round((response.data.probabilityScore || 0) * 100);
        let current = 0;
        interval = setInterval(() => {
          current += 2;
          if (current >= target) {
            setAnimProb(target);
            clearInterval(interval);
          } else {
            setAnimProb(current);
          }
        }, 30);
      })
      .catch((error) => {
        addToast(getApiErrorMessage(error, 'The requested report could not be loaded.'), 'error');
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));

    return () => {
      clearInterval(interval);
    };
  }, [id, navigate, addToast]);

  const handleDownloadPdf = async () => {
    if (!report) return;
    setPdfLoading(true);

    try {
      const response = await api.post('/api/report/generate', {
        patientName: report.patientName || 'Unknown',
        patientAge: report.patientAge || '',
        patientGender: report.patientGender || '',
        organType: report.organType || '',
        probabilityScore: report.probabilityScore || 0,
        confidenceBand: report.confidenceBand || [0, 0],
        triageLevel: report.triageLevel || 'low',
        reasoningTrace: report.reasoningTrace || '',
        riskSummary: report.riskSummary || '',
        doctorExplanation: report.doctorExplanation || '',
        patientExplanation: report.patientExplanation || '',
        triageRecommendation: report.triageRecommendation || '',
        differentialHints: report.differentialHints || [],
        confidenceNote: report.confidenceNote || '',
        auditFlags: report.auditFlags || [],
        auditPassed: report.auditPassed ?? true,
        recommendations: [],
        heatmapBase64: report.heatmapBase64 || null,
        modelSource: report.modelSource || 'Unknown',
      }, { responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `OncoDetect_Report_${report.patientName || 'Patient'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('PDF report downloaded.', 'success');
    } catch (error) {
      addToast(getApiErrorMessage(error, 'PDF generation failed. Please try again.'), 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCopySummary = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(
        [
          `Patient: ${report.patientName || 'Unknown'}`,
          `Triage: ${report.triageLevel || 'low'}`,
          `Risk summary: ${report.riskSummary || 'Unavailable'}`,
          `Recommendation: ${report.triageRecommendation || 'Consult a clinician.'}`,
        ].join('\n')
      );
      addToast('Summary copied to clipboard.', 'success');
    } catch {
      addToast('Clipboard access is unavailable in this browser.', 'warning');
    }
  };

  if (loading || !report) {
    return (
      <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface overflow-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(0,112,243,0.3)]"></div>
            <p className="font-bold text-on-surface-variant uppercase tracking-[0.2em] animate-pulse">Fetching Clinical Data...</p>
          </div>
        </div>
      </div>
    );
  }

  const triageLevel = normalizeTriageLevel(report.triageLevel);
  const isHigh = triageLevel === 'high';

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 h-full bg-surface-container-low hidden md:flex flex-col py-8 px-6 gap-6 border-r border-outline-variant/10 shrink-0">
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold font-headline">Clinical Result</span>
            <h1 className="text-xl font-bold text-on-surface font-headline uppercase tracking-tight">Final Assessment</h1>
          </div>

          <div className={`p-6 rounded-2xl border ${isHigh ? 'bg-error-container/20 border-error/30 shadow-[0_0_30px_rgba(255,68,68,0.15)]' : 'bg-secondary-container/10 border-secondary/30 shadow-[0_0_30px_rgba(0,212,168,0.1)]'} flex flex-col items-center text-center gap-4 shadow-xl transition-all duration-1000`}>
            <span className={`material-symbols-outlined text-4xl ${isHigh ? 'text-error hover:scale-110 transition-transform' : 'text-secondary hover:scale-110 transition-transform'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {isHigh ? 'warning' : 'verified'}
            </span>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isHigh ? 'text-error' : 'text-secondary'}`}>Triage Level</p>
              <p className="text-2xl font-black font-headline uppercase mt-1 tracking-wider">{triageLevel}</p>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-2 relative">
              <div className={`absolute top-0 left-0 h-full ${isHigh ? 'bg-error' : 'bg-secondary'} transition-all duration-75`} style={{ width: `${animProb}%` }}></div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-outline-variant/10">
            <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <span>Organ</span>
              <span className="text-on-surface capitalize">{report.organType}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <span>Probability</span>
              <span className={`font-bold ${isHigh ? 'text-error' : 'text-secondary'} font-mono text-sm`}>{animProb}%</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <span>Model</span>
              <span className="text-on-surface text-[9px]">{report.modelSource?.split('/').pop() || 'ML Engine'}</span>
            </div>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="mt-auto w-full py-3 bg-surface-container-high border border-outline-variant/20 text-on-surface text-[10px] uppercase font-bold tracking-widest rounded-xl hover:bg-surface-bright transition-all flex items-center justify-center gap-3 font-headline disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">{pdfLoading ? 'hourglass_empty' : 'download'}</span>
            {pdfLoading ? 'Generating...' : 'Download PDF Report'}
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto p-8 md:p-12 relative flex flex-col">
          <div className="data-grid-overlay absolute inset-0 opacity-10 pointer-events-none"></div>

          <div className="max-w-4xl mx-auto w-full relative z-10 space-y-10 pb-20">
            <div className="flex justify-between items-start border-b border-outline-variant/10 pb-8">
              <div>
                <p className="text-primary text-[10px] tracking-[0.2em] uppercase font-bold mb-3">OncoDetect Research Report</p>
                <h2 className="text-4xl font-bold font-headline">{report.patientName || 'Anonymous Subject'}</h2>
                <div className="flex gap-4 mt-3 flex-wrap">
                  <span className="px-3 py-1 bg-surface-container-highest/50 rounded-lg text-[9px] font-bold uppercase text-on-surface-variant border border-outline-variant/5">Age: {report.patientAge}</span>
                  <span className="px-3 py-1 bg-surface-container-highest/50 rounded-lg text-[9px] font-bold uppercase text-on-surface-variant border border-outline-variant/5">Gender: {report.patientGender || 'Unspecified'}</span>
                  <span className="px-3 py-1 bg-surface-container-highest/50 rounded-lg text-[9px] font-bold uppercase text-on-surface-variant border border-outline-variant/5">ID: #OD-{(report.id || '').substring(0, 8)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2 font-headline">Confidence Score</p>
                <p className={`text-5xl font-black font-headline ${isHigh ? 'text-error' : 'text-primary'}`}>{animProb}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-6 bg-black/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/10 shadow-lg">
                    <span className="material-symbols-outlined">clinical_notes</span>
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface font-headline">Doctor Explanation</h3>
                </div>
                <div className="bg-surface-container/30 p-6 rounded-xl border border-outline-variant/10">
                  <p className="text-on-surface/80 text-sm leading-relaxed font-body">{report.doctorExplanation || 'No clinical explanation available.'}</p>
                </div>
                {isHigh && (
                  <div className="mt-2 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-error text-xl">priority_high</span>
                    <div>
                      <p className="text-[10px] font-bold text-error uppercase tracking-widest font-headline">Priority Review</p>
                      <p className="text-[11px] text-error/80 mt-1 uppercase font-bold">This case should be reviewed promptly by a qualified clinician.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="glass-panel p-8 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-6 bg-black/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary border border-outline-variant/10 shadow-lg">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface font-headline">Patient Summary</h3>
                </div>
                <div className="bg-surface-container/30 p-6 rounded-xl border border-outline-variant/10">
                  <p className="text-on-surface/80 text-sm leading-relaxed font-body">{report.patientExplanation || 'Your results have been processed. Please consult your doctor.'}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-white/5 shadow-xl bg-black/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary border border-outline-variant/10 shadow-lg">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface font-headline">AI Reasoning Trace</h3>
              </div>
              <div className="bg-surface-container/30 p-6 rounded-xl border border-outline-variant/10">
                <p className="text-on-surface/80 text-sm leading-relaxed font-body">{report.reasoningTrace || 'Reasoning trace not available.'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 rounded-2xl border border-white/5 shadow-xl bg-black/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/10 shadow-lg">
                    <span className="material-symbols-outlined">assignment</span>
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface font-headline">Triage Recommendation</h3>
                </div>
                <p className="text-on-surface/80 text-sm leading-relaxed font-body">{report.triageRecommendation || 'Consult a qualified clinician.'}</p>
              </div>

              <div className="glass-panel p-8 rounded-2xl border border-white/5 shadow-xl bg-black/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary border border-outline-variant/10 shadow-lg">
                    <span className="material-symbols-outlined">difference</span>
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface font-headline">Differential Hints</h3>
                </div>
                <ul className="space-y-3">
                  {(report.differentialHints || []).map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-lg mt-0.5">arrow_right</span>
                      <p className="text-on-surface/80 text-sm font-body">{item}</p>
                    </li>
                  ))}
                  {(!report.differentialHints || report.differentialHints.length === 0) && (
                    <li className="text-on-surface-variant text-sm">No differential hints available.</li>
                  )}
                </ul>
              </div>
            </div>

            {report.heatmapBase64 && (
              <div className="glass-panel p-8 rounded-2xl border border-white/5 shadow-xl bg-black/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/10 shadow-lg">
                    <span className="material-symbols-outlined">image</span>
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface font-headline">Attention Map</h3>
                </div>
                <img src={report.heatmapBase64} alt="Model attention heatmap" className="w-full max-w-md rounded-2xl border border-outline-variant/10" />
              </div>
            )}

            <div className={`p-6 rounded-2xl border-l-4 ${isHigh ? 'bg-error/10 border-error' : 'bg-surface-container-low border-primary'}`}>
              <div className="flex items-center gap-4 mb-3">
                <span className={`material-symbols-outlined ${isHigh ? 'text-error' : 'text-primary'}`}>summarize</span>
                <p className="text-xs font-bold uppercase tracking-[0.2em] font-headline">Risk Summary</p>
              </div>
              <p className="text-sm text-on-surface/80 font-body leading-relaxed">{report.riskSummary || 'Risk summary not available.'}</p>
            </div>

            <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10">
              <div className="flex items-center gap-4 mb-4">
                <span className={`material-symbols-outlined ${report.auditPassed ? 'text-secondary' : 'text-error'}`}>
                  {report.auditPassed ? 'verified' : 'gpp_bad'}
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.2em] font-headline">
                  Audit: {report.auditPassed ? 'Passed' : 'Flags detected'}
                </p>
              </div>
              {report.auditFlags?.length ? (
                <ul className="space-y-2">
                  {report.auditFlags.map((flag, index) => (
                    <li key={index} className="text-xs text-on-surface-variant flex items-start gap-2">
                      <span className="text-tertiary mt-0.5">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-on-surface-variant">No audit flags were returned for this report.</p>
              )}
            </div>

            {report.confidenceNote && (
              <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                    <span className="font-bold text-on-surface">CONFIDENCE NOTE:</span> {report.confidenceNote}
                  </p>
                </div>
              </div>
            )}

            <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10 border-l-4 border-primary">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary">info</span>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                  <span className="font-bold text-on-surface">RESEARCH DISCLAIMER:</span> This output is generated by a research prototype. It may assist review, but it is not a diagnosis and must be validated by a qualified clinician.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-outline-variant/10">
              <button
                onClick={() => navigate('/history')}
                className="px-8 py-3 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-surface-container-high transition-all flex items-center gap-3 font-headline"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                View History
              </button>
              <div className="flex gap-4">
                <button
                  onClick={handleCopySummary}
                  className="px-8 py-3 bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-surface-bright transition-all border border-outline-variant/10 font-headline flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                  Copy Summary
                </button>
                <button
                  onClick={() => navigate('/new-analysis')}
                  className="px-10 py-3 bg-gradient-to-br from-primary-container to-primary text-on-primary-container text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg hover:scale-105 transition-all font-headline"
                >
                  New Analysis
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
