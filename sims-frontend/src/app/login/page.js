'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { GraduationCap } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      const dashboardRoutes = {
        admin: '/admin/dashboard',
        department: '/department/dashboard',
        instructor: '/instructor/dashboard',
        student: '/student/dashboard',
      };
      
      const userDashboard = dashboardRoutes[user.role];
      if (userDashboard) {
        router.push(userDashboard);
      }
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userData = await login(formData.username, formData.password);
      
      // Check if user needs to change password on first login
      if (userData.is_first_login) {
        router.push('/change-password');
        return;
      }
      
      // Redirect based on user role
      const dashboardRoutes = {
        admin: '/admin/dashboard',
        department: '/department/dashboard',
        instructor: '/instructor/dashboard',
        student: '/student/dashboard',
      };
      
      const userDashboard = dashboardRoutes[userData.role];
      if (userDashboard) {
        router.push(userDashboard);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Show error message to user
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to MWU SIMS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Madda Walabu University - Computing College
          </p>
          <p className="text-center text-xs text-gray-500">
            Student Information Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              required
              placeholder="Enter your username"
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              placeholder="Enter your password"
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;