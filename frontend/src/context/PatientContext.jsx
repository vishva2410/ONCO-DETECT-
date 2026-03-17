import { createContext, useState, useCallback, useMemo } from 'react';
import { useToast } from '../hooks/useToast';
import { initialPatientState } from './patientState';

const PatientContext = createContext();

export function PatientProvider({ children }) {
  const { toasts, addToast, removeToast } = useToast();
  
  const [patientData, setPatientData] = useState(initialPatientState.patientData);
  const [scanFile, setScanFile] = useState(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState(null);
  const [reportData, setReportData] = useState(null);

  const updatePatientData = useCallback((updates) => {
    setPatientData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetPatient = useCallback(() => {
    setPatientData(initialPatientState.patientData);
    setScanFile(initialPatientState.scanFile);
    setScanPreviewUrl(initialPatientState.scanPreviewUrl);
    setReportData(initialPatientState.reportData);
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
export { PatientContext };
