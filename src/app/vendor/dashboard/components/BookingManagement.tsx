"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck, faSearch, faFilter, faEye, faEdit,
  faCheck, faTimes, faClock, faUser, faPhone, faEnvelope,
  faMapMarkerAlt, faDollarSign, faDownload, faChevronLeft, faChevronRight,
  faExclamationTriangle, faCreditCard, faBarcode, faFileExport, faBell,
  faNoteSticky, faHistory, faUserCircle, faMapPin, faUsers, faTruck,
  faCouch, faUtensils, faPalette
} from '@fortawesome/free-solid-svg-icons';
import styles from '../dashboard.module.css';

interface CustomerInfo {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface ServiceInfo {
  _id: string;
  name?: string;
}

interface PaymentDetails {
  method: string;
  status: string;
  transactionId?: string;
  paidAt?: string;
  refundAmount?: number;
  installments?: any[];
}

interface PricingDetails {
  basePrice: number;
  subtotal: number;
  totalAmount: number;
  distanceCharge?: number;
  timeCharge?: number;
  surcharges?: Array<{ name: string; amount: number }>;
  discounts?: Array<{ name: string; amount: number }>;
  taxes?: Array<{ name: string; amount: number }>;
  tips?: number;
}

interface PassengerInfo {
  adults: number;
  children: number;
  infants: number;
  total: number;
  specialNeeds?: string[];
}

interface TransportationDetails {
  rentalDetails?: {
    additionalServices?: any[];
    vehicleType?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
  };
  tracking?: {
    enabled: boolean;
    route?: any[];
  };
  tripType?: string;
  additionalStops?: any[];
}

interface Booking {
  _id: string;
  bookingId: string;
  customer: CustomerInfo | string;
  service: ServiceInfo | string;
  vendor: string;
  serviceType: 'Stay' | 'Dining' | 'Activity' | 'Transportation';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  scheduledDateTime: string;
  bookingDate: string;
  pricing: PricingDetails;
  payment: PaymentDetails;
  passengers?: PassengerInfo;
  transportationDetails?: TransportationDetails;
  notifications?: {
    smsEnabled: boolean;
    emailEnabled: boolean;
    pushEnabled: boolean;
    confirmationSent: boolean;
    reminderSent: boolean;
    completionSent: boolean;
  };
  vendorNotes?: Array<{ text: string; timestamp: string }> | string[];
  statusHistory?: Array<{ status: string; timestamp: string }>;
  cancellation?: {
    cancellationFee: number;
    refundAmount: number;
  };
  emergency?: {
    safetyIncidents: any[];
  };
  customFields?: any[];
}

interface BookingFilters {
  status: string;
  startDate: string;
  endDate: string;
  serviceType: string;
  paymentStatus: string;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalBookings: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<BookingFilters>({
    status: 'all',
    startDate: '',
    endDate: '',
    serviceType: 'all',
    paymentStatus: 'all'
  });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [notesInput, setNotesInput] = useState('');
  const [exporting, setExporting] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const serviceTypeOptions = [
    { value: 'all', label: 'All Services' },
    { value: 'Stay', label: 'Stays' },
    { value: 'Dining', label: 'Dining' },
    { value: 'Activity', label: 'Activities' },
    { value: 'Transportation', label: 'Transportation' }
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'All Payment Status' },
    { value: 'completed', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
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
        ...(filters.serviceType !== 'all' && { serviceType: filters.serviceType }),
        ...(filters.paymentStatus !== 'all' && { paymentStatus: filters.paymentStatus }),
        ...(searchTerm && { search: searchTerm })
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

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );

