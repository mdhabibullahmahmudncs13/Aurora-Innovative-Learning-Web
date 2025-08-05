'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SecureVideoPlayer from '@/components/features/SecureVideoPlayer';
import '@/styles/video-security.css';
import { useAuth } from '@/contexts/AuthContext';
import { useCourse } from '@/contexts/CourseContext';
import { useVideo } from '@/contexts/VideoContext';
import CourseContent from '@/components/CourseContent';
import toast from 'react-hot-toast';



const CoursePage = ({ params }) => {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { fetchCourse, enrollInCourse, isEnrolled, updateLessonProgress } = useCourse();
  const { getVideoAccess, updateVideoProgress } = useVideo();
  const { userProfile } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userEnrolled, setUserEnrolled] = useState(false);
  
  // Check if user can manage lessons (instructor or admin)
  const canManageLessons = userProfile && (userProfile.role === 'instructor' || userProfile.role === 'admin');
  
  useEffect(() => {
    if (unwrappedParams?.id) {
      loadCourse(unwrappedParams.id);
    }
  }, [unwrappedParams?.id, user]);
  
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
        console.log('Checking enrollment for course:', courseId, 'Enrolled:', enrolled, 'User:', user?.$id);
        setUserEnrolled(enrolled);
        
        if (enrolled && result.course.lessons?.length > 0) {
          console.log('User is enrolled, loading first lesson');
          // Set first incomplete lesson or first lesson
          const firstIncompleteLesson = result.course.lessons.find(lesson => !lesson.completed);
          const lessonToPlay = firstIncompleteLesson || result.course.lessons[0];
          setCurrentLesson(lessonToPlay);
          await loadVideo(lessonToPlay);
        } else if (!enrolled) {
          console.log('User is not enrolled in this course');
        }
      } else {
        console.log('User is not authenticated');
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
      console.log('Loading video for lesson:', lesson.title, 'URL:', lesson.videoUrl);
      
      // For now, use the lesson's videoUrl directly since server functions are not deployed
      if (lesson.videoUrl) {
        // Validate YouTube or Google Drive URL before setting it
        const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        const googleDriveRegex = /^(https?\:\/\/)?(drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+)/;
        
        if (youtubeRegex.test(lesson.videoUrl) || googleDriveRegex.test(lesson.videoUrl)) {
          console.log('Setting valid video URL:', lesson.videoUrl);
          setVideoUrl(lesson.videoUrl);
        } else {
          console.warn('Invalid video URL for lesson:', lesson.title, 'URL:', lesson.videoUrl);
          setVideoUrl(''); // Clear invalid URL
          toast.error('Invalid video URL for this lesson. Please use YouTube or Google Drive links.');
        }
      } else {
        console.log('No direct videoUrl, requesting video access for lesson:', lesson.$id);
        const videoAccess = await getVideoAccess(lesson.$id);
        const accessUrl = videoAccess.embedUrl || videoAccess.url;
        console.log('Video access result:', accessUrl);
        setVideoUrl(accessUrl);
      }
    } catch (error) {
      console.error('Error loading video:', error);
      toast.error('Failed to load video');
      setVideoUrl(''); // Clear video URL on error
    }
  };
  
  const handleEnrollment = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (course?.price === 0) {
      // For free courses, enroll directly
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
    } else {
      // For paid courses, redirect to checkout
      router.push(`/courses/checkout?courseId=${course.$id}`);
    }
  };
  
  const handleLessonSelect = async (lesson) => {
    console.log('Lesson selected:', lesson.title, 'User enrolled:', userEnrolled, 'Is authenticated:', isAuthenticated);
    
    if (!userEnrolled) {
      console.log('User not enrolled, showing enrollment message');
      toast.error('Please enroll in the course to access lessons');
      return;
    }
    
    console.log('Setting current lesson and loading video');
    setCurrentLesson(lesson);
    await loadVideo(lesson);
  };
  
  // Extract YouTube video ID from URL
  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {userEnrolled ? (
        // Enrolled User View - Video Player Layout
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600">by {course.instructor}</p>
              </div>
              <Link href="/courses" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Courses
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Video Player Section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {currentLesson && videoUrl ? (
                  <div className="aspect-video relative secure-video-container">
                    <SecureVideoPlayer
                      videoId={extractYouTubeVideoId(videoUrl)}
                      courseId={unwrappedParams.id}
                      lessonId={currentLesson.$id}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                    <div className="text-center text-white relative z-10">
                      <div className="w-20 h-20 mx-auto mb-6 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{currentLesson ? 'Video Loading...' : 'Select a Lesson'}</h3>
                      <p className="text-gray-300">{currentLesson ? 'Please wait while we prepare your video' : 'Choose a lesson from the sidebar to start learning'}</p>
                    </div>
                  </div>
                )}
                
                {/* Enhanced Lesson Info */}
                {currentLesson && (
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            {lessons.findIndex(l => l.$id === currentLesson.$id) + 1}
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h2>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed mb-4">{currentLesson.description}</p>
                      </div>
                    </div>
                    
                    {/* Enhanced Progress Bar */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Lesson {lessons.findIndex(l => l.$id === currentLesson.$id) + 1} of {lessons.length}
                        </span>
                        <div className="flex items-center">
                          {currentLesson.completed ? (
                            <div className="flex items-center text-green-600">
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium">Completed</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-blue-600">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
                              <span className="text-sm font-medium">In Progress</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(lessons.findIndex(l => l.$id === currentLesson.$id) + 1) / lessons.length * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Lessons Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Course Content</h3>
                  <div className="flex items-center text-indigo-100">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium">{lessons.length} lessons</span>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.$id}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group ${
                        currentLesson?.$id === lesson.$id 
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-l-indigo-500' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 transition-colors ${
                            currentLesson?.$id === lesson.$id
                              ? 'bg-indigo-500 text-white'
                              : lesson.completed
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                          }`}>
                            {lesson.completed ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">
                              {lesson.title}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {lesson.duration ? `${Math.round(lesson.duration)} min` : 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        {currentLesson?.$id === lesson.$id && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Enhanced Course Materials for Enrolled Users */}
            <div className="lg:col-span-4 mt-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Course Materials & Resources</h3>
                  <p className="text-emerald-100">Additional resources to enhance your learning experience</p>
                </div>
                <div className="p-6">
                  <CourseContent courseId={course.$id} userEnrolled={userEnrolled} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Enhanced Public Course Preview Layout
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <Link href="/courses" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to All Courses
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Course Content */}
            <div className="lg:col-span-2">
              {/* Enhanced Course Thumbnail */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
                <div className="aspect-video bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center relative overflow-hidden">
                  {course.thumbnail ? (
                    <>
                      <Image 
                        src={course.thumbnail} 
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 text-white">
                        <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-2">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Course Preview
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20"></div>
                      <div className="text-center text-white flex flex-col items-center justify-center h-full relative z-10">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                          <span className="text-4xl font-bold">{course.title?.charAt(0) || 'C'}</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                        <p className="text-indigo-100">Course Preview</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Enhanced Course Details */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 mb-8">
                <div className="mb-8">
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    {course.title}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed mb-8">
                    {course.description}
                  </p>
                </div>
                
                {/* Enhanced Course Meta */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-600">Instructor</p>
                        <p className="text-lg font-bold text-gray-900">{course.instructor}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-600">Duration</p>
                        <p className="text-lg font-bold text-gray-900">{course.duration ? `${Math.round(course.duration)} hours` : 'Self-paced'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-600">Students</p>
                        <p className="text-lg font-bold text-gray-900">{course.enrollmentCount || 0} enrolled</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Course Lessons */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 mb-8 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-gray-900 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">
                    Course Curriculum
                  </h3>
                  <div className="flex items-center text-slate-300">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">{lessons.length} comprehensive lessons</span>
                  </div>
                </div>
                
                <div className="p-8">
                  {lessons.length > 0 ? (
                    <div className="space-y-4">
                      {lessons.map((lesson, index) => (
                        <div key={lesson.$id} className="group bg-gradient-to-r from-gray-50 to-slate-50 hover:from-indigo-50 hover:to-purple-50 border border-gray-200 hover:border-indigo-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold mr-6 group-hover:scale-105 transition-transform">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">{lesson.title}</h4>
                                {lesson.description && (
                                  <p className="text-gray-600 leading-relaxed">{lesson.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center ml-6">
                              <div className="bg-white rounded-xl px-4 py-2 border border-gray-200 group-hover:border-indigo-200 transition-colors">
                                <div className="flex items-center text-sm font-medium text-gray-600 group-hover:text-indigo-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {lesson.duration ? `${Math.round(lesson.duration)} min` : 'Self-paced'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Course Content Coming Soon</h4>
                      <p className="text-gray-500">The instructor is preparing amazing lessons for you!</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Course Materials */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">Course Resources</h3>
                  <p className="text-amber-100">Additional materials and resources for this course</p>
                </div>
                <div className="p-8">
                  <CourseContent courseId={course.$id} userEnrolled={false} />
                </div>
              </div>
            </div>
            
            {/* Enhanced Enrollment Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden sticky top-8">
                {/* Price Header */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white text-center">
                  <div className="mb-4">
                    <div className="text-5xl font-bold mb-2">
                      {course.price === 0 ? 'FREE' : `$${course.price}`}
                    </div>
                    <p className="text-indigo-100 font-medium">Full lifetime access</p>
                  </div>
                  
                  <button
                    onClick={handleEnrollment}
                    disabled={enrolling}
                    className="w-full bg-white text-indigo-600 py-4 px-6 rounded-2xl font-bold text-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {enrolling ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
                        Enrolling...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Enroll Now
                      </div>
                    )}
                  </button>
                </div>
                
                {/* Features */}
                <div className="p-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-6">What's Included:</h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Lifetime access to all content</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Mobile & desktop access</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Certificate of completion</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Downloadable resources</span>
                    </div>
                  </div>
                  
                  {/* Trust Indicators */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-3">Join thousands of students</p>
                      <div className="flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">4.9/5 average rating</p>
                    </div>
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
