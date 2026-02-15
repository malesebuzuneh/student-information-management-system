'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  const [notification, setNotification] = useState(null);

  // Memoized functions to prevent unnecessary re-renders
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/department/courses');
      const coursesData = response.data.courses || response.data || [];
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      setNotification({ message: 'Failed to fetch courses', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInstructors = useCallback(async () => {
    try {
      const response = await api.get('/department/instructors');
      const instructorsData = response.data.instructors || response.data || [];
      setInstructors(Array.isArray(instructorsData) ? instructorsData : []);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setInstructors([]);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, [fetchCourses, fetchInstructors]);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAssignInstructor = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedInstructor) return;

    try {
      await api.post(`/courses/${selectedCourse.id}/assign-instructor`, {
        instructor_id: parseInt(selectedInstructor)
      });
      setNotification({ message: 'Instructor assigned successfully', type: 'success' });
      closeModal();
      fetchCourses();
    } catch (error) {
      console.error('Error assigning instructor:', error);
      setNotification({ 
        message: error.response?.data?.message || 'Failed to assign instructor', 
        type: 'error' 
      });
    }
  };

  const handleUnassignInstructor = async (course, instructor) => {
    if (!course || !instructor) return;
    
    if (window.confirm(`Are you sure you want to unassign ${instructor.name} from ${course.title}?`)) {
      try {
        await api.delete(`/courses/${course.id}/instructors/${instructor.id}`);
        setNotification({ message: 'Instructor unassigned successfully', type: 'success' });
        fetchCourses();
      } catch (error) {
        console.error('Error unassigning instructor:', error);
        setNotification({ 
          message: error.response?.data?.message || 'Failed to unassign instructor', 
          type: 'error' 
        });
      }
    }
  };

  const openAssignModal = (course) => {
    if (!course) return;
    setSelectedCourse(course);
    setSelectedInstructor('');
    setShowAssignModal(true);
  };

  const closeModal = () => {
    setShowAssignModal(false);
    setSelectedCourse(null);
    setSelectedInstructor('');
  };

  // Memoized filtered courses to prevent unnecessary recalculations
  const filteredCourses = React.useMemo(() => {
    if (!Array.isArray(courses)) return [];
    return courses.filter(course =>
      course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course?.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  const columns = React.useMemo(() => [
    {
      header: 'Course',
      accessor: 'code',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value || 'N/A'} - {row?.title || 'N/A'}</div>
          <div className="text-sm text-gray-600">{row?.description || 'No description'}</div>
        </div>
      ),
    },
    {
      header: 'Assigned Instructors',
      accessor: 'instructors',
      render: (value, row) => (
        <div className="space-y-1">
          {row?.instructors && Array.isArray(row.instructors) && row.instructors.length > 0 ? (
            row.instructors.map((instructor) => (
              <div key={instructor?.id || Math.random()} className="flex items-center justify-between bg-green-50 px-2 py-1 rounded">
                <span className="text-sm text-green-800">{instructor?.name || 'Unknown'}</span>
                <button
                  onClick={() => handleUnassignInstructor(row, instructor)}
                  className="text-red-600 hover:text-red-800"
                  type="button"
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
          <span>{row?.students?.length || 0}</span>
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
          type="button"
        >
          <UserPlus size={16} className="mr-1" />
          Assign Instructor
        </Button>
      ),
    },
  ], []);

  // Calculate stats safely
  const totalCourses = Array.isArray(courses) ? courses.length : 0;
  const availableInstructors = Array.isArray(instructors) ? instructors.length : 0;
  const assignedCourses = Array.isArray(courses) 
    ? courses.filter(course => course?.instructors && Array.isArray(course.instructors) && course.instructors.length > 0).length 
    : 0;

  return (
    <ProtectedRoute allowedRoles={['department']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              notification.type === 'error' 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {notification.message}
            </div>
          )}

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
                  <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{availableInstructors}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{assignedCourses}</p>
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
          {showAssignModal && selectedCourse && (
            <Modal
              isOpen={showAssignModal}
              onClose={closeModal}
              title={`Assign Instructor to ${selectedCourse?.code || 'Course'}`}
            >
              <form onSubmit={handleAssignInstructor}>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Course Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{selectedCourse?.code || 'N/A'} - {selectedCourse?.title || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{selectedCourse?.description || 'No description'}</p>
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
                      {Array.isArray(instructors) && instructors.map((instructor) => (
                        <option key={instructor?.id || Math.random()} value={instructor?.id || ''}>
                          {instructor?.name || 'Unknown'} - {instructor?.department?.name || 'No Department'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCourse?.instructors && Array.isArray(selectedCourse.instructors) && selectedCourse.instructors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Currently Assigned:</h4>
                      <div className="space-y-1">
                        {selectedCourse.instructors.map((instructor) => (
                          <div key={instructor?.id || Math.random()} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                            <span className="text-sm text-green-800">{instructor?.name || 'Unknown'}</span>
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
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AssignInstructorPage;