      setBookings(prev => prev.map(booking =>
        booking._id === bookingId 
          ? { ...booking, status: newStatus as any }
          : booking
      ));

      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error updating booking status. Please try again.');
    }
  };

  const addVendorNote = async (bookingId: string) => {
    if (!notesInput.trim()) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/bookings/${bookingId}/notes`,
        { note: notesInput },
        { headers: getAuthHeaders() }
      );

      setNotesInput('');
      if (selectedBooking?._id === bookingId) {
        await fetchBookings();
        if (selectedBooking) {
          const updated = bookings.find(b => b._id === bookingId);
          if (updated) setSelectedBooking(updated);
        }
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Error adding note. Please try again.');
    }
  };

  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'failed': return '#dc3545';
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

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'Stay': return faCouch;
      case 'Dining': return faUtensils;
      case 'Activity': return faPalette;
      case 'Transportation': return faTruck;
      default: return faMapPin;
    }
  };

  const getCustomerName = (customer: CustomerInfo | string | undefined): string => {
    if (!customer) return 'N/A';
    if (typeof customer === 'string') return customer;
    return customer.name || 'N/A';
  };

  const getCustomerEmail = (customer: CustomerInfo | string | undefined): string => {
    if (!customer) return 'N/A';
    if (typeof customer === 'string') return 'N/A';
    return customer.email || 'N/A';
  };

  const getCustomerPhone = (customer: CustomerInfo | string | undefined): string => {
    if (!customer) return 'N/A';
    if (typeof customer === 'string') return 'N/A';
    return customer.phone || 'N/A';
  };

  const exportBookings = async () => {
    try {
      setExporting(true);
      const queryParams = new URLSearchParams({
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.serviceType !== 'all' && { serviceType: filters.serviceType }),
        ...(filters.paymentStatus !== 'all' && { paymentStatus: filters.paymentStatus })
      });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/bookings/export?${queryParams}`,
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
      setExporting(false);
    } catch (error) {
      console.error('Error exporting bookings:', error);
      alert('Error exporting bookings. Please try again.');
      setExporting(false);
    }
  };

  if (loading && bookings.length === 0) {
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
          <p>Manage all customer bookings and reservations</p>
        </div>

        <div className={styles.headerActions}>
          <button 
            onClick={exportBookings} 
            className={styles.exportBtn}
            disabled={exporting}
          >
            <FontAwesomeIcon icon={faDownload} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#0D4C92' }}>
            <FontAwesomeIcon icon={faCalendarCheck} />
          </div>
          <div className={styles.statContent}>
            <h4>Total Bookings</h4>
            <p className={styles.statNumber}>{pagination.totalBookings}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#28a745' }}>
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <div className={styles.statContent}>
            <h4>Confirmed</h4>
            <p className={styles.statNumber}>
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#ffc107' }}>
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className={styles.statContent}>
            <h4>Pending</h4>
            <p className={styles.statNumber}>
              {bookings.filter(b => b.status === 'pending').length}
            </p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#28a745' }}>
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div className={styles.statContent}>
            <h4>Revenue (Paid)</h4>
            <p className={styles.statNumber}>
              ${bookings
                .filter(b => b.payment.status === 'completed')
                .reduce((sum, b) => sum + b.pricing.totalAmount, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by booking ID, customer name, or email..."
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
            value={filters.serviceType}
            onChange={(e) => handleFilterChange('serviceType', e.target.value)}
            className={styles.filterSelect}
          >
            {serviceTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className={styles.filterSelect}
          >
            {paymentStatusOptions.map(option => (
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
          <div className={styles.tableCell}>Amount</div>
          <div className={styles.tableCell}>Payment</div>
          <div className={styles.tableCell}>Status</div>
          <div className={styles.tableCell}>Actions</div>
        </div>

        <div className={styles.tableBody}>
          {bookings.map((booking) => (
            <div key={booking._id} className={styles.tableRow}>
              <div className={styles.tableCell}>
                <div className={styles.bookingId}>
                  <FontAwesomeIcon icon={faBarcode} />
                  <span>{booking.bookingId}</span>
                </div>
              </div>

              <div className={styles.tableCell}>
                <div className={styles.customerInfo}>
                  <div className={styles.customerName}>
                    <FontAwesomeIcon icon={faUser} />
                    <span>{getCustomerName(booking.customer)}</span>
                  </div>
                  <div className={styles.customerContact} title={getCustomerEmail(booking.customer)}>
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>{getCustomerEmail(booking.customer)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.tableCell}>
                <div className={styles.serviceInfo}>
                  <div className={styles.serviceType}>
                    <FontAwesomeIcon icon={getServiceIcon(booking.serviceType)} />
                    <span>{booking.serviceType}</span>
                  </div>
                </div>
              </div>

              <div className={styles.tableCell}>
                <div className={styles.dateTimeInfo}>
                  <FontAwesomeIcon icon={faCalendarCheck} />
                  <span>{formatDate(booking.scheduledDateTime)}</span>
                </div>
              </div>

              <div className={styles.tableCell}>
                <div className={styles.amountInfo}>
                  <FontAwesomeIcon icon={faDollarSign} />
                  <span>${booking.pricing.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className={styles.tableCell}>
                <div 
                  className={styles.paymentStatusBadge}
                  style={{ 
                    backgroundColor: `${getPaymentStatusColor(booking.payment.status)}20`,
                    color: getPaymentStatusColor(booking.payment.status),
                    border: `1px solid ${getPaymentStatusColor(booking.payment.status)}40`
                  }}
                >
                  <FontAwesomeIcon icon={faCreditCard} />
                  <span>{booking.payment.status}</span>
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
                      setNotesInput('');
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
      {bookings.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faCalendarCheck} className={styles.emptyIcon} />
          <h3>No bookings found</h3>
          <p>You don't have any bookings matching the current filters.</p>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className={styles.modal}>
          <div className={styles.modalContent} style={{ maxWidth: '900px' }}>
            <div className={styles.modalHeader}>
              <div>
                <h3>Booking Details</h3>
                <p className={styles.bookingModalId}>ID: {selectedBooking.bookingId}</p>
              </div>
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
                {/* Alerts */}
                {selectedBooking.emergency?.safetyIncidents && selectedBooking.emergency.safetyIncidents.length > 0 && (
                  <div className={styles.alertBox} style={{ borderColor: '#dc3545' }}>
                    <FontAwesomeIcon icon={faUserCircle} style={{ color: '#dc3545' }} />
                    <div>
                      <strong>Safety Alert</strong>
                      <p>This booking has safety incidents recorded</p>
                    </div>
                  </div>
                )}

                {selectedBooking.payment.status !== 'completed' && (
                  <div className={styles.alertBox} style={{ borderColor: '#ffc107' }}>
                    <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ffc107' }} />
                    <div>
                      <strong>Payment Pending</strong>
                      <p>Payment status: {selectedBooking.payment.status}</p>
                    </div>
                  </div>
                )}

                {/* Booking Information */}
                <div className={styles.detailSection}>
                  <h4>Booking Information</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Booking ID:</label>
                      <span>{selectedBooking.bookingId}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Service Type:</label>
                      <span>
                        <FontAwesomeIcon icon={getServiceIcon(selectedBooking.serviceType)} />
                        {selectedBooking.serviceType}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Status:</label>
                      <div 
                        className={styles.statusBadge}
                        style={{ 
                          backgroundColor: `${getStatusColor(selectedBooking.status)}20`,
                          color: getStatusColor(selectedBooking.status),
                          width: 'fit-content'
                        }}
                      >
                        <FontAwesomeIcon icon={getStatusIcon(selectedBooking.status)} />
                        <span>{selectedBooking.status}</span>
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Scheduled Date & Time:</label>
                      <span>{formatDateTime(selectedBooking.scheduledDateTime)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Booking Date:</label>
                      <span>{formatDateTime(selectedBooking.bookingDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className={styles.detailSection}>
                  <h4>Customer Information</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Name:</label>
                      <span>{getCustomerName(selectedBooking.customer)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Email:</label>
                      <span>{getCustomerEmail(selectedBooking.customer)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Phone:</label>
                      <span>{getCustomerPhone(selectedBooking.customer)}</span>
                    </div>
                  </div>
                </div>

                {/* Passenger Information */}
                {selectedBooking.passengers && (
                  <div className={styles.detailSection}>
                    <h4>Passenger Information</h4>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <label>Adults:</label>
                        <span>{selectedBooking.passengers.adults}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Children:</label>
                        <span>{selectedBooking.passengers.children}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Infants:</label>
                        <span>{selectedBooking.passengers.infants}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Total:</label>
                        <span><strong>{selectedBooking.passengers.total}</strong></span>
                      </div>
                      {selectedBooking.passengers.specialNeeds && selectedBooking.passengers.specialNeeds.length > 0 && (
                        <div className={styles.detailItem}>
                          <label>Special Needs:</label>
                          <span>{selectedBooking.passengers.specialNeeds.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing Breakdown */}
                <div className={styles.detailSection}>
                  <h4>Pricing Breakdown</h4>
                  <div className={styles.pricingBreakdown}>
                    <div className={styles.pricingRow}>
                      <span>Base Price:</span>
                      <span>${selectedBooking.pricing.basePrice.toLocaleString()}</span>
                    </div>
                    {(selectedBooking.pricing.distanceCharge || 0) > 0 && (
                      <div className={styles.pricingRow}>
                        <span>Distance Charge:</span>
                        <span>${selectedBooking.pricing.distanceCharge?.toLocaleString()}</span>
                      </div>
                    )}
                    {(selectedBooking.pricing.timeCharge || 0) > 0 && (
                      <div className={styles.pricingRow}>
                        <span>Time Charge:</span>
                        <span>${selectedBooking.pricing.timeCharge?.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedBooking.pricing.surcharges?.map((surcharge, idx) => (
                      <div key={idx} className={styles.pricingRow}>
                        <span>{surcharge.name}:</span>
                        <span>${surcharge.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {selectedBooking.pricing.discounts?.map((discount, idx) => (
                      <div key={idx} className={styles.pricingRow} style={{ color: '#28a745' }}>
                        <span>{discount.name}:</span>
                        <span>-${discount.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {selectedBooking.pricing.taxes?.map((tax, idx) => (
                      <div key={idx} className={styles.pricingRow}>
                        <span>{tax.name}:</span>
                        <span>${tax.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {(selectedBooking.pricing.tips || 0) > 0 && (
                      <div className={styles.pricingRow}>
                        <span>Tips:</span>
                        <span>${selectedBooking.pricing.tips?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className={styles.pricingRowTotal}>
                      <span>Total Amount:</span>
                      <span>${selectedBooking.pricing.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className={styles.detailSection}>
                  <h4>Payment Information</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Payment Method:</label>
                      <span>{selectedBooking.payment.method}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Payment Status:</label>
                      <div 
                        className={styles.statusBadge}
                        style={{ 
                          backgroundColor: `${getPaymentStatusColor(selectedBooking.payment.status)}20`,
                          color: getPaymentStatusColor(selectedBooking.payment.status),
                          width: 'fit-content'
                        }}
                      >
                        <FontAwesomeIcon icon={faCreditCard} />
                        <span>{selectedBooking.payment.status}</span>
                      </div>
                    </div>
                    {selectedBooking.payment.transactionId && (
                      <div className={styles.detailItem}>
                        <label>Transaction ID:</label>
                        <span className={styles.transactionId}>{selectedBooking.payment.transactionId}</span>
                      </div>
                    )}
                    {selectedBooking.payment.paidAt && (
                      <div className={styles.detailItem}>
                        <label>Paid At:</label>
                        <span>{formatDateTime(selectedBooking.payment.paidAt)}</span>
                      </div>
                    )}
                    {(selectedBooking.payment.refundAmount || 0) > 0 && (
                      <div className={styles.detailItem}>
                        <label>Refund Amount:</label>
                        <span style={{ color: '#28a745' }}>${selectedBooking.payment.refundAmount?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transportation Details */}
                {selectedBooking.transportationDetails && (
                  <div className={styles.detailSection}>
                    <h4>Transportation Details</h4>
                    <div className={styles.detailGrid}>
                      {selectedBooking.transportationDetails.tripType && (
                        <div className={styles.detailItem}>
                          <label>Trip Type:</label>
                          <span>{selectedBooking.transportationDetails.tripType}</span>
                        </div>
                      )}
                      {selectedBooking.transportationDetails.rentalDetails?.pickupLocation && (
                        <div className={styles.detailItem}>
                          <label>Pick-up Location:</label>
                          <span>{selectedBooking.transportationDetails.rentalDetails.pickupLocation}</span>
                        </div>
                      )}
                      {selectedBooking.transportationDetails.rentalDetails?.dropoffLocation && (
                        <div className={styles.detailItem}>
                          <label>Drop-off Location:</label>
                          <span>{selectedBooking.transportationDetails.rentalDetails.dropoffLocation}</span>
                        </div>
                      )}
                      {selectedBooking.transportationDetails.tracking?.enabled && (
                        <div className={styles.detailItem}>
                          <label>Tracking Enabled:</label>
                          <span>Yes</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notification Status */}
                {selectedBooking.notifications && (
                  <div className={styles.detailSection}>
                    <h4>Notifications</h4>
                    <div className={styles.notificationGrid}>
                      <div className={styles.notificationItem}>
                        <FontAwesomeIcon icon={faBell} />
                        <span>SMS: {selectedBooking.notifications.smsEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className={styles.notificationItem}>
                        <FontAwesomeIcon icon={faBell} />
                        <span>Email: {selectedBooking.notifications.emailEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className={styles.notificationItem}>
                        <FontAwesomeIcon icon={faBell} />
                        <span>Push: {selectedBooking.notifications.pushEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className={styles.notificationItem}>
                        <FontAwesomeIcon icon={faBell} />
                        <span>Confirmation Sent: {selectedBooking.notifications.confirmationSent ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status History */}
                {selectedBooking.statusHistory && selectedBooking.statusHistory.length > 0 && (
                  <div className={styles.detailSection}>
                    <h4>Status History</h4>
                    <div className={styles.timeline}>
                      {selectedBooking.statusHistory.map((history, idx) => (
                        <div key={idx} className={styles.timelineItem}>
                          <div className={styles.timelineDot} style={{ color: getStatusColor(history.status) }}>
                            <FontAwesomeIcon icon={getStatusIcon(history.status)} />
                          </div>
                          <div className={styles.timelineContent}>
                            <div className={styles.timelineStatus}>{history.status}</div>
                            <div className={styles.timelineTime}>{formatDateTime(history.timestamp)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vendor Notes */}
                <div className={styles.detailSection}>
                  <h4>Vendor Notes</h4>
                  <div className={styles.notesSection}>
                    {Array.isArray(selectedBooking.vendorNotes) && selectedBooking.vendorNotes.length > 0 && (
                      <div className={styles.existingNotes}>
                        {selectedBooking.vendorNotes.map((note, idx) => (
                          <div key={idx} className={styles.noteItem}>
                            <FontAwesomeIcon icon={faNoteSticky} />
                            <div>
                              <p>{typeof note === 'string' ? note : note.text}</p>
                              {typeof note !== 'string' && note.timestamp && (
                                <small>{formatDateTime(note.timestamp)}</small>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={styles.addNoteForm}>
                      <textarea
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Add a new vendor note..."
                        className={styles.noteInput}
                        rows={3}
                      />
                      <button
                        onClick={() => addVendorNote(selectedBooking._id)}
                        className={styles.addNoteBtn}
                        disabled={!notesInput.trim()}
                      >
                        <FontAwesomeIcon icon={faNoteSticky} />
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Actions */}
                <div className={styles.statusActions}>
                  <h4>Update Status</h4>
                  <div className={styles.statusButtonsGrid}>
                    {selectedBooking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            updateBookingStatus(selectedBooking._id, 'confirmed');
                            setShowBookingModal(false);
                          }}
                          className={`${styles.statusActionBtn} ${styles.confirm}`}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                          Confirm Booking
                        </button>
                        <button
                          onClick={() => {
                            updateBookingStatus(selectedBooking._id, 'cancelled');
                            setShowBookingModal(false);
                          }}
                          className={`${styles.statusActionBtn} ${styles.danger}`}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {selectedBooking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          updateBookingStatus(selectedBooking._id, 'completed');
                          setShowBookingModal(false);
                        }}
                        className={`${styles.statusActionBtn} ${styles.complete}`}
                      >
                        <FontAwesomeIcon icon={faCalendarCheck} />
                        Mark Completed
                      </button>
                    )}

                    {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                      <button
                        onClick={() => {
                          updateBookingStatus(selectedBooking._id, 'cancelled');
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