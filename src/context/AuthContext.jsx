import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, systemAPI, getToken, setToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState({
    isLive: false,
    checked: false,
    checking: false,
    error: null,
    latency: null
  });

  const checkHealth = useCallback(async () => {
    setBackendStatus(prev => ({ ...prev, checking: true }));
    const startTime = performance.now();
    try {
      const res = await systemAPI.checkHealth();
      const latency = Math.round(performance.now() - startTime);
      setBackendStatus({
        isLive: res.isLive,
        checked: true,
        checking: false,
        error: res.error || null,
        latency: res.isLive ? latency : null
      });
      return res.isLive;
    } catch (err) {
      setBackendStatus({
        isLive: false,
        checked: true,
        checking: false,
        error: err.message,
        latency: null
      });
      return false;
    }
  }, []);

  // Periodic health check
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Initial session restoration
  useEffect(() => {
    const initAuth = async () => {
      const existingToken = getToken();
      if (existingToken) {
        try {
          const profile = await authAPI.getProfile();
          setUser(profile);
          setTokenState(existingToken);
        } catch (err) {
          console.warn('Session check fallback', err);
          const cachedUser = localStorage.getItem('glass_pos_user');
          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          } else {
            setToken(null);
            setTokenState(null);
            setUser(null);
          }
        }
      } else {
        setUser(null);
        setTokenState(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authAPI.login(email, password);
      const userPayload = res.user || {
        id: 'usr-auto',
        email,
        name: email.split('@')[0],
        role: email.toLowerCase().includes('admin') ? 'ADMIN' : 'STAFF'
      };
      
      setUser(userPayload);
      setTokenState(res.token);
      localStorage.setItem('glass_pos_user', JSON.stringify(userPayload));
      setIsLoading(false);
      return { success: true, user: userPayload };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setTokenState(null);
    setUser(null);
    localStorage.removeItem('glass_pos_user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isAdmin,
      isLoading,
      backendStatus,
      checkHealth,
      login,
      logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
