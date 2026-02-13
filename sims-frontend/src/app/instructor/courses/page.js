'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import { BookOpen, Users, Calendar, Clock } from 'lucide-react';

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API call
    setTimeout(() => {
      setCourses([
        {
          id: 1,
          code: 'CS101',
          name: 'Introduction to Programming',
          department: 'Computer Science',
          students: 25,
          schedule: 'Mon, Wed, Fri 10:00 AM',
          semester: 'Spring 2026',
          status: 'Active'
        },
        {
          id: 2,
          code: 'CS201',
          name: 'Data Structures',
          department: 'Computer Science',
          students: 20,
          schedule: 'Tue, Thu 2:00 PM',
          semester: 'Spring 2026',
          status: 'Active'
        },
        {
          id: 3,
          code: 'CS301',
          name: 'Database Systems',
          department: 'Computer Science',
          students: 18,
          schedule: 'Mon, Wed 3:00 PM',
          semester: 'Spring 2026',
          status: 'Active'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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
      accessor: 'name'
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Students',
      accessor: 'students',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      )
    },
    {
      header: 'Schedule',
      accessor: 'schedule',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewCourse(row.id)}
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManageStudents(row.id)}
          >
            Manage Students
          </Button>
        </div>
      )
    }
  ];

  const handleViewCourse = (courseId) => {
    // Handle view course details
    console.log('View course:', courseId);
  };

  const handleManageStudents = (courseId) => {
    // Handle manage students
    console.log('Manage students for course:', courseId);
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
                        {courses.reduce((sum, course) => sum + course.students, 0)}
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
                      <p className="text-sm font-medium text-gray-600">Active Semester</p>
                      <p className="text-2xl font-bold text-gray-900">Spring 2026</p>
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