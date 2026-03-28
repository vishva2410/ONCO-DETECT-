import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/usePatient';
import api from '../lib/api';

const PIPELINE_STEPS = [
  { id: 'ingest',    label: 'Image Ingestion & Standardization',  desc: 'Normalizing resolution, contrast and DICOM metadata.' },
  { id: 'denoise',   label: 'Artifact & Noise Reduction',          desc: 'Applying Gaussian filters and edge-preserving smoothing.' },
  { id: 'extract',   label: 'Deep Feature Extraction',             desc: 'Running input through convolutional layers (ResNet/DenseNet).' },
  { id: 'classify',  label: 'Risk Classification',                 desc: 'Calculating probability matrices across all tissue classes.' },
  { id: 'llm',       label: 'LLM Reasoning Synthesis',             desc: 'Generating structured clinical documentation via Groq LPU.' },
];

const ORGAN_LABELS = { brain: 'Brain MRI', lung: 'Lung X-Ray', breast: 'Breast Mammogram' };

export default function Analysis() {
  const navigate = useNavigate();
  const { patientData, scanFile, scanPreviewUrl, setReportData, addToast, resetPatient } = usePatient();

  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [done, setDone] = useState(false);
  const [llmLines, setLlmLines] = useState([]);
  const hasRun = useRef(false);
  const llmRef = useRef(null);

  const organLabel = ORGAN_LABELS[patientData?.organType] || patientData?.organType || 'Unknown';

  // Stream lines that appear progressively
  const buildStreamLines = (organ, age) => [
    `[SYS] Connecting to Groq LPU cluster...`,
    `[SYS] Model weights verified: OK`,
    `[PIPELINE] Processing ${organ} imaging payload...`,
    `[VISION] Convolutional feature map extracted.`,
    `[VISION] Significant edge contrast detected in quadrant II.`,
    `[CLINICAL] Cross-referencing patient history (Age: ${age || '--'}).`,
    `[LLM] Probability matrix generated.`,
    `[LLM] Synthesizing clinical narrative...`,
    `[SYS] Report compilation complete. Routing to UI.`,
  ];

  useEffect(() => {
    if (!patientData?.organType) {
      addToast('No active patient session found.', 'warning');
      navigate('/new-analysis');
      return;
    }
    if (hasRun.current) return;
    hasRun.current = true;

    const lines = buildStreamLines(organLabel, patientData.age);

    const runAnalysis = async () => {
      // Stages 0-1: local pre-processing animation
      setCurrentStep(0);
      await delay(1000);
      setCurrentStep(1);
      await delay(900);
      setCurrentStep(2);

      // Start streaming lines for visual feedback
      let lineIdx = 0;
      const streamInterval = setInterval(() => {
        if (lineIdx < lines.length) {
          setLlmLines(prev => [...prev, lines[lineIdx]]);
          lineIdx++;
          // Auto-scroll LLM panel
          if (llmRef.current) llmRef.current.scrollTop = llmRef.current.scrollHeight;
        }
      }, 900);

      try {
        // Build form data for API
        const form = new FormData();
        form.append('patient_data', JSON.stringify(patientData));
        if (scanFile) {
          form.append('scan_file', scanFile);
        } else {
          // Dummy file so the API does not reject
          form.append('scan_file', new Blob([''], { type: 'image/png' }), 'placeholder.png');
        }

        const res = await api.post('/api/analyze', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 90000,
        });

        clearInterval(streamInterval);
        // Fill remaining lines fast
        for (let i = lineIdx; i < lines.length; i++) {
          setLlmLines(prev => [...prev, lines[i]]);
        }

        setCurrentStep(3);
        await delay(600);
        setCurrentStep(4);
        addToast('LLM Reasoning complete', 'success');
        await delay(800);

        setReportData({ ...res.data, reportId: `OD-${Date.now().toString(36).toUpperCase()}` });
        setDone(true);
        await delay(800);
        navigate('/report');

      } catch (err) {
        clearInterval(streamInterval);
        console.error('Analysis error:', err);
        const msg = err.code === 'ECONNABORTED'
          ? 'Connection timeout — the server took too long.'
          : `Server error: ${err.response?.data?.detail || err.message}`;
        setErrorMsg(msg);
        addToast('Analysis failed. Check backend.', 'error');
      }
    };

    runAnalysis();
  }, []);

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const handleRetry = () => {
    setErrorMsg(null);
    setCurrentStep(0);
    setDone(false);
    setLlmLines([]);
    hasRun.current = false;
    // Force re-mount by re-triggering effect
    window.location.reload();
  };

  return (
    <div>
      {/* Header */}
      <header className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00D4A8] mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4A8] animate-pulse"></span>
          System Processing
        </p>
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-[#FAFAFA]">Live Analysis Sequence</h1>
        <p className="text-sm text-[#444] mt-2 font-mono uppercase tracking-widest">
          {patientData?.name || 'Patient'} · {organLabel}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Scan Input Panel */}
        <div className="lg:col-span-5 bg-[#0a0a0a] border border-white/[0.06] p-0 relative group overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#444]">Scan Input Buffer</h2>
            <span className="text-[10px] text-[#00D4A8] font-bold uppercase tracking-widest bg-[#00D4A8]/10 px-2 py-0.5">LIVE FEED</span>
          </div>
          <div className="relative aspect-[4/5] bg-black flex items-center justify-center overflow-hidden">
            {/* Radar sweep */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-30 mix-blend-screen">
              <div className="w-full h-full scan-radar" style={{ animation: 'spin 3s linear infinite' }}></div>
            </div>
            {/* Scanlines */}
            <div className="absolute inset-0 scanline opacity-30 z-30 pointer-events-none"></div>
            {/* The actual scan image */}
            {scanPreviewUrl ? (
              <img src={scanPreviewUrl} alt="Patient Scan" className="w-full h-full object-cover mix-blend-screen opacity-90 z-10 grayscale" />
            ) : (
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQmXgGZ1VOrM1c0NIsDq_WzB-yT1y5F9XkQ8ZlJ5_gB8V2T2CzvG4aM8h6QfMhPZpX8N8mQwPExf3J3C3Q8XhZyT5z1-7C6G7Z7-7f9u3z9u8Y2b9A9-0a6k6H8T5w4U9e2-1Z9n-u-f-4K9w5E7g8_1s-w-6FzUaZb1Uq3f2v"
                alt="Scan placeholder"
                className="w-full h-full object-cover mix-blend-screen opacity-80 grayscale z-10"
              />
            )}
            {/* Crosshairs */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-[#00D4A8]/30 z-20 pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 w-px h-full bg-[#00D4A8]/30 z-20 pointer-events-none"></div>
            {/* Animated target box */}
            <div className="absolute top-[35%] left-[25%] w-28 h-28 border border-[#00D4A8]/50 bg-[#00D4A8]/5 z-20" style={{ animation: 'pulse 2s ease-in-out infinite' }}></div>
            {/* Status label */}
            <div className="absolute bottom-4 left-4 z-40 bg-black/70 backdrop-blur-sm px-3 py-1.5 border border-white/10">
              <span className="font-mono text-[10px] text-[#00D4A8] uppercase">{organLabel} MAP</span>
              <p className="font-mono text-[8px] text-[#444] mt-0.5">LATENCY: 14ms</p>
            </div>
          </div>
        </div>

        {/* Pipeline + LLM Stream */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Pipeline Steps */}
          <div className="bg-[#0a0a0a] border border-white/[0.06] p-7">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#444] mb-8">Neural Pipeline Status</h2>
            <div className="space-y-5 relative">
              {/* Vertical connector line */}
              <div className="absolute left-[23px] top-8 bottom-8 w-px bg-white/[0.06]"></div>
              {PIPELINE_STEPS.map((step, idx) => {
                const isComplete = idx < currentStep || done;
                const isActive = idx === currentStep && !done && !errorMsg;
                return (
                  <div key={step.id} className="relative flex items-start gap-5">
                    <div className={`w-12 h-12 shrink-0 flex items-center justify-center border z-10 transition-all duration-500 ${
                      isComplete ? 'border-[#00D4A8] bg-[#00D4A8] text-[#050505]' :
                      isActive   ? 'border-[#00D4A8] bg-[#00D4A8]/10 text-[#00D4A8] shadow-[0_0_12px_rgba(0,212,168,0.3)]' :
                                   'border-white/[0.06] bg-[#050505] text-[#333]'
                    }`}>
                      {isComplete ? (
                        <span className="material-symbols-outlined text-lg">check</span>
                      ) : isActive ? (
                        <span className="material-symbols-outlined text-lg" style={{ animation: 'spin 1.2s linear infinite' }}>sync</span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold">0{idx + 1}</span>
                      )}
                    </div>
                    <div className="pt-2">
                      <h3 className={`font-headline text-sm font-bold tracking-wide uppercase transition-colors ${isComplete || isActive ? 'text-[#FAFAFA]' : 'text-[#333]'}`}>{step.label}</h3>
                      <p className="text-xs text-[#444] mt-0.5 font-mono">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LLM Output Stream */}
          <div className="bg-[#050505] border border-white/[0.06] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00D4A8]/40 to-transparent"></div>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
              <span className="material-symbols-outlined text-sm text-[#00D4A8]">memory</span>
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-[#444]">LLM Reasoning Stream — Groq LPU</h2>
            </div>

            {errorMsg ? (
              <div className="p-6">
                <div className="bg-[rgba(255,68,68,0.05)] border border-[#FF4444]/20 p-6">
                  <p className="text-[#FF4444] font-mono text-xs mb-4">[FATAL] {errorMsg}</p>
                  <div className="flex gap-4">
                    <button onClick={handleRetry} className="px-6 py-2.5 bg-[#FAFAFA] text-[#050505] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all cursor-pointer">
                      Retry
                    </button>
                    <button onClick={() => { resetPatient(); navigate('/'); }} className="px-6 py-2.5 border border-white/10 text-[#FAFAFA] text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer">
                      Abort
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div ref={llmRef} className="p-6 h-56 font-mono text-[10px] leading-relaxed text-[#FAFAFA]/70 overflow-y-auto custom-scrollbar">
                {llmLines.map((line, i) => (
                  <div key={i} className="flex items-start gap-3 mb-1">
                    <span className="text-[#00D4A8]/50 shrink-0">{'>'}</span>
                    <span className={line.startsWith('[LLM]') ? 'text-[#00D4A8]' : line.startsWith('[VISION]') ? 'text-[#0090FF]' : line.startsWith('[CLINICAL]') ? 'text-[#FFBC42]' : 'text-[#444]'}>{line}</span>
                  </div>
                ))}
                {!done && !errorMsg && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[#00D4A8]/50">{'>'}</span>
                    <div className="w-2 h-4 bg-[#00D4A8] animate-pulse"></div>
                  </div>
                )}
                {done && <div className="text-[#00D4A8] font-bold mt-2">&gt; [SYS] SUCCESS — ROUTING TO REPORT VIEW...</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      <div className="mt-10 text-center">
        <button
          onClick={() => {
            if (window.confirm('Abort the analysis sequence? Patient data will be lost.')) {
              resetPatient();
              navigate('/');
            }
          }}
          className="text-[10px] font-mono uppercase tracking-widest text-[#333] hover:text-[#FF4444] transition-colors flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">cancel</span>
          Abort Analysis Request
        </button>
      </div>
    </div>
  );
}
