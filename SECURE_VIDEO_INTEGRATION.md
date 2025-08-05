# Secure YouTube Video Integration for Aurora Learning Platform

## Overview

This document outlines the implementation of secure YouTube video integration for the Aurora Learning Platform. The solution provides enhanced security features to protect video content while maintaining a seamless user experience.

## Security Features Implemented

### 1. Video Access Control
- **User Authentication**: Only authenticated users can access videos
- **Enrollment Verification**: Users must be enrolled in a course to view its videos
- **Access Logging**: All video interactions are logged for security monitoring
- **Token-based Access**: Secure token system for video access validation

### 2. YouTube Player Security
- **Disabled Keyboard Shortcuts**: Prevents users from using YouTube shortcuts
- **Hidden Download Options**: Removes download buttons and sharing options
- **Disabled Fullscreen**: Prevents fullscreen mode to maintain control
- **No Related Videos**: Prevents showing related videos at the end
- **Minimal Branding**: Reduces YouTube branding visibility
- **Right-click Protection**: Disables context menus on video player

### 3. Content Protection
- **Domain Restrictions**: Videos can only be embedded on authorized domains
- **Referrer Validation**: Validates video requests come from legitimate sources
- **Progress Tracking**: Monitors video watch time and completion
- **Session Management**: Tracks user sessions and video access patterns

## Implementation Details

### Files Created/Modified

#### 1. SecureVideoPlayer Component
**Location**: `src/components/features/SecureVideoPlayer.js`

- Custom YouTube player with enhanced security
- Access control integration
- Watch time tracking
- Security event logging

#### 2. Video Security Library
**Location**: `src/lib/videoSecurity.js`

- Video access validation functions
- Secure URL generation
- Access logging utilities
- Enrollment verification

#### 3. Enhanced VideoContext
**Location**: `src/contexts/VideoContext.js`

- Integrated security features
- Access control methods
- Watch time management
- Video session handling

#### 4. Security Styling
**Location**: `src/styles/video-security.css`

- Hides YouTube branding elements
- Prevents text selection
- Disables right-click context menus
- Additional security overlays

#### 5. Updated Course Page
**Location**: `src/app/courses/[id]/page.js`

- Integrated SecureVideoPlayer
- YouTube video ID extraction
- Security CSS imports

### Database Collections

#### Video Access Logs Collection
**Collection ID**: `video_access_logs`

**Schema**:
```json
{
  "userId": "string",
  "courseId": "string", 
  "lessonId": "string",
  "action": "string", // 'play', 'pause', 'complete', 'progress', 'ready'
  "timestamp": "datetime",
  "ipAddress": "string",
  "userAgent": "string",
  "sessionId": "string"
}
```

## Environment Variables

Add the following to your `.env.local` file:

```env
# Video Security Configuration
NEXT_PUBLIC_APPWRITE_COLLECTION_VIDEO_LOGS_ID=video_access_logs
VIDEO_ENCRYPTION_KEY=your_video_encryption_key_here
VIDEO_ACCESS_SECRET=your_video_access_secret_here
AURORA_DOMAIN=https://your-domain.com
YOUTUBE_API_KEY=your_youtube_api_key_here
```

## Setup Instructions

### 1. Appwrite Database Setup

#### Step 1: Create the Collection
1. Log into your Appwrite Console
2. Navigate to your project dashboard
3. Go to **Databases** → Select your main database
4. Click **Create Collection**
5. Set Collection ID: `video_access_logs`
6. Set Collection Name: `Video Access Logs`
7. Click **Create**

#### Step 2: Configure Attributes
Add the following attributes one by one:

**1. userId Attribute:**
- Click **Create Attribute** → **String**
- Key: `userId`
- Size: `50`
- Required: ✅ Yes
- Array: ❌ No
- Default: Leave empty
- Click **Create**

**2. courseId Attribute:**
- Click **Create Attribute** → **String**
- Key: `courseId`
- Size: `50`
- Required: ✅ Yes
- Array: ❌ No
- Default: Leave empty
- Click **Create**

