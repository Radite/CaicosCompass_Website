// forms/TransportationForm.tsx
"use client";

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faMinus, faUpload, faTimes, faCar,
  faShip, faPlane, faTaxi, faUsers, faMapMarkerAlt,
  faDollarSign, faGasPump, faCog, faShield, faRoute
} from '@fortawesome/free-solid-svg-icons';
import { Transportation, ListingFormProps } from '../../../types/listing';
import styles from './ServiceForms.module.css';

const TRANSPORTATION_CATEGORIES = [
  'Car Rental',
  'Jeep & 4x4 Rental',
  'Scooter & Moped Rental',
  'Taxi',
  'Airport Transfer',
  'Private VIP Transport',
  'Ferry',
  'Flight'
];

const PRICING_MODELS = [
  'flat',
  'per-mile',
  'per-hour',
  'per-day',
  'age-based',
  'per-flight',
  'per-trip'
];

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const TRANSMISSION_TYPES = ['Automatic', 'Manual'];
const INSURANCE_TYPES = ['Basic', 'Comprehensive', 'Premium'];
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Online Payment'];

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
  'Friday', 'Saturday', 'Sunday'
];

const ISLANDS = [
  'Providenciales',
  'Grand Turk',
  'North Caicos',
  'Middle Caicos',
  'South Caicos',
  'Salt Cay'
];

