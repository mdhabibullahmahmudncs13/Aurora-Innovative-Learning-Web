import { Client, Account, Databases, Storage, Functions, Teams } from 'appwrite';

const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const teams = new Teams(client);

// Database IDs
export const DATABASE_IDS = {
    MAIN: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_MAIN_ID || '688571c300214b29155b',
    ANALYTICS: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ANALYTICS_ID || 'aurora_analytics',
    CONTENT: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID || 'aurora_content'
};

// Collection IDs
export const COLLECTION_IDS = {
    USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS_ID || 'users',
    COURSES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COURSES_ID || 'courses',
    LESSONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LESSONS_ID || 'lessons',
    ENROLLMENTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ENROLLMENTS_ID || 'enrollments',
    VIDEO_ACCESS_TOKENS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_VIDEO_TOKENS_ID || 'video_access_tokens',
    USER_ACTIVITY: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ACTIVITY_ID || 'user_activity',
    COURSE_ANALYTICS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COURSE_ANALYTICS_ID || 'course_analytics',
    FILE_METADATA: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FILE_METADATA_ID || 'file_metadata',
    PAYMENT_METHODS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAYMENT_METHODS_ID || 'payment_methods',
    PAYMENT_REQUESTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAYMENT_REQUESTS_ID || 'payment_requests'
};

// Storage Bucket IDs
export const BUCKET_IDS = {
    COURSE_MATERIALS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_COURSE_MATERIALS_ID || 'course-materials',
    USER_UPLOADS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_USER_UPLOADS_ID || 'user-uploads',
    THUMBNAILS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_THUMBNAILS_ID || 'thumbnails',
    CERTIFICATES: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_CERTIFICATES_ID || 'certificates'
};

// Function IDs
export const FUNCTION_IDS = {
    ENROLLMENT_HANDLER: process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ENROLLMENT_ID || 'enrollment-handler',
    YOUTUBE_INTEGRATION: process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_YOUTUBE_ID || 'youtube-integration',
    NOTIFICATION_SYSTEM: process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_NOTIFICATIONS_ID || 'notification-system',
    VIDEO_PROGRESS: process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_VIDEO_PROGRESS_ID || 'video-progress',
    SECURITY_MONITORING: process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_SECURITY_ID || 'security-monitoring',
    VIDEO_ACCESS_TOKEN: process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_VIDEO_ACCESS_ID || 'video-access-token',
    SECURE_VIDEO_EMBED: process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_SECURE_EMBED_ID || 'secure-video-embed'
};

export { client };
export default client;