**3. lessonId Attribute:**
- Click **Create Attribute** → **String**
- Key: `lessonId`
- Size: `50`
- Required: ✅ Yes
- Array: ❌ No
- Default: Leave empty
- Click **Create**

**4. action Attribute:**
- Click **Create Attribute** → **String**
- Key: `action`
- Size: `20`
- Required: ✅ Yes
- Array: ❌ No
- Default: Leave empty
- Click **Create**

**5. timestamp Attribute:**
- Click **Create Attribute** → **DateTime**
- Key: `timestamp`
- Required: ✅ Yes
- Array: ❌ No
- Default: Leave empty
- Click **Create**

**6. ipAddress Attribute:**
- Click **Create Attribute** → **String**
- Key: `ipAddress`
- Size: `45`
- Required: ❌ No
- Array: ❌ No
- Default: Leave empty
- Click **Create**

**7. userAgent Attribute:**
- Click **Create Attribute** → **String**
- Key: `userAgent`
- Size: `500`
- Required: ❌ No
- Array: ❌ No
- Default: Leave empty
- Click **Create**

**8. sessionId Attribute:**
- Click **Create Attribute** → **String**
- Key: `sessionId`
- Size: `100`
- Required: ❌ No
- Array: ❌ No
- Default: Leave empty
- Click **Create**

#### Step 3: Configure Permissions
1. Go to **Settings** tab in your collection
2. Scroll down to **Permissions**
3. Configure the following permissions:

**Read Permissions:**
- Click **Add Role**
- Select **Users** (authenticated users)
- Click **Add**

**Create Permissions:**
- Click **Add Role**
- Select **Users** (authenticated users)
- Click **Add**

**Update Permissions:**
- Click **Add Role**
- Select **Users** with label `admin`
- Click **Add**

**Delete Permissions:**
- Click **Add Role**
- Select **Users** with label `admin`
- Click **Add**

#### Step 4: Create Indexes (Optional but Recommended)
1. Go to **Indexes** tab
2. Create the following indexes for better performance:

**Index 1: User Activity Index**
- Click **Create Index**
- Key: `user_activity_idx`
- Type: `key`
- Attributes: `userId`, `timestamp` (descending)
- Click **Create**

**Index 2: Course Activity Index**
- Click **Create Index**
- Key: `course_activity_idx`
- Type: `key`
- Attributes: `courseId`, `timestamp` (descending)
- Click **Create**

**Index 3: Action Type Index**
- Click **Create Index**
- Key: `action_type_idx`
- Type: `key`
- Attributes: `action`, `timestamp` (descending)
- Click **Create**

### 2. YouTube API Setup

#### Step 1: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click **Select a project** dropdown
4. Click **New Project**
5. Enter project name: `Aurora Learning Platform`
6. Select your organization (if applicable)
7. Click **Create**

#### Step 2: Enable YouTube Data API
1. In the Google Cloud Console, ensure your project is selected
2. Go to **APIs & Services** → **Library**
3. Search for "YouTube Data API v3"
4. Click on **YouTube Data API v3**
5. Click **Enable**
6. Wait for the API to be enabled

#### Step 3: Create API Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the generated API key immediately
4. Click **Restrict Key** (recommended)

#### Step 4: Configure API Key Restrictions
1. In the API key configuration:
   - **Name**: Enter `Aurora Learning YouTube API Key`
   - **Application restrictions**: Select **HTTP referrers (web sites)**
   - **Website restrictions**: Add your domains:
     - `https://your-domain.com/*`
     - `https://www.your-domain.com/*`
     - `http://localhost:3000/*` (for development)
   - **API restrictions**: Select **Restrict key**
   - **Select APIs**: Choose **YouTube Data API v3**
2. Click **Save**

#### Step 5: Test API Key
1. Open a new browser tab
2. Test the API key with this URL (replace YOUR_API_KEY):
   ```
   https://www.googleapis.com/youtube/v3/videos?id=dQw4w9WgXcQ&key=YOUR_API_KEY&part=snippet
   ```
