import { databases, DATABASE_IDS, COLLECTION_IDS, Query, ID } from './appwrite';

export const validateVideoAccess = async (userId, courseId, lessonId) => {
  try {
    // Check if user is enrolled in course
    const enrollments = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_MAIN_ID,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ENROLLMENTS_ID,
      [
        Query.equal('userId', userId),
        Query.equal('courseId', courseId),
        Query.equal('status', 'active')
      ]
    );

    return enrollments.documents.length > 0;
  } catch (error) {
    console.error('Video access validation error:', error);
    return false;
  }
};

export const generateSecureVideoUrl = (videoId, userId, courseId) => {
  // Generate a temporary access token (optional)
  const timestamp = Date.now();
  const signature = btoa(`${userId}-${courseId}-${timestamp}`);
  
  return {
    videoId,
    accessToken: signature,
    timestamp
  };
};

export const logVideoAccess = async (userId, courseId, lessonId, action) => {
  try {
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_MAIN_ID,
      'video_access_logs', // Create this collection in Appwrite
      'unique()',
      {
        userId,
        courseId,
        lessonId,
        action, // 'play', 'pause', 'complete'
        timestamp: new Date().toISOString(),
        ipAddress: 'client-side' // Limited on client-side
      }
    );
  } catch (error) {
    console.error('Video access logging error:', error);
  }
};