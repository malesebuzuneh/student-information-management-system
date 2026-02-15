'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import { ArrowLeft, Users, Mail, Phone, User, BookOpen, Calendar } from 'lucide-react';
import api from '@/services/api';

const CourseStudents = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId;
  
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseStudents();
    }
  }, [courseId]);

  const fetchCourseStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/instructor/courses/${courseId}/students`);
      setCourse(response.data.course);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching course students:', error);
      setError('Failed to load course students');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Student ID',
      accessor: 'student_id',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (value) => value || 'N/A'
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Mail className="h-4 w-4 text-gray-500" />
          <span>{value || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Phone className="h-4 w-4 text-gray-500" />
          <span>{value || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (value, row) => row.department?.name || 'N/A'
    },
    {
      header: 'Status',
      accessor: 'pivot',
      render: (value) => {
        const status = value?.status || 'enrolled';
        const statusColors = {
          'approved': 'bg-green-100 text-green-800',
          'enrolled': 'bg-blue-100 text-blue-800',
          'pending': 'bg-yellow-100 text-yellow-800',
          'rejected': 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      header: 'Enrolled Date',
      accessor: 'pivot',
      render: (value) => {
        const date = value?.created_at;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      }
    }
  ];

  const handleBack = () => {
    router.push('/instructor/courses');
  };

  const handleViewGrades = () => {
    router.push(`/instructor/grades?course=${courseId}`);
  };

  const handleViewAttendance = () => {
    router.push(`/instructor/attendance?course=${courseId}`);
  };

  return (
    <ProtectedRoute allowedRoles={['instructor']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Courses</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {course ? `${course.code} - ${course.title}` : 'Course Students'}
                </h1>
                <p className="text-gray-600">
                  {course ? `${course.department?.name} Department` : 'Loading...'}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleViewGrades}
                className="flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Manage Grades</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleViewAttendance}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Manage Attendance</span>
              </Button>
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
          ) : (
            <>
              {/* Course Info Card */}
              {course && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="flex items-center">
                      <div className="bg-blue-500 rounded-lg p-3">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Course Code</p>
                        <p className="text-lg font-bold text-gray-900">{course.code}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-green-500 rounded-lg p-3">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Enrolled Students</p>
                        <p className="text-lg font-bold text-gray-900">{students.length}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-purple-500 rounded-lg p-3">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Credits</p>
                        <p className="text-lg font-bold text-gray-900">{course.credits || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-orange-500 rounded-lg p-3">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Department</p>
                        <p className="text-lg font-bold text-gray-900">{course.department?.code || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Students Table */}
              {students.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
                  <p className="text-gray-600">This course doesn't have any enrolled students yet.</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Enrolled Students ({students.length})
                    </h3>
                  </div>
                  <Table
                    data={students}
                    columns={columns}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CourseStudents;