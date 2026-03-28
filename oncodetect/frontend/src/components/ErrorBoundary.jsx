import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("OncoDetect render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-[#050505]">
          <h1 className="text-3xl font-bold tracking-[0.2em] text-[#FF4444] mb-4 uppercase">
            Something went wrong
          </h1>
          <p className="text-sm text-[#888] tracking-widest uppercase mb-8">
            An unexpected error occurred in OncoDetect.
          </p>
          
          <div className="w-full max-w-2xl p-6 bg-[rgba(255,68,68,0.05)] border border-[rgba(255,68,68,0.2)] font-mono text-sm text-[#FF4444] mb-8 overflow-auto">
            {this.state.error?.message || "Unknown error"}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border border-[#00D4A8] text-[#00D4A8] text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-[rgba(0,212,168,0.1)] transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="px-6 py-3 bg-[rgba(255,255,255,0.05)] text-white text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-[rgba(255,255,255,0.1)] transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
