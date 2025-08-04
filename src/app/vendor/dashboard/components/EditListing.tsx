"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave, faTimes, faUpload, faTrash, faPlus, 
  faEdit, faCalendar, faDollarSign, faUsers, faClock, faTags
} from '@fortawesome/free-solid-svg-icons';
import styles from '../dashboard.module.css';

interface EditListingProps {
  listingId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Listing {
  _id: string;
  category: string;
  name: string;
  description: string;
  location: {
    island: string;
    address: string;
    coordinates: { lat: number; lng: number; };
  };
  pricing: {
    basePrice: number;
    currency: string;
    priceType: string;
    seasonalRates?: Array<{
      season: string;
      multiplier: number;
      startDate: string;
      endDate: string;
    }>;
  };
  images: string[];
  amenities: string[];
  policies: {
    cancellation: string;
    checkIn: string;
    checkOut: string;
    rules: string[];
  };
  availability: {
    schedule: any;
    blockedDates: string[];
  };
  capacity: {
    maxGuests?: number;
    maxSeats?: number;
    maxPassengers?: number;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  status: string;
  promotions?: Array<{
    _id: string;
    name: string;
    type: string;
    value: number;
    validFrom: string;
    validTo: string;
  }>;
}

export default function EditListing({ listingId, onSuccess, onCancel }: EditListingProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<any>({});

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: faEdit },
    { id: 'pricing', label: 'Pricing', icon: faDollarSign },
    { id: 'images', label: 'Images', icon: faUpload },
    { id: 'availability', label: 'Availability', icon: faCalendar },
    { id: 'promotions', label: 'Promotions', icon: faTags }
  ];

  const islands = [
    'Providenciales', 'Grand Turk', 'North Caicos', 
    'Middle Caicos', 'South Caicos', 'Salt Cay'
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/listings/${listingId}`,
        { headers: getAuthHeaders() }
      );
      setListing(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listing:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (path: string, value: any) => {
    if (!listing) return;
    
    const keys = path.split('.');
    setListing(prev => {
      if (!prev) return prev;
      const newListing = { ...prev };
      let current: any = newListing;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newListing;
    });
  };

  const handleImageUpload = (files: FileList) => {
    const filesArray = Array.from(files);
    setNewImages(prev => [...prev, ...filesArray]);
  };

  const removeExistingImage = (index: number) => {
    if (!listing) return;
    const newImages = listing.images.filter((_, i) => i !== index);
    handleInputChange('images', newImages);
  };

  const uploadNewImages = async () => {
    if (newImages.length === 0) return [];
    
    const uploadPromises = newImages.map(async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/image`,
        formData,
        { 
          headers: { 
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data.url;
    });
    
    return Promise.all(uploadPromises);
  };

