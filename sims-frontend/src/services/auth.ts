import api from './api';
import { LoginResponse, User, LoginCredentials } from '@/types';

interface AuthService {
  login(username: string, password: string): Promise<LoginResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  isAuthenticated(): boolean;
  getUser(): User | null;
  getToken(): string | null;
}

export const authService: AuthService = {
  // Login user
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const credentials: LoginCredentials = { username, password };
      const response = await api.post<LoginResponse>('/login', credentials);
      const { token, user } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/profile');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  // Get stored user
  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
};