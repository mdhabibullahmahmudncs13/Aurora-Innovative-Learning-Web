'use client';

import React, { useState } from 'react';
import { storage, databases, BUCKET_IDS, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { ID } from 'appwrite';
import toast from 'react-hot-toast';

const ContentUpload = ({ courseId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadType, setUploadType] = useState('materials'); // materials, thumbnails, certificates
  const [fileMetadata, setFileMetadata] = useState({
    title: '',
    description: '',
    category: 'document' // document, video, image, audio, other
  });

  const fileTypes = {
    materials: {
      accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar',
      maxSize: 50 * 1024 * 1024, // 50MB
      bucket: BUCKET_IDS.COURSE_MATERIALS
    },
    thumbnails: {
      accept: '.jpg,.jpeg,.png,.gif,.webp',
      maxSize: 5 * 1024 * 1024, // 5MB
      bucket: BUCKET_IDS.THUMBNAILS
    },
    certificates: {
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSize: 10 * 1024 * 1024, // 10MB
      bucket: BUCKET_IDS.CERTIFICATES
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const currentType = fileTypes[uploadType];
    
    // Validate file size and type
    const validFiles = files.filter(file => {
      if (file.size > currentType.maxSize) {
        toast.error(`File ${file.name} is too large. Max size: ${currentType.maxSize / (1024 * 1024)}MB`);
        return false;
      }
      return true;
    });
    
    setSelectedFiles(validFiles);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    if (!fileMetadata.title.trim()) {
      toast.error('Please provide a title for the upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles = [];
      const currentType = fileTypes[uploadType];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileId = ID.unique();
        
        // Upload file to Appwrite storage
        const uploadedFile = await storage.createFile(
          currentType.bucket,
          fileId,
          file
        );

        // Create file metadata record
        const metadata = {
          fileName: uploadedFile.$id, // Appwrite file ID
          originalName: file.name, // Original file name
          fileSize: file.size,
          mimeType: file.type,
          bucketId: currentType.bucket,
          courseId: courseId,
          uploadedBy: 'current-user', // TODO: Get actual user ID from auth context
          uploadedAt: new Date().toISOString(),
          fileType: uploadType,
          isActive: true
        };

        // Save metadata to database
        const metadataDoc = await databases.createDocument(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.FILE_METADATA,
          ID.unique(),
          metadata
        );

        uploadedFiles.push({
          file: uploadedFile,
          metadata: metadataDoc
        });

        // Update progress
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      toast.success(`Successfully uploaded ${uploadedFiles.length} file(s)`);
      
      // Reset form
      setSelectedFiles([]);
      setFileMetadata({
        title: '',
        description: '',
        category: 'document'
      });
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(uploadedFiles);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Course Content</h3>
      
      {/* Upload Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Type</label>
        <select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="materials">Course Materials</option>
          <option value="thumbnails">Thumbnails</option>
          <option value="certificates">Certificates</option>
        </select>
      </div>

      {/* File Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={fileMetadata.title}
            onChange={(e) => setFileMetadata({...fileMetadata, title: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter content title"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={fileMetadata.category}
            onChange={(e) => setFileMetadata({...fileMetadata, category: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="document">Document</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={fileMetadata.description}
          onChange={(e) => setFileMetadata({...fileMetadata, description: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Enter content description"
        />
      </div>

      {/* File Upload Area */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Files</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
          <input
            type="file"
            multiple
            accept={fileTypes[uploadType].accept}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">
                Accepted: {fileTypes[uploadType].accept} (Max: {fileTypes[uploadType].maxSize / (1024 * 1024)}MB)
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  disabled={uploading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          onClick={uploadFiles}
          disabled={uploading || selectedFiles.length === 0 || !fileMetadata.title.trim()}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {uploading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>
    </div>
  );
};

export default ContentUpload;