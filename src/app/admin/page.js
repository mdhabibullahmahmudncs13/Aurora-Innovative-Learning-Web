'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { databases, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import toast from 'react-hot-toast';
import CourseContentManager from '@/components/admin/CourseContentManager';
import AdminStats from '@/components/admin/AdminStats';
import UserManagement from '@/components/admin/UserManagement';
import CourseManagement from '@/components/admin/CourseManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import PaymentMethodManager from '@/components/admin/PaymentMethodManager';
import PaymentVerificationDashboard from '@/components/admin/PaymentVerificationDashboard';

function AdminDashboard() {
  const { user, userProfile, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    adminUsers: 0,
    instructorUsers: 0,
    regularUsers: 0,
    totalRevenue: 0,
    activeUsers: 0,
    completionRate: 0
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
      
      // Fetch users
      const usersResponse = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.USERS,
        [Query.limit(100)]
      );
      
      // Fetch courses (filter for instructors)
      const courseQueries = [Query.limit(100)];
      if (userProfile?.role === 'instructor') {
        courseQueries.push(Query.equal('instructorId', user.$id));
      }
      
      const coursesResponse = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.COURSES,
        courseQueries
      );
      
      // Fetch enrollments
      const enrollmentsResponse = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.ENROLLMENTS,
        [Query.limit(100)]
      );
      
      setUsers(usersResponse.documents);
      setCourses(coursesResponse.documents);
      setEnrollments(enrollmentsResponse.documents);
      
      // Calculate stats
      const adminCount = usersResponse.documents.filter(user => user.role === 'admin').length;
      const instructorCount = usersResponse.documents.filter(user => user.role === 'instructor').length;
      const regularCount = usersResponse.documents.filter(user => user.role === 'regular').length;
      
      setStats({
        totalUsers: usersResponse.documents.length,
        totalCourses: coursesResponse.documents.length,
        totalEnrollments: enrollmentsResponse.documents.length,
        adminUsers: adminCount,
        instructorUsers: instructorCount,
        regularUsers: regularCount,
        totalRevenue: enrollmentsResponse.documents.reduce((sum, enrollment) => sum + (enrollment.price || 0), 0),
        activeUsers: usersResponse.documents.filter(user => {
          const lastActive = new Date(user.lastActive || user.$createdAt);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return lastActive > thirtyDaysAgo;
        }).length,
        completionRate: enrollmentsResponse.documents.length > 0 
          ? (enrollmentsResponse.documents.filter(e => e.completed).length / enrollmentsResponse.documents.length * 100).toFixed(1)
          : 0
      });
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoadingData(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'courses', name: 'Course Management', icon: '📚' },
    { id: 'content', name: 'Content & Lessons', icon: '🎬' },
    { id: 'users', name: 'User Management', icon: '👥' },
    { id: 'payments', name: 'Payment Methods', icon: '💳' },
    { id: 'verification', name: 'Payment Verification', icon: '✅' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-slate-600 font-medium">Loading admin dashboard...</p>
          <p className="text-slate-400 text-sm mt-1">Preparing your workspace</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-slate-500 text-sm">Aurora Enhanced Learning Platform</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchAdminData}
                disabled={loadingData}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className={`w-4 h-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <nav className="flex space-x-2" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <AdminStats 
              stats={stats} 
              users={users} 
              courses={courses} 
              enrollments={enrollments}
              onRefresh={fetchAdminData}
            />
          )}

          {/* Course Management Tab */}
          {activeTab === 'courses' && (
            <CourseManagement 
              courses={courses}
              onCourseSelect={setSelectedCourse}
              onCoursesUpdate={fetchAdminData}
              userRole={userProfile?.role}
              currentUser={user}
            />
          )}

          {/* Content & Lessons Tab */}
          {activeTab === 'content' && (
            <CourseContentManager 
              courses={courses}
              selectedCourse={selectedCourse}
              onCourseSelect={setSelectedCourse}
            />
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <UserManagement 
              users={users}
              onRefresh={fetchAdminData}
            />
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payments' && (
            <PaymentMethodManager />
          )}

          {/* Payment Verification Tab */}
          {activeTab === 'verification' && (
            <PaymentVerificationDashboard />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard 
              stats={stats}
              users={users}
              courses={courses}
              enrollments={enrollments}
            />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">System Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-800">Platform Configuration</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-slate-200">
                      <span className="text-slate-700">Maintenance Mode</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform translate-x-1"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-slate-200">
                      <span className="text-slate-700">User Registration</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform translate-x-6"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-slate-200">
                      <span className="text-slate-700">Email Notifications</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform translate-x-6"></span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-800">Security Settings</h4>
                  <div className="space-y-3">
                    <button className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      Reset API Keys
                    </button>
                    <button className="w-full p-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      Backup Database
                    </button>
                    <button className="w-full p-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
