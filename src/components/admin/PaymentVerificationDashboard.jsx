'use client';

import React, { useState, useEffect } from 'react';
import { usePayment } from '@/contexts/PaymentContext';
import { useCourse } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import { databases, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Filter, 
  Search,
  Smartphone,
  CreditCard,
  AlertTriangle,
  User,
  BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentVerificationDashboard = () => {
  const { userProfile } = useAuth();
  const { 
    paymentRequests, 
    paymentMethods,
    loading, 
    verifyPaymentRequest, 
    fetchPaymentRequests 
  } = usePayment();
  const { enrollInCourse } = useCourse();
  
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [courses, setCourses] = useState({});
  const [users, setUsers] = useState({});
  const [processingRequest, setProcessingRequest] = useState(null);

  // Check if user is admin
  if (userProfile?.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Access denied. Only administrators can access payment verification.</p>
      </div>
    );
  }

  // Fetch course and user details for payment requests
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        // Fetch courses
        const coursesResponse = await databases.listDocuments(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.COURSES
        );
        const coursesMap = {};
        coursesResponse.documents.forEach(course => {
          coursesMap[course.$id] = course;
        });
        setCourses(coursesMap);

        // Fetch users
        const usersResponse = await databases.listDocuments(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.USERS
        );
        const usersMap = {};
        usersResponse.documents.forEach(user => {
          usersMap[user.$id] = user;
        });
        setUsers(usersMap);
      } catch (error) {
        console.error('Error fetching additional data:', error);
      }
    };

    if (paymentRequests.length > 0) {
      fetchAdditionalData();
    }
  }, [paymentRequests]);

  // Filter payment requests
  const filteredRequests = paymentRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = searchTerm === '' || 
      request.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.senderNumber.includes(searchTerm) ||
      (users[request.userId]?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (courses[request.courseId]?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Handle verification
  const handleVerification = async (requestId, action) => {
    setProcessingRequest(requestId);
    try {
      const result = await verifyPaymentRequest(requestId, action, adminNotes);
      
      if (result.success && action === 'verified') {
        // Auto-enroll student in course
        const request = paymentRequests.find(r => r.$id === requestId);
        if (request) {
          try {
            await enrollInCourse(request.courseId, request.userId);
            toast.success('Payment verified and student enrolled successfully!');
          } catch (enrollError) {
            console.error('Error enrolling student:', enrollError);
            toast.warning('Payment verified but enrollment failed. Please enroll manually.');
          }
        }
      }
      
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error processing verification:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  // Get payment method details
  const getPaymentMethodDetails = (methodId) => {
    return paymentMethods.find(method => method.$id === methodId);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Check if request is expired
  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Verification</h2>
        <p className="text-gray-600 mt-1">Review and verify student payment submissions</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by transaction ID, phone number, student name, or course..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Payment Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Requests</h3>
            <p className="text-gray-600">
              {filter === 'pending' 
                ? 'No pending payment requests to review'
                : `No ${filter} payment requests found`
              }
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const course = courses[request.courseId];
            const user = users[request.userId];
            const paymentMethod = getPaymentMethodDetails(request.paymentMethodId);
            const expired = isExpired(request.expiresAt);
            
            return (
              <div key={request.$id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${
                        getStatusColor(expired && request.status === 'pending' ? 'expired' : request.status)
                      }`}>
                        {getStatusIcon(expired && request.status === 'pending' ? 'expired' : request.status)}
                        {expired && request.status === 'pending' ? 'Expired' : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      {expired && request.status === 'pending' && (
                        <span className="text-xs text-red-600 font-medium">Request Expired</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Student Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Student Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Name:</span> {user?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {user?.email || 'Unknown'}
                        </p>
                      </div>
                      
                      {/* Course Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Course Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Course:</span> {course?.title || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Price:</span> ৳{request.amount}
                        </p>
                      </div>
                      
                      {/* Payment Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          {paymentMethod?.methodType === 'bkash' ? 
                            <Smartphone className="w-4 h-4 text-pink-600" /> : 
                            <CreditCard className="w-4 h-4 text-orange-600" />
                          }
                          Payment Details
                        </h3>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Method:</span> {paymentMethod?.methodType?.toUpperCase() || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">To Account:</span> {paymentMethod?.accountNumber || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">From Number:</span> {request.senderNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Transaction ID:</span> 
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs ml-1">
                            {request.transactionId}
                          </span>
                        </p>
                      </div>
                      
                      {/* Timestamps */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Timestamps</h3>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Submitted:</span> {formatDate(request.createdAt)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Expires:</span> {formatDate(request.expiresAt)}
                        </p>
                        {request.verifiedAt && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Verified:</span> {formatDate(request.verifiedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Admin Notes */}
                    {request.adminNotes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</p>
                        <p className="text-sm text-gray-600">{request.adminNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {request.status === 'pending' && !expired && (
                      <>
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Review Payment Request</h3>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setAdminNotes('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Amount:</span> ৳{selectedRequest.amount}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Transaction ID:</span> {selectedRequest.transactionId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">From:</span> {selectedRequest.senderNumber}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Add notes about this verification..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleVerification(selectedRequest.$id, 'verified')}
                  disabled={processingRequest === selectedRequest.$id}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {processingRequest === selectedRequest.$id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Verify & Enroll
                </button>
                <button
                  onClick={() => handleVerification(selectedRequest.$id, 'rejected')}
                  disabled={processingRequest === selectedRequest.$id}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {processingRequest === selectedRequest.$id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerificationDashboard;