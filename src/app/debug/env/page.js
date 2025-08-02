"use client";

import { useEffect, useState } from 'react';

const EnvDebugPage = () => {
  const [envVars, setEnvVars] = useState({});

  useEffect(() => {
    // Only show environment variables that start with NEXT_PUBLIC_
    const publicEnvVars = {
      NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      NEXT_PUBLIC_APPWRITE_DATABASE_MAIN_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_MAIN_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    };
    setEnvVars(publicEnvVars);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Environment Variables Debug
          </h1>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ This page should only be used for debugging. Remove it before production.
              </p>
            </div>

            <div className="grid gap-4">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{key}</h3>
                      <p className="text-sm text-gray-600 mt-1 font-mono break-all">
                        {value || <span className="text-red-500">❌ Not set</span>}
                      </p>
                    </div>
                    <div className="ml-4">
                      {value ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Set
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ❌ Missing
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Quick Checks:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• All environment variables should be set in Vercel</li>
                <li>• Appwrite project should have your domain in platform settings</li>
                <li>• CORS should be configured for your domain</li>
                <li>• Environment should be "Production" in Vercel settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvDebugPage;