"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './confirmation.module.css';
import Spinner from '../payment/components/Spinner';

type BookingDetails = {
    _id: string;
    bookingId: string;
    serviceType: string;
    status: string;
    service?: {
        name?: string;
        location?: string;
        images?: Array<{ url: string }>;
    };
    scheduledDateTime?: string;
    pricing?: {
        totalAmount?: number;
    };
    guestInfo?: {
        name?: string;
        email?: string;
    };
    customer?: {
        name?: string;
        email?: string;
    };
};

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [bookings, setBookings] = useState<BookingDetails[]>([]);
    const [isCart, setIsCart] = useState(false);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Confirming your booking...');
    
    const paymentIntentId = searchParams.get('payment_intent');
    const fromCart = searchParams.get('from') === 'cart';

    useEffect(() => {
        if (!paymentIntentId) {
            setStatus('error');
            setMessage('No payment information was found. Please check the link or contact support.');
            return;
        }

        let attempts = 0;
        const maxAttempts = 10; // Increased for cart checkouts (may take longer)

        const fetchBooking = async () => {
            try {
                setMessage(`Waiting for confirmation... (Attempt ${attempts + 1}/${maxAttempts})\nPlease wait while we finalize the details. This shouldn't take long.`);
                
                const response = await fetch(`http://localhost:5000/api/bookings/by-payment-intent/${paymentIntentId}`);
                
                if (response.status === 404 && attempts < maxAttempts) {
                    attempts++;
                    setTimeout(fetchBooking, 2000); // Wait 2 seconds and try again
                    return;
                }
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to retrieve your booking details.");
                }

                const result = await response.json();
                
                // ✅ Handle both single and multiple bookings
                if (result.isCart) {
                    setBookings(result.data);
                    setIsCart(true);
                } else {
                    setBookings([result.data]);
                    setIsCart(false);
                }
                
                setStatus('success');
            } catch (err) {
                setStatus('error');
                setMessage(err instanceof Error ? err.message : "An unknown error occurred while fetching your booking.");
            }
        };

        fetchBooking();
    }, [paymentIntentId]);

    if (status === 'loading') {
        return (
            <div className={styles.container}>
                <div className={styles.loadingCard}>
                    <Spinner />
                    <h2>Processing Your Booking</h2>
                    <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className={styles.container}>
                <div className={styles.errorCard}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h2>Booking Failed</h2>
                    <p>{message}</p>
                    <button onClick={() => router.push('/')} className={styles.button}>
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    // ✅ Success - Show booking confirmation(s)
    const totalAmount = bookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
    
    return (
        <div className={styles.container}>
            <div className={styles.successCard}>
                <div className={styles.successIcon}>✅</div>
                
                {isCart ? (
                    <>
                        <h1>Bookings Confirmed!</h1>
                        <p className={styles.subtitle}>
                            Your {bookings.length} booking{bookings.length > 1 ? 's have' : ' has'} been successfully confirmed
                        </p>
                    </>
                ) : (
                    <>
                        <h1>Booking Confirmed!</h1>
                        <p className={styles.subtitle}>Your booking has been successfully confirmed</p>
                    </>
                )}

                <div className={styles.bookingsList}>
                    {bookings.map((booking, index) => (
                        <div key={booking._id} className={styles.bookingCard}>
                            <div className={styles.bookingHeader}>
                                <h3>{booking.service?.name || 'Service'}</h3>
                                <span className={styles.bookingNumber}>#{booking.bookingId}</span>
                            </div>
                            
                            <div className={styles.bookingDetails}>
                                <p><strong>Service Type:</strong> {booking.serviceType}</p>
                                <p><strong>Status:</strong> <span className={styles.statusConfirmed}>{booking.status}</span></p>
                                {booking.service?.location && (
                                    <p><strong>Location:</strong> {booking.service.location}</p>
                                )}
                                {booking.scheduledDateTime && (
                                    <p><strong>Date:</strong> {new Date(booking.scheduledDateTime).toLocaleDateString()}</p>
                                )}
                                <p><strong>Amount:</strong> ${booking.pricing?.totalAmount?.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.totalSection}>
                    <h3>Total Amount Paid</h3>
                    <p className={styles.totalAmount}>${totalAmount.toFixed(2)}</p>
                </div>

                <div className={styles.nextSteps}>
                    <h3>What's Next?</h3>
                    <ul>
                        <li>✉️ Confirmation emails have been sent for each booking</li>
                        <li>📋 You can view your bookings in your dashboard</li>
                        <li>📞 Vendors will contact you if needed</li>
                    </ul>
                </div>

                <div className={styles.actions}>
                    <button onClick={() => router.push('/my-bookings')} className={styles.primaryButton}>
                        View My Bookings
                    </button>
                    <button onClick={() => router.push('/')} className={styles.secondaryButton}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Spinner /></div>}>
            <ConfirmationContent />
        </Suspense>
    );
}