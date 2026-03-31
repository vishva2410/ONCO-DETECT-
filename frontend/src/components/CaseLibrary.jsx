import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const organIcon = { brain: 'psychology', lung: 'pulmonology', breast: 'female' };
const organLabel = { brain: 'Cerebral', lung: 'Pulmonary', breast: 'Mammary' };

export default function CaseLibrary({ isOpen, onClose }) {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/api/reports').then(r => setCases(r.data || [])).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk' }}>Case Library</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
          {cases.length === 0 && (
            <p className="text-on-surface-variant text-sm text-center py-8">No cases found.</p>
          )}
          {cases.map(c => (
            <Link
              key={c.id}
              to={`/report/${c.id}`}
              onClick={onClose}
              className="block p-4 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">{organIcon[c.organ_type] || 'biotech'}</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{c.patient_name || 'Unknown'}</p>
                    <p className="text-xs text-on-surface-variant">{organLabel[c.organ_type] || c.organ_type}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
