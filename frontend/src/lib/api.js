import axios from 'axios';

let authToken = localStorage.getItem('token');

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
});

export function setApiAuthToken(token) {
  authToken = token || null;
}

api.interceptors.request.use((config) => {
  const token = authToken || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail) && detail[0]?.msg) {
    return detail[0].msg;
  }
  return fallback;
}

export default api;
