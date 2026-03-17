import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/usePatient';
import { X, Brain, Wind, Heart, ArrowRight } from 'lucide-react';

const sampleCases = [
  {
    id: 1,
    label: 'High Risk Lung',
    triageBadge: 'high',
    icon: Wind,
    data: {
      name: 'Arjun Sharma',
      age: '58',
      gender: 'Male',
      symptoms: 'Persistent cough, weight loss, shortness of breath',
      smokingHistory: true,
      familyHistory: true,
      organType: 'lung',
    },
  },
  {
    id: 2,
    label: 'Suspicious Brain',
    triageBadge: 'moderate',
    icon: Brain,
    data: {
      name: 'Priya Menon',
      age: '44',
      gender: 'Female',
      symptoms: 'Recurring headaches, vision disturbances, memory lapses',
      smokingHistory: false,
      familyHistory: true,
      organType: 'brain',
    },
  },
  {
    id: 3,
    label: 'Low Risk All Clear',
    triageBadge: 'low',
    icon: Heart,
    data: {
      name: 'Rohan Iyer',
      age: '32',
      gender: 'Male',
      symptoms: 'Mild fatigue, routine screening',
      smokingHistory: false,
      familyHistory: false,
      organType: 'breast',
    },
  },
  {
    id: 4,
    label: 'Complex Multi-Organ',
    triageBadge: 'high',
    icon: Wind,
    data: {
      name: 'Sunita Rao',
      age: '67',
      gender: 'Female',
      symptoms: 'Chest pain, breast lump detected, cognitive decline',
      smokingHistory: true,
      familyHistory: true,
      organType: 'lung',
    },
  },
];

const badgeColors = {
  high: { bg: 'rgba(255, 68, 68, 0.15)', text: '#FF4444', border: 'rgba(255, 68, 68, 0.3)' },
  moderate: { bg: 'rgba(255, 188, 66, 0.15)', text: '#FFBC42', border: 'rgba(255, 188, 66, 0.3)' },
  low: { bg: 'rgba(0, 200, 83, 0.15)', text: '#00C853', border: 'rgba(0, 200, 83, 0.3)' },
};

export default function CaseLibrary({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { setPatientData, setScanFile, setScanPreviewUrl, addToast } = usePatient();

  if (!isOpen) return null;

  const handleSelect = async (caseItem) => {
    setPatientData(caseItem.data);
    onClose();
    
    try {
      const response = await fetch('/sample_scan.jpg');
      const blob = await response.blob();
      const file = new File([blob], 'sample_scan.jpg', { type: 'image/jpeg' });
      setScanFile(file);
      setScanPreviewUrl('/sample_scan.jpg');
    } catch (e) {
      console.error('Failed to load sample scan image', e);
    }

    addToast('Sample case loaded', 'success');
    navigate('/new-analysis');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      >
        {/* Modal */}
        <div
          className="w-full max-w-2xl rounded-none p-6 animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#0D1622',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[#E8EDF5]">Sample Case Library</h2>
              <p className="text-sm text-[#7A8DA8] mt-1">Pre-loaded patient scenarios for demonstration</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-none flex items-center justify-center text-[#7A8DA8]
                hover:text-[#E8EDF5] hover:bg-[rgba(255,255,255,0.05)] transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cases grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sampleCases.map((c) => {
              const badge = badgeColors[c.triageBadge];
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="text-left p-4 rounded-none border transition-all duration-200
                    hover:border-[rgba(0,212,168,0.3)] hover:bg-[#111C2A] group"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-none flex items-center justify-center"
                      style={{ background: 'rgba(0, 212, 168, 0.1)' }}
                    >
                      <Icon size={18} className="text-[#00D4A8]" />
                    </div>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-none"
                      style={{
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {c.triageBadge} risk
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#E8EDF5] mb-1">{c.label}</h3>
                  <p className="text-xs text-[#7A8DA8] mb-2">
                    {c.data.name} · {c.data.age}y · {c.data.gender}
                  </p>
                  <p className="text-xs text-[#5a6f8a] leading-relaxed line-clamp-2">{c.data.symptoms}</p>
                  <div className="flex items-center gap-1 mt-3 text-[#00D4A8] text-xs font-medium
                    opacity-0 group-hover:opacity-100 transition-opacity">
                    Load case <ArrowRight size={12} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
