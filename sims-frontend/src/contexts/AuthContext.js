'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      const response = await authService.login(username, password);
      const { user: userData, is_first_login } = response;
      
      // Add first login status to user data
      const userWithFirstLogin = {
        ...userData,
        is_first_login: is_first_login || userData.is_first_login
      };
      
      setUser(userWithFirstLogin);
      console.log('Login successful!');
      return userWithFirstLogin;
    } catch (error) {
      console.error('Login failed:', error);
      // Throw the error with a proper message
      const errorMessage = error.message || 'Invalid credentials. Please try again.';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check if user is logged in on app start
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getUser();
          if (userData) {
            setUser(userData);
          } else {
            // Fetch user data from API
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth data
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [mounted]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    // This effect was moved from the departments page - removing it as it's not needed here
  }, []);

  const value = React.useMemo(() => ({
    user,
    login,
    logout,
    loading: loading || !mounted,
    isAuthenticated: !!user,
  }), [user, login, logout, loading, mounted]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <AuthContext.Provider value={{
        user: null,
        login: async () => {},
        logout: async () => {},
        loading: true,
        isAuthenticated: false,
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};