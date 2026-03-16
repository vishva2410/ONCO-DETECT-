import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const AnimatedLogo = () => (
  <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg flex-shrink-0">
    <rect x="10" y="10" width="35" height="35" fill="none" stroke="#00D4A8" strokeWidth="4" className="logo-rect-1" />
    <rect x="55" y="10" width="35" height="35" fill="none" stroke="#0090FF" strokeWidth="4" className="logo-rect-2" />
    <rect x="10" y="55" width="35" height="35" fill="none" stroke="#FF4444" strokeWidth="4" className="logo-rect-3" />
    <rect x="55" y="55" width="35" height="35" fill="none" stroke="#E8EDF5" strokeWidth="4" className="logo-rect-4" />
    <path d="M 45 45 L 55 55 M 55 45 L 45 55" stroke="#FFFFFF" strokeWidth="3" className="logo-cross" />
  </svg>
);

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: 'ENTRANCE' },
    { to: '/dashboard', label: 'DASHBOARD' },
    { to: '/new-analysis', label: 'NEW ANALYSIS' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.05)] bg-[#0A0F1E] bg-opacity-95 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-4 group cursor-pointer overflow-hidden">
          <AnimatedLogo />
          <div className="flex flex-col mt-1">
            <span className="text-xl font-bold tracking-[0.2em] text-[#E8EDF5] uppercase leading-none">
              ONCO<span className="text-[#00D4A8]">DETECT</span>
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#555] uppercase mt-1">
              v1.0 Research
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-end h-full">
          <div className="flex items-center gap-10 h-full mr-8">
            {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center justify-center h-full px-2 text-[11px] font-bold tracking-[0.25em] transition-colors duration-300 uppercase
                  ${isActive ? 'text-[#00D4A8]' : 'text-[#7A8DA8] hover:text-[#E8EDF5]'}
                `}
              >
                {link.label}
                {/* Active Indicator Line */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#00D4A8] shadow-[0_0_12px_#00D4A8]" />
                )}
              </Link>
            );
          })}
          </div>
          
          {/* Live Indicator */}
          <div className="flex items-center gap-2 pl-8 border-l border-[rgba(255,255,255,0.05)] h-1/2">
            <div className="relative flex items-center justify-center w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#00D4A8] opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00D4A8]"></span>
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#00D4A8] uppercase">LIVE</span>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-[#7A8DA8] hover:text-[#E8EDF5] p-2 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A0F1E] border-t border-[rgba(255,255,255,0.05)] flex flex-col">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center w-full px-8 py-5 text-sm font-bold tracking-[0.2em] uppercase border-b border-[rgba(255,255,255,0.02)] transition-colors duration-200
                  ${isActive ? 'bg-[rgba(0,212,168,0.05)] text-[#00D4A8] border-l-4 border-l-[#00D4A8]' : 'text-[#7A8DA8] hover:bg-[rgba(255,255,255,0.02)] hover:text-[#E8EDF5] border-l-4 border-l-transparent'}
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
