'use client';

import React, { useState, useEffect } from 'react';
import { usePayment } from '@/contexts/PaymentContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Smartphone, 
  CreditCard, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Upload,
  FileText,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentSubmission = ({ course, onPaymentSubmitted }) => {
  const { userProfile } = useAuth();
  const { 
    paymentMethods, 
    loading, 
    createPaymentRequest, 
    fetchPaymentRequests,
    paymentRequests
  } = usePayment();
  
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [step, setStep] = useState(1); // 1: Select Method, 2: Payment Info, 3: Submit Details
  const [paymentForm, setPaymentForm] = useState({
    senderNumber: '',
    transactionId: '',
    amount: course?.price || 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);

  // Check for existing payment request for this course
  useEffect(() => {
    if (paymentRequests && course) {
      const existing = paymentRequests.find(
        request => request.courseId === course.$id && 
        request.userId === userProfile?.$id &&
        (request.status === 'pending' || request.status === 'verified')
      );
      setExistingRequest(existing);
    }
  }, [paymentRequests, course, userProfile]);

  // Get active payment methods
  const activeMethods = paymentMethods.filter(method => method.isActive);

  // Handle method selection
  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setStep(2);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMethod || !paymentForm.senderNumber || !paymentForm.transactionId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createPaymentRequest({
        courseId: course.$id,
        paymentMethodId: selectedMethod.$id,
        amount: paymentForm.amount,
        senderNumber: paymentForm.senderNumber,
        transactionId: paymentForm.transactionId
      });

      if (result.success) {
        toast.success('Payment request submitted successfully!');
        setStep(4); // Success step
        if (onPaymentSubmitted) {
          onPaymentSubmitted(result.request);
        }
      }
    } catch (error) {
      console.error('Error submitting payment request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setStep(1);
    setSelectedMethod(null);
    setPaymentForm({
      senderNumber: '',
      transactionId: '',
      amount: course?.price || 0
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Check if request is expired
  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  // If there's an existing request, show status
  if (existingRequest) {
    const expired = isExpired(existingRequest.expiresAt);
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="mb-4">
            {existingRequest.status === 'verified' ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            ) : expired ? (
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
            ) : (
              <Clock className="w-16 h-16 text-yellow-500 mx-auto" />
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {existingRequest.status === 'verified' ? 'Payment Verified!' :
             expired ? 'Payment Request Expired' :
             'Payment Request Pending'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {existingRequest.status === 'verified' ? 
              'Your payment has been verified and you are now enrolled in this course.' :
             expired ?
              'Your payment request has expired. Please submit a new payment request.' :
              'Your payment request is being reviewed by our team. This usually takes 1-24 hours.'}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Transaction ID:</span> {existingRequest.transactionId}</p>
              <p><span className="font-medium">Amount:</span> ৳{existingRequest.amount}</p>
              <p><span className="font-medium">Submitted:</span> {formatDate(existingRequest.createdAt)}</p>
              {!expired && existingRequest.status === 'pending' && (
                <p><span className="font-medium">Expires:</span> {formatDate(existingRequest.expiresAt)}</p>
              )}
              {existingRequest.verifiedAt && (
                <p><span className="font-medium">Verified:</span> {formatDate(existingRequest.verifiedAt)}</p>
              )}
            </div>
          </div>
          
          {expired && (
            <button
              onClick={resetForm}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Submit New Payment
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Payment</h3>
        <p className="text-gray-600">Choose a payment method and submit your payment details</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-12 h-1 ${
            step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`w-12 h-1 ${
            step >= 3 ? 'bg-blue-600' : 'bg-gray-200'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>
      </div>

      {/* Step 1: Select Payment Method */}
      {step === 1 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Select Payment Method</h4>
          
          {activeMethods.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods Available</h3>
              <p className="text-gray-600">Please contact support for payment options.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeMethods.map((method) => (
                <button
                  key={method.$id}
                  onClick={() => handleMethodSelect(method)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {method.methodType === 'bkash' ? (
                      <Smartphone className="w-8 h-8 text-pink-600" />
                    ) : (
                      <CreditCard className="w-8 h-8 text-orange-600" />
                    )}
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">
                        {method.methodType.toUpperCase()}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {method.accountNumber} - {method.accountName}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Payment Instructions */}
      {step === 2 && selectedMethod && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setStep(1)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back to methods
            </button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              {selectedMethod.methodType === 'bkash' ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
              Payment Instructions - {selectedMethod.methodType.toUpperCase()}
            </h4>
            
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-center justify-between bg-white rounded p-3">
                <div>
                  <span className="font-medium">Send Money To:</span>
                  <p className="text-lg font-mono">{selectedMethod.accountNumber}</p>
                  <p className="text-xs text-gray-600">{selectedMethod.accountName}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedMethod.accountNumber)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between bg-white rounded p-3">
                <div>
                  <span className="font-medium">Amount:</span>
                  <p className="text-lg font-mono">৳{course.price}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(course.price.toString())}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                <strong>Important:</strong> Please send the exact amount and save the transaction ID. 
                You'll need it in the next step.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => setStep(3)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              I've Made the Payment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Submit Payment Details */}
      {step === 3 && selectedMethod && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setStep(2)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back to instructions
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Submit Payment Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your {selectedMethod.methodType.toUpperCase()} Number *
              </label>
              <input
                type="tel"
                value={paymentForm.senderNumber}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, senderNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="01XXXXXXXXX"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID *
              </label>
              <input
                type="text"
                value={paymentForm.transactionId}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the transaction ID from your payment"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Sent
              </label>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Payment Summary</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Course:</span> {course.title}</p>
                <p><span className="font-medium">Method:</span> {selectedMethod.methodType.toUpperCase()}</p>
                <p><span className="font-medium">To Account:</span> {selectedMethod.accountNumber}</p>
                <p><span className="font-medium">Amount:</span> ৳{paymentForm.amount}</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Double-check your transaction ID before submitting</li>
                    <li>Payment verification usually takes 1-24 hours</li>
                    <li>You'll receive email confirmation once verified</li>
                    <li>Contact support if you face any issues</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Submit Payment Request
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Request Submitted!</h3>
          <p className="text-gray-600 mb-6">
            Your payment request has been submitted successfully. Our team will verify your payment within 1-24 hours.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              You'll receive an email confirmation once your payment is verified and you're enrolled in the course.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSubmission;