import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Search, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { usePageTransition } from '../hooks/usePageTransition';
import api from '../lib/api';

export default function History() {
  const navigate = useNavigate();
  const isVisible = usePageTransition();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/api/reports');
        setReports(response.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getTriageColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return 'text-[#FF4444] bg-[rgba(255,68,68,0.1)] border-[#FF4444]';
      case 'moderate': return 'text-[#FFBC42] bg-[rgba(255,188,66,0.1)] border-[#FFBC42]';
      case 'low': return 'text-[#00D4A8] bg-[rgba(0,212,168,0.1)] border-[#00D4A8]';
      default: return 'text-[#7A8DA8] bg-[rgba(122,141,168,0.1)] border-[#7A8DA8]';
    }
  };

  const getTriageIcon = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return <ShieldAlert size={14} className="mr-1.5" />;
      case 'moderate': return <Activity size={14} className="mr-1.5" />;
      case 'low': return <CheckCircle2 size={14} className="mr-1.5" />;
      default: return <FileText size={14} className="mr-1.5" />;
    }
  };

  const filteredReports = reports.filter((r) =>
    (r.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <Navbar />
      
      <main className="flex-1 px-8 md:px-12 pt-32 pb-16 max-w-[1400px] mx-auto w-full transition-all duration-700"
        style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(24px)' }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-1.5 bg-[#0090FF] animate-pulse" />
              <span className="text-xs sm:text-sm font-bold tracking-[0.18em] text-[#0090FF] uppercase">Database Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-[0.12em] text-[#FAFAFA] uppercase">Case History</h1>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH PATIENT ID OR NAME..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-[#FAFAFA] text-sm tracking-[0.12em] uppercase py-3 pl-12 pr-4 focus:outline-none focus:border-[#0090FF] focus:bg-[rgba(0,144,255,0.02)] transition-colors placeholder-[#444]"
            />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
                  <th className="py-4 px-6 text-xs sm:text-sm font-bold tracking-[0.14em] text-[#7A8DA8] uppercase w-1/4">Patient</th>
                  <th className="py-4 px-6 text-xs sm:text-sm font-bold tracking-[0.14em] text-[#7A8DA8] uppercase w-1/6">Date</th>
                  <th className="py-4 px-6 text-xs sm:text-sm font-bold tracking-[0.14em] text-[#7A8DA8] uppercase w-1/6">Organ</th>
                  <th className="py-4 px-6 text-xs sm:text-sm font-bold tracking-[0.14em] text-[#7A8DA8] uppercase w-1/4">Triage Status</th>
                  <th className="py-4 px-6 text-xs sm:text-sm font-bold tracking-[0.14em] text-[#7A8DA8] uppercase w-1/6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="5" className="py-6 px-6">
                        <div className="h-4 bg-[rgba(255,255,255,0.03)] animate-pulse rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-[#555] text-sm tracking-widest uppercase">
                      No cases found in database.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr 
                      key={report.id} 
                      className="group hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                      onClick={() => navigate(`/report/${report.id}`)}
                    >
                      <td className="py-5 px-6">
                        <div className="text-[13px] font-bold text-[#FAFAFA] tracking-wide mb-1">{report.patient_name}</div>
                        <div className="text-xs sm:text-sm font-mono text-[#555] tracking-[0.12em]">{report.patient_id}</div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center text-sm text-[#A0AABF] tracking-[0.08em]">
                          <Clock size={12} className="mr-2 text-[#555]" />
                          {new Date(report.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-sm font-bold tracking-[0.08em] text-[#E8EDF5] uppercase border border-[rgba(255,255,255,0.1)] px-2 py-1 bg-[rgba(255,255,255,0.03)]">
                          {report.organ_type}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className={`inline-flex items-center px-3 py-1 text-xs sm:text-sm font-bold tracking-[0.12em] uppercase border ${getTriageColor(report.triage_level)}`}>
                          {getTriageIcon(report.triage_level)}
                          {report.triage_level}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right relative">
                        <button className="text-xs sm:text-sm font-bold tracking-[0.12em] text-[#00D4A8] uppercase hover:text-white transition-colors group-hover:translate-x-1 inline-flex items-center">
                          View details <span className="ml-2">→</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
