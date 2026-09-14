import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pizzahub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('pizzahub_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyStoredAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('pizzahub_user', JSON.stringify(res.data));
        } catch (err) {
          if (err.response && err.response.status === 401) {
            console.warn('Session expired or invalid token');
            logout();
          } else {
            console.warn('Backend server connecting or waking up; retained local session.');
          }
        }
      }
      setLoading(false);
    };
    verifyStoredAuth();
  }, [token]);

  const login = (tokenStr, userData) => {
    setToken(tokenStr);
    setUser(userData);
    localStorage.setItem('pizzahub_token', tokenStr);
    localStorage.setItem('pizzahub_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pizzahub_token');
    localStorage.removeItem('pizzahub_user');
  };

  const updateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('pizzahub_user', JSON.stringify(updatedData));
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
