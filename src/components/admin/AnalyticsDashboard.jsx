'use client';

import { useState, useEffect } from 'react';
import { databases, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import toast from 'react-hot-toast';

function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalEnrollments: 0,
      averageCompletion: 0,
      activeUsers: 0
    },
    coursePerformance: [],
    userEngagement: {
      dailyActiveUsers: [],
      completionRates: [],
      enrollmentTrends: []
    },
    revenueAnalytics: {
      monthlyRevenue: [],
      topCourses: [],
      paymentMethods: []
    },
    geographicData: [],
    deviceAnalytics: {
      desktop: 0,
      mobile: 0,
      tablet: 0
    }
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }
      
      // Fetch all data in parallel
      const [users, courses, enrollments] = await Promise.all([
        databases.listDocuments(DATABASE_IDS.MAIN, COLLECTION_IDS.USERS),
        databases.listDocuments(DATABASE_IDS.MAIN, COLLECTION_IDS.COURSES),
        databases.listDocuments(DATABASE_IDS.MAIN, COLLECTION_IDS.ENROLLMENTS)
      ]);
      
      // Process analytics data
      const processedAnalytics = processAnalyticsData(users.documents, courses.documents, enrollments.documents, startDate, endDate);
      setAnalytics(processedAnalytics);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (users, courses, enrollments, startDate, endDate) => {
    // Filter enrollments by date range
    const filteredEnrollments = enrollments.filter(enrollment => {
      const enrollmentDate = new Date(enrollment.createdAt);
      return enrollmentDate >= startDate && enrollmentDate <= endDate;
    });
    
    // Calculate overview metrics
    const totalRevenue = filteredEnrollments.reduce((sum, enrollment) => {
      const course = courses.find(c => c.$id === enrollment.courseId);
      return sum + (course?.price || 0);
    }, 0);
    
    const completedEnrollments = filteredEnrollments.filter(e => e.progress === 100);
    const averageCompletion = filteredEnrollments.length > 0 
      ? (completedEnrollments.length / filteredEnrollments.length) * 100 
      : 0;
    
    // Active users (users who enrolled in the time range)
    const activeUserIds = new Set(filteredEnrollments.map(e => e.userId));
    
    // Course performance
    const coursePerformance = courses.map(course => {
      const courseEnrollments = filteredEnrollments.filter(e => e.courseId === course.$id);
      const courseCompletions = courseEnrollments.filter(e => e.progress === 100);
      const courseRevenue = courseEnrollments.length * (course.price || 0);
      
      return {
        id: course.$id,
        title: course.title,
        enrollments: courseEnrollments.length,
        completions: courseCompletions.length,
        completionRate: courseEnrollments.length > 0 ? (courseCompletions.length / courseEnrollments.length) * 100 : 0,
        revenue: courseRevenue,
        averageProgress: courseEnrollments.length > 0 
          ? courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / courseEnrollments.length 
          : 0
      };
    }).sort((a, b) => b.enrollments - a.enrollments);
    
    // Generate daily data for charts
    const dailyData = generateDailyData(filteredEnrollments, startDate, endDate);
    
    // Top courses by revenue
    const topCourses = coursePerformance
      .filter(course => course.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Mock geographic data (in real app, this would come from user data)
    const geographicData = [
      { country: 'United States', users: Math.floor(users.length * 0.4), revenue: totalRevenue * 0.45 },
      { country: 'United Kingdom', users: Math.floor(users.length * 0.15), revenue: totalRevenue * 0.18 },
      { country: 'Canada', users: Math.floor(users.length * 0.12), revenue: totalRevenue * 0.15 },
      { country: 'Australia', users: Math.floor(users.length * 0.08), revenue: totalRevenue * 0.10 },
      { country: 'Germany', users: Math.floor(users.length * 0.10), revenue: totalRevenue * 0.08 },
      { country: 'Others', users: Math.floor(users.length * 0.15), revenue: totalRevenue * 0.04 }
    ];
    
    // Mock device analytics
    const deviceAnalytics = {
      desktop: Math.floor(users.length * 0.6),
      mobile: Math.floor(users.length * 0.3),
      tablet: Math.floor(users.length * 0.1)
    };
    
    return {
      overview: {
        totalRevenue,
        totalEnrollments: filteredEnrollments.length,
        averageCompletion,
        activeUsers: activeUserIds.size
      },
      coursePerformance,
      userEngagement: {
        dailyActiveUsers: dailyData.dailyActiveUsers,
        completionRates: dailyData.completionRates,
        enrollmentTrends: dailyData.enrollmentTrends
      },
      revenueAnalytics: {
        monthlyRevenue: generateMonthlyRevenue(filteredEnrollments, courses, startDate, endDate),
        topCourses,
        paymentMethods: [
          { method: 'Credit Card', percentage: 65, amount: totalRevenue * 0.65 },
          { method: 'PayPal', percentage: 25, amount: totalRevenue * 0.25 },
          { method: 'Bank Transfer', percentage: 10, amount: totalRevenue * 0.10 }
        ]
      },
      geographicData,
      deviceAnalytics
    };
  };

  const generateDailyData = (enrollments, startDate, endDate) => {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const dailyActiveUsers = [];
    const completionRates = [];
    const enrollmentTrends = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEnrollments = enrollments.filter(e => {
        const enrollmentDate = new Date(e.createdAt);
        return enrollmentDate.toDateString() === date.toDateString();
      });
      
      const dayCompletions = dayEnrollments.filter(e => e.progress === 100);
      const uniqueUsers = new Set(dayEnrollments.map(e => e.userId)).size;
      
      dailyActiveUsers.push({
        date: date.toISOString().split('T')[0],
        users: uniqueUsers
      });
      
      completionRates.push({
        date: date.toISOString().split('T')[0],
        rate: dayEnrollments.length > 0 ? (dayCompletions.length / dayEnrollments.length) * 100 : 0
      });
      
      enrollmentTrends.push({
        date: date.toISOString().split('T')[0],
        enrollments: dayEnrollments.length
      });
    }
    
    return { dailyActiveUsers, completionRates, enrollmentTrends };
  };

  const generateMonthlyRevenue = (enrollments, courses, startDate, endDate) => {
    const monthlyData = {};
    
    enrollments.forEach(enrollment => {
      const enrollmentDate = new Date(enrollment.createdAt);
      const monthKey = `${enrollmentDate.getFullYear()}-${String(enrollmentDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      
      const course = courses.find(c => c.$id === enrollment.courseId);
      monthlyData[monthKey] += course?.price || 0;
    });
    
    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIndicator = (current, previous) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const growth = ((current - previous) / previous) * 100;
    return { value: Math.abs(growth), isPositive: growth >= 0 };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-48 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Analytics Dashboard</h2>
            <p className="text-slate-600">Comprehensive insights into your platform performance</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.overview.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-slate-900">{analytics.overview.totalEnrollments.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completion Rate</p>
              <p className="text-2xl font-bold text-slate-900">{formatPercentage(analytics.overview.averageCompletion)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Users</p>
              <p className="text-2xl font-bold text-slate-900">{analytics.overview.activeUsers.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Course Performance */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Performing Courses</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Course</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Enrollments</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Completions</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Completion Rate</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Revenue</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Avg Progress</th>
              </tr>
            </thead>
            <tbody>
              {analytics.coursePerformance.slice(0, 10).map((course) => (
                <tr key={course.id} className="border-b border-slate-100 hover:bg-white/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{course.title}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{course.enrollments}</td>
                  <td className="py-3 px-4 text-slate-600">{course.completions}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(course.completionRate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-600">{formatPercentage(course.completionRate)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{formatCurrency(course.revenue)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(course.averageProgress, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-600">{formatPercentage(course.averageProgress)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses by Revenue */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Courses by Revenue</h3>
          <div className="space-y-4">
            {analytics.revenueAnalytics.topCourses.map((course, index) => (
              <div key={course.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-slate-700">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{course.title}</p>
                    <p className="text-sm text-slate-600">{course.enrollments} enrollments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(course.revenue)}</p>
                  <p className="text-sm text-slate-600">{formatPercentage(course.completionRate)} completion</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-4">
            {analytics.geographicData.map((country) => (
              <div key={country.country} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{country.country}</p>
                  <p className="text-sm text-slate-600">{country.users} users</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(country.revenue)}</p>
                  <div className="w-24 bg-slate-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                      style={{ width: `${(country.revenue / analytics.overview.totalRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Analytics */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Device Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium text-slate-900">Desktop</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-600 mr-2">{analytics.deviceAnalytics.desktop}</span>
                <div className="w-20 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(analytics.deviceAnalytics.desktop / (analytics.deviceAnalytics.desktop + analytics.deviceAnalytics.mobile + analytics.deviceAnalytics.tablet)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                  </svg>
                </div>
                <span className="font-medium text-slate-900">Mobile</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-600 mr-2">{analytics.deviceAnalytics.mobile}</span>
                <div className="w-20 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(analytics.deviceAnalytics.mobile / (analytics.deviceAnalytics.desktop + analytics.deviceAnalytics.mobile + analytics.deviceAnalytics.tablet)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium text-slate-900">Tablet</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-600 mr-2">{analytics.deviceAnalytics.tablet}</span>
                <div className="w-20 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(analytics.deviceAnalytics.tablet / (analytics.deviceAnalytics.desktop + analytics.deviceAnalytics.mobile + analytics.deviceAnalytics.tablet)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            {analytics.revenueAnalytics.paymentMethods.map((method) => (
              <div key={method.method} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{method.method}</p>
                  <p className="text-sm text-slate-600">{method.percentage}% of transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(method.amount)}</p>
                  <div className="w-24 bg-slate-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" 
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;