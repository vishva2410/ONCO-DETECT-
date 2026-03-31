import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/new-analysis', label: 'Patient Registry' },
    { to: '/history', label: 'Archive' },
  ];

  return (
    <>
      <header className="shrink-0 w-full z-50 bg-[#131315]/80 backdrop-blur-xl border-b border-[#0070f3]/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex justify-between items-center h-16 px-6 relative">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tighter text-on-surface font-headline">
            OncoDetect
          </Link>
          <nav className="hidden md:flex gap-8 items-center h-full">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-bold tracking-tight text-sm uppercase transition-all duration-300 ${
                    isActive
                      ? 'text-primary border-b-2 border-primary pb-1'
                      : 'text-on-surface-variant/60 hover:text-on-surface'
                  } font-headline`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant/60 hover:bg-surface-container-high rounded-lg transition-colors active:scale-95">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button className="p-2 text-on-surface-variant/60 hover:bg-surface-container-high rounded-lg transition-colors active:scale-95 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full shadow-[0_0_8px_#4edea3]"></span>
          </button>
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-outline-variant/20">
            <div className="text-right">
              <p className="text-xs font-bold leading-none font-headline">Dr. Aris</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] leading-none mt-1.5 font-bold">Oncology Lead</p>
            </div>
            <button
              onClick={logout}
              className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant/10 flex items-center justify-center hover:bg-surface-bright hover:border-primary/30 transition-all group"
              title="Logout"
            >
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">account_circle</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-on-surface-variant/60 hover:bg-surface-container-high rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 z-50 bg-[#1c1b1d] border-b border-outline-variant/10 flex flex-col shadow-[0_40px_80px_rgba(0,0,0,0.6)] animate-fade-in-up">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? 'text-primary bg-primary/10 border-l-4 border-primary'
                    : 'text-on-surface-variant/60 hover:bg-surface-container-high hover:text-on-surface'
                } font-headline`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={() => { logout(); setMobileOpen(false); }}
            className="px-8 py-5 text-sm font-bold uppercase tracking-widest text-error/80 hover:bg-surface-container-high text-left font-headline"
          >
            Terminal Logout
          </button>
        </div>
      )}
    </>
  );
}
