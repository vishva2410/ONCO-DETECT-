import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
        <h1 className="text-8xl font-black text-[#00D4A8] mb-6 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold tracking-[0.2em] text-[#FAFAFA] uppercase mb-4">Page Not Found</h2>
        <p className="text-sm tracking-widest text-[#888] uppercase mb-12">
          The page you are looking for does not exist.
        </p>
        <Link 
          to="/"
          className="px-8 py-4 bg-[rgba(0,212,168,0.1)] border border-[#00D4A8] text-[#00D4A8] text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[rgba(0,212,168,0.2)] transition-all hover:shadow-[0_0_30px_rgba(0,212,168,0.2)]"
        >
          Return to Home
        </Link>
      </main>
      <DisclaimerBanner />
    </div>
  );
}