export default function TransportationForm({ onNext, onPrev, initialData }: ListingFormProps) {
  const [formData, setFormData] = useState<Partial<Transportation>>({
    serviceType: 'Transportation',
    name: '',
    description: '',
    location: '',
    island: '',
    coordinates: { latitude: 0, longitude: 0 },
    images: [],
    category: 'Car Rental',
    pricingModel: 'per-day',
    basePrice: 0,
    amenities: [],
    specialConditions: {
      noSmoking: false,
      petFriendly: true,
      validLicenseRequired: false,
      securityDepositRequired: false
    },
    availability: [],
    paymentOptions: {
      acceptedMethods: ['Cash', 'Credit Card']
    },
    options: [],
    locationsServed: [],
    cancellationPolicy: {
      refundable: true
    },
    contactDetails: {
      phone: ''
    },
    promotions: [],
    longTermDiscounts: [],
    ageBasedPricing: [],
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState(0);

  const tabs = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'pricing', label: 'Pricing & Options' },
    { key: 'vehicle', label: 'Vehicle Details' },
    { key: 'availability', label: 'Availability & Contact' }
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

  const handleImageUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    const currentImages = formData.images || [];
    const newImages = newFiles.map((file, index) => ({
      url: file as any,
      isMain: currentImages.length === 0 && index === 0
    }));
    
    handleInputChange('images', [...currentImages, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = (formData.images || []).filter((_, i) => i !== index);
    handleInputChange('images', newImages);
  };

  const togglePaymentMethod = (method: string) => {
    const currentMethods = formData.paymentOptions?.acceptedMethods || [];
    if (currentMethods.includes(method as any)) {
      const newMethods = currentMethods.filter(m => m !== method);
      handleInputChange('paymentOptions.acceptedMethods', newMethods);
    } else {
      handleInputChange('paymentOptions.acceptedMethods', [...currentMethods, method]);
    }
  };

  const addAmenity = () => {
    const currentAmenities = formData.amenities || [];
    handleInputChange('amenities', [...currentAmenities, '']);
  };

  const removeAmenity = (index: number) => {
    const currentAmenities = formData.amenities || [];
    const newAmenities = currentAmenities.filter((_, i) => i !== index);
    handleInputChange('amenities', newAmenities);
  };

  const addOption = () => {
    const newOption = {
      title: '',
      description: '',
      price: 0,
      capacity: 1
    };
    
    const currentOptions = formData.options || [];
    handleInputChange('options', [...currentOptions, newOption]);
  };

  const removeOption = (index: number) => {
    const currentOptions = formData.options || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    handleInputChange('options', newOptions);
  };

  const addInsuranceOption = () => {
    const newInsurance = {
      type: 'Basic' as const,
      price: 0
    };
    
    const currentOptions = formData.rentalDetails?.insuranceOptions || [];
    handleInputChange('rentalDetails.insuranceOptions', [...currentOptions, newInsurance]);
  };

  const removeInsuranceOption = (index: number) => {
    const currentOptions = formData.rentalDetails?.insuranceOptions || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    handleInputChange('rentalDetails.insuranceOptions', newOptions);
  };

  const addLongTermDiscount = () => {
    const newDiscount = {
      duration: 'weekly' as const,
      discountPercentage: 10
    };
    
    const currentDiscounts = formData.longTermDiscounts || [];
    handleInputChange('longTermDiscounts', [...currentDiscounts, newDiscount]);
  };

  const removeLongTermDiscount = (index: number) => {
    const currentDiscounts = formData.longTermDiscounts || [];
    const newDiscounts = currentDiscounts.filter((_, i) => i !== index);
    handleInputChange('longTermDiscounts', newDiscounts);
  };

  const addAvailability = () => {
    const newAvailability = {
      date: new Date(),
      startTime: '08:00',
      endTime: '18:00',
      isAvailable: true
    };
    
    const currentAvailability = formData.availability || [];
    handleInputChange('availability', [...currentAvailability, newAvailability]);
  };

  const removeAvailability = (index: number) => {
    const currentAvailability = formData.availability || [];
    const newAvailability = currentAvailability.filter((_, i) => i !== index);
    handleInputChange('availability', newAvailability);
  };

  const addLocationServed = () => {
    const newLocation = {
      locationName: '',
      coordinates: { latitude: 0, longitude: 0 }
    };
    
    const currentLocations = formData.locationsServed || [];
    handleInputChange('locationsServed', [...currentLocations, newLocation]);
  };

  const removeLocationServed = (index: number) => {
    const currentLocations = formData.locationsServed || [];
    const newLocations = currentLocations.filter((_, i) => i !== index);
    handleInputChange('locationsServed', newLocations);
  };

  const addFerrySchedule = () => {
    const newSchedule = {
      day: 'Monday',
      departureTime: '09:00',
      arrivalTime: '10:00'
    };
    
    const currentSchedule = formData.ferryDetails?.schedule || [];
    handleInputChange('ferryDetails.schedule', [...currentSchedule, newSchedule]);
  };

  const removeFerrySchedule = (index: number) => {
    const currentSchedule = formData.ferryDetails?.schedule || [];
    const newSchedule = currentSchedule.filter((_, i) => i !== index);
    handleInputChange('ferryDetails.schedule', newSchedule);
  };

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.name?.trim()) {
    newErrors.name = 'Service name is required';
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

  if (!formData.basePrice || formData.basePrice <= 0) {
    newErrors.basePrice = 'Valid base price is required';
  }

  // Make contact phone optional for now to test basic data flow
  // if (!formData.contactDetails?.phone?.trim()) {
  //   newErrors.phone = 'Contact phone number is required';
  // }

  // Make images optional for now to test basic data flow
  // if (!formData.images || formData.images.length === 0) {
  //   newErrors.images = 'At least one image is required';
  // }

  console.log('Validation errors:', newErrors); // Debug log
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = () => {
  console.log('TransportationForm handleSubmit called'); // Debug log
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
        <h3>Transportation Service Information</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Service Name *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter service name"
              className={errors.name ? styles.error : ''}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Category *</label>
            <select
              value={formData.category || ''}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              {TRANSPORTATION_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Description *</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your transportation service..."
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
            <label>Location/Base *</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Your business location"
              className={errors.location ? styles.error : ''}
            />
            {errors.location && <span className={styles.errorText}>{errors.location}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Capacity</label>
            <input
              type="number"
              value={formData.capacity || ''}
              onChange={(e) => handleInputChange('capacity', Number(e.target.value))}
              placeholder="Maximum passengers/cargo"
              min="1"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Minimum Age Requirement</label>
            <input
              type="number"
              value={formData.specialConditions?.minAgeRequirement || ''}
              onChange={(e) => handleInputChange('specialConditions.minAgeRequirement', Number(e.target.value) || undefined)}
              placeholder="18"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Special Conditions</h3>
        <div className={styles.conditionsGrid}>
          <label className={styles.switchLabel}>
            <input
              type="checkbox"
              checked={formData.specialConditions?.noSmoking || false}
              onChange={(e) => handleInputChange('specialConditions.noSmoking', e.target.checked)}
            />
            <span className={styles.switch}></span>
            <span>No Smoking</span>
          </label>

          <label className={styles.switchLabel}>
            <input
              type="checkbox"
              checked={formData.specialConditions?.petFriendly || false}
              onChange={(e) => handleInputChange('specialConditions.petFriendly', e.target.checked)}
            />
            <span className={styles.switch}></span>
            <span>Pet Friendly</span>
          </label>

          <label className={styles.switchLabel}>
            <input
              type="checkbox"
              checked={formData.specialConditions?.validLicenseRequired || false}
              onChange={(e) => handleInputChange('specialConditions.validLicenseRequired', e.target.checked)}
            />
            <span className={styles.switch}></span>
            <span>Valid License Required</span>
          </label>

          <label className={styles.switchLabel}>
            <input
              type="checkbox"
              checked={formData.specialConditions?.securityDepositRequired || false}
              onChange={(e) => handleInputChange('specialConditions.securityDepositRequired', e.target.checked)}
            />
            <span className={styles.switch}></span>
            <span>Security Deposit Required</span>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Amenities & Features</h3>
          <button
            type="button"
            onClick={addAmenity}
            className={styles.addBtn}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Amenity
          </button>
        </div>

        {formData.amenities?.map((amenity, index) => (
          <div key={index} className={styles.amenityItem}>
            <input
              type="text"
              value={amenity}
              onChange={(e) => {
                const newAmenities = [...(formData.amenities || [])];
                newAmenities[index] = e.target.value;
                handleInputChange('amenities', newAmenities);
              }}
              placeholder="e.g., Air Conditioning, GPS, Child Seats"
            />
            <button
              type="button"
              onClick={() => removeAmenity(index)}
              className={styles.removeBtn}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h3>Service Images *</h3>
        
        <div className={styles.imageUploadArea}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            className={styles.fileInput}
            id="service-images"
          />
          
          <label htmlFor="service-images" className={styles.uploadLabel}>
            <FontAwesomeIcon icon={faUpload} />
            <span>Upload Service Images</span>
            <small>Vehicles, facilities, team (Max 5MB each)</small>
          </label>
        </div>

        {errors.images && <span className={styles.errorText}>{errors.images}</span>}

        {formData.images && formData.images.length > 0 && (
          <div className={styles.imageGrid}>
            {formData.images.map((image: any, index) => (
              <div key={index} className={styles.imageItem}>
                <img 
                  src={image.url instanceof File ? URL.createObjectURL(image.url) : image.url} 
                  alt={`Service ${index + 1}`} 
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

  const renderPricing = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3>Pricing Model</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Pricing Model *</label>
            <select
              value={formData.pricingModel || ''}
              onChange={(e) => handleInputChange('pricingModel', e.target.value)}
            >
              {PRICING_MODELS.map(model => (
                <option key={model} value={model}>
                  {model.replace('-', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Base Price *</label>
            <div className={styles.priceInput}>
              <span className={styles.currency}>$</span>
              <input
                type="number"
                value={formData.basePrice || ''}
                onChange={(e) => handleInputChange('basePrice', Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={errors.basePrice ? styles.error : ''}
              />
            </div>
            {errors.basePrice && <span className={styles.errorText}>{errors.basePrice}</span>}
          </div>
        </div>

        {/* Conditional pricing fields based on model */}
        {formData.pricingModel === 'flat' && (
          <div className={styles.formGroup}>
            <label>Flat Rate Price</label>
            <div className={styles.priceInput}>
              <span className={styles.currency}>$</span>
              <input
                type="number"
                value={formData.flatPrice || ''}
                onChange={(e) => handleInputChange('flatPrice', Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}

        {formData.pricingModel === 'per-mile' && (
          <div className={styles.formGroup}>
            <label>Price per Mile</label>
            <div className={styles.priceInput}>
              <span className={styles.currency}>$</span>
              <input
                type="number"
                value={formData.perMilePrice || ''}
                onChange={(e) => handleInputChange('perMilePrice', Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}

        {formData.pricingModel === 'per-hour' && (
          <div className={styles.formGroup}>
            <label>Price per Hour</label>
            <div className={styles.priceInput}>
              <span className={styles.currency}>$</span>
              <input
                type="number"
                value={formData.perHourPrice || ''}
                onChange={(e) => handleInputChange('perHourPrice', Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}

        {formData.pricingModel === 'per-day' && (
          <div className={styles.formGroup}>
            <label>Price per Day</label>
            <div className={styles.priceInput}>
              <span className={styles.currency}>$</span>
              <input
                type="number"
                value={formData.perDayPrice || ''}
                onChange={(e) => handleInputChange('perDayPrice', Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Long-term Discounts</h3>
          <button
            type="button"
            onClick={addLongTermDiscount}
            className={styles.addBtn}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Discount
          </button>
        </div>

        {formData.longTermDiscounts?.map((discount, index) => (
          <div key={index} className={styles.discountCard}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Duration</label>
                <select
                  value={discount.duration}
                  onChange={(e) => handleInputChange(`longTermDiscounts.${index}.duration`, e.target.value)}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Discount %</label>
                <input
                  type="number"
                  value={discount.discountPercentage}
                  onChange={(e) => handleInputChange(`longTermDiscounts.${index}.discountPercentage`, Number(e.target.value))}
                  placeholder="10"
                  min="0"
                  max="100"
                />
              </div>

              <button
                type="button"
                onClick={() => removeLongTermDiscount(index)}
                className={styles.removeBtn}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Service Options</h3>
          <button
            type="button"
            onClick={addOption}
            className={styles.addBtn}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Option
          </button>
        </div>

        {formData.options?.map((option, index) => (
          <div key={index} className={styles.optionCard}>
            <div className={styles.cardHeader}>
              <h4>Option {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeOption(index)}
                className={styles.removeBtn}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  value={option.title}
                  onChange={(e) => handleInputChange(`options.${index}.title`, e.target.value)}
                  placeholder="e.g., Economy Car, VIP Transfer"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Price</label>
                <div className={styles.priceInput}>
                  <span className={styles.currency}>$</span>
                  <input
                    type="number"
                    value={option.price || ''}
                    onChange={(e) => handleInputChange(`options.${index}.price`, Number(e.target.value))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Capacity</label>
                <input
                  type="number"
                  value={option.capacity || ''}
                  onChange={(e) => handleInputChange(`options.${index}.capacity`, Number(e.target.value))}
                  placeholder="Passengers/cargo capacity"
                  min="1"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={option.description || ''}
                onChange={(e) => handleInputChange(`options.${index}.description`, e.target.value)}
                placeholder="Describe this option..."
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h3>Payment Methods *</h3>
        <div className={styles.paymentGrid}>
          {PAYMENT_METHODS.map(method => (
            <label key={method} className={styles.checkboxCard}>
              <input
                type="checkbox"
                checked={(formData.paymentOptions?.acceptedMethods || []).includes(method as any)}
                onChange={() => togglePaymentMethod(method)}
              />
              <span>{method}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVehicleDetails = () => (
    <div className={styles.tabContent}>
      {(formData.category?.includes('Rental') || formData.category === 'Taxi' || formData.category?.includes('Transport')) && (
        <div className={styles.section}>
          <h3>Vehicle Details</h3>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Make</label>
              <input
                type="text"
                value={formData.rentalDetails?.make || ''}
                onChange={(e) => handleInputChange('rentalDetails.make', e.target.value)}
                placeholder="e.g., Toyota, Honda"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Model</label>
              <input
                type="text"
                value={formData.rentalDetails?.model || ''}
                onChange={(e) => handleInputChange('rentalDetails.model', e.target.value)}
                placeholder="e.g., Camry, Civic"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Year</label>
              <input
                type="number"
                value={formData.rentalDetails?.year || ''}
                onChange={(e) => handleInputChange('rentalDetails.year', Number(e.target.value))}
                placeholder="2023"
                min="1990"
                max="2030"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Fuel Type</label>
              <select
                value={formData.rentalDetails?.fuelType || ''}
                onChange={(e) => handleInputChange('rentalDetails.fuelType', e.target.value)}
              >
                <option value="">Select Fuel Type</option>
                {FUEL_TYPES.map(fuel => (
                  <option key={fuel} value={fuel}>{fuel}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Transmission</label>
              <select
                value={formData.rentalDetails?.transmission || ''}
                onChange={(e) => handleInputChange('rentalDetails.transmission', e.target.value)}
              >
                <option value="">Select Transmission</option>
                {TRANSMISSION_TYPES.map(trans => (
                  <option key={trans} value={trans}>{trans}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Daily Mileage Limit</label>
              <input
                type="number"
                value={formData.rentalDetails?.dailyMileageLimit || ''}
                onChange={(e) => handleInputChange('rentalDetails.dailyMileageLimit', Number(e.target.value))}
                placeholder="Unlimited = 0"
                min="0"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Excess Mileage Charge</label>
              <div className={styles.priceInput}>
                <span className={styles.currency}>$</span>
                <input
                  type="number"
                  value={formData.rentalDetails?.excessMileageCharge || ''}
                  onChange={(e) => handleInputChange('rentalDetails.excessMileageCharge', Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Insurance Included</label>
              <label className={styles.switchLabel}>
                <input
                  type="checkbox"
                  checked={formData.rentalDetails?.insuranceIncluded || false}
                  onChange={(e) => handleInputChange('rentalDetails.insuranceIncluded', e.target.checked)}
                />
                <span className={styles.switch}></span>
                <span>Basic insurance included</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {formData.rentalDetails?.insuranceIncluded === false && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Insurance Options</h3>
            <button
              type="button"
              onClick={addInsuranceOption}
              className={styles.addBtn}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Insurance
            </button>
          </div>

          {formData.rentalDetails?.insuranceOptions?.map((insurance, index) => (
            <div key={index} className={styles.insuranceCard}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Type</label>
                  <select
                    value={insurance.type}
                    onChange={(e) => handleInputChange(`rentalDetails.insuranceOptions.${index}.type`, e.target.value)}
                  >
                    {INSURANCE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Price per Day</label>
                  <div className={styles.priceInput}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      value={insurance.price}
                      onChange={(e) => handleInputChange(`rentalDetails.insuranceOptions.${index}.price`, Number(e.target.value))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeInsuranceOption(index)}
                  className={styles.removeBtn}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formData.category === 'Ferry' && (
        <div className={styles.section}>
          <h3>Ferry Details</h3>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Departure Location</label>
              <input
                type="text"
                value={formData.ferryDetails?.departureLocation || ''}
                onChange={(e) => handleInputChange('ferryDetails.departureLocation', e.target.value)}
                placeholder="e.g., Providenciales Marina"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Arrival Location</label>
              <input
                type="text"
                value={formData.ferryDetails?.arrivalLocation || ''}
                onChange={(e) => handleInputChange('ferryDetails.arrivalLocation', e.target.value)}
                placeholder="e.g., North Caicos Ferry Terminal"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Journey Duration</label>
            <input
              type="text"
              value={formData.ferryDetails?.duration || ''}
              onChange={(e) => handleInputChange('ferryDetails.duration', e.target.value)}
              placeholder="e.g., 30 minutes"
            />
          </div>

          <div className={styles.subsection}>
            <div className={styles.subsectionHeader}>
              <h4>Ferry Schedule</h4>
              <button
                type="button"
                onClick={addFerrySchedule}
                className={styles.addBtn}
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Schedule
              </button>
            </div>

            {formData.ferryDetails?.schedule?.map((schedule, index) => (
              <div key={index} className={styles.scheduleCard}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Day</label>
                    <select
                      value={schedule.day}
                      onChange={(e) => handleInputChange(`ferryDetails.schedule.${index}.day`, e.target.value)}
                    >
                      {DAYS.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Departure</label>
                    <input
                      type="time"
                      value={schedule.departureTime || ''}
                      onChange={(e) => handleInputChange(`ferryDetails.schedule.${index}.departureTime`, e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Arrival</label>
                    <input
                      type="time"
                      value={schedule.arrivalTime || ''}
                      onChange={(e) => handleInputChange(`ferryDetails.schedule.${index}.arrivalTime`, e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFerrySchedule(index)}
                    className={styles.removeBtn}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(formData.category === 'Taxi' || formData.category?.includes('Transfer') || formData.category?.includes('VIP')) && (
        <div className={styles.section}>
          <h3>Driver Details</h3>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Driver Name</label>
              <input
                type="text"
                value={formData.driverDetails?.name || ''}
                onChange={(e) => handleInputChange('driverDetails.name', e.target.value)}
                placeholder="Driver's full name"
              />
            </div>

            <div className={styles.formGroup}>
              <label>License Number</label>
              <input
                type="text"
                value={formData.driverDetails?.licenseNumber || ''}
                onChange={(e) => handleInputChange('driverDetails.licenseNumber', e.target.value)}
                placeholder="Driver's license number"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Experience (years)</label>
              <input
                type="number"
                value={formData.driverDetails?.experience || ''}
                onChange={(e) => handleInputChange('driverDetails.experience', Number(e.target.value))}
                placeholder="Years of driving experience"
                min="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Vehicle Assigned</label>
              <input
                type="text"
                value={formData.driverDetails?.vehicleAssigned || ''}
                onChange={(e) => handleInputChange('driverDetails.vehicleAssigned', e.target.value)}
                placeholder="Vehicle make/model/license"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAvailability = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Availability</h3>
          <button
            type="button"
            onClick={addAvailability}
            className={styles.addBtn}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Available Period
          </button>
        </div>

        {formData.availability?.map((avail, index) => (
          <div key={index} className={styles.availabilityCard}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input
                  type="date"
                  value={avail.date instanceof Date ? avail.date.toISOString().split('T')[0] : avail.date}
                  onChange={(e) => handleInputChange(`availability.${index}.date`, new Date(e.target.value))}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Start Time</label>
                <input
                  type="time"
                  value={avail.startTime}
                  onChange={(e) => handleInputChange(`availability.${index}.startTime`, e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>End Time</label>
                <input
                  type="time"
                  value={avail.endTime}
                  onChange={(e) => handleInputChange(`availability.${index}.endTime`, e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => removeAvailability(index)}
                className={styles.removeBtn}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Locations Served</h3>
          <button
            type="button"
            onClick={addLocationServed}
            className={styles.addBtn}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Location
          </button>
        </div>

        {formData.locationsServed?.map((location, index) => (
          <div key={index} className={styles.locationCard}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Location Name</label>
                <input
                  type="text"
                  value={location.locationName || ''}
                  onChange={(e) => handleInputChange(`locationsServed.${index}.locationName`, e.target.value)}
                  placeholder="e.g., Airport, Hotels, Beaches"
                />
              </div>

              <button
                type="button"
                onClick={() => removeLocationServed(index)}
                className={styles.removeBtn}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h3>Contact Information *</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Phone Number *</label>
            <input
              type="tel"
              value={formData.contactDetails?.phone || ''}
              onChange={(e) => handleInputChange('contactDetails.phone', e.target.value)}
              placeholder="+1 (649) 123-4567"
              className={errors.phone ? styles.error : ''}
            />
            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={formData.contactDetails?.email || ''}
              onChange={(e) => handleInputChange('contactDetails.email', e.target.value)}
              placeholder="contact@yourservice.com"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Website</label>
          <input
            type="url"
            value={formData.contactDetails?.website || ''}
            onChange={(e) => handleInputChange('contactDetails.website', e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3>Cancellation Policy</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Refundable</label>
            <label className={styles.switchLabel}>
              <input
                type="checkbox"
                checked={formData.cancellationPolicy?.refundable || false}
                onChange={(e) => handleInputChange('cancellationPolicy.refundable', e.target.checked)}
              />
              <span className={styles.switch}></span>
              <span>Bookings are refundable</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>Cancellation Fee</label>
            <div className={styles.priceInput}>
              <span className={styles.currency}>$</span>
              <input
                type="number"
                value={formData.cancellationPolicy?.cancellationFee || ''}
                onChange={(e) => handleInputChange('cancellationPolicy.cancellationFee', Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Advance Notice Required</label>
          <input
            type="text"
            value={formData.cancellationPolicy?.advanceNoticeRequired || ''}
            onChange={(e) => handleInputChange('cancellationPolicy.advanceNoticeRequired', e.target.value)}
            placeholder="e.g., 24 hours, 3 days"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.serviceForm}>
      <div className={styles.formHeader}>
        <h2>Transportation Service Details</h2>
        <p>Create your transportation listing with comprehensive service information</p>
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
      {currentTab === 1 && renderPricing()}
      {currentTab === 2 && renderVehicleDetails()}
      {currentTab === 3 && renderAvailability()}

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