import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatient } from '../context/usePatient';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  Download, RefreshCw, Shield, AlertTriangle, ArrowRight,
  Eye, Users, ChevronDown, ChevronUp, Printer, Copy
} from 'lucide-react';
import api from '../lib/api';
import { usePageTransition } from '../hooks/usePageTransition';
import { SkeletonReport } from '../components/LoadingSkeleton';

const triageConfig = {
  high: { label: 'HIGH RISK', bg: 'rgba(255, 68, 68, 0.12)', border: 'rgba(255, 68, 68, 0.3)', text: '#FF4444', glow: 'rgba(255, 68, 68, 0.2)' },
  moderate: { label: 'MODERATE RISK', bg: 'rgba(255, 188, 66, 0.12)', border: 'rgba(255, 188, 66, 0.3)', text: '#FFBC42', glow: 'rgba(255, 188, 66, 0.2)' },
  low: { label: 'LOW RISK', bg: 'rgba(0, 200, 83, 0.12)', border: 'rgba(0, 200, 83, 0.3)', text: '#00C853', glow: 'rgba(0, 200, 83, 0.2)' },
};

const organLabels = {
  brain: 'Brain MRI',
  lung: 'Lung X-Ray',
  breast: 'Breast Mammogram',
};

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patientData, reportData, setReportData, setPatientData, resetPatient, addToast } = usePatient();
  const [view, setView] = useState('doctor'); // 'doctor' | 'patient'
  const [barWidth, setBarWidth] = useState(0);
  const [showRecs, setShowRecs] = useState(true);
  const [showReasoning, setShowReasoning] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [loadingDb, setLoadingDb] = useState(false);
  const isVisible = usePageTransition(10);

  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (id && !reportData) {
      const fetchReport = async () => {
        setLoadingDb(true);
        try {
          const res = await api.get(`/api/reports/${id}`);
          if (cancelled) return;
          const hydratedReport = {
            ...res.data,
            reportId: res.data.reportId || res.data.id,
            recommendations: res.data.recommendations || [],
          };
          setReportData(hydratedReport);
          setPatientData({
            name: res.data.patientName || '',
            age: res.data.patientAge || '',
            gender: res.data.patientGender || '',
            organType: res.data.organType || '',
          });
        } catch (err) {
          if (!cancelled) {
            console.error(err);
            addToast('Failed to load report from database', 'error');
            navigate('/');
          }
        } finally {
          if (!cancelled) {
            setLoadingDb(false);
          }
        }
      };
      fetchReport();
      return () => {
        cancelled = true;
      };
    }

    if (!reportData && !redirecting && !loadingDb && !id) {
      setRedirecting(true);
      const t = setTimeout(() => {
        addToast('Redirecting to home...', 'info');
        navigate('/');
      }, 2000);
      return () => clearTimeout(t);
    }
    
    if (reportData) {
      // Show skeleton briefly for smooth UX
      const t1 = setTimeout(() => setInitialLoad(false), 800);
      
      // Animate probability bar
      const t2 = setTimeout(() => {
        setBarWidth(reportData.probabilityScore * 100);
      }, 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); }
    }
  }, [id, reportData, loadingDb, navigate, addToast, redirecting, setPatientData, setReportData]);

  useEffect(() => {
    if (view === 'doctor') {
      setShowReasoning(true);
    }
  }, [view]);

  if (loadingDb || (id && !reportData)) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050505]">
        <Navbar />
        <main className="flex-1 px-8 md:px-12 pt-32 pb-24 max-w-[1200px] mx-auto w-full">
          <SkeletonReport />
        </main>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505]">
        <div className="w-24 h-24 rounded-full bg-[rgba(0,212,168,0.1)] flex items-center justify-center mb-6">
          <Shield size={36} className="text-[#00D4A8]" />
        </div>
        <h2 className="text-xl font-bold text-[#E8EDF5] mb-2">No analysis found</h2>
        <p className="text-[#7A8DA8] mb-8 text-center max-w-sm">
          Start a new analysis to see your triage report here.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-[#00D4A8] text-[#050505] font-bold text-xs uppercase tracking-[0.2em] transition-all hover:shadow-[0_0_20px_rgba(0,212,168,0.3)]"
        >
          Start Analysis
        </button>
      </div>
    );
  }

  const triage = triageConfig[reportData.triageLevel] || triageConfig.moderate;
  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handleNewAnalysis = () => {
    resetPatient();
    navigate('/');
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      addToast('Generating PDF report...', 'info', 0); // No timeout
      
      const payload = { 
        ...reportData, 
        patientName: patientData.name || reportData.patientName || 'Unknown Patient',
        patientAge: patientData.age || reportData.patientAge || '',
        patientGender: patientData.gender || reportData.patientGender || '',
        recommendations: reportData.recommendations || reportData.differentialHints || [],
        heatmapBase64: reportData.heatmapBase64 ? reportData.heatmapBase64.trim().replace(/\s/g, "") : null
      };
      const response = await api.post('/api/report/generate', payload, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const exportName = (patientData.name || reportData.patientName || 'Patient').replace(/\s+/g, '_');
      link.setAttribute('download', `OncoDetect_Report_${exportName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      addToast('PDF download complete', 'success');
    } catch (err) {
      console.error('PDF generation failed', err);
      addToast('Failed to generate PDF. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `OncoDetect Triage Report
Patient: ${patientData.name || 'Unknown'}, ${patientData.age || 'N/A'}, ${patientData.gender || 'N/A'}
Organ: ${organLabels[reportData.organType] || reportData.organType}
Triage Level: ${reportData.triageLevel.toUpperCase()}
Risk Summary: ${reportData.riskSummary || 'N/A'}
Recommendation: ${reportData.triageRecommendation || 'N/A'}
Generated: ${timestamp}
${reportData.reportId ? `Report ID: ${reportData.reportId}\n` : ''}DISCLAIMER: Decision support only. Not a clinical diagnosis.`;

    if (!navigator.clipboard?.writeText) {
      addToast("Clipboard access is unavailable in this browser", "warning");
      return;
    }

    navigator.clipboard.writeText(summary)
      .then(() => addToast("Summary copied to clipboard", "success"))
      .catch(() => addToast("Could not copy to clipboard", "error"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] print:bg-white print:text-black">
      <Navbar />

      <main 
        className="flex-1 px-8 md:px-12 pt-32 pb-24 max-w-[1200px] mx-auto w-full transition-all duration-700 print:pt-4 print:pb-0"
        style={{ 
          opacity: isVisible ? 1 : 0, 
          transform: isVisible ? 'translateY(0)' : 'translateY(24px)' 
        }}
      >
        {initialLoad ? (
          <SkeletonReport />
        ) : (
          <div className="animate-fade-in-up">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row gap-8 mb-12 items-stretch print:flex-col">
              {/* Patient & Report Info */}
              <div className="flex-1 glass-card p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Shield size={24} className="text-[#00D4A8]" />
                    <h1 className="text-xl sm:text-2xl font-bold tracking-[0.14em] text-[#FAFAFA] uppercase">Triage Report</h1>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                      <p className="text-xs sm:text-sm text-[#7A8DA8] uppercase tracking-[0.12em] mb-1">Patient Name</p>
                      <p className="text-sm font-semibold text-[#FAFAFA]">{patientData.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-[#7A8DA8] uppercase tracking-[0.12em] mb-1">Organ System</p>
                      <p className="text-sm font-semibold text-[#FAFAFA]">{organLabels[reportData.organType] || reportData.organType}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-[#7A8DA8] uppercase tracking-[0.12em] mb-1">Metadata</p>
                      <p className="text-sm font-medium text-[#FAFAFA] opacity-80">{patientData.age}y · {patientData.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-[#7A8DA8] uppercase tracking-[0.12em] mb-1">Report ID</p>
                      <p className="text-sm font-mono text-[#FAFAFA] opacity-80">{reportData.reportId || 'OD-PENDING'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                   <p className="text-xs sm:text-sm text-[#555] tracking-[0.12em] uppercase">{timestamp}</p>
                </div>
              </div>

              {/* Triage Level Badge */}
              <div 
                className="w-full lg:w-72 flex flex-col items-center justify-center p-8 transition-all duration-700"
                style={{ 
                  background: triage.bg,
                  border: `1px solid ${triage.text}33`,
                  boxShadow: `0 0 60px ${triage.text}15`
                }}
              >
                <div 
                  className="w-20 h-20 rounded-none flex items-center justify-center mb-6 relative"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${triage.text}44` }}
                >
                  <AlertTriangle size={32} style={{ color: triage.text }} />
                  <div className="absolute inset-0 animate-pulse opacity-20" style={{ background: triage.text }} />
                </div>
                <p className="text-sm font-bold tracking-[0.16em] uppercase mb-2" style={{ color: triage.text }}>
                  Triage Status
                </p>
                <div 
                  className="text-2xl font-black tracking-[0.1em] text-center"
                  style={{ color: triage.text, textShadow: `0 0 20px ${triage.text}55` }}
                >
                  {reportData.triageLevel.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Probability Score & Risk Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-start">
              <div className="lg:col-span-2 glass-card p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xs font-bold tracking-[0.2em] text-[#FAFAFA] uppercase">Cancer Probability</h2>
                  <span className="text-xl font-bold font-mono" style={{ color: triage.text }}>
                    {Math.round(reportData.probabilityScore * 100)}%
                  </span>
                </div>
                
                <div className="h-3 w-full bg-[rgba(255,255,255,0.05)] mb-6 overflow-hidden">
                  <div 
                    className="h-full transition-all duration-[2000ms] ease-out"
                    style={{ 
                      width: `${barWidth}%`, 
                      background: triage.text,
                      boxShadow: `0 0 20px ${triage.text}88`
                    }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-xs sm:text-sm tracking-[0.12em] text-[#555] uppercase font-bold">
                  <span>Confidence: {(reportData.confidenceBand[0] * 100).toFixed(0)}%</span>
                  <span>Target: {(reportData.confidenceBand[1] * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Audit / Risk Summary */}
              <div 
                className="h-full p-8 border-l-4"
                style={{ 
                  background: `color-mix(in srgb, ${triage.text} 5%, transparent)`,
                  borderColor: triage.text 
                }}
              >
                <p className="text-xs sm:text-sm font-black tracking-[0.14em] uppercase mb-4" style={{ color: triage.text }}>
                  Clinical Risk Assessment
                </p>
                <p className="text-sm font-semibold leading-relaxed text-[#FAFAFA] tracking-wide">
                  {reportData.riskSummary || 'Risk profile generated based on vision and clinical context integration.'}
                </p>
              </div>
            </div>

            {/* Reasoning Trace (Doctor only) */}
            {view === 'doctor' && reportData.reasoningTrace && (
              <div className="mb-8 border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="w-full flex items-center justify-between p-6 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <span className="text-sm font-bold tracking-[0.14em] text-[#FAFAFA] uppercase">Intelligence Trace</span>
                  <ChevronDown size={18} className={`text-[#555] transition-transform duration-500 ${showReasoning ? 'rotate-180' : ''}`} />
                </button>
                {showReasoning && (
                  <div className="p-8 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                    <div className="p-6 bg-[rgba(0,212,168,0.02)] border-l-2 border-[#00D4A8]">
                       <p className="text-sm text-[#FAFAFA] leading-loose font-light whitespace-pre-line opacity-90">
                        {reportData.reasoningTrace}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Heatmap & Explanation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Image Analysis */}
              <div className="glass-card p-8">
                 <h2 className="text-sm font-bold tracking-[0.14em] text-[#7A8DA8] uppercase mb-8">Vision Analysis Attention</h2>
                 {reportData.heatmapBase64 ? (
                  <div className="relative">
                    <img src={`data:image/png;base64,${reportData.heatmapBase64}`} alt="Heatmap" className="w-full grayscale-[0.2] contrast-[1.1]" />
                    <div className="absolute inset-0 border border-[rgba(255,255,255,0.1)] pointer-events-none" />
                  </div>
                 ) : (
                  <div className="aspect-video bg-[rgba(255,255,255,0.02)] border border-dashed border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                    <p className="text-xs sm:text-sm text-[#555] uppercase tracking-[0.12em]">Awaiting Vision Engine Response</p>
                  </div>
                 )}
              </div>

              {/* View Toggle and Text */}
              <div className="glass-card p-8 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-sm font-bold tracking-[0.14em] text-[#7A8DA8] uppercase">Clinical Context</h2>
                  <div className="flex bg-[rgba(255,255,255,0.03)] p-1 border border-[rgba(255,255,255,0.05)]">
                    <button 
                      onClick={() => setView('doctor')}
                      className={`px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-[0.12em] transition-all
                        ${view === 'doctor' ? 'bg-[#00D4A8] text-[#050505]' : 'text-[#7A8DA8] hover:text-white'}`}
                    >
                      Medical
                    </button>
                    <button 
                      onClick={() => setView('patient')}
                      className={`px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-[0.12em] transition-all
                        ${view === 'patient' ? 'bg-[#00D4A8] text-[#050505]' : 'text-[#7A8DA8] hover:text-white'}`}
                    >
                      Plain
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 p-6 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.03)] h-full">
                  <p className="text-sm text-[#FAFAFA] leading-relaxed font-light whitespace-pre-line">
                    {view === 'doctor' ? reportData.doctorExplanation : reportData.patientExplanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card mb-12">
               <button 
                 onClick={() => setShowRecs(!showRecs)}
                 className="w-full flex items-center justify-between p-8"
               >
                 <h2 className="text-sm font-bold tracking-[0.14em] text-[#FAFAFA] uppercase">Clinical Decision Support</h2>
                 <ChevronDown size={18} className={`text-[#555] transition-transform duration-500 ${showRecs ? 'rotate-180' : ''}`} />
               </button>
               {showRecs && (
                 <div className="px-8 pb-10">
                   <div className="mb-8 p-6 bg-[rgba(0,212,168,0.05)] border-l-4 border-[#00D4A8]">
                     <p className="text-xs sm:text-sm font-black text-[#00D4A8] uppercase tracking-[0.14em] mb-4">Recommended Pathway</p>
                     <p className="text-sm text-[#FAFAFA] leading-relaxed tracking-wide font-medium">{reportData.triageRecommendation}</p>
                   </div>
                   
                   {reportData.recommendations && (
                     <div className="space-y-4">
                       {reportData.recommendations.map((rec, i) => (
                         <div key={i} className="flex gap-4 items-start group">
                           <div className="w-1 h-5 bg-[rgba(255,255,255,0.1)] group-hover:bg-[#00D4A8] transition-colors" />
                           <p className="text-xs uppercase tracking-wide text-[#888] group-hover:text-[#FAFAFA] transition-colors leading-relaxed">
                             {rec}
                           </p>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               )}
            </div>

            <hr className="border-[rgba(255,255,255,0.06)] mb-8" />
            <DisclaimerBanner />

            {/* Final Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pb-20 print:hidden">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center justify-center gap-3 py-5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-[#FAFAFA] text-sm font-bold uppercase tracking-[0.14em] hover:bg-[rgba(255,255,255,0.05)] transition-all"
              >
                {isDownloading ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
                {isDownloading ? 'Processing...' : 'Export PDF'}
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-3 py-5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-[#FAFAFA] text-sm font-bold uppercase tracking-[0.14em] hover:bg-[rgba(255,255,255,0.05)] transition-all"
              >
                <Printer size={14} /> Print Report
              </button>

              <button
                onClick={handleCopySummary}
                className="flex items-center justify-center gap-3 py-5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-[#FAFAFA] text-sm font-bold uppercase tracking-[0.14em] hover:bg-[rgba(255,255,255,0.05)] transition-all"
              >
                <Copy size={14} /> Copy Summary
              </button>

              <button
                onClick={handleNewAnalysis}
                className="flex items-center justify-center gap-3 py-5 bg-[#00D4A8] text-[#050505] text-sm font-bold uppercase tracking-[0.14em] hover:shadow-[0_0_30px_rgba(0,212,168,0.3)] transition-all"
              >
                <RefreshCw size={14} /> New Case
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
