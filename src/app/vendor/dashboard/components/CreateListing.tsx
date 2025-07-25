"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils, faBed, faMap, faCar, faUpload, 
  faPlus, faMinus, faSave, faTimes, faCheck
} from '@fortawesome/free-solid-svg-icons';
import styles from '../dashboard.module.css';

interface CreateListingProps {
  onSuccess: () => void;
}

interface ListingForm {
  category: string;
  name: string;
  description: string;
  location: {
    island: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  pricing: {
    basePrice: number;
    currency: string;
    priceType: string; // per night, per person, per hour, etc.
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
}

const initialForm: ListingForm = {
  category: '',
  name: '',
  description: '',
  location: {
    island: '',
    address: '',
    coordinates: { lat: 0, lng: 0 }
  },
  pricing: {
    basePrice: 0,
    currency: 'USD',
    priceType: 'per night'
  },
  images: [],
  amenities: [],
  policies: {
    cancellation: 'flexible',
    checkIn: '15:00',
    checkOut: '11:00',
    rules: []
  },
  availability: {
    schedule: {},
    blockedDates: []
  },
  capacity: {},
  contactInfo: {
    phone: '',
    email: ''
  }
};

export default function CreateListing({ onSuccess }: CreateListingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingForm>(initialForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const serviceTypes = [
    { 
      value: 'dining', 
      label: 'Restaurant/Dining', 
      icon: faUtensils,
      description: 'Restaurants, cafes, food trucks, catering services'
    },
    { 
      value: 'stays', 
      label: 'Accommodation', 
      icon: faBed,
      description: 'Hotels, villas, apartments, B&Bs, resorts'
    },
    { 
      value: 'activities', 
      label: 'Tours/Activities', 
      icon: faMap,
      description: 'Tours, excursions, experiences, attractions'
    },
    { 
      value: 'transportation', 
      label: 'Transportation', 
      icon: faCar,
      description: 'Car rentals, transfers, boat tours, taxi services'
    }
  ];

  const islands = [
    'Providenciales',
    'Grand Turk',
    'North Caicos',
    'Middle Caicos',
    'South Caicos',
    'Salt Cay'
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  const handleInputChange = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i] as keyof typeof current] as any;
      }
      
      current[keys[keys.length - 1] as keyof typeof current] = value;
      return newData;
    });
  };

  const handleImageUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    handleInputChange('images', [...formData.images, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    
    setImageFiles(newFiles);
    handleInputChange('images', newImages);
  };

  const validateStep = (step: number) => {
    const stepErrors: any = {};

    switch (step) {
      case 1:
        if (!formData.category) stepErrors.category = 'Please select a service type';
        break;
      case 2:
        if (!formData.name) stepErrors.name = 'Listing name is required';
        if (!formData.description) stepErrors.description = 'Description is required';
        if (!formData.location.island) stepErrors.island = 'Please select an island';
        if (!formData.location.address) stepErrors.address = 'Address is required';
        break;
      case 3:
        if (!formData.pricing.basePrice) stepErrors.basePrice = 'Base price is required';
        break;
      case 4:
        if (formData.images.length === 0) stepErrors.images = 'At least one image is required';
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const uploadImages = async () => {
    const uploadPromises = imageFiles.map(async (file) => {
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

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setLoading(true);
    try {
      // Upload images first
      const uploadedImageUrls = await uploadImages();
      
      // Create listing with uploaded image URLs
      const listingData = {
        ...formData,
        images: uploadedImageUrls
      };

      const endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/${formData.category}`;
      
      await axios.post(endpoint, listingData, { headers: getAuthHeaders() });
      
      alert('Listing created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Error creating listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h3>Choose Service Type</h3>
            <p>What type of service are you offering?</p>
            
            <div className={styles.serviceTypeGrid}>
              {serviceTypes.map((type) => (
                <div
                  key={type.value}
                  className={`${styles.serviceTypeCard} ${
                    formData.category === type.value ? styles.selected : ''
                  }`}
                  onClick={() => handleInputChange('category', type.value)}
                >
                  <FontAwesomeIcon icon={type.icon} className={styles.serviceIcon} />
                  <h4>{type.label}</h4>
                  <p>{type.description}</p>
                </div>
              ))}
            </div>
            
            {errors.category && (
              <div className={styles.errorMessage}>{errors.category}</div>
            )}
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <h3>Basic Information</h3>
            
            <div className={styles.formGroup}>
              <label>Listing Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter a catchy name for your listing"
                className={errors.name ? styles.error : ''}
              />
              {errors.name && <div className={styles.errorText}>{errors.name}</div>}
            </div>

            <div className={styles.formGroup}>
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your service in detail..."
                rows={5}
                className={errors.description ? styles.error : ''}
              />
              {errors.description && <div className={styles.errorText}>{errors.description}</div>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Island *</label>
                <select
                  value={formData.location.island}
                  onChange={(e) => handleInputChange('location.island', e.target.value)}
                  className={errors.island ? styles.error : ''}
                >
                  <option value="">Select Island</option>
                  {islands.map(island => (
                    <option key={island} value={island}>{island}</option>
                  ))}
                </select>
                {errors.island && <div className={styles.errorText}>{errors.island}</div>}
              </div>

              <div className={styles.formGroup}>
                <label>Address *</label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  placeholder="Street address"
                  className={errors.address ? styles.error : ''}
                />
                {errors.address && <div className={styles.errorText}>{errors.address}</div>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.stepContent}>
            <h3>Pricing Information</h3>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Base Price *</label>
                <div className={styles.priceInput}>
                  <span className={styles.currency}>$</span>
                  <input
                    type="number"
                    value={formData.pricing.basePrice}
                    onChange={(e) => handleInputChange('pricing.basePrice', Number(e.target.value))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={errors.basePrice ? styles.error : ''}
                  />
                </div>
                {errors.basePrice && <div className={styles.errorText}>{errors.basePrice}</div>}
              </div>

              <div className={styles.formGroup}>
                <label>Price Type</label>
                <select
                  value={formData.pricing.priceType}
                  onChange={(e) => handleInputChange('pricing.priceType', e.target.value)}
                >
                  <option value="per night">Per Night</option>
                  <option value="per person">Per Person</option>
                  <option value="per hour">Per Hour</option>
                  <option value="per day">Per Day</option>
                  <option value="flat rate">Flat Rate</option>
                </select>
              </div>
            </div>

            {/* Capacity based on service type */}
            {formData.category === 'stays' && (
              <div className={styles.formGroup}>
                <label>Maximum Guests</label>
                <input
                  type="number"
                  value={formData.capacity.maxGuests || ''}
                  onChange={(e) => handleInputChange('capacity.maxGuests', Number(e.target.value))}
                  placeholder="Number of guests"
                  min="1"
                />
              </div>
            )}

            {formData.category === 'dining' && (
              <div className={styles.formGroup}>
                <label>Maximum Seats</label>
                <input
                  type="number"
                  value={formData.capacity.maxSeats || ''}
                  onChange={(e) => handleInputChange('capacity.maxSeats', Number(e.target.value))}
                  placeholder="Number of seats"
                  min="1"
                />
              </div>
            )}

            {formData.category === 'transportation' && (
              <div className={styles.formGroup}>
                <label>Maximum Passengers</label>
                <input
                  type="number"
                  value={formData.capacity.maxPassengers || ''}
                  onChange={(e) => handleInputChange('capacity.maxPassengers', Number(e.target.value))}
                  placeholder="Number of passengers"
                  min="1"
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className={styles.stepContent}>
            <h3>Images & Media</h3>
            <p>Upload high-quality images to showcase your service</p>

            <div className={styles.imageUploadArea}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className={styles.fileInput}
                id="image-upload"
              />
              
              <label htmlFor="image-upload" className={styles.uploadLabel}>
                <FontAwesomeIcon icon={faUpload} />
                <span>Click to upload images or drag and drop</span>
                <small>Supports JPG, PNG, WebP (Max 5MB each)</small>
              </label>
            </div>

            {errors.images && (
              <div className={styles.errorMessage}>{errors.images}</div>
            )}

            {formData.images.length > 0 && (
              <div className={styles.imagePreview}>
                <h4>Uploaded Images ({formData.images.length})</h4>
                <div className={styles.imageGrid}>
                  {formData.images.map((image, index) => (
                    <div key={index} className={styles.imageItem}>
                      <img src={image} alt={`Upload ${index + 1}`} />
                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={() => removeImage(index)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                      {index === 0 && (
                        <div className={styles.primaryBadge}>Primary</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className={styles.stepContent}>
            <h3>Review & Publish</h3>
            <p>Review your listing details before publishing</p>

            <div className={styles.reviewSection}>
              <div className={styles.reviewItem}>
                <h4>Service Type</h4>
                <p>{serviceTypes.find(t => t.value === formData.category)?.label}</p>
              </div>

              <div className={styles.reviewItem}>
                <h4>Name</h4>
                <p>{formData.name}</p>
              </div>

              <div className={styles.reviewItem}>
                <h4>Location</h4>
                <p>{formData.location.island}, {formData.location.address}</p>
              </div>

              <div className={styles.reviewItem}>
                <h4>Pricing</h4>
                <p>${formData.pricing.basePrice} {formData.pricing.priceType}</p>
              </div>

              <div className={styles.reviewItem}>
                <h4>Images</h4>
                <p>{formData.images.length} image(s) uploaded</p>
              </div>
            </div>

            <div className={styles.publishOptions}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                <span>Publish immediately after creation</span>
              </label>
              
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                <span>Send notification to followers</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.createListing}>
      {/* Progress Steps */}
      <div className={styles.progressSteps}>
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`${styles.progressStep} ${
              currentStep >= step ? styles.active : ''
            } ${currentStep > step ? styles.completed : ''}`}
          >
            <div className={styles.stepNumber}>
              {currentStep > step ? (
                <FontAwesomeIcon icon={faCheck} />
              ) : (
                step
              )}
            </div>
            <div className={styles.stepLabel}>
              {step === 1 && 'Type'}
              {step === 2 && 'Details'}
              {step === 3 && 'Pricing'}
              {step === 4 && 'Images'}
              {step === 5 && 'Review'}
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className={styles.stepContainer}>
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className={styles.stepNavigation}>
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={styles.prevBtn}
        >
          Previous
        </button>

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={nextStep}
            className={styles.nextBtn}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Creating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                Create Listing
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}