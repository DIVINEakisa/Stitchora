import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persist = (userData, token) => {
    localStorage.setItem('stitchora_token', token);
    localStorage.setItem('stitchora_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('stitchora_token');
    localStorage.removeItem('stitchora_user');
    setUser(null);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.user, data.token);
    return data.user;
  };

  const register = async (form) => {
    const { data } = await api.post('/auth/register', form);
    persist(data.user, data.token);
    return data.user;
  };

  useEffect(() => {
    const token = localStorage.getItem('stitchora_token');
    const stored = localStorage.getItem('stitchora_user');
    if (!token) {
      setLoading(false);
      return;
    }
    if (stored) setUser(JSON.parse(stored));
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('stitchora_user', JSON.stringify(data.user));
      })
      .catch(logout)
      .finally(() => setLoading(false));
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isCustomer: user?.role === 'customer', isDesigner: user?.role === 'designer' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
