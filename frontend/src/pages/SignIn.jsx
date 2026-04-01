import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getApiErrorMessage } from '../lib/api';

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid username or password.'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[15%] right-[-10%] w-[500px] h-[500px] bg-[#0070f3] rounded-full filter blur-[150px] opacity-[0.04]" />
      <div className="absolute bottom-[15%] left-[-10%] w-[500px] h-[500px] bg-[#4edea3] rounded-full filter blur-[150px] opacity-[0.03]" />

      <div className="w-full max-w-lg relative z-10">
        <div className="glass-panel border border-outline-variant/10 rounded-xl p-10 md:p-14 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">shield</span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight mb-2 text-center" style={{ fontFamily: 'Space Grotesk' }}>
              System Access
            </h2>
            <div className="h-0.5 w-12 bg-primary-container mb-4" />
            <p className="text-xs text-on-surface-variant tracking-wider uppercase text-center leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
              SECURE_GATEWAY_V1.2<br />
              <span className="text-secondary opacity-80">LOCAL_DEV DEFAULT: admin / password123</span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 p-4 border border-error/20 bg-error-container/10 text-xs font-bold text-error tracking-wider uppercase text-center rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" style={{ fontFamily: 'Space Grotesk' }}>
                Credentials.Identity
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="material-symbols-outlined text-[#414754] text-lg group-focus-within:text-primary transition-colors">person</span>
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter Identity..."
                  className="w-full recessed-input py-3.5 pl-12 pr-4 text-on-surface text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" style={{ fontFamily: 'Space Grotesk' }}>
                  Credentials.Token
                </label>
                <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-widest uppercase">
                  Local access
                </span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="material-symbols-outlined text-[#414754] text-lg group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter Token..."
                  className="w-full recessed-input py-3.5 pl-12 pr-4 text-on-surface text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.username || !formData.password}
              className={`w-full flex items-center justify-center gap-3 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 rounded-lg ${
                isSubmitting || !formData.username || !formData.password
                  ? 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
                  : 'bg-gradient-to-br from-primary-container to-primary text-on-primary-container shadow-[0_10px_30px_rgba(0,112,243,0.3)] hover:scale-[1.02] active:scale-95'
              }`}
              style={{ fontFamily: 'Space Grotesk' }}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">login</span>
                  Authenticate
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-[10px] font-bold text-on-surface-variant/40 tracking-[0.3em] uppercase text-center" style={{ fontFamily: 'Space Grotesk' }}>
          OncoDetect / Research Prototype
        </p>
      </div>
    </div>
  );
}
