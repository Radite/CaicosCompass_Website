// forms/StayForm.tsx
"use client";

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faMinus, faUpload, faTimes, faBed,
  faWifi, faSwimmingPool, faParking, faCar, faUtensils,
  faCamera, faDollarSign, faCalendarAlt, faHome,
  faMapMarkerAlt, faLocationDot, faStar
} from '@fortawesome/free-solid-svg-icons';
import { Stay, ListingFormProps } from '../../../types/listing';
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

const STAY_TYPES = ['Villa', 'Airbnb'];

const PROPERTY_TYPES = [
  'House',
  'Apartment',
  'Guesthouse',
  'Villa',
  'Condo',
  'Townhouse'
];

const CANCELLATION_POLICIES = [
  'Flexible',
  'Moderate',
  'Strict',
  'Non-refundable'
];

const ISLANDS = [
  'Providenciales',
  'Grand Turk',
  'North Caicos',
  'Middle Caicos',
  'South Caicos',
  'Salt Cay'
];

const AMENITY_GROUPS = {
  'Essential': [
    { key: 'wifi', label: 'WiFi', icon: faWifi },
    { key: 'kitchen', label: 'Kitchen', icon: faUtensils },
    { key: 'freeParking', label: 'Free Parking', icon: faParking },
    { key: 'ac', label: 'Air Conditioning', icon: null },
    { key: 'heating', label: 'Heating', icon: null },
    { key: 'tv', label: 'TV', icon: null }
  ],
  'Features': [
    { key: 'pool', label: 'Pool', icon: faSwimmingPool },
    { key: 'hotTub', label: 'Hot Tub', icon: null },
    { key: 'beachfront', label: 'Beachfront', icon: null },
    { key: 'gym', label: 'Gym', icon: null },
    { key: 'bbqGrill', label: 'BBQ Grill', icon: null },
    { key: 'indoorFireplace', label: 'Indoor Fireplace', icon: null },
    { key: 'oceanView', label: 'Ocean View', icon: null },
    { key: 'balcony', label: 'Balcony', icon: null }
  ],
  'Bedroom & Bathroom': [
    { key: 'kingBed', label: 'King Bed', icon: faBed },
    { key: 'hairDryer', label: 'Hair Dryer', icon: null },
    { key: 'iron', label: 'Iron', icon: null },
    { key: 'washer', label: 'Washer', icon: null },
    { key: 'dryer', label: 'Dryer', icon: null },
    { key: 'linens', label: 'Linens Provided', icon: null }
  ],
  'Family': [
    { key: 'crib', label: 'Crib', icon: null },
    { key: 'breakfast', label: 'Breakfast Included', icon: null },
    { key: 'highChair', label: 'High Chair', icon: null },
    { key: 'childSafe', label: 'Child Safe', icon: null }
  ],
  'Convenience': [
    { key: 'dedicatedWorkspace', label: 'Dedicated Workspace', icon: null },
    { key: 'evCharger', label: 'EV Charger', icon: faCar },
    { key: 'concierge', label: 'Concierge Service', icon: null },
    { key: 'housekeeping', label: 'Housekeeping', icon: null }
  ],
  'Safety': [
    { key: 'smokeAlarm', label: 'Smoke Alarm', icon: null },
    { key: 'carbonMonoxideAlarm', label: 'Carbon Monoxide Alarm', icon: null },
    { key: 'firstAidKit', label: 'First Aid Kit', icon: null },
    { key: 'securitySystem', label: 'Security System', icon: null }
  ]
};

