'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Key, 
  BookOpen,
  Archive,
  Users,
  GraduationCap,
  Building2,
  Phone,
  Mail
} from 'lucide-react';
import api from '@/services/api';

// Helper function to get default form data - moved outside component to prevent recreation
const getDefaultFormData = () => ({
  name: '',
  email: '',
  phone: '',
  department_id: '',
  qualification: '',
  status: 'active',
});

const AdminInstructorsPage = () => {
  const [instructors, setInstructors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningInstructor, setAssigningInstructor] = useState(null);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState(getDefaultFormData());
  const [assignmentForm, setAssignmentForm] = useState({
    course_ids: [],
    semester: 1,
    academic_year: '2026'
  });
  const [stats, setStats] = useState({});

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
    fetchInstructors();
    fetchDepartments();
    fetchCourses();
    fetchStats();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/instructors');
      setInstructors(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      showNotification('Failed to fetch instructors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      showNotification('Failed to fetch departments', 'error');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showNotification('Failed to fetch courses', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/instructors/stats/overview');
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddInstructor = async (e) => {
    e.preventDefault();
    try {
      const instructorData = {
        ...formData,
        department_id: parseInt(formData.department_id)
      };
      const response = await api.post('/instructors', instructorData);
      
      // Show success message with login credentials
      const { instructor, temporary_password, instructor_id, username } = response.data;
      alert(
        `Instructor registered successfully!\n\nInstructor Details:\nInstructor ID: ${instructor_id}\nName: ${instructor.name}\nEmail: ${instructor.email}\nPhone: ${instructor.phone || 'N/A'}\nQualification: ${instructor.qualification || 'N/A'}\n\nLogin Credentials:\nUsername: ${username}\nTemporary Password: ${temporary_password}\n\nPlease share these credentials with the instructor. They will be required to change their password on first login.`
      );
      
      setShowAddModal(false);
      setFormData(getDefaultFormData());
      fetchInstructors();
      fetchStats();
    } catch (error) {
      console.error('Error adding instructor:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add instructor';
      showNotification(errorMessage, 'error');
    }
  };

  const handleEditInstructor = async (e) => {
    e.preventDefault();
    try {
      const instructorData = {
        ...formData,
        department_id: parseInt(formData.department_id)
      };
      await api.put(`/instructors/${editingInstructor.id}`, instructorData);
      showNotification('Instructor updated successfully');
      setEditingInstructor(null);
      setFormData(getDefaultFormData());
      fetchInstructors();
    } catch (error) {
      console.error('Error updating instructor:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update instructor';
      showNotification(errorMessage, 'error');
    }
  };

  const handleToggleStatus = async (instructor, newStatus) => {
    const statusText = newStatus === 'active' ? 'activate' : 
                     newStatus === 'inactive' ? 'deactivate' : 'archive';
    
    if (window.confirm(`Are you sure you want to ${statusText} ${instructor.name}?`)) {
      try {
        await api.put(`/instructors/${instructor.id}/toggle-status`, { status: newStatus });
        showNotification(`Instructor ${statusText}d successfully`);
        fetchInstructors();
        fetchStats();
      } catch (error) {
        console.error(`Error ${statusText}ing instructor:`, error);
        showNotification(`Failed to ${statusText} instructor`, 'error');
      }
    }
  };

  const handleResetPassword = async (instructor) => {
    if (window.confirm(`Are you sure you want to reset the password for ${instructor.name}?`)) {
      try {
        const response = await api.post(`/instructors/${instructor.id}/reset-password`);
        const { new_password } = response.data;
        alert(
          `Password reset successfully!\n\nNew Login Credentials:\nUsername: ${instructor.user?.username || 'N/A'}\nNew Password: ${new_password}\n\nPlease share this with the instructor.`
        );
      } catch (error) {
        console.error('Error resetting password:', error);
        showNotification('Failed to reset password', 'error');
      }
    }
  };

  const handleAssignCourses = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/instructors/${assigningInstructor.id}/assign-courses`, assignmentForm);
      showNotification('Courses assigned successfully');
      setShowAssignModal(false);
      setAssigningInstructor(null);
      setAssignmentForm({
        course_ids: [],
        semester: 1,
        academic_year: '2026'
      });
      fetchInstructors();
    } catch (error) {
      console.error('Error assigning courses:', error);
      const errorMessage = error.response?.data?.message || 'Failed to assign courses';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteInstructor = async (instructor) => {
    if (window.confirm(`Are you sure you want to delete ${instructor.name}? This action cannot be undone.`)) {
      try {
        await api.delete(`/instructors/${instructor.id}`);
        showNotification('Instructor deleted successfully');
        fetchInstructors();
        fetchStats();
      } catch (error) {
        console.error('Error deleting instructor:', error);
        showNotification('Failed to delete instructor', 'error');
      }
    }
  };

  const openEditModal = (instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      name: instructor.name || '',
      email: instructor.email || '',
      phone: instructor.phone || '',
      department_id: instructor.department_id?.toString() || '',
      qualification: instructor.qualification || '',
      status: instructor.status || 'active',
    });
  };

  const openAssignModal = (instructor) => {
    setAssigningInstructor(instructor);
    setAssignmentForm({
      course_ids: [],
      semester: 1,
      academic_year: '2026'
    });
    setShowAssignModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingInstructor(null);
    setShowAssignModal(false);
    setAssigningInstructor(null);
    setFormData(getDefaultFormData());
  };

  // Component for status badge
  const StatusBadge = ({ status }) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'N/A'}
      </span>
    );
  };

  // Component for action buttons
  const ActionButtons = ({ instructor }) => (
    <div className="flex space-x-1">
      <Button
        size="sm"
        variant="outline"
        onClick={() => openEditModal(instructor)}
        title="Edit Instructor"
      >
        <Edit size={14} />
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={() => openAssignModal(instructor)}
        className="text-blue-600 border-blue-600 hover:bg-blue-50"
        title="Assign Courses"
      >
        <BookOpen size={14} />
      </Button>

      {instructor.status === 'active' ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleToggleStatus(instructor, 'inactive')}
          className="text-orange-600 border-orange-600 hover:bg-orange-50"
          title="Deactivate"
        >
          <UserX size={14} />
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleToggleStatus(instructor, 'active')}
          className="text-green-600 border-green-600 hover:bg-green-50"
          title="Activate"
        >
          <UserCheck size={14} />
        </Button>
      )}

      {instructor.user && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleResetPassword(instructor)}
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
          title="Reset Password"
        >
          <Key size={14} />
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={() => handleToggleStatus(instructor, 'archived')}
        className="text-gray-600 border-gray-600 hover:bg-gray-50"
        title="Archive"
      >
        <Archive size={14} />
      </Button>

      <Button
        size="sm"
        variant="danger"
        onClick={() => handleDeleteInstructor(instructor)}
        title="Delete"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = 
      instructor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.instructor_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || instructor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Instructor ID',
      accessor: 'instructor_id',
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-sm text-gray-600">{row.email}</p>
          {row.phone && <p className="text-sm text-gray-500">{row.phone}</p>}
        </div>
      ),
    },
    {
      header: 'Username',
      accessor: 'user',
      render: (value, row) => row.user?.username || 'N/A',
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (value, row) => row.department?.name || 'N/A',
    },
    {
      header: 'Qualification',
      accessor: 'qualification',
      render: (value) => value || 'N/A',
    },
    {
      header: 'Assigned Courses',
      accessor: 'courses_count',
      render: (value, row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.courses?.length || 0} courses
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value, row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => <ActionButtons instructor={row} />,
    },
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Instructor Management</h1>
              <p className="text-gray-600">Manage instructor accounts and assignments</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={20} className="mr-2" />
              Add Instructor
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Instructors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_instructors || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-green-500 p-3 rounded-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active_instructors || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">With Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.instructors_with_courses || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-orange-500 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recent_registrations || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name, ID, or email..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <Table
              columns={columns}
              data={filteredInstructors}
              loading={loading}
            />
          </div>

          {/* Add/Edit Instructor Modal */}
          <Modal
            isOpen={showAddModal || editingInstructor}
            onClose={closeModal}
            title={editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
          >
            <form onSubmit={editingInstructor ? handleEditInstructor : handleAddInstructor}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251-xxx-xxx-xxx"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      name="department_id"
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification
                  </label>
                  <textarea
                    name="qualification"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="e.g., PhD in Computer Science, MSc in Information Technology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingInstructor ? 'Update' : 'Register'} Instructor
                </Button>
              </div>
            </form>
          </Modal>

          {/* Assign Courses Modal */}
          <Modal
            isOpen={showAssignModal}
            onClose={closeModal}
            title={`Assign Courses - ${assigningInstructor?.name}`}
          >
            <form onSubmit={handleAssignCourses}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <select
                      value={assignmentForm.semester}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, semester: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value={1}>1st Semester</option>
                      <option value={2}>2nd Semester</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={assignmentForm.academic_year}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, academic_year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2026"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Courses
                  </label>
                  <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {courses
                      .filter(course => course.department_id === assigningInstructor?.department_id)
                      .map((course) => (
                      <label key={course.id} className="flex items-center space-x-3 py-2">
                        <input
                          type="checkbox"
                          checked={assignmentForm.course_ids.includes(course.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignmentForm({
                                ...assignmentForm,
                                course_ids: [...assignmentForm.course_ids, course.id]
                              });
                            } else {
                              setAssignmentForm({
                                ...assignmentForm,
                                course_ids: assignmentForm.course_ids.filter(id => id !== course.id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{course.title}</p>
                          <p className="text-sm text-gray-600">{course.code}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  Assign Courses
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminInstructorsPage;