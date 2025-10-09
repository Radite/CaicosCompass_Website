// src/app/itinerary/BookingDetailsModal.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDownload } from '@fortawesome/free-solid-svg-icons';
import styles from './itinerary.module.css';
import { BookingDetailsModalProps } from './types';

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose, onDownloadPDF }) => {
  if (!booking) return null;

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className={styles.modalHeader}>
          <h3>{booking.serviceDetails.name}</h3>
          <p>{booking.category.charAt(0).toUpperCase() + booking.category.slice(1)} Booking Details</p>
        </div>

        <div className={styles.modalBody}>
          <h4>Booking Information</h4>
          <ul>
            <li><strong>Status:</strong> <span className={styles.modalStatus}>{booking.status}</span></li>
            {booking.category === 'stay' ? (
              <>
                <li><strong>Check-in:</strong> {formatDate(booking.startDate)}</li>
                <li><strong>Check-out:</strong> {formatDate(booking.endDate)}</li>
              </>
            ) : (
              <li><strong>Date:</strong> {formatDate(booking.date)}</li>
            )}
            {booking.time && <li><strong>Time:</strong> {booking.time}</li>}
            <li><strong>Guests:</strong> {booking.numOfPeople}</li>
            {booking.pickupLocation && <li><strong>Pickup:</strong> {booking.pickupLocation}</li>}
            {booking.dropoffLocation && <li><strong>Drop-off:</strong> {booking.dropoffLocation}</li>}
          </ul>

          <h4>Payment Details</h4>
          <ul>
            <li><strong>Total Amount:</strong> ${booking.paymentDetails.totalAmount.toFixed(2)}</li>
            <li><strong>Amount Paid:</strong> ${booking.paymentDetails.amountPaid.toFixed(2)}</li>
            <li className={booking.paymentDetails.remainingBalance > 0 ? styles.remaining : ''}>
              <strong>Balance Due:</strong> ${booking.paymentDetails.remainingBalance.toFixed(2)}
            </li>
          </ul>

          {booking.requirements?.specialNotes && (
            <>
              <h4>Special Notes</h4>
              <p className={styles.specialNotes}>{booking.requirements.specialNotes}</p>
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.downloadBtn} onClick={() => onDownloadPDF(booking)}>
            <FontAwesomeIcon icon={faDownload} /> Download Confirmation
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;