  const handleSave = async () => {
    if (!listing) return;

    setSaving(true);
    try {
      // Upload new images
      const uploadedImageUrls = await uploadNewImages();
      
      // Combine existing and new images
      const allImages = [...listing.images, ...uploadedImageUrls];
      
      const updatedListing = {
        ...listing,
        images: allImages
      };

      const endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/${listing.category}/${listing._id}`;
      
      await axios.put(endpoint, updatedListing, { headers: getAuthHeaders() });
      
      alert('Listing updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Error updating listing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSeasonalRate = () => {
    if (!listing) return;
    const newRate = {
      season: 'high',
      multiplier: 1.2,
      startDate: '',
      endDate: ''
    };
    
    const currentRates = listing.pricing.seasonalRates || [];
    handleInputChange('pricing.seasonalRates', [...currentRates, newRate]);
  };

  const removeSeasonalRate = (index: number) => {
    if (!listing || !listing.pricing.seasonalRates) return;
    const newRates = listing.pricing.seasonalRates.filter((_, i) => i !== index);
    handleInputChange('pricing.seasonalRates', newRates);
  };

  const updateSeasonalRate = (index: number, field: string, value: any) => {
    if (!listing || !listing.pricing.seasonalRates) return;
    const newRates = [...listing.pricing.seasonalRates];
    newRates[index] = { ...newRates[index], [field]: value };
    handleInputChange('pricing.seasonalRates', newRates);
  };

  const addBlockedDate = (date: string) => {
    if (!listing || !date) return;
    const currentBlocked = listing.availability.blockedDates || [];
    if (!currentBlocked.includes(date)) {
      handleInputChange('availability.blockedDates', [...currentBlocked, date]);
    }
  };

  const removeBlockedDate = (date: string) => {
    if (!listing) return;
    const newBlocked = (listing.availability.blockedDates || []).filter(d => d !== date);
    handleInputChange('availability.blockedDates', newBlocked);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading listing...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className={styles.errorContainer}>
        <p>Listing not found</p>
        <button onClick={onCancel} className={styles.backBtn}>
          Go Back
        </button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className={styles.tabContent}>
            <div className={styles.formGroup}>
              <label>Listing Name *</label>
              <input
                type="text"
                value={listing.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description *</label>
              <textarea
                value={listing.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={5}
                className={styles.formTextarea}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Island *</label>
                <select
                  value={listing.location.island}
                  onChange={(e) => handleInputChange('location.island', e.target.value)}
                  className={styles.formSelect}
                >
                  {islands.map(island => (
                    <option key={island} value={island}>{island}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Address *</label>
                <input
                  type="text"
                  value={listing.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Phone</label>
                <input
                  type="tel"
                  value={listing.contactInfo.phone}
                  onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={listing.contactInfo.email}
                  onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>

            {/* Capacity based on listing type */}
            {listing.category === 'stays' && (
              <div className={styles.formGroup}>
                <label>Maximum Guests</label>
                <input
                  type="number"
                  value={listing.capacity.maxGuests || ''}
                  onChange={(e) => handleInputChange('capacity.maxGuests', Number(e.target.value))}
                  className={styles.formInput}
                  min="1"
                />
              </div>
            )}

            {listing.category === 'dining' && (
              <div className={styles.formGroup}>
                <label>Maximum Seats</label>
                <input
                  type="number"
                  value={listing.capacity.maxSeats || ''}
                  onChange={(e) => handleInputChange('capacity.maxSeats', Number(e.target.value))}
                  className={styles.formInput}
                  min="1"
                />
              </div>
            )}

            {listing.category === 'transportation' && (
              <div className={styles.formGroup}>
                <label>Maximum Passengers</label>
                <input
                  type="number"
                  value={listing.capacity.maxPassengers || ''}
                  onChange={(e) => handleInputChange('capacity.maxPassengers', Number(e.target.value))}
                  className={styles.formInput}
                  min="1"
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Status</label>
              <select
                value={listing.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className={styles.formSelect}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className={styles.tabContent}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Base Price *</label>
                <div className={styles.priceInput}>
                  <span className={styles.currency}>$</span>
                  <input
                    type="number"
                    value={listing.pricing.basePrice}
                    onChange={(e) => handleInputChange('pricing.basePrice', Number(e.target.value))}
                    className={styles.formInput}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Price Type</label>
                <select
                  value={listing.pricing.priceType}
                  onChange={(e) => handleInputChange('pricing.priceType', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="per night">Per Night</option>
                  <option value="per person">Per Person</option>
                  <option value="per hour">Per Hour</option>
                  <option value="per day">Per Day</option>
                  <option value="flat rate">Flat Rate</option>
                </select>
              </div>
            </div>

            {/* Seasonal Rates */}
            <div className={styles.seasonalRates}>
              <div className={styles.sectionHeader}>
                <h4>Seasonal Rates</h4>
                <button 
                  type="button"
                  onClick={addSeasonalRate}
                  className={styles.addBtn}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Add Rate
                </button>
              </div>

              {listing.pricing.seasonalRates?.map((rate, index) => (
                <div key={index} className={styles.seasonalRateItem}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Season</label>
                      <select
                        value={rate.season}
                        onChange={(e) => updateSeasonalRate(index, 'season', e.target.value)}
                        className={styles.formSelect}
                      >
                        <option value="high">High Season</option>
                        <option value="low">Low Season</option>
                        <option value="shoulder">Shoulder Season</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Price Multiplier</label>
                      <input
                        type="number"
                        value={rate.multiplier}
                        onChange={(e) => updateSeasonalRate(index, 'multiplier', Number(e.target.value))}
                        className={styles.formInput}
                        min="0.1"
                        step="0.1"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={rate.startDate}
                        onChange={(e) => updateSeasonalRate(index, 'startDate', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>End Date</label>
                      <input
                        type="date"
                        value={rate.endDate}
                        onChange={(e) => updateSeasonalRate(index, 'endDate', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSeasonalRate(index)}
                      className={styles.removeBtn}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'images':
        return (
          <div className={styles.tabContent}>
            <div className={styles.imageUploadSection}>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className={styles.fileInput}
                  id="image-upload-edit"
                />
                
                <label htmlFor="image-upload-edit" className={styles.uploadLabel}>
                  <FontAwesomeIcon icon={faUpload} />
                  <span>Upload Additional Images</span>
                </label>
              </div>

              {/* Existing Images */}
              <div className={styles.existingImages}>
                <h4>Current Images ({listing.images.length})</h4>
                <div className={styles.imageGrid}>
                  {listing.images.map((image, index) => (
                    <div key={index} className={styles.imageItem}>
                      <img src={image} alt={`Listing image ${index + 1}`} />
                      <button
                        type="button"
                        className={styles.removeImageBtn}
                        onClick={() => removeExistingImage(index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                      {index === 0 && (
                        <div className={styles.primaryBadge}>Primary</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* New Images Preview */}
              {newImages.length > 0 && (
                <div className={styles.newImages}>
                  <h4>New Images to Upload ({newImages.length})</h4>
                  <div className={styles.imageGrid}>
                    {newImages.map((file, index) => (
                      <div key={index} className={styles.imageItem}>
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`New image ${index + 1}`} 
                        />
                        <button
                          type="button"
                          className={styles.removeImageBtn}
                          onClick={() => {
                            setNewImages(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                        <div className={styles.newBadge}>New</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'availability':
        return (
          <div className={styles.tabContent}>
            <div className={styles.availabilitySection}>
              <h4>Blocked Dates</h4>
              <p>Select dates when your listing is not available</p>
              
              <div className={styles.dateInputGroup}>
                <input
                  type="date"
                  className={styles.formInput}
                  onChange={(e) => e.target.value && addBlockedDate(e.target.value)}
                />
                <span>Add blocked date</span>
              </div>

              {listing.availability.blockedDates && listing.availability.blockedDates.length > 0 && (
                <div className={styles.blockedDatesList}>
                  <h5>Currently Blocked Dates:</h5>
                  <div className={styles.dateChips}>
                    {listing.availability.blockedDates.map((date, index) => (
                      <div key={index} className={styles.dateChip}>
                        <span>{new Date(date).toLocaleDateString()}</span>
                        <button
                          type="button"
                          onClick={() => removeBlockedDate(date)}
                          className={styles.removeDateBtn}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Hours for dining/activities */}
              {(listing.category === 'dining' || listing.category === 'activities') && (
                <div className={styles.businessHours}>
                  <h4>Business Hours</h4>
                  <div className={styles.hoursGrid}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <div key={day} className={styles.dayHours}>
                        <label>{day}</label>
                        <div className={styles.timeInputs}>
                          <input
                            type="time"
                            placeholder="Open"
                            className={styles.timeInput}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            placeholder="Close"
                            className={styles.timeInput}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'promotions':
        return (
          <div className={styles.tabContent}>
            <div className={styles.promotionsSection}>
              <div className={styles.sectionHeader}>
                <h4>Active Promotions</h4>
                <button 
                  className={styles.createBtn}
                  onClick={() => {
                    // Navigate to discount manager or open modal
                    alert('Navigate to discount manager to create promotions');
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Create Promotion
                </button>
              </div>

              {listing.promotions && listing.promotions.length > 0 ? (
                <div className={styles.promotionsList}>
                  {listing.promotions.map((promo, index) => (
                    <div key={index} className={styles.promotionItem}>
                      <div className={styles.promoInfo}>
                        <h5>{promo.name}</h5>
                        <p>{promo.type} - {promo.value}% off</p>
                        <span className={styles.promoDate}>
                          Valid: {new Date(promo.validFrom).toLocaleDateString()} - {new Date(promo.validTo).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.promoActions}>
                        <button className={styles.editPromoBtn}>
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className={styles.deletePromoBtn}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyPromotions}>
                  <p>No active promotions</p>
                  <button className={styles.createBtn}>
                    <FontAwesomeIcon icon={faPlus} />
                    Create Your First Promotion
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.editListing}>
      {/* Header */}
      <div className={styles.editHeader}>
        <div className={styles.headerInfo}>
          <h2>Edit Listing</h2>
          <p>{listing.name}</p>
        </div>
        
        <div className={styles.headerActions}>
          <button onClick={onCancel} className={styles.cancelBtn}>
            <FontAwesomeIcon icon={faTimes} />
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className={styles.saveBtn}
          >
            {saving ? (
              <>
                <div className={styles.spinner}></div>
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.editTabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <FontAwesomeIcon icon={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.editContent}>
        {renderTabContent()}
      </div>
    </div>
  );
}