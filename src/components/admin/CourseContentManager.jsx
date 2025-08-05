'use client';

import { useState, useEffect } from 'react';
import { databases, storage, DATABASE_IDS, COLLECTION_IDS, BUCKET_IDS } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { toast } from 'react-hot-toast';

function CourseContentManager({ courses, selectedCourse, onCourseSelect }) {
  const [activeSection, setActiveSection] = useState('lessons');
  const [lessons, setLessons] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    order: 1,
    isPreview: false
  });
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null,
    title: '',
    description: '',
    category: 'materials',
    type: 'document'
  });

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseContent();
    }
  }, [selectedCourse]);

  const fetchCourseContent = async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      
      // Fetch lessons
      const lessonsResponse = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.LESSONS,
        [Query.equal('courseId', selectedCourse), Query.orderAsc('order')]
      );
      
      // Fetch files
      const filesResponse = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.FILE_METADATA,
        [Query.equal('courseId', selectedCourse)]
      );
      
      setLessons(lessonsResponse.documents);
      setFiles(filesResponse.documents);
      
    } catch (error) {
      console.error('Error fetching course content:', error);
      toast.error('Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const lessonData = {
        ...lessonForm,
        courseId: selectedCourse,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (editingLesson) {
        await databases.updateDocument(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.LESSONS,
          editingLesson.$id,
          { ...lessonData, updatedAt: new Date().toISOString() }
        );
        toast.success('Lesson updated successfully!');
      } else {
        await databases.createDocument(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.LESSONS,
          ID.unique(),
          lessonData
        );
        toast.success('Lesson created successfully!');
      }
      
      resetLessonForm();
      fetchCourseContent();
      
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Failed to save lesson');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast.error('Please select a file');
      return;
    }
    
    try {
      setLoading(true);
      
      // Upload file to storage
      const fileResponse = await storage.createFile(
        BUCKET_IDS.COURSE_MATERIALS,
        ID.unique(),
        uploadForm.file
      );
      
      // Save file metadata to database
      const fileData = {
        fileId: fileResponse.$id,
        courseId: selectedCourse,
        originalName: uploadForm.file.name,
        title: uploadForm.title || uploadForm.file.name,
        description: uploadForm.description,
        category: uploadForm.category,
        type: uploadForm.type,
        mimeType: uploadForm.file.type,
        size: uploadForm.file.size,
        uploadedAt: new Date().toISOString()
      };
      
      await databases.createDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.FILE_METADATA,
        ID.unique(),
        fileData
      );
      
      toast.success('File uploaded successfully!');
      resetUploadForm();
      fetchCourseContent();
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      await databases.deleteDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.LESSONS,
        lessonId
      );
      toast.success('Lesson deleted successfully!');
      fetchCourseContent();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Failed to delete lesson');
    }
  };

  const deleteFile = async (file) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      // Delete from storage
      await storage.deleteFile(BUCKET_IDS.COURSE_MATERIALS, file.fileId);
      
      // Delete from database
      await databases.deleteDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.FILE_METADATA,
        file.$id
      );
      
      toast.success('File deleted successfully!');
      fetchCourseContent();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const resetLessonForm = () => {
    setLessonForm({
      title: '',
      description: '',
      videoUrl: '',
      duration: '',
      order: lessons.length + 1,
      isPreview: false
    });
    setEditingLesson(null);
    setShowLessonForm(false);
  };

  const resetUploadForm = () => {
    setUploadForm({
      file: null,
      title: '',
      description: '',
      category: 'materials',
      type: 'document'
    });
    setShowUploadForm(false);
  };

  const editLesson = (lesson) => {
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || '',
      order: lesson.order,
      isPreview: lesson.isPreview || false
    });
    setEditingLesson(lesson);
    setShowLessonForm(true);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.category === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedCourse) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎬</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a Course</h3>
          <p className="text-slate-600 mb-6">Choose a course to manage its lessons and content</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <button
                key={course.$id}
                onClick={() => onCourseSelect(course.$id)}
                className="p-4 bg-white/80 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 text-left group"
              >
                <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h4>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500">{course.category}</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    {course.level}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedCourseData = courses.find(c => c.$id === selectedCourse);

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onCourseSelect(null)}
              className="p-2 hover:bg-white/60 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedCourseData?.title}</h2>
              <p className="text-slate-600">{selectedCourseData?.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">{lessons.length} lessons</span>
            <span className="text-slate-300">•</span>
            <span className="text-sm text-slate-500">{files.length} files</span>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
        <nav className="flex space-x-2">
          {[
            { id: 'lessons', name: 'Lessons', icon: '📚', count: lessons.length },
            { id: 'files', name: 'Files & Resources', icon: '📁', count: files.length }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              <span>{section.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeSection === section.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {section.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={`Search ${activeSection}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {activeSection === 'files' && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Files</option>
                <option value="materials">Course Materials</option>
                <option value="thumbnails">Thumbnails</option>
                <option value="certificates">Certificates</option>
              </select>
            )}
            
            <button
              onClick={() => activeSection === 'lessons' ? setShowLessonForm(true) : setShowUploadForm(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {activeSection === 'lessons' ? 'Add Lesson' : 'Upload File'}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {activeSection === 'lessons' && (
        <div className="space-y-6">
          {/* Lesson Form */}
          {showLessonForm && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                </h3>
                <button
                  onClick={resetLessonForm}
                  className="p-2 hover:bg-white/60 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleLessonSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Lesson Title</label>
                    <input
                      type="text"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                      className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
                      placeholder="e.g., 15 minutes"
                      className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                

                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Video URL (optional)</label>
                    <input
                      type="url"
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                      placeholder="YouTube: https://youtube.com/watch?v=... or Google Drive: https://drive.google.com/file/d/.../view"
                      className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Order</label>
                    <input
                      type="number"
                      value={lessonForm.order}
                      onChange={(e) => setLessonForm({...lessonForm, order: parseInt(e.target.value)})}
                      min="1"
                      className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPreview"
                    checked={lessonForm.isPreview}
                    onChange={(e) => setLessonForm({...lessonForm, isPreview: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="isPreview" className="ml-2 text-sm text-slate-700">
                    Allow preview for non-enrolled users
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetLessonForm}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white/60 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {loading ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Create Lesson'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Lessons List */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            {filteredLessons.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No lessons found</h3>
                <p className="text-slate-600">Start by creating your first lesson for this course.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredLessons.map((lesson, index) => (
                  <div key={lesson.$id} className="p-6 hover:bg-white/40 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 rounded-lg text-sm font-semibold">
                            {lesson.order}
                          </span>
                          <h4 className="text-lg font-semibold text-slate-900">{lesson.title}</h4>
                          {lesson.isPreview ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Preview</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Enrolled Only</span>
                          )}
                        </div>
                        <p className="text-slate-600 mb-3">{lesson.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          {lesson.duration && (
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{lesson.duration}</span>
                            </span>
                          )}
                          {lesson.videoUrl && (
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span>Video</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editLesson(lesson)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteLesson(lesson.$id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'files' && (
        <div className="space-y-6">
          {/* Upload Form */}
          {showUploadForm && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">Upload File</h3>
                <button
                  onClick={resetUploadForm}
                  className="p-2 hover:bg-white/60 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select File</label>
                  <input
                    type="file"
                    onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                    className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                      placeholder="File title (optional)"
                      className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                      className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="materials">Course Materials</option>
                      <option value="thumbnails">Thumbnails</option>
                      <option value="certificates">Certificates</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    rows={3}
                    placeholder="File description (optional)"
                    className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetUploadForm}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white/60 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {loading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Files List */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            {filteredFiles.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📁</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No files found</h3>
                <p className="text-slate-600">Upload course materials, resources, and other files.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredFiles.map((file) => (
                  <div key={file.$id} className="p-6 hover:bg-white/40 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">
                            {file.category === 'materials' ? '📄' : 
                             file.category === 'thumbnails' ? '🖼️' : '🏆'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-900">{file.title}</h4>
                          <p className="text-sm text-slate-600 mb-2">{file.originalName}</p>
                          {file.description && (
                            <p className="text-slate-600 mb-2">{file.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full capitalize">
                              {file.category}
                            </span>
                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(storage.getFileView(BUCKET_IDS.COURSE_MATERIALS, file.fileId), '_blank')}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteFile(file)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseContentManager;