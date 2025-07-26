"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Booking } from '../types/admin.types';
import { 
  RefreshCw, Eye, Edit, Filter, Search,
  Calendar, DollarSign, User, MapPin
} from 'lucide-react';
import styles from '../admin.module.css';

interface BookingManagementProps {
  bookings: Booking[];
  onRefresh: () => void;
}

export default function BookingManagement({ bookings, onRefresh }: BookingManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { Authorization: `Bearer ${token}` };
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || booking.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return `${styles.badge} ${styles.badgeSuccess}`;
      case 'pending': return `${styles.badge} ${styles.badgeWarning}`;
      case 'completed': return `${styles.badge} ${styles.badgeInfo}`;
      case 'cancelled': return `${styles.badge} ${styles.badgeDanger}`;
      default: return `${styles.badge}`;
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );
      onRefresh();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const BookingDetailsModal = ({ booking, onClose }: { booking: Booking; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
              <p className="text-lg font-medium text-gray-900">#{booking._id.slice(-8)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span className={getStatusBadgeClass(booking.status)}>
                {booking.status}
              </span>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Service</h3>
              <p className="text-lg font-medium text-gray-900">{booking.serviceName}</p>
              <p className="text-sm text-gray-600">{booking.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer</h3>
              <p className="text-lg font-medium text-gray-900">{booking.user?.name}</p>
              <p className="text-sm text-gray-600">{booking.user?.email}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p className="text-lg font-medium text-gray-900">
                {new Date(booking.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Guests</h3>
              <p className="text-lg font-medium text-gray-900">{booking.guests}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
              <p className="text-lg font-medium text-gray-900">
                ${booking.paymentDetails?.totalAmount?.toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount Paid</h3>
              <p className="text-lg font-medium text-gray-900">
                ${booking.paymentDetails?.amountPaid?.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => updateBookingStatus(booking._id, 'confirmed')}
              className={`${styles.btn} ${styles.btnSuccess}`}
              disabled={booking.status === 'confirmed'}
            >
              Confirm
            </button>
            <button 
              onClick={() => updateBookingStatus(booking._id, 'cancelled')}
              className={`${styles.btn} ${styles.btnDanger}`}
              disabled={booking.status === 'cancelled'}
            >
              Cancel
            </button>
            <button 
              onClick={() => updateBookingStatus(booking._id, 'completed')}
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={booking.status === 'completed'}
            >
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
        <button 
          onClick={onRefresh}
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className={styles.card}>
        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search bookings..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="stays">Stays</option>
              <option value="dining">Dining</option>
              <option value="activities">Activities</option>
              <option value="transportation">Transportation</option>
            </select>
            
            <input 
              type="date" 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Filter by date"
            />
          </div>
        </div>
        
        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Booking</th>
                <th className={styles.tableHeaderCell}>Customer</th>
                <th className={styles.tableHeaderCell}>Service</th>
                <th className={styles.tableHeaderCell}>Date</th>
                <th className={styles.tableHeaderCell}>Amount</th>
                <th className={styles.tableHeaderCell}>Status</th>
                <th className={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div>
                      <div className="font-medium text-gray-900">#{booking._id.slice(-8)}</div>
                      <div className="text-sm text-gray-500">{booking.category}</div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <div>
                      <div className="font-medium text-gray-900">{booking.user?.name}</div>
                      <div className="text-sm text-gray-500">{booking.user?.email}</div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className="text-sm text-gray-900">{booking.serviceName}</div>
                  </td>
                  <td className={styles.tableCell}>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.guests} guests
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        ${booking.paymentDetails?.totalAmount?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Paid: ${booking.paymentDetails?.amountPaid?.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={getStatusBadgeClass(booking.status)}>
                      {booking.status}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1">
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </p>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}
    </div>
  );
}