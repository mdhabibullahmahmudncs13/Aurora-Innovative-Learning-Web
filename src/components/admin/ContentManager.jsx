'use client';

import React, { useState, useEffect } from 'react';
import { storage, databases, BUCKET_IDS, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import toast from 'react-hot-toast';

const ContentManager = ({ courseId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, materials, thumbnails, certificates
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [courseId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const queries = [Query.equal('courseId', courseId)];
      
      const response = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.FILE_METADATA,
        queries
      );
      
      setFiles(response.documents);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId, bucketId, metadataId) => {
    try {
      // Delete from storage
      await storage.deleteFile(bucketId, fileId);
      
      // Delete metadata from database
      await databases.deleteDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.FILE_METADATA,
        metadataId
      );
      
      // Update local state
      setFiles(files.filter(file => file.$id !== metadataId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const deleteSelectedFiles = async () => {
    try {
      for (const fileId of selectedFiles) {
        const file = files.find(f => f.$id === fileId);
        if (file) {
          await deleteFile(file.fileId, file.bucketId, file.$id);
        }
      }
      setSelectedFiles([]);
      setShowDeleteModal(false);
      toast.success(`Deleted ${selectedFiles.length} file(s)`);
    } catch (error) {
      console.error('Error deleting files:', error);
      toast.error('Failed to delete some files');
    }
  };

  const downloadFile = async (fileId, bucketId, fileName) => {
    try {
      const result = await storage.getFileDownload(bucketId, fileId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([result]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const copyDownloadLink = (fileId, bucketId) => {
    const downloadUrl = storage.getFileDownload(bucketId, fileId);
    navigator.clipboard.writeText(downloadUrl);
    toast.success('Download link copied to clipboard');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (category, fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (category === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    
    if (category === 'video' || ['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
      return (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    
    if (['pdf'].includes(extension)) {
      return (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const filteredFiles = files.filter(file => {
    const matchesFilter = filter === 'all' || file.fileType === filter;
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAllFiles = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.$id));
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
        {selectedFiles.length > 0 && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete Selected ({selectedFiles.length})
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="all">All Files</option>
          <option value="materials">Course Materials</option>
          <option value="thumbnails">Thumbnails</option>
          <option value="certificates">Certificates</option>
        </select>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No files found</p>
        </div>
      ) : (
        <>
          {/* Select All Checkbox */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
              onChange={selectAllFiles}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Select All ({filteredFiles.length} files)
            </label>
          </div>

          {/* Files List */}
          <div className="space-y-3">
            {filteredFiles.map((file) => (
              <div key={file.$id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.$id)}
                      onChange={() => toggleFileSelection(file.$id)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    {getFileIcon(file.fileType, file.originalName)}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{file.originalName}</h4>
                      <p className="text-xs text-gray-500">File ID: {file.fileName}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</span>
                        <span className="text-xs text-gray-500">{formatDate(file.uploadedAt)}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {file.fileType}
                        </span>
                        <span className="text-xs text-gray-500">{file.mimeType}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadFile(file.fileName, file.bucketId, file.originalName)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Download"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => copyDownloadLink(file.fileName, file.bucketId)}
                      className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      title="Copy Link"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteFile(file.fileName, file.bucketId, file.$id)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
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
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedFiles.length} selected file(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelectedFiles}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;