'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logDatabaseInfo, generateSetupInstructions, testDatabaseConnection } from '@/utils/setupDatabase';
import { DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';

export default function DebugPage() {
  const { user, userProfile, isAuthenticated, testCreateUserProfile } = useAuth();
  const [setupInfo, setSetupInfo] = useState(null);
  const [connectionTest, setConnectionTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkDatabaseSetup();
  }, []);

  const checkDatabaseSetup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log detailed info to console
      await logDatabaseInfo();
      
      // Get setup instructions
      const setup = await generateSetupInstructions();
      setSetupInfo(setup);
      
      // Test connection
      const connection = await testDatabaseConnection();
      setConnectionTest(connection);
      
    } catch (err) {
      console.error('Error checking database setup:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestUserProfile = async () => {
    if (!isAuthenticated || !user) {
      setTestResult({ success: false, error: 'Please log in first to test user profile creation' });
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      const result = await testCreateUserProfile();
      setTestResult(result);
      
      // Refresh the page data after test
      if (result.success) {
        setTimeout(() => {
          checkDatabaseSetup();
        }, 1000);
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking database setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-blue-600">🔍</span>
            Database Debug Information
          </h1>
          <p className="text-gray-600 mt-2">Check your Appwrite database configuration and setup status</p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={checkDatabaseSetup}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Check
            </button>
            
            {isAuthenticated && (
              <button
                onClick={handleTestUserProfile}
                disabled={testing}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                {testing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                Test User Profile Creation
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div className={`border rounded-lg p-6 mb-8 ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${
                  testResult.success ? 'text-green-400' : 'text-red-400'
                }`} viewBox="0 0 20 20" fill="currentColor">
                  {testResult.success ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  )}
                </svg>
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? 'Test Successful!' : 'Test Failed'}
                </h3>
                <p className={`text-sm mt-1 ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.success 
                    ? 'User profile creation is working correctly. Your database setup is properly configured!' 
                    : `Error: ${testResult.error}`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">⚙️</span>
              Configuration
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Database ID</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded border">{DATABASE_IDS.MAIN}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Users Collection ID</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded border">{COLLECTION_IDS.USERS}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Courses Collection ID</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded border">{COLLECTION_IDS.COURSES}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Enrollments Collection ID</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded border">{COLLECTION_IDS.ENROLLMENTS}</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-600">👤</span>
              Current User
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Authentication Status</label>
                <p className={`text-sm font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                </p>
              </div>
              {user && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">User ID</label>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded border">{user.$id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm bg-gray-50 p-2 rounded border">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm bg-gray-50 p-2 rounded border">{user.name}</p>
                  </div>
                </>  
              )}
              {userProfile && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Profile Role</label>
                  <p className="text-sm bg-gray-50 p-2 rounded border">{userProfile.role}</p>
                </div>
              )}
              {!userProfile && isAuthenticated && (
                <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                  ⚠️ User profile not found in database
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Database Status */}
        {setupInfo && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-purple-600">🗄️</span>
              Database Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg border ${
                setupInfo.status.database.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-sm font-medium text-gray-700">Database</div>
                <div className={`text-lg font-semibold ${
                  setupInfo.status.database.exists ? 'text-green-600' : 'text-red-600'
                }`}>
                  {setupInfo.status.database.exists ? '✅ Exists' : '❌ Missing'}
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                setupInfo.status.collections.users.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-sm font-medium text-gray-700">Users Collection</div>
                <div className={`text-lg font-semibold ${
                  setupInfo.status.collections.users.exists ? 'text-green-600' : 'text-red-600'
                }`}>
                  {setupInfo.status.collections.users.exists ? '✅ Exists' : '❌ Missing'}
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                setupInfo.status.collections.courses.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-sm font-medium text-gray-700">Courses Collection</div>
                <div className={`text-lg font-semibold ${
                  setupInfo.status.collections.courses.exists ? 'text-green-600' : 'text-red-600'
                }`}>
                  {setupInfo.status.collections.courses.exists ? '✅ Exists' : '❌ Missing'}
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                setupInfo.status.collections.enrollments.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-sm font-medium text-gray-700">Enrollments Collection</div>
                <div className={`text-lg font-semibold ${
                  setupInfo.status.collections.enrollments.exists ? 'text-green-600' : 'text-red-600'
                }`}>
                  {setupInfo.status.collections.enrollments.exists ? '✅ Exists' : '❌ Missing'}
                </div>
              </div>
            </div>

            {setupInfo.status.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-red-600 mb-2">Errors</h3>
                <ul className="space-y-1">
                  {setupInfo.status.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      ❌ {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Connection Test */}
        {connectionTest && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-orange-600">🔗</span>
              Connection Test
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className={`p-4 rounded-lg border ${
                connectionTest.canConnect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-sm font-medium text-gray-700">Can Connect</div>
                <div className={`text-lg font-semibold ${
                  connectionTest.canConnect ? 'text-green-600' : 'text-red-600'
                }`}>
                  {connectionTest.canConnect ? '✅ Yes' : '❌ No'}
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                connectionTest.canRead ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-sm font-medium text-gray-700">Can Read</div>
                <div className={`text-lg font-semibold ${
                  connectionTest.canRead ? 'text-green-600' : 'text-red-600'
                }`}>
                  {connectionTest.canRead ? '✅ Yes' : '❌ No'}
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                connectionTest.canWrite ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-sm font-medium text-gray-700">Can Write</div>
                <div className={`text-lg font-semibold ${
                  connectionTest.canWrite ? 'text-green-600' : 'text-red-600'
                }`}>
                  {connectionTest.canWrite ? '✅ Yes' : '❌ No'}
                </div>
              </div>
            </div>

            {connectionTest.errors.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-red-600 mb-2">Connection Issues</h3>
                <ul className="space-y-1">
                  {connectionTest.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      ❌ {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        {setupInfo && setupInfo.instructions.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-yellow-600">📝</span>
              Setup Instructions
            </h2>
            <div className="space-y-4">
              {setupInfo.instructions.map((instruction, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(instruction.priority)}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-current flex items-center justify-center text-xs font-bold">
                      {instruction.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{instruction.title}</h3>
                      <p className="text-sm mt-1 opacity-90">{instruction.description}</p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-white rounded border border-current">
                        {instruction.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {setupInfo && setupInfo.isSetupComplete && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Setup Complete!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your database appears to be properly configured. User registration should work correctly now.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Console Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Console Information</h3>
              <p className="text-sm text-blue-700 mt-1">
                Detailed debug information has been logged to the browser console. Open Developer Tools → Console to see more details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}