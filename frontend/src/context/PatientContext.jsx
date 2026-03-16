import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useToast } from '../hooks/useToast';

const PatientContext = createContext();

const initialState = {
  patientData: {
    name: '',
    age: '',
    gender: '',
    symptoms: '',
    smokingHistory: false,
    familyHistory: false,
    organType: '',
  },
  scanFile: null,
  scanPreviewUrl: null,
  reportData: null,
};

export function PatientProvider({ children }) {
  const { toasts, addToast, removeToast } = useToast();
  
  const [patientData, setPatientData] = useState(initialState.patientData);
  const [scanFile, setScanFile] = useState(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState(null);
  const [reportData, setReportData] = useState(null);

  const updatePatientData = useCallback((updates) => {
    setPatientData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetPatient = useCallback(() => {
    setPatientData(initialState.patientData);
    setScanFile(null);
    setScanPreviewUrl(null);
    setReportData(null);
  }, []);

  const value = useMemo(() => ({
    patientData,
    setPatientData,
    updatePatientData,
    scanFile,
    setScanFile,
    scanPreviewUrl,
    setScanPreviewUrl,
    reportData,
    setReportData,
    resetPatient,
    resetAll: resetPatient,
    toasts,
    addToast,
    removeToast,
  }), [
    patientData, updatePatientData, scanFile, scanPreviewUrl, 
    reportData, resetPatient, toasts, addToast, removeToast
  ]);

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}
