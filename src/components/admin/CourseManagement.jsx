'use client';

import { useState, useEffect } from 'react';
import { databases, storage, DATABASE_IDS, COLLECTION_IDS, BUCKET_IDS } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { toast } from 'react-hot-toast';

function CourseManagement({ courses, onCoursesUpdate, onCourseSelect, userRole, currentUser }) {
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courseStats, setCourseStats] = useState({});
  
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 0,
    duration: '',
    thumbnail: null,
    isPublished: false,
    tags: '',
    prerequisites: '',
    learningObjectives: ''
  });

  const categories = [
    'Programming', 'Design', 'Business', 'Marketing', 'Data Science',
    'Photography', 'Music', 'Language', 'Health', 'Lifestyle'
  ];

  const levels = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchTerm, filterCategory, filterLevel, filterStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchCourseStats();
  }, [courses]);

  const fetchCourseStats = async () => {
    try {
      const stats = {};
      
      for (const course of courses) {
        try {
          // Get enrollments for this course
          const enrollmentsResponse = await databases.listDocuments(
            DATABASE_IDS.MAIN,
            COLLECTION_IDS.ENROLLMENTS,
            [Query.equal('courseId', course.$id)]
          );
          
          // Get lessons for this course
          const lessonsResponse = await databases.listDocuments(
            DATABASE_IDS.MAIN,
            COLLECTION_IDS.LESSONS,
            [Query.equal('courseId', course.$id)]
          );
          
          const enrollments = enrollmentsResponse.documents;
          const completedEnrollments = enrollments.filter(e => e.progress === 100);
          
          stats[course.$id] = {
            enrollments: enrollments.length,
            completions: completedEnrollments.length,
            completionRate: enrollments.length > 0 ? (completedEnrollments.length / enrollments.length) * 100 : 0,
            lessons: lessonsResponse.documents.length,
            revenue: enrollments.length * (course.price || 0)
          };
        } catch (error) {
          console.error(`Error fetching stats for course ${course.$id}:`, error);
          stats[course.$id] = {
            enrollments: 0,
            completions: 0,
            completionRate: 0,
            lessons: 0,
            revenue: 0
          };
        }
      }
      
      setCourseStats(stats);
    } catch (error) {
      console.error('Error fetching course stats:', error);
    }
  };

  const filterAndSortCourses = () => {
    let filtered = courses.filter(course => {
      const matchesSearch = 
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
      const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'published' && course.isPublished) ||
        (filterStatus === 'draft' && !course.isPublished);
      
      return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
    });

    // Sort courses
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'enrollments') {
        aValue = courseStats[a.$id]?.enrollments || 0;
        bValue = courseStats[b.$id]?.enrollments || 0;
      } else if (sortBy === 'revenue') {
        aValue = courseStats[a.$id]?.revenue || 0;
        bValue = courseStats[b.$id]?.revenue || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCourses(filtered);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      let thumbnailId = null;
      
      // Upload thumbnail if provided
      if (courseForm.thumbnail) {
        try {
          const thumbnailResponse = await storage.createFile(
            BUCKET_IDS.COURSE_MATERIALS,
            ID.unique(),
            courseForm.thumbnail
          );
          thumbnailId = thumbnailResponse.$id;
        } catch (error) {
          console.error('Error uploading thumbnail:', error);
          toast.error('Failed to upload thumbnail');
          return;
        }
      }
      
      const courseData = {
        title: courseForm.title,
        description: courseForm.description,
        instructor: currentUser?.name || 'Unknown Instructor',
        category: courseForm.category,
        level: courseForm.level,
        price: parseFloat(courseForm.price) || 0,
        duration: courseForm.duration,
        isPublished: courseForm.isPublished,
        tags: courseForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: new Date().toISOString()
      };
      
      if (thumbnailId) {
        courseData.thumbnail = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_IDS.COURSE_MATERIALS}/files/${thumbnailId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
      }
      
      if (editingCourse) {
        await databases.updateDocument(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.COURSES,
          editingCourse.$id,
          courseData
        );
        toast.success('Course updated successfully!');
      } else {
        await databases.createDocument(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.COURSES,
          ID.unique(),
          {
            ...courseData,
            instructorId: currentUser?.$id,
            createdAt: new Date().toISOString()
          }
        );
        toast.success('Course created successfully!');
      }
      
      resetCourseForm();
      onCoursesUpdate();
      
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    // Check permissions
    const course = courses.find(c => c.$id === courseId);
    if (userRole === 'instructor' && course?.instructorId !== currentUser?.$id) {
      toast.error('You can only delete your own courses');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this course? This will also delete all associated lessons and enrollments.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete course lessons
      const lessonsResponse = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.LESSONS,
        [Query.equal('courseId', courseId)]
      );
      
      for (const lesson of lessonsResponse.documents) {
        await databases.deleteDocument(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.LESSONS,
          lesson.$id
        );
      }
      
      // Delete course enrollments
      const enrollmentsResponse = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.ENROLLMENTS,
        [Query.equal('courseId', courseId)]
      );
      
      for (const enrollment of enrollmentsResponse.documents) {
        await databases.deleteDocument(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.ENROLLMENTS,
          enrollment.$id
        );
      }
      
      // Delete course files
      const filesResponse = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.FILE_METADATA,
        [Query.equal('courseId', courseId)]
      );
      
      for (const file of filesResponse.documents) {
        try {
          await storage.deleteFile(BUCKET_IDS.COURSE_MATERIALS, file.fileId);
        } catch (error) {
          console.error('Error deleting file from storage:', error);
        }
        
        await databases.deleteDocument(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.FILE_METADATA,
          file.$id
        );
      }
      
      // Delete the course
      await databases.deleteDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.COURSES,
        courseId
      );
      
      toast.success('Course deleted successfully!');
      onCoursesUpdate();
      
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  const bulkDeleteCourses = async () => {
    if (selectedCourses.length === 0) {
      toast.error('Please select courses to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedCourses.length} courses? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      for (const courseId of selectedCourses) {
        await deleteCourse(courseId);
      }
      
      setSelectedCourses([]);
      
    } catch (error) {
      console.error('Error deleting courses:', error);
      toast.error('Failed to delete courses');
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseStatus = async (course) => {
    try {
      await databases.updateDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.COURSES,
        course.$id,
        {
          isPublished: !course.isPublished,
          updatedAt: new Date().toISOString()
        }
      );
      
      toast.success(`Course ${!course.isPublished ? 'published' : 'unpublished'} successfully!`);
      onCoursesUpdate();
      
    } catch (error) {
      console.error('Error updating course status:', error);
      toast.error('Failed to update course status');
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      category: '',
      level: 'beginner',
      price: 0,
      duration: '',
      thumbnail: null,
      isPublished: false,
      tags: '',
      prerequisites: '',
      learningObjectives: ''
    });
    setEditingCourse(null);
    setShowCourseModal(false);
  };

  const editCourse = (course) => {
    // Check permissions
    if (userRole === 'instructor' && course?.instructorId !== currentUser?.$id) {
      toast.error('You can only edit your own courses');
      return;
    }
    
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      level: course.level || 'beginner',
      price: course.price || 0,
      duration: course.duration || '',
      thumbnail: null,
      isPublished: course.isPublished || false,
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : '',
      prerequisites: course.prerequisites || '',
      learningObjectives: course.learningObjectives || ''
    });
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(course => course.$id));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-600';
      case 'intermediate': return 'bg-yellow-100 text-yellow-600';
      case 'advanced': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Management</h2>
            <p className="text-slate-600">Create, edit, and manage your courses</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedCourses.length > 0 && (
              <button
                onClick={bulkDeleteCourses}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete ({selectedCourses.length})
              </button>
            )}
            
            <button
              onClick={() => setShowCourseModal(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Course
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level} className="capitalize">{level}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="enrollments-desc">Most Popular</option>
            <option value="revenue-desc">Highest Revenue</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-600">Try adjusting your search criteria or create a new course.</p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const stats = courseStats[course.$id] || {};
            return (
              <div key={course.$id} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                {/* Course Header */}
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail.startsWith('http') ? course.thumbnail : storage.getFileView(BUCKET_IDS.COURSE_MATERIALS, course.thumbnail)} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={`text-4xl ${course.thumbnail ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>📚</span>
                  </div>
                  
                  <div className="absolute top-4 left-4">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.$id)}
                      onChange={() => toggleCourseSelection(course.$id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.isPublished ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                {/* Course Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {course.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-600">{stats.enrollments || 0}</div>
                      <div className="text-blue-500 text-xs">Students</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="font-semibold text-green-600">{stats.lessons || 0}</div>
                      <div className="text-green-500 text-xs">Lessons</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-slate-900">
                      {course.price > 0 ? formatCurrency(course.price) : 'Free'}
                    </span>
                    <span className="text-sm text-slate-500">
                      {formatCurrency(stats.revenue || 0)} earned
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onCourseSelect(course.$id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Manage Content"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </button>
                      
                      {(userRole === 'admin' || course?.instructorId === currentUser?.$id) && (
                        <button
                          onClick={() => editCourse(course)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Course"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => toggleCourseStatus(course)}
                        className={`p-2 rounded-lg transition-colors ${
                          course.isPublished 
                            ? 'text-slate-400 hover:text-yellow-600 hover:bg-yellow-50' 
                            : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={course.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={course.isPublished 
                              ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            } 
                          />
                        </svg>
                      </button>
                    </div>
                    
                    {(userRole === 'admin' || course?.instructorId === currentUser?.$id) && (
                      <button
                        onClick={() => deleteCourse(course.$id)}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Course"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button
                onClick={resetCourseForm}
                className="p-2 hover:bg-white/60 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCourseSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Course Title</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                    className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                    className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({...courseForm, level: e.target.value})}
                    className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {levels.map(level => (
                      <option key={level} value={level} className="capitalize">{level}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                    placeholder="e.g., 4 weeks, 20 hours"
                    className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Thumbnail Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCourseForm({...courseForm, thumbnail: e.target.files[0]})}
                  className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={courseForm.tags}
                  onChange={(e) => setCourseForm({...courseForm, tags: e.target.value})}
                  placeholder="javascript, web development, frontend"
                  className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prerequisites</label>
                <textarea
                  value={courseForm.prerequisites}
                  onChange={(e) => setCourseForm({...courseForm, prerequisites: e.target.value})}
                  rows={3}
                  placeholder="What students should know before taking this course..."
                  className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Learning Objectives</label>
                <textarea
                  value={courseForm.learningObjectives}
                  onChange={(e) => setCourseForm({...courseForm, learningObjectives: e.target.value})}
                  rows={3}
                  placeholder="What students will learn from this course..."
                  className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={courseForm.isPublished}
                  onChange={(e) => setCourseForm({...courseForm, isPublished: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 text-sm text-slate-700">
                  Publish course immediately
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetCourseForm}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseManagement;