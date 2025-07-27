"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import Link from 'next/link';

const Page = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate form
  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        console.log('Login page - Starting login...');
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          console.log('Login page - Login successful, checking session...');
          
          // Check if session exists
          try {
            const session = await account.getSession('current');
            console.log('Login page - Session found:', session.$id);
            console.log('Login page - Session cookies should be set now');
          } catch (sessionError) {
            console.error('Login page - No session found:', sessionError);
          }
          
          // Add a small delay before redirecting
          setTimeout(() => {
            console.log('Login page - Redirecting to dashboard...');
            window.location.href = '/dashboard';
          }, 200);
        } else {
          setErrors({ submit: result.error });
        }
      } catch (error) {
        console.error('Login page - Error:', error);
        setErrors({ submit: 'An unexpected error occurred' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const testSession = async () => {
    try {
      const session = await account.getSession('current');
      console.log('Test - Current session:', session);
      
      // Log all cookies to see what's actually set
      console.log('Test - All document cookies:', document.cookie);
      const cookies = document.cookie.split(';').map(c => c.trim());
      console.log('Test - Parsed cookies:', cookies);
      
      alert('Session exists: ' + session.$id + '\n\nCookies: ' + cookies.join(', '));
    } catch (error) {
      console.log('Test - No session:', error);
      console.log('Test - All document cookies:', document.cookie);
      alert('No session found: ' + error.message + '\n\nCookies: ' + document.cookie);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white py-8 px-8 border-t-4 border-indigo-600 rounded-lg shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to Aurora Learning</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {errors.submit}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                disabled={isSubmitting || loading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                disabled={isSubmitting || loading}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isSubmitting || loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
            
            <button 
              type="button"
              onClick={testSession}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
            >
              Test Session Status
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/auth/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline">
              Forgot your password?
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-500 font-medium hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    
  );
};

export default Page;
