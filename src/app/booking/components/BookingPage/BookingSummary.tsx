import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { Option, Activity, TimeSlot } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import styles from '../../bookingpage.module.css';

interface BookingSummaryProps {
  activity: Activity | null;
  selectedOption: Option | null;
  selectedDate: string;
  selectedTime: TimeSlot | null;
  numPeople: number;
  onContinue: () => void;
  totalPrice: number; // Add totalPrice to the props interface
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ 
  activity, 
  selectedOption, 
  selectedDate, 
  selectedTime, 
  numPeople,
  onContinue,
  totalPrice // Receive totalPrice from props
}) => {
  return (
    <div className={styles.bookingSection}>
      <h3 className={styles.bookingTitle}>Booking Summary</h3>
      
      {selectedOption && (
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Package:</span>
          <span className={styles.summaryValue}>{selectedOption.title}</span>
        </div>
      )}
      
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>Date:</span>
        <span className={styles.summaryValue}>{formatDate(selectedDate)}</span>
      </div>
      
      {selectedTime && (
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Time:</span>
          <span className={styles.summaryValue}>{selectedTime.startTime} - {selectedTime.endTime}</span>
        </div>
      )}
      
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>Guests:</span>
        <span className={styles.summaryValue}>{numPeople}</span>
      </div>
      
      <div className={styles.summaryTotal}>
        <span className={styles.totalLabel}>Total Price:</span>
        <span className={styles.totalPrice}>${totalPrice.toFixed(2)}</span>
      </div>
      
      <button 
        onClick={onContinue} 
        className={styles.continueButton}
        disabled={!selectedTime}
      >
        Continue to Payment
      </button>
      
      <div className={styles.tipContainer}>
        <p className={styles.tipText}>
          <FaInfoCircle style={{ marginRight: '8px' }} />
          Secure your booking with our easy payment process. Cancellations are free up to 48 hours before your experience.
        </p>
      </div>
    </div>
  );
};

export default BookingSummary;