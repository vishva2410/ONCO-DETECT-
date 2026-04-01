import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { setApiAuthToken } from '../lib/api';
import { AuthContext } from './auth-store';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(
    () => {
      const savedUsername = localStorage.getItem('username');
      return savedUsername ? { authenticated: true, username: savedUsername } : null;
    }
  );
  const [authChecked, setAuthChecked] = useState(() => !localStorage.getItem('token'));
  const loading = Boolean(token) && !authChecked;

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setApiAuthToken(token);
    } else {
      localStorage.removeItem('token');
      setApiAuthToken(null);
    }
  }, [token]);

  useEffect(() => {
    if (user?.username) {
      localStorage.setItem('username', user.username);
    } else {
      localStorage.removeItem('username');
    }
  }, [user]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    api.get('/api/auth/me')
      .then((response) => {
        if (!isActive) return;
        setUser({ authenticated: true, username: response.data.username });
      })
      .catch(() => {
        if (!isActive) return;
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (isActive) {
          setAuthChecked(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          setToken(null);
          setUser(null);
          setAuthChecked(true);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    setApiAuthToken(response.data.access_token);
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('username', response.data.username);
    setAuthChecked(false);
    setToken(response.data.access_token);
    setUser({ authenticated: true, username: response.data.username });
  };

  const logout = useCallback(() => {
    setApiAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
    setAuthChecked(true);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
  }), [user, token, loading, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
