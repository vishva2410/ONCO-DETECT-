import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { UploadCloud, FileType, CheckCircle2, User, Activity, AlertCircle, ArrowRight } from 'lucide-react';
import { usePageTransition } from '../hooks/usePageTransition';

const organTypes = [
  { id: 'brain', label: 'Brain MRI', desc: 'Detect masses, lesions, and hemorrhage', icon: '🧠' },
  { id: 'lung', label: 'Lung X-Ray', desc: 'Identify nodules, opacities, and effusion', icon: '🫁' },
  { id: 'breast', label: 'Breast Mammo', desc: 'Screen for microcalcifications and mass', icon: '🎗️' },
];

export default function NewAnalysis() {
  const navigate = useNavigate();
  const { updatePatientData, setScanFile, setScanPreviewUrl, addToast } = usePatient();
  const fileInputRef = useRef(null);
  const isVisible = usePageTransition(10);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    symptoms: '',
    smokingHistory: false,
    familyHistory: false,
  });

  const [selectedOrgan, setSelectedOrgan] = useState('');
  const [localFile, setLocalFile] = useState(null);
  const [localPreview, setLocalPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      addToast('Please upload a valid image file (JPEG, PNG, DICOM).', 'error');
      return;
    }
    setLocalFile(file);
    setLocalPreview(URL.createObjectURL(file));
    addToast('Scan image uploaded successfully', 'success');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age) {
      addToast('Please fill out the patient name and age.', 'warning');
      return;
    }
    if (!selectedOrgan) {
      addToast('Please select an organ type.', 'warning');
      return;
    }
    if (!localFile) {
      addToast('Please upload a scan image before proceeding.', 'warning');
      return;
    }

    // Save to context
    updatePatientData({ ...formData, organType: selectedOrgan });
    setScanFile(localFile);
    setScanPreviewUrl(localPreview);

    // Proceed to analysis
    navigate('/analysis');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <Navbar />

      <main 
        className="flex-1 px-8 md:px-12 pt-32 pb-24 max-w-[1200px] mx-auto w-full transition-all duration-700"
        style={{ 
          opacity: isVisible ? 1 : 0, 
          transform: isVisible ? 'translateY(0)' : 'translateY(24px)' 
        }}
      >
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-1.5 h-1.5 bg-[#00D4A8]" />
             <span className="text-[10px] font-bold tracking-[0.3em] text-[#00D4A8] uppercase">Analysis Intake</span>
          </div>
          <h1 className="text-3xl font-bold tracking-[0.2em] text-[#FAFAFA] mb-4 uppercase">New Clinical Case</h1>
          <p className="text-sm text-[#7A8DA8] tracking-widest uppercase max-w-2xl">Initialize the diagnostic pipeline by providing patient data and medical imaging scans.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Patient Form */}
          <section className="glass-card p-10 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[rgba(255,255,255,0.05)]">
              <User size={18} className="text-[#00D4A8]" />
              <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#FAFAFA] uppercase">Patient Profile</h2>
            </div>
            
            <form className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-[#555] uppercase tracking-[0.2em]">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="JOHN DOE"
                    className="w-full px-6 py-5 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] text-sm text-[#FAFAFA] transition-all focus:border-[#00D4A8] outline-none rounded-none tracking-widest focus:bg-[rgba(0,212,168,0.02)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-[#555] uppercase tracking-[0.2em]">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="45"
                      className="w-full px-6 py-5 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] text-sm text-[#FAFAFA] transition-all focus:border-[#00D4A8] outline-none rounded-none tracking-widest focus:bg-[rgba(0,212,168,0.02)]"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-[#555] uppercase tracking-[0.2em]">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-6 py-5 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] text-[11px] text-[#666] tracking-widest transition-all focus:border-[#00D4A8] focus:text-[#FAFAFA] outline-none rounded-none appearance-none focus:bg-[rgba(0,212,168,0.02)]"
                    >
                      <option value="">SELECT</option>
                      <option value="Male">MALE</option>
                      <option value="Female">FEMALE</option>
                      <option value="Other">OTHER</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-[#555] uppercase tracking-[0.2em]">Clinical Presentation</label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  placeholder="OBSERVED SYMPTOMS AND MEDICAL OBSERVATIONS..."
                  rows="5"
                  className="w-full px-6 py-5 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] text-sm text-[#FAFAFA] transition-all focus:border-[#00D4A8] outline-none rounded-none resize-none tracking-widest focus:bg-[rgba(0,212,168,0.02)] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <label className="flex items-center gap-4 cursor-pointer group p-4 border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                  <div className="relative flex items-center justify-center w-5 h-5 border border-[rgba(255,255,255,0.1)] transition group-hover:border-[#00D4A8] rounded-none">
                    <input 
                      type="checkbox" 
                      name="smokingHistory"
                      checked={formData.smokingHistory}
                      onChange={handleInputChange}
                      className="peer sr-only" 
                    />
                    <div className="absolute inset-0 bg-[#00D4A8] scale-0 transition-transform peer-checked:scale-100 flex items-center justify-center rounded-none">
                      <CheckCircle2 size={12} className="text-[#050505]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#666] group-hover:text-[#FAFAFA] transition">Smoking History</span>
                </label>
                
                <label className="flex items-center gap-4 cursor-pointer group p-4 border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                  <div className="relative flex items-center justify-center w-5 h-5 border border-[rgba(255,255,255,0.1)] transition group-hover:border-[#00D4A8] rounded-none">
                    <input 
                      type="checkbox" 
                      name="familyHistory"
                      checked={formData.familyHistory}
                      onChange={handleInputChange}
                      className="peer sr-only" 
                    />
                    <div className="absolute inset-0 bg-[#00D4A8] scale-0 transition-transform peer-checked:scale-100 flex items-center justify-center rounded-none">
                      <CheckCircle2 size={12} className="text-[#050505]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#666] group-hover:text-[#FAFAFA] transition">Genetics History</span>
                </label>
              </div>
            </form>
          </section>

          {/* Module & Upload Section */}
          <div className="space-y-8">
            <section className="glass-card p-10 bg-[rgba(0,144,255,0.01)]">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[rgba(255,255,255,0.05)]">
                <Activity size={18} className="text-[#0090FF]" />
                <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#FAFAFA] uppercase">Modality Selection</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {organTypes.map(organ => (
                  <button
                    key={organ.id}
                    type="button"
                    onClick={() => setSelectedOrgan(organ.id)}
                    className={`p-6 text-center border transition-all duration-500 overflow-hidden relative group ${
                      selectedOrgan === organ.id
                        ? 'bg-[rgba(0,144,255,0.08)] border-[#0090FF] shadow-[0_0_30px_rgba(0,144,255,0.1)]'
                        : 'bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)]'
                    }`}
                  >
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-500">{organ.icon}</div>
                    <div className="text-[9px] font-black tracking-[0.25em] uppercase text-[#FAFAFA] leading-tight">{organ.label}</div>
                    {selectedOrgan === organ.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0090FF]" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            <section className="glass-card p-10">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[rgba(255,255,255,0.05)]">
                <FileType size={18} className="text-[#FAFAFA]" />
                <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#FAFAFA] uppercase">Imaging Payload</h2>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`relative border-2 border-dashed p-10 text-center transition-all duration-500 ${
                  dragActive ? 'border-[#00D4A8] bg-[rgba(0,212,168,0.05)]' : 'border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.01)]'
                }`}
              >
                {localPreview ? (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                       <img src={localPreview} alt="Preview" className="h-44 object-contain border border-[rgba(255,255,255,0.1)] shadow-2xl" />
                       <div className="absolute inset-0 border border-[rgba(0,212,168,0.2)] pointer-events-none" />
                    </div>
                    <p className="text-[10px] tracking-[0.2em] text-[#00D4A8] font-black uppercase mb-2">SCAN_LOADED_OK</p>
                    <p className="text-[10px] text-[#555] font-mono tracking-widest">{localFile.name.toUpperCase()}</p>
                    <button
                      type="button"
                      onClick={() => { setLocalFile(null); setLocalPreview(''); }}
                      className="mt-8 text-[9px] font-black tracking-[0.3em] text-[#FF4444] hover:text-[#ff6b6b] uppercase"
                    >
                      [ EJECT_FILE ]
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={40} className={`mx-auto mb-6 transition-colors duration-500 ${dragActive ? 'text-[#00D4A8]' : 'text-[#333]'}`} />
                    <p className="text-[10px] font-black tracking-[0.25em] text-[#FAFAFA] uppercase mb-4">Transfer Image Data</p>
                    <p className="text-[9px] tracking-widest text-[#555] uppercase mb-10 leading-relaxed">DRAG_DROP OR SELECT_LOCAL_SOURCE<br/>DICOM / PNG / JPEG</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-8 py-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-[#FAFAFA] text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                    >
                      Browse Filesystem
                    </button>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.dcm"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </section>
          </div>
        </div>

        {/* Global Action */}
        <div className="mt-16 flex justify-end">
          <button
            onClick={handleSubmit}
            className="group flex items-center gap-6 px-16 py-6 bg-[#00D4A8] text-[#050505] text-[11px] font-black uppercase tracking-[0.4em] hover:shadow-[0_0_50px_rgba(0,212,168,0.4)] transition-all duration-500"
          >
            Run Neural Analysis
            <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform duration-500" />
          </button>
        </div>

      </main>
      <DisclaimerBanner />
    </div>
  );
}
