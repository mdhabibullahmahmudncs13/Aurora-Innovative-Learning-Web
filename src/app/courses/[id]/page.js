"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from 'next/image';
import ReactPlayer from 'react-player';
import { useCourse } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import { useVideo } from '@/contexts/VideoContext';
import toast from 'react-hot-toast';

const CoursePage = ({ params }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { fetchCourse, enrollInCourse, isEnrolled, updateLessonProgress } = useCourse();
  const { getVideoAccess, updateVideoProgress } = useVideo();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  // Removed activeTab state as we now show content in linear order
  const [progress, setProgress] = useState(0);
  const [userEnrolled, setUserEnrolled] = useState(false);
  
  useEffect(() => {
    if (params?.id) {
      loadCourse(params.id);
    }
  }, [params?.id, user]);
  
  const loadCourse = async (courseId) => {
    try {
      const result = await fetchCourse(courseId);
      if (result.success) {
        setCourse(result.course);
        setLessons(result.course.lessons || []);
      } else {
        throw new Error(result.error);
      }
      
      if (isAuthenticated) {
        const enrolled = isEnrolled(courseId);
        setUserEnrolled(enrolled);
        
        if (enrolled && result.course.lessons?.length > 0) {
          // Set first incomplete lesson or first lesson
          const firstIncompleteLesson = result.course.lessons.find(lesson => !lesson.completed);
          const lessonToPlay = firstIncompleteLesson || result.course.lessons[0];
          setCurrentLesson(lessonToPlay);
          await loadVideo(lessonToPlay);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
      setLoading(false);
    }
  };
  
  const loadVideo = async (lesson) => {
    if (!lesson || !userEnrolled) return;
    
    try {
      const videoAccess = await getVideoAccess(lesson.$id);
      setVideoUrl(videoAccess.url);
    } catch (error) {
      console.error('Error loading video:', error);
      toast.error('Failed to load video');
    }
  };
  
  const handleEnrollment = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    setEnrolling(true);
    try {
      await enrollInCourse(course.$id);
      setUserEnrolled(true);
      toast.success('Successfully enrolled in course!');
      
      // Load first lesson after enrollment
      if (lessons.length > 0) {
        setCurrentLesson(lessons[0]);
        await loadVideo(lessons[0]);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };
  
  const handleLessonSelect = async (lesson) => {
    if (!userEnrolled) {
      toast.error('Please enroll in the course to access lessons');
      return;
    }
    
    setCurrentLesson(lesson);
    await loadVideo(lesson);
  };
  
  const handleVideoProgress = async (progress) => {
    if (!currentLesson || !userEnrolled) return;
    
    try {
      await updateVideoProgress(currentLesson.$id, progress.played * 100);
      
      // Mark lesson as completed if watched 90% or more
      if (progress.played >= 0.9 && !currentLesson.completed) {
        await updateLessonProgress(currentLesson.$id, 100);
        setCurrentLesson(prev => ({ ...prev, completed: true }));
        
        // Update lessons list
        setLessons(prev => prev.map(lesson => 
          lesson.$id === currentLesson.$id 
            ? { ...lesson, completed: true }
            : lesson
        ));
        
        toast.success('Lesson completed!');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/courses" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userEnrolled ? (
        // Enrolled User View - Video Player Layout
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Video Player Section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {currentLesson && videoUrl ? (
                  <div className="aspect-video">
                    <ReactPlayer
                      url={videoUrl}
                      width="100%"
                      height="100%"
                      controls
                      onProgress={handleVideoProgress}
                      config={{
                        youtube: {
                          playerVars: { showinfo: 1 }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Select a lesson to start learning</p>
                    </div>
                  </div>
                )}
                
                {/* Lesson Info */}
                {currentLesson && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentLesson.title}</h2>
                    <p className="text-gray-600 mb-4">{currentLesson.description}</p>
                    
                    {/* Lesson Progress */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Lesson {lessons.findIndex(l => l.$id === currentLesson.$id) + 1} of {lessons.length}</span>
                      <span className="flex items-center">
                        {currentLesson.completed && (
                          <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {currentLesson.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Lessons Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
                  <p className="text-sm text-gray-500">{lessons.length} lessons</p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.$id}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        currentLesson?.$id === lesson.$id ? 'bg-indigo-50 border-indigo-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {index + 1}. {lesson.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {lesson.duration ? `${Math.round(lesson.duration)} min` : 'N/A'}
                          </p>
                        </div>
                        
                        {lesson.completed && (
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Public Course Preview Layout
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Content */}
            <div className="lg:col-span-2">
              {/* Course Thumbnail - First */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                  {course.thumbnail ? (
                    <Image 
                      src={course.thumbnail} 
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`text-center text-white ${course.thumbnail ? 'hidden' : 'flex'} flex-col items-center justify-center h-full`}>
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                      <span className="text-3xl font-bold">{course.title?.charAt(0) || 'C'}</span>
                    </div>
                    <p className="text-lg font-semibold">{course.title}</p>
                  </div>
                </div>
              </div>
              
              {/* Course Details - Second */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  {course.description}
                </p>
                
                {/* Course Meta */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    by {course.instructor}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.duration ? `${Math.round(course.duration)} hours` : 'N/A'}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {course.enrollmentCount || 0} students
                  </span>
                </div>
                
                {/* What you'll learn */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.learningOutcomes?.map((outcome, index) => (
                      <div key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{outcome}</span>
                      </div>
                    )) || (
                      <p className="text-gray-500 col-span-2">Learning outcomes will be available soon.</p>
                    )}
                  </div>
                </div>
                
                {/* Requirements */}
                {course.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {course.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Course Lessons - Third */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Course Content ({lessons.length} lessons)
                  </h3>
                  <div className="space-y-3">
                    {lessons.map((lesson, index) => (
                      <div key={lesson.$id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-base font-medium text-gray-900">{lesson.title}</h4>
                            {lesson.description && (
                              <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {lesson.duration ? `${Math.round(lesson.duration)} min` : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {lessons.length === 0 && (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500">No lessons available yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Enrollment Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                {/* Price */}
                <div className="text-center mb-6">
                  {course.price === 0 ? (
                    <div className="text-3xl font-bold text-green-600">Free</div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold text-gray-900">${course.price}</div>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <div className="text-sm text-gray-500 line-through">${course.originalPrice}</div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Enrollment Button */}
                <button
                  onClick={handleEnrollment}
                  disabled={enrolling}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
                >
                  {enrolling ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enrolling...
                    </div>
                  ) : (
                    course.price === 0 ? 'Enroll for Free' : 'Enroll Now'
                  )}
                </button>
                
                {/* Course Features */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.duration ? `${Math.round(course.duration)} hours` : 'Self-paced'}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {lessons.length} lessons
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Mobile & Desktop Access
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Certificate of Completion
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Lifetime Access
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePage;
