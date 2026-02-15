'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ClientOnly from '@/components/ClientOnly';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building, 
  Users, 
  GraduationCap, 
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  BarChart3,
  Settings
} from 'lucide-react';
import api from '@/services/api';

// Helper function to get default form data - moved outside component to prevent recreation
const getDefaultFormData = () => ({
  name: '',
  code: '',
});

const AdminDepartmentsPage = () => {
  // All state declarations at the top, in consistent order
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [showAssignHeadModal, setShowAssignHeadModal] = useState(false);
  const [assigningDepartment, setAssigningDepartment] = useState(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [performanceDepartment, setPerformanceDepartment] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState(() => getDefaultFormData());
  const [selectedHeadId, setSelectedHeadId] = useState('');
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
    fetchDepartments();
    fetchInstructors();
    fetchStats();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments');
      const departmentsData = response.data.data || response.data || [];
      setDepartments(departmentsData);
      
      // Also refresh stats when departments are loaded
      fetchStats();
    } catch (error) {
      console.error('Error fetching departments:', error);
      showNotification('Failed to fetch departments', 'error');
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
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching department stats...');
      const response = await api.get('/departments/stats/overview');
      console.log('Stats response:', response.data);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Stats error details:', error.response?.data);
      // Set default stats if API fails
      setStats({
        total_departments: departments.length,
        active_departments: departments.filter(d => d.status === 'active').length,
        inactive_departments: departments.filter(d => d.status !== 'active').length,
        total_students_across_departments: 0,
        total_courses_across_departments: 0
      });
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      const departmentData = {
        name: formData.name,
        code: formData.code,
        status: 'active' // Default status
      };
      
      const response = await api.post('/departments', departmentData);
      
      showNotification('Department created successfully! You can now assign a department head from the instructors.');
      
      setShowAddModal(false);
      setFormData(getDefaultFormData());
      fetchDepartments();
      fetchStats();
    } catch (error) {
      console.error('Error adding department:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add department';
      showNotification(errorMessage, 'error');
    }
  };

  const handleEditDepartment = async (e) => {
    e.preventDefault();
    try {
      const departmentData = {
        name: formData.name,
        code: formData.code,
        status: editingDepartment.status || 'active' // Keep existing status
      };
      
      await api.put(`/departments/${editingDepartment.id}`, departmentData);
      showNotification('Department updated successfully');
      setEditingDepartment(null);
      setFormData(getDefaultFormData());
      fetchDepartments();
    } catch (error) {
      console.error('Error updating department:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update department';
      showNotification(errorMessage, 'error');
    }
  };

  const handleToggleStatus = async (department, newStatus) => {
    const statusText = newStatus === 'active' ? 'activate' : 'deactivate';
    
    if (window.confirm(`Are you sure you want to ${statusText} ${department.name}?`)) {
      try {
        await api.put(`/departments/${department.id}/toggle-status`, { status: newStatus });
        showNotification(`Department ${statusText}d successfully`);
        fetchDepartments();
        fetchStats();
      } catch (error) {
        console.error(`Error ${statusText}ing department:`, error);
        showNotification(`Failed to ${statusText} department`, 'error');
      }
    }
  };

  const handleAssignHead = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/departments/${assigningDepartment.id}/assign-head`, {
        instructor_id: parseInt(selectedHeadId)
      });
      showNotification('Department head assigned successfully');
      setShowAssignHeadModal(false);
      setAssigningDepartment(null);
      setSelectedHeadId('');
      fetchDepartments();
    } catch (error) {
      console.error('Error assigning head:', error);
      const errorMessage = error.response?.data?.message || 'Failed to assign department head';
      showNotification(errorMessage, 'error');
    }
  };

  const handleViewPerformance = async (department) => {
    try {
      setPerformanceDepartment(department);
      const response = await api.get(`/departments/${department.id}/performance`);
      setPerformanceData(response.data);
      setShowPerformanceModal(true);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      showNotification('Failed to fetch performance data', 'error');
    }
  };

  const checkDepartmentConstraints = async (department) => {
    try {
      // Get department details with counts
      const response = await api.get(`/departments/${department.id}`);
      const dept = response.data.department;
      
      const studentsCount = dept.students_count || 0;
      const instructorsCount = dept.instructors_count || 0;
      const coursesCount = dept.courses_count || 0;
      
      if (studentsCount > 0 || instructorsCount > 0 || coursesCount > 0) {
        const constraints = [];
        if (studentsCount > 0) constraints.push(`${studentsCount} student${studentsCount > 1 ? 's' : ''}`);
        if (instructorsCount > 0) constraints.push(`${instructorsCount} instructor${instructorsCount > 1 ? 's' : ''}`);
        if (coursesCount > 0) constraints.push(`${coursesCount} course${coursesCount > 1 ? 's' : ''}`);
        
        const message = `Cannot delete "${department.name}" because it contains:\n• ${constraints.join('\n• ')}\n\nPlease remove or transfer these items to another department first.`;
        showNotification(message, 'error');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking constraints:', error);
      return true; // Allow deletion attempt if check fails
    }
  };

  const handleDeleteDepartment = async (department) => {
    // First check constraints
    const canDelete = await checkDepartmentConstraints(department);
    if (!canDelete) return;
    
    if (window.confirm(`Are you sure you want to delete ${department.name}? This action cannot be undone.`)) {
      try {
        await api.delete(`/departments/${department.id}`);
        showNotification('Department deleted successfully');
        fetchDepartments();
        fetchStats();
      } catch (error) {
        console.error('Error deleting department:', error);
        
        if (error.response?.status === 422) {
          // Handle constraint violation error
          const errorData = error.response.data;
          const details = errorData.details;
          
          let constraintMessage = 'Cannot delete department because it has:';
          const constraints = [];
          
          if (details?.students > 0) {
            constraints.push(`${details.students} student${details.students > 1 ? 's' : ''}`);
          }
          if (details?.instructors > 0) {
            constraints.push(`${details.instructors} instructor${details.instructors > 1 ? 's' : ''}`);
          }
          if (details?.courses > 0) {
            constraints.push(`${details.courses} course${details.courses > 1 ? 's' : ''}`);
          }
          
          if (constraints.length > 0) {
            constraintMessage += '\n• ' + constraints.join('\n• ');
            constraintMessage += '\n\nPlease remove or transfer these items before deleting the department.';
          }
          
          showNotification(constraintMessage, 'error');
        } else {
          const errorMessage = error.response?.data?.message || 'Failed to delete department';
          showNotification(errorMessage, 'error');
        }
      }
    }
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name || '',
      code: department.code || '',
    });
  };

  const openAssignHeadModal = (department) => {
    setAssigningDepartment(department);
    setSelectedHeadId('');
    setShowAssignHeadModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingDepartment(null);
    setShowAssignHeadModal(false);
    setShowPerformanceModal(false);
    setAssigningDepartment(null);
    setPerformanceDepartment(null);
    setPerformanceData(null);
    setFormData(getDefaultFormData());
    setSelectedHeadId('');
  };

  // Component for status badge
  const StatusBadge = ({ status }) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'N/A'}
      </span>
    );
  };

  // Component for action buttons
  const ActionButtons = ({ department }) => {
    const hasConstraints = (department.students_count > 0 || department.instructors_count > 0 || department.courses_count > 0);
    
    return (
      <div className="flex space-x-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => openEditModal(department)}
          title="Edit Department"
        >
          <Edit size={14} />
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => openAssignHeadModal(department)}
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
          title="Assign Head"
        >
          <UserCheck size={14} />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewPerformance(department)}
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
          title="View Performance"
        >
          <BarChart3 size={14} />
        </Button>

        {department.status === 'active' ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleStatus(department, 'inactive')}
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
            title="Deactivate"
          >
            <UserX size={14} />
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleStatus(department, 'active')}
            className="text-green-600 border-green-600 hover:bg-green-50"
            title="Activate"
          >
            <UserCheck size={14} />
          </Button>
        )}

        <Button
          size="sm"
          variant="danger"
          onClick={() => handleDeleteDepartment(department)}
          title={hasConstraints 
            ? `Cannot delete: Has ${department.students_count || 0} students, ${department.instructors_count || 0} instructors, ${department.courses_count || 0} courses`
            : "Delete Department"
          }
          className={hasConstraints ? "opacity-50 cursor-not-allowed" : ""}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    );
  };

  const filteredDepartments = departments.filter(department => {
    const matchesSearch = 
      department.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.head_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || department.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Code',
      accessor: 'code',
      render: (value, row) => (
        <span className="font-mono font-medium text-blue-600">{value}</span>
      ),
    },
    {
      header: 'Department',
      accessor: 'name',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-sm text-gray-600">{row.description}</p>
          {row.location && (
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <MapPin size={12} className="mr-1" />
              {row.location}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Department Head',
      accessor: 'head_name',
      render: (value, row) => (
        <div>
          {row.head_name ? (
            <>
              <p className="font-medium text-gray-900">{row.head_name}</p>
              {row.head_email && (
                <p className="text-sm text-gray-600 flex items-center">
                  <Mail size={12} className="mr-1" />
                  {row.head_email}
                </p>
              )}
            </>
          ) : (
            <span className="text-gray-400">Not assigned</span>
          )}
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'phone',
      render: (value, row) => (
        <div>
          {row.phone && (
            <p className="text-sm text-gray-600 flex items-center">
              <Phone size={12} className="mr-1" />
              {row.phone}
            </p>
          )}
          {row.established_year && (
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <Calendar size={12} className="mr-1" />
              Est. {row.established_year}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Students',
      accessor: 'students_count',
      render: (value, row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.students_count || 0}
        </span>
      ),
    },
    {
      header: 'Instructors',
      accessor: 'instructors_count',
      render: (value, row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {row.instructors_count || 0}
        </span>
      ),
    },
    {
      header: 'Courses',
      accessor: 'courses_count',
      render: (value, row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {row.courses_count || 0}
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
      render: (_, row) => <ActionButtons department={row} />,
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <ClientOnly fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        }>
          <div className="space-y-6">
          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
              notification.type === 'error' 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              <div className="whitespace-pre-line text-sm">
                {notification.message}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
              <p className="text-gray-600">Manage academic departments and organizational structure</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={20} className="mr-2" />
              Add Department
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_departments || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.active_departments || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_students_across_departments || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-orange-500 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_courses_across_departments || 0}</p>
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
                      placeholder="Search by name, code, or head..."
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
                  </select>
                </div>
              </div>
            </div>

            <Table
              columns={columns}
              data={filteredDepartments}
              loading={loading}
            />
          </div>

          {/* Add/Edit Department Modal */}
          <Modal
            isOpen={showAddModal || editingDepartment}
            onClose={closeModal}
            title={editingDepartment ? 'Edit Department' : 'Add New Department'}
            size="md"
          >
            <form onSubmit={editingDepartment ? handleEditDepartment : handleAddDepartment}>
              <div className="space-y-4">
                <Input
                  label="Department Code"
                  name="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., CS"
                  required
                />
                <Input
                  label="Department Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDepartment ? 'Update' : 'Create'} Department
                </Button>
              </div>
            </form>
          </Modal>

          {/* Assign Head Modal */}
          <Modal
            isOpen={showAssignHeadModal}
            onClose={closeModal}
            title={`Assign Department Head - ${assigningDepartment?.name}`}
          >
            <form onSubmit={handleAssignHead}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Instructor
                  </label>
                  <select
                    value={selectedHeadId}
                    onChange={(e) => setSelectedHeadId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose an instructor...</option>
                    {instructors
                      .filter(instructor => instructor.department_id === assigningDepartment?.id)
                      .map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name} ({instructor.instructor_id})
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Only instructors from this department are shown
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  Assign Head
                </Button>
              </div>
            </form>
          </Modal>

          {/* Performance Modal */}
          <Modal
            isOpen={showPerformanceModal}
            onClose={closeModal}
            title={`Department Performance - ${performanceDepartment?.name}`}
            size="xl"
          >
            {performanceData && (
              <div className="space-y-6">
                {/* Student Performance */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Student Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-600">Excellent (A)</p>
                      <p className="text-2xl font-bold text-green-900">
                        {performanceData.student_performance?.excellent_grades || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-600">Good (B)</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {performanceData.student_performance?.good_grades || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-yellow-600">Average (C)</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {performanceData.student_performance?.average_grades || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-red-600">Below Average</p>
                      <p className="text-2xl font-bold text-red-900">
                        {performanceData.student_performance?.below_average_grades || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Average GPA: <span className="font-bold text-gray-900">
                        {performanceData.student_performance?.average_gpa ? 
                          parseFloat(performanceData.student_performance.average_gpa).toFixed(2) : 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Course Statistics */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Course Enrollment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-600">Approved</p>
                      <p className="text-2xl font-bold text-green-900">
                        {performanceData.course_statistics?.approved_enrollments || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-yellow-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {performanceData.course_statistics?.pending_enrollments || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-red-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-900">
                        {performanceData.course_statistics?.rejected_enrollments || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructor Workload */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Instructor Workload</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Instructor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Courses
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Students
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {performanceData.instructor_workload?.map((instructor, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {instructor.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {instructor.courses_count || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {instructor.students_count || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
        </ClientOnly>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminDepartmentsPage;