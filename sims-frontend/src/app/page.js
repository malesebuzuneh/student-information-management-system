'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      // User is authenticated, redirect to appropriate dashboard
      try {
        const userData = JSON.parse(storedUser);
        const dashboardRoutes = {
          admin: '/admin/dashboard',
          department: '/department/dashboard',
          instructor: '/instructor/dashboard', 
          student: '/student/dashboard',
        };
        
        const userDashboard = dashboardRoutes[userData.role];
        if (userDashboard) {
          router.replace(userDashboard);
          return;
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    
    // Default: redirect to login
    router.replace('/login');
  }, [router]);

  // Minimal loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900">MWU SIMS</h1>
          <p className="text-sm text-gray-600">Madda Walabu University</p>
        </div>
      </div>
    </div>
  );
}