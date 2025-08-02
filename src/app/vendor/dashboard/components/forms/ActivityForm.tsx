// forms/ActivityForm.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faMinus, faUpload, faTimes, faMapMarkerAlt,
  faClock, faUsers, faCamera, faExclamationTriangle,
  faLocationDot, faStar, faCalendarTimes
} from '@fortawesome/free-solid-svg-icons';
import { Activity, ListingFormProps } from '../../../types/listing';
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

const ACTIVITY_CATEGORIES = [
  'Excursion',
  'Nature Trails', 
  'Museums',
  'Water Sports',
  'Shopping',
  'Cultural Site',
  'Adventure',
  'Wildlife',
  'Historical',
  'Food & Drink'
];

const PRICING_TYPES = [
  'per hour',
  'per person', 
  'per trip',
  'per day',
  'per group',
  'varies'
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

const DIFFICULTY_LEVELS = [
  'Easy',
  'Moderate',
  'Challenging',
  'Expert'
];

export default function ActivityForm({ onNext, onPrev, initialData }: ListingFormProps) {
  const [formData, setFormData] = useState<Partial<Activity>>({
    serviceType: 'activities',
    name: '',
    description: '',
    location: '',
    island: '',
    coordinates: { latitude: 0, longitude: 0 },
    images: [],
    price: 0,
    pricingType: 'per person',
    category: 'Excursion',
    ageRestrictions: { minAge: 0 },
    options: [],
    waivers: [],
    cancellationPolicy: '',
    difficultyLevel: 'Easy',
    duration: 60,
    maxGroupSize: 10,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState(0);
  const [showMap, setShowMap] = useState(false);

  const tabs = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'options', label: 'Activity Options' },
    { key: 'policies', label: 'Policies & Rules' }
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

  // Function to set primary image for main activity or specific option
  const setPrimaryImage = (index: number, optionIndex?: number) => {
    if (optionIndex !== undefined) {
      // For option images
      const currentImages = formData.options?.[optionIndex]?.images || [];
      const updatedImages = currentImages.map((image, i) => ({
        ...image,
        isMain: i === index
      }));
      handleInputChange(`options.${optionIndex}.images`, updatedImages);
    } else {
      // For main activity images
      const currentImages = formData.images || [];
      const updatedImages = currentImages.map((image, i) => ({
        ...image,
        isMain: i === index
      }));
      handleInputChange('images', updatedImages);
    }
  };

  const handleImageUpload = (files: FileList, path?: string) => {
    const newFiles = Array.from(files);
    if (path) {
      // For option-specific images
      const optionIndex = parseInt(path.split('.')[1]);
      const currentImages = formData.options?.[optionIndex]?.images || [];
      const newImages = newFiles.map((file) => ({
        url: file as any,
        isMain: false // Don't automatically set as main - let user choose
      }));
      
      handleInputChange(`options.${optionIndex}.images`, [...currentImages, ...newImages]);
    } else {
      // For main activity images
      const currentImages = formData.images || [];
      const newImages = newFiles.map((file) => ({
        url: file as any,
        isMain: false // Don't automatically set as main - let user choose
      }));
      
      handleInputChange('images', [...currentImages, ...newImages]);
    }
  };

  const removeImage = (index: number, path?: string) => {
    if (path) {
      const optionIndex = parseInt(path.split('.')[1]);
      const currentImages = formData.options?.[optionIndex]?.images || [];
      const newImages = currentImages.filter((_, i) => i !== index);
      handleInputChange(`options.${optionIndex}.images`, newImages);
    } else {
      const newImages = (formData.images || []).filter((_, i) => i !== index);
      handleInputChange('images', newImages);
    }
  };

  const addOption = () => {
    const newOption = {
      title: '',
      cost: 0,
      pricingType: 'per person' as const,
      description: '',
      location: '',
      maxPeople: 1,
      duration: 60,
      availability: [],
      unavailableTimeSlots: [],
      customUnavailableDates: [],
      equipmentRequirements: [],
      images: [],
      difficultyLevel: 'Easy'
    };

    const currentOptions = formData.options || [];
    handleInputChange('options', [...currentOptions, newOption]);
  };

  const removeOption = (index: number) => {
    const currentOptions = formData.options || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    handleInputChange('options', newOptions);
  };

  const addTimeSlot = (optionIndex: number, day: string) => {
    const option = formData.options?.[optionIndex];
    if (!option) return;

    const dayAvailability = option.availability.find(a => a.day === day);
    if (dayAvailability) {
      const newTimeSlot = {
        startTime: '09:00',
        endTime: '10:00',
        maxPeople: option.maxPeople
      };
      dayAvailability.timeSlots.push(newTimeSlot);
    } else {
      option.availability.push({
        day,
        timeSlots: [{
          startTime: '09:00',
          endTime: '10:00',
          maxPeople: option.maxPeople
        }]
      });
    }

    handleInputChange('options', [...(formData.options || [])]);
  };

  const removeTimeSlot = (optionIndex: number, day: string, slotIndex: number) => {
    const option = formData.options?.[optionIndex];
    if (!option) return;

    const dayAvailability = option.availability.find(a => a.day === day);
    if (dayAvailability) {
      dayAvailability.timeSlots.splice(slotIndex, 1);
      if (dayAvailability.timeSlots.length === 0) {
        option.availability = option.availability.filter(a => a.day !== day);
      }
    }

    handleInputChange('options', [...(formData.options || [])]);
  };

  const addEquipment = (optionIndex: number) => {
    const option = formData.options?.[optionIndex];
    if (!option) return;

    option.equipmentRequirements.push({
      equipmentName: '',
      provided: false
    });

    handleInputChange('options', [...(formData.options || [])]);
  };

  const removeEquipment = (optionIndex: number, equipIndex: number) => {
    const option = formData.options?.[optionIndex];
    if (!option) return;

    option.equipmentRequirements.splice(equipIndex, 1);
    handleInputChange('options', [...(formData.options || [])]);
  };

  const addWaiver = () => {
    const currentWaivers = formData.waivers || [];
    handleInputChange('waivers', [...currentWaivers, {
      title: '',
      description: '',
      url: ''
    }]);
  };

  const removeWaiver = (index: number) => {
    const currentWaivers = formData.waivers || [];
    const newWaivers = currentWaivers.filter((_, i) => i !== index);
    handleInputChange('waivers', newWaivers);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Activity name is required';
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

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Valid duration is required';
    }

    if (!formData.maxGroupSize || formData.maxGroupSize <= 0) {
      newErrors.maxGroupSize = 'Valid group size is required';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('ActivityForm handleSubmit called');
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
        <h3>Activity Information</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Activity Name *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter activity name"
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
              {ACTIVITY_CATEGORIES.map(cat => (
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
            placeholder="Describe your activity in detail, what makes it special, what guests can expect..."
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
              placeholder="Enter location or address"
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
            Click on the map to drop a pin at your exact activity location (optional but recommended)
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
            <label>Base Price *</label>
            <div className={styles.priceInput}>
              <span className={styles.currency}>$</span>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={errors.price ? styles.error : ''}
              />
            </div>
            {errors.price && <span className={styles.errorText}>{errors.price}</span>}
            <small className={styles.helpText}>Starting price for this activity</small>
          </div>

          <div className={styles.formGroup}>
            <label>Pricing Type</label>
            <select
              value={formData.pricingType || ''}
              onChange={(e) => handleInputChange('pricingType', e.target.value)}
            >
              {PRICING_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <small className={styles.helpText}>How the price is calculated</small>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Duration (minutes) *</label>
            <input
              type="number"
              value={formData.duration || ''}
              onChange={(e) => handleInputChange('duration', Number(e.target.value))}
              placeholder="60"
              min="1"
              className={errors.duration ? styles.error : ''}
            />
            {errors.duration && <span className={styles.errorText}>{errors.duration}</span>}
            <small className={styles.helpText}>Typical duration of the activity</small>
          </div>

          <div className={styles.formGroup}>
            <label>Max Group Size *</label>
            <input
              type="number"
              value={formData.maxGroupSize || ''}
              onChange={(e) => handleInputChange('maxGroupSize', Number(e.target.value))}
              placeholder="10"
              min="1"
              className={errors.maxGroupSize ? styles.error : ''}
            />
            {errors.maxGroupSize && <span className={styles.errorText}>{errors.maxGroupSize}</span>}
            <small className={styles.helpText}>Maximum people per session</small>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Difficulty Level</label>
            <select
              value={formData.difficultyLevel || ''}
              onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
            >
              {DIFFICULTY_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <small className={styles.helpText}>Physical or skill requirements</small>
          </div>

          <div className={styles.formGroup}>
            <label>Age Requirements</label>
            <div className={styles.ageInputs}>
              <input
                type="number"
                value={formData.ageRestrictions?.minAge || ''}
                onChange={(e) => handleInputChange('ageRestrictions.minAge', Number(e.target.value))}
                placeholder="Min age"
                min="0"
                style={{ marginRight: '10px' }}
              />
              <input
                type="number"
                value={formData.ageRestrictions?.maxAge || ''}
                onChange={(e) => handleInputChange('ageRestrictions.maxAge', Number(e.target.value) || undefined)}
                placeholder="Max age (optional)"
                min="0"
              />
            </div>
            <small className={styles.helpText}>Age restrictions for safety</small>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Activity Images *</h3>
        
        <div className={styles.imageUploadArea}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            className={styles.fileInput}
            id="main-images"
          />
          
          <label htmlFor="main-images" className={styles.uploadLabel}>
            <FontAwesomeIcon icon={faUpload} />
            <span>Upload Activity Images</span>
            <small>Show the activity, location, and what guests will experience (Max 5MB each)</small>
          </label>
        </div>

        {errors.images && <span className={styles.errorText}>{errors.images}</span>}

        {formData.images && formData.images.length > 0 && (
          <>
            <p className={styles.sectionDescription}>
              Click "Set as Primary" to choose your main activity image
            </p>
            <div className={styles.imageGrid}>
              {formData.images.map((image: any, index) => (
                <div key={index} className={styles.imageItem}>
                  <img 
                    src={image.url instanceof File ? URL.createObjectURL(image.url) : image.url} 
                    alt={`Activity ${index + 1}`} 
                  />
                  
                  <div className={styles.imageActions}>
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className={`${styles.primaryBtn} ${image.isMain ? styles.isPrimary : ''}`}
                      title={image.isMain ? "Primary Image" : "Set as Primary"}
                    >
                      <FontAwesomeIcon icon={image.isMain ? faStar : faCamera} />
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
    </div>
  );

  const renderOptions = () => (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h3>Activity Options</h3>
        <button
          type="button"
          onClick={addOption}
          className={styles.addBtn}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Option
        </button>
      </div>

      <p className={styles.sectionDescription}>
        Create different options or packages for your activity (e.g., Morning Tour, Sunset Experience, VIP Package)
      </p>

      {errors.options && <span className={styles.errorText}>{errors.options}</span>}

      {formData.options?.map((option, optionIndex) => (
        <div key={optionIndex} className={styles.optionCard}>
          <div className={styles.optionHeader}>
            <h4>Option {optionIndex + 1}</h4>
            <button
              type="button"
              onClick={() => removeOption(optionIndex)}
              className={styles.removeBtn}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Option Title *</label>
              <input
                type="text"
                value={option.title}
                onChange={(e) => handleInputChange(`options.${optionIndex}.title`, e.target.value)}
                placeholder="e.g., Morning Tour, Sunset Experience, Private Session"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Price *</label>
              <div className={styles.priceInput}>
                <span className={styles.currency}>$</span>
                <input
                  type="number"
                  value={option.cost}
                  onChange={(e) => handleInputChange(`options.${optionIndex}.cost`, Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Pricing Type</label>
              <select
                value={option.pricingType || ''}
                onChange={(e) => handleInputChange(`options.${optionIndex}.pricingType`, e.target.value)}
              >
                {PRICING_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Difficulty Level</label>
              <select
                value={option.difficultyLevel || ''}
                onChange={(e) => handleInputChange(`options.${optionIndex}.difficultyLevel`, e.target.value)}
              >
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Duration (minutes) *</label>
              <input
                type="number"
                value={option.duration}
                onChange={(e) => handleInputChange(`options.${optionIndex}.duration`, Number(e.target.value))}
                placeholder="60"
                min="1"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Max People *</label>
              <input
                type="number"
                value={option.maxPeople}
                onChange={(e) => handleInputChange(`options.${optionIndex}.maxPeople`, Number(e.target.value))}
                placeholder="1"
                min="1"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Specific Location (if different)</label>
            <input
              type="text"
              value={option.location || ''}
              onChange={(e) => handleInputChange(`options.${optionIndex}.location`, e.target.value)}
              placeholder="Optional: specific meeting point or location for this option"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={option.description || ''}
              onChange={(e) => handleInputChange(`options.${optionIndex}.description`, e.target.value)}
              placeholder="Describe what's unique about this option, what's included, special features..."
              rows={3}
            />
          </div>

          {/* Availability Schedule */}
          <div className={styles.subsection}>
            <h5>Weekly Availability</h5>
            <p className={styles.sectionDescription}>
              Set regular weekly schedule for this option
            </p>
            {DAYS.map(day => (
              <div key={day} className={styles.dayAvailability}>
                <div className={styles.dayHeader}>
                  <span>{day}</span>
                  <button
                    type="button"
                    onClick={() => addTimeSlot(optionIndex, day)}
                    className={styles.addTimeSlot}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Time Slot
                  </button>
                </div>

                {option.availability
                  .filter(a => a.day === day)
                  .map(dayAvail => 
                    dayAvail.timeSlots.map((slot, slotIndex) => (
                      <div key={slotIndex} className={styles.timeSlot}>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => {
                            slot.startTime = e.target.value;
                            handleInputChange('options', [...(formData.options || [])]);
                          }}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => {
                            slot.endTime = e.target.value;
                            handleInputChange('options', [...(formData.options || [])]);
                          }}
                        />
                        <input
                          type="number"
                          value={slot.maxPeople}
                          onChange={(e) => {
                            slot.maxPeople = Number(e.target.value);
                            handleInputChange('options', [...(formData.options || [])]);
                          }}
                          placeholder="Max people"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(optionIndex, day, slotIndex)}
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

          {/* Equipment Requirements */}
          <div className={styles.subsection}>
            <div className={styles.subsectionHeader}>
              <h5>Equipment & Requirements</h5>
              <button
                type="button"
                onClick={() => addEquipment(optionIndex)}
                className={styles.addBtn}
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Equipment
              </button>
            </div>

            <p className={styles.sectionDescription}>
              List equipment needed and whether you provide it
            </p>

            {option.equipmentRequirements.map((equipment, equipIndex) => (
              <div key={equipIndex} className={styles.equipmentItem}>
                <input
                  type="text"
                  value={equipment.equipmentName}
                  onChange={(e) => {
                    const updatedEquipment = [...option.equipmentRequirements];
                    updatedEquipment[equipIndex] = { ...updatedEquipment[equipIndex], equipmentName: e.target.value };
                    handleInputChange(`options.${optionIndex}.equipmentRequirements`, updatedEquipment);
                  }}
                  placeholder="Equipment name (e.g., snorkel gear, hiking boots)"
                />
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={equipment.provided}
                    onChange={(e) => {
                      const updatedEquipment = [...option.equipmentRequirements];
                      updatedEquipment[equipIndex] = { ...updatedEquipment[equipIndex], provided: e.target.checked };
                      handleInputChange(`options.${optionIndex}.equipmentRequirements`, updatedEquipment);
                    }}
                  />
                  <span>We provide this</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeEquipment(optionIndex, equipIndex)}
                  className={styles.removeBtn}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}

            {option.equipmentRequirements.length === 0 && (
              <div className={styles.emptyState}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <p>No equipment requirements</p>
                <small>Add equipment if guests need to bring anything specific</small>
              </div>
            )}
          </div>

          {/* Option Images */}
          <div className={styles.subsection}>
            <h5>Option-Specific Images</h5>
            
            <div className={styles.imageUploadArea}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files, `options.${optionIndex}`)}
                className={styles.fileInput}
                id={`option-images-${optionIndex}`}
              />
              
              <label htmlFor={`option-images-${optionIndex}`} className={styles.uploadLabel}>
                <FontAwesomeIcon icon={faCamera} />
                <span>Upload Option Images</span>
                <small>Images specific to this option</small>
              </label>
            </div>

            {option.images && option.images.length > 0 && (
              <>
                <p className={styles.sectionDescription}>
                  Click "Set as Primary" to choose the main image for this option
                </p>
                <div className={styles.imageGrid}>
                  {option.images.map((image: any, imageIndex) => (
                    <div key={imageIndex} className={styles.imageItem}>
                      <img 
                        src={image.url instanceof File ? URL.createObjectURL(image.url) : image.url} 
                        alt={`Option ${imageIndex + 1}`} 
                      />
                      
                      <div className={styles.imageActions}>
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(imageIndex, optionIndex)}
                          className={`${styles.primaryBtn} ${image.isMain ? styles.isPrimary : ''}`}
                          title={image.isMain ? "Primary Image" : "Set as Primary"}
                        >
                          <FontAwesomeIcon icon={image.isMain ? faStar : faCamera} />
                          {image.isMain ? "Primary" : "Set Primary"}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => removeImage(imageIndex, `options.${optionIndex}`)}
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
        </div>
      ))}

      {(!formData.options || formData.options.length === 0) && (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faCalendarTimes} />
          <p>No activity options created</p>
          <small>Add different options or packages for your activity</small>
        </div>
      )}
    </div>
  );

  const renderPolicies = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3>Cancellation Policy</h3>
        <div className={styles.formGroup}>
          <label>Cancellation Policy</label>
          <textarea
            value={formData.cancellationPolicy || ''}
            onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
            placeholder="Describe your cancellation and refund policy (e.g., full refund 24 hours in advance, 50% refund within 12 hours, etc.)..."
            rows={4}
          />
          <small className={styles.helpText}>Clear cancellation terms help set proper expectations</small>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Waivers & Legal Documents</h3>
          <button
            type="button"
            onClick={addWaiver}
            className={styles.addBtn}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Waiver
          </button>
        </div>

        <p className={styles.sectionDescription}>
          Add any liability waivers or legal documents guests need to sign
        </p>

        {formData.waivers?.map((waiver, index) => (
          <div key={index} className={styles.waiverCard}>
            <div className={styles.cardHeader}>
              <h4>Waiver {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeWaiver(index)}
                className={styles.removeBtn}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.formGroup}>
              <label>Waiver Title *</label>
              <input
                type="text"
                value={waiver.title}
                onChange={(e) => handleInputChange(`waivers.${index}.title`, e.target.value)}
                placeholder="e.g., Liability Waiver, Safety Agreement, Medical Clearance"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={waiver.description || ''}
                onChange={(e) => handleInputChange(`waivers.${index}.description`, e.target.value)}
                placeholder="Describe what this waiver covers and why it's required..."
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Document URL (optional)</label>
              <input
                type="url"
                value={waiver.url || ''}
                onChange={(e) => handleInputChange(`waivers.${index}.url`, e.target.value)}
                placeholder="https://example.com/waiver.pdf"
              />
              <small className={styles.helpText}>Link to the actual waiver document if available online</small>
            </div>
          </div>
        ))}

        {(!formData.waivers || formData.waivers.length === 0) && (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <p>No waivers added</p>
            <small>Add liability waivers or legal documents if required for your activity</small>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3>Safety & Guidelines</h3>
        <div className={styles.safetyTips}>
          <div className={styles.tip}>
            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.tipIcon} />
            <div>
              <strong>Safety First:</strong> Always prioritize guest safety and clearly communicate any risks
            </div>
          </div>
          <div className={styles.tip}>
            <FontAwesomeIcon icon={faUsers} className={styles.tipIcon} />
            <div>
              <strong>Clear Expectations:</strong> Set clear expectations about difficulty levels and requirements
            </div>
          </div>
          <div className={styles.tip}>
            <FontAwesomeIcon icon={faClock} className={styles.tipIcon} />
            <div>
              <strong>Timing:</strong> Be punctual and respect guests' time schedules
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.serviceForm}>
      <div className={styles.formHeader}>
        <h2>Activity Details</h2>
        <p>Create your activity listing with detailed options and availability</p>
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
      {currentTab === 1 && renderOptions()}
      {currentTab === 2 && renderPolicies()}

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