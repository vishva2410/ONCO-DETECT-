import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { usePageTransition } from '../hooks/usePageTransition';

export default function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isVisible = usePageTransition(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <div className="absolute top-[20%] right--[5%] w-[500px] h-[500px] bg-[#00D4A8] rounded-full filter blur-[120px] opacity-[0.02]" />
        <div className="absolute bottom-[20%] left-[-5%] w-[500px] h-[500px] bg-[#0090FF] rounded-full filter blur-[120px] opacity-[0.02]" />
      </div>

      {/* Main Login Card */}
      <div 
        className="w-full max-w-lg transition-all duration-700"
        style={{ 
          opacity: isVisible ? 1 : 0, 
          transform: isVisible ? 'translateY(0)' : 'translateY(24px)' 
        }}
      >
        <div className="glass-card p-12 md:p-16 relative">
          
          <div className="flex flex-col items-center mb-16">
            <div className="w-16 h-16 border border-[rgba(0,212,168,0.2)] flex items-center justify-center mb-8">
               <ShieldCheck size={28} className="text-[#00D4A8]" />
            </div>
            <h2 className="text-xl font-bold text-[#FAFAFA] tracking-[0.3em] uppercase mb-4 text-center">System Access</h2>
            <div className="h-0.5 w-12 bg-[#00D4A8] opacity-30 mb-6" />
            <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase text-center leading-loose">
              SECURE_GATEWAY_V1.2 <br/>
              <span className="text-[#00D4A8] opacity-60">TEST_MODE: ANY_CREDENTIALS_VALID</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[9px] font-black text-[#444] uppercase tracking-[0.3em]">Credentials.Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
                  <User size={14} className="text-[#333] group-focus-within:text-[#00D4A8] transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="ID_CLINICIAN_00X"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-14 pr-6 py-5 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] text-xs text-[#FAFAFA] placeholder-[#222] transition-all focus:border-[#00D4A8] outline-none rounded-none tracking-[0.15em] focus:bg-[rgba(0,212,168,0.02)]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-black text-[#444] uppercase tracking-[0.3em]">Credentials.Token</label>
                <button type="button" className="text-[8px] font-black text-[#0090FF] hover:underline tracking-widest uppercase">Request_Reset</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
                  <Lock size={14} className="text-[#333] group-focus-within:text-[#00D4A8] transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-14 pr-6 py-5 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] text-xs text-[#FAFAFA] placeholder-[#222] transition-all focus:border-[#00D4A8] outline-none rounded-none tracking-[0.15em] focus:bg-[rgba(0,212,168,0.02)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.username || !formData.password}
              className={`w-full flex items-center justify-center gap-6 py-6 text-[10px] font-black tracking-[0.4em] uppercase transition-all duration-700 rounded-none border-[1px]
                ${(isSubmitting || !formData.username || !formData.password)
                  ? 'bg-[rgba(255,255,255,0.01)] text-[#333] border-[rgba(255,255,255,0.05)] cursor-not-allowed'
                  : 'bg-[rgba(0,212,168,0.02)] text-[#00D4A8] border-[rgba(0,212,168,0.3)] hover:bg-[#00D4A8] hover:text-[#050505] hover:shadow-[0_0_40px_rgba(0,212,168,0.2)]'
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-4">
                   <div className="w-3 h-3 border-2 border-[#00D4A8] border-t-transparent animate-spin" />
                   INITIALIZING_SESSION...
                </span>
              ) : (
                <>
                  Connect System
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 text-[9px] font-black text-[#333] tracking-[0.5em] uppercase text-center">
        OncoDetect / Advanced Triage v1.2
      </div>
    </div>
  );
}
