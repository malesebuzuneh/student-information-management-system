'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      const response = await authService.login(username, password);
      const { user: userData, is_first_login } = response;
      
      // Add first login status to user data
      const userWithFirstLogin: User = {
        ...userData,
        is_first_login: is_first_login || userData.is_first_login
      };
      
      setUser(userWithFirstLogin);
      console.log('Login successful!');
      return userWithFirstLogin;
    } catch (error) {
      console.error('Login failed:', error);
      // Throw the error with a proper message
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials. Please try again.';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
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
    const initAuth = async (): Promise<void> => {
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

  const value = React.useMemo<AuthContextType>(() => ({
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
        login: async () => ({} as User),
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