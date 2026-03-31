import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';

export default function Entrance() {
  const navigate = useNavigate();
  const [initStage, setInitStage] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const sequence = [
      { time: 500, log: 'INITIALIZING_NEURAL_CORES...' },
      { time: 1200, log: 'LOADING_VIT_VISION_MODULE...' },
      { time: 1800, log: 'ESTABLISHING_GROQ_LLM_LINK...' },
      { time: 2400, stage: 1 },
      { time: 3000, log: 'SYSTEM_READY: ONCODETECT_V1.2' },
      { time: 3500, stage: 2 },
    ];
    const timers = sequence.map((item) =>
      setTimeout(() => {
        if (item.log) setLogs(prev => [...prev.slice(-3), item.log]);
        if (item.stage !== undefined) setInitStage(item.stage);
      }, item.time)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-[#0070f3] rounded-full filter blur-[120px] opacity-[0.04] animate-float" />
        <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-[#4edea3] rounded-full filter blur-[120px] opacity-[0.03] animate-float" />
        <div className="data-grid-overlay absolute inset-0 opacity-20 pointer-events-none" />
      </div>

      <div className="z-10 flex flex-col items-center justify-center text-center px-5 sm:px-6 max-w-5xl mx-auto w-full">
        {/* Logo Core */}
        <Motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 relative"
        >
          <div className="w-24 h-24 rounded-xl border border-[rgba(0,112,243,0.3)] relative flex items-center justify-center group">
            <span className="material-symbols-outlined text-primary text-5xl relative z-20">shield</span>
            <Motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-dashed border-[rgba(0,112,243,0.2)] rounded-xl"
            />
            <div className="absolute inset-0 bg-primary/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 rounded-xl" />
          </div>
        </Motion.div>

        {/* Brand Header */}
        <AnimatePresence>
          {initStage >= 1 && (
            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-16"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[0.18em] md:tracking-[0.28em] text-on-surface uppercase mb-6 leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
                ONCO<span className="text-primary">DETECT</span>
              </h1>
              <p className="text-on-surface-variant text-xs sm:text-sm tracking-[0.2em] md:tracking-[0.35em] uppercase font-bold max-w-2xl mx-auto leading-loose" style={{ fontFamily: 'Space Grotesk' }}>
                ADVANCED MULTI-ORGAN TRIAGE <br className="hidden md:block"/>
                <span className="text-outline-variant mt-4 block">CLINICAL REASONING AGENT 001</span>
              </p>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <AnimatePresence>
          {initStage >= 2 && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <button
                onClick={() => navigate('/sign-in')}
                className="group relative flex items-center justify-center gap-4 sm:gap-6 px-8 sm:px-12 md:px-16 py-5 sm:py-6 border border-primary/30 text-primary text-sm font-bold tracking-[0.16em] sm:tracking-[0.24em] uppercase transition-all duration-700 hover:bg-primary-container hover:text-on-primary-container hover:shadow-[0_0_50px_rgba(0,112,243,0.4)] overflow-hidden rounded-lg"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                <span className="relative z-10 flex items-center gap-4">
                  Initialize Terminal
                  <span className="material-symbols-outlined text-lg transition-transform duration-500 group-hover:translate-x-3">arrow_forward</span>
                </span>
                <div className="absolute inset-0 w-0 bg-primary-container group-hover:w-full transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]" />
              </button>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Init Logs */}
      <div className="absolute bottom-10 right-10 text-left font-mono text-[11px] tracking-[0.14em] text-outline-variant hidden md:block uppercase space-y-2">
        {logs.map((log, i) => (
          <Motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-primary opacity-50">{">>"}</span> {log}
          </Motion.div>
        ))}
      </div>

      {/* Terminal Decor */}
      <div className="absolute bottom-10 left-10 text-left font-mono text-[11px] tracking-[0.14em] text-outline-variant hidden md:block uppercase" style={{ fontFamily: 'Space Grotesk' }}>
        <p>AUTH_STATE: UNAUTHORIZED</p>
        <p>NETWORK_STATUS: ENCRYPTED</p>
      </div>

      {/* Corner Brackets */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-outline-variant/10 rounded-tl-lg" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-outline-variant/10 rounded-tr-lg" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-outline-variant/10 rounded-bl-lg" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-outline-variant/10 rounded-br-lg" />
    </div>
  );
}
