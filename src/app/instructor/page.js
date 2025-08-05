'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { databases, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { toast } from 'react-hot-toast';
import CourseContentManager from '@/components/admin/CourseContentManager';
import CourseManagement from '@/components/admin/CourseManagement';

function InstructorDashboard() {
  const { user, userProfile, isAuthenticated, isInstructor, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    publishedCourses: 0,
    draftCourses: 0
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isInstructor)) {
      router.push('/dashboard');
      return;
    }
    
    if (isAuthenticated && isInstructor) {
      fetchInstructorData();
    }
  }, [isAuthenticated, isInstructor, loading, router]);

  const fetchInstructorData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch courses created by this instructor (or all if admin)
      let coursesQuery = [];
      if (userProfile?.role === 'instructor') {
        // For instructors, only show their own courses
        coursesQuery = [Query.equal('instructorId', user.$id)];
      }
      // For admins, show all courses (no additional query needed)
      
      const [coursesResponse, enrollmentsResponse] = await Promise.all([
        databases.listDocuments(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.COURSES,
          coursesQuery
        ),
        databases.listDocuments(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.ENROLLMENTS
        )
      ]);
      
      setCourses(coursesResponse.documents);
      setEnrollments(enrollmentsResponse.documents);
      
      // Calculate stats
      const instructorCourses = coursesResponse.documents;
      const instructorEnrollments = enrollmentsResponse.documents.filter(enrollment => 
        instructorCourses.some(course => course.$id === enrollment.courseId)
      );
      
      const publishedCourses = instructorCourses.filter(course => course.isPublished).length;
      const draftCourses = instructorCourses.filter(course => !course.isPublished).length;
      const totalRevenue = instructorEnrollments.reduce((sum, enrollment) => {
        const course = instructorCourses.find(c => c.$id === enrollment.courseId);
        return sum + (course?.price || 0);
      }, 0);
      
      setStats({
        totalCourses: instructorCourses.length,
        totalEnrollments: instructorEnrollments.length,
        totalRevenue,
        publishedCourses,
        draftCourses
      });
      
    } catch (error) {
      console.error('Error fetching instructor data:', error);
      toast.error('Failed to load instructor data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    setActiveTab('content');
  };

  const handleCoursesUpdate = () => {
    fetchInstructorData();
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading instructor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isInstructor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {userProfile?.role === 'admin' ? 'Admin' : 'Instructor'} Dashboard
              </h1>
              <p className="text-slate-600">
                Welcome back, {userProfile?.name || user?.name || 'Instructor'}!
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{stats.totalCourses}</div>
                <div className="text-xs text-blue-500">Total Courses</div>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{stats.publishedCourses}</div>
                <div className="text-xs text-green-500">Published</div>
              </div>
              <div className="bg-yellow-100 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-600">{stats.draftCourses}</div>
                <div className="text-xs text-yellow-500">Drafts</div>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">{stats.totalEnrollments}</div>
                <div className="text-xs text-purple-500">Students</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20 mb-8">
          <nav className="flex space-x-2">
            {[
              { id: 'courses', name: 'My Courses', icon: '📚' },
              { id: 'content', name: 'Course Content', icon: '📝', disabled: !selectedCourse }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : tab.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.disabled && selectedCourse === null && (
                  <span className="ml-2 text-xs">(Select a course first)</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'courses' && (
            <CourseManagement
              courses={courses}
              onCoursesUpdate={handleCoursesUpdate}
              onCourseSelect={handleCourseSelect}
              userRole={userProfile?.role}
              currentUser={user}
            />
          )}
          
          {activeTab === 'content' && selectedCourse && (
            <CourseContentManager
              courses={courses}
              selectedCourse={selectedCourse}
              onCourseSelect={setSelectedCourse}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorDashboard;