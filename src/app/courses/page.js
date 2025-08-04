"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useCourse } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import Filter from "@/components/Filter";
import CourseCard from "@/components/shared/Cards/CourseCard";
import Link from 'next/link';
import Image from 'next/image';

const COURSES_PER_PAGE = 9; // Courses per page

export default function CoursesPage() {
  const router = useRouter();
  const { courses, fetchCourses, enrollInCourse, isEnrolled } = useCourse();
  const { isAuthenticated } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, popular, title, price
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState({});

  // Fetch courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Check enrollment status for all courses when user authentication changes
  useEffect(() => {
    if (isAuthenticated && courses.length > 0) {
      checkEnrollmentStatus();
    } else {
      setEnrollmentStatus({});
    }
  }, [isAuthenticated, courses]);

  const loadCourses = async () => {
    try {
      await fetchCourses();
      setLoading(false);
    } catch (error) {
      console.error('Error loading courses:', error);
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!isAuthenticated || courses.length === 0) return;
    
    const statusPromises = courses.map(async (course) => {
      const enrolled = await isEnrolled(course.$id);
      return { courseId: course.$id, enrolled };
    });
    
    const results = await Promise.all(statusPromises);
    const statusMap = {};
    results.forEach(({ courseId, enrolled }) => {
      statusMap[courseId] = enrolled;
    });
    
    setEnrollmentStatus(statusMap);
  };

  const handleCardClick = (id) => {
    window.location.href = `/courses/${id}`;
  };

  const handleEnrollment = async (courseId) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Find the course to check if it's free
    const course = courses.find(c => c.$id === courseId);
    
    if (course?.price === 0) {
      // For free courses, enroll directly
      try {
        await enrollInCourse(courseId);
      } catch (error) {
        console.error('Enrollment error:', error);
      }
    } else {
      // For paid courses, redirect to checkout
      router.push(`/courses/checkout?courseId=${courseId}`);
    }
  };

  // Filter and sort courses
  const getFilteredAndSortedCourses = () => {
    let filtered = courses;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((course) => selectedCategories.includes(course.category));
    }

    // Apply sorting
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'price':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
        break;
    }

    return filtered;
  };

  const filteredCourses = getFilteredAndSortedCourses();

  // Pagination Logic
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Explore Our Courses
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Discover world-class courses designed to help you master new skills and advance your career.
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search for courses, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border border-transparent rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Course Count */}
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''} Available
              </h2>
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="title">Course Title</option>
                  <option value="price">Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content with Sidebar Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filter */}
          <div className="lg:col-span-1">
            <Filter
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
          </div>
          
          {/* Course Grid */}
          <div className="lg:col-span-3">
            {paginatedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedCourses.map((course) => (
                  <div key={course.$id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Course Thumbnail */}
                    <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                      {course.thumbnail ? (
                        <Image 
                          src={course.thumbnail} 
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`text-center ${course.thumbnail ? 'hidden' : 'flex'} flex-col items-center justify-center h-full`}>
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <span className="text-white font-semibold text-lg">{course.title.charAt(0)}</span>
                      </div>
                      
                      {/* Category Badge */}
                      {course.category && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-800">
                            {course.category}
                          </span>
                        </div>
                      )}
                      
                      {/* Price Badge */}
                      {course.price !== undefined && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {course.price === 0 ? 'Free' : `$${course.price}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">by {course.instructor}</p>
                      
                      {course.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                      )}

                      {/* Course Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {course.duration ? `${Math.round(course.duration)}h` : 'N/A'}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {course.enrollmentCount || 0} students
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {isAuthenticated && enrollmentStatus[course.$id] ? (
                          <Link 
                            href={`/courses/${course.$id}`}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                          >
                            Continue Learning
                          </Link>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEnrollment(course.$id)}
                              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                            >
                              {course.price === 0 ? 'Enroll Free' : 'Enroll Now'}
                            </button>
                            <Link 
                              href={`/courses/${course.$id}`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                              Preview
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedCategories.length > 0 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Check back later for new courses.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === i + 1 
                      ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600" 
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
