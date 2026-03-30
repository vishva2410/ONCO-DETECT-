import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Circle, Terminal, Zap } from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import CaseLibrary from '../components/CaseLibrary';
import Navbar from '../components/Navbar';
import { usePageTransition } from '../hooks/usePageTransition';

/* ─── Node Graph Data ──────────────────────────────────────── */
const nodes = [
  { id: 'input', label: 'Input Layer', x: 60, y: 150, type: 'input' },
  { id: 'brain', label: 'Brain MRI', x: 220, y: 60, type: 'organ' },
  { id: 'lung', label: 'Lung X-Ray', x: 220, y: 150, type: 'organ' },
  { id: 'breast', label: 'Mammogram', x: 220, y: 240, type: 'organ' },
  { id: 'fusion', label: 'Feature Fusion', x: 400, y: 150, type: 'process' },
  { id: 'llm', label: 'LLM Reasoning', x: 560, y: 120, type: 'llm' },
  { id: 'audit', label: 'Self-Audit', x: 560, y: 200, type: 'audit' },
  { id: 'output', label: 'Triage Output', x: 720, y: 150, type: 'output' },
];

const edges = [
  ['input', 'brain'], ['input', 'lung'], ['input', 'breast'],
  ['brain', 'fusion'], ['lung', 'fusion'], ['breast', 'fusion'],
  ['fusion', 'llm'], ['fusion', 'audit'],
  ['llm', 'output'], ['audit', 'output'],
];

