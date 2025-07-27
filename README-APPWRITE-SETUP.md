# 🚀 Appwrite Backend Setup Guide

## Aurora Learning Platform - Complete Appwrite Configuration

This comprehensive guide will walk you through setting up Appwrite as the backend for the Aurora Learning Platform. Follow these steps carefully to ensure a smooth setup process.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Account & Project Setup](#account--project-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Collection Configuration](#collection-configuration)
6. [Permissions & Security](#permissions--security)
7. [Authentication Setup](#authentication-setup)
8. [Performance Optimization](#performance-optimization)
9. [Testing & Verification](#testing--verification)
10. [Troubleshooting](#troubleshooting)
11. [Production Deployment](#production-deployment)

## 🔧 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed on your system
- **npm** or **yarn** package manager
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Basic understanding of databases and APIs
- **Appwrite Cloud Account** (free tier available)

## 🏗️ Account & Project Setup

### Step 1: Create Appwrite Account

1. Visit [Appwrite Cloud](https://cloud.appwrite.io)
2. Click **"Sign Up"** and create your account
3. Verify your email address
4. Complete the onboarding process

### Step 2: Create New Project

1. In the Appwrite Console, click **"Create Project"**
2. Enter project details:
   ```
   Project Name: Aurora Learning Platform
   Project ID: (auto-generated - copy this!)
   Region: Choose closest to your users (e.g., Frankfurt)
   ```
3. Click **"Create"**
4. **⚠️ IMPORTANT**: Copy your **Project ID** - you'll need it later

### Step 3: Configure Web Platform

1. Navigate to **Settings** → **Platforms**
2. Click **"Add Platform"** → **"Web App"**
3. Configure platform:
   ```
   Name: Aurora Learning Web
   Hostname: localhost (for development)
   Port: 3000
   ```
4. Click **"Register"**

## ⚙️ Environment Configuration

### Step 4: Update Environment Variables

1. Open your project's `.env.local` file
2. Replace the placeholder values:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="YOUR_ACTUAL_PROJECT_ID_HERE"

# Database IDs
NEXT_PUBLIC_APPWRITE_DATABASE_MAIN_ID=aurora_main
NEXT_PUBLIC_APPWRITE_DATABASE_ANALYTICS_ID=aurora_analytics
NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID=aurora_content

# Collection IDs
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS_ID=users
NEXT_PUBLIC_APPWRITE_COLLECTION_COURSES_ID=courses
NEXT_PUBLIC_APPWRITE_COLLECTION_LESSONS_ID=lessons
NEXT_PUBLIC_APPWRITE_COLLECTION_ENROLLMENTS_ID=enrollments

# Storage Bucket IDs
NEXT_PUBLIC_APPWRITE_BUCKET_COURSE_MATERIALS_ID=course-materials
NEXT_PUBLIC_APPWRITE_BUCKET_USER_UPLOADS_ID=user-uploads
NEXT_PUBLIC_APPWRITE_BUCKET_THUMBNAILS_ID=thumbnails
NEXT_PUBLIC_APPWRITE_BUCKET_CERTIFICATES_ID=certificates
```

### Important Notes:
- Replace `YOUR_ACTUAL_PROJECT_ID_HERE` with your actual Project ID
- Ensure the endpoint matches your selected region
- Save the file and restart your development server

## 🗄️ Database Setup

### Step 5: Create Main Database

1. In Appwrite Console, go to **"Databases"**
2. Click **"Create Database"**
3. Configure database:
   ```
   Database ID: aurora_main
   Database Name: Aurora Main Database
   ```
4. Click **"Create"**

## 📊 Collection Configuration

Create the following collections in your `aurora_main` database:

### Collection 1: Users

**Collection Setup:**
```
Collection ID: users
Collection Name: Users
```

**Attributes:**
| Attribute | Type | Size | Required | Default | Array |
|-----------|-------|------|----------|---------|-------|
| email     | Email | -    |   ✅    | -  | ❌ |
| name      | String | 255 |   ✅    | - | ❌ |
| role      | String | 50 |   ✅    | "regular" | ❌ |
| avatar    | URL | - | ❌ | null | ❌ |
| bio       | String | 1000 | ❌ | null | ❌ |
| createdAt | DateTime | - | ✅ | - | ❌ |
| updatedAt | DateTime | - | ✅ | - | ❌ |

| Attribute | Type     | Size | Required | Default   | Array |
|-----------|----------|------|----------|-----------|-------|
| email     | Email    | -    | ✅       | -         | ❌    |
| name      | String   | 255  | ✅       | -         | ❌    |
| role      | String   | 50   | ✅       | "regular" | ❌    |
| avatar    | URL      | -    | ❌       | null      | ❌    |
| bio       | String   | 1000 | ❌       | null      | ❌    |
| createdAt | DateTime | -    | ✅       | -         | ❌    |
| updatedAt | DateTime | -    | ✅       | -         | ❌    |

**Creation Steps:**
1. Click **"Create Collection"**
2. Enter Collection ID: `users`
3. Add each attribute using the **"Create Attribute"** button
4. For each attribute, specify the type, size, and requirements as shown above

### Collection 2: Courses

**Collection Setup:**
```
Collection ID: courses
Collection Name: Courses
```

**Attributes:**
| Attribute | Type | Size | Required | Default | Array |
|-----------|------|------|----------|---------|-------|
| title | String | 255 | ✅ | - | ❌ |
| description | String | 2000 | ✅ | - | ❌ |
| instructor | String | 255 | ✅ | - | ❌ |
| category | String | 100 | ✅ | - | ❌ |
| level | String | 50 | ✅ | - | ❌ |
| duration | String | 100 | ✅ | - | ❌ |
| price | Float | - | ✅ | - | ❌ |
| thumbnail | URL | - | ❌ | null | ❌ |
| tags | String | 50 | ❌ | [] | ✅ |
| lessons | String | 255 | ❌ | [] | ✅ |
| enrollmentCount | Integer | - | ❌ | 0 | ❌ |
| rating | Float | - | ❌ | 0 | ❌ |
| isPublished | Boolean | - | ❌ | false | ❌ |
| createdAt | DateTime | - | ✅ | - | ❌ |
| updatedAt | DateTime | - | ✅ | - | ❌ |


| Attribute        | Type     | Size | Required | Default | Array |
|------------------|----------|------|----------|---------|-------|
| title            | String   | 255  | ✅       | -       | ❌    |
| description      | String   | 2000 | ✅       | -       | ❌    |
| instructor       | String   | 255  | ✅       | -       | ❌    |
| category         | String   | 100  | ✅       | -       | ❌    |
| level            | String   | 50   | ✅       | -       | ❌    |
| duration         | String   | 100  | ✅       | -       | ❌    |
| price            | Float    | -    | ✅       | -       | ❌    |
| thumbnail        | URL      | -    | ❌       | null    | ❌    |
| tags             | String   | 50   | ❌       | []      | ✅    |
| lessons          | String   | 255  | ❌       | []      | ✅    |
| enrollmentCount  | Integer  | -    | ❌       | 0       | ❌    |
| rating           | Float    | -    | ❌       | 0       | ❌    |
| isPublished      | Boolean  | -    | ❌       | false   | ❌    |
| createdAt        | DateTime | -    | ✅       | -       | ❌    |
| updatedAt        | DateTime | -    | ✅       | -       | ❌    |

### Collection 3: Lessons

**Collection Setup:**
```
Collection ID: lessons
Collection Name: Lessons
```

**Attributes:**
| Attribute | Type | Size | Required | Default | Array |
|-----------|------|------|----------|---------|-------|
| courseId | String | 255 | ✅ | - | ❌ |
| title | String | 255 | ✅ | - | ❌ |
| description | String | 1000 | ❌ | null | ❌ |
| videoUrl | URL | - | ✅ | - | ❌ |
| duration | String | 50 | ✅ | - | ❌ |
| order | Integer | - | ✅ | - | ❌ |
| isPreview | Boolean | - | ❌ | false | ❌ |
| materials | String | 255 | ❌ | [] | ✅ |
| createdAt | DateTime | - | ✅ | - | ❌ |
| updatedAt | DateTime | - | ✅ | - | ❌ |

### Collection 4: Enrollments

**Collection Setup:**
```
Collection ID: enrollments
Collection Name: Enrollments
```

**Attributes:**
| Attribute | Type | Size | Required | Default | Array |
|-----------|------|------|----------|---------|-------|
| userId | String | 255 | ✅ | - | ❌ |
| courseId | String | 255 | ✅ | - | ❌ |
| enrolledAt | DateTime | - | ✅ | - | ❌ |
| progress | Float | - | ❌ | 0 | ❌ |
| completedLessons | String | 255 | ❌ | [] | ✅ |
| lastAccessedAt | DateTime | - | ❌ | null | ❌ |
| isCompleted | Boolean | - | ❌ | false | ❌ |
| completedAt | DateTime | - | ❌ | null | ❌ |

## 🔐 Permissions & Security

### Step 6: Configure Collection Permissions

For each collection, navigate to **Settings** → **Permissions** and configure:

#### Users Collection Permissions:
```
Create: users
Read: user:[USER_ID]
Update: user:[USER_ID]
Delete: user:[USER_ID]
```

#### Courses Collection Permissions:
```
Read: users
Create: role:instructor, role:admin
Update: role:instructor, role:admin
Delete: role:admin
```

#### Lessons Collection Permissions:
```
Read: users
Create: role:instructor, role:admin
Update: role:instructor, role:admin
Delete: role:admin
```

#### Enrollments Collection Permissions:
```
Create: users
Read: user:[USER_ID]
Update: user:[USER_ID]
Delete: user:[USER_ID]
```

### Permission Explanation:
- `users`: All authenticated users
- `user:[USER_ID]`: Specific user (replaced with actual user ID)
- `role:instructor`: Users with instructor role
- `role:admin`: Users with admin role

## 🔑 Authentication Setup

### Step 7: Enable Authentication Methods

1. Navigate to **Auth** in the sidebar
2. Go to **Settings** tab
3. Enable authentication methods:

#### Email/Password Authentication:
- Toggle **"Email/Password"** to **ON**
- Configure session length (default: 1 year)
- Set password requirements if needed

#### Optional OAuth Providers:

**Google OAuth:**
1. Enable **"Google"**
2. Add your Google Client ID and Secret
3. Configure redirect URLs

**GitHub OAuth:**
1. Enable **"GitHub"**
2. Add your GitHub Client ID and Secret
3. Configure redirect URLs

## ⚡ Performance Optimization

### Step 8: Create Database Indexes

Create indexes for better query performance:

#### Users Collection Indexes:
1. Go to **Indexes** tab in Users collection
2. Create index:
   ```
   Key: email_index
   Type: key
   Attributes: email (ASC)
   ```

#### Lessons Collection Indexes:
1. Go to **Indexes** tab in Lessons collection
2. Create index:
   ```
   Key: courseId_index
   Type: key
   Attributes: courseId (ASC)
   ```

#### Enrollments Collection Indexes:
1. Go to **Indexes** tab in Enrollments collection
2. Create multiple indexes:
   
   **Index 1:**
   ```
   Key: userId_index
   Type: key
   Attributes: userId (ASC)
   ```
   
   **Index 2:**
   ```
   Key: courseId_index
   Type: key
   Attributes: courseId (ASC)
   ```
   
   **Index 3 (Composite):**
   ```
   Key: user_course_index
   Type: key
   Attributes: userId (ASC), courseId (ASC)
   ```

## 🧪 Testing & Verification

### Step 9: Test Your Setup

1. **Restart Development Server:**
   ```bash
   npm run dev
   ```

2. **Open Application:**
   Navigate to `http://localhost:3000`

3. **Test User Registration:**
   - Go to the signup page
   - Create a new account
   - Check Appwrite Console → Auth → Users
   - Verify user appears in the list

4. **Test User Profile Creation:**
   - Check Databases → aurora_main → users collection
   - Verify user document was created with correct attributes

5. **Test Authentication:**
   - Log out and log back in
   - Verify session persistence
   - Check browser developer tools for any errors

### Verification Checklist:

- [ ] ✅ Appwrite project created
- [ ] ✅ Project ID updated in `.env.local`
- [ ] ✅ Web platform configured for localhost:3000
- [ ] ✅ Database `aurora_main` created
- [ ] ✅ Users collection created with all attributes
- [ ] ✅ Courses collection created with all attributes
- [ ] ✅ Lessons collection created with all attributes
- [ ] ✅ Enrollments collection created with all attributes
- [ ] ✅ Permissions configured for all collections
- [ ] ✅ Email/Password authentication enabled
- [ ] ✅ Database indexes created
- [ ] ✅ User registration works
- [ ] ✅ User login works
- [ ] ✅ No console errors

## 🔍 Troubleshooting

### Common Issues & Solutions:

#### 1. "Document with the requested ID could not be found"

**Cause:** Database or collections not created properly

**Solution:**
- Verify `aurora_main` database exists
- Check all 4 collections are created: `users`, `courses`, `lessons`, `enrollments`
- Ensure collection IDs match exactly with `.env.local`
- Restart development server after changes

#### 2. "Project with the requested ID could not be found"

**Cause:** Incorrect Project ID in environment variables

**Solution:**
- Copy Project ID from Appwrite Console dashboard
- Update `NEXT_PUBLIC_APPWRITE_PROJECT_ID` in `.env.local`
- Ensure no extra spaces or characters
- Restart development server

#### 3. "Creation of a session is prohibited when a session is active"

**Cause:** Attempting to create session while one exists

**Solution:**
- The app handles this automatically
- If persistent, clear browser storage:
  ```javascript
  // In browser console
  localStorage.clear();
  sessionStorage.clear();
  ```
- Refresh the page

#### 4. Permission Denied Errors

**Cause:** Incorrect collection permissions

**Solution:**
- Review permission settings for each collection
- Ensure proper syntax: `user:[USER_ID]`, `role:admin`
- Verify user is authenticated before making requests
- Check user role matches required permissions

#### 5. CORS Errors

**Cause:** Platform not configured properly

**Solution:**
- Add `localhost` with port `3000` to platform settings
- For production, add your domain
- Ensure protocol matches (http/https)

#### 6. Environment Variables Not Loading

**Cause:** File location or naming issues

**Solution:**
- Ensure file is named exactly `.env.local`
- Place file in project root (same level as `package.json`)
- Restart development server after changes
- Check for typos in variable names (case-sensitive)

### Debug Steps:

1. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for error messages in Console tab
   - Check Network tab for failed requests

2. **Verify Appwrite Console:**
   - Check project dashboard for any alerts
   - Review database and collection structure
   - Monitor real-time logs

3. **Test API Connection:**
   ```javascript
   // Test in browser console
   import { account } from './src/lib/appwrite';
   account.get().then(console.log).catch(console.error);
   ```

## 🚀 Production Deployment

### Step 10: Prepare for Production

#### Update Platform Settings:
1. Go to **Settings** → **Platforms**
2. Add production platform:
   ```
   Name: Aurora Learning Production
   Hostname: yourdomain.com
   Port: 443 (for HTTPS)
   ```

#### Environment Variables:
1. Update production `.env.local`:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
   NEXT_PUBLIC_APPWRITE_PROJECT_ID="your_project_id"
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

#### Security Checklist:
- [ ] ✅ Review and tighten permissions
- [ ] ✅ Enable rate limiting
- [ ] ✅ Configure proper CORS settings
- [ ] ✅ Set up monitoring and alerts
- [ ] ✅ Enable HTTPS
- [ ] ✅ Review authentication settings

## 📚 Additional Resources

- **[Appwrite Documentation](https://appwrite.io/docs)** - Official documentation
- **[Appwrite Community](https://appwrite.io/discord)** - Discord community support
- **[Appwrite GitHub](https://github.com/appwrite/appwrite)** - Source code and issues
- **[Next.js Documentation](https://nextjs.org/docs)** - Frontend framework docs

## 🆘 Getting Help

If you encounter issues not covered in this guide:

1. **Check the Console:** Browser developer tools and Appwrite Console logs
2. **Search Documentation:** Official Appwrite docs and community forums
3. **Community Support:** Join the Appwrite Discord community
4. **GitHub Issues:** Check existing issues or create a new one

---

## 🎉 Congratulations!

You've successfully set up Appwrite as the backend for your Aurora Learning Platform! Your application now has:

- ✅ **User Authentication** - Secure login and registration
- ✅ **User Management** - Profile creation and updates
- ✅ **Course Management** - Create, read, update courses
- ✅ **Lesson Management** - Organize course content
- ✅ **Enrollment Tracking** - Monitor student progress
- ✅ **Performance Optimization** - Database indexes for speed
- ✅ **Security** - Proper permissions and access control

**Next Steps:**
- Start building your course content
- Customize the user interface
- Add payment integration
- Implement advanced features

**Happy coding! 🚀**