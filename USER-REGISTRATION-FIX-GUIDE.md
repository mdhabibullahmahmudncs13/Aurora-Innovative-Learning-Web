# User Registration Fix Guide

## Problem
Users can successfully log in and sign up, but new users are not being added to the Appwrite user collection in the database.

## Quick Diagnosis

### Step 1: Access the Debug Page
1. Navigate to `/debug` in your application (http://localhost:3000/debug)
2. The debug page will automatically check your database setup
3. Look for any red ❌ indicators showing missing collections or configuration issues

### Step 2: Check Console Logs
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for detailed error messages about database operations
4. Check for Appwrite permission errors or collection not found errors

## Common Issues and Solutions

### Issue 1: Missing Users Collection
**Symptoms:**
- Debug page shows "❌ Missing" for Users Collection
- Console shows "Collection with the requested ID could not be found"

**Solution:**
1. Go to your Appwrite Console
2. Navigate to Databases → Main Database
3. Create a new collection with ID: `users`
4. Add the following attributes:
   - `email` (String, Required)
   - `name` (String, Required) 
   - `role` (String, Required, Default: "regular")
   - `createdAt` (DateTime, Required)
   - `updatedAt` (DateTime, Required)

### Issue 2: Incorrect Collection Permissions
**Symptoms:**
- Debug page shows "❌ No" for Can Write
- Console shows "User (role: guests) missing scope (documents.write)"

**Solution:**
1. Go to your Appwrite Console
2. Navigate to Databases → Main Database → Users Collection
3. Go to Settings → Permissions
4. Add the following permissions:
   - **Create**: `users` (authenticated users can create)
   - **Read**: `users` (authenticated users can read)
   - **Update**: `users` (authenticated users can update their own)
   - **Delete**: `admins` (only admins can delete)

### Issue 3: Environment Configuration
**Symptoms:**
- Debug page shows incorrect collection IDs
- Application can't connect to database

**Solution:**
1. Check your `.env.local` file
2. Ensure these variables match your Appwrite setup:
   ```
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=main
   NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
   NEXT_PUBLIC_APPWRITE_COURSES_COLLECTION_ID=courses
   NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID=enrollments
   ```
3. Restart your development server after making changes

### Issue 4: User Profile Creation Failing
**Symptoms:**
- User account is created in Appwrite Auth
- But no corresponding document in users collection
- Console shows database write errors during registration

**Solution:**
1. Check the enhanced logging in the browser console during registration
2. Look for specific error messages about profile creation
3. Ensure the users collection exists and has proper permissions
4. Verify that the collection attributes match the expected schema

## Step-by-Step Fix Process

### 1. Create Missing Collections
If the debug page shows missing collections:

```bash
# In Appwrite Console:
# 1. Go to Databases → Create Database (if needed)
# 2. Create collections with these exact IDs:
#    - users
#    - courses  
#    - enrollments
```

### 2. Set Up Users Collection Attributes
```bash
# In Appwrite Console → Databases → Main → Users Collection:
# Add these attributes:
# - email (String, 255 chars, Required)
# - name (String, 255 chars, Required)
# - role (String, 50 chars, Required, Default: "regular")
# - createdAt (DateTime, Required)
# - updatedAt (DateTime, Required)
```

### 3. Configure Permissions
```bash
# In Users Collection → Settings → Permissions:
# Create Documents: users
# Read Documents: users
# Update Documents: users
# Delete Documents: admins
```

### 4. Test Registration
1. Try registering a new user
2. Check the debug page to see if the user appears
3. Check browser console for any remaining errors
4. Verify in Appwrite Console that the user document was created

## Verification Steps

### After Making Changes:
1. **Refresh the debug page** - All items should show ✅
2. **Test user registration** - Create a new test account
3. **Check Appwrite Console** - Verify the user document exists in the users collection
4. **Test login** - Ensure the new user can log in successfully
5. **Check user profile** - Verify the user profile loads correctly

### Success Indicators:
- ✅ All collections exist in debug page
- ✅ Connection test passes (Can Connect, Can Read, Can Write)
- ✅ New user registration creates both auth account and database document
- ✅ User profile loads correctly after login
- ✅ No errors in browser console during registration/login

## Additional Debugging

### Enable Detailed Logging
The application now includes enhanced logging in `AuthContext.js`. Check the browser console during registration to see:
- Account creation status
- Database profile creation attempts
- Specific error messages
- Session creation status

### Common Error Messages
- `Collection with the requested ID could not be found` → Create the missing collection
- `User (role: guests) missing scope (documents.write)` → Fix collection permissions
- `Invalid document structure` → Check collection attributes
- `Network request failed` → Check Appwrite endpoint configuration

## Need More Help?

1. **Check the debug page** at `/debug` for real-time status
2. **Review browser console** for detailed error messages
3. **Verify Appwrite Console** settings match the requirements
4. **Test with a fresh user account** to isolate the issue
5. **Check network tab** in developer tools for failed API requests

The debug page provides comprehensive information about your database setup and will guide you through resolving any remaining issues.