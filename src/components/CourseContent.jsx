'use client';

import React, { useState, useEffect } from 'react';
import { storage, databases, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { toast } from 'react-hot-toast';

const CourseContent = ({ courseId, userEnrolled = false }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, materials, documents, videos
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchFiles();
    }
  }, [courseId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const queries = [
        Query.equal('courseId', courseId),
        Query.equal('isActive', true)
      ];
      
      const response = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.FILE_METADATA,
        queries
      );
      
      setFiles(response.documents);
    } catch (error) {
      console.error('Error fetching course content:', error);
      toast.error('Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType, fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    if (mimeType?.startsWith('image/')) {
      return (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (mimeType?.includes('pdf') || extension === 'pdf') {
      return (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (mimeType?.startsWith('video/')) {
      return (
        <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Default document icon
    return (
      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    );
  };

  const downloadFile = async (fileId, bucketId, originalName) => {
    if (!userEnrolled) {
      toast.error('Please enroll in the course to download materials');
      return;
    }

    try {
      const result = storage.getFileDownload(bucketId, fileId);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = result;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const copyDownloadLink = async (fileId, bucketId) => {
    if (!userEnrolled) {
      toast.error('Please enroll in the course to access materials');
      return;
    }

    try {
      const downloadUrl = storage.getFileDownload(bucketId, fileId);
      await navigator.clipboard.writeText(downloadUrl);
      toast.success('Download link copied to clipboard');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.fileType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'documents') return matchesSearch && (file.mimeType?.includes('pdf') || file.mimeType?.includes('document'));
    if (filter === 'images') return matchesSearch && file.mimeType?.startsWith('image/');
    if (filter === 'videos') return matchesSearch && file.mimeType?.startsWith('video/');
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Course Materials ({files.length})
          </h3>
          {!userEnrolled && (
            <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Enroll to access materials
            </span>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Materials</option>
            <option value="documents">Documents</option>
            <option value="images">Images</option>
            <option value="videos">Videos</option>
          </select>
        </div>

        {/* Files List */}
        {filteredFiles.length > 0 ? (
          <div className="space-y-3">
            {filteredFiles.map((file) => (
              <div key={file.$id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4 flex-1">
                  {getFileIcon(file.mimeType, file.originalName)}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </h4>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>{file.fileType}</span>
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {userEnrolled && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyDownloadLink(file.fileName, file.bucketId)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy download link"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => downloadFile(file.fileName, file.bucketId, file.originalName)}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' ? 'No materials found matching your criteria.' : 'No course materials available yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContent;