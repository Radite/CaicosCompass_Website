// src/app/itinerary/page.tsx - Complete Itinerary with PDF Generation
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faUsers, 
  faClock, 
  faDownload,
  faEye,
  faTrash 
} from "@fortawesome/free-solid-svg-icons";
import styles from "./itinerary.module.css";
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed

interface Booking {
  _id: string;
  category: 'activity' | 'stay' | 'transportation' | 'dining';
  serviceName: string;
  date?: string;
  time?: string;
  startDate?: string;
  endDate?: string;
  numOfPeople: number;
  status: 'confirmed' | 'pending' | 'canceled';
  pickupLocation?: string;
  dropoffLocation?: string;
  paymentDetails: {
    totalAmount: number;
    amountPaid: number;
    remainingBalance: number;
  };
  requirements?: {
    specialNotes?: string;
  };
  createdAt: string;
}

export default function ItineraryPage() {
  const { 
    user, 
    token, 
    isAuthenticated, 
    loading: authLoading 
  } = useAuth(); // --- FIX #2: Get user, token, and loading state from context ---

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'status'>('date');
useEffect(() => {
  console.log("Auth Context State:", {
    authLoading,
    isAuthenticated,
    user,
    token
  });

  // WAIT for auth to finish loading before making decisions
  if (authLoading) {
    console.log("Still loading auth, waiting...");
    return; // Don't do anything while auth is loading
  }

  // Now that auth has finished loading, check authentication
  if (isAuthenticated && user?._id) {
    console.log("User is authenticated, fetching bookings...");
    // Try to get token from auth context first, fallback to localStorage
    const authToken = token || localStorage.getItem("authToken");
    if (authToken) {
      fetchBookings(authToken);
    } else {
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
    }
  } else {
    console.log("User is not authenticated");
    setError("You must be logged in to view your itinerary.");
    setLoading(false);
  }
}, [authLoading, isAuthenticated, user, token]); // Include all dependencies
  // --- FIX #4: Update fetchBookings to accept the token ---
const fetchBookings = async (authToken: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/bookings/user`,
        { headers: { Authorization: `Bearer ${authToken}` }}
      );
      
      // --- THIS IS THE FIX ---
      // Access the array inside the 'data' property of the response.
      // Use '|| []' as a fallback to ensure it's always an array.
      setBookings(response.data.data || []);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load bookings.");
      setBookings([]); // Also set to an empty array on error
    } finally {
      setLoading(false);
    }
  };
  const isUpcoming = (booking: Booking): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (booking.category === 'activity' || booking.category === 'dining' || booking.category === 'transportation') {
      return booking.date ? new Date(booking.date) >= today : false;
    }
    if (booking.category === 'stay') {
      return booking.startDate ? new Date(booking.startDate) >= today : false;
    }
    return false;
  };

  const isPast = (booking: Booking): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (booking.category === 'activity' || booking.category === 'dining' || booking.category === 'transportation') {
      return booking.date ? new Date(booking.date) < today : false;
    }
    if (booking.category === 'stay') {
      return booking.endDate ? new Date(booking.endDate) < today : false;
    }
    return false;
  };

  const getFilteredBookings = () => {
    let filtered = [...bookings];

    // Apply filter
    if (filter === 'upcoming') {
      filtered = filtered.filter(isUpcoming);
    } else if (filter === 'past') {
      filtered = filtered.filter(isPast);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date || a.startDate || a.createdAt);
        const dateB = new Date(b.date || b.startDate || b.createdAt);
        return dateA.getTime() - dateB.getTime();
      } else if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    return filtered;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const formatFullDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
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
      case 'dining': return faUsers;
      default: return faCalendarAlt;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch(category) {
      case 'activity': return 'Activity';
      case 'stay': return 'Accommodation';
      case 'transportation': return 'Transportation';
      case 'dining': return 'Dining';
      default: return 'Booking';
    }
  };

  const generateDetailedPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header
    doc.setFillColor(30, 77, 114);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('TurksExplorer', 20, 25);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Complete Travel Itinerary', 20, 35);
    
    // Date generated
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 60, 50);
    
    let yPosition = 70;
    const filteredBookings = getFilteredBookings();
    
    if (filteredBookings.length === 0) {
      doc.setFontSize(14);
      doc.text('No bookings found for the selected filter.', 20, yPosition);
      doc.save('turksexplorer-itinerary.pdf');
      return;
    }

    // Summary section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 77, 114);
    doc.text('Trip Summary', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const totalBookings = filteredBookings.length;
    const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed').length;
    const totalAmount = filteredBookings.reduce((sum, b) => sum + b.paymentDetails.totalAmount, 0);
    
    doc.text(`Total Bookings: ${totalBookings}`, 20, yPosition);
    doc.text(`Confirmed: ${confirmedBookings}`, 120, yPosition);
    yPosition += 12;
    doc.text(`Total Value: $${totalAmount.toFixed(2)}`, 20, yPosition);
    yPosition += 20;

    // Group bookings by date
    const bookingsByDate = filteredBookings.reduce((acc, booking) => {
      const date = booking.date || booking.startDate || booking.createdAt;
      const dateKey = formatFullDate(date);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(booking);
      return acc;
    }, {} as Record<string, Booking[]>);

    // Detailed itinerary
    Object.entries(bookingsByDate).forEach(([date, dayBookings]) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 30;
      }

      // Date header
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition - 5, pageWidth - 30, 20, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 77, 114);
      doc.text(date, 20, yPosition + 8);
      yPosition += 25;

      dayBookings.forEach((booking, index) => {
        // Check if we need a new page for this booking
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 30;
        }

        // Booking card background
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPosition - 5, pageWidth - 40, 45, 'F');
        
        // Booking details
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(booking.serviceName, 25, yPosition + 5);
        
        // Category and status
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`${getCategoryTitle(booking.category)} • ${booking.status.toUpperCase()}`, 25, yPosition + 15);
        
        // Time/Details
        let detailsText = '';
        if (booking.time) detailsText += `Time: ${booking.time} • `;
        if (booking.numOfPeople) detailsText += `People: ${booking.numOfPeople} • `;
        if (booking.pickupLocation) detailsText += `Pickup: ${booking.pickupLocation} • `;
        if (booking.dropoffLocation) detailsText += `Drop-off: ${booking.dropoffLocation}`;
        
        if (detailsText) {
          doc.text(detailsText.replace(/ • $/, ''), 25, yPosition + 25);
        }
        
        // Price
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 77, 114);
        doc.text(`$${booking.paymentDetails.totalAmount.toFixed(2)}`, pageWidth - 60, yPosition + 5);
        
        // Special notes
        if (booking.requirements?.specialNotes) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(150, 150, 150);
          const noteText = `Note: ${booking.requirements.specialNotes}`;
          const splitNote = doc.splitTextToSize(noteText, pageWidth - 80);
          doc.text(splitNote, 25, yPosition + 35);
        }
        
        yPosition += 55;
      });
      
      yPosition += 10; // Space between days
    });

    // Footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
      doc.text('TurksExplorer - Your Gateway to Paradise', 20, pageHeight - 10);
    }

    doc.save('turksexplorer-complete-itinerary.pdf');
  };

  const generateSingleBookingPDF = (booking: Booking) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(30, 77, 114);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Confirmation', 20, 25);
    
    doc.setFontSize(12);
    doc.text(`${getCategoryTitle(booking.category)} Reservation`, 20, 35);
    
    // Booking details
    let yPos = 60;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Booking ID: ${booking._id}`, 20, yPos);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 80, yPos);
    yPos += 15;
    
    // Status badge
    const statusColors = {
      confirmed: [40, 167, 69],
      pending: [255, 193, 7],
      canceled: [220, 53, 69]
    };
    
    const statusColor = statusColors[booking.status] || [108, 117, 125];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.rect(20, yPos, 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(booking.status.toUpperCase(), 22, yPos + 5);
    yPos += 20;
    
    // Service details
    doc.setTextColor(30, 77, 114);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.serviceName, 20, yPos);
    yPos += 15;
    
    // Booking information table
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Information', 20, yPos);
    yPos += 10;

    const tableData = [];
    
    if (booking.category === 'stay') {
      tableData.push(['Check-in Date', formatFullDate(booking.startDate)]);
      tableData.push(['Check-out Date', formatFullDate(booking.endDate)]);
    } else {
      tableData.push(['Date', formatFullDate(booking.date)]);
      if (booking.time) {
        tableData.push(['Time', booking.time]);
      }
    }
    
    tableData.push(['Number of People', booking.numOfPeople.toString()]);
    
    if (booking.pickupLocation) {
      tableData.push(['Pickup Location', booking.pickupLocation]);
    }
    if (booking.dropoffLocation) {
      tableData.push(['Drop-off Location', booking.dropoffLocation]);
    }
    
    if (booking.requirements?.specialNotes) {
      tableData.push(['Special Notes', booking.requirements.specialNotes]);
    }

    // Draw table manually
    doc.setFontSize(10);
    tableData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label + ':', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPos);
      yPos += 8;
    });

    yPos += 10;

    // Payment Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 77, 114);
    doc.text('Payment Information', 20, yPos);
    yPos += 15;

    // Payment table
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos - 5, pageWidth - 40, 30, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    doc.text('Total Amount:', 25, yPos + 5);
    doc.text(`${booking.paymentDetails.totalAmount.toFixed(2)}`, pageWidth - 60, yPos + 5);
    
    doc.text('Amount Paid:', 25, yPos + 12);
    doc.text(`${booking.paymentDetails.amountPaid.toFixed(2)}`, pageWidth - 60, yPos + 12);
    
    if (booking.paymentDetails.remainingBalance > 0) {
      doc.text('Remaining Balance:', 25, yPos + 19);
      doc.text(`${booking.paymentDetails.remainingBalance.toFixed(2)}`, pageWidth - 60, yPos + 19);
    }

    yPos += 40;

    // Important Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 77, 114);
    doc.text('Important Information', 20, yPos);
    yPos += 15;

    const importantInfo = [
      '• Please arrive 15 minutes before your scheduled time',
      '• Bring a valid ID and this confirmation',
      '• Contact us if you need to make any changes',
      '• Cancellation policy applies as per terms and conditions'
    ];

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    importantInfo.forEach(info => {
      doc.text(info, 20, yPos);
      yPos += 8;
    });

    yPos += 15;

    // Contact Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 77, 114);
    doc.text('Contact Information', 20, yPos);
    yPos += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Email: support@turksexplorer.com', 20, yPos);
    yPos += 8;
    doc.text('Phone: +1 (649) 123-4567', 20, yPos);
    yPos += 8;
    doc.text('Website: www.turksexplorer.com', 20, yPos);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('TurksExplorer - Your Gateway to Paradise', 20, 280);
    doc.text(`Booking ID: ${booking._id}`, pageWidth - 80, 280);

    doc.save(`turksexplorer-booking-${booking._id.slice(-8)}.pdf`);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    const token = localStorage.getItem("authToken");
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Refresh bookings
      fetchBookings();
      alert('Booking cancelled successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

 if (authLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <h2>{authLoading ? "Authenticating your session..." : "Loading your itinerary..."}</h2>
      </div>
    );
  }


  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div className={styles.itineraryContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className={styles.title}>My Travel Itinerary</h1>
              <p className={styles.subtitle}>
                Manage your bookings and download your complete travel plan
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <button 
                className={styles.downloadBtn}
                onClick={generateDetailedPDF}
                disabled={filteredBookings.length === 0}
              >
                <FontAwesomeIcon icon={faDownload} className={styles.downloadIcon} />
                Download Complete Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Filters and Controls */}
        <div className={styles.controls}>
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Show:</label>
                <select 
                  className={styles.filterSelect}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                >
                  <option value="all">All Bookings</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Sort by:</label>
                <select 
                  className={styles.filterSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="date">Date</option>
                  <option value="category">Category</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Summary */}
        {bookings.length > 0 && (
          <div className={styles.summary}>
            <div className="row">
              <div className="col-md-3">
                <div className={styles.summaryCard}>
                  <div className={styles.summaryNumber}>{bookings.length}</div>
                  <div className={styles.summaryLabel}>Total Bookings</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className={styles.summaryCard}>
                  <div className={styles.summaryNumber}>
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </div>
                  <div className={styles.summaryLabel}>Confirmed</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className={styles.summaryCard}>
                  <div className={styles.summaryNumber}>
                    {bookings.filter(isUpcoming).length}
                  </div>
                  <div className={styles.summaryLabel}>Upcoming</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className={styles.summaryCard}>
                  <div className={styles.summaryNumber}>
                    ${bookings.reduce((sum, b) => sum + b.paymentDetails.totalAmount, 0).toFixed(0)}
                  </div>
                  <div className={styles.summaryLabel}>Total Value</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className={styles.bookingsList}>
          {filteredBookings.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📅</div>
              <h3>No bookings found</h3>
              <p>
                {filter === 'all' 
                  ? "You haven't made any bookings yet. Start exploring!"
                  : `No ${filter} bookings found. Try changing your filter.`
                }
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking._id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.bookingCategory}>
                    <FontAwesomeIcon 
                      icon={getCategoryIcon(booking.category)} 
                      className={styles.categoryIcon}
                    />
                    <span>{getCategoryTitle(booking.category)}</span>
                  </div>
                  <div className={`${styles.bookingStatus} ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </div>
                </div>

                <div className={styles.bookingContent}>
                  <h3 className={styles.bookingTitle}>{booking.serviceName}</h3>
                  
                  <div className={styles.bookingDetails}>
                    <div className={styles.detailItem}>
                      <FontAwesomeIcon icon={faCalendarAlt} className={styles.detailIcon} />
                      <span>
                        {booking.category === 'stay' 
                          ? `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`
                          : formatDate(booking.date)
                        }
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
                      <span>{booking.numOfPeople} {booking.numOfPeople === 1 ? 'person' : 'people'}</span>
                    </div>

                    {booking.pickupLocation && (
                      <div className={styles.detailItem}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.detailIcon} />
                        <span>Pickup: {booking.pickupLocation}</span>
                      </div>
                    )}
                  </div>

                  {booking.requirements?.specialNotes && (
                    <div className={styles.specialNotes}>
                      <strong>Special Notes:</strong> {booking.requirements.specialNotes}
                    </div>
                  )}

                  <div className={styles.bookingFooter}>
                    <div className={styles.priceInfo}>
                      <span className={styles.price}>
                        ${booking.paymentDetails.totalAmount.toFixed(2)}
                      </span>
                      {booking.paymentDetails.remainingBalance > 0 && (
                        <span className={styles.remaining}>
                          (${booking.paymentDetails.remainingBalance.toFixed(2)} remaining)
                        </span>
                      )}
                    </div>

                    <div className={styles.bookingActions}>
                      <button 
                        className={styles.actionBtn}
                        onClick={() => generateSingleBookingPDF(booking)}
                        title="Download PDF"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                      
                      {booking.status === 'confirmed' && isUpcoming(booking) && (
                        <button 
                          className={`${styles.actionBtn} ${styles.cancelBtn}`}
                          onClick={() => handleCancelBooking(booking._id)}
                          title="Cancel Booking"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}