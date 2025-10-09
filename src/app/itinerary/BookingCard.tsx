// src/app/itinerary/BookingCard.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faUsers, faMapMarkerAlt, faEye, faTrash, faPlaneDeparture, faBed, faUtensils, faSpa } from '@fortawesome/free-solid-svg-icons';
import styles from './itinerary.module.css';
import { Booking, BookingCardProps } from './types';

const categoryDetails = {
  activity: { icon: faUsers, title: 'Activity' },
  stay: { icon: faBed, title: 'Accommodation' },
  transportation: { icon: faPlaneDeparture, title: 'Transportation' },
  dining: { icon: faUtensils, title: 'Dining' },
  spa: { icon: faSpa, title: 'Spa & Wellness' },
};

const getStatusClass = (status: string) => {
  if (status === 'confirmed') return styles.confirmed;
  if (status === 'pending') return styles.pending;
  if (status === 'canceled') return styles.canceled;
  return '';
};

const formatDate = (date?: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const BookingCard: React.FC<BookingCardProps> = ({ booking, onViewDetails, onCancel, isUpcoming }) => {
  const details = categoryDetails[booking.category] || { icon: faCalendarAlt, title: 'Booking' };

  return (
    <div className={styles.bookingCard}>
      <div className={styles.bookingHeader}>
        <div className={styles.bookingCategory}>
          <FontAwesomeIcon icon={details.icon} className={styles.categoryIcon} />
          <span>{details.title}</span>
        </div>
        <div className={`${styles.bookingStatus} ${getStatusClass(booking.status)}`}>
          {booking.status}
        </div>
      </div>

      <div className={styles.bookingContent}>
        <h3 className={styles.bookingTitle}>{booking.serviceDetails.name}</h3>
        
        <div className={styles.bookingDetails}>
          <div className={styles.detailItem}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.detailIcon} />
            <span>
              {booking.category === 'stay'
                ? `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`
                : formatDate(booking.date)}
            </span>
          </div>
          {booking.time && (
            <div className={styles.detailItem}>
              <FontAwesomeIcon icon={faClock} className={styles.detailIcon} />
              <span>{booking.time}</span>
            </div>
          )}
          <div className={styles.detailItem}>
            <FontAwesomeIcon icon={faUsers} className={styles.detailIcon} />
            <span>{booking.numOfPeople} {booking.numOfPeople > 1 ? 'people' : 'person'}</span>
          </div>
          <div className={styles.detailItem}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.detailIcon} />
            <span>{booking.serviceDetails.location}</span>
          </div>
        </div>

        {booking.requirements?.specialNotes && (
          <div className={styles.specialNotes}>
            <strong>Special Notes:</strong> {booking.requirements.specialNotes}
          </div>
        )}

        <div className={styles.bookingFooter}>
          <div className={styles.priceInfo}>
            <span className={styles.price}>${booking.paymentDetails.totalAmount.toFixed(2)}</span>
            {booking.paymentDetails.remainingBalance > 0 && (
              <span className={styles.remaining}>
                (${booking.paymentDetails.remainingBalance.toFixed(2)} remaining)
              </span>
            )}
          </div>

          <div className={styles.bookingActions}>
            <button className={styles.actionBtn} onClick={() => onViewDetails(booking)} title="View Details">
              <FontAwesomeIcon icon={faEye} />
            </button>
            {booking.status !== 'canceled' && isUpcoming(booking) && (
              <button
                className={`${styles.actionBtn} ${styles.cancelBtn}`}
                onClick={() => onCancel(booking._id)}
                title="Cancel Booking"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;