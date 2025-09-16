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

    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [clientSecret, setClientSecret] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // New state for checkout flow
    const [checkoutChoice, setCheckoutChoice] = useState<'none' | 'signin' | 'guest'>('none');
    
    // State for guest checkout form
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [isGuestInfoSubmitted, setIsGuestInfoSubmitted] = useState(false);

    useEffect(() => {
        // Don't do anything until the auth context has finished its initial loading
        if (authLoading) {
            return;
        }

        const bookingParam = searchParams.get('booking');
        if (!bookingParam) {
            setError('No booking information found.');
            setLoading(false);
            return;
        }

        try {
            const parsedData = JSON.parse(decodeURIComponent(bookingParam));
            
            // This logic is now simplified. We only create the payment intent when we have user info.
            if (isAuthenticated || isGuestInfoSubmitted) {
                const finalBookingData = {
                    ...parsedData,
                    user: isAuthenticated ? user._id : null,
                    guestName: !isAuthenticated ? guestName : null,
                    guestEmail: !isAuthenticated ? guestEmail : null,
                    contactInfo: {
                        firstName: isAuthenticated ? user.firstName : guestName.split(' ')[0] || '',
                        lastName: isAuthenticated ? user.lastName : guestName.split(' ').slice(1).join(' ') || '',
                        email: isAuthenticated ? user.email : guestEmail,
                    }
                };

                // Don't proceed if the email is missing (e.g., guest form not filled)
                if (!finalBookingData.contactInfo.email) {
                    setLoading(false);
                    return;
                }
                
                setBookingData(finalBookingData);
                setLoading(true);

                console.log('=== DEBUGGING PAYMENT DATA ===');
console.log('isAuthenticated:', isAuthenticated);
console.log('user object:', user);
console.log('user._id:', user?._id);
console.log('finalBookingData.user:', finalBookingData.user);
console.log('Full finalBookingData:', finalBookingData);
// --- START: MODIFIED FETCH CALL ---
            fetch('http://localhost:5000/api/payments/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // THE FIX: Send the entire object under the "bookingData" key
                body: JSON.stringify({
                    bookingData: finalBookingData 
                }),
            })
            .then(res => {
                if (!res.ok) {
                    // This helps in debugging by showing the error from the backend
                    return res.json().then(err => { throw new Error(err.error || 'Failed to create payment intent.') });
                }
                return res.json();
            })
            .then(data => {
                if (data.error) throw new Error(data.error);
                setClientSecret(data.clientSecret);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
            // --- END: MODIFIED FETCH CALL ---

            } else {
                // User is not authenticated and hasn't submitted guest info yet
                setBookingData(parsedData);
                setLoading(false);
            }
        } catch (e) {
            setError('Invalid booking data.');
            setLoading(false);
        }
    // CHANGE 3: Update dependency array
    }, [searchParams, isAuthenticated, user, isGuestInfoSubmitted, guestName, guestEmail, authLoading]);
    
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