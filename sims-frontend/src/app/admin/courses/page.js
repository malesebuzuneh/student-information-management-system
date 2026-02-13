'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import api from '@/services/api';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    department_id: '',
  });

  // Simple notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('Fetching courses...');
      const response = await api.get('/courses');
      console.log('Courses response:', response.data);
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showNotification('Failed to fetch courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      const response = await api.get('/departments');
      console.log('Departments response:', response.data);
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      showNotification('Failed to fetch departments', 'error');
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    
    if (submitting) {
      console.log('Already submitting, ignoring duplicate submission');
      return;
    }
    
    setSubmitting(true);
    
    try {
      console.log('Submitting course form...');
      console.log('Form data:', formData);
      
      // Validate form data
      if (!formData.code || !formData.title || !formData.department_id) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      const courseData = {
        code: formData.code.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        department_id: parseInt(formData.department_id)
      };
      
      console.log('Sending course data:', courseData);
      
      const response = await api.post('/courses', courseData);
      console.log('Course creation response:', response.data);
      
      showNotification('Course added successfully');
      setShowAddModal(false);
      setFormData({ code: '', title: '', description: '', department_id: '' });
      await fetchCourses(); // Refresh the list
      
    } catch (error) {
      console.error('Error adding course:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to add course';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = errors.join(', ');
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    setSubmitting(true);
    
    try {
      console.log('Updating course...', editingCourse.id);
      console.log('Update data:', formData);
      
      const courseData = {
        code: formData.code.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        department_id: parseInt(formData.department_id)
      };
      
      const response = await api.put(`/courses/${editingCourse.id}`, courseData);
      console.log('Course update response:', response.data);
      
      showNotification('Course updated successfully');
      setEditingCourse(null);
      setFormData({ code: '', title: '', description: '', department_id: '' });
      await fetchCourses();
      
    } catch (error) {
      console.error('Error updating course:', error);
      
      let errorMessage = 'Failed to update course';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = errors.join(', ');
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        console.log('Deleting course:', course.id);
        await api.delete(`/courses/${course.id}`);
        showNotification('Course deleted successfully');
        await fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        showNotification('Failed to delete course', 'error');
      }
    }
  };

  const openEditModal = (course) => {
    console.log('Opening edit modal for course:', course);
    setEditingCourse(course);
    setFormData({
      code: course.code || '',
      title: course.title || '',
      description: course.description || '',
      department_id: course.department_id?.toString() || '',
    });
  };

  const closeModal = () => {
    console.log('Closing modal');
    setShowAddModal(false);
    setEditingCourse(null);
    setFormData({ code: '', title: '', description: '', department_id: '' });
    setSubmitting(false);
  };

  const filteredCourses = courses.filter(course =>
    course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.title?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="text-sm text-gray-600 truncate max-w-xs" title={row.description}>
            {row.description}
          </div>
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
        <span className="text-sm text-gray-600">
          {row.instructors?.length || 0} assigned
        </span>
      ),
    },
    {
      header: 'Students',
      accessor: 'students',
      render: (value, row) => (
        <span className="text-sm text-gray-600">
          {row.students?.length || 0} enrolled
        </span>
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
            variant="danger"
            onClick={() => handleDeleteCourse(row)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  console.log('Rendering CoursesPage', { 
    coursesCount: courses.length, 
    departmentsCount: departments.length, 
    loading, 
    submitting,
    showAddModal,
    editingCourse: !!editingCourse 
  });

  return (
    <ProtectedRoute allowedRoles={['admin']}>
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
              <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
              <p className="text-gray-600">Manage course catalog</p>
            </div>
            <Button 
              onClick={() => {
                console.log('Add Course button clicked - opening modal');
                setShowAddModal(true);
              }}
              disabled={submitting}
            >
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

          {/* Add/Edit Course Modal - Fixed Version */}
          {(showAddModal || editingCourse) && (
            <Modal
              isOpen={showAddModal || !!editingCourse}
              onClose={closeModal}
              title={editingCourse ? 'Edit Course' : 'Add New Course'}
              size="lg"
            >
              <form onSubmit={editingCourse ? handleEditCourse : handleAddCourse}>
                <div className="space-y-4">
                  <Input
                    label="Course Code"
                    name="code"
                    value={formData.code}
                    onChange={(e) => {
                      console.log('Code changed:', e.target.value);
                      setFormData({ ...formData, code: e.target.value });
                    }}
                    placeholder="e.g., CS101"
                    required
                    disabled={submitting}
                  />
                  <Input
                    label="Course Title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => {
                      console.log('Title changed:', e.target.value);
                      setFormData({ ...formData, title: e.target.value });
                    }}
                    placeholder="e.g., Introduction to Programming"
                    required
                    disabled={submitting}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={(e) => {
                        console.log('Description changed:', e.target.value);
                        setFormData({ ...formData, description: e.target.value });
                      }}
                      placeholder="Course description..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department_id"
                      value={formData.department_id}
                      onChange={(e) => {
                        console.log('Department changed:', e.target.value);
                        setFormData({ ...formData, department_id: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={submitting}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {departments.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">Loading departments...</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={submitting}
                    loading={submitting}
                  >
                    {submitting ? 'Saving...' : (editingCourse ? 'Update' : 'Add')} Course
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

export default CoursesPage;