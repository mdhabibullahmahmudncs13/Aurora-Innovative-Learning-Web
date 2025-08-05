"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCourse } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePayment } from '@/contexts/PaymentContext';
import PaymentSubmission from '@/components/student/PaymentSubmission';
import { toast } from 'react-hot-toast';

const CheckoutContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { fetchCourse, enrollInCourse } = useCourse();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, paypal, bank, mobile
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    const courseId = searchParams.get('courseId');
    if (courseId) {
      loadCourse(courseId);
    } else {
      router.push('/courses');
    }
  }, [isAuthenticated, searchParams]);
  
  useEffect(() => {
    if (user) {
      setBillingInfo(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || ''
      }));
    }
  }, [user]);
  
  const loadCourse = async (courseId) => {
    try {
      const courseData = await fetchCourse(courseId);
      setCourse(courseData.course);
      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
      router.push('/courses');
    }
  };
  
  const handleBillingInfoChange = (field, value) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCardInfoChange = (field, value) => {
    setCardInfo(prev => ({ ...prev, [field]: value }));
  };
  
  const validateForm = () => {
    const requiredBillingFields = ['firstName', 'lastName', 'email'];
    const missingBillingFields = requiredBillingFields.filter(field => !billingInfo[field]);
    
    if (missingBillingFields.length > 0) {
      toast.error('Please fill in all required billing information');
      return false;
    }
    
    if (course?.price > 0 && paymentMethod === 'card') {
      const requiredCardFields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
      const missingCardFields = requiredCardFields.filter(field => !cardInfo[field]);
      
      if (missingCardFields.length > 0) {
        toast.error('Please fill in all card information');
        return false;
      }
    }
    
    return true;
  };
  
  const handleEnrollment = async () => {
    if (paymentMethod === 'mobile') {
      // Mobile payment (bKash/Nagad) will be handled by PaymentSubmission component
      return;
    }
    
    if (!validateForm()) return;
    
    setProcessing(true);
    try {
      if (course.price === 0) {
        // Free course - direct enrollment
        await enrollInCourse(course.$id);
        toast.success('Successfully enrolled in the course!');
        router.push(`/courses/${course.$id}`);
      } else {
        // Paid course - process payment first
        // In a real implementation, you would integrate with a payment processor
        // For now, we'll simulate a payment process
        await simulatePayment();
        await enrollInCourse(course.$id);
        toast.success('Payment successful! You are now enrolled in the course.');
        router.push(`/courses/${course.$id}`);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Failed to complete enrollment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSubmitted = (paymentRequest) => {
    // Called when mobile payment is submitted
    toast.success('Payment request submitted! You will be enrolled once verified.');
    router.push(`/courses/${course.$id}`);
  };
  
  const simulatePayment = async () => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, you would:
    // 1. Send payment data to your backend
    // 2. Process payment with Stripe, PayPal, etc.
    // 3. Handle payment success/failure
    // 4. Create payment record in database
    
    return { success: true, transactionId: 'sim_' + Date.now() };
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're trying to purchase doesn't exist.</p>
          <Link href="/courses" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/courses/${course.$id}`} className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block">
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your enrollment for {course.title}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Billing Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={billingInfo.firstName}
                    onChange={(e) => handleBillingInfoChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={billingInfo.lastName}
                    onChange={(e) => handleBillingInfoChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={billingInfo.email}
                    onChange={(e) => handleBillingInfoChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={billingInfo.phone}
                    onChange={(e) => handleBillingInfoChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            {course.price > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
                
                {/* Payment Method Selection */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <input
                      id="card"
                      name="payment-method"
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                      Credit/Debit Card
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="paypal"
                      name="payment-method"
                      type="radio"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700">
                      PayPal
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="mobile"
                      name="payment-method"
                      type="radio"
                      value="mobile"
                      checked={paymentMethod === 'mobile'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="mobile" className="ml-3 block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-pink-600 font-semibold">bKash</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-orange-600 font-semibold">Nagad</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">Popular in Bangladesh</span>
                    </label>
                  </div>
                </div>
                
                {/* Card Information */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                      <input
                        type="text"
                        value={cardInfo.cardholderName}
                        onChange={(e) => handleCardInfoChange('cardholderName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                      <input
                        type="text"
                        value={cardInfo.cardNumber}
                        onChange={(e) => handleCardInfoChange('cardNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                        <input
                          type="text"
                          value={cardInfo.expiryDate}
                          onChange={(e) => handleCardInfoChange('expiryDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                        <input
                          type="text"
                          value={cardInfo.cvv}
                          onChange={(e) => handleCardInfoChange('cvv', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'mobile' && (
                  <div className="mt-6">
                    <PaymentSubmission 
                      course={course} 
                      onPaymentSubmitted={handlePaymentSubmitted}
                    />
                  </div>
                )}
                
                {paymentMethod === 'paypal' && (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.93 4.778-4.005 6.405-7.974 6.405h-2.19c-.524 0-.968.382-1.05.9L8.238 20.9h4.605a.641.641 0 0 0 .633-.74l.034-.17.654-4.14.042-.23a.641.641 0 0 1 .633-.54h.4c3.131 0 5.583-1.275 6.295-4.96.297-1.54.143-2.827-.654-3.743z"/>
                      </svg>
                      PayPal
                    </div>
                    <p className="text-sm text-gray-600">
                      You will be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Course Info */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  {course.thumbnail ? (
                    <Image 
                      src={course.thumbnail} 
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className={`text-white font-semibold text-lg ${course.thumbnail ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>{course.title.charAt(0)}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{course.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">by {course.instructor}</p>
                </div>
              </div>
              
              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Course Price</span>
                  <span className="font-medium">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                </div>
                
                {course.originalPrice && course.originalPrice > course.price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Original Price</span>
                    <span className="text-gray-500 line-through">${course.originalPrice}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">$0.00</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{course.price === 0 ? 'Free' : `$${course.price}`}</span>
                </div>
              </div>
              
              {/* Enrollment Button - Hidden for mobile payments */}
              {paymentMethod !== 'mobile' && (
                <button
                  onClick={handleEnrollment}
                  disabled={processing}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
                >
                  {processing ? (
                    <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {course.price === 0 ? 'Enrolling...' : 'Processing Payment...'}
                  </div>
                ) : (
                  course.price === 0 ? 'Enroll for Free' : 'Complete Purchase'
                )}
              </button>
              )}
              
              {/* Security Notice */}
              <div className="text-xs text-gray-500 text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Checkout
                </div>
                <p>Your payment information is encrypted and secure. We never store your card details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg">Loading checkout...</div></div>}>
      <CheckoutContent />
    </Suspense>
  );
};

export default CheckoutPage;