"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import styles from './paymentpage.module.css';

import { BookingData } from '../booking/types';
import CheckoutForm from './components/CheckoutForm';
import BookingRecap from './components/BookingRecap';
import Spinner from './components/Spinner';
import { useAuth } from '../contexts/AuthContext'; // <-- Adjust the import path as needed


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated, user, loading: authLoading } = useAuth();

    // State variables remain the same
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [clientSecret, setClientSecret] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [checkoutChoice, setCheckoutChoice] = useState<'none' | 'signin' | 'guest'>('none');
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [isGuestInfoSubmitted, setIsGuestInfoSubmitted] = useState(false);

    // ✅ FIX 1: useEffect for LOADING DATA (runs once)
    // This hook's only job is to get the booking data from either sessionStorage or the URL.
    useEffect(() => {
        // Don't run if data is already loaded or auth is still in progress
        if (bookingData || authLoading) return;

        let bookingJsonString: string | null = null;
        const useSession = searchParams.get('useSession') === 'true';

        if (useSession) {
            bookingJsonString = sessionStorage.getItem('pendingBooking');
            // We remove it immediately after reading to prevent re-use.
            sessionStorage.removeItem('pendingBooking');
        } else {
            // This preserves your fallback for other booking types.
            bookingJsonString = searchParams.get('booking');
        }

        if (!bookingJsonString) {
            setError('No booking information found.');
            setLoading(false);
            return;
        }

        try {
            const parsedData = useSession 
                ? JSON.parse(bookingJsonString) 
                : JSON.parse(decodeURIComponent(bookingJsonString));
            // Set the data into state, which will trigger the next hook.
                 console.log("--- 2. [Payment Page] Received Booking Data ---");
      console.log(JSON.stringify(parsedData, null, 2));
            setBookingData(parsedData);
        } catch (e) {
            console.error("Error parsing booking data:", e);
            setError('Invalid booking data.');
            setLoading(false);
        }
    }, [searchParams, authLoading, bookingData]);


    // ✅ FIX 2: useEffect for PAYMENT LOGIC (reacts to data)
    // This hook waits for bookingData to exist, then handles the payment intent creation.
    useEffect(() => {
        // Exit if we don't have data, auth is loading, or we already have a clientSecret.
        if (!bookingData || authLoading || clientSecret) {
            return;
        }
        
        const isReadyToPay = isAuthenticated || isGuestInfoSubmitted;

        if (isReadyToPay) {
            setLoading(true);

            const finalBookingData = {
                ...bookingData,
                user: isAuthenticated ? user._id : null,
                guestName: !isAuthenticated ? guestName : `${user.firstName} ${user.lastName}`,
                guestEmail: !isAuthenticated ? guestEmail : user.email,
                contactInfo: {
                    firstName: isAuthenticated ? user.firstName : guestName.split(' ')[0] || '',
                    lastName: isAuthenticated ? user.lastName : guestName.split(' ').slice(1).join(' ') || '',
                    email: isAuthenticated ? user.email : guestEmail,
                }
            };
            
            // This API call is now safe from the race condition.
            fetch('http://localhost:5000/api/payments/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingData: finalBookingData }),
            })
            .then(res => {
                if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Failed to create payment intent.') });
                return res.json();
            })
            .then(data => {
                if (data.error) throw new Error(data.error);
                setClientSecret(data.clientSecret);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
        } else {
            // If the page is just waiting for user input (e.g., guest login choice), stop the main loader.
            setLoading(false);
        }
    }, [bookingData, isAuthenticated, user, isGuestInfoSubmitted, guestName, guestEmail, authLoading, clientSecret]);

const handleGuestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(guestName && guestEmail) {
            setIsGuestInfoSubmitted(true);
        }
    };
    

    const handleSignInRedirect = () => {
        // Create a return URL that includes the current booking data
        const currentUrl = window.location.pathname + window.location.search;
        const returnUrl = encodeURIComponent(currentUrl);
        router.push(`/login?redirect=${returnUrl}`);
    };

    const handleContinueAsGuest = () => {
        setCheckoutChoice('guest');
    };

