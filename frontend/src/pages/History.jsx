import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { getApiErrorMessage } from '../lib/api';

function normalizeTriageLevel(level) {
  return String(level || 'low').toUpperCase();
}

export default function History() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [triageFilter, setTriageFilter] = useState('ALL');

  useEffect(() => {
    let isActive = true;

    api.get('/api/reports')
      .then((response) => {
        if (!isActive) return;
        setReports(response.data || []);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(getApiErrorMessage(err, 'History could not be loaded.'));
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = [report.patient_name, report.patient_id, report.organ_type, report.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search.toLowerCase()));

      const normalized = normalizeTriageLevel(report.triage_level);
      const matchesTriage = triageFilter === 'ALL' || normalized === triageFilter;
      return matchesSearch && matchesTriage;
    });
  }, [reports, search, triageFilter]);

  const getTriageClass = (level) => {
    return {
      HIGH: 'bg-error-container text-on-error-container border-error/20',
      MODERATE: 'bg-tertiary-container text-on-tertiary-container border-tertiary/20',
      LOW: 'bg-secondary-container text-on-secondary-container border-secondary/20',
    }[normalizeTriageLevel(level)] || 'bg-surface-container text-on-surface-variant border-outline-variant/10';
  };

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 h-full bg-surface-container-low hidden md:flex flex-col py-6 px-4 gap-2 text-sm font-medium border-r border-outline-variant/10 shrink-0">
          <div className="flex flex-col gap-1 mb-8 px-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold font-headline">Report Archive</span>
            <h1 className="text-xl font-bold text-on-surface font-headline">History</h1>
          </div>
          <div className="flex flex-col gap-1">
            <Link to="/dashboard" className="px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface flex items-center gap-3 rounded-lg transition-all">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-headline font-bold uppercase tracking-wider text-xs">Overview</span>
            </Link>
            <div className="px-4 py-3 bg-primary-container/10 text-primary border-l-4 border-primary-container flex items-center gap-3 transition-all rounded-r-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              <span className="font-headline font-bold uppercase tracking-wider text-xs">Registry</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8 relative flex flex-col">
          <div className="data-grid-overlay absolute inset-0 opacity-10 pointer-events-none"></div>

          <div className="max-w-[1400px] mx-auto w-full relative z-10 flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
              <div>
                <p className="text-primary text-[10px] tracking-[0.2em] uppercase font-bold mb-2">Clinical Data Repository</p>
                <h1 className="text-4xl font-bold tracking-tight font-headline">Patient Registry</h1>
                <p className="text-sm text-on-surface-variant mt-3 max-w-2xl">
                  Search saved analyses by patient, organ, or report ID and filter by triage level.
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by patient, organ, or report ID"
                  className="recessed-input py-3 px-4 min-w-[280px] text-sm"
                />
                <select
                  value={triageFilter}
                  onChange={(event) => setTriageFilter(event.target.value)}
                  className="recessed-input py-3 px-4 text-sm bg-surface-container-lowest"
                >
                  <option value="ALL">All triage levels</option>
                  <option value="HIGH">High</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-8 rounded-2xl border border-error/30 bg-error/10 p-5 text-sm text-error">
                {error}
              </div>
            )}

            <div className="flex-1 bg-surface-container-low border border-outline-variant/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-0">
              <div className="overflow-x-auto overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-surface-container-high z-20">
                    <tr>
                      {['Patient / Subject', 'Organ', 'Triage', 'Score', 'Timestamp', 'Actions'].map((heading) => (
                        <th key={heading} className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant border-b border-outline-variant/20 font-headline">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {loading ? (
                      [1, 2, 3].map((index) => (
                        <tr key={index} className="animate-pulse">
                          <td colSpan="6" className="px-8 py-6 h-16 bg-surface-container/20"></td>
                        </tr>
                      ))
                    ) : filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center text-on-surface-variant text-xs uppercase tracking-widest font-bold">
                          No reports match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report) => {
                        const probability = typeof report.probability_score === 'number' ? Math.round(report.probability_score * 100) : 0;
                        const triage = normalizeTriageLevel(report.triage_level);
                        const createdAt = report.created_at
                          ? new Date(report.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Unknown';

                        return (
                          <tr key={report.id} className="group hover:bg-surface-container transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant/20 font-mono font-bold text-primary group-hover:scale-110 transition-transform">
                                  {report.patient_name?.[0] || 'O'}
                                </div>
                                <div>
                                  <p className="font-bold font-headline">{report.patient_name || 'Anonymous'}</p>
                                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">ID: #OD-{report.id.substring(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-surface-container-highest/50 rounded-full text-[10px] font-bold uppercase tracking-wider text-on-surface border border-outline-variant/10 capitalize">
                                {report.organ_type}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getTriageClass(triage)}`}>
                                {triage}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-24 h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                                  <div className={`h-full ${triage === 'HIGH' ? 'bg-error' : triage === 'MODERATE' ? 'bg-tertiary' : 'bg-secondary'}`} style={{ width: `${probability}%` }}></div>
                                </div>
                                <span className="font-mono text-xs font-bold text-on-surface">{probability}%</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">{createdAt}</p>
                            </td>
                            <td className="px-8 py-6">
                              <Link to={`/report/${report.id}`} className="p-2.5 bg-surface-container-high rounded-xl text-primary hover:bg-primary-container hover:text-white transition-all inline-flex border border-outline-variant/20 shadow-sm">
                                <span className="material-symbols-outlined text-xl">clinical_notes</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex justify-between items-center shrink-0">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                  Showing {filteredReports.length} of {reports.length} stored reports
                </p>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                  Filters: {triageFilter === 'ALL' ? 'all triage levels' : triageFilter.toLowerCase()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
