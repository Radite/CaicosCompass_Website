'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styles from './stay-checkout.module.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StayBookingData {
  serviceType: string;
  stay: string;
  user: string | null;
  guestName: string | null;
  guestEmail: string | null;
  startDate: string;
  endDate: string;
  numPeople: number;
  totalPrice: number;
  stayName: string;
  pricePerNight: number;
  nights: number;
  cleaningFee: number;
  serviceFee: number;
  mainImage: string;
  location: string;
  island: string;
  contactInfo?: any;
}

// Updated CheckoutForm to use PaymentElement and confirmPayment
function CheckoutForm({ totalPrice, billingDetails }: { totalPrice: number, billingDetails: { name: string, email: string } }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    // First trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Please check your payment details.');
      setLoading(false);
      return;
    }

    // Confirm payment using the new API
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation`,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
    // On success, user is redirected to return_url automatically
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <div className={styles.cardElementContainer}>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <button type="submit" disabled={!stripe || loading} className={styles.payButton}>
        {loading ? 'Processing...' : `Pay $${totalPrice}`}
      </button>
      <div className={styles.securityInfo}>
        <p>Your payment is secure and encrypted.</p>
      </div>
    </form>
  );
}

export default function StayCheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bookingData, setBookingData] = useState<StayBookingData | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        const storedBooking = sessionStorage.getItem('pendingBooking');
        if (!storedBooking) {
          throw new Error('No booking data found in session.');
        }

        const data: StayBookingData = JSON.parse(storedBooking);
        if (data.serviceType !== 'Stay') {
          throw new Error('Invalid booking type for this checkout page.');
        }
        setBookingData(data);

        // Prepare booking data for the unified backend
        const backendBookingData = {
          serviceType: 'Stay',
          user: data.user,
          guestName: data.guestName || (user ? `${user.firstName} ${user.lastName}` : 'Guest'),
          guestEmail: data.guestEmail || (user ? user.email : ''),
          stay: data.stay,
          startDate: data.startDate,
          endDate: data.endDate,
          numPeople: data.numPeople, // Use numPeople to match backend expectations
          totalPrice: data.totalPrice,
          stayName: data.stayName,
          pricePerNight: data.pricePerNight,
          nights: data.nights,
          cleaningFee: data.cleaningFee,
          serviceFee: data.serviceFee,
          mainImage: data.mainImage,
          location: data.location,
          island: data.island,
          contactInfo: data.contactInfo || (user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || ''
          } : {
            firstName: data.guestName?.split(' ')[0] || 'Guest',
            lastName: data.guestName?.split(' ').slice(1).join(' ') || '',
            email: data.guestEmail || ''
          })
        };

        console.log('Sending booking data to backend:', backendBookingData);

        // Create the Payment Intent using the unified backend
        const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingData: backendBookingData }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to initialize payment.');
        }
        
        const { clientSecret: newClientSecret } = await response.json();
        setClientSecret(newClientSecret);

      } catch (err) {
        console.error('Error initializing checkout:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        // Redirect if data is invalid or missing
        setTimeout(() => router.push('/'), 3000);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      initializeCheckout();
    }
  }, [router, authLoading, user]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Preparing your booking...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData || !clientSecret) {
    return (
       <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <h2>Oops! Something went wrong.</h2>
          <p>{error || 'Could not load booking details.'}</p>
          <button onClick={() => router.push('/')} className={styles.homeButton}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const billingDetails = {
    name: bookingData.guestName || `${user?.firstName} ${user?.lastName}` || 'Guest',
    email: bookingData.guestEmail || user?.email || '',
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <span>←</span> Back
        </button>
        <h1>Complete Your Booking</h1>
      </header>

      <div className={styles.checkoutContainer}>
        {/* Booking Summary Column */}
        <aside className={styles.bookingSummary}>
          <h2>Booking Summary</h2>
          <div className={styles.stayInfo}>
            <img src={bookingData.mainImage} alt={bookingData.stayName} className={styles.stayImage} />
            <div className={styles.stayDetails}>
              <h3>{bookingData.stayName}</h3>
              <p>{bookingData.location}, {bookingData.island}</p>
            </div>
          </div>
          <div className={styles.bookingDetails}>
            <div className={styles.detailRow}><span>Check-in</span><span>{formatDate(bookingData.startDate)}</span></div>
            <div className={styles.detailRow}><span>Check-out</span><span>{formatDate(bookingData.endDate)}</span></div>
            <div className={styles.detailRow}><span>Guests</span><span>{bookingData.numPeople}</span></div>
            <div className={styles.detailRow}><span>Nights</span><span>{bookingData.nights}</span></div>
          </div>
          <div className={styles.priceBreakdown}>
            <div className={styles.priceRow}><span>${bookingData.pricePerNight} × {bookingData.nights} nights</span><span>${bookingData.pricePerNight * bookingData.nights}</span></div>
            <div className={styles.priceRow}><span>Cleaning fee</span><span>${bookingData.cleaningFee}</span></div>
            <div className={styles.priceRow}><span>Service fee</span><span>${bookingData.serviceFee}</span></div>
            <div className={styles.priceDivider}></div>
            <div className={styles.totalRow}><span>Total</span><span>${bookingData.totalPrice}</span></div>
          </div>
        </aside>

        {/* Payment Column */}
        <main className={styles.paymentSection}>
          <h2>Payment Information</h2>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm totalPrice={bookingData.totalPrice} billingDetails={billingDetails} />
          </Elements>
        </main>
      </div>
    </div>
  );
}