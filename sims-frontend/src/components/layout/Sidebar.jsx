'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Building,
  BarChart3,
  Settings,
  Calendar,
  ClipboardList,
  UserCheck,
  FileText,
  Key,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  const menuItems = {
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
      { name: 'Students', href: '/admin/students', icon: Users },
      { name: 'Instructors', href: '/admin/instructors', icon: GraduationCap },
      { name: 'Departments', href: '/admin/departments', icon: Building },
      { name: 'Courses', href: '/admin/courses', icon: BookOpen },
      { name: 'Grade Finalization', href: '/admin/grades', icon: FileText },
      { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
      { name: 'Change Password', href: '/change-password', icon: Key },
    ],
    department: [
      { name: 'Dashboard', href: '/department/dashboard', icon: Home },
      { name: 'Courses', href: '/department/courses', icon: BookOpen },
      { name: 'Assign Instructor', href: '/department/assign-instructor', icon: UserCheck },
      { name: 'Enrollments', href: '/department/enrollments', icon: ClipboardList },
      { name: 'Grade Approval', href: '/department/grades', icon: FileText },
      { name: 'Progress', href: '/department/progress', icon: BarChart3 },
      { name: 'Change Password', href: '/change-password', icon: Key },
    ],
    instructor: [
      { name: 'Dashboard', href: '/instructor/dashboard', icon: Home },
      { name: 'My Courses', href: '/instructor/courses', icon: BookOpen },
      { name: 'Grades', href: '/instructor/grades', icon: FileText },
      { name: 'Attendance', href: '/instructor/attendance', icon: UserCheck },
      { name: 'Change Password', href: '/change-password', icon: Key },
    ],
    student: [
      { name: 'Dashboard', href: '/student/dashboard', icon: Home },
      { name: 'Courses', href: '/student/courses', icon: BookOpen },
      { name: 'Schedule', href: '/student/schedule', icon: Calendar },
      { name: 'Attendance', href: '/student/attendance', icon: UserCheck },
      { name: 'Grades', href: '/student/grades', icon: FileText },
      { name: 'Profile', href: '/student/profile', icon: Users },
      { name: 'Change Password', href: '/change-password', icon: Key },
    ],
  };

  const currentMenuItems = menuItems[user?.role] || [];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-6">
          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Panel
        </h2>
        
        <nav className="space-y-2">
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;