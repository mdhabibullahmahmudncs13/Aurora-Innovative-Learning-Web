'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { databases, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import toast from 'react-hot-toast';
import ContentManager from '@/components/admin/ContentManager';
import ContentUpload from '@/components/admin/ContentUpload';
import LessonManager from '@/components/admin/LessonManager';


function AdminDashboard() {
  const { user, userProfile, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCourseForContent, setSelectedCourseForContent] = useState(null);
  const [showContentManager, setShowContentManager] = useState(false);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showLessonManager, setShowLessonManager] = useState(false);
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    adminUsers: 0,
    instructorUsers: 0,
    regularUsers: 0
  });
  


  const openLessonManager = (course) => {
    setSelectedCourseForLessons(course);
    setShowLessonManager(true);
  };
  
  // Course creation states
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    category: '',
    level: '',
    duration: '',
    price: 0,
    thumbnail: '',
    tags: '',
    isPublished: false
  });
  
  // Course editing states
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(false);
  const [editCourse, setEditCourse] = useState({
    $id: '',
    title: '',
    description: '',
    instructor: '',
    category: '',
    level: '',
    duration: '',
    price: 0,
    thumbnail: '',
    tags: '',
    isPublished: false
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard');
      return;
    }
    
    if (isAuthenticated && isAdmin) {
      fetchAdminData();
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  const fetchAdminData = async () => {
    try {
      setLoadingData(true);
      
      let usersData = [];
      let coursesData = [];
      let enrollmentsData = [];
      
      // Try to fetch users with better error handling
      try {
        const usersResponse = await databases.listDocuments(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.USERS,
          [Query.limit(100)]
        );
        usersData = usersResponse.documents;
        setUsers(usersData);
      } catch (userError) {
        console.error('Error fetching users:', userError);
        toast.error('Unable to fetch users. Please check if the users collection exists and you have proper permissions.');
      }
      
      // Try to fetch courses with better error handling
      try {
        const coursesResponse = await databases.listDocuments(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.COURSES,
          [Query.limit(100)]
        );
        coursesData = coursesResponse.documents;
        setCourses(coursesData);
      } catch (courseError) {
        console.error('Error fetching courses:', courseError);
        toast.error('Unable to fetch courses. Please check if the courses collection exists and you have proper permissions.');
      }
      
      // Try to fetch enrollments with better error handling
      try {
        const enrollmentsResponse = await databases.listDocuments(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.ENROLLMENTS,
          [Query.limit(100)]
        );
        enrollmentsData = enrollmentsResponse.documents;
        setEnrollments(enrollmentsData);
      } catch (enrollmentError) {
        console.error('Error fetching enrollments:', enrollmentError);
        toast.error('Unable to fetch enrollments. Please check if the enrollments collection exists and you have proper permissions.');
      }
      
      // Calculate stats with available data
      const adminCount = usersData.filter(u => u.role === 'admin').length;
      const instructorCount = usersData.filter(u => u.role === 'instructor').length;
      const regularCount = usersData.filter(u => u.role === 'regular').length;
      
      setStats({
        totalUsers: usersData.length,
        totalCourses: coursesData.length,
        totalEnrollments: enrollmentsData.length,
        adminUsers: adminCount,
        instructorUsers: instructorCount,
        regularUsers: regularCount
      });
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data. Please check your Appwrite configuration.');
    } finally {
      setLoadingData(false);
    }
  };

  const promoteUser = async (userId, newRole) => {
    try {
      await databases.updateDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.USERS,
        userId,
        { role: newRole, updatedAt: new Date().toISOString() }
      );
      
      toast.success(`User promoted to ${newRole} successfully!`);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Failed to promote user');
    }
  };

  // Course management functions
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    try {
      setCreatingCourse(true);
      
      // Process tags
      const tagsArray = newCourse.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        instructor: newCourse.instructor,
        category: newCourse.category,
        level: newCourse.level,
        duration: newCourse.duration,
        price: newCourse.price,
        thumbnail: newCourse.thumbnail || null,
        tags: tagsArray,
        lessons: [],
        enrollmentCount: 0,
        rating: 0,
        isPublished: newCourse.isPublished,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await databases.createDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.COURSES,
        ID.unique(),
        courseData
      );
      
      toast.success('Course created successfully!');
      
      // Reset form
      setNewCourse({
        title: '',
        description: '',
        instructor: '',
        category: '',
        level: '',
        duration: '',
        price: 0,
        thumbnail: '',
        tags: '',
        isPublished: false
      });
      
      setShowCreateCourse(false);
      fetchAdminData(); // Refresh data
      
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course. Please check your permissions.');
    } finally {
      setCreatingCourse(false);
    }
  };
  
  const handleEditCourse = (course) => {
    // Populate edit form with course data
    setEditCourse({
      $id: course.$id,
      title: course.title || '',
      description: course.description || '',
      instructor: course.instructor || '',
      category: course.category || '',
      level: course.level || '',
      duration: course.duration || '',
      price: course.price || 0,
      thumbnail: course.thumbnail || '',
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : '',
      isPublished: course.isPublished || false
    });
    setShowEditCourse(true);
    setShowCreateCourse(false); // Close create form if open
  };
  
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    
    try {
      setEditingCourse(true);
      
      // Process tags
      const tagsArray = editCourse.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const courseData = {
        title: editCourse.title,
        description: editCourse.description,
        instructor: editCourse.instructor,
        category: editCourse.category,
        level: editCourse.level,
        duration: editCourse.duration,
        price: editCourse.price,
        thumbnail: editCourse.thumbnail || null,
        tags: tagsArray,
        isPublished: editCourse.isPublished,
        updatedAt: new Date().toISOString()
      };
      
      await databases.updateDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.COURSES,
        editCourse.$id,
        courseData
      );
      
      toast.success('Course updated successfully!');
      
      // Reset form
      setEditCourse({
        $id: '',
        title: '',
        description: '',
        instructor: '',
        category: '',
        level: '',
        duration: '',
        price: 0,
        thumbnail: '',
        tags: '',
        isPublished: false
      });
      
      setShowEditCourse(false);
      fetchAdminData(); // Refresh data
      
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course. Please check your permissions.');
    } finally {
      setEditingCourse(false);
    }
  };
  
  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      await databases.deleteDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.COURSES,
        courseId
      );
      
      toast.success('Course deleted successfully!');
      fetchAdminData(); // Refresh data
      
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-red-600">🛡️</span>
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage users, courses, and system settings</p>
          </div>
          <button
            onClick={fetchAdminData}
            disabled={loadingData}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loadingData ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Enrollments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalEnrollments}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Admin Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.adminUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting Alert */}
        {(users.length === 0 && courses.length === 0 && enrollments.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Database Setup Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>It appears that the required collections are not set up in your Appwrite database. To use the admin dashboard, please:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Create the following collections in your Appwrite database: <code className="bg-yellow-100 px-1 rounded">users</code>, <code className="bg-yellow-100 px-1 rounded">courses</code>, <code className="bg-yellow-100 px-1 rounded">enrollments</code></li>
                    <li>Set proper read/write permissions for authenticated users</li>
                    <li>Ensure your user account has admin role in the users collection</li>
                    <li>Check the console for specific error messages</li>
                  </ul>
                  <p className="mt-2">Refer to the <code className="bg-yellow-100 px-1 rounded">README-APPWRITE-SETUP.md</code> file for detailed setup instructions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {['overview', 'users', 'courses', 'lessons', 'content', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">User Roles Distribution</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-red-600">Admins:</span>
                        <span className="font-semibold">{stats.adminUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Instructors:</span>
                        <span className="font-semibold">{stats.instructorUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Students:</span>
                        <span className="font-semibold">{stats.regularUsers}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
                    <p className="text-gray-600">Platform activity monitoring coming soon...</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">System Health</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-semibold">All Systems Operational</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <button 
                    onClick={fetchAdminData}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.$id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-700">
                                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'instructor' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {user.role !== 'admin' && (
                              <div className="flex gap-2">
                                {user.role === 'regular' && (
                                  <button
                                    onClick={() => promoteUser(user.$id, 'instructor')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Promote to Instructor
                                  </button>
                                )}
                                <button
                                  onClick={() => promoteUser(user.$id, 'admin')}
                                  className="text-red-600 hover:text-red-900 ml-2"
                                >
                                  Make Admin
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Course Management</h3>
                  <button
                    onClick={() => setShowCreateCourse(!showCreateCourse)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {showCreateCourse ? 'Cancel' : 'Add New Course'}
                  </button>
                </div>
                
                {/* Course Creation Form */}
                {showCreateCourse && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Create New Course</h4>
                    <form onSubmit={handleCreateCourse} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                          <input
                            type="text"
                            value={newCourse.title}
                            onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Enter course title"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                          <input
                            type="text"
                            value={newCourse.instructor}
                            onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Instructor name"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Course description"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            value={newCourse.category}
                            onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select category</option>
                            <option value="programming">Programming</option>
                            <option value="design">Design</option>
                            <option value="business">Business</option>
                            <option value="marketing">Marketing</option>
                            <option value="data-science">Data Science</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                          <select
                            value={newCourse.level}
                            onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newCourse.price}
                            onChange={(e) => setNewCourse({...newCourse, price: parseFloat(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <input
                            type="text"
                            value={newCourse.duration}
                            onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="e.g., 10 hours, 5 weeks"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                          <input
                            type="url"
                            value={newCourse.thumbnail}
                            onChange={(e) => setNewCourse({...newCourse, thumbnail: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={newCourse.tags}
                          onChange={(e) => setNewCourse({...newCourse, tags: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="javascript, react, frontend"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isPublished"
                          checked={newCourse.isPublished}
                          onChange={(e) => setNewCourse({...newCourse, isPublished: e.target.checked})}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                          Publish course immediately
                        </label>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowCreateCourse(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={creatingCourse}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {creatingCourse && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          )}
                          {creatingCourse ? 'Creating...' : 'Create Course'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Course Edit Form */}
                {showEditCourse && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Edit Course</h4>
                    <form onSubmit={handleUpdateCourse} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                          <input
                            type="text"
                            value={editCourse.title}
                            onChange={(e) => setEditCourse({...editCourse, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Enter course title"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                          <input
                            type="text"
                            value={editCourse.instructor}
                            onChange={(e) => setEditCourse({...editCourse, instructor: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Instructor name"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={editCourse.description}
                          onChange={(e) => setEditCourse({...editCourse, description: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Course description"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            value={editCourse.category}
                            onChange={(e) => setEditCourse({...editCourse, category: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select category</option>
                            <option value="programming">Programming</option>
                            <option value="design">Design</option>
                            <option value="business">Business</option>
                            <option value="marketing">Marketing</option>
                            <option value="data-science">Data Science</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                          <select
                            value={editCourse.level}
                            onChange={(e) => setEditCourse({...editCourse, level: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editCourse.price}
                            onChange={(e) => setEditCourse({...editCourse, price: parseFloat(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <input
                            type="text"
                            value={editCourse.duration}
                            onChange={(e) => setEditCourse({...editCourse, duration: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="e.g., 10 hours, 5 weeks"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                          <input
                            type="url"
                            value={editCourse.thumbnail}
                            onChange={(e) => setEditCourse({...editCourse, thumbnail: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={editCourse.tags}
                          onChange={(e) => setEditCourse({...editCourse, tags: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="javascript, react, frontend"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="editIsPublished"
                          checked={editCourse.isPublished}
                          onChange={(e) => setEditCourse({...editCourse, isPublished: e.target.checked})}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="editIsPublished" className="ml-2 block text-sm text-gray-700">
                          Publish course
                        </label>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowEditCourse(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={editingCourse}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {editingCourse && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          )}
                          {editingCourse ? 'Updating...' : 'Update Course'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Existing Courses */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div key={course.$id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{course.title}</h4>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit course"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.$id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete course"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{course.description?.substring(0, 100)}...</p>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-500">Price: ${course.price}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <div>Instructor: {course.instructor}</div>
                        <div>Category: {course.category}</div>
                        <div>Level: {course.level}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Lessons Management Tab */}
            {activeTab === 'lessons' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Lesson Management</h2>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Course to Manage Lessons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                      <div key={course.$id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <h4 className="font-medium text-gray-900 mb-2">{course.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{course.description?.substring(0, 100)}...</p>
                        <button
                          onClick={() => openLessonManager(course)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Manage Lessons
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Content Management Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Content Management</h3>
                  <div className="flex gap-3">
                    <select
                      value={selectedCourseForContent || ''}
                      onChange={(e) => setSelectedCourseForContent(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.$id} value={course.$id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowContentManager(!showContentManager)}
                      disabled={!selectedCourseForContent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {showContentManager ? 'Hide Manager' : 'Manage Content'}
                    </button>
                    <button
                      onClick={() => openLessonManager({ $id: selectedCourseForContent, title: courses.find(c => c.$id === selectedCourseForContent)?.title })}
                      disabled={!selectedCourseForContent}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Manage Lessons
                    </button>
                  </div>
                </div>

                {!selectedCourseForContent ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-yellow-800">Please select a course to manage its content.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Content Upload Section */}
                    <ContentUpload 
                      courseId={selectedCourseForContent}
                      onUploadComplete={() => {
                        // Refresh content manager if it's open
                        if (showContentManager) {
                          // The ContentManager component will automatically refresh
                        }
                        toast.success('Content uploaded successfully!');
                      }}
                    />
                    
                    {/* Content Manager Section */}
                    {showContentManager && (
                      <ContentManager courseId={selectedCourseForContent} />
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Platform Analytics</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Enrollment Trends</h4>
                    <p className="text-gray-600">Advanced analytics dashboard coming soon...</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Revenue Analytics</h4>
                    <p className="text-gray-600">Revenue tracking and reporting features in development...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* Lesson Manager Modal */}
      {showLessonManager && selectedCourseForLessons && (
        <LessonManager 
          courseId={selectedCourseForLessons.$id}
          courseTitle={selectedCourseForLessons.title}
          onClose={() => setShowLessonManager(false)}
        />
      )}
    
      </div>
  
  );
};

export default AdminDashboard;
