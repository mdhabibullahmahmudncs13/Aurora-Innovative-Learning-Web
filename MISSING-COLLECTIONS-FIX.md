# 🔧 Missing Collections Fix Guide

## Problem
Your application is showing the error: **"Collection with the requested ID could not be found"**

This happens because the content management features require additional collections that aren't created yet.

## 🚨 Quick Fix Required

The following collections are missing from your Appwrite database:
- ❌ `file_metadata` (Required for content management)
- ❌ `video_access_tokens` (Optional - for video features)
- ❌ `user_activity` (Optional - for analytics)
- ❌ `course_analytics` (Optional - for analytics)

## 🛠️ Step-by-Step Fix

### Step 1: Create FILE_METADATA Collection (CRITICAL)

This collection is **required** for the content management features to work.

1. **Go to Appwrite Console**
   - Open [Appwrite Console](https://cloud.appwrite.io)
   - Navigate to your project
   - Go to **Databases** → **Main Database** (ID: `688571c300214b29155b`)

2. **Create Collection**
   - Click **"Create Collection"**
   - Set **Collection ID**: `file_metadata`
   - Set **Collection Name**: `File Metadata`
   - Click **"Create"**

3. **Add Attributes** (Click "Create Attribute" for each):

   | Attribute | Type | Size | Required | Default |
   |-----------|------|------|----------|---------|
   | `fileName` | String | 255 | ✅ Yes | - |
   | `originalName` | String | 255 | ✅ Yes | - |
   | `fileSize` | Integer | - | ✅ Yes | - |
   | `mimeType` | String | 100 | ✅ Yes | - |
   | `bucketId` | String | 100 | ✅ Yes | - |
   | `courseId` | String | 255 | ❌ No | null |
   | `uploadedBy` | String | 255 | ✅ Yes | - |
   | `uploadedAt` | DateTime | - | ✅ Yes | - |
   | `fileType` | String | 50 | ✅ Yes | - |
   | `isActive` | Boolean | - | ❌ No | true |

4. **Set Permissions**
   - Go to **Settings** → **Permissions**
   - Add these permissions:
     - **Read**: `users` (authenticated users)
     - **Create**: `users` (authenticated users)
     - **Update**: `users` (authenticated users)
     - **Delete**: `users` (authenticated users)

### Step 2: Verify Collection Creation

Run this command to verify the collection was created:

```bash
node test-collections.js
```

You should see:
```
✅ FILE_METADATA collection exists - Found 0 documents
```

### Step 3: Restart Development Server

```bash
npm run dev
```

## 🎯 Quick Test

After creating the collection:

1. Go to your admin dashboard: `http://localhost:3001/admin`
2. Click on the **"Content"** tab
3. Select a course from the dropdown
4. Try uploading a file - it should work without errors!

## 🔍 Optional Collections

The other missing collections are optional and used for advanced features:

- **`video_access_tokens`**: For secure video access (not currently used)
- **`user_activity`**: For user activity tracking (not currently used)
- **`course_analytics`**: For course analytics (not currently used)

You can create these later if needed, but they're not required for basic functionality.

## ✅ Success Indicators

- ✅ No more "Collection not found" errors
- ✅ Content upload works in admin dashboard
- ✅ File management features are functional
- ✅ No console errors related to collections

## 🆘 Still Having Issues?

1. **Double-check Collection ID**: Must be exactly `file_metadata` (lowercase, underscore)
2. **Verify Database ID**: Should be `688571c300214b29155b`
3. **Check Permissions**: Ensure `users` can read/write
4. **Clear Browser Cache**: Hard refresh (Ctrl+F5)
5. **Restart Dev Server**: Stop and start `npm run dev`

## 📚 Reference

For complete setup instructions, see:
- [README-APPWRITE-SETUP.md](./README-APPWRITE-SETUP.md) - Full Appwrite setup guide
- [USER-REGISTRATION-FIX-GUIDE.md](./USER-REGISTRATION-FIX-GUIDE.md) - User registration troubleshooting

---

**Need immediate help?** The `file_metadata` collection is the only critical one needed to fix the current error.