'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Search, Users, BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import api from '@/services/api';

const DepartmentCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    credits: '',
    semester: '',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/department/courses');
      setCourses(response.data.courses || response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/department/courses', formData);
      alert('Course created successfully');
      setShowModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      alert(error.response?.data?.message || 'Failed to create course');
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/courses/${editingCourse.id}`, formData);
      alert('Course updated successfully');
      setShowModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      alert(error.response?.data?.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!confirm(`Are you sure you want to delete ${course.title}?`)) return;
    
    try {
      await api.delete(`/courses/${course.id}`);
      alert('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      title: course.title,
      description: course.description || '',
      credits: course.credits || '',
      semester: course.semester || '',
      year: course.year || new Date().getFullYear()
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingCourse(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      credits: '',
      semester: '',
      year: new Date().getFullYear()
    });
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Code',
      accessor: 'code',
      render: (value) => (
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
      header: 'Credits',
      accessor: 'credits',
      render: (value) => value || 'N/A',
    },
    {
      header: 'Instructors',
      accessor: 'instructors',
      render: (value) => (
        <div className="flex items-center">
          <Users size={16} className="mr-1 text-gray-400" />
          <span>{value?.length || 0}</span>
        </div>
      ),
    },
    {
      header: 'Students',
      accessor: 'students',
      render: (value) => (
        <div className="flex items-center">
          <BookOpen size={16} className="mr-1 text-gray-400" />
          <span>{value?.length || 0}</span>
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
            onClick={() => openEditModal(row)}
          >
            <Edit size={16} />
          </Button>
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
            Enrollments
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteCourse(row)}
          >
            <Trash2 size={16} />
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
              <p className="text-gray-600">Create and manage courses in your department</p>
            </div>
            <Button onClick={openAddModal}>
              <Plus size={20} className="mr-2" />
              Add Course
            </Button>
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

          {/* Course Modal */}
          <Modal
            isOpen={showModal}
            onClose={closeModal}
            title={editingCourse ? 'Edit Course' : 'Add New Course'}
          >
            <form onSubmit={editingCourse ? handleEditCourse : handleAddCourse} className="space-y-4">
              <Input
                label="Course Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="e.g., CS101"
              />
              <Input
                label="Course Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Introduction to Programming"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Course description..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                  placeholder="3"
                />
                <Input
                  label="Semester"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="Fall"
                />
                <Input
                  label="Year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DepartmentCoursesPage;