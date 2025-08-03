# Admin Dashboard Setup Guide

## Resolving "The current user is not authorized to perform the requested action" Error

If you're encountering authorization errors when accessing the admin dashboard, follow these steps to resolve the issue:

### 1. Create Required Collections in Appwrite

You need to create the following collections in your Appwrite database:

#### Users Collection (`users`)
- **Collection ID**: `users`
- **Required Attributes**:
  - `name` (String, required)
  - `email` (String, required, unique)
  - `role` (String, required, default: "regular")
  - `createdAt` (DateTime, required)
  - `updatedAt` (DateTime, required)

#### Courses Collection (`courses`)
- **Collection ID**: `courses`
- **Required Attributes**:
  - `title` (String, required)
  - `description` (String, required)
  - `instructor` (String, required)
  - `price` (Float, required)
  - `status` (String, required, default: "draft")
  - `createdAt` (DateTime, required)
  - `updatedAt` (DateTime, required)

#### Enrollments Collection (`enrollments`)
- **Collection ID**: `enrollments`
- **Required Attributes**:
  - `userId` (String, required)
  - `courseId` (String, required)
  - `enrolledAt` (DateTime, required)
  - `status` (String, required, default: "active")

### 2. Set Collection Permissions

For each collection, set the following permissions:

#### Read Permissions:
- Any authenticated user: `users`
- Admin users: `users` (with role="admin")

#### Write Permissions:
- Admin users: `users` (with role="admin")
- Course instructors: `users` (with role="instructor") - for courses collection only

### 3. Create Your First Admin User

Since you need an admin user to access the admin dashboard, you have two options:

#### Option A: Manual Creation via Appwrite Console
1. Go to your Appwrite Console
2. Navigate to Databases → Your Database → Users Collection
3. Click "Add Document"
4. Create a user document with:
   ```json
   {
     "name": "Admin User",
     "email": "admin@example.com",
     "role": "admin",
     "createdAt": "2024-01-27T10:00:00.000Z",
     "updatedAt": "2024-01-27T10:00:00.000Z"
   }
   ```

#### Option B: Register and Promote
1. Register a new account through the application
2. Go to Appwrite Console → Databases → Users Collection
3. Find your user document
4. Edit the `role` field from "regular" to "admin"

### 4. Verify Database Configuration

Ensure your `.env.local` file has the correct database and collection IDs:

```env
NEXT_PUBLIC_APPWRITE_DATABASE_MAIN_ID="your-database-id"
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS_ID="users"
NEXT_PUBLIC_APPWRITE_COLLECTION_COURSES_ID="courses"
NEXT_PUBLIC_APPWRITE_COLLECTION_ENROLLMENTS_ID="enrollments"
```

### 5. Test Admin Access

1. Log in with your admin account
2. Navigate to `/admin` or click "Admin Dashboard" in the profile dropdown
3. You should now see the admin dashboard with statistics and management tools

### Troubleshooting

#### Still Getting Authorization Errors?

1. **Check Collection Names**: Ensure collection IDs match exactly (case-sensitive)
2. **Verify Permissions**: Make sure read/write permissions are set correctly
3. **Check User Role**: Confirm your user document has `role: "admin"`
4. **Database ID**: Verify the database ID in your environment variables
5. **Clear Cache**: Try clearing your browser cache and restarting the development server

#### Common Issues:

- **Collection doesn't exist**: Create the missing collection with proper attributes
- **Wrong permissions**: Update collection permissions to allow authenticated users to read
- **User not admin**: Change the user's role to "admin" in the users collection
- **Environment variables**: Double-check all Appwrite configuration in `.env.local`

### Admin Dashboard Features

Once properly configured, the admin dashboard provides:

- **User Management**: View all users and promote them to different roles
- **Course Overview**: Monitor all courses and their status
- **Enrollment Analytics**: Track user enrollments and engagement
- **System Statistics**: Overview of platform usage and growth
- **Role-based Access**: Secure access limited to admin users only

### Need More Help?

Refer to the detailed Appwrite setup guide in `README-APPWRITE-SETUP.md` for comprehensive database configuration instructions.