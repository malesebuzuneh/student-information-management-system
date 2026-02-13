import api from './api';

export const authService = {
  // Login user
  async login(username, password) {
    try {
      const response = await api.post('/login', { username, password });
      const { token, user } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  async logout() {
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
  async getCurrentUser() {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },

  // Get stored user
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('auth_token');
  }
};