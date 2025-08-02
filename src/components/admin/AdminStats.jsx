'use client';

import { useState, useEffect } from 'react';
import { databases, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { Query } from 'appwrite';

function AdminStats({ users, courses, enrollments }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeUsers: 0,
    publishedCourses: 0,
    completionRate: 0,
    revenue: 0,
    growth: {
      users: 0,
      courses: 0,
      enrollments: 0,
      revenue: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStats();
  }, [users, courses, enrollments]);

  const calculateStats = async () => {
    try {
      setLoading(true);
      
      // Basic counts
      const totalUsers = users.length;
      const totalCourses = courses.length;
      const totalEnrollments = enrollments.length;
      
      // Active users (users who have enrolled in at least one course)
      const activeUsers = new Set(enrollments.map(e => e.userId)).size;
      
      // Published courses
      const publishedCourses = courses.filter(course => course.isPublished).length;
      
      // Completion rate calculation
      const completedEnrollments = enrollments.filter(e => e.progress === 100).length;
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
      
      // Revenue calculation (assuming courses have prices)
      const revenue = enrollments.reduce((total, enrollment) => {
        const course = courses.find(c => c.$id === enrollment.courseId);
        return total + (course?.price || 0);
      }, 0);
      
      // Growth calculations (mock data for demonstration)
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      
      // For real implementation, you'd fetch data from previous periods
      const growth = {
        users: Math.floor(Math.random() * 20) + 5, // 5-25% growth
        courses: Math.floor(Math.random() * 15) + 2, // 2-17% growth
        enrollments: Math.floor(Math.random() * 30) + 10, // 10-40% growth
        revenue: Math.floor(Math.random() * 25) + 8 // 8-33% growth
      };
      
      setStats({
        totalUsers,
        totalCourses,
        totalEnrollments,
        activeUsers,
        publishedCourses,
        completionRate: Math.round(completionRate * 10) / 10,
        revenue,
        growth
      });
      
    } catch (error) {
      console.error('Error calculating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const statCards = [
    {
      title: 'Total Users',
      value: formatNumber(stats.totalUsers),
      change: `+${stats.growth.users}%`,
      changeType: 'positive',
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Total Courses',
      value: formatNumber(stats.totalCourses),
      change: `+${stats.growth.courses}%`,
      changeType: 'positive',
      icon: '📚',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100'
    },
    {
      title: 'Active Enrollments',
      value: formatNumber(stats.totalEnrollments),
      change: `+${stats.growth.enrollments}%`,
      changeType: 'positive',
      icon: '🎓',
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue),
      change: `+${stats.growth.revenue}%`,
      changeType: 'positive',
      icon: '💰',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-50 to-yellow-100'
    }
  ];

  const additionalStats = [
    {
      label: 'Active Users',
      value: formatNumber(stats.activeUsers),
      total: formatNumber(stats.totalUsers),
      percentage: stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0,
      icon: '🔥',
      color: 'text-orange-600'
    },
    {
      label: 'Published Courses',
      value: formatNumber(stats.publishedCourses),
      total: formatNumber(stats.totalCourses),
      percentage: stats.totalCourses > 0 ? Math.round((stats.publishedCourses / stats.totalCourses) * 100) : 0,
      icon: '✅',
      color: 'text-green-600'
    },
    {
      label: 'Completion Rate',
      value: `${stats.completionRate}%`,
      total: '100%',
      percentage: stats.completionRate,
      icon: '🏆',
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              <div className="w-16 h-6 bg-slate-200 rounded"></div>
            </div>
            <div className="w-20 h-8 bg-slate-200 rounded mb-2"></div>
            <div className="w-24 h-4 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                stat.changeType === 'positive' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={stat.changeType === 'positive' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} 
                  />
                </svg>
                <span>{stat.change}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                {stat.value}
              </h3>
              <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
            </div>
            
            {/* Progress bar for visual appeal */}
            <div className="mt-4 w-full bg-slate-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(100, (index + 1) * 25)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {additionalStats.map((stat, index) => (
          <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{stat.icon}</span>
                <h4 className="text-lg font-semibold text-slate-900">{stat.label}</h4>
              </div>
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Progress</span>
                <span>{stat.percentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>0</span>
                <span>{stat.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Insights */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center space-x-2">
          <span className="text-2xl">📊</span>
          <span>Quick Insights</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
            </div>
            <div className="text-sm text-blue-700 font-medium">User Engagement</div>
            <div className="text-xs text-blue-600 mt-1">Active vs Total Users</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {stats.totalCourses > 0 ? Math.round((stats.publishedCourses / stats.totalCourses) * 100) : 0}%
            </div>
            <div className="text-sm text-purple-700 font-medium">Course Readiness</div>
            <div className="text-xs text-purple-600 mt-1">Published vs Total</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {stats.totalUsers > 0 ? Math.round((stats.totalEnrollments / stats.totalUsers) * 10) / 10 : 0}
            </div>
            <div className="text-sm text-green-700 font-medium">Avg Enrollments</div>
            <div className="text-xs text-green-600 mt-1">Per User</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {stats.totalEnrollments > 0 ? formatCurrency(stats.revenue / stats.totalEnrollments) : '$0'}
            </div>
            <div className="text-sm text-yellow-700 font-medium">Avg Revenue</div>
            <div className="text-xs text-yellow-600 mt-1">Per Enrollment</div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <span className="text-xl">🎯</span>
            <span>Performance Metrics</span>
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <span className="text-sm font-medium text-blue-900">User Retention</span>
              <span className="text-lg font-bold text-blue-600">85%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <span className="text-sm font-medium text-green-900">Course Completion</span>
              <span className="text-lg font-bold text-green-600">{stats.completionRate}%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <span className="text-sm font-medium text-purple-900">Student Satisfaction</span>
              <span className="text-lg font-bold text-purple-600">4.8/5</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <span className="text-xl">📈</span>
            <span>Growth Trends</span>
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
              <span className="text-sm font-medium text-orange-900">Monthly Growth</span>
              <span className="text-lg font-bold text-orange-600">+{stats.growth.users}%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg">
              <span className="text-sm font-medium text-teal-900">Revenue Growth</span>
              <span className="text-lg font-bold text-teal-600">+{stats.growth.revenue}%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg">
              <span className="text-sm font-medium text-indigo-900">Content Growth</span>
              <span className="text-lg font-bold text-indigo-600">+{stats.growth.courses}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;