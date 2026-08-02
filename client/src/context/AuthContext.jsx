import { createContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';

export const AuthContext = createContext();

const DEMO_USER = {
  id: 'demo-user-123',
  _id: 'demo-user-123',
  firstName: 'Ada',
  lastName: 'Lovelace',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'company',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

// Helper: pull the nested data object from our API response shape { success, data: { user, tokens } }
const extract = (res) => res?.data?.data ?? res?.data ?? {};

export const AuthProvider = ({ children }) => {
  // Start as null so we know "not yet determined"
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // On mount: restore session from localStorage token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && token !== 'demo-token') {
        try {
          const res = await axiosInstance.get('/auth/me');
          const payload = extract(res);
          if (payload) setUser(payload);
          else setUser(DEMO_USER); // server returned ok but no user obj
        } catch {
          // Token invalid / expired — clear and show login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
        }
      } else if (token === 'demo-token') {
        // Demo session persisted
        setUser(DEMO_USER);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      const payload = extract(res);

      const accessToken  = payload?.tokens?.accessToken;
      const refreshToken = payload?.tokens?.refreshToken;
      const userData     = payload?.user;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken || '');
      } else {
        localStorage.setItem('accessToken', 'demo-token');
      }

      const loggedInUser = userData || { ...DEMO_USER, email };
      setUser(loggedInUser);
      return payload;
    } catch (err) {
      // Only use demo fallback for network errors (no response), not auth failures
      if (!err.response) {
        localStorage.setItem('accessToken', 'demo-token');
        const demoAccount = { ...DEMO_USER, email };
        setUser(demoAccount);
        return { user: demoAccount };
      }
      // Real auth error (401 wrong password, 422 validation) — throw so UI shows message
      const msg = err.response?.data?.message || 'Invalid email or password';
      throw new Error(msg);
    }
  }, []);

  const signup = useCallback(async (formData) => {
    try {
      const res = await axiosInstance.post('/auth/signup', formData);
      const payload = extract(res);

      const accessToken  = payload?.tokens?.accessToken;
      const refreshToken = payload?.tokens?.refreshToken;
      const userData     = payload?.user;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken || '');
      } else {
        localStorage.setItem('accessToken', 'demo-token');
      }

      const newUser = userData || {
        ...DEMO_USER,
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`
      };
      setUser(newUser);
      return payload;
    } catch (err) {
      if (!err.response) {
        // Network error — use demo
        localStorage.setItem('accessToken', 'demo-token');
        const newUser = { ...DEMO_USER, ...formData, name: `${formData.firstName} ${formData.lastName}` };
        setUser(newUser);
        return { user: newUser };
      }
      const msg = err.response?.data?.message || 'Signup failed';
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await axiosInstance.post('/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh || refresh === 'demo-token') return 'demo-token';
    try {
      const res = await axiosInstance.post('/auth/refresh-token', { token: refresh });
      const payload = extract(res);
      const newToken = payload?.accessToken || payload?.tokens?.accessToken;
      if (newToken) {
        localStorage.setItem('accessToken', newToken);
        return newToken;
      }
      return 'demo-token';
    } catch {
      return 'demo-token';
    }
  }, []);

  const updateUser = useCallback((data) => setUser((prev) => ({ ...prev, ...data })), []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, signup, logout, refreshToken, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
