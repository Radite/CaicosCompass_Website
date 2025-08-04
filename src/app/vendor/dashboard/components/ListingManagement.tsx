"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch, faFilter, faEdit, faEye, faTrash, 
  faToggleOn, faToggleOff, faPlus, faSort, faStar, faList
} from '@fortawesome/free-solid-svg-icons';
import styles from '../dashboard.module.css';

interface ListingManagementProps {
  onEditListing: (id: string) => void;
  onCreateListing: () => void;
}

interface Listing {
  _id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  price: number;
  rating: number;
  totalBookings: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ListingManagement({ onEditListing, onCreateListing }: ListingManagementProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedListings, setSelectedListings] = useState<string[]>([]);

  const categories = ['all', 'dining', 'stays', 'activities', 'transportation'];
  const statuses = ['all', 'active', 'inactive', 'pending'];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  // Helper function to get the primary image URL (following ActivityCard pattern)
  const getImageUrl = (listing: Listing) => {
    if (listing.images && listing.images.length > 0) {
      // Check if images is an array of objects with url property (like ActivityCard)
      const firstImage = listing.images[0];
      let imageUrl: string;
      
      if (typeof firstImage === 'object' && firstImage !== null) {
        // For images array with objects like [{ url: 'path', isMain: true }]
        const mainImage = listing.images.find((img: any) => img.isMain);
        imageUrl = mainImage?.url || firstImage.url;
      } else {
        // For simple string array like ['path1', 'path2']
        imageUrl = firstImage as string;
      }
      
      // Ensure imageUrl is a string before calling startsWith
      if (typeof imageUrl === 'string') {
        // Check if it's already a full URL
        if (imageUrl.startsWith('http')) {
          return imageUrl;
        }
        // If it's a relative path, construct the full URL
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${imageUrl}`;
      }
    }
    // Fallback to placeholder
    return "https://via.placeholder.com/48x48/0D4C92/FFFFFF?text=IMG";
  };

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterAndSortListings();
  }, [listings, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const fetchListings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/listings`,
        { headers: getAuthHeaders() }
      );
      setListings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setLoading(false);
    }
  };

  const filterAndSortListings = () => {
    let filtered = [...listings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(listing => listing.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(listing => listing.status === selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof Listing];
      let bValue = b[sortBy as keyof Listing];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredListings(filtered);
  };

  const toggleListingStatus = async (listingId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/listings/${listingId}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );
      
      setListings(prev => prev.map(listing =>
        listing._id === listingId ? { ...listing, status: newStatus as any } : listing
      ));
    } catch (error) {
      console.error('Error updating listing status:', error);
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/listings/${listingId}`,
        { headers: getAuthHeaders() }
      );
      
      setListings(prev => prev.filter(listing => listing._id !== listingId));
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedListings.length === 0) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/listings/bulk-action`,
        { action, listingIds: selectedListings },
        { headers: getAuthHeaders() }
      );
      
      fetchListings();
      setSelectedListings([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading listings...</p>
      </div>
    );
  }

  return (
    <div className={styles.listingManagement}>
      {/* Header Actions */}
      <div className={styles.listingHeader}>
        <div className={styles.headerActions}>
          <div className={styles.searchBar}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.filterSelect}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={styles.filterSelect}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button className={styles.createBtn} onClick={onCreateListing}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Create Listing</span>
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedListings.length > 0 && (
          <div className={styles.bulkActions}>
            <span>{selectedListings.length} selected</span>
            <button onClick={() => handleBulkAction('activate')} className={styles.bulkBtn}>
              Activate
            </button>
            <button onClick={() => handleBulkAction('deactivate')} className={styles.bulkBtn}>
              Deactivate
            </button>
            <button onClick={() => handleBulkAction('delete')} className={styles.bulkBtn}>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Listings Table */}
      <div className={styles.listingsTable}>
        <div className={styles.tableHeader}>
          <div className={styles.tableCell}>
            <input
              type="checkbox"
              checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedListings(filteredListings.map(l => l._id));
                } else {
                  setSelectedListings([]);
                }
              }}
            />
          </div>
          <div className={styles.tableCell} onClick={() => handleSort('name')}>
            <span>Name</span>
            <FontAwesomeIcon icon={faSort} />
          </div>
          <div className={styles.tableCell} onClick={() => handleSort('category')}>
            <span>Category</span>
            <FontAwesomeIcon icon={faSort} />
          </div>
          <div className={styles.tableCell} onClick={() => handleSort('price')}>
            <span>Price</span>
            <FontAwesomeIcon icon={faSort} />
          </div>
          <div className={styles.tableCell} onClick={() => handleSort('rating')}>
            <span>Rating</span>
            <FontAwesomeIcon icon={faSort} />
          </div>
          <div className={styles.tableCell} onClick={() => handleSort('totalBookings')}>
            <span>Bookings</span>
            <FontAwesomeIcon icon={faSort} />
          </div>
          <div className={styles.tableCell} onClick={() => handleSort('status')}>
            <span>Status</span>
            <FontAwesomeIcon icon={faSort} />
          </div>
          <div className={styles.tableCell}>Actions</div>
        </div>

        <div className={styles.tableBody}>
          {filteredListings.map((listing) => (
            <div key={listing._id} className={styles.tableRow}>
              <div className={styles.tableCell}>
                <input
                  type="checkbox"
                  checked={selectedListings.includes(listing._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedListings([...selectedListings, listing._id]);
                    } else {
                      setSelectedListings(selectedListings.filter(id => id !== listing._id));
                    }
                  }}
                />
              </div>
              
              <div className={styles.tableCell}>
                <div className={styles.listingInfo}>
                  <img 
                    src={getImageUrl(listing)}
                    alt={listing.name}
                    className={styles.listingThumbnail}
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/48x48/0D4C92/FFFFFF?text=IMG";
                    }}
                  />
                  <div>
                    <h4>{listing.name}</h4>
                    <p className={styles.listingId}>ID: {listing._id?.slice(-6) || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.tableCell}>
                <span className={styles.categoryTag}>{listing.category}</span>
              </div>
              
              <div className={styles.tableCell}>
                <span className={styles.price}>${listing.price}</span>
              </div>
              
              <div className={styles.tableCell}>
                <div className={styles.rating}>
                  <FontAwesomeIcon icon={faStar} />
                  <span>{listing.rating || 'N/A'}</span>
                </div>
              </div>
              
              <div className={styles.tableCell}>
                <span>{listing.totalBookings || 0}</span>
              </div>
              
              <div className={styles.tableCell}>
                <span className={`${styles.statusBadge} ${styles[listing.status]}`}>
                  {listing.status}
                </span>
              </div>
              
              <div className={styles.tableCell}>
                <div className={styles.actions}>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => onEditListing(listing._id)}
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  
                  <button 
                    className={styles.actionBtn}
                    onClick={() => {
                      const url = `/listing/${listing._id}`;
                      window.open(url, '_blank');
                    }}
                    title="View"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  
                  <button 
                    className={`${styles.actionBtn} ${listing.status === 'active' ? styles.active : styles.inactive}`}
                    onClick={() => toggleListingStatus(listing._id, listing.status)}
                    title={listing.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <FontAwesomeIcon icon={listing.status === 'active' ? faToggleOn : faToggleOff} />
                  </button>
                  
                  <button 
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={() => deleteListing(listing._id)}
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredListings.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FontAwesomeIcon icon={faList} />
          </div>
          <h3>No listings found</h3>
          <p>Create your first listing to get started!</p>
          <button className={styles.createBtn} onClick={onCreateListing}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Create Listing</span>
          </button>
        </div>
      )}
    </div>
  );
}