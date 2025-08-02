// forms/WellnessSpaForm.tsx
"use client";

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faMinus, faUpload, faTimes, faSpa,
  faClock, faCamera, faDollarSign, faLeaf, faHeart,
  faCalendarAlt, faUsers, faExclamationTriangle,
  faMapMarkerAlt, faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import { WellnessSpa, ListingFormProps } from '../../../types/listing';
import styles from './ServiceForms.module.css';

// Dynamic import for map component to avoid SSR issues
const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading}>
      <p>Loading map...</p>
    </div>
  )
});

const SPA_TYPES = [
  'Resort Spa',
  'Day Spa',
  'Medical Spa',
  'Holistic Spa',
  'Wellness Retreat'
];

const SERVICE_CATEGORIES = [
  'Massage',
  'Facial',
  'Body Treatment',
  'Wellness Therapy',
  'Other'
];

const PAYMENT_OPTIONS = [
  'Cash',
  'Credit Card',
  'Mobile Payment',
  'Cryptocurrency'
];

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const ISLANDS = [
  'Providenciales',
  'Grand Turk',
  'North Caicos',
  'Middle Caicos',
  'South Caicos',
  'Salt Cay'
];

export default function WellnessSpaForm({ onNext, onPrev, initialData }: ListingFormProps) {
  const [formData, setFormData] = useState<Partial<WellnessSpa>>({
    serviceType: 'wellnessspas',
    name: '',
    description: '',
    location: '',
    island: '',
    coordinates: { latitude: 0, longitude: 0 },
    images: [],
    spaType: 'Day Spa',
    servicesOffered: [],
    ageRestrictions: { minAge: 0 },
    openingHours: [],
    customClosures: [],
    wellnessPrograms: [],
    cancellationPolicy: '',
    paymentOptions: ['Cash', 'Credit Card'],
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState(0);
  const [showMap, setShowMap] = useState(false);

  const tabs = [
    { key: 'basic', label: 'Spa Info' },
    { key: 'services', label: 'Services & Treatments' },
    { key: 'programs', label: 'Wellness Programs' },
    { key: 'operations', label: 'Operations & Policies' }
  ];

  const handleInputChange = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    handleInputChange('coordinates', { latitude: lat, longitude: lng });
  }, []);

  const handleImageUpload = (files: FileList, serviceIndex?: number) => {
    const newFiles = Array.from(files);
    
    if (serviceIndex !== undefined) {
      // For service-specific images
      const currentImages = formData.servicesOffered?.[serviceIndex]?.images || [];
      const newImages = newFiles.map((file, index) => ({
        url: file as any,
        isMain: currentImages.length === 0 && index === 0
      }));
      
      handleInputChange(`servicesOffered.${serviceIndex}.images`, [...currentImages, ...newImages]);
    } else {
      // For main spa images
      const currentImages = formData.images || [];
      const newImages = newFiles.map((file, index) => ({
        url: file as any,
        isMain: currentImages.length === 0 && index === 0
      }));
      
      handleInputChange('images', [...currentImages, ...newImages]);
    }
  };

  const removeImage = (index: number, serviceIndex?: number) => {
    if (serviceIndex !== undefined) {
      const currentImages = formData.servicesOffered?.[serviceIndex]?.images || [];
      const newImages = currentImages.filter((_, i) => i !== index);
      handleInputChange(`servicesOffered.${serviceIndex}.images`, newImages);
    } else {
      const newImages = (formData.images || []).filter((_, i) => i !== index);
      handleInputChange('images', newImages);
    }
  };

  const togglePaymentOption = (option: string) => {
    const currentOptions = formData.paymentOptions || [];
    if (currentOptions.includes(option as any)) {
      const newOptions = currentOptions.filter(o => o !== option);
      handleInputChange('paymentOptions', newOptions);
    } else {
      handleInputChange('paymentOptions', [...currentOptions, option]);
    }
  };

  const addService = () => {
    const newService = {
      name: '',
      description: '',
      duration: 60,
      price: 0,
      category: 'Massage' as const,
      weeklyAvailability: [],
      dateExceptions: [],
      images: []
    };

    const currentServices = formData.servicesOffered || [];
    handleInputChange('servicesOffered', [...currentServices, newService]);
  };

  const removeService = (index: number) => {
    const currentServices = formData.servicesOffered || [];
    const newServices = currentServices.filter((_, i) => i !== index);
    handleInputChange('servicesOffered', newServices);
  };

  const addTimeSlot = (serviceIndex: number, day: string) => {
    const service = formData.servicesOffered?.[serviceIndex];
    if (!service) return;

    const dayAvailability = service.weeklyAvailability.find(a => a.day === day);
    if (dayAvailability) {
      const newTimeSlot = {
        startTime: '09:00',
        endTime: '10:00',
        maxBookings: 1
      };
      dayAvailability.timeSlots.push(newTimeSlot);
    } else {
      service.weeklyAvailability.push({
        day,
        timeSlots: [{
          startTime: '09:00',
          endTime: '10:00',
          maxBookings: 1
        }],
        isAvailable: true
      });
    }

    handleInputChange('servicesOffered', [...(formData.servicesOffered || [])]);
  };

  const removeTimeSlot = (serviceIndex: number, day: string, slotIndex: number) => {
    const service = formData.servicesOffered?.[serviceIndex];
    if (!service) return;

    const dayAvailability = service.weeklyAvailability.find(a => a.day === day);
    if (dayAvailability) {
      dayAvailability.timeSlots.splice(slotIndex, 1);
      if (dayAvailability.timeSlots.length === 0) {
        service.weeklyAvailability = service.weeklyAvailability.filter(a => a.day !== day);
      }
    }

    handleInputChange('servicesOffered', [...(formData.servicesOffered || [])]);
  };

const addDateException = (serviceIndex: number) => {
  const service = formData.servicesOffered?.[serviceIndex];
  if (!service) return;

  // Get today's date as YYYY-MM-DD string
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  const newException = {
    date: todayString,
    isAvailable: false,
    timeSlots: [],
    reason: ''
  };

  service.dateExceptions.push(newException);
  handleInputChange('servicesOffered', [...(formData.servicesOffered || [])]);
};

  const removeDateException = (serviceIndex: number, exceptionIndex: number) => {
    const service = formData.servicesOffered?.[serviceIndex];
    if (!service) return;

    service.dateExceptions.splice(exceptionIndex, 1);
    handleInputChange('servicesOffered', [...(formData.servicesOffered || [])]);
  };

  const addWellnessProgram = () => {
    const newProgram = {
      title: '',
      description: '',
      durationDays: 1,
      price: 0
    };

    const currentPrograms = formData.wellnessPrograms || [];
    handleInputChange('wellnessPrograms', [...currentPrograms, newProgram]);
  };

  const removeWellnessProgram = (index: number) => {
    const currentPrograms = formData.wellnessPrograms || [];
    const newPrograms = currentPrograms.filter((_, i) => i !== index);
    handleInputChange('wellnessPrograms', newPrograms);
  };

  const addOpeningHours = () => {
    const currentHours = formData.openingHours || [];
    const usedDays = currentHours.map(h => h.day);
    const availableDays = DAYS.filter(day => !usedDays.includes(day));
    
    if (availableDays.length > 0) {
      const newHour = {
        day: availableDays[0],
        openTime: '09:00',
        closeTime: '17:00'
      };
      
      handleInputChange('openingHours', [...currentHours, newHour]);
    }
  };

  const removeOpeningHours = (index: number) => {
    const currentHours = formData.openingHours || [];
    const newHours = currentHours.filter((_, i) => i !== index);
    handleInputChange('openingHours', newHours);
  };

const addCustomClosure = () => {
  // Get today's date in local timezone and format as YYYY-MM-DD
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;
  
  const newClosure = {
    date: todayString,
    reason: ''
  };

  const currentClosures = formData.customClosures || [];
  handleInputChange('customClosures', [...currentClosures, newClosure]);
};

  const removeCustomClosure = (index: number) => {
    const currentClosures = formData.customClosures || [];
    const newClosures = currentClosures.filter((_, i) => i !== index);
    handleInputChange('customClosures', newClosures);
  };

  const getLocalDateString = (date: any): string => {
  if (!date) return '';
  
  if (typeof date === 'string') {
    // If it's already a string, check if it's ISO format and extract date part
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    return date;
  }
  
  if (date instanceof Date) {
    // Get the local date in Turks and Caicos timezone (GMT-4)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return '';
};

// Handle closure date change - store as date string
const handleClosureDateChange = (index: number, dateString: string) => {
  // Store the date as a simple YYYY-MM-DD string
  handleInputChange(`customClosures.${index}.date`, dateString);
};

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.name?.trim()) {
    newErrors.name = 'Spa name is required';
  }

  if (!formData.description?.trim()) {
    newErrors.description = 'Description is required';
  }

  if (!formData.location?.trim()) {
    newErrors.location = 'Location is required';
  }

  if (!formData.island) {
    newErrors.island = 'Island selection is required';
  }

  // Make images optional for now to test basic data flow
  // if (!formData.images || formData.images.length === 0) {
  //   newErrors.images = 'At least one spa image is required';
  // }

  // Make opening hours optional for now to test basic data flow
  // if (!formData.openingHours || formData.openingHours.length === 0) {
  //   newErrors.openingHours = 'Operating hours are required';
  // }

  if (!formData.paymentOptions || formData.paymentOptions.length === 0) {
    newErrors.paymentOptions = 'At least one payment method is required';
  }

  console.log('Validation errors:', newErrors); // Debug log
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


const handleSubmit = () => {
  console.log('WellnessSpaForm handleSubmit called'); // Debug log
  console.log('Form data being validated:', formData); // Debug log
  
  if (validateForm()) {
    console.log('Validation passed, calling onNext with:', formData); // Debug log
    onNext(formData);
  } else {
    console.log('Validation failed, errors:', errors); // Debug log
  }
};

  const renderBasicInfo = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3>Spa Information</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Spa Name *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter spa name"
              className={errors.name ? styles.error : ''}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Spa Type *</label>
            <select
              value={formData.spaType || ''}
              onChange={(e) => handleInputChange('spaType', e.target.value)}
            >
              {SPA_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Description *</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your spa, philosophy, unique treatments..."
            rows={4}
            className={errors.description ? styles.error : ''}
          />
          {errors.description && <span className={styles.errorText}>{errors.description}</span>}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Island *</label>
            <select
              value={formData.island || ''}
              onChange={(e) => handleInputChange('island', e.target.value)}
              className={errors.island ? styles.error : ''}
            >
              <option value="">Select Island</option>
              {ISLANDS.map(island => (
                <option key={island} value={island}>{island}</option>
              ))}
            </select>
            {errors.island && <span className={styles.errorText}>{errors.island}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Location/Address *</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter spa address"
              className={errors.location ? styles.error : ''}
            />
            {errors.location && <span className={styles.errorText}>{errors.location}</span>}
          </div>
        </div>

        {/* Map Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4>Pin Your Location</h4>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={styles.toggleBtn}
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
          
          <p className={styles.sectionDescription}>
            Click on the map to drop a pin at your exact location (optional but recommended)
          </p>

          {showMap && (
            <div className={styles.mapSection}>
              <LocationMap 
                coordinates={formData.coordinates || { latitude: 0, longitude: 0 }}
                onLocationSelect={handleLocationSelect}
              />
              
              {formData.coordinates?.latitude && formData.coordinates?.longitude && (
                <div className={styles.coordinatesDisplay}>
                  <FontAwesomeIcon icon={faLocationDot} />
                  <span>
                    Location: {formData.coordinates.latitude.toFixed(6)}, {formData.coordinates.longitude.toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Minimum Age</label>
            <input
              type="number"
              value={formData.ageRestrictions?.minAge || ''}
              onChange={(e) => handleInputChange('ageRestrictions.minAge', Number(e.target.value))}
              placeholder="0"
              min="0"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Maximum Age (optional)</label>
            <input
              type="number"
              value={formData.ageRestrictions?.maxAge || ''}
              onChange={(e) => handleInputChange('ageRestrictions.maxAge', Number(e.target.value) || undefined)}
              placeholder="No limit"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Spa Images *</h3>
        
        <div className={styles.imageUploadArea}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            className={styles.fileInput}
            id="spa-images"
          />
          
          <label htmlFor="spa-images" className={styles.uploadLabel}>
            <FontAwesomeIcon icon={faUpload} />
            <span>Upload Spa Images</span>
            <small>Facilities, treatment rooms, relaxation areas (Max 5MB each)</small>
          </label>
        </div>

        {errors.images && <span className={styles.errorText}>{errors.images}</span>}

        {formData.images && formData.images.length > 0 && (
          <div className={styles.imageGrid}>
            {formData.images.map((image: any, index) => (
              <div key={index} className={styles.imageItem}>
                <img 
                  src={image.url instanceof File ? URL.createObjectURL(image.url) : image.url} 
                  alt={`Spa ${index + 1}`} 
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className={styles.removeBtn}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                {image.isMain && (
                  <div className={styles.primaryBadge}>Primary</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderServices = () => (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h3>Services & Treatments</h3>
        <button
          type="button"
          onClick={addService}
          className={styles.addBtn}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Service
        </button>
      </div>

      <p className={styles.sectionDescription}>
        Add the treatments and services offered at your spa
      </p>

      {formData.servicesOffered?.map((service, serviceIndex) => (
        <div key={serviceIndex} className={styles.serviceCard}>
          <div className={styles.cardHeader}>
            <h4>Service {serviceIndex + 1}</h4>
            <button
              type="button"
              onClick={() => removeService(serviceIndex)}
              className={styles.removeBtn}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Service Name *</label>
              <input
                type="text"
                value={service.name}
                onChange={(e) => handleInputChange(`servicesOffered.${serviceIndex}.name`, e.target.value)}
                placeholder="e.g., Swedish Massage, Facial Treatment"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Category *</label>
              <select
                value={service.category || ''}
                onChange={(e) => handleInputChange(`servicesOffered.${serviceIndex}.category`, e.target.value)}
              >
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={service.description || ''}
              onChange={(e) => handleInputChange(`servicesOffered.${serviceIndex}.description`, e.target.value)}
              placeholder="Describe the treatment, benefits, technique..."
              rows={3}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Duration (minutes) *</label>
              <input
                type="number"
                value={service.duration}
                onChange={(e) => handleInputChange(`servicesOffered.${serviceIndex}.duration`, Number(e.target.value))}
                placeholder="60"
                min="1"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Price *</label>
              <div className={styles.priceInput}>
                <span className={styles.currency}>$</span>
                <input
                  type="number"
                  value={service.price}
                  onChange={(e) => handleInputChange(`servicesOffered.${serviceIndex}.price`, Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Discounted Price</label>
            <div className={styles.priceInput}>
              <span className={styles.currency}>$</span>
              <input
                type="number"
                value={service.discountedPrice || ''}
                onChange={(e) => handleInputChange(`servicesOffered.${serviceIndex}.discountedPrice`, Number(e.target.value) || undefined)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Weekly Availability */}
          <div className={styles.subsection}>
            <h5>Weekly Availability</h5>
            {DAYS.map(day => (
              <div key={day} className={styles.dayAvailability}>
                <div className={styles.dayHeader}>
                  <span>{day}</span>
                  <button
                    type="button"
                    onClick={() => addTimeSlot(serviceIndex, day)}
                    className={styles.addTimeSlot}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Time Slot
                  </button>
                </div>

                {service.weeklyAvailability
                  .filter(a => a.day === day)
                  .map(dayAvail => 
                    dayAvail.timeSlots.map((slot, slotIndex) => (
                      <div key={slotIndex} className={styles.timeSlot}>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => {
                            slot.startTime = e.target.value;
                            handleInputChange('servicesOffered', [...(formData.servicesOffered || [])]);
                          }}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => {
                            slot.endTime = e.target.value;
                            handleInputChange('servicesOffered', [...(formData.servicesOffered || [])]);
                          }}
                        />
                        <input
                          type="number"
                          value={slot.maxBookings}
                          onChange={(e) => {
                            slot.maxBookings = Number(e.target.value);
                            handleInputChange('servicesOffered', [...(formData.servicesOffered || [])]);
                          }}
                          placeholder="Max bookings"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(serviceIndex, day, slotIndex)}
                          className={styles.removeBtn}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))
                  )}
              </div>
            ))}
          </div>

          {/* Date Exceptions */}
          <div className={styles.subsection}>
            <div className={styles.subsectionHeader}>
              <h5>Date Exceptions</h5>
              <button
                type="button"
                onClick={() => addDateException(serviceIndex)}
                className={styles.addBtn}
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Exception
              </button>
            </div>

            {service.dateExceptions.map((exception, exceptionIndex) => (
              <div key={exceptionIndex} className={styles.exceptionCard}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Date</label>
<input
  type="date"
  value={getLocalDateString(exception.date)}
  onChange={(e) => {
    exception.date = e.target.value;
    handleInputChange('servicesOffered', [...(formData.servicesOffered || [])]);
  }}
/>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Reason</label>
                    <input
                      type="text"
                      value={exception.reason || ''}
                      onChange={(e) => {
                        exception.reason = e.target.value;
                        handleInputChange('servicesOffered', [...(formData.servicesOffered || [])]);
                      }}
                      placeholder="e.g., Holiday, Training"
                    />
                  </div>

                  <label className={styles.switchLabel}>
                    <input
                      type="checkbox"
                      checked={exception.isAvailable}
                      onChange={(e) => {
                        exception.isAvailable = e.target.checked;
                        handleInputChange('servicesOffered', [...(formData.servicesOffered || [])]);
                      }}
                    />
                    <span className={styles.switch}></span>
                    <span>Available</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeDateException(serviceIndex, exceptionIndex)}
                    className={styles.removeBtn}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Service Images */}
          <div className={styles.subsection}>
            <h5>Service Images</h5>
            
            <div className={styles.imageUploadArea}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files, serviceIndex)}
                className={styles.fileInput}
                id={`service-images-${serviceIndex}`}
              />
              
              <label htmlFor={`service-images-${serviceIndex}`} className={styles.uploadLabel}>
                <FontAwesomeIcon icon={faCamera} />
                <span>Upload Service Images</span>
              </label>
            </div>

            {service.images && service.images.length > 0 && (
              <div className={styles.imageGrid}>
                {service.images.map((image: any, imageIndex) => (
                  <div key={imageIndex} className={styles.imageItem}>
                    <img 
                      src={image.url instanceof File ? URL.createObjectURL(image.url) : image.url} 
                      alt={`Service ${imageIndex + 1}`} 
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(imageIndex, serviceIndex)}
                      className={styles.removeBtn}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                    {image.isMain && (
                      <div className={styles.primaryBadge}>Primary</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {formData.servicesOffered && formData.servicesOffered.length === 0 && (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faSpa} />
          <p>No services added</p>
          <small>Add treatments and services offered at your spa</small>
        </div>
      )}
    </div>
  );

  const renderPrograms = () => (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h3>Wellness Programs</h3>
        <button
          type="button"
          onClick={addWellnessProgram}
          className={styles.addBtn}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Program
        </button>
      </div>

      <p className={styles.sectionDescription}>
        Create multi-day wellness packages and retreat programs (optional)
      </p>

      {formData.wellnessPrograms?.map((program, index) => (
        <div key={index} className={styles.programCard}>
          <div className={styles.cardHeader}>
            <h4>Program {index + 1}</h4>
            <button
              type="button"
              onClick={() => removeWellnessProgram(index)}
              className={styles.removeBtn}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.formGroup}>
            <label>Program Title *</label>
            <input
              type="text"
              value={program.title}
              onChange={(e) => handleInputChange(`wellnessPrograms.${index}.title`, e.target.value)}
              placeholder="e.g., 7-Day Detox Retreat, Stress Relief Package"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={program.description || ''}
              onChange={(e) => handleInputChange(`wellnessPrograms.${index}.description`, e.target.value)}
              placeholder="Describe the program, what's included, benefits..."
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Duration (days) *</label>
              <input
                type="number"
                value={program.durationDays}
                onChange={(e) => handleInputChange(`wellnessPrograms.${index}.durationDays`, Number(e.target.value))}
                placeholder="7"
                min="1"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Total Price *</label>
              <div className={styles.priceInput}>
                <span className={styles.currency}>$</span>
                <input
                  type="number"
                  value={program.price}
                  onChange={(e) => handleInputChange(`wellnessPrograms.${index}.price`, Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {formData.wellnessPrograms && formData.wellnessPrograms.length === 0 && (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faLeaf} />
          <p>No wellness programs added</p>
          <small>Create packages for multi-day wellness experiences</small>
        </div>
      )}
    </div>
  );

  const renderOperations = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Opening Hours *</h3>
          <button
            type="button"
            onClick={addOpeningHours}
            className={styles.addBtn}
            disabled={(formData.openingHours || []).length >= 7}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Day
          </button>
        </div>

        {errors.openingHours && <span className={styles.errorText}>{errors.openingHours}</span>}

        {formData.openingHours?.map((hours, index) => (
          <div key={index} className={styles.hoursCard}>
            <div className={styles.hoursRow}>
              <div className={styles.formGroup}>
                <label>Day</label>
                <select
                  value={hours.day}
                  onChange={(e) => handleInputChange(`openingHours.${index}.day`, e.target.value)}
                >
                  {DAYS.filter(day => 
                    !formData.openingHours?.some((h, i) => h.day === day && i !== index)
                  ).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Open Time</label>
                <input
                  type="time"
                  value={hours.openTime}
                  onChange={(e) => handleInputChange(`openingHours.${index}.openTime`, e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Close Time</label>
                <input
                  type="time"
                  value={hours.closeTime}
                  onChange={(e) => handleInputChange(`openingHours.${index}.closeTime`, e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => removeOpeningHours(index)}
                className={styles.removeBtn}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h3>Payment Options *</h3>
        <p className={styles.sectionDescription}>Select all payment methods you accept</p>
        
        {errors.paymentOptions && <span className={styles.errorText}>{errors.paymentOptions}</span>}
        
        <div className={styles.paymentGrid}>
          {PAYMENT_OPTIONS.map(option => (
            <label key={option} className={styles.checkboxCard}>
              <input
                type="checkbox"
                checked={(formData.paymentOptions || []).includes(option as any)}
                onChange={() => togglePaymentOption(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Cancellation Policy</h3>
        <div className={styles.formGroup}>
          <label>Cancellation Policy</label>
          <textarea
            value={formData.cancellationPolicy || ''}
            onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
            placeholder="Describe your cancellation and refund policy..."
            rows={4}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Custom Closures</h3>
          <button
            type="button"
            onClick={addCustomClosure}
            className={styles.addBtn}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Closure
          </button>
        </div>

        <p className={styles.sectionDescription}>
          Add special dates when your spa will be closed (holidays, training, etc.)
        </p>

{formData.customClosures?.map((closure, index) => (
  <div key={index} className={styles.closureCard}>
    <div className={styles.formRow}>
      <div className={styles.formGroup}>
        <label>Date</label>
        <input
          type="date"
          value={getLocalDateString(closure.date)}
          onChange={(e) => handleClosureDateChange(index, e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Reason</label>
        <input
          type="text"
          value={closure.reason || ''}
          onChange={(e) => handleInputChange(`customClosures.${index}.reason`, e.target.value)}
          placeholder="e.g., Holiday, Staff Training"
        />
      </div>

      <button
        type="button"
        onClick={() => removeCustomClosure(index)}
        className={styles.removeBtn}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  </div>
))}
      </div>
    </div>
  );

  return (
    <div className={styles.serviceForm}>
      <div className={styles.formHeader}>
        <h2>Wellness Spa Details</h2>
        <p>Create your spa listing with services, treatments, and wellness programs</p>
      </div>

      <div className={styles.tabNavigation}>
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setCurrentTab(index)}
            className={`${styles.tabBtn} ${currentTab === index ? styles.active : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {currentTab === 0 && renderBasicInfo()}
      {currentTab === 1 && renderServices()}
      {currentTab === 2 && renderPrograms()}
      {currentTab === 3 && renderOperations()}

      <div className={styles.formActions}>
        <button type="button" onClick={onPrev} className={styles.prevBtn}>
          Previous
        </button>
        <button type="button" onClick={handleSubmit} className={styles.nextBtn}>
          Next
        </button>
      </div>
    </div>
  );
}