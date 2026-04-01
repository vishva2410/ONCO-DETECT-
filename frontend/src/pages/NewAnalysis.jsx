import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/usePatient';
import Navbar from '../components/Navbar';

const ORGAN_OPTIONS = [
  {
    key: 'brain',
    label: 'Brain',
    icon: 'psychology',
    activeClass: 'bg-primary/10 border-primary/70 shadow-[0_0_20px_rgba(0,112,243,0.25)]',
    hoverClass: 'hover:border-primary/50',
    iconClass: 'text-primary',
    desc: 'Brain MRI or tumor-screening imagery for research triage.',
  },
  {
    key: 'lung',
    label: 'Lung',
    icon: 'pulmonology',
    activeClass: 'bg-secondary/10 border-secondary/70 shadow-[0_0_20px_rgba(0,212,168,0.2)]',
    hoverClass: 'hover:border-secondary/50',
    iconClass: 'text-secondary',
    desc: 'Lung CT or chest imaging for oncology-oriented review.',
  },
  {
    key: 'breast',
    label: 'Breast',
    icon: 'female',
    activeClass: 'bg-tertiary/10 border-tertiary/70 shadow-[0_0_20px_rgba(255,188,66,0.2)]',
    hoverClass: 'hover:border-tertiary/50',
    iconClass: 'text-tertiary',
    desc: 'Breast imaging for mammography-style risk prioritization.',
  },
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function NewAnalysis() {
  const navigate = useNavigate();
  const { setPatientData, setScanFile, setScanPreviewUrl, addToast } = usePatient();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    organType: '',
    symptoms: '',
    smokingHistory: false,
    familyHistory: false,
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const wizardSteps = [
    { icon: 'person_add', label: 'Demographics', status: 'Active', active: true },
    { icon: 'history_edu', label: 'Clinical Context', status: 'Included', active: true },
    { icon: 'biotech', label: 'Organ Selection', status: 'Required', active: true },
    { icon: 'cloud_upload', label: 'Image Upload', status: 'Required', active: true },
  ];

  const validateAndStoreFile = (selectedFile) => {
    if (!selectedFile) return false;

    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      addToast('Please upload a PNG, JPG, or WEBP image.', 'error');
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      addToast('Please upload an image smaller than 10MB.', 'error');
      return false;
    }

    setFile(selectedFile);
    setScanPreviewUrl(URL.createObjectURL(selectedFile));
    return true;
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files?.[0]) {
      validateAndStoreFile(event.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files?.[0]) {
      validateAndStoreFile(event.target.files[0]);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.age || !form.organType || !file) {
      addToast('Name, age, organ type, and an image are required.', 'error');
      return;
    }

    setPatientData({ ...form });
    setScanFile(file);
    navigate('/analysis');
  };

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 h-full flex flex-col py-8 px-6 bg-surface-container-low border-r border-outline-variant/10 shrink-0 hidden md:flex">
          <div className="flex flex-col gap-1 mb-12">
            <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold font-headline">Analysis Intake</span>
            <h1 className="text-2xl font-bold text-on-surface font-headline">New Case</h1>
          </div>

          <nav className="flex flex-col gap-4">
            {wizardSteps.map((step) => (
              <div key={step.label} className={`p-3 flex items-center gap-4 transition-all duration-300 rounded-lg ${step.active ? 'bg-surface-container shadow-lg border-l-4 border-primary' : 'opacity-40'}`}>
                <span className={`material-symbols-outlined ${step.active ? 'text-primary' : 'text-on-surface-variant'}`} style={step.active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {step.icon}
                </span>
                <div>
                  <p className="text-xs font-bold text-on-surface uppercase tracking-wider">{step.label}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase">{step.status}</p>
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto p-5 bg-surface-container rounded-xl border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary font-headline">Prototype Guardrails</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium">
              Use de-identified sample data when possible. This workflow supports research triage and clinician review, not standalone diagnosis.
            </p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-12 relative">
          <div className="data-grid-overlay absolute inset-0 opacity-10 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="glass-panel border border-outline-variant/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-outline-variant/10 bg-surface-container-low/50 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface font-headline uppercase tracking-tight">Patient Intake</h2>
                  <p className="text-sm text-on-surface-variant mt-1 font-medium">Capture the minimum context needed for a reproducible local analysis run.</p>
                </div>
                <span className="text-5xl font-black text-primary/10 font-headline">01</span>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant font-headline">Patient Name</label>
                      <input
                        className="recessed-input py-4 px-2 text-on-surface w-full text-lg font-bold"
                        placeholder="Patient Name"
                        type="text"
                        value={form.name}
                        onChange={(event) => update('name', event.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant font-headline">Age (Years)</label>
                      <input
                        className="recessed-input py-4 px-2 text-on-surface w-full text-lg font-bold"
                        placeholder="45"
                        type="number"
                        min="0"
                        max="120"
                        value={form.age}
                        onChange={(event) => update('age', event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant font-headline">Biological Sex / Gender</label>
                      <select
                        className="recessed-input py-4 px-2 text-on-surface w-full bg-surface-container-lowest font-bold"
                        value={form.gender}
                        onChange={(event) => update('gender', event.target.value)}
                      >
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
                        placeholder="Symptoms, study reason, or imaging context..."
                        value={form.symptoms}
                        onChange={(event) => update('symptoms', event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-low px-5 py-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant font-headline">Smoking History</p>
                      <p className="text-xs text-on-surface-variant mt-1">Optional context for the generated narrative.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.smokingHistory}
                      onChange={(event) => update('smokingHistory', event.target.checked)}
                      className="h-5 w-5 accent-[var(--color-primary)]"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-low px-5 py-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant font-headline">Family History</p>
                      <p className="text-xs text-on-surface-variant mt-1">Adds optional hereditary-risk context.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.familyHistory}
                      onChange={(event) => update('familyHistory', event.target.checked)}
                      className="h-5 w-5 accent-[var(--color-primary)]"
                    />
                  </label>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block font-headline">Organ Selection</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ORGAN_OPTIONS.map((organ) => (
                      <button
                        key={organ.key}
                        type="button"
                        onClick={() => update('organType', organ.key)}
                        className={`group relative flex flex-col p-6 border rounded-xl text-left overflow-hidden transition-all duration-500 hover:-translate-y-1 ${
                          form.organType === organ.key
                            ? `${organ.activeClass} scale-[1.02] z-10`
                            : `bg-surface-container-highest/30 border-outline-variant/10 ${organ.hoverClass} hover:bg-surface-container-highest/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]`
                        }`}
                      >
                        <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
                          <span className="material-symbols-outlined text-[140px]">{organ.icon}</span>
                        </div>
                        <span className={`material-symbols-outlined ${organ.iconClass} mb-6 text-3xl`}>{organ.icon}</span>
                        <h3 className="font-bold text-xl font-headline tracking-tight">{organ.label}</h3>
                        <p className="text-[11px] text-on-surface-variant mt-3 leading-relaxed font-medium uppercase tracking-wider">{organ.desc}</p>
                        {form.organType === organ.key && (
                          <div className="absolute top-4 right-4">
                            <span className="material-symbols-outlined text-secondary animate-pulse-ring" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block font-headline">Diagnostic Image Upload</label>
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-20 px-6 text-center cursor-pointer group transition-all duration-500 relative overflow-hidden ${
                      dragActive
                        ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(0,112,243,0.3)_inset] scale-[1.01]'
                        : file
                          ? 'border-secondary/60 bg-secondary/5 shadow-[0_0_20px_rgba(0,212,168,0.1)]'
                          : 'border-outline-variant/20 bg-surface-container-lowest/50 hover:bg-surface-container-low hover:border-primary/40 hover:shadow-[0_0_15px_rgba(0,112,243,0.1)] hover:-translate-y-1'
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg border border-outline-variant/10">
                      <span className="material-symbols-outlined text-primary text-4xl">{file ? 'verified' : 'upload_file'}</span>
                    </div>
                    {file ? (
                      <>
                        <h4 className="font-bold text-on-surface font-headline text-lg">{file.name}</h4>
                        <p className="text-[10px] font-bold text-secondary mt-3 uppercase tracking-[0.2em]">Ready for local analysis</p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-bold text-on-surface font-headline text-lg uppercase tracking-tight">Upload Scan Image</h4>
                        <p className="text-xs text-on-surface-variant mt-3 max-w-xs font-medium">Supported: PNG, JPG, WEBP. Max file size: 10MB.</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-12 flex justify-between items-center border-t border-outline-variant/10">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-4 text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.25em] hover:text-on-surface transition-colors flex items-center gap-3 font-headline"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-12 py-4 bg-gradient-to-br from-primary-container to-primary text-on-primary-container text-xs font-bold uppercase tracking-[0.2em] rounded-xl shadow-[0_15px_40px_rgba(0,112,243,0.3)] hover:scale-105 active:scale-95 transition-all font-headline"
                  >
                    Start Analysis
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
