import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(authService.getToken());
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      setUser(data);
      return data;
    } catch (err) {
      console.warn('Failed to fetch authenticated user profile:', err.message);
      authService.logout();
      setUser(null);
      setToken(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getToken();
      if (storedToken) {
        setToken(storedToken);
        await fetchCurrentUser();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const receivedToken = await authService.login(credentials);
      setToken(receivedToken);
      const userData = await fetchCurrentUser();
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      // Automatically log in after registration
      return await login({ email: data.email, password: data.password });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    return await fetchCurrentUser();
  };

  const isRecruiter = user?.role === 'RECRUITER';
  const isCandidate = user?.role === 'CANDIDATE';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isRecruiter,
        isCandidate,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