3. You should receive a JSON response with video details

#### Step 6: Add to Environment Variables
Add the API key to your `.env.local` file:
```env
YOUTUBE_API_KEY=your_actual_api_key_here
```

### 3. Environment Variables Configuration

#### Step 1: Create Environment File
1. In your project root, create `.env.local` file
2. Copy the contents from `.env.example`
3. Update the following variables:

```env
# Appwrite Configuration (Update with your values)
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="your_project_id_here"

# Database IDs (Update with your actual IDs)
NEXT_PUBLIC_APPWRITE_DATABASE_MAIN_ID="your_main_database_id"
NEXT_PUBLIC_APPWRITE_DATABASE_ANALYTICS_ID="your_analytics_database_id"
NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID="your_content_database_id"

# Collection IDs (Update with your actual collection IDs)
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS_ID="users"
NEXT_PUBLIC_APPWRITE_COLLECTION_COURSES_ID="courses"
NEXT_PUBLIC_APPWRITE_COLLECTION_LESSONS_ID="lessons"
NEXT_PUBLIC_APPWRITE_COLLECTION_ENROLLMENTS_ID="enrollments"
NEXT_PUBLIC_APPWRITE_COLLECTION_VIDEO_TOKENS_ID="video_access_tokens"
NEXT_PUBLIC_APPWRITE_COLLECTION_VIDEO_LOGS_ID="video_access_logs"
NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ACTIVITY_ID="user_activity"

# Application Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_APP_NAME="Aurora Innovative Learning"

# Security Configuration (Server-side only)
VIDEO_ENCRYPTION_KEY="your_32_character_encryption_key_here"
VIDEO_ACCESS_SECRET="your_secret_key_for_video_access_here"
AURORA_DOMAIN="https://your-domain.com"

# YouTube API Configuration
YOUTUBE_API_KEY="your_youtube_api_key_from_step_2"
```

#### Step 2: Generate Secure Keys
**For VIDEO_ENCRYPTION_KEY (32 characters):**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Using OpenSSL
openssl rand -hex 16

# Manual generation (use a password manager)
# Generate a 32-character alphanumeric string
```

**For VIDEO_ACCESS_SECRET (any length, recommended 64+ characters):**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

#### Step 3: Domain Configuration
1. **Update AURORA_DOMAIN**: Set to your production domain
2. **Update NEXT_PUBLIC_APP_URL**: Set to your application URL
3. **Ensure HTTPS**: Always use HTTPS in production

### 4. Appwrite CORS Configuration

#### Step 1: Configure Platform Settings
1. Go to Appwrite Console → Your Project
2. Navigate to **Settings** → **Platforms**
3. Click **Add Platform** → **Web**
4. Configure the platform:
   - **Name**: `Aurora Learning Web`
   - **Hostname**: `your-domain.com`
   - **Port**: Leave empty for default (443 for HTTPS)
5. Click **Next** → **Create**

#### Step 2: Add Development Platform (if needed)
1. Click **Add Platform** → **Web**
2. Configure for development:
   - **Name**: `Aurora Learning Development`
   - **Hostname**: `localhost`
   - **Port**: `3000`
3. Click **Next** → **Create**

### 5. Security Headers Configuration

#### Step 1: Update next.config.mjs
Add security headers to your Next.js configuration:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://www.youtube.com https://youtube.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com;"
          }
        ]
      }
    ]
  }
}

export default nextConfig
```

## Usage

### Basic Implementation

```jsx
import SecureVideoPlayer from '@/components/features/SecureVideoPlayer';
import '@/styles/video-security.css';

function LessonPage({ courseId, lessonId, videoUrl }) {
  const videoId = extractYouTubeVideoId(videoUrl);
  
  return (
    <div className="secure-video-container">
      <SecureVideoPlayer
        videoId={videoId}
        courseId={courseId}
        lessonId={lessonId}
      />
    </div>
  );
}
```

### Access Control