export default function StayForm({ onNext, onPrev, initialData }: ListingFormProps) {
  const [formData, setFormData] = useState<Partial<Stay>>({
    serviceType: 'Stay',
    name: '',
    description: '',
    location: '',
    island: '',
    coordinates: { latitude: 0, longitude: 0 },
    images: [],
    type: 'Villa',
    pricePerNight: 0,
    cleaningFee: 0,
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    unavailableDates: [],
    amenities: {
      hotTub: false, ac: false, pool: false, wifi: false, freeParking: false,
      beachfront: false, kitchen: false, washer: false, dryer: false, heating: false,
      dedicatedWorkspace: false, tv: false, hairDryer: false, iron: false,
      evCharger: false, crib: false, kingBed: false, gym: false, bbqGrill: false,
      breakfast: false, indoorFireplace: false, smokingAllowed: false,
      smokeAlarm: false, carbonMonoxideAlarm: false, oceanView: false,
      balcony: false, linens: false, highChair: false, childSafe: false,
      concierge: false, housekeeping: false, firstAidKit: false, securitySystem: false
    },
    bookingOptions: {
      instantBook: false,
      selfCheckIn: false,
      allowPets: false
    },
    tags: {
      isLuxe: false,
      isGuestFavorite: false
    },
    policies: {
      checkInTime: '15:00',
      checkOutTime: '10:00',
      cancellationPolicy: 'Moderate'
    },
    stayImages: [],
    addressDetails: {
      address: '',
      city: '',
      country: 'Turks and Caicos',
      coordinates: { latitude: 0, longitude: 0 }
    },
    discounts: {
      weekly: 0,
      monthly: 0,
      specials: []
    },
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState(0);
  const [showMap, setShowMap] = useState(false);

  const tabs = [
    { key: 'basic', label: 'Property Info' },
    { key: 'amenities', label: 'Amenities & Features' },
    { key: 'pricing', label: 'Pricing & Policies' },
    { key: 'images', label: 'Photos' }
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
    handleInputChange('addressDetails.coordinates', { latitude: lat, longitude: lng });
  }, []);

  // Helper functions for timezone-safe date handling
  const getLocalDateString = (date: any): string => {
    if (!date) return '';
    
    if (typeof date === 'string') {
      if (date.includes('T')) {
        return date.split('T')[0];
      }
      return date;
    }
    
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return '';
  };

  const createTCIDateString = (dateString: string): string => {
    // Create a date string in TCI timezone format
    return `${dateString}T00:00:00.000+00:00`;
  };

  const handleDateChange = (path: string, dateString: string) => {
    if (dateString) {
      const tciDateString = createTCIDateString(dateString);
      handleInputChange(path, tciDateString);
    } else {
      handleInputChange(path, '');
    }
  };

  // Function to set primary image
  const setPrimaryImage = (index: number) => {
    const currentImages = formData.images || [];
    const updatedImages = currentImages.map((image, i) => ({
      ...image,
      isMain: i === index
    }));
    handleInputChange('images', updatedImages);
  };

  const handleImageUpload = (files: FileList, isStayImages = false) => {
    const newFiles = Array.from(files);
    
    if (isStayImages) {
      const currentImages = formData.stayImages || [];
      const newImageUrls = newFiles.map(file => file as any);
      handleInputChange('stayImages', [...currentImages, ...newImageUrls]);
    } else {
      const currentImages = formData.images || [];
      const newImages = newFiles.map((file) => ({
        url: file as any,
        isMain: false // Don't automatically set as main - let user choose
      }));
      handleInputChange('images', [...currentImages, ...newImages]);
    }
  };

  const removeImage = (index: number, isStayImages = false) => {
    if (isStayImages) {
      const newImages = (formData.stayImages || []).filter((_, i) => i !== index);
      handleInputChange('stayImages', newImages);
    } else {
      const newImages = (formData.images || []).filter((_, i) => i !== index);
      handleInputChange('images', newImages);
    }
  };

  const toggleAmenity = (amenityKey: string) => {
    const currentValue = formData.amenities?.[amenityKey as keyof typeof formData.amenities];
    handleInputChange(`amenities.${amenityKey}`, !currentValue);
  };

  const addUnavailableDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    const newDate = {
      startDate: createTCIDateString(todayString),
      endDate: createTCIDateString(todayString)
    };
    
    const currentDates = formData.unavailableDates || [];
    handleInputChange('unavailableDates', [...currentDates, newDate]);
  };

  const removeUnavailableDate = (index: number) => {
    const currentDates = formData.unavailableDates || [];
    const newDates = currentDates.filter((_, i) => i !== index);
    handleInputChange('unavailableDates', newDates);
  };

  const addSpecialOffer = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    const newSpecial = {
      title: '',
      startDate: createTCIDateString(todayString),
      endDate: createTCIDateString(todayString),
      percentage: 10
    };
    
    const currentSpecials = formData.discounts?.specials || [];
    handleInputChange('discounts.specials', [...currentSpecials, newSpecial]);
  };

  const removeSpecialOffer = (index: number) => {
    const currentSpecials = formData.discounts?.specials || [];
    const newSpecials = currentSpecials.filter((_, i) => i !== index);
    handleInputChange('discounts.specials', newSpecials);
  };

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.name?.trim()) {
    newErrors.name = 'Property name is required';
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

  if (!formData.pricePerNight || formData.pricePerNight <= 0) {
    newErrors.pricePerNight = 'Valid price per night is required';
  }

  if (!formData.maxGuests || formData.maxGuests <= 0) {
    newErrors.maxGuests = 'Maximum guests must be at least 1';
  }

  if (formData.type === 'Airbnb' && !formData.propertyType) {
    newErrors.propertyType = 'Property type is required for Airbnb listings';
  }

  console.log('Validation errors:', newErrors);
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = () => {
  console.log('StayForm handleSubmit called');
  console.log('Form data being validated:', formData);
  
  if (validateForm()) {
    console.log('Validation passed, calling onNext with:', formData);
    onNext(formData);
  } else {
    console.log('Validation failed, errors:', errors);
  }
};

  const renderBasicInfo = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3>Property Information</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Property Name *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter property name"
              className={errors.name ? styles.error : ''}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Property Type *</label>
            <select
              value={formData.type || ''}
              onChange={(e) => handleInputChange('type', e.target.value)}
            >
              {STAY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {formData.type === 'Airbnb' && (
          <div className={styles.formGroup}>
            <label>Accommodation Type *</label>
            <select
              value={formData.propertyType || ''}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
              className={errors.propertyType ? styles.error : ''}
            >
              <option value="">Select Type</option>
              {PROPERTY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.propertyType && <span className={styles.errorText}>{errors.propertyType}</span>}
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Description *</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your property, location, unique features..."
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
            <label>General Location *</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Grace Bay, Downtown"
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
            <label>Full Address</label>
            <input
              type="text"
              value={formData.addressDetails?.address || ''}
              onChange={(e) => handleInputChange('addressDetails.address', e.target.value)}
              placeholder="Full street address (optional for public listing)"
              className={errors.address ? styles.error : ''}
            />
            {errors.address && <span className={styles.errorText}>{errors.address}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>City</label>
            <input
              type="text"
              value={formData.addressDetails?.city || ''}
              onChange={(e) => handleInputChange('addressDetails.city', e.target.value)}
              placeholder="City"
              className={errors.city ? styles.error : ''}
            />
            {errors.city && <span className={styles.errorText}>{errors.city}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>State/Province</label>
            <input
              type="text"
              value={formData.addressDetails?.state || ''}
              onChange={(e) => handleInputChange('addressDetails.state', e.target.value)}
              placeholder="State or Province"
            />
          </div>

          <div className={styles.formGroup}>
            <label>ZIP/Postal Code</label>
            <input
              type="text"
              value={formData.addressDetails?.zipCode || ''}
              onChange={(e) => handleInputChange('addressDetails.zipCode', e.target.value)}
              placeholder="ZIP or Postal Code"
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Property Details</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Maximum Guests *</label>
            <input
              type="number"
              value={formData.maxGuests || ''}
              onChange={(e) => handleInputChange('maxGuests', Number(e.target.value))}
              placeholder="1"
              min="1"
              max="50"
              className={errors.maxGuests ? styles.error : ''}
            />
            {errors.maxGuests && <span className={styles.errorText}>{errors.maxGuests}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Bedrooms *</label>
            <input
              type="number"
              value={formData.bedrooms || ''}
              onChange={(e) => handleInputChange('bedrooms', Number(e.target.value))}
              placeholder="1"
              min="0"
              max="20"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Bathrooms *</label>
            <input
              type="number"
              value={formData.bathrooms || ''}
              onChange={(e) => handleInputChange('bathrooms', Number(e.target.value))}
              placeholder="1"
              min="0.5"
              max="20"
              step="0.5"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Beds *</label>
            <input
              type="number"
              value={formData.beds || ''}
              onChange={(e) => handleInputChange('beds', Number(e.target.value))}
              placeholder="1"
              min="1"
              max="50"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAmenities = () => (
    <div className={styles.tabContent}>
      {Object.entries(AMENITY_GROUPS).map(([groupName, amenities]) => (
        <div key={groupName} className={styles.section}>
          <h3>{groupName}</h3>
          <div className={styles.amenityGrid}>
            {amenities.map(amenity => (
              <label key={amenity.key} className={styles.amenityCard}>
                <input
                  type="checkbox"
                  checked={formData.amenities?.[amenity.key as keyof typeof formData.amenities] || false}
                  onChange={() => toggleAmenity(amenity.key)}
                />
                {amenity.icon && <FontAwesomeIcon icon={amenity.icon} />}
                <span>{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.section}>
        <h3>Booking Options</h3>
        <div className={styles.bookingOptions}>
          <label className={styles.switchLabel}>
            <input
              type="checkbox"
              checked={formData.bookingOptions?.instantBook || false}
              onChange={(e) => handleInputChange('bookingOptions.instantBook', e.target.checked)}
            />
            <span className={styles.switch}></span>
            <div>
              <strong>Instant Book</strong>
              <small>Guests can book immediately without waiting for approval</small>
            </div>
          </label>

          <label className={styles.switchLabel}>
            <input
              type="checkbox"
              checked={formData.bookingOptions?.selfCheckIn || false}
              onChange={(e) => handleInputChange('bookingOptions.selfCheckIn', e.target.checked)}
            />
            <span className={styles.switch}></span>
            <div>
              <strong>Self Check-in</strong>
              <small>Guests can check in themselves (keybox, smart lock, etc.)</small>
            </div>
          </label>

          <label className={styles.switchLabel}>
            <input
              type="checkbox"
              checked={formData.bookingOptions?.allowPets || false}
              onChange={(e) => handleInputChange('bookingOptions.allowPets', e.target.checked)}
            />
            <span className={styles.switch}></span>
            <div>
              <strong>Allow Pets</strong>
              <small>Pets are welcome at this property</small>
            </div>
          </label>

          <label className={styles.switchLabel}>
            <input
              type="checkbox"
              checked={formData.amenities?.smokingAllowed || false}
              onChange={(e) => handleInputChange('amenities.smokingAllowed', e.target.checked)}
            />
            <span className={styles.switch}></span>
            <div>
              <strong>Smoking Allowed</strong>
              <small>Smoking is permitted at this property</small>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Property Tags</h3>
        <div className={styles.tagOptions}>
          <label className={styles.checkboxCard}>
            <input
              type="checkbox"
              checked={formData.tags?.isLuxe || false}
              onChange={(e) => handleInputChange('tags.isLuxe', e.target.checked)}
            />
            <div>
              <FontAwesomeIcon icon={faStar} style={{ color: '#ffd700', marginRight: '8px' }} />
              <strong>Luxe</strong>
              <small>Premium property with high-end amenities</small>
            </div>
          </label>

          <label className={styles.checkboxCard}>
            <input
              type="checkbox"
              checked={formData.tags?.isGuestFavorite || false}
              onChange={(e) => handleInputChange('tags.isGuestFavorite', e.target.checked)}
            />
            <div>
              <FontAwesomeIcon icon={faHome} style={{ color: '#28a745', marginRight: '8px' }} />
              <strong>Guest Favorite</strong>
              <small>Highly rated property loved by guests</small>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPricing = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3>Pricing</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Price per Night *</label>
            <div className={styles.priceInput}>
              <span className={styles.currency}>$</span>
              <input
                type="number"
                value={formData.pricePerNight || ''}
                onChange={(e) => handleInputChange('pricePerNight', Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={errors.pricePerNight ? styles.error : ''}
              />
            </div>
            {errors.pricePerNight && <span className={styles.errorText}>{errors.pricePerNight}</span>}
            <small className={styles.helpText}>Base nightly rate before taxes and fees</small>
          </div>

          <div className={styles.formGroup}>
            <label>Cleaning Fee</label>
            <div className={styles.priceInput}>
              <span className={styles.currency}>$</span>
              <input
                type="number"
                value={formData.cleaningFee || ''}
                onChange={(e) => handleInputChange('cleaningFee', Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <small className={styles.helpText}>One-time cleaning fee charged per stay</small>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Weekly Discount (%)</label>
            <input
              type="number"
              value={formData.discounts?.weekly || ''}
              onChange={(e) => handleInputChange('discounts.weekly', Number(e.target.value))}
              placeholder="0"
              min="0"
              max="100"
            />
            <small className={styles.helpText}>Discount for stays of 7+ nights</small>
          </div>

          <div className={styles.formGroup}>
            <label>Monthly Discount (%)</label>
            <input
              type="number"
              value={formData.discounts?.monthly || ''}
              onChange={(e) => handleInputChange('discounts.monthly', Number(e.target.value))}
              placeholder="0"
              min="0"
              max="100"
            />
            <small className={styles.helpText}>Discount for stays of 28+ nights</small>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Special Offers</h3>
          <button
            type="button"
            onClick={addSpecialOffer}
            className={styles.addBtn}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Special Offer
          </button>
        </div>

        <p className={styles.sectionDescription}>
          Create limited-time offers to attract guests during specific periods
        </p>

        {formData.discounts?.specials?.map((special, index) => (
          <div key={index} className={styles.specialCard}>
            <div className={styles.cardHeader}>
              <h4>Special Offer {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeSpecialOffer(index)}
                className={styles.removeBtn}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.formGroup}>
              <label>Offer Title</label>
              <input
                type="text"
                value={special.title || ''}
                onChange={(e) => handleInputChange(`discounts.specials.${index}.title`, e.target.value)}
                placeholder="e.g., Summer Special, Early Bird Discount"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={getLocalDateString(special.startDate)}
                  onChange={(e) => handleDateChange(`discounts.specials.${index}.startDate`, e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>End Date</label>
                <input
                  type="date"
                  value={getLocalDateString(special.endDate)}
                  onChange={(e) => handleDateChange(`discounts.specials.${index}.endDate`, e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Discount Percentage</label>
              <input
                type="number"
                value={special.percentage}
                onChange={(e) => handleInputChange(`discounts.specials.${index}.percentage`, Number(e.target.value))}
                placeholder="10"
                min="0"
                max="100"
              />
            </div>
          </div>
        ))}

        {(!formData.discounts?.specials || formData.discounts.specials.length === 0) && (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faDollarSign} />
            <p>No special offers created</p>
            <small>Add seasonal discounts or promotional rates</small>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3>Check-in & Check-out Policies</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Check-in Time</label>
            <input
              type="time"
              value={formData.policies?.checkInTime || ''}
              onChange={(e) => handleInputChange('policies.checkInTime', e.target.value)}
            />
            <small className={styles.helpText}>Earliest time guests can check in</small>
          </div>

          <div className={styles.formGroup}>
            <label>Check-out Time</label>
            <input
              type="time"
              value={formData.policies?.checkOutTime || ''}
              onChange={(e) => handleInputChange('policies.checkOutTime', e.target.value)}
            />
            <small className={styles.helpText}>Latest time guests must check out</small>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Cancellation Policy</label>
          <select
            value={formData.policies?.cancellationPolicy || ''}
            onChange={(e) => handleInputChange('policies.cancellationPolicy', e.target.value)}
          >
            {CANCELLATION_POLICIES.map(policy => (
              <option key={policy} value={policy}>{policy}</option>
            ))}
          </select>
          <small className={styles.helpText}>
            {formData.policies?.cancellationPolicy === 'Flexible' && 'Full refund 1 day prior to arrival'}
            {formData.policies?.cancellationPolicy === 'Moderate' && 'Full refund 5 days prior to arrival'}
            {formData.policies?.cancellationPolicy === 'Strict' && 'Full refund 14 days prior to arrival'}
            {formData.policies?.cancellationPolicy === 'Non-refundable' && 'No refunds after booking'}
          </small>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Unavailable Dates</h3>
          <button
            type="button"
            onClick={addUnavailableDate}
            className={styles.addBtn}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Unavailable Period
          </button>
        </div>

        <p className={styles.sectionDescription}>
          Block dates when your property is not available for booking (maintenance, personal use, etc.)
        </p>

        {formData.unavailableDates?.map((period, index) => (
          <div key={index} className={styles.dateCard}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={getLocalDateString(period.startDate)}
                  onChange={(e) => handleDateChange(`unavailableDates.${index}.startDate`, e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>End Date</label>
                <input
                  type="date"
                  value={getLocalDateString(period.endDate)}
                  onChange={(e) => handleDateChange(`unavailableDates.${index}.endDate`, e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => removeUnavailableDate(index)}
                className={styles.removeBtn}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        ))}

        {(!formData.unavailableDates || formData.unavailableDates.length === 0) && (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faCalendarAlt} />
            <p>No blocked dates</p>
            <small>Your property is available year-round</small>
          </div>
        )}
      </div>
    </div>
  );

  const renderImages = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3>Main Property Images *</h3>
        
        <div className={styles.imageUploadArea}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            className={styles.fileInput}
            id="property-images"
          />
          
          <label htmlFor="property-images" className={styles.uploadLabel}>
            <FontAwesomeIcon icon={faUpload} />
            <span>Upload Property Images</span>
            <small>Exterior, key rooms, views (Max 5MB each)</small>
          </label>
        </div>

        {errors.images && <span className={styles.errorText}>{errors.images}</span>}

        {formData.images && formData.images.length > 0 && (
          <>
            <p className={styles.sectionDescription}>
              Click "Set as Primary" to choose your main property image
            </p>
            <div className={styles.imageGrid}>
              {formData.images.map((image: any, index) => (
                <div key={index} className={styles.imageItem}>
                  <img 
                    src={image.url instanceof File ? URL.createObjectURL(image.url) : image.url} 
                    alt={`Property ${index + 1}`} 
                  />
                  
                  <div className={styles.imageActions}>
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className={`${styles.primaryBtn} ${image.isMain ? styles.isPrimary : ''}`}
                      title={image.isMain ? "Primary Image" : "Set as Primary"}
                    >
                      <FontAwesomeIcon icon={image.isMain ? faHome : faCamera} />
                      {image.isMain ? "Primary" : "Set Primary"}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeBtn}
                      title="Remove Image"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  
                  {image.isMain && (
                    <div className={styles.primaryBadge}>Primary Photo</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.section}>
        <h3>Additional Images</h3>
        <p className={styles.sectionDescription}>
          Additional interior photos, amenities, local area, special features
        </p>
        
        <div className={styles.imageUploadArea}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files, true)}
            className={styles.fileInput}
            id="stay-images"
          />
          
          <label htmlFor="stay-images" className={styles.uploadLabel}>
            <FontAwesomeIcon icon={faCamera} />
            <span>Upload Additional Images</span>
            <small>Bedrooms, bathrooms, amenities, views</small>
          </label>
        </div>

        {formData.stayImages && formData.stayImages.length > 0 && (
          <div className={styles.imageGrid}>
            {formData.stayImages.map((image: any, index) => (
              <div key={index} className={styles.imageItem}>
                <img 
                  src={image instanceof File ? URL.createObjectURL(image) : image} 
                  alt={`Additional ${index + 1}`} 
                />
                <button
                  type="button"
                  onClick={() => removeImage(index, true)}
                  className={styles.removeBtn}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
          </div>
        )}

        {(!formData.stayImages || formData.stayImages.length === 0) && (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faCamera} />
            <p>No additional images uploaded</p>
            <small>Show off your property's best features</small>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3>Photography Tips</h3>
        <div className={styles.tipsList}>
          <div className={styles.tip}>
            <FontAwesomeIcon icon={faCamera} className={styles.tipIcon} />
            <div>
              <strong>Lighting:</strong> Take photos during the day with natural light for best results
            </div>
          </div>
          <div className={styles.tip}>
            <FontAwesomeIcon icon={faHome} className={styles.tipIcon} />
            <div>
              <strong>Angles:</strong> Show the full room from corners to capture the space properly
            </div>
          </div>
          <div className={styles.tip}>
            <FontAwesomeIcon icon={faBed} className={styles.tipIcon} />
            <div>
              <strong>Details:</strong> Include close-ups of amenities, beds, and special features
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.serviceForm}>
      <div className={styles.formHeader}>
        <h2>Property Details</h2>
        <p>Create your accommodation listing with complete property information</p>
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
      {currentTab === 1 && renderAmenities()}
      {currentTab === 2 && renderPricing()}
      {currentTab === 3 && renderImages()}

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