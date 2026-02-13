'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Users, BookOpen } from 'lucide-react';
import api from '@/services/api';

const DepartmentCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Use department-specific endpoint instead of general /courses
      const response = await api.get('/department/courses');
      setCourses(response.data.courses || response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  // Remove course creation/editing - department heads can only view courses
  // const handleAddCourse = async (e) => { ... } - REMOVED
  // const handleEditCourse = async (e) => { ... } - REMOVED

  // Remove course deletion - department heads cannot delete courses
  // const handleDeleteCourse = async (course) => { ... } - REMOVED

  // Remove modal-related functions - department heads can only view courses
  // const openEditModal = (course) => { ... } - REMOVED
  // const closeModal = () => { ... } - REMOVED

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Code',
      accessor: 'code',
      render: (value, row) => (
        <span className="font-mono font-medium text-blue-600">{value}</span>
      ),
    },
    {
      header: 'Title',
      accessor: 'title',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department_id',
      render: (value, row) => row.department?.name || 'N/A',
    },
    {
      header: 'Instructors',
      accessor: 'instructors',
      render: (value, row) => (
        <div className="flex items-center">
          <Users size={16} className="mr-1 text-gray-400" />
          <span>{row.instructors?.length || 0}</span>
        </div>
      ),
    },
    {
      header: 'Students',
      accessor: 'students',
      render: (value, row) => (
        <div className="flex items-center">
          <BookOpen size={16} className="mr-1 text-gray-400" />
          <span>{row.students?.length || 0}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = `/department/assign-instructor?course=${row.id}`}
          >
            Assign Instructor
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = `/department/enrollments?course=${row.id}`}
          >
            Manage Enrollments
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['department']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Department Courses</h1>
              <p className="text-gray-600">View and manage courses in your department</p>
              <p className="text-sm text-orange-600 mt-1">
                Note: Only admin can create courses. You can assign instructors to existing courses.
              </p>
            </div>
            {/* Removed Add Course button - only admin can create courses */}
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Table
              columns={columns}
              data={filteredCourses}
              loading={loading}
            />
          </div>

          {/* Course creation modal removed - only admin can create courses */}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DepartmentCoursesPage;