```jsx
import { useVideoContext } from '@/contexts/VideoContext';

function VideoComponent({ courseId, lessonId }) {
  const { checkVideoAccess, playVideo } = useVideoContext();
  
  const handlePlayVideo = async () => {
    const hasAccess = await checkVideoAccess(courseId, lessonId);
    if (hasAccess) {
      await playVideo({ courseId, lessonId, videoUrl });
    } else {
      console.error('Access denied');
    }
  };
}
```

## Security Monitoring

### Access Logs

All video interactions are logged with the following information:
- User ID and session details
- Course and lesson identifiers
- Action type (play, pause, complete, etc.)
- Timestamp and IP address
- User agent information

### Monitoring Dashboard

Access logs can be viewed through:
1. Appwrite Console
2. Custom admin dashboard
3. Analytics integration

## Best Practices

### 1. Content Security
- Regularly rotate encryption keys
- Monitor access patterns for anomalies
- Implement rate limiting for video requests
- Use HTTPS for all video-related communications

### 2. User Experience
- Provide clear error messages for access issues
- Implement loading states for video players
- Ensure responsive design across devices
- Test video playback on different browsers

### 3. Performance
- Implement video preloading strategies
- Use CDN for static assets
- Monitor video loading times
- Optimize for mobile devices

## Testing the Implementation

### Step 1: Verify Database Setup
1. Go to Appwrite Console → Databases → Your Database
2. Check that `video_access_logs` collection exists
3. Verify all 8 attributes are created correctly
4. Test permissions by creating a test document

### Step 2: Test YouTube API
1. Create a test page with a YouTube video
2. Check browser console for any API errors
3. Verify video loads and plays correctly
4. Test with different video IDs

### Step 3: Test Security Features
1. Right-click on video player (should be disabled)
2. Try keyboard shortcuts (should be disabled)
3. Check that YouTube branding is hidden
4. Verify access control works for unauthenticated users

### Step 4: Test Logging
1. Play a video while authenticated
2. Check Appwrite Console → Databases → video_access_logs
3. Verify log entries are created for:
   - Video ready
   - Video play
   - Video pause
   - Video complete

## Troubleshooting

### Common Issues

#### 1. Video Not Loading
**Symptoms:**
- Black screen instead of video
- "Video unavailable" message
- Loading spinner never stops

**Solutions:**
```bash
# Check YouTube video ID extraction
console.log('Video ID:', extractYouTubeVideoId(videoUrl))

# Verify API key in browser console
console.log('API Key configured:', !!process.env.YOUTUBE_API_KEY)

# Check user enrollment
console.log('User enrolled:', await checkVideoAccess(courseId, lessonId))
```

**Checklist:**
- ✅ YouTube API key is valid and not expired
- ✅ Video ID extraction returns valid ID
- ✅ User is authenticated and enrolled
- ✅ Domain is whitelisted in YouTube API settings
- ✅ Video is not private or restricted

#### 2. Access Denied Errors
**Symptoms:**
- "Access denied" messages
- Videos not playing for enrolled users
- Authentication errors

**Solutions:**
```javascript
// Debug access control
const debugAccess = async (courseId, lessonId) => {
  console.log('Checking access for:', { courseId, lessonId })
  const user = await account.get()
  console.log('Current user:', user)
  const enrollment = await checkEnrollment(user.$id, courseId)
  console.log('Enrollment status:', enrollment)
}
```

**Checklist:**
- ✅ User is properly authenticated
- ✅ User is enrolled in the course
- ✅ Course and lesson IDs are correct
- ✅ Appwrite permissions are configured correctly
- ✅ No network connectivity issues

#### 3. Security Features Not Working
**Symptoms:**
- Right-click context menu appears
- YouTube branding visible
- Keyboard shortcuts work
- Download options available

