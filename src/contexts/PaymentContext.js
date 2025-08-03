'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { databases, DATABASE_IDS, COLLECTION_IDS } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch active payment methods
  const fetchPaymentMethods = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.PAYMENT_METHODS,
        [Query.equal('isActive', true)]
      );
      setPaymentMethods(response.documents);
      return response.documents;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
      return [];
    }
  };

  // Fetch payment requests (admin: all, user: own)
  const fetchPaymentRequests = async () => {
    try {
      let queries = [];
      if (userProfile?.role !== 'admin') {
        queries = [Query.equal('userId', user.$id)];
      }
      
      const response = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.PAYMENT_REQUESTS,
        [...queries, Query.orderDesc('createdAt')]
      );
      setPaymentRequests(response.documents);
      return response.documents;
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      toast.error('Failed to load payment requests');
      return [];
    }
  };

  // Create payment method (admin only)
  const createPaymentMethod = async (methodData) => {
    try {
      if (userProfile?.role !== 'admin') {
        throw new Error('Only admins can create payment methods');
      }

      setLoading(true);
      const response = await databases.createDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.PAYMENT_METHODS,
        ID.unique(),
        {
          ...methodData,
          createdBy: user.$id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      
      await fetchPaymentMethods();
      toast.success('Payment method created successfully');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error creating payment method:', error);
      toast.error('Failed to create payment method');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update payment method (admin only)
  const updatePaymentMethod = async (methodId, updateData) => {
    try {
      if (userProfile?.role !== 'admin') {
        throw new Error('Only admins can update payment methods');
      }

      setLoading(true);
      const response = await databases.updateDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.PAYMENT_METHODS,
        methodId,
        {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      );
      
      await fetchPaymentMethods();
      toast.success('Payment method updated successfully');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Failed to update payment method');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Submit payment request (students)
  const submitPaymentRequest = async (requestData) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated');
      }

      setLoading(true);
      
      // Check if there's already a pending request for this course
      const existingRequests = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.PAYMENT_REQUESTS,
        [
          Query.equal('userId', user.$id),
          Query.equal('courseId', requestData.courseId),
          Query.equal('status', 'pending')
        ]
      );

      if (existingRequests.documents.length > 0) {
        throw new Error('You already have a pending payment request for this course');
      }

      // Set expiration time (48 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      const response = await databases.createDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.PAYMENT_REQUESTS,
        ID.unique(),
        {
          ...requestData,
          userId: user.$id,
          status: 'pending',
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      
      await fetchPaymentRequests();
      toast.success('Payment request submitted successfully');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error submitting payment request:', error);
      toast.error(error.message || 'Failed to submit payment request');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Verify payment request (admin only)
  const verifyPaymentRequest = async (requestId, action, adminNotes = '') => {
    try {
      if (userProfile?.role !== 'admin') {
        throw new Error('Only admins can verify payment requests');
      }

      setLoading(true);
      const updateData = {
        status: action, // 'verified' or 'rejected'
        adminNotes,
        updatedAt: new Date().toISOString()
      };

      if (action === 'verified') {
        updateData.verifiedBy = user.$id;
        updateData.verifiedAt = new Date().toISOString();
      }

      const response = await databases.updateDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.PAYMENT_REQUESTS,
        requestId,
        updateData
      );
      
      await fetchPaymentRequests();
      toast.success(`Payment request ${action} successfully`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error verifying payment request:', error);
      toast.error('Failed to verify payment request');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get payment request by ID
  const getPaymentRequest = async (requestId) => {
    try {
      const response = await databases.getDocument(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.PAYMENT_REQUESTS,
        requestId
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching payment request:', error);
      return { success: false, error: error.message };
    }
  };

  // Clean up expired payment requests
  const cleanupExpiredRequests = async () => {
    try {
      if (userProfile?.role !== 'admin') return;

      const now = new Date().toISOString();
      const expiredRequests = await databases.listDocuments(
        DATABASE_IDS.MAIN,
        COLLECTION_IDS.PAYMENT_REQUESTS,
        [
          Query.equal('status', 'pending'),
          Query.lessThan('expiresAt', now)
        ]
      );

      for (const request of expiredRequests.documents) {
        await databases.updateDocument(
          DATABASE_IDS.MAIN,
          COLLECTION_IDS.PAYMENT_REQUESTS,
          request.$id,
          {
            status: 'expired',
            updatedAt: new Date().toISOString()
          }
        );
      }

      if (expiredRequests.documents.length > 0) {
        await fetchPaymentRequests();
      }
    } catch (error) {
      console.error('Error cleaning up expired requests:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
      fetchPaymentRequests();
      
      // Clean up expired requests if admin
      if (userProfile?.role === 'admin') {
        cleanupExpiredRequests();
      }
    }
  }, [user, userProfile]);

  const value = {
    paymentMethods,
    paymentRequests,
    loading,
    fetchPaymentMethods,
    fetchPaymentRequests,
    createPaymentMethod,
    updatePaymentMethod,
    submitPaymentRequest,
    verifyPaymentRequest,
    getPaymentRequest,
    cleanupExpiredRequests
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentContext;