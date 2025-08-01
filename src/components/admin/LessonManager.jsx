'use client';

import React, { useState, useEffect } from 'react';
import { databases, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import toast from 'react-hot-toast';
import { useVideo } from '@/contexts/VideoContext';

const LessonManager = ({ courseId, courseTitle, onClose }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { validateYouTubeVideo } = useVideo();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    duration: '',
    order: 1,
    isPreview: false
  });

  useEffect(() => {
    if (courseId) {
      fetchLessons();
    }
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.LESSONS,
        [
          Query.equal('courseId', courseId),
          Query.orderAsc('order')
        ]
      );
      setLessons(response.documents);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.youtubeUrl.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      // Validate YouTube URL
      const result = await validateYouTubeVideo(formData.youtubeUrl);
      if (!result.success) {
        toast.error(result.error || 'Please enter a valid YouTube URL');
        return;
      }
      const videoData = result.videoData;

      const lessonData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          courseId: courseId,
          videoUrl: formData.youtubeUrl.trim(),
          duration: parseFloat(formData.duration) || videoData.duration || 0,
          order: formData.order,
          isPreview: formData.isPreview,
          materials: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

      if (editingLesson) {
        await databases.updateDocument(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.LESSONS,
          editingLesson.$id,
          lessonData
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

      resetForm();
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Failed to save lesson');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      await databases.deleteDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.LESSONS,
        lessonId
      );
      toast.success('Lesson deleted successfully!');
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Failed to delete lesson');
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      youtubeUrl: '', // Don't show the actual URL for security
      duration: lesson.duration || '',
      order: lesson.order,
      isPreview: lesson.isPreview || false
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      duration: '',
      order: lessons.length + 1,
      isPreview: false
    });
    setEditingLesson(null);
    setShowCreateForm(false);
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration);
    const seconds = Math.round((duration - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Loading lessons...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Lesson Management</h3>
            <p className="text-sm text-gray-500">{courseTitle} • {lessons.length} lessons</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Action Header */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Manage video lessons for this course</p>
              </div>
              <button
                onClick={() => {
                  setFormData({ ...formData, order: lessons.length + 1 });
                  setShowCreateForm(!showCreateForm);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {showCreateForm ? 'Cancel' : 'Add Lesson'}
              </button>
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
                </h4>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lesson Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter lesson title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lesson Order
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube Video URL *
                    </label>
                    <input
                      type="url"
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter lesson description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Auto-detected from YouTube"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPreview"
                      checked={formData.isPreview}
                      onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPreview" className="ml-2 block text-sm text-gray-700">
                      Allow preview for non-enrolled users
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {submitting && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      {submitting ? 'Saving...' : (editingLesson ? 'Update Lesson' : 'Create Lesson')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lessons List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {lessons.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
                  <p className="text-gray-500 mb-4">Start building your course by adding video lessons.</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add First Lesson
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.$id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm font-medium">
                              #{lesson.order}
                            </span>
                            <h4 className="text-lg font-medium text-gray-900">{lesson.title}</h4>
                            {lesson.isPreview && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                Preview
                              </span>
                            )}
                          </div>
                          
                          {lesson.description && (
                            <p className="text-gray-600 mb-2">{lesson.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Duration: {formatDuration(lesson.duration)}</span>
                            <span>Created: {new Date(lesson.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(lesson)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Edit lesson"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleDelete(lesson.$id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete lesson"
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
        </div>
      </div>
    </div>
  );
};

export default LessonManager;