**Solutions:**
```javascript
// Check if CSS is loaded
const checkCSS = () => {
  const styles = getComputedStyle(document.querySelector('.secure-video-container'))
  console.log('CSS loaded:', styles.getPropertyValue('--security-overlay'))
}

// Verify player configuration
const checkPlayerConfig = (player) => {
  console.log('Player config:', {
    controls: player.getOptions('controls'),
    disablekb: player.getOptions('disablekb'),
    fs: player.getOptions('fs')
  })
}
```

**Checklist:**
- ✅ `video-security.css` is imported
- ✅ SecureVideoPlayer component is used
- ✅ YouTube IFrame API is loaded
- ✅ Player configuration includes security options
- ✅ Event listeners are properly attached

#### 4. Database Connection Issues
**Symptoms:**
- Logs not being created
- "Database connection failed" errors
- Appwrite authentication errors

**Solutions:**
```javascript
// Test Appwrite connection
const testConnection = async () => {
  try {
    const health = await client.health.get()
    console.log('Appwrite health:', health)
    
    const user = await account.get()
    console.log('User authenticated:', user)
    
    const databases = await databases.list()
    console.log('Databases accessible:', databases)
  } catch (error) {
    console.error('Connection test failed:', error)
  }
}
```

**Checklist:**
- ✅ Appwrite endpoint is correct
- ✅ Project ID is valid
- ✅ Database and collection IDs match
- ✅ User has proper permissions
- ✅ Network allows Appwrite connections

#### 5. Environment Variables Issues
**Symptoms:**
- "Environment variable not found" errors
- API keys not working
- Configuration errors

**Solutions:**
```bash
# Check environment variables
echo $YOUTUBE_API_KEY
echo $NEXT_PUBLIC_APPWRITE_PROJECT_ID

# Restart development server
npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev
```

**Checklist:**
- ✅ `.env.local` file exists in project root
- ✅ All required variables are set
- ✅ No extra spaces or quotes in values
- ✅ Development server restarted after changes
- ✅ Variables follow Next.js naming conventions

### Debug Mode

Enable comprehensive debugging:

```env
# Add to .env.local
NEXT_PUBLIC_DEBUG_VIDEO=true
NEXT_PUBLIC_DEBUG_APPWRITE=true
NEXT_PUBLIC_DEBUG_SECURITY=true
```

### Performance Monitoring

```javascript
// Add to your video component
const monitorPerformance = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name.includes('youtube')) {
        console.log('YouTube performance:', entry)
      }
    })
  })
  observer.observe({ entryTypes: ['navigation', 'resource'] })
}
```

### Log Analysis

Query video access logs for analysis:

```javascript
// Get user activity
const getUserActivity = async (userId, startDate, endDate) => {
  const logs = await databases.listDocuments(
    DATABASE_IDS.MAIN,
    COLLECTION_IDS.VIDEO_LOGS,
    [
      Query.equal('userId', userId),
      Query.greaterThanEqual('timestamp', startDate),
      Query.lessThanEqual('timestamp', endDate),
      Query.orderDesc('timestamp')
    ]
  )
  return logs.documents
}

// Get course analytics
const getCourseAnalytics = async (courseId) => {
  const logs = await databases.listDocuments(
    DATABASE_IDS.MAIN,
    COLLECTION_IDS.VIDEO_LOGS,
    [
      Query.equal('courseId', courseId),
      Query.equal('action', 'complete'),
      Query.orderDesc('timestamp')
    ]
  )
  return logs.documents
}
```

## Future Enhancements

1. **Advanced Analytics**
   - Detailed watch time analytics
   - User engagement metrics
   - Content performance tracking

2. **Enhanced Security**
   - Video watermarking
   - Advanced DRM integration
   - Biometric authentication

3. **Performance Optimization**
   - Adaptive bitrate streaming
   - Video compression optimization
   - Edge caching strategies

## Support

For technical support or questions about the secure video integration:

- **Documentation**: Check this file and README.md
- **Issues**: Create GitHub issues for bugs
- **Community**: Join our Discord for discussions
- **Email**: support@aurora-learning.com

---

**Note**: This implementation provides a solid foundation for secure video delivery. Regular security audits and updates are recommended to maintain the highest level of protection.