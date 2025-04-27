"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './itinerary.module.css';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarAlt, faMapMarkerAlt, faUsers, faClock, 
  faMoneyBillWave, faCheckCircle, faTimesCircle, faDownload
} from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Simplified interfaces
interface BookingPayee {
  user: string;
  amount: number;
  status: 'pending' | 'paid';
  paymentMethod: string;
}

interface Booking {
  _id: string;
  user: string;
  status: 'pending' | 'confirmed' | 'canceled';
  category: 'activity' | 'stay' | 'transportation';
  numOfPeople: number;
  date?: Date;
  time?: string;
  startDate?: Date;
  endDate?: Date;
  pickupLocation?: string;
  dropoffLocation?: string;
  paymentDetails: {
    totalAmount: number;
    amountPaid: number;
    remainingBalance: number;
    payees: BookingPayee[];
  };
  cancellation?: {
    isCanceled: boolean;
    cancellationDate?: Date;
    refundAmount?: number;
    refundStatus?: 'pending' | 'processed';
  };
  requirements?: {
    specialNotes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setBookings(res.data.data))
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setError("Failed to fetch bookings. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("User not authenticated.");
      return;
    }

    try {
      await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}/cancel`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { 
              ...booking, 
              status: 'canceled',
              cancellation: { 
                ...booking.cancellation,
                isCanceled: true, 
                cancellationDate: new Date() 
              }
            } 
          : booking
      ));
      
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(prev => prev ? {
          ...prev,
          status: 'canceled',
          cancellation: {
            ...prev.cancellation,
            isCanceled: true,
            cancellationDate: new Date()
          }
        } : null);
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      setError("Failed to cancel booking. Please try again later.");
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const today = new Date();
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upcoming') {
      if (booking.category === 'activity' || booking.category === 'transportation') {
        return booking.date ? new Date(booking.date) >= today : false;
      }
      if (booking.category === 'stay') {
        return booking.startDate ? new Date(booking.startDate) >= today : false;
      }
    }
    if (activeFilter === 'past') {
      if (booking.category === 'activity' || booking.category === 'transportation') {
        return booking.date ? new Date(booking.date) < today : false;
      }
      if (booking.category === 'stay') {
        return booking.endDate ? new Date(booking.endDate) < today : false;
      }
    }
    if (activeFilter === 'canceled') {
      return booking.status === 'canceled' || (booking.cancellation && booking.cancellation.isCanceled);
    }
    return true;
  });

  // Helper function to check if a booking is in the past
  const isBookingInPast = (booking: Booking): boolean => {
    const today = new Date();
    if (booking.category === 'activity' || booking.category === 'transportation') {
      return booking.date ? new Date(booking.date) < today : false;
    }
    if (booking.category === 'stay') {
      return booking.endDate ? new Date(booking.endDate) < today : false;
    }
    return false;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'confirmed': return styles.confirmed;
      case 'pending': return styles.pending;
      case 'canceled': return styles.canceled;
      default: return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'activity': return faUsers;
      case 'stay': return faMapMarkerAlt;
      case 'transportation': return faClock;
      default: return faCalendarAlt;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch(category) {
      case 'activity': return 'Activity';
      case 'stay': return 'Accommodation';
      case 'transportation': return 'Transportation';
      default: return 'Booking';
    }
  };

  // New function to handle PDF download
  const handleDownload = (booking: Booking) => {
    try {
      // Create new jsPDF instance
      const doc = new jsPDF();
      
      // Add a title to the PDF
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 128); // Dark blue
      doc.text(`Booking Confirmation - ${getCategoryTitle(booking.category)}`, 20, 20);
      
      // Add status indicator
      doc.setFontSize(12);
      const statusColor = booking.status === 'confirmed' ? [0, 128, 0] : 
                          booking.status === 'pending' ? [255, 140, 0] : [255, 0, 0];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(`Status: ${booking.status.toUpperCase()}`, 20, 30);
      
      // Reset text color for regular content
      doc.setTextColor(0, 0, 0);
      
      // Add booking reference number
      doc.setFontSize(10);
      doc.text(`Booking Reference: ${booking._id}`, 20, 40);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);
      
      // Add horizontal line
      doc.setLineWidth(0.5);
      doc.line(20, 50, 190, 50);
      
      // Add booking details
      doc.setFontSize(14);
      doc.text("Booking Details", 20, 60);
      
      doc.setFontSize(12);
      let yPos = 70;
      
      // Category-specific details
      if (booking.category === 'stay') {
        doc.text(`Check-in: ${formatDate(booking.startDate)}`, 20, yPos);
        yPos += 7;
        doc.text(`Check-out: ${formatDate(booking.endDate)}`, 20, yPos);
      } else {
        doc.text(`Date: ${formatDate(booking.date)}`, 20, yPos);
        if (booking.time) {
          yPos += 7;
          doc.text(`Time: ${booking.time}`, 20, yPos);
        }
      }
      
      yPos += 7;
      doc.text(`Number of People: ${booking.numOfPeople}`, 20, yPos);
      
      if (booking.category === 'transportation') {
        yPos += 7;
        doc.text(`Pickup: ${booking.pickupLocation}`, 20, yPos);
        yPos += 7;
        doc.text(`Dropoff: ${booking.dropoffLocation}`, 20, yPos);
      }
      
      if (booking.requirements?.specialNotes) {
        yPos += 7;
        doc.text(`Special Notes: ${booking.requirements.specialNotes}`, 20, yPos);
      }
      
      // Add payment details table
      yPos += 15;
      doc.setFontSize(14);
      doc.text("Payment Information", 20, yPos);
      yPos += 10;
      
      // Create payment table manually if autoTable isn't available
      const tableData = [
        ['Total Amount', `$${booking.paymentDetails.totalAmount.toFixed(2)}`],
        ['Amount Paid', `$${booking.paymentDetails.amountPaid.toFixed(2)}`],
        ['Remaining Balance', `$${booking.paymentDetails.remainingBalance.toFixed(2)}`]
      ];
      
      // Draw table manually
      doc.setFontSize(12);
      doc.setDrawColor(0);
      doc.setFillColor(240, 240, 240);
      
      // Table header
      doc.setFillColor(0, 0, 128);
      doc.setTextColor(255, 255, 255);
      doc.rect(20, yPos, 80, 10, 'F');
      doc.rect(100, yPos, 70, 10, 'F');
      doc.text('Description', 25, yPos + 7);
      doc.text('Amount', 105, yPos + 7);
      yPos += 10;
      
      // Table body
      doc.setTextColor(0, 0, 0);
      tableData.forEach((row, index) => {
        // Alternate row coloring
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(20, yPos, 80, 10, 'F');
          doc.rect(100, yPos, 70, 10, 'F');
        } else {
          doc.setFillColor(255, 255, 255);
          doc.rect(20, yPos, 80, 10, 'F');
          doc.rect(100, yPos, 70, 10, 'F');
        }
        
        // Table borders
        doc.setDrawColor(200, 200, 200);
        doc.rect(20, yPos, 80, 10, 'S');
        doc.rect(100, yPos, 70, 10, 'S');
        
        // Table content
        doc.text(row[0], 25, yPos + 7);
        doc.text(row[1], 105, yPos + 7);
        yPos += 10;
      });
      
      // Add cancellation information if applicable
      if (booking.status === 'canceled' || (booking.cancellation && booking.cancellation.isCanceled)) {
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(255, 0, 0);
        doc.text("Cancellation Information", 20, yPos);
        doc.setFontSize(12);
        yPos += 10;
        doc.text(`Canceled on: ${formatDate(booking.cancellation?.cancellationDate)}`, 20, yPos);
        
        if (booking.cancellation?.refundAmount) {
          yPos += 7;
          doc.text(`Refund amount: $${booking.cancellation.refundAmount.toFixed(2)}`, 20, yPos);
          yPos += 7;
          doc.text(`Refund status: ${booking.cancellation.refundStatus}`, 20, yPos);
        }
      }
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('Thank you for your booking! For any assistance, please contact our support team.', 20, 285);
      doc.text(`Page 1 of 1`, 100, 292, null, null, 'center');
      
      // Save the PDF
      doc.save(`booking-${booking._id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again later.');
    }
  };

  if (loading) return <div className={styles.loadingContainer}><div className={styles.spinner}></div><p>Loading your bookings...</p></div>;
  if (error) return <div className={styles.errorContainer}><div className={styles.errorIcon}>!</div><h3>Error</h3><p>{error}</p><button className={styles.retryButton} onClick={() => window.location.reload()}>Retry</button></div>;

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>My Bookings</h1>
        <p className={styles.subtitle}>Manage all your travel bookings in one place</p>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.filterTabs}>
          {['all', 'upcoming', 'past', 'canceled'].map(filter => (
            <button 
              key={filter}
              className={`${styles.filterTab} ${activeFilter === filter ? styles.activeTab : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)} {filter !== 'all' ? 'Bookings' : ''}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.resultsCount}>
        {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} found
      </div>

      {filteredBookings.length === 0 ? (
        <div className={styles.noBookings}>
          <div className={styles.noBookingsIcon}><FontAwesomeIcon icon={faCalendarAlt} /></div>
          <h3>No bookings found</h3>
          <p>You don't have any {activeFilter !== 'all' ? activeFilter : ''} bookings at the moment.</p>
        </div>
      ) : (
        <div className={styles.bookingsGrid}>
          {filteredBookings.map((booking) => (
            <div 
              key={booking._id} 
              className={`${styles.bookingCard} ${booking.status === 'canceled' || (booking.cancellation && booking.cancellation.isCanceled) ? styles.canceledCard : ''}`}
            >
              <div className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </div>
              
              <div className={styles.bookingHeader}>
                <div className={styles.categoryIcon}>
                  <FontAwesomeIcon icon={getCategoryIcon(booking.category)} />
                </div>
                <h3 className={styles.bookingCategory}>{getCategoryTitle(booking.category)}</h3>
              </div>
              
              <div className={styles.bookingContent}>
                <div className={styles.bookingDetailRow}>
                  <FontAwesomeIcon icon={faCalendarAlt} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    {booking.category === 'stay' ? (
                      <span>{formatDate(booking.startDate)} — {formatDate(booking.endDate)}</span>
                    ) : (
                      <span>{formatDate(booking.date)}{booking.time ? `, ${booking.time}` : ''}</span>
                    )}
                  </div>
                </div>
                
                {(booking.category === 'transportation') && (
                  <div className={styles.bookingDetailRow}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.detailIcon} />
                    <span>{booking.pickupLocation} → {booking.dropoffLocation}</span>
                  </div>
                )}
                
                <div className={styles.bookingDetailRow}>
                  <FontAwesomeIcon icon={faUsers} className={styles.detailIcon} />
                  <span>{booking.numOfPeople} people</span>
                </div>
                
                <div className={styles.bookingDetailRow}>
                  <FontAwesomeIcon icon={faMoneyBillWave} className={styles.detailIcon} />
                  <span>${booking.paymentDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className={styles.bookingActions}>
                <button className={styles.viewButton} onClick={() => setSelectedBooking(booking)}>
                  View Details
                </button>
                
                {booking.status !== 'canceled' && 
                  !(booking.cancellation && booking.cancellation.isCanceled) && 
                  !isBookingInPast(booking) && (
                  <button 
                    className={styles.cancelButton}
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal (simplified) */}
      {selectedBooking && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBooking(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedBooking(null)}>×</button>
            
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{getCategoryTitle(selectedBooking.category)} Details</h2>
              <div className={`${styles.modalStatus} ${getStatusClass(selectedBooking.status)}`}>
                {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
              </div>
            </div>
            
            <div className={styles.modalDetailsGrid}>
              <div className={styles.modalDetailSection}>
                <h3>Booking Information</h3>
                <p>ID: {selectedBooking._id}</p>
                <p>Date: {selectedBooking.category === 'stay' ? 
                  `${formatDate(selectedBooking.startDate)} — ${formatDate(selectedBooking.endDate)}` : 
                  `${formatDate(selectedBooking.date)} ${selectedBooking.time || ''}`}</p>
                <p>People: {selectedBooking.numOfPeople}</p>
                {selectedBooking.category === 'transportation' && (
                  <p>Route: {selectedBooking.pickupLocation} → {selectedBooking.dropoffLocation}</p>
                )}
                {selectedBooking.requirements?.specialNotes && (
                  <p>Notes: {selectedBooking.requirements.specialNotes}</p>
                )}
              </div>
              
              <div className={styles.modalDetailSection}>
                <h3>Payment</h3>
                <p>Total: ${selectedBooking.paymentDetails.totalAmount.toFixed(2)}</p>
                <p>Paid: ${selectedBooking.paymentDetails.amountPaid.toFixed(2)}</p>
                <p>Balance: ${selectedBooking.paymentDetails.remainingBalance.toFixed(2)}</p>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              {selectedBooking.status !== 'canceled' && 
                !(selectedBooking.cancellation && selectedBooking.cancellation.isCanceled) && 
                !isBookingInPast(selectedBooking) && (
                <button 
                  className={styles.modalCancelButton}
                  onClick={() => {
                    handleCancelBooking(selectedBooking._id);
                    setSelectedBooking(null);
                  }}
                >
                  <FontAwesomeIcon icon={faTimesCircle} /> Cancel Booking
                </button>
              )}
              
              <button 
                className={styles.downloadButton}
                onClick={() => handleDownload(selectedBooking)}
              >
                <FontAwesomeIcon icon={faDownload} /> Download PDF
              </button>
              
              <button className={styles.modalCloseButton} onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}