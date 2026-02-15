'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Plus, Search, Edit, Award, BookOpen, Users } from 'lucide-react';
import api from '@/services/api';

const InstructorGradesContent = () => {
  const searchParams = useSearchParams();
  const courseParam = searchParams.get('course');
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [notification, setNotification] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    student_id: '',
    course_id: '',
    grade: '',
    assignment_type: 'exam',
    assignment_name: '',
    points_earned: '',
    total_points: '',
    comments: ''
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
  }, []);

  // Auto-select course if provided in URL
  useEffect(() => {
    if (courseParam && courses.length > 0) {
      const course = courses.find(c => c.id.toString() === courseParam);
      if (course) {
        fetchCourseStudents(course.id);
      }
    }
  }, [courseParam, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/instructor/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showNotification('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStudents = async (courseId) => {
    try {
      const response = await api.get(`/instructor/courses/${courseId}/students`);
      setStudents(response.data.students || []);
      setSelectedCourse(response.data.course);
      
      // Fetch grades for this course
      try {
        const gradesResponse = await api.get(`/instructor/courses/${courseId}/grades`);
        setGrades(gradesResponse.data.grades || []);
      } catch (gradesError) {
        console.log('No grades endpoint yet, using empty array');
        setGrades([]);
      }
    } catch (error) {
      console.error('Error fetching course students:', error);
      showNotification('Failed to load course students', 'error');
    }
  };

  const handleAddGrade = () => {
    setEditingGrade(null);
    setGradeForm({
      student_id: '',
      course_id: selectedCourse?.id || '',
      grade: '',
      assignment_type: 'exam',
      assignment_name: '',
      points_earned: '',
      total_points: '',
      comments: ''
    });
    setShowGradeModal(true);
  };

  const handleEditGrade = (grade) => {
    setEditingGrade(grade);
    setGradeForm({
      student_id: grade.student_id,
      course_id: grade.course_id,
      grade: grade.grade,
      assignment_type: grade.assignment_type || 'exam',
      assignment_name: grade.assignment_name || '',
      points_earned: grade.points_earned || '',
      total_points: grade.total_points || '',
      comments: grade.comments || ''
    });
    setShowGradeModal(true);
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    try {
      if (editingGrade) {
        await api.put(`/instructor/grades/${editingGrade.id}`, gradeForm);
        showNotification('Grade updated successfully');
      } else {
        await api.post('/instructor/grades', gradeForm);
        showNotification('Grade added successfully');
      }
      
      setShowGradeModal(false);
      if (selectedCourse) {
        fetchCourseStudents(selectedCourse.id); // Refresh data
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save grade';
      showNotification(errorMessage, 'error');
    }
  };

  const getGradeColor = (grade) => {
    if (['A+', 'A', 'A-'].includes(grade)) return 'text-green-600 bg-green-100';
    if (['B+', 'B', 'B-'].includes(grade)) return 'text-blue-600 bg-blue-100';
    if (['C+', 'C', 'C-'].includes(grade)) return 'text-yellow-600 bg-yellow-100';
    if (['D+', 'D'].includes(grade)) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'name',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-sm text-gray-600">{row.student_id}</p>
          <p className="text-sm text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (value, row) => row.department?.name || 'N/A',
    },
    {
      header: 'Current Grade',
      accessor: 'current_grade',
      render: (value, row) => {
        const studentGrades = grades.filter(g => g.student_id === row.id);
        if (studentGrades.length === 0) {
          return <span className="text-gray-500">No grades</span>;
        }
        const latestGrade = studentGrades[studentGrades.length - 1];
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(latestGrade.grade)}`}>
            {latestGrade.grade}
          </span>
        );
      },
    },
    {
      header: 'Total Grades',
      accessor: 'total_grades',
      render: (value, row) => {
        const studentGrades = grades.filter(g => g.student_id === row.id);
        return <span className="text-gray-900">{studentGrades.length}</span>;
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => {
              setGradeForm(prev => ({ ...prev, student_id: row.id }));
              handleAddGrade();
            }}
          >
            <Plus size={16} className="mr-1" />
            Add Grade
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // View all grades for this student
              const studentGrades = grades.filter(g => g.student_id === row.id);
              console.log('Student grades:', studentGrades);
            }}
          >
            View All
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading courses...</div>
      </div>
    );
  }

  return (
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

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grade Management</h1>
            <p className="text-gray-600">Enter and manage student grades</p>
          </div>

          {/* Course Selection */}
          {!selectedCourse ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select a Course</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => fetchCourseStudents(course.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <BookOpen className="h-6 w-6 text-blue-500" />
                      <span className="text-sm text-gray-500">{course.code}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">{course.title}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{course.students_count} students</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Selected Course Header */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedCourse.title}</h2>
                    <p className="text-gray-600">{selectedCourse.code} • {students.length} students</p>
                  </div>
                  <div className="flex space-x-3">
                    <Button onClick={handleAddGrade}>
                      <Plus size={20} className="mr-2" />
                      Add Grade
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                      Back to Courses
                    </Button>
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Students</h3>
                </div>
                
                <Table
                  columns={columns}
                  data={students}
                  loading={false}
                />
              </div>
            </>
          )}

          {/* Grade Modal */}
          <Modal
            isOpen={showGradeModal}
            onClose={() => setShowGradeModal(false)}
            title={editingGrade ? 'Edit Grade' : 'Add Grade'}
          >
            <form onSubmit={handleSubmitGrade}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <select
                    value={gradeForm.student_id}
                    onChange={(e) => setGradeForm({ ...gradeForm, student_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.student_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignment Type
                    </label>
                    <select
                      value={gradeForm.assignment_type}
                      onChange={(e) => setGradeForm({ ...gradeForm, assignment_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="exam">Exam</option>
                      <option value="assignment">Assignment</option>
                      <option value="quiz">Quiz</option>
                      <option value="project">Project</option>
                      <option value="participation">Participation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade
                    </label>
                    <select
                      value={gradeForm.grade}
                      onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Grade</option>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="B-">B-</option>
                      <option value="C+">C+</option>
                      <option value="C">C</option>
                      <option value="C-">C-</option>
                      <option value="D+">D+</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Assignment Name"
                  value={gradeForm.assignment_name}
                  onChange={(e) => setGradeForm({ ...gradeForm, assignment_name: e.target.value })}
                  placeholder="e.g., Midterm Exam, Assignment 1"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Points Earned"
                    type="number"
                    value={gradeForm.points_earned}
                    onChange={(e) => setGradeForm({ ...gradeForm, points_earned: e.target.value })}
                    placeholder="85"
                  />
                  <Input
                    label="Total Points"
                    type="number"
                    value={gradeForm.total_points}
                    onChange={(e) => setGradeForm({ ...gradeForm, total_points: e.target.value })}
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments
                  </label>
                  <textarea
                    value={gradeForm.comments}
                    onChange={(e) => setGradeForm({ ...gradeForm, comments: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Optional feedback for the student"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowGradeModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingGrade ? 'Update' : 'Add'} Grade
                </Button>
              </div>
            </form>
          </Modal>
        </div>
  );
};

const InstructorGradesPage = () => {
  return (
    <ProtectedRoute allowedRoles={['instructor']}>
      <DashboardLayout>
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        }>
          <InstructorGradesContent />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default InstructorGradesPage;