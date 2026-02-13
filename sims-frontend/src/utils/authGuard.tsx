'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';

interface UseAuthGuardReturn {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuthGuard = (allowedRoles: User['role'][] = []): UseAuthGuardReturn => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user role
      const dashboardRoutes: Record<User['role'], string> = {
        admin: '/admin/dashboard',
        department: '/department/dashboard',
        instructor: '/instructor/dashboard',
        student: '/student/dashboard',
      };
      
      const userDashboard = dashboardRoutes[user.role];
      if (userDashboard) {
        router.push(userDashboard);
      } else {
        router.push('/login');
      }
      return;
    }
  }, [user, isAuthenticated, loading, allowedRoles, router, mounted]);

  return { user, isAuthenticated, loading: loading || !mounted };
};

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: User['role'][];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const { user, isAuthenticated, loading } = useAuthGuard(allowedRoles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null; // Will redirect to appropriate dashboard
  }

  return <>{children}</>;
};