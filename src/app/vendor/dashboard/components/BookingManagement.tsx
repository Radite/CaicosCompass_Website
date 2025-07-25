"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck, faSearch, faFilter, faEye, faEdit,
  faCheck, faTimes, faClock, faUser, faPhone, faEnvelope,
  faMapMarkerAlt, faDollarSign, faDownload, faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import styles from '../dashboard.module.css';

interface Booking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service: {
    _id: string;
    name: string;
    category: string;
  };
  serviceName: string;
  category: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  date: string;
  time?: string;
  guests: number;
  paymentDetails: {
    totalAmount: number;
    amountPaid: number;
    paymentStatus: string;
    paymentMethod: string;
  };
  specialRequests?: string;
  vendorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingFilters {
  status: string;
  startDate: string;
  endDate: string;
  category: string;
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<BookingFilters>({
    status: 'all',
    startDate: '',
    endDate: '',
    category: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'stays', label: 'Stays' },
    { value: 'dining', label: 'Dining' },
    { value: 'activities', label: 'Activities' },
    { value: 'transportation', label: 'Transportation' }
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchBookings();
  }, [filters, pagination.currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '10',
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.category !== 'all' && { category: filters.category })
      });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/bookings?${queryParams}`,
        { headers: getAuthHeaders() }
      );

      setBookings(response.data.bookings);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string, notes?: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/bookings/${bookingId}/status`,
        { status: newStatus, notes },
        { headers: getAuthHeaders() }
      );

      // Update local state
      setBookings(prev => prev.map(booking =>
        booking._id === bookingId 
          ? { ...booking, status: newStatus as any, vendorNotes: notes }
          : booking
      ));

      alert(`Booking ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error updating booking status. Please try again.');
    }
  };

  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'completed': return '#0D4C92';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return faClock;
      case 'confirmed': return faCheck;
      case 'completed': return faCalendarCheck;
      case 'cancelled': return faTimes;
      default: return faClock;
    }
  };

  const exportBookings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/bookings/export`,
        { 
          headers: getAuthHeaders(),
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting bookings:', error);
      alert('Error exporting bookings. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className={styles.bookingManagement}>
      {/* Header */}
      <div className={styles.bookingHeader}>
        <div className={styles.headerInfo}>
          <h2>Booking Management</h2>
          <p>Manage your customer bookings and reservations</p>
        </div>

        <div className={styles.headerActions}>
          <button onClick={exportBookings} className={styles.exportBtn}>
            <FontAwesomeIcon icon={faDownload} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by customer name or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={styles.filterSelect}
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className={styles.dateInput}
            placeholder="From date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className={styles.dateInput}
            placeholder="To date"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className={styles.bookingsTable}>
        <div className={styles.tableHeader}>
          <div className={styles.tableCell}>Booking ID</div>
          <div className={styles.tableCell}>Customer</div>
          <div className={styles.tableCell}>Service</div>
          <div className={styles.tableCell}>Date & Time</div>
          <div className={styles.tableCell}>Guests</div>
          <div className={styles.tableCell}>Amount</div>
          <div className={styles.tableCell}>Status</div>
          <div className={styles.tableCell}>Actions</div>
        </div>

        <div className={styles.tableBody}>
          {bookings.map((booking) => (
            <div key={booking._id} className={styles.tableRow}>
              <div className={styles.tableCell}>
                <div className={styles.bookingId}>
                  #{booking._id.slice(-8).toUpperCase()}
                </div>
              </div>

              <div className={styles.tableCell}>
                <div className={styles.customerInfo}>
                  <div className={styles.customerName}>
                    <FontAwesomeIcon icon={faUser} />
                    <span>{booking.user.name}</span>
                  </div>
                  <div className={styles.customerContact}>
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>{booking.user.email}</span>
                  </div>
                  {booking.user.phone && (
                    <div className={styles.customerContact}>
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{booking.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.tableCell}>
                <div className={styles.serviceInfo}>
                  <h4>{booking.serviceName}</h4>
                  <span className={styles.categoryTag}>{booking.category}</span>
                </div>
              </div>

              <div className={styles.tableCell}>
                <div className={styles.dateTimeInfo}>
                  <div className={styles.date}>
                    <FontAwesomeIcon icon={faCalendarCheck} />
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  {booking.time && (
                    <div className={styles.time}>
                      <FontAwesomeIcon icon={faClock} />
                      <span>{formatTime(booking.time)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.tableCell}>
                <div className={styles.guestCount}>
                  <FontAwesomeIcon icon={faUser} />
                  <span>{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className={styles.tableCell}>
                <div className={styles.amountInfo}>
                  <div className={styles.totalAmount}>
                    <FontAwesomeIcon icon={faDollarSign} />
                    <span>${booking.paymentDetails.totalAmount}</span>
                  </div>
                  <div className={styles.paymentStatus}>
                    {booking.paymentDetails.paymentStatus}
                  </div>
                </div>
              </div>

              <div className={styles.tableCell}>
                <div 
                  className={styles.statusBadge} 
                  style={{ 
                    backgroundColor: `${getStatusColor(booking.status)}20`,
                    color: getStatusColor(booking.status),
                    border: `1px solid ${getStatusColor(booking.status)}40`
                  }}
                >
                  <FontAwesomeIcon icon={getStatusIcon(booking.status)} />
                  <span>{booking.status}</span>
                </div>
              </div>

              <div className={styles.tableCell}>
                <div className={styles.actions}>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowBookingModal(true);
                    }}
                    className={styles.actionBtn}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>

                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                        className={`${styles.actionBtn} ${styles.confirm}`}
                        title="Confirm Booking"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                        className={`${styles.actionBtn} ${styles.danger}`}
                        title="Cancel Booking"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(booking._id, 'completed')}
                      className={`${styles.actionBtn} ${styles.complete}`}
                      title="Mark as Completed"
                    >
                      <FontAwesomeIcon icon={faCalendarCheck} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={!pagination.hasPrevPage}
            className={styles.paginationBtn}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            Previous
          </button>

          <div className={styles.pageInfo}>
            Page {pagination.currentPage} of {pagination.totalPages}
            <span className={styles.totalCount}>
              ({pagination.totalBookings} total bookings)
            </span>
          </div>

          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={!pagination.hasNextPage}
            className={styles.paginationBtn}
          >
            Next
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}

      {/* Empty State */}
      {bookings.length === 0 && (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faCalendarCheck} className={styles.emptyIcon} />
          <h3>No bookings found</h3>
          <p>You don't have any bookings matching the current filters.</p>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Booking Details</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedBooking(null);
                }}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.bookingDetails}>
                {/* Booking Information */}
                <div className={styles.detailSection}>
                  <h4>Booking Information</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Booking ID:</label>
                      <span>#{selectedBooking._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Service:</label>
                      <span>{selectedBooking.serviceName}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Category:</label>
                      <span className={styles.categoryTag}>{selectedBooking.category}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Date:</label>
                      <span>{formatDate(selectedBooking.date)}</span>
                    </div>
                    {selectedBooking.time && (
                      <div className={styles.detailItem}>
                        <label>Time:</label>
                        <span>{formatTime(selectedBooking.time)}</span>
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <label>Guests:</label>
                      <span>{selectedBooking.guests}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Status:</label>
                      <div 
                        className={styles.statusBadge}
                        style={{ 
                          backgroundColor: `${getStatusColor(selectedBooking.status)}20`,
                          color: getStatusColor(selectedBooking.status)
                        }}
                      >
                        <FontAwesomeIcon icon={getStatusIcon(selectedBooking.status)} />
                        <span>{selectedBooking.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className={styles.detailSection}>
                  <h4>Customer Information</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Name:</label>
                      <span>{selectedBooking.user.name}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Email:</label>
                      <span>{selectedBooking.user.email}</span>
                    </div>
                    {selectedBooking.user.phone && (
                      <div className={styles.detailItem}>
                        <label>Phone:</label>
                        <span>{selectedBooking.user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className={styles.detailSection}>
                  <h4>Payment Information</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Total Amount:</label>
                      <span className={styles.amount}>${selectedBooking.paymentDetails.totalAmount}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Amount Paid:</label>
                      <span className={styles.amount}>${selectedBooking.paymentDetails.amountPaid}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Payment Status:</label>
                      <span>{selectedBooking.paymentDetails.paymentStatus}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Payment Method:</label>
                      <span>{selectedBooking.paymentDetails.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div className={styles.detailSection}>
                    <h4>Special Requests</h4>
                    <p className={styles.requestText}>{selectedBooking.specialRequests}</p>
                  </div>
                )}

                {/* Vendor Notes */}
                <div className={styles.detailSection}>
                  <h4>Vendor Notes</h4>
                  <textarea
                    value={selectedBooking.vendorNotes || ''}
                    onChange={(e) => setSelectedBooking(prev => 
                      prev ? { ...prev, vendorNotes: e.target.value } : null
                    )}
                    placeholder="Add notes about this booking..."
                    className={styles.notesTextarea}
                    rows={3}
                  />
                </div>

                {/* Status Actions */}
                <div className={styles.statusActions}>
                  <h4>Update Status</h4>
                  <div className={styles.statusButtonsGrid}>
                    {selectedBooking.status !== 'confirmed' && (
                      <button
                        onClick={() => {
                          updateBookingStatus(selectedBooking._id, 'confirmed', selectedBooking.vendorNotes);
                          setShowBookingModal(false);
                        }}
                        className={`${styles.statusActionBtn} ${styles.confirm}`}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        Confirm Booking
                      </button>
                    )}

                    {selectedBooking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          updateBookingStatus(selectedBooking._id, 'completed', selectedBooking.vendorNotes);
                          setShowBookingModal(false);
                        }}
                        className={`${styles.statusActionBtn} ${styles.complete}`}
                      >
                        <FontAwesomeIcon icon={faCalendarCheck} />
                        Mark Completed
                      </button>
                    )}

                    {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                      <button
                        onClick={() => {
                          updateBookingStatus(selectedBooking._id, 'cancelled', selectedBooking.vendorNotes);
                          setShowBookingModal(false);
                        }}
                        className={`${styles.statusActionBtn} ${styles.danger}`}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}