/* ─── System logs ──────────────────────────────────────────── */
const systemLogs = [
  { time: '10:44:02', msg: 'System initialized — 3 organ modules loaded', type: 'info' },
  { time: '10:44:03', msg: 'Brain MRI model: ResNet-50 weights verified', type: 'ok' },
  { time: '10:44:03', msg: 'Lung X-Ray model: DenseNet-121 weights verified', type: 'ok' },
  { time: '10:44:04', msg: 'Breast Mammo model: EfficientNet-B4 weights verified', type: 'ok' },
  { time: '10:44:05', msg: 'LLM reasoning engine: standby', type: 'info' },
  { time: '10:44:06', msg: 'Self-audit module: active', type: 'ok' },
  { time: '10:44:07', msg: 'Awaiting scan input...', type: 'wait' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [caseLibOpen, setCaseLibOpen] = useState(false);
  const [confidenceAnim, setConfidenceAnim] = useState(0);
  const isVisible = usePageTransition(10);

  // Animate confidence score
  useEffect(() => {
    const target = 94.2;
    let current = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      setConfidenceAnim(current);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Get node position helper
  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <Navbar />

      <main className="flex-1 px-8 md:px-12 pt-32 pb-16 max-w-[1400px] mx-auto w-full transition-all duration-700"
        style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(24px)' }}
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-1.5 bg-[#00D4A8] animate-pulse" />
              <span className="text-xs sm:text-sm font-bold tracking-[0.18em] text-[#00D4A8] uppercase">Neural Network Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-[0.12em] text-[#FAFAFA] uppercase">System Overview</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
             <Terminal size={12} className="text-[#555]" />
             <span className="text-xs sm:text-sm font-mono text-[#7A8DA8] tracking-[0.12em] uppercase">Kernel_State: Stable</span>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Pipeline Status", value: "Standby", sub: "3 Modules Ready", color: "#00D4A8" },
            { label: "Daily Throughput", value: "137 Scans", sub: "+12% vs week", color: "#0090FF" },
            { label: "Reasoning Depth", value: "llama-3.3", sub: "Groq LPU Array", color: "#A855F7" },
            { label: "Confidence Floor", value: "94.2%", sub: "Audit Threshold", color: "#FFBC42" }
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6 border-t font-semibold" style={{ borderTop: `2px solid ${stat.color}44` }}>
              <p className="text-xs text-[#7A8DA8] tracking-[0.14em] uppercase mb-4">{stat.label}</p>
              <p className="text-2xl font-bold text-[#FAFAFA] mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-[#444] tracking-[0.08em] uppercase">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Sections Grid */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Architecture Visualizer (Left) */}
          <div className="col-span-12 lg:col-span-8 glass-card p-10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-sm font-bold tracking-[0.14em] text-[#FAFAFA] uppercase">System Architecture</h2>
              <div className="flex items-center gap-4">
                <Circle size={8} className="fill-emerald-400 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-[#555] tracking-[0.14em] uppercase">Flow_Active</span>
              </div>
            </div>

            {/* SVG Graph */}
            <div className="w-full overflow-x-auto">
               <svg viewBox="0 0 800 300" className="w-full min-w-[760px] h-auto opacity-80" strokeLinecap="square">
                 <defs>
                   <linearGradient id="edgeStep" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="100%" stopColor="#00D4A8" />
                   </linearGradient>
                 </defs>
                 
                 {/* Edges with data flow */}
                 {edges.map(([from, to], i) => {
                   const a = getNode(from);
                   const b = getNode(to);
                   return (
                     <g key={`edge-${i}`}>
                       <line 
                         x1={a.x + 50} y1={a.y + 18} x2={b.x - 5} y2={b.y + 18}
                         stroke="rgba(255,255,255,0.04)" strokeWidth="1"
                       />
                       <circle r="1.5" fill="#00D4A8">
                         <animateMotion 
                           dur={`${1.5 + (i%2)}s`} repeatCount="indefinite"
                           path={`M${a.x + 50},${a.y + 18} L${b.x - 5},${b.y + 18}`}
                           begin={`${i * 0.2}s`}
                         />
                       </circle>
                     </g>
                   );
                 })}

                 {/* Nodes */}
                 {nodes.map((node) => {
                   const colors = {
                    input: '#7A8DA8', organ: '#0090FF', process: '#00D4A8',
                    llm: '#A855F7', audit: '#FFBC42', output: '#00D4A8'
                   };
                   const c = colors[node.type];
                   return (
                     <g key={node.id}>
                       <rect 
                        x={node.x} y={node.y} width={100} height={36} 
                        fill="rgba(5,5,5,0.8)" stroke={`${c}44`} strokeWidth="1"
                       />
                       <text x={node.x + 50} y={node.y + 22} textAnchor="middle" fontSize="9" fill={c} fontWeight="bold" className="uppercase tracking-widest font-mono">
                         {node.label}
                       </text>
                     </g>
                   );
                 })}
               </svg>
            </div>
          </div>

          {/* Right Column: Performance and Actions */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            
            {/* Action Card */}
            <div className="glass-card p-10 bg-[rgba(0,212,168,0.02)]">
               <h3 className="text-sm font-bold tracking-[0.14em] text-[#FAFAFA] uppercase mb-8">Quick Actions</h3>
               <button 
                onClick={() => navigate('/new-analysis')}
                className="w-full flex items-center justify-between p-6 bg-[#00D4A8] text-[#050505] text-sm font-bold uppercase tracking-[0.14em] mb-4 hover:shadow-[0_0_30px_rgba(0,212,168,0.3)] transition-all"
               >
                 <span>Start New Analysis</span>
                 <Zap size={16} />
               </button>
               <button 
                onClick={() => setCaseLibOpen(true)}
                className="w-full flex items-center justify-between p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-[#FAFAFA] text-sm font-bold uppercase tracking-[0.14em] hover:bg-[rgba(255,255,255,0.05)] transition-all"
               >
                 <span>Load Sample Case</span>
                 <Activity size={16} />
               </button>
            </div>

            {/* Accuracy Card */}
            <div className="glass-card p-10">
               <h3 className="text-sm font-bold tracking-[0.14em] text-[#FAFAFA] uppercase mb-10 text-center">Engine Performance</h3>
               <div className="flex items-center justify-center relative">
                 <svg width="140" height="140" className="-rotate-90">
                   <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                   <circle 
                    cx="70" cy="70" r="54" fill="none" stroke="#00D4A8" strokeWidth="8"
                    strokeDasharray={339.29} strokeDashoffset={339.29 * (1 - confidenceAnim/100)}
                    style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                   />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold font-mono">{confidenceAnim.toFixed(1)}%</span>
                    <span className="text-xs sm:text-sm text-[#555] uppercase tracking-[0.12em] font-bold">Accuracy</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Bottom Row: Logs */}
          <div className="col-span-12 glass-card p-10">
            <div className="flex items-center gap-3 mb-8">
              <Terminal size={14} className="text-[#00D4A8]" />
              <h3 className="text-sm font-bold tracking-[0.14em] text-[#FAFAFA] uppercase">System Execution Logs</h3>
            </div>
            <div className="font-mono text-xs sm:text-sm space-y-4 tracking-[0.08em] max-h-60 overflow-y-auto custom-scrollbar pr-4">
               {systemLogs.map((log, i) => (
                 <div key={i} className="flex gap-10 border-b border-[rgba(255,255,255,0.02)] pb-3">
                   <span className="text-[#333] shrink-0 uppercase">{log.time}</span>
                   <span className={log.type === 'ok' ? 'text-[#00D4A8]' : 'text-[#7A8DA8]'}>
                     [{log.type.toUpperCase()}] {log.msg}
                   </span>
                 </div>
               ))}
               <div className="flex gap-10 items-center">
                  <span className="text-[#333] shrink-0 uppercase">10:44:08</span>
                  <div className="w-2 h-4 bg-[#00D4A8] animate-pulse" />
               </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
           <DisclaimerBanner />
        </div>
      </main>

      <CaseLibrary isOpen={caseLibOpen} onClose={() => setCaseLibOpen(false)} />
    </div>
  );
}
