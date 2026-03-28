import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/usePatient';

const ORGAN_TYPES = [
  { id: 'brain',  label: 'Neural / Brain',    icon: 'psychology' },
  { id: 'lung',   label: 'Pulmonary / Lung',   icon: 'air' },
  { id: 'breast', label: 'Mammary / Breast',   icon: 'favorite' },
];

export default function NewAnalysis() {
  const navigate = useNavigate();
  const { updatePatientData, setScanFile, setScanPreviewUrl, addToast } = usePatient();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [selectedOrgan, setSelectedOrgan] = useState('');
  const [localFile, setLocalFile] = useState(null);
  const [localPreview, setLocalPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    patientId: `OD-${Math.floor(10000 + Math.random() * 90000)}-X`,
    name: '',
    age: '',
    gender: '',
    symptoms: '',
    symptomOnset: '',
    severityIndex: '01',
    brcaStatus: 'NEGATIVE',
    familyHistory: 'NONE',
  });

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.dcm')) {
      addToast('Invalid format. DICOM, PNG, or JPEG only.', 'error');
      return;
    }
    setLocalFile(file);
    setLocalPreview(URL.createObjectURL(file));
    addToast('Scan payload loaded.', 'success');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const goNext = () => {
    if (step === 1) {
      if (!selectedOrgan) { addToast('Select a modality first.', 'warning'); return; }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!localFile) { addToast('Upload a scan image.', 'warning'); return; }
    updatePatientData({ ...formData, organType: selectedOrgan });
    setScanFile(localFile);
    setScanPreviewUrl(localPreview);
    navigate('/analysis');
  };

  const stepTitles = ['Modality & Demographics', 'Clinical History', 'Imaging Upload'];
  const progress = (step / 3) * 100;

  return (
    <div>
      {/* Header */}
      <header className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00D4A8] mb-2">Diagnostic Onboarding</p>
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-[#FAFAFA]">PATIENT_INTAKE_SESSION</h1>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1 h-0.5 bg-white/[0.06] overflow-hidden max-w-xs">
            <div className="h-full bg-[#00D4A8] transition-all duration-700" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-[10px] font-mono text-[#444] uppercase whitespace-nowrap">STEP 0{step} OF 03 — {stepTitles[step - 1]}</span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Form Area */}
        <div className="col-span-12 lg:col-span-8 space-y-5">

          {step === 1 && (
            <>
              {/* Organ Selection */}
              <section className="bg-[#0a0a0a] border border-white/[0.06] p-7">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-sm text-[#00D4A8]">biotech</span>
                  <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#FAFAFA]">Imaging Modality</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {ORGAN_TYPES.map(o => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOrgan(o.id)}
                      className={`group flex flex-col items-center justify-center py-8 px-4 border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                        selectedOrgan === o.id
                          ? 'border-[#00D4A8] bg-[#00D4A8]/[0.06]'
                          : 'border-white/[0.06] bg-[#050505] hover:border-white/20'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-4xl mb-3 transition-colors ${selectedOrgan === o.id ? 'text-[#00D4A8]' : 'text-[#333] group-hover:text-[#FAFAFA]'}`}>{o.icon}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest font-mono transition-colors ${selectedOrgan === o.id ? 'text-[#FAFAFA]' : 'text-[#444] group-hover:text-[#FAFAFA]'}`}>{o.label}</span>
                      {selectedOrgan === o.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00D4A8]"></div>}
                    </button>
                  ))}
                </div>
              </section>

              {/* Demographics */}
              <section className="bg-[#0a0a0a] border border-white/[0.06] p-7">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-sm text-[#00D4A8]">person</span>
                  <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#FAFAFA]">Patient Demographics</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[9px] font-mono text-[#444] uppercase tracking-widest block mb-2">Full Name</label>
                    <input name="name" value={formData.name} onChange={handleInput} placeholder="CLINICIAN_INPUT"
                      className="w-full bg-[#050505] border border-white/[0.06] text-[#FAFAFA] px-4 py-3 focus:border-[#00D4A8] outline-none transition-colors text-sm font-mono tracking-wider placeholder-[#2a2a2a]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-mono text-[#444] uppercase tracking-widest block mb-2">Age</label>
                      <input name="age" type="number" value={formData.age} onChange={handleInput} placeholder="54"
                        className="w-full bg-[#050505] border border-white/[0.06] text-[#FAFAFA] px-4 py-3 focus:border-[#00D4A8] outline-none transition-colors text-sm font-mono placeholder-[#2a2a2a]" />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-[#444] uppercase tracking-widest block mb-2">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleInput}
                        className="w-full bg-[#050505] border border-white/[0.06] text-[#FAFAFA] px-4 py-3 focus:border-[#00D4A8] outline-none transition-colors text-sm font-mono appearance-none cursor-pointer">
                        <option value="">SELECT</option>
                        <option value="Male">MALE</option>
                        <option value="Female">FEMALE</option>
                        <option value="Other">OTHER</option>
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-mono text-[#444] uppercase tracking-widest block mb-2">Clinical Presentation</label>
                    <textarea name="symptoms" value={formData.symptoms} onChange={handleInput}
                      placeholder="OBSERVED_SYMPTOMS_AND_MEDICAL_OBSERVATIONS..."
                      rows={4}
                      className="w-full bg-[#050505] border border-white/[0.06] text-[#FAFAFA] px-4 py-3 focus:border-[#00D4A8] outline-none transition-colors text-sm font-mono resize-none leading-relaxed placeholder-[#2a2a2a]" />
                  </div>
                </div>
              </section>
            </>
          )}

          {step === 2 && (
            <section className="bg-[#0a0a0a] border border-white/[0.06] p-7">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-sm text-[#00D4A8]">history_edu</span>
                <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#FAFAFA]">Clinical History</h2>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-mono text-[#444] uppercase tracking-widest block mb-2">Symptom Onset</label>
                    <input type="date" name="symptomOnset" value={formData.symptomOnset} onChange={handleInput}
                      className="w-full bg-[#050505] border border-white/[0.06] text-[#FAFAFA] px-4 py-3 focus:border-[#00D4A8] outline-none transition-colors text-sm font-mono cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-[#444] uppercase tracking-widest block mb-2">Severity Index</label>
                    <select name="severityIndex" value={formData.severityIndex} onChange={handleInput}
                      className="w-full bg-[#050505] border border-white/[0.06] text-[#FAFAFA] px-4 py-3 focus:border-[#00D4A8] outline-none transition-colors text-sm font-mono cursor-pointer">
                      <option value="01">01 — Sub-clinical</option>
                      <option value="05">05 — Moderate</option>
                      <option value="09">09 — Critical</option>
                    </select>
                  </div>
                </div>

                {[
                  { key: 'brcaStatus', label: 'BRCA1/2 Mutation Status', opts: ['POSITIVE', 'NEGATIVE'] },
                  { key: 'familyHistory', label: 'Family History: Oncology', opts: ['VERIFIED', 'NONE'] },
                ].map(({ key, label, opts }) => (
                  <div key={key} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#050505] border-l-2 border-[#00D4A8]/30 gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-[#FAFAFA] uppercase font-mono">{label}</h3>
                    </div>
                    <div className="flex gap-2">
                      {opts.map(opt => (
                        <button key={opt} onClick={() => setFormData({...formData, [key]: opt})}
                          className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border font-mono transition-all cursor-pointer ${
                            formData[key] === opt ? 'border-[#00D4A8] text-[#00D4A8] bg-[#00D4A8]/10' : 'border-white/10 text-[#444] hover:text-[#FAFAFA] hover:border-white/30'
                          }`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="bg-[#0a0a0a] border border-white/[0.06] p-7">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-sm text-[#00D4A8]">cloud_upload</span>
                <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#FAFAFA]">Imaging Payload Upload</h2>
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed p-12 text-center transition-all duration-500 cursor-pointer ${
                  dragActive ? 'border-[#00D4A8] bg-[#00D4A8]/[0.04]' : 'border-white/[0.08] hover:border-white/20'
                }`}
                onClick={() => !localFile && fileInputRef.current?.click()}
              >
                {!localFile ? (
                  <>
                    <span className={`material-symbols-outlined text-5xl mb-5 transition-colors duration-500 block ${dragActive ? 'text-[#00D4A8]' : 'text-[#2a2a2a]'}`}>upload_file</span>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#FAFAFA] mb-3">Transfer image data</p>
                    <p className="text-[9px] font-mono text-[#333] uppercase mb-8 leading-loose">DRAG & DROP OR CLICK TO BROWSE<br />DICOM / PNG / JPEG</p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="px-8 py-3 bg-[#050505] border border-white/10 text-[#FAFAFA] text-[10px] font-bold uppercase tracking-widest hover:bg-[#111] transition-all cursor-pointer">
                      Browse Filesystem
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined text-[#00D4A8] text-5xl mb-4">check_circle</span>
                    <p className="text-[10px] font-mono tracking-widest text-[#00D4A8] font-bold uppercase mb-2">SCAN_LOADED_OK</p>
                    <p className="text-[10px] font-mono text-[#444]">{localFile.name.toUpperCase()}</p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setLocalFile(null); setLocalPreview(''); }}
                      className="mt-6 text-[9px] font-mono font-bold uppercase tracking-widest text-[#FF4444] hover:text-[#ff6b6b] cursor-pointer">
                      [ EJECT FILE ]
                    </button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*,.dcm" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
              </div>
            </section>
          )}
        </div>

        {/* Right Summary Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-[#0a0a0a] border border-white/[0.06] border-t-2 border-t-[#00D4A8] p-6">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#00D4A8] mb-5">Patient Snapshot</h3>
            <div className="space-y-3">
              {[
                ['Patient_ID', formData.patientId],
                ['Age', formData.age ? `${formData.age} YRS` : '--'],
                ['Status', 'Pending Intake'],
                ['Modality', selectedOrgan ? ORGAN_TYPES.find(o => o.id === selectedOrgan)?.label : '--'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-[10px] font-mono text-[#444] uppercase">{k}</span>
                  <span className="text-[10px] font-mono text-[#FAFAFA] font-bold">{v || '--'}</span>
                </div>
              ))}
            </div>

            {/* Preview area */}
            <div className="mt-6 aspect-square bg-black relative overflow-hidden border border-white/[0.06] flex items-center justify-center">
              <div className="absolute inset-0 scan-radar opacity-20" style={{ animation: 'spin 4s linear infinite' }}></div>
              {localPreview ? (
                <img src={localPreview} className="w-full h-full object-cover mix-blend-screen opacity-80 grayscale z-10" alt="Preview" />
              ) : (
                <span className="material-symbols-outlined text-[#1a1a1a] text-6xl z-10">radiology</span>
              )}
              <div className="absolute bottom-3 left-3 z-20">
                <span className="text-[8px] font-mono text-[#00D4A8] bg-[#00D4A8]/10 px-2 py-0.5 border border-[#00D4A8]/20">
                  {localPreview ? 'PAYLOAD_LOADED' : 'AWAITING_PAYLOAD'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 border border-white/[0.06] bg-[#0a0a0a]">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-[#00D4A8] text-lg">verified_user</span>
              <div>
                <h4 className="text-[10px] font-mono font-bold text-[#FAFAFA] uppercase tracking-wider mb-1">AES-256 Encrypted</h4>
                <p className="text-[10px] font-mono text-[#444] leading-relaxed">All patient data is HIPAA-compliant and encrypted at rest.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <footer className="mt-10 flex justify-between items-center py-6 border-t border-white/[0.06]">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#444] hover:text-[#FAFAFA] transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {step > 1 ? 'Previous' : 'Cancel'}
        </button>
        <button onClick={goNext}
          className="flex items-center gap-3 px-10 py-3 bg-[#00D4A8] text-[#050505] text-[10px] font-bold uppercase tracking-widest hover:bg-[#00a882] hover:shadow-[0_0_25px_rgba(0,212,168,0.4)] transition-all cursor-pointer">
          {step === 3 ? 'Run Analysis' : 'Next Step'}
          <span className="material-symbols-outlined text-sm">{step === 3 ? 'play_arrow' : 'arrow_forward'}</span>
        </button>
      </footer>
    </div>
  );
}
