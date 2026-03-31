import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background items-center justify-center p-8 text-center">
      <span className="material-symbols-outlined text-primary text-8xl mb-6">error</span>
      <h1 className="text-8xl font-black text-primary mb-6 tracking-tighter" style={{ fontFamily: 'Space Grotesk' }}>404</h1>
      <h2 className="text-2xl font-bold tracking-[0.2em] text-on-surface uppercase mb-4" style={{ fontFamily: 'Space Grotesk' }}>Page Not Found</h2>
      <p className="text-sm tracking-widest text-on-surface-variant uppercase mb-12">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="px-8 py-4 bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary/20 transition-all hover:shadow-[0_0_30px_rgba(0,112,243,0.2)] rounded-lg"
        style={{ fontFamily: 'Space Grotesk' }}
      >
        Return to Home
      </Link>
    </div>
  );
}
