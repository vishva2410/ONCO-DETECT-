import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PatientProvider } from './context/PatientContext';
import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PatientProvider>
          <App />
        </PatientProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
