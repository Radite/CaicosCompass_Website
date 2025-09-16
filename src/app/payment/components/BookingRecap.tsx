// /app/payment/components/BookingRecap.tsx
import React from 'react';
import { BookingData } from '../../booking/types'; // Adjust this import path if needed
import styles from '../paymentpage.module.css';
import { FaCalendarAlt, FaClock, FaUsers, FaTag } from 'react-icons/fa';

interface BookingRecapProps {
    data: BookingData;
    guestName?: string; // Add optional guestName prop
}

const BookingRecap: React.FC<BookingRecapProps> = ({ data, guestName }) => {
    const displayName = data.contactInfo?.firstName || guestName || 'Guest';

    return (
        <div className={styles.recapContainer}>
            <h3>Booking Summary For: {displayName}</h3>
            <div className={styles.recapItem}>
                <p><strong>{data.activityName}</strong></p>
                {data.option && <p className={styles.recapOptionTitle}>{data.option.title}</p>}
            </div>
            <div className={styles.recapGrid}>
                <div className={styles.recapItem}><FaCalendarAlt /> <span>{new Date(data.date).toDateString()}</span></div>
                <div className={styles.recapItem}><FaClock /> <span>{data.timeSlot.startTime} - {data.timeSlot.endTime}</span></div>
                <div className={styles.recapItem}><FaUsers /> <span>{data.numPeople} Person(s)</span></div>
                <div className={styles.recapItem}><FaTag /> <span>${data.price.toFixed(2)} / person</span></div>
            </div>
            <hr className={styles.recapDivider} />
            <div className={styles.recapTotal}>
                <strong>Total</strong>
                <strong>${data.totalPrice.toFixed(2)}</strong>
            </div>
        </div>
    );
};

export default BookingRecap;