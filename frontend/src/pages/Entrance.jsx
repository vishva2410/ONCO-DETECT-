import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Activity, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Entrance() {
  const navigate = useNavigate();
  const [initStage, setInitStage] = useState(0); // 0: Logo, 1: Text, 2: Button
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Initialization Sequence
    const sequence = [
      { time: 500, log: 'INITIALIZING_NEURAL_CORES...' },
      { time: 1200, log: 'LOADING_VIT_VISION_MODULE...' },
      { time: 1800, log: 'ESTABLISHING_GROQ_LLM_LINK...' },
      { time: 2400, stage: 1 },
      { time: 3000, log: 'SYSTEM_READY: ONCODETECT_V1.2' },
      { time: 3500, stage: 2 },
    ];

    sequence.forEach((item) => {
      setTimeout(() => {
        if (item.log) setLogs(prev => [...prev.slice(-3), item.log]);
        if (item.stage !== undefined) setInitStage(item.stage);
      }, item.time);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-[#00D4A8] rounded-full filter blur-[120px] opacity-[0.03] animate-float1" />
        <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-[#0090FF] rounded-full filter blur-[120px] opacity-[0.03] animate-float2" />
        
        {/* Scanning grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} 
        />
      </div>

      <div className="z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto w-full">
        
        {/* Stage 0/1: Logo Core */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 relative"
        >
          <div className="w-24 h-24 border border-[rgba(0,212,168,0.3)] relative flex items-center justify-center group">
             <Shield size={40} className="text-[#00D4A8] relative z-20" />
             {/* Animated corners */}
             <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-dashed border-[rgba(0,212,168,0.2)]" 
             />
             <div className="absolute inset-0 bg-[#00D4A8]/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          </div>
        </motion.div>

        {/* Stage 1: Brand Header */}
        <AnimatePresence>
          {initStage >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-16"
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-[0.3em] text-[#FAFAFA] uppercase mb-6 leading-tight">
                ONCO<span className="text-[#00D4A8]">DETECT</span>
              </h1>
              <p className="text-[#7A8DA8] text-[10px] md:text-xs tracking-[0.4em] uppercase font-bold max-w-2xl mx-auto leading-loose">
                ADVANCED MULTI-ORGAN TRIAGE <br className="hidden md:block"/>
                <span className="text-[#444] mt-4 block">CLINICAL REASONING AGENT 001</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 2: Action Button */}
        <AnimatePresence>
          {initStage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <button
                onClick={() => navigate('/sign-in')}
                className="group relative flex items-center justify-center gap-8 px-16 py-6 border border-[rgba(0,212,168,0.3)] text-[#00D4A8] text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-700 hover:bg-[#00D4A8] hover:text-[#050505] hover:shadow-[0_0_50px_rgba(0,212,168,0.4)] overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-4">
                  Initialize Terminal
                  <ArrowRight size={16} className="transition-transform duration-500 group-hover:translate-x-3" />
                </span>
                
                {/* Button slide effect */}
                <div className="absolute inset-0 w-0 bg-[#00D4A8] group-hover:w-full transition-all duration-700 ease-[cubic-bezier(0.19, 1, 0.22, 1)]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Initialize Logs (Bottom Right) */}
      <div className="absolute bottom-10 right-10 text-left font-mono text-[9px] tracking-[0.2em] text-[#444] hidden md:block uppercase space-y-2">
        {logs.map((log, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-[#00D4A8] opacity-50">{">>"}</span> {log}
          </motion.div>
        ))}
      </div>

      {/* Terminal Decor (Bottom Left) */}
      <div className="absolute bottom-10 left-10 text-left font-mono text-[9px] tracking-[0.2em] text-[#444] hidden md:block uppercase">
        <p>AUTH_STATE: UNAUTHORIZED</p>
        <p>NETWORK_STATUS: ENCRYPTED</p>
      </div>

      {/* Corner Brackets */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[rgba(255,255,255,0.05)]" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[rgba(255,255,255,0.05)]" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-[rgba(255,255,255,0.05)]" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-[rgba(255,255,255,0.05)]" />
    </div>
  );
}
