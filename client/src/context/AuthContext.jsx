import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('talentpulse_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        setUser(res.data);
      } catch (err) {
        console.error('Session restoration failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('talentpulse_token', newToken);
    localStorage.setItem('talentpulse_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('talentpulse_token', newToken);
    localStorage.setItem('talentpulse_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('talentpulse_token');
    localStorage.removeItem('talentpulse_user');
    setToken(null);
    setUser(null);
  };

  // Quick switch role utility (facilitates seamless demonstration of RBAC)
  const switchDemoUser = async (email) => {
    return await login(email, 'password123');
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR_ADMIN';
  const isRecruiter = user?.role === 'RECRUITER' || isAdmin;
  const isInterviewer = user?.role === 'INTERVIEWER' || isAdmin || isRecruiter;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoUser,
        isAdmin,
        isRecruiter,
        isInterviewer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
