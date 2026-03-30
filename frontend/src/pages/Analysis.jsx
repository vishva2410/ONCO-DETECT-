import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/usePatient';
import api from '../lib/api';
import { AlertCircle, RotateCcw, XCircle, Database, Cpu, Activity, Brain, FileText, Zap } from 'lucide-react';
import { usePageTransition } from '../hooks/usePageTransition';
import { AnimatePresence, motion as Motion } from 'framer-motion';

const pipelineSteps = [
  { id: 'input', label: 'Patient Data', icon: Database, color: '#0090FF' },
  { id: 'preprocess', label: 'Preprocessing', icon: Activity, color: '#00D4A8' },
  { id: 'vision', label: 'Vision Model', icon: Cpu, color: '#00D4A8' },
  { id: 'clinical', label: 'Clinical Logic', icon: Brain, color: '#00D4A8' },
  { id: 'llm', label: 'LLM Reasoning', icon: Zap, color: '#00D4A8' },
  { id: 'output', label: 'Final Report', icon: FileText, color: '#00D4A8' },
];

const organLabels = {
  brain: 'Brain MRI',
  lung: 'Lung X-Ray',
  breast: 'Breast Mammogram',
};

export default function Analysis() {
  const navigate = useNavigate();
  const { patientData, scanFile, setReportData, addToast, resetPatient } = usePatient();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [stepsComplete, setStepsComplete] = useState(false);
  const [runId, setRunId] = useState(0);
  const hasRun = useRef(false);
  const isVisible = usePageTransition(10);

  useEffect(() => {
    if (!patientData || !patientData.organType) {
      addToast('No active patient session found. Please initialize a new analysis.', 'warning');
      navigate('/new-analysis');
      return;
    }

    if (hasRun.current) return;
    hasRun.current = true;

    const runSteps = async () => {
      // Step 0 to 4 (Generating triage report)
      for (let i = 0; i <= 4; i++) {
        setCurrentStep(i);
        await new Promise((r) => setTimeout(r, 1200));
      }

      // Call API while sitting at step 4
      try {
        const formData = new FormData();
        formData.append('patient_data', JSON.stringify(patientData));

        if (scanFile) {
          formData.append('scan_file', scanFile);
        } else {
          const dummyBlob = new Blob(['placeholder'], { type: 'image/png' });
          formData.append('scan_file', dummyBlob, 'sample_scan.png');
        }

        const res = await api.post('/api/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000,
        });

        addToast('Llama 3.3 Reasoning Complete', 'success');

        // Step 5 (Auditing)
        setCurrentStep(5);
        await new Promise((r) => setTimeout(r, 1000));

        // Step 6 (Complete)
        setCurrentStep(6);
        setStepsComplete(true);
        const finalReportId = res.data.reportId;
        setReportData(res.data);

        setTimeout(() => navigate(`/report/${finalReportId}`), 1000);
      } catch (err) {
        console.error('Analysis error:', err);
        if (err.code === 'ECONNABORTED') {
          setError('Analysis is taking longer than expected. The server connection timed out.');
        } else {
          setError('Server Error: ' + (err.response?.data?.detail || err.message));
        }
        addToast('Analysis failed. Please check backend.', 'error');
      }
    };

    runSteps();
  }, [addToast, navigate, patientData, runId, scanFile, setReportData]);

  const handleRetry = () => {
    setError(null);
    setCurrentStep(0);
    setStepsComplete(false);
    hasRun.current = false;
    setRunId((prev) => prev + 1);
  };

  const handleStartOver = () => {
    resetPatient();
    navigate('/');
  };

  const handleCancel = () => {
    if (window.confirm("Cancel this analysis? Your patient data will be lost.")) {
      resetPatient();
      navigate('/');
    }
  };

  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const organLabel = organLabels[patientData.organType] || patientData.organType || 'Unknown';

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden transition-all duration-700 bg-[#050505]"
      style={{ 
        opacity: isVisible ? 1 : 0, 
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)' 
      }}
    >
      {/* Background orbs */}
      <div className="orb orb-teal w-[600px] h-[600px] top-[10%] left-[-10%] animate-float1" style={{ filter: 'blur(120px)' }} />
      <div className="orb orb-blue w-[500px] h-[500px] bottom-[10%] right-[-10%] animate-float2" style={{ filter: 'blur(100px)' }} />

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header Info */}
        <Motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[rgba(0,212,168,0.1)] border border-[rgba(0,212,168,0.2)] mb-4">
            <div className="w-1.5 h-1.5 bg-[#00D4A8] animate-pulse rounded-full" />
            <span className="text-xs sm:text-sm font-bold tracking-[0.14em] text-[#00D4A8] uppercase">Analysis in Progress</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] tracking-[0.08em] mb-4">
            {patientData.name || 'Patient'} · <span className="opacity-50">{organLabel}</span>
          </h1>
          <p className="text-sm sm:text-base text-[#7A8DA8] tracking-[0.08em] uppercase">
            {patientData.age}y · {patientData.gender} · {timestamp}
          </p>
        </Motion.div>

        {/* Pipeline Flowchart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {pipelineSteps.map((step, idx) => {
              const isComplete = idx < currentStep || (stepsComplete && idx === pipelineSteps.length - 1);
              const isActive = idx === currentStep && !stepsComplete;
              const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-start gap-4 group p-5 sm:p-6 border border-[rgba(255,255,255,0.06)] bg-[rgba(13,22,34,0.7)]"
              >
                <Motion.div
                  initial={false}
                  animate={{
                    borderColor: isComplete || isActive ? '#00D4A8' : 'rgba(255,255,255,0.1)',
                    backgroundColor: isComplete ? '#00D4A8' : isActive ? 'rgba(0,212,168,0.1)' : 'rgba(13,22,34,0.7)',
                    scale: isActive ? 1.1 : 1,
                  }}
                  className="w-16 h-16 flex items-center justify-center border-2 transition-colors duration-500 relative"
                >
                  <Icon size={24} className={isComplete ? 'text-[#050505]' : isActive ? 'text-[#00D4A8]' : 'text-[#5a6f8a]'} />
                  
                  {/* Progress Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-2 w-full flex justify-center">
                      <div className="w-1 h-1 bg-[#00D4A8] rounded-full animate-bounce" />
                    </div>
                  )}
                  
                  {/* Status Ring */}
                  {isActive && (
                    <Motion.div 
                      layoutId="activeRing"
                      className="absolute inset-0 border-2 border-[#00D4A8] opacity-50"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </Motion.div>

                <div className="text-left">
                  <p className={`text-sm font-bold uppercase tracking-[0.08em] transition-colors
                    ${isComplete || isActive ? 'text-[#FAFAFA]' : 'text-[#5a6f8a]'}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs sm:text-sm mt-1 transition-colors
                    ${isActive ? 'text-[#00D4A8]' : 'text-[#5a6f8a]'}`}>
                    {isComplete ? 'PROCESSED' : isActive ? 'RUNNING...' : 'PENDING'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action / Error Zone */}
        <div className="mt-24 text-center">
          <AnimatePresence mode="wait">
            {!error ? (
              <Motion.div
                key="status-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto"
              >
                {!stepsComplete ? (
                  <div className="flex flex-col items-center">
                    <p className="text-[#888] text-base italic mb-8 leading-relaxed">
                      "Processing patient clinical history through vision/LLM pipeline"
                    </p>
                    <button 
                      onClick={handleCancel}
                      className="text-xs sm:text-sm font-bold text-[#555] hover:text-[#FF4444] uppercase tracking-[0.14em] transition-colors"
                    >
                      ABORT_ANALYSIS_REQUEST
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center animate-fade-in-up">
                    <div className="px-6 py-2 bg-[rgba(0,212,168,0.1)] border border-[#00D4A8] text-[#00D4A8] text-sm font-bold uppercase tracking-[0.14em]">
                      SUCCESS: REPORT_READY
                    </div>
                  </div>
                )}
              </Motion.div>
            ) : (
              <Motion.div
                key="error-zone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto"
              >
                <div className="p-8 border border-[rgba(255,68,68,0.2)] bg-[rgba(255,68,68,0.05)] text-center">
                  <AlertCircle size={32} className="text-[#FF4444] mx-auto mb-4" />
                  <h3 className="text-sm font-bold text-[#FAFAFA] uppercase tracking-widest mb-2">Analysis Execution Failed</h3>
                  <p className="text-xs text-[#888] mb-8 leading-relaxed max-w-sm mx-auto">{error}</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#FAFAFA] text-[#050505] text-sm font-bold uppercase tracking-[0.14em] hover:bg-white transition-all"
                    >
                      <RotateCcw size={14} /> System Retry
                    </button>
                    <button
                      onClick={handleStartOver}
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-[rgba(255,255,255,0.1)] text-[#FAFAFA] text-sm font-bold uppercase tracking-[0.14em] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                    >
                      <XCircle size={14} /> Abort to Start
                    </button>
                  </div>
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
