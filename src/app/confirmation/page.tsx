"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './confirmation.module.css';
import Spinner from '../payment/components/Spinner'; // Assuming this is a nice spinner

// Define a type for the booking data for better code safety
type BookingDetails = {
    _id: string;
    category: 'stay' | 'activity';
    status: string;
    details: {
        stayName?: string;
        activityName?: string;
        mainImage?: string;
        location?: string;
    };
    startDate?: string;
    endDate?: string;
    date?: string;
    time?: string;
    guestName?: string;
};

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Confirming your booking...');
    
    const paymentIntentId = searchParams.get('payment_intent');

    useEffect(() => {
        if (!paymentIntentId) {
            setStatus('error');
            setMessage('No payment information was found. Please check the link or contact support.');
            return;
        }

        let attempts = 0;
        const maxAttempts = 5; // Will try to fetch for 10 seconds

        const fetchBooking = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/bookings/by-payment-intent/${paymentIntentId}`);
                
                if (response.status === 404 && attempts < maxAttempts) {
                    attempts++;
                    setMessage(`Waiting for confirmation... (Attempt ${attempts}/${maxAttempts})`);
                    setTimeout(fetchBooking, 2000); // Wait 2 seconds and try again
                    return;
                }
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to retrieve your booking details.");
                }

                const result = await response.json();
                setBooking(result.data);
                setStatus('success');
                // The main title will be static, the subtitle will be dynamic
            } catch (err) {
                setStatus('error');
                setMessage(err instanceof Error ? err.message : "An unknown error occurred while fetching your booking.");
            }
        };

        fetchBooking();

    }, [paymentIntentId]);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {status === 'loading' && (
                    <>
                        <Spinner />
                        <h1 className={styles.title}>{message}</h1>
                        <p className={styles.subtitle}>Please wait while we finalize the details. This shouldn't take long.</p>
                    </>
                )}

                {status === 'success' && booking && (
                    <>
                        <div className={`${styles.iconWrapper} ${styles.iconSuccess}`}>
                           {/* Animated Checkmark */}
                           <div className={styles.checkmark}>
                             <div className={styles.checkmarkStem}></div>
                             <div className={styles.checkmarkKick}></div>
                           </div>
                        </div>
                        <h1 className={styles.title}>Booking Confirmed!</h1>
                        <p className={styles.subtitle}>
                            Thank you, {booking.guestName}! A confirmation email has been sent to your address.
                        </p>
                        
                        <div className={styles.bookingDetails}>
                            <h2 className={styles.detailsHeader}>Booking Summary</h2>
                            <div className={styles.item}>
                                <strong>Booking ID:</strong> <span>{booking._id}</span>
                            </div>
                            <div className={styles.item}>
                                <strong>Service:</strong> <span>{booking.details?.stayName || booking.details?.activityName}</span>
                            </div>
                            {booking.startDate && booking.endDate && (
                                <div className={styles.item}>
                                    <strong>Dates:</strong> <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                                </div>
                            )}
                            {booking.date && (
                                <div className={styles.item}>
                                    <strong>Date:</strong> <span>{formatDate(booking.date)} at {booking.time}</span>
                                </div>
                            )}
                        </div>

                        <button className={`${styles.homeButton} ${styles.homeButtonSuccess}`} onClick={() => router.push('/')}>
                            Back to Home
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className={`${styles.iconWrapper} ${styles.iconError}`}>
                            <div className={styles.cross}>×</div>
                        </div>
                        <h1 className={styles.title}>Booking Failed</h1>
                        <p className={styles.subtitle}>{message}</p>
                        <button className={`${styles.homeButton} ${styles.homeButtonError}`} onClick={() => router.push('/')}>
                            Back to Home
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// Main page export that includes Suspense
export default function ConfirmationPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.card}>
                    <Spinner />
                    <h1 className={styles.title}>Loading...</h1>
                </div>
            </div>
        }>
            <ConfirmationContent />
        </Suspense>
    );
}