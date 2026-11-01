import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('finsetu_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState(null);

  const checkDbStatus = async () => {
    try {
      const res = await api.get('/status');
      if (res.data && res.data.database) {
        setDbStatus(res.data.database);
      }
    } catch (e) {
      setDbStatus({
        connected: false,
        provider: 'PostgreSQL (Supabase)',
        message: 'Unable to reach backend status service.',
        error: e.message
      });
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('finsetu_user', JSON.stringify(res.data.user));
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('finsetu_token');
      localStorage.removeItem('finsetu_user');
      setToken(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await checkDbStatus();
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('finsetu_token', res.data.token);
      localStorage.setItem('finsetu_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data && res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('finsetu_token', res.data.token);
      localStorage.setItem('finsetu_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('finsetu_token');
      localStorage.removeItem('finsetu_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        dbStatus,
        login,
        register,
        logout,
        refreshUser,
        checkDbStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
