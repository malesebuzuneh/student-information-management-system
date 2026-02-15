'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const isFirstLogin = user?.is_first_login;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.new_password !== formData.new_password_confirmation) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      let response;
      
      if (isFirstLogin && user.role === 'student') {
        // Use the existing first login endpoint for students
        response = await api.post('/students/change-first-login-password', {
          current_password: formData.current_password,
          new_password: formData.new_password,
          new_password_confirmation: formData.new_password_confirmation,
        });
      } else {
        // Use the general change password endpoint for all users
        response = await api.post('/change-password', {
          current_password: formData.current_password,
          new_password: formData.new_password,
          new_password_confirmation: formData.new_password_confirmation,
        });
      }

      setSuccess('Password changed successfully! Redirecting...');
      
      // Wait a moment then redirect to dashboard
      setTimeout(() => {
        const dashboardRoutes = {
          admin: '/admin/dashboard',
          student: '/student/dashboard',
          instructor: '/instructor/dashboard',
          department: '/department/dashboard',
        };
        router.push(dashboardRoutes[user.role] || '/');
      }, 2000);

    } catch (error) {
      console.error('Password change error:', error);
      setError(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isFirstLogin) {
      // For first login, they must change password
      return;
    }
    
    // For regular password change, go back to dashboard
    const dashboardRoutes = {
      admin: '/admin/dashboard',
      student: '/student/dashboard',
      instructor: '/instructor/dashboard',
      department: '/department/dashboard',
    };
    router.push(dashboardRoutes[user?.role] || '/');
  };

  // If this is a first login, show the standalone page
  if (isFirstLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Change Your Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              For security reasons, you must change your password before continuing.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Welcome, {user?.name}!
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Username: {user?.username}</p>
                    <p>Role: {user?.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Current Password"
                name="current_password"
                type="password"
                value={formData.current_password}
                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                required
                placeholder="Enter your current password"
              />

              <Input
                label="New Password"
                name="new_password"
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                required
                placeholder="Enter your new password (min 8 characters)"
              />

              <Input
                label="Confirm New Password"
                name="new_password_confirmation"
                type="password"
                value={formData.new_password_confirmation}
                onChange={(e) => setFormData({ ...formData, new_password_confirmation: e.target.value })}
                required
                placeholder="Confirm your new password"
              />

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Password Requirements
                  </span>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <ul className="list-disc list-inside space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Must be different from your current password</li>
                  <li>Choose a strong, unique password</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For regular password change, show within dashboard layout
  return (
    <ProtectedRoute allowedRoles={['admin', 'student', 'instructor', 'department']}>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
              <p className="text-gray-600">Update your account password</p>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Current Password"
                  name="current_password"
                  type="password"
                  value={formData.current_password}
                  onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                  required
                  placeholder="Enter your current password"
                />

                <Input
                  label="New Password"
                  name="new_password"
                  type="password"
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  required
                  placeholder="Enter your new password (min 8 characters)"
                />

                <Input
                  label="Confirm New Password"
                  name="new_password_confirmation"
                  type="password"
                  value={formData.new_password_confirmation}
                  onChange={(e) => setFormData({ ...formData, new_password_confirmation: e.target.value })}
                  required
                  placeholder="Confirm your new password"
                />

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Password Requirements</h3>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Must be different from your current password</li>
                  <li>Choose a strong, unique password</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ChangePasswordPage;