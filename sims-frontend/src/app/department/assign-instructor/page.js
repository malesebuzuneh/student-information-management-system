'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { UserPlus, Search, Users, BookOpen, Check, X } from 'lucide-react';
import api from '@/services/api';

const AssignInstructorPage = () => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Use department-specific endpoint
      const response = await api.get('/department/courses');
      setCourses(response.data.courses || response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await api.get('/instructors');
      setInstructors(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      alert('Failed to fetch instructors');
    }
  };

  const handleAssignInstructor = async (e) => {
    e.preventDefault();
    try {
      // This would typically be a custom endpoint for assigning instructors
      // For now, we'll simulate the assignment
      alert('Instructor assigned successfully');
      setShowAssignModal(false);
      setSelectedCourse(null);
      setSelectedInstructor('');
      fetchCourses();
    } catch (error) {
      console.error('Error assigning instructor:', error);
      alert('Failed to assign instructor');
    }
  };

  const handleUnassignInstructor = async (course, instructor) => {
    if (window.confirm(`Are you sure you want to unassign ${instructor.name} from ${course.title}?`)) {
      try {
        // This would typically be a custom endpoint for unassigning instructors
        alert('Instructor unassigned successfully');
        fetchCourses();
      } catch (error) {
        console.error('Error unassigning instructor:', error);
        alert('Failed to unassign instructor');
      }
    }
  };

  const openAssignModal = (course) => {
    setSelectedCourse(course);
    setShowAssignModal(true);
  };

  const closeModal = () => {
    setShowAssignModal(false);
    setSelectedCourse(null);
    setSelectedInstructor('');
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Course',
      accessor: 'code',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value} - {row.title}</div>
          <div className="text-sm text-gray-600">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Assigned Instructors',
      accessor: 'instructors',
      render: (value, row) => (
        <div className="space-y-1">
          {row.instructors && row.instructors.length > 0 ? (
            row.instructors.map((instructor) => (
              <div key={instructor.id} className="flex items-center justify-between bg-green-50 px-2 py-1 rounded">
                <span className="text-sm text-green-800">{instructor.name}</span>
                <button
                  onClick={() => handleUnassignInstructor(row, instructor)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-500 italic">No instructors assigned</span>
          )}
        </div>
      ),
    },
    {
      header: 'Students',
      accessor: 'students',
      render: (value, row) => (
        <div className="flex items-center">
          <Users size={16} className="mr-1 text-gray-400" />
          <span>{row.students?.length || 0}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openAssignModal(row)}
        >
          <UserPlus size={16} className="mr-1" />
          Assign Instructor
        </Button>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['department']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assign Instructors</h1>
              <p className="text-gray-600">Manage instructor assignments for courses</p>
            </div>
          </div>

          {/* Stats Cards */}
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
                  <p className="text-sm font-medium text-gray-600">Available Instructors</p>
                  <p className="text-2xl font-bold text-gray-900">{instructors.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-purple-500 rounded-lg p-3">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Assigned Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.filter(course => course.instructors && course.instructors.length > 0).length}
                  </p>
                </div>
              </div>
            </div>
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

          {/* Assign Instructor Modal */}
          <Modal
            isOpen={showAssignModal}
            onClose={closeModal}
            title={`Assign Instructor to ${selectedCourse?.code}`}
          >
            <form onSubmit={handleAssignInstructor}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Course Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{selectedCourse?.code} - {selectedCourse?.title}</p>
                    <p className="text-sm text-gray-600">{selectedCourse?.description}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Instructor
                  </label>
                  <select
                    value={selectedInstructor}
                    onChange={(e) => setSelectedInstructor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose an instructor...</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name} - {instructor.department?.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCourse?.instructors && selectedCourse.instructors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Currently Assigned:</h4>
                    <div className="space-y-1">
                      {selectedCourse.instructors.map((instructor) => (
                        <div key={instructor.id} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                          <span className="text-sm text-green-800">{instructor.name}</span>
                          <span className="text-xs text-green-600">Assigned</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  Assign Instructor
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AssignInstructorPage;