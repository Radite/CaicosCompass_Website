"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Shield, Calendar, MapPin, Clock, User, Mail, Phone, Lock } from 'lucide-react';

// Types from the original component
interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface BookingInfo {
  spaId: string;
  spaName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  timeSlot: TimeSlot;
  price: number;
  discountedPrice?: number;
  location: string;
  island: string;
  spaType: string;
  duration: number;
  category: string;
  description: string;
  images: string[];
  cancellationPolicy: string;
  paymentOptions: string[];
}

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

type PaymentMethod = 'card' | 'cash' | 'bank transfer' | string;

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false);
  
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);

  useEffect(() => {
    // Parse booking information from URL params or sessionStorage
    const bookingParam = searchParams?.get('booking');
    const useSession = searchParams?.get('useSession');
    
    try {
      let bookingData: BookingInfo;
      
      if (useSession === 'true') {
        const sessionData = sessionStorage.getItem('pendingBooking');
        if (!sessionData) throw new Error('No booking data found in session');
        bookingData = JSON.parse(sessionData);
      } else if (bookingParam) {
        bookingData = JSON.parse(decodeURIComponent(bookingParam));
      } else {
        throw new Error('No booking data provided');
      }
      
      setBooking(bookingData);
      setCustomerDetails(prev => ({
        ...prev,
        cardholderName: `${prev.firstName} ${prev.lastName}`.trim()
      }));
    } catch (err) {
      console.error('Error parsing booking data:', err);
      setError('Unable to load booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/\d{4}/g);
    return match ? match.join(' ').substr(0, 19) : cleaned;
  };

  const formatExpiryDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return customerDetails.firstName.trim() !== '' &&
             customerDetails.lastName.trim() !== '' &&
             customerDetails.email.trim() !== '' &&
             customerDetails.phone.trim() !== '';
    }
    if (step === 2) {
      if (selectedPaymentMethod === 'card') {
        return paymentDetails.cardNumber.replace(/\s/g, '').length >= 13 &&
               paymentDetails.expiryDate.length === 5 &&
               paymentDetails.cvv.length >= 3 &&
               paymentDetails.cardholderName.trim() !== '' &&
               agreeToTerms;
      }
      return agreeToTerms;
    }
    return true;
  };

  const handleNextStep = (): void => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = (): void => {
    setCurrentStep(currentStep - 1);
  };

  const handlePayment = async (): Promise<void> => {
    if (!validateStep(2) || !booking) return;
    
    setProcessingPayment(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Here you would integrate with your actual payment processor
      const paymentData = {
        booking,
        customer: customerDetails,
        payment: selectedPaymentMethod === 'card' ? paymentDetails : { method: selectedPaymentMethod },
        timestamp: new Date().toISOString(),
        confirmationNumber: `SPA${Date.now().toString().slice(-6)}`
      };
      
      console.log('Payment processed:', paymentData);
      
      setPaymentComplete(true);
      setCurrentStep(3);
    } catch (err) {
      setError('Payment processing failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    e.target.style.borderColor = '#0C54CF';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    e.target.style.borderColor = '#e9ecef';
  };

  const handleGoBack = (): void => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handlePrintConfirmation = (): void => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleGoHome = (): void => {
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💆‍♀️</div>
          <div>Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Error</h2>
          <p style={{ marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={handleGoBack}
            style={{
              background: '#0C54CF',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '3rem',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎉</div>
          <h1 style={{ color: '#28a745', marginBottom: '1rem', fontSize: '2rem' }}>
            Booking Confirmed!
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#6c757d', marginBottom: '2rem' }}>
            Your spa appointment has been successfully booked.
          </p>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Booking Details</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div><strong>Service:</strong> {booking.serviceName}</div>
              <div><strong>Date:</strong> {formatDate(booking.date)}</div>
              <div><strong>Time:</strong> {booking.timeSlot.startTime} - {booking.timeSlot.endTime}</div>
              <div><strong>Location:</strong> {booking.spaName}, {booking.location}</div>
              <div><strong>Duration:</strong> {booking.duration} minutes</div>
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #dee2e6' }}>
                <strong>Total Paid:</strong> ${booking.discountedPrice || booking.price}
              </div>
            </div>
          </div>
          
          <div style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            textAlign: 'left'
          }}>
            <strong>What's Next?</strong>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              <li>You'll receive a confirmation email shortly</li>
              <li>Arrive 15 minutes before your appointment</li>
              <li>Bring a valid ID for check-in</li>
              <li>Contact the spa if you need to reschedule</li>
            </ul>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={handleGoHome}
              style={{
                background: '#0C54CF',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Book Another Service
            </button>
            <button
              onClick={handlePrintConfirmation}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Print Confirmation
            </button>
          </div>
        </div>
      </div>
    );
  }

  const finalPrice = booking.discountedPrice || booking.price;
  const savings = booking.discountedPrice ? booking.price - booking.discountedPrice : 0;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '2rem',
          color: 'white'
        }}>
          <button
            onClick={handleGoBack}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '1rem',
              display: 'flex',
              alignItems: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Complete Your Booking</h1>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
              Step {currentStep} of 3
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  background: currentStep >= step ? 'white' : 'transparent',
                  color: currentStep >= step ? '#0C54CF' : 'white',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {step === 1 && <><User size={16} style={{ marginRight: '8px' }} />Details</>}
                {step === 2 && <><CreditCard size={16} style={{ marginRight: '8px' }} />Payment</>}
                {step === 3 && <><Shield size={16} style={{ marginRight: '8px' }} />Confirm</>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Main Content */}
          <div style={{ flex: '2', minWidth: '400px' }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              {/* Step 1: Customer Details */}
              {currentStep === 1 && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>
                    <User size={24} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
                    Your Details
                  </h2>
                  
                  <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={customerDetails.firstName}
                        onChange={(e) => setCustomerDetails(prev => ({ ...prev, firstName: e.target.value }))}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e9ecef',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s ease'
                        }}
                        required
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={customerDetails.lastName}
                        onChange={(e) => setCustomerDetails(prev => ({ ...prev, lastName: e.target.value }))}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e9ecef',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s ease'
                        }}
                        required
                      />
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                      <Mail size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s ease'
                      }}
                      required
                    />
                  </div>
                  
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                      <Phone size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s ease'
                      }}
                      required
                    />
                  </div>
                  
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={customerDetails.specialRequests}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, specialRequests: e.target.value }))}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      rows={3}
                      placeholder="Any allergies, preferences, or special needs we should know about?"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s ease'
                      }}
                    />
                  </div>
                  
                  <button
                    onClick={handleNextStep}
                    disabled={!validateStep(1)}
                    style={{
                      width: '100%',
                      background: validateStep(1) ? '#0C54CF' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '16px',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      cursor: validateStep(1) ? 'pointer' : 'not-allowed',
                      marginTop: '2rem',
                      opacity: validateStep(1) ? 1 : 0.6,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>
                    <CreditCard size={24} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
                    Payment Details
                  </h2>
                  
                  {/* Payment Method Selection */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600', color: '#495057' }}>
                      Payment Method
                    </label>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {booking.paymentOptions.map((option: string) => (
                        <button
                          key={option}
                          onClick={() => setSelectedPaymentMethod(option.toLowerCase())}
                          style={{
                            background: selectedPaymentMethod === option.toLowerCase() ? '#0C54CF' : 'white',
                            color: selectedPaymentMethod === option.toLowerCase() ? 'white' : '#495057',
                            border: '2px solid #e9ecef',
                            borderColor: selectedPaymentMethod === option.toLowerCase() ? '#0C54CF' : '#e9ecef',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Card Payment Form */}
                  {selectedPaymentMethod === 'card' && (
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                          <Lock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                          Card Number *
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.cardNumber}
                          onChange={(e) => setPaymentDetails(prev => ({ 
                            ...prev, 
                            cardNumber: formatCardNumber(e.target.value) 
                          }))}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            transition: 'border-color 0.2s ease'
                          }}
                          required
                        />
                      </div>
                      
                      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.expiryDate}
                            onChange={(e) => setPaymentDetails(prev => ({ 
                              ...prev, 
                              expiryDate: formatExpiryDate(e.target.value) 
                            }))}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            placeholder="MM/YY"
                            maxLength={5}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '2px solid #e9ecef',
                              borderRadius: '8px',
                              fontSize: '1rem',
                              transition: 'border-color 0.2s ease'
                            }}
                            required
                          />
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.cvv}
                            onChange={(e) => setPaymentDetails(prev => ({ 
                              ...prev, 
                              cvv: e.target.value.replace(/\D/g, '') 
                            }))}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            placeholder="123"
                            maxLength={4}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '2px solid #e9ecef',
                              borderRadius: '8px',
                              fontSize: '1rem',
                              transition: 'border-color 0.2s ease'
                            }}
                            required
                          />
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.cardholderName}
                          onChange={(e) => setPaymentDetails(prev => ({ 
                            ...prev, 
                            cardholderName: e.target.value 
                          }))}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          placeholder="John Doe"
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            transition: 'border-color 0.2s ease'
                          }}
                          required
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Terms and Conditions */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '12px',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      lineHeight: '1.5'
                    }}>
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        style={{
                          marginTop: '4px',
                          transform: 'scale(1.2)'
                        }}
                      />
                      <span style={{ color: '#495057' }}>
                        I agree to the{' '}
                        <a href="#" style={{ color: '#0C54CF', textDecoration: 'underline' }}>
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" style={{ color: '#0C54CF', textDecoration: 'underline' }}>
                          Cancellation Policy
                        </a>.
                        I understand that cancellations must be made at least 24 hours in advance.
                      </span>
                    </label>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={handlePreviousStep}
                      style={{
                        flex: '1',
                        background: 'white',
                        color: '#6c757d',
                        border: '2px solid #e9ecef',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={!validateStep(2) || processingPayment}
                      style={{
                        flex: '2',
                        background: validateStep(2) && !processingPayment ? '#28a745' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: validateStep(2) && !processingPayment ? 'pointer' : 'not-allowed',
                        opacity: validateStep(2) && !processingPayment ? 1 : 0.6,
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {processingPayment ? (
                        <>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Shield size={20} />
                          Complete Payment (${finalPrice})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '2rem'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Booking Summary</h3>
              
              {/* Service Image */}
              {booking.images[0] && (
                <img
                  src={booking.images[0]}
                  alt={booking.serviceName}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    marginBottom: '1rem'
                  }}
                />
              )}
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#333' }}>
                  {booking.serviceName}
                </h4>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
                  {booking.category} • {booking.duration} minutes
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={16} style={{ color: '#0C54CF' }} />
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>{formatDate(booking.date)}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                      {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={16} style={{ color: '#0C54CF' }} />
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>{booking.spaName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                      {booking.location}, {booking.island}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={16} style={{ color: '#0C54CF' }} />
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>Duration</div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                      {booking.duration} minutes
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Price Breakdown */}
              <div style={{
                borderTop: '1px solid #e9ecef',
                paddingTop: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#6c757d' }}>Service Price:</span>
                  <span style={{ 
                    color: savings > 0 ? '#6c757d' : '#333', 
                    textDecoration: savings > 0 ? 'line-through' : 'none' 
                  }}>
                    ${booking.price}
                  </span>
                </div>
                
                {savings > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#28a745', fontWeight: '600' }}>Discount:</span>
                      <span style={{ color: '#28a745', fontWeight: '600' }}>-${savings}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#6c757d' }}>Discounted Price:</span>
                      <span style={{ color: '#333' }}>${booking.discountedPrice}</span>
                    </div>
                  </>
                )}
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  paddingTop: '1rem',
                  borderTop: '2px solid #e9ecef',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  <span style={{ color: '#333' }}>Total:</span>
                  <span style={{ color: '#0C54CF' }}>${finalPrice}</span>
                </div>
                
                {savings > 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    textAlign: 'center',
                    marginTop: '1rem',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    You saved ${savings}! ({Math.round((savings / booking.price) * 100)}% off)
                  </div>
                )}
              </div>
              
              {/* Security Notice */}
              <div style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '1.5rem',
                fontSize: '0.85rem',
                textAlign: 'center'
              }}>
                <Shield size={16} style={{ marginBottom: '0.5rem', color: '#28a745' }} />
                <div style={{ color: '#6c757d' }}>
                  Your payment information is encrypted and secure. We never store your card details.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;