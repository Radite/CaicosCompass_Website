// /app/confirmation/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './confirmation.module.css'; // Create this CSS file
import Spinner from '../payment/components/Spinner'; // Reuse the spinner

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [bookingId, setBookingId] = useState<string | null>(null);

    useEffect(() => {
        const paymentIntentId = searchParams.get('payment_intent');

        if (!paymentIntentId) {
            setStatus('error');
            setMessage('Could not find payment information.');
            return;
        }

        // Call your new backend endpoint to finalize the booking
fetch('http://localhost:5000/api/payments/finalize-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentIntentId }),
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success) throw new Error(data.message || 'Failed to confirm booking.');
            setStatus('success');
            setMessage('Your booking is confirmed!');
            setBookingId(data.data._id); // Assuming your booking data returns an _id
        })
        .catch(err => {
            setStatus('error');
            setMessage(err.message);
        });

    }, [searchParams]);
    
    return (
        <div className={styles.container}>
            {status === 'loading' && <Spinner />}
            {status === 'success' && (
                <div className={styles.card}>
                    <h2>✅ {message}</h2>
                    <p>A confirmation email has been sent to you.</p>
                    <p>Your Booking ID is: <strong>{bookingId}</strong></p>
                    {/* TODO: Add a prompt for guests to sign up */}
                </div>
            )}
            {status === 'error' && (
                <div className={`${styles.card} ${styles.error}`}>
                    <h2>❌ Booking Failed</h2>
                    <p>{message}</p>
                    <p>Please contact support with your payment details.</p>
                </div>
            )}
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div className={styles.container}><Spinner /></div>}>
            <ConfirmationContent />
        </Suspense>
    );
}