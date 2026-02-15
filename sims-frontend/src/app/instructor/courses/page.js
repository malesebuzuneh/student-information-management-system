'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import { BookOpen, Users, Calendar, Clock, Eye, UserCheck, BarChart3, ClipboardList } from 'lucide-react';
import api from '@/services/api';

const InstructorCourses = () => {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/instructor/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Course Code',
      accessor: 'code',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      header: 'Course Name',
      accessor: 'title',
      render: (value) => value || 'N/A'
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (value, row) => row.department?.name || 'N/A'
    },
    {
      header: 'Students',
      accessor: 'students_count',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-500" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      header: 'Credits',
      accessor: 'credits',
      render: (value) => value || 'N/A'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewStudents(row.id)}
            className="flex items-center space-x-1"
          >
            <Users className="h-4 w-4" />
            <span>Students</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManageGrades(row.id)}
            className="flex items-center space-x-1"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Grades</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManageAttendance(row.id)}
            className="flex items-center space-x-1"
          >
            <ClipboardList className="h-4 w-4" />
            <span>Attendance</span>
          </Button>
        </div>
      )
    }
  ];

  const handleViewStudents = (courseId) => {
    // Navigate to course students page
    router.push(`/instructor/courses/${courseId}/students`);
  };

  const handleManageGrades = (courseId) => {
    // Navigate to grades management page
    router.push(`/instructor/grades?course=${courseId}`);
  };

  const handleManageAttendance = (courseId) => {
    // Navigate to attendance management page
    router.push(`/instructor/attendance?course=${courseId}`);
  };

  return (
    <ProtectedRoute allowedRoles={['instructor']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600">Manage your assigned courses</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-red-600">{error}</div>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Assigned</h3>
              <p className="text-gray-600">You don't have any courses assigned yet.</p>
              <p className="text-sm text-gray-500 mt-2">Contact your department head for course assignments.</p>
            </div>
          ) : (
            <>
              {/* Course Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-500 rounded-lg p-3">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Courses</p>
                      <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-green-500 rounded-lg p-3">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {courses.reduce((sum, course) => sum + (course.students_count || 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-purple-500 rounded-lg p-3">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Credits</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {courses.reduce((sum, course) => sum + (course.credits || 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Courses Table */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Course List</h3>
                </div>
                <Table
                  data={courses}
                  columns={columns}
                />
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default InstructorCourses;