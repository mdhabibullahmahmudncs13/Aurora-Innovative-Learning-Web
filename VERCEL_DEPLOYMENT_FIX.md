# Vercel Deployment Fix Guide

## Issue
The error "No session found: Failed to fetch" occurs in production because:
1. Environment variables are not configured in Vercel
2. Appwrite project doesn't have the Vercel domain in platform settings

## Solution

### Step 1: Configure Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all the following environment variables:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6885705a00294c065e7f
NEXT_PUBLIC_APPWRITE_DATABASE_MAIN_ID=688571c300214b29155b
NEXT_PUBLIC_APPWRITE_DATABASE_ANALYTICS_ID=aurora_analytics
NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID=aurora_content
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS_ID=users
NEXT_PUBLIC_APPWRITE_COLLECTION_COURSES_ID=courses
NEXT_PUBLIC_APPWRITE_COLLECTION_LESSONS_ID=lessons
NEXT_PUBLIC_APPWRITE_COLLECTION_ENROLLMENTS_ID=enrollments
NEXT_PUBLIC_APPWRITE_COLLECTION_VIDEO_TOKENS_ID=video_access_tokens
NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ACTIVITY_ID=user_activity
NEXT_PUBLIC_APPWRITE_COLLECTION_COURSE_ANALYTICS_ID=course_analytics
NEXT_PUBLIC_APPWRITE_COLLECTION_FILE_METADATA_ID=file_metadata
NEXT_PUBLIC_APPWRITE_BUCKET_COURSE_MATERIALS_ID=course-materials
NEXT_PUBLIC_APPWRITE_BUCKET_USER_UPLOADS_ID=user-uploads
NEXT_PUBLIC_APPWRITE_BUCKET_THUMBNAILS_ID=thumbnails
NEXT_PUBLIC_APPWRITE_BUCKET_CERTIFICATES_ID=certificates
NEXT_PUBLIC_APPWRITE_FUNCTION_ENROLLMENT_ID=enrollment-handler
NEXT_PUBLIC_APPWRITE_FUNCTION_YOUTUBE_ID=youtube-integration
NEXT_PUBLIC_APPWRITE_FUNCTION_NOTIFICATIONS_ID=notification-system
NEXT_PUBLIC_APPWRITE_FUNCTION_VIDEO_PROGRESS_ID=video-progress
NEXT_PUBLIC_APPWRITE_FUNCTION_SECURITY_ID=security-monitoring
NEXT_PUBLIC_APPWRITE_FUNCTION_VIDEO_ACCESS_ID=video-access-token
NEXT_PUBLIC_APPWRITE_FUNCTION_SECURE_EMBED_ID=secure-video-embed
NEXT_PUBLIC_APP_URL=https://aurora-innovative-learning-web.vercel.app
NEXT_PUBLIC_APP_NAME=Aurora Innovative Learning
```

**Important:** Replace `https://aurora-innovative-learning-web.vercel.app` with your actual Vercel domain.

### Step 2: Configure Appwrite Platform Settings

1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Select your project (ID: 6885705a00294c065e7f)
3. Go to Settings → Platforms
4. Add a new Web Platform with:
   - **Name:** Vercel Production
   - **Hostname:** your-vercel-domain.vercel.app (replace with actual domain)
   - **Port:** 443 (for HTTPS)

### Step 3: Update CORS Settings (if needed)

1. In Appwrite Console, go to Settings → CORS
2. Add your Vercel domain: `https://your-vercel-domain.vercel.app`

### Step 4: Redeploy

1. After configuring environment variables in Vercel
2. Trigger a new deployment by pushing a commit or manually redeploying

## Verification

After deployment, the session management should work correctly and the "No session found" error should be resolved.

## Additional Notes

- Make sure all environment variables are set to "Production" environment in Vercel
- The Appwrite project ID and endpoint must match exactly
- CORS settings are crucial for cross-origin requests to work