"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './confirmation.module.css'; // We'll create this CSS file next
import Spinner from '../payment/components/Spinner'; // Reuse your spinner component

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
            setMessage('No payment information was found in the URL.');
            return;
        }

        let attempts = 0;
        const maxAttempts = 5; // Will try to fetch for 10 seconds (5 attempts * 2s delay)

        const fetchBooking = async () => {
            try {
                // Fetch the booking using the new backend route
const response = await fetch(`http://localhost:5000/api/bookings/by-payment-intent/${paymentIntentId}`);
                
                // If not found, the webhook might be slightly delayed. Let's retry.
                if (response.status === 404 && attempts < maxAttempts) {
                    attempts++;
                    setMessage(`Waiting for confirmation... (Attempt ${attempts})`);
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
                setMessage('Your booking is confirmed!');

            } catch (err) {
                setStatus('error');
                setMessage(err instanceof Error ? err.message : "An unknown error occurred.");
            }
        };

        fetchBooking();

    }, [paymentIntentId]);

    const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {status === 'loading' && (
                    <>
                        <Spinner />
                        <h1 className={styles.title}>{message}</h1>
                        <p className={styles.subtitle}>Please wait while we finalize your details.</p>
                    </>
                )}

                {status === 'success' && booking && (
                    <>
                        <div className={styles.icon}>✅</div>
                        <h1 className={styles.title}>{message}</h1>
                        <p className={styles.subtitle}>Thank you, {booking.guestName}. A confirmation email has been sent.</p>
                        
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

                        <button className={styles.homeButton} onClick={() => router.push('/')}>
                            Back to Home
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className={`${styles.icon} ${styles.iconError}`}>❌</div>
                        <h1 className={styles.title}>Booking Failed</h1>
                        <p className={`${styles.subtitle} ${styles.subtitleError}`}>{message}</p>
                        <p className={styles.supportText}>Please contact support if you believe this is an error.</p>
                        <button className={styles.homeButton} onClick={() => router.push('/')}>
                            Try Again
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
        <Suspense fallback={<div className={styles.container}><Spinner /></div>}>
            <ConfirmationContent />
        </Suspense>
    );
}