import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/usePatient';
import Navbar from '../components/Navbar';

const ORGAN_OPTIONS = [
  { key: 'brain', label: 'Brain', icon: 'psychology', color: 'primary', desc: 'Neuro-oncology, glioblastoma screening, and cortical mapping.' },
  { key: 'lung', label: 'Lung', icon: 'pulmonology', color: 'secondary', desc: 'Pulmonary analysis, nodule tracking, and pleural assessment.' },
  { key: 'breast', label: 'Breast', icon: 'female', color: 'tertiary', desc: 'Mammographic telemetry, densitometry, and calcification analysis.' },
];

export default function NewAnalysis() {
  const navigate = useNavigate();
  const { setPatientData, setScanFile, setScanPreviewUrl, addToast } = usePatient();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: '', age: '', gender: '', organType: '', symptoms: '',
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const wizardSteps = [
    { icon: 'person_add', label: 'Demographics', status: 'Active', active: true },
    { icon: 'history_edu', label: 'Medical History', status: 'Pending', active: false },
    { icon: 'biotech', label: 'Scan Configuration', status: 'Pending', active: false },
    { icon: 'cloud_upload', label: 'Data Upload', status: 'Pending', active: false },
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const f = e.dataTransfer.files[0];
      setFile(f);
      setScanPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      setScanPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.organType || !file) {
      addToast('All fields and a scan are required.', 'error');
      return;
    }
    setPatientData({ ...form });
    setScanFile(file);
    // scanPreviewUrl is already set synchronously on file select
    navigate('/analysis');
  };

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Progress */}
        <aside className="w-64 h-full flex flex-col py-8 px-6 bg-surface-container-low border-r border-outline-variant/10 shrink-0 hidden md:flex">
          <div className="flex flex-col gap-1 mb-12">
            <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold font-headline">Registration Stage</span>
            <h1 className="text-2xl font-bold text-on-surface font-headline">Intake Wizard</h1>
          </div>
          <nav className="flex flex-col gap-4">
            {wizardSteps.map((s, i) => (
              <div key={i} className={`p-3 flex items-center gap-4 transition-all duration-300 rounded-lg ${s.active ? 'bg-surface-container shadow-lg border-l-4 border-primary' : 'opacity-40'}`}>
                <span className={`material-symbols-outlined ${s.active ? 'text-primary' : 'text-on-surface-variant'}`} style={s.active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {s.icon}
                </span>
                <div>
                  <p className="text-xs font-bold text-on-surface uppercase tracking-wider">{s.label}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase">{s.status}</p>
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto p-5 bg-surface-container rounded-xl border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary font-headline">HIPAA COMPLIANT</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium">All data is encrypted using AES-256 protocols. Your session is monitored by clinical oversight.</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-12 relative">
          <div className="data-grid-overlay absolute inset-0 opacity-10 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="glass-panel border border-outline-variant/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Form Header */}
              <div className="p-8 border-b border-outline-variant/10 bg-surface-container-low/50 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface font-headline uppercase tracking-tight">Step 1: Patient Demographics</h2>
                  <p className="text-sm text-on-surface-variant mt-1 font-medium">Capture foundational biometric and identification data.</p>
                </div>
                <span className="text-5xl font-black text-primary/10 font-headline">01</span>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-12">
                {/* ID Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant font-headline">Legal Full Name</label>
                      <input className="recessed-input py-4 px-2 text-on-surface w-full text-lg font-bold" placeholder="Patient Name" type="text" value={form.name} onChange={e => update('name', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant font-headline">Age (Years)</label>
                      <input className="recessed-input py-4 px-2 text-on-surface w-full text-lg font-bold" placeholder="45" type="number" value={form.age} onChange={e => update('age', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant font-headline">Biological Gender</label>
                      <select className="recessed-input py-4 px-2 text-on-surface w-full bg-surface-container-lowest font-bold" value={form.gender} onChange={e => update('gender', e.target.value)}>
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant font-headline">Clinical Notes</label>
                      <textarea
                        className="recessed-input py-4 px-2 text-on-surface w-full resize-none h-24 font-medium"
                        placeholder="Clinical rationale..."
                        value={form.symptoms}
                        onChange={e => update('symptoms', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Organ Selection */}
                <div className="space-y-6">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block font-headline">Diagnostic Focus Cluster</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ORGAN_OPTIONS.map(o => (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => update('organType', o.key)}
                        className={`group relative flex flex-col p-6 border rounded-xl text-left overflow-hidden transition-all duration-500 ${
                          form.organType === o.key
                            ? `bg-${o.color}/10 border-${o.color}/50 shadow-[0_10px_30px_rgba(0,0,0,0.4)]`
                            : 'bg-surface-container-highest/30 border-outline-variant/10 hover:border-primary/30 hover:bg-surface-container-highest/50'
                        }`}
                      >
                        <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
                          <span className="material-symbols-outlined text-[140px]">{o.icon}</span>
                        </div>
                        <span className={`material-symbols-outlined text-${o.color} mb-6 text-3xl`}>{o.icon}</span>
                        <h3 className="font-bold text-xl font-headline tracking-tight">{o.label}</h3>
                        <p className="text-[11px] text-on-surface-variant mt-3 leading-relaxed font-medium uppercase tracking-wider">{o.desc}</p>
                        {form.organType === o.key && (
                          <div className="absolute top-4 right-4">
                            <span className="material-symbols-outlined text-secondary animate-pulse-ring" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Zone */}
                <div className="space-y-6">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block font-headline">DICOM / MR Imaging Assets</label>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-20 px-6 text-center cursor-pointer group transition-all duration-500 ${
                      dragActive
                        ? 'border-primary bg-primary/5 shadow-inner'
                        : file
                          ? 'border-secondary/40 bg-secondary/5'
                          : 'border-outline-variant/20 bg-surface-container-lowest/50 hover:bg-surface-container-low hover:border-primary/20'
                    }`}
                  >
                    <input ref={fileRef} type="file" accept="image/*,.dcm" className="hidden" onChange={handleFileChange} />
                    <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg border border-outline-variant/10">
                      <span className="material-symbols-outlined text-primary text-4xl">{file ? 'verified' : 'upload_file'}</span>
                    </div>
                    {file ? (
                      <>
                        <h4 className="font-bold text-on-surface font-headline text-lg">{file.name}</h4>
                        <p className="text-[10px] font-bold text-secondary mt-3 uppercase tracking-[0.2em]">Ready for neural processing</p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-bold text-on-surface font-headline text-lg uppercase tracking-tight">Stream Diagnostic Assets</h4>
                        <p className="text-xs text-on-surface-variant mt-3 max-w-xs font-medium">Supported: DICOM, MRI, CT. Max file size: 50MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-12 flex justify-between items-center border-t border-outline-variant/10">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-4 text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.25em] hover:text-on-surface transition-colors flex items-center gap-3 font-headline"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                    Void Session
                  </button>
                  <button
                    type="submit"
                    className="px-12 py-4 bg-gradient-to-br from-primary-container to-primary text-on-primary-container text-xs font-bold uppercase tracking-[0.2em] rounded-xl shadow-[0_15px_40px_rgba(0,112,243,0.3)] hover:scale-105 active:scale-95 transition-all font-headline"
                  >
                    Initialize Neural Analysis
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