if (authLoading) {
        return <div className={styles.centered}><Spinner /></div>;
    }


    if (error) {
        return <div className={styles.centered}><p className={styles.errorText}>{error}</p></div>;
    }

    if (!bookingData) {
        return <div className={styles.centered}><p>Could not load booking data.</p></div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.recapSection}>
                <BookingRecap data={bookingData} guestName={!isAuthenticated ? guestName : undefined} />
            </div>
            
            <div className={styles.paymentSection}>
                {/* Show choice screen for non-logged in users who haven't made a choice yet */}
                {!isAuthenticated && checkoutChoice === 'none' && (
                    <div className={styles.checkoutChoiceContainer}>
                        <h3 className={styles.checkoutTitle}>How would you like to checkout?</h3>
                        
                        {/* Sign In Option */}
                        <div className={styles.choiceCard} onClick={handleSignInRedirect}>
                            <div className={styles.choiceIcon}>👤</div>
                            <div className={styles.choiceContent}>
                                <h4>Sign in to your account</h4>
                                <p>Access your saved information and booking history</p>
                                <ul className={styles.benefitsList}>
                                    <li>Faster checkout</li>
                                    <li>Order tracking</li>
                                    <li>Exclusive member benefits</li>
                                </ul>
                            </div>
                            <button className={styles.choiceButton}>Sign In</button>
                        </div>

                        {/* Guest Checkout Option */}
                        <div className={styles.choiceCard} onClick={handleContinueAsGuest}>
                            <div className={styles.choiceIcon}>🛒</div>
                            <div className={styles.choiceContent}>
                                <h4>Continue as guest</h4>
                                <p>Checkout quickly without creating an account</p>
                                <ul className={styles.benefitsList}>
                                    <li>No account required</li>
                                    <li>Quick and simple</li>
                                    <li>Secure payment</li>
                                </ul>
                            </div>
                            <button className={styles.choiceButton}>Continue as Guest</button>
                        </div>

                        <p className={styles.securityNote}>
                            🔒 Your payment information is secure and encrypted
                        </p>
                    </div>
                )}

                {/* Guest form - only show after user chooses guest checkout */}
{!isAuthenticated && checkoutChoice === 'guest' && !clientSecret && (
                    <div className={styles.guestCheckoutContainer}>
                        <div className={styles.guestHeader}>
                            <h4>Guest Checkout</h4>
                            <p>Just need a few details to continue</p>
                        </div>
                        
                        <form onSubmit={handleGuestSubmit} className={styles.guestForm}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="guestName" className={styles.inputLabel}>Full Name *</label>
                                <input
                                    id="guestName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    required
                                    className={styles.inputField}
                                />
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="guestEmail" className={styles.inputLabel}>Email Address *</label>
                                <input
                                    id="guestEmail"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    required
                                    className={styles.inputField}
                                />
                                <small className={styles.emailNote}>
                                    We'll send your booking confirmation to this email
                                </small>
                            </div>
                            
                            <button type="submit" disabled={loading} className={styles.continueButton}>
                                {loading ? <Spinner /> : 'Continue to Payment'}
                            </button>
                        </form>
                        
                        <div className={styles.signInPrompt}>
                            <p>Already have an account? 
                                <button 
                                    type="button" 
                                    onClick={handleSignInRedirect} 
                                    className={styles.signInLink}
                                >
                                    Sign in instead
                                </button>
                            </p>
                        </div>
                    </div>
                )}

                {/* Payment form - show when we have client secret */}
                {clientSecret && (
                    <div className={styles.paymentContainer}>
                        <h4 className={styles.paymentTitle}>Complete Your Payment</h4>
                        <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                            <CheckoutForm />
                        </Elements>
                    </div>
                )}
            </div>
        </div>
    );
}

// The wrapper component that is the default export
export default function PaymentPage() {
    return (
        // The Suspense boundary is required for components that use useSearchParams
        <Suspense fallback={<div className={styles.centered}><Spinner /></div>}>
            <PaymentPageContent />
        </Suspense>
    );
}