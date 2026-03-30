import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { usePageTransition } from '../hooks/usePageTransition';

import { useAuth } from '../context/useAuth';

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isVisible = usePageTransition(10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch {
      setError('Invalid identity or token sequence. Access denied.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-5 py-10 md:p-8 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-[#00D4A8] rounded-full filter blur-[120px] opacity-[0.02]" />
        <div className="absolute bottom-[20%] left-[-5%] w-[500px] h-[500px] bg-[#0090FF] rounded-full filter blur-[120px] opacity-[0.02]" />
      </div>

      {/* Main Login Card */}
      <div 
        className="w-full max-w-xl transition-all duration-700"
        style={{ 
          opacity: isVisible ? 1 : 0, 
          transform: isVisible ? 'translateY(0)' : 'translateY(24px)' 
        }}
      >
        <div className="glass-card p-8 sm:p-10 md:p-14 relative">
          
          <div className="flex flex-col items-center mb-16">
            <div className="w-16 h-16 border border-[rgba(0,212,168,0.2)] flex items-center justify-center mb-8">
               <ShieldCheck size={28} className="text-[#00D4A8]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] tracking-[0.18em] uppercase mb-4 text-center">System Access</h2>
            <div className="h-0.5 w-12 bg-[#00D4A8] opacity-30 mb-6" />
            <p className="text-xs sm:text-sm text-[#555] tracking-[0.16em] uppercase text-center leading-loose">
              SECURE_GATEWAY_V1.2 <br/>
              <span className="text-[#00D4A8] opacity-60">TEST_MODE: USE ID: admin / PASS: password123</span>
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 border border-[rgba(255,68,68,0.2)] bg-[rgba(255,68,68,0.05)] text-xs font-bold text-[#FF4444] tracking-[0.18em] uppercase text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-xs font-black text-[#444] uppercase tracking-[0.2em]">Credentials.Identity</label>
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
                <label className="text-xs font-black text-[#444] uppercase tracking-[0.2em]">Credentials.Token</label>
                <button type="button" className="text-xs font-black text-[#0090FF] hover:underline tracking-[0.16em] uppercase">Request_Reset</button>
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
              className={`w-full flex items-center justify-center gap-4 sm:gap-6 py-5 sm:py-6 text-sm font-black tracking-[0.22em] uppercase transition-all duration-700 rounded-none border-[1px]
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
      <div className="absolute bottom-6 sm:bottom-10 text-xs font-black text-[#333] tracking-[0.3em] uppercase text-center">
        OncoDetect / Advanced Triage v1.2
      </div>
    </div>
  );
}
