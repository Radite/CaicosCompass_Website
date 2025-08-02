// forms/DiningForm.tsx
"use client";

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faMinus, faUpload, faTimes, faUtensils,
  faClock, faCamera, faDollarSign, faFilePdf, faCalendarTimes,
  faMapMarkerAlt, faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import { Dining, ListingFormProps } from '../../types/listing';
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

const CUISINE_TYPES = [
  'Caribbean',
  'American',
  'Seafood',
  'Italian',
  'Mediterranean',
  'Indian',
  'Vegan',
  'Mexican',
  'Japanese',
  'Chinese',
  'French',
  'BBQ'
];

const PRICE_RANGES = [
  { value: '$', label: '$ - Budget ($10-25)' },
  { value: '$$', label: '$$ - Moderate ($25-50)' },
  { value: '$$$', label: '$$$ - Upscale ($50-100)' },
  { value: '$$$$', label: '$$$$ - Fine Dining ($100+)' }
];

const MENU_CATEGORIES = [
  'Appetizers',
  'Main Courses',
  'Sides',
  'Desserts',
  'Drinks'
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

export default function DiningForm({ onNext, onPrev, initialData }: ListingFormProps) {
  const [formData, setFormData] = useState<Partial<Dining>>({
    serviceType: 'Dining',
    name: '',
    description: '',
    location: '',
    island: '',
    coordinates: { latitude: 0, longitude: 0 },
    images: [],
    cuisineTypes: [],
    priceRange: '$$',
    menuItems: [],
    operatingHours: [],
    customClosures: [],
    menuPdf: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState(0);
  const [showMap, setShowMap] = useState(false);

  const tabs = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'menu', label: 'Menu Items' },
    { key: 'hours', label: 'Hours & Closures' }
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

  const handleClosureDateChange = (index: number, dateString: string) => {
    handleInputChange(`customClosures.${index}.date`, dateString);
  };

  // Function to set primary image for restaurant or menu item
  const setPrimaryImage = (index: number, menuItemIndex?: number) => {
    if (menuItemIndex !== undefined) {
      // For menu item images
      const currentImages = formData.menuItems?.[menuItemIndex]?.images || [];
      const updatedImages = currentImages.map((image, i) => ({
        ...image,
        isMain: i === index
      }));
      handleInputChange(`menuItems.${menuItemIndex}.images`, updatedImages);
    } else {
      // For main restaurant images
      const currentImages = formData.images || [];
      const updatedImages = currentImages.map((image, i) => ({
        ...image,
        isMain: i === index
      }));
      handleInputChange('images', updatedImages);
    }
  };

  const handleImageUpload = (files: FileList, menuItemIndex?: number) => {
    const newFiles = Array.from(files);
    
    if (menuItemIndex !== undefined) {
      // For menu item images
      const currentImages = formData.menuItems?.[menuItemIndex]?.images || [];
      const newImages = newFiles.map((file) => ({
        url: file as any,
        isMain: false // Don't automatically set as main - let user choose
      }));
      
      handleInputChange(`menuItems.${menuItemIndex}.images`, [...currentImages, ...newImages]);
    } else {
      // For main restaurant images
      const currentImages = formData.images || [];
      const newImages = newFiles.map((file) => ({
        url: file as any,
        isMain: false // Don't automatically set as main - let user choose
      }));
      
      handleInputChange('images', [...currentImages, ...newImages]);
    }
  };

  const handlePdfUpload = (files: FileList) => {
    const file = files[0];
    if (file && file.type === 'application/pdf') {
      handleInputChange('menuPdf', file);
    }
  };

  const removeImage = (index: number, menuItemIndex?: number) => {
    if (menuItemIndex !== undefined) {
      const currentImages = formData.menuItems?.[menuItemIndex]?.images || [];
      const newImages = currentImages.filter((_, i) => i !== index);
      handleInputChange(`menuItems.${menuItemIndex}.images`, newImages);
    } else {
      const newImages = (formData.images || []).filter((_, i) => i !== index);
      handleInputChange('images', newImages);
    }
  };

  const removePdf = () => {
    handleInputChange('menuPdf', '');
  };

  const toggleCuisineType = (cuisine: string) => {
    const currentCuisines = formData.cuisineTypes || [];
    if (currentCuisines.includes(cuisine as any)) {
      const newCuisines = currentCuisines.filter(c => c !== cuisine);
      handleInputChange('cuisineTypes', newCuisines);
    } else {
      handleInputChange('cuisineTypes', [...currentCuisines, cuisine]);
    }
  };

  const addMenuItem = () => {
    const newMenuItem = {
      name: '',
      description: '',
      category: 'Main Courses' as const,
      price: 0,
      images: [],
      sides: []
    };

    const currentItems = formData.menuItems || [];
    handleInputChange('menuItems', [...currentItems, newMenuItem]);
  };

  const removeMenuItem = (index: number) => {
    const currentItems = formData.menuItems || [];
    const newItems = currentItems.filter((_, i) => i !== index);
    handleInputChange('menuItems', newItems);
  };

  const addSideDish = (menuItemIndex: number) => {
    const menuItem = formData.menuItems?.[menuItemIndex];
    if (!menuItem) return;

    const newSide = { name: '', price: 0 };
    const currentSides = menuItem.sides || [];
    
    handleInputChange(`menuItems.${menuItemIndex}.sides`, [...currentSides, newSide]);
  };

  const removeSideDish = (menuItemIndex: number, sideIndex: number) => {
    const menuItem = formData.menuItems?.[menuItemIndex];
    if (!menuItem) return;

    const newSides = (menuItem.sides || []).filter((_, i) => i !== sideIndex);
    handleInputChange(`menuItems.${menuItemIndex}.sides`, newSides);
  };

  const addOperatingHours = () => {
    const currentHours = formData.operatingHours || [];
    const usedDays = currentHours.map(h => h.day);
    const availableDays = DAYS.filter(day => !usedDays.includes(day));
    
    if (availableDays.length > 0) {
      const newHour = {
        day: availableDays[0],
        openTime: '09:00',
        closeTime: '17:00'
      };
      
      handleInputChange('operatingHours', [...currentHours, newHour]);
    }
  };

  const removeOperatingHours = (index: number) => {
    const currentHours = formData.operatingHours || [];
    const newHours = currentHours.filter((_, i) => i !== index);
    handleInputChange('operatingHours', newHours);
  };

  const addCustomClosure = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    const newClosure = {
      date: todayString,
      reason: '',
      isRecurring: false
    };

    const currentClosures = formData.customClosures || [];
    handleInputChange('customClosures', [...currentClosures, newClosure]);
  };

  const removeCustomClosure = (index: number) => {
    const currentClosures = formData.customClosures || [];
    const newClosures = currentClosures.filter((_, i) => i !== index);
    handleInputChange('customClosures', newClosures);
  };

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.name?.trim()) {
    newErrors.name = 'Restaurant name is required';
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

  if (!formData.cuisineTypes || formData.cuisineTypes.length === 0) {
    newErrors.cuisineTypes = 'At least one cuisine type is required';
  }

  console.log('Validation errors:', newErrors);
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = () => {
  console.log('DiningForm handleSubmit called');
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
        <h3>Restaurant Information</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Restaurant Name *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter restaurant name"
              className={errors.name ? styles.error : ''}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Price Range *</label>
            <select
              value={formData.priceRange || ''}
              onChange={(e) => handleInputChange('priceRange', e.target.value)}
            >
              {PRICE_RANGES.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Description *</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your restaurant, atmosphere, specialties..."
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
              placeholder="Enter restaurant address"
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
      </div>

      <div className={styles.section}>
        <h3>Cuisine Types *</h3>
        <p className={styles.sectionDescription}>Select all cuisine types that apply to your restaurant</p>
        
        {errors.cuisineTypes && <span className={styles.errorText}>{errors.cuisineTypes}</span>}
        
        <div className={styles.cuisineGrid}>
          {CUISINE_TYPES.map(cuisine => (
            <label key={cuisine} className={styles.cuisineCard}>
              <input
                type="checkbox"
                checked={(formData.cuisineTypes || []).includes(cuisine as any)}
                onChange={() => toggleCuisineType(cuisine)}
              />
              <span className={styles.cuisineLabel}>{cuisine}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Restaurant Images *</h3>
        
        <div className={styles.imageUploadArea}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            className={styles.fileInput}
            id="restaurant-images"
          />
          
          <label htmlFor="restaurant-images" className={styles.uploadLabel}>
            <FontAwesomeIcon icon={faUpload} />
            <span>Upload Restaurant Images</span>
            <small>Interior, exterior, atmosphere (Max 5MB each)</small>
          </label>
        </div>

        {errors.images && <span className={styles.errorText}>{errors.images}</span>}

        {formData.images && formData.images.length > 0 && (
          <>
            <p className={styles.sectionDescription}>
              Click "Set as Primary" to choose your main restaurant image
            </p>
            <div className={styles.imageGrid}>
              {formData.images.map((image: any, index) => (
                <div key={index} className={styles.imageItem}>
                  <img 
                    src={image.url instanceof File ? URL.createObjectURL(image.url) : image.url} 
                    alt={`Restaurant ${index + 1}`} 
                  />
                  
                  <div className={styles.imageActions}>
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className={`${styles.primaryBtn} ${image.isMain ? styles.isPrimary : ''}`}
                      title={image.isMain ? "Primary Image" : "Set as Primary"}
                    >
                      <FontAwesomeIcon icon={image.isMain ? faUtensils : faCamera} />
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

      {/* Menu PDF Upload Section */}
      <div className={styles.section}>
        <h3>Menu PDF (Optional)</h3>
        <p className={styles.sectionDescription}>
          Upload a PDF version of your complete menu as an alternative to individual menu items
        </p>
        
        <div className={styles.pdfUploadArea}>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => e.target.files && handlePdfUpload(e.target.files)}
            className={styles.fileInput}
            id="menu-pdf"
          />
          
          <label htmlFor="menu-pdf" className={styles.uploadLabel}>
            <FontAwesomeIcon icon={faFilePdf} />
            <span>Upload Menu PDF</span>
            <small>PDF format only (Max 10MB)</small>
          </label>
        </div>

        {formData.menuPdf && (
          <div className={styles.pdfPreview}>
            <div className={styles.pdfItem}>
              <FontAwesomeIcon icon={faFilePdf} className={styles.pdfIcon} />
              <span className={styles.pdfName}>
                {formData.menuPdf instanceof File ? formData.menuPdf.name : 'Menu PDF'}
              </span>
              <button
                type="button"
                onClick={removePdf}
                className={styles.removeBtn}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h3>Menu Items</h3>
        <button
          type="button"
          onClick={addMenuItem}
          className={styles.addBtn}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Menu Item
        </button>
      </div>

      <p className={styles.sectionDescription}>
        Add your menu items with descriptions, prices, and photos (optional if you uploaded a PDF menu)
      </p>

      {formData.menuItems?.map((item, itemIndex) => (
        <div key={itemIndex} className={styles.menuItemCard}>
          <div className={styles.cardHeader}>
            <h4>Menu Item {itemIndex + 1}</h4>
            <button
              type="button"
              onClick={() => removeMenuItem(itemIndex)}
              className={styles.removeBtn}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Item Name *</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleInputChange(`menuItems.${itemIndex}.name`, e.target.value)}
                placeholder="e.g., Conch Fritters, Jerk Chicken"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Category *</label>
              <select
                value={item.category}
                onChange={(e) => handleInputChange(`menuItems.${itemIndex}.category`, e.target.value)}
              >
                {MENU_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={item.description || ''}
              onChange={(e) => handleInputChange(`menuItems.${itemIndex}.description`, e.target.value)}
              placeholder="Describe the dish, ingredients, preparation..."
              rows={3}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Price *</label>
              <div className={styles.priceInput}>
                <span className={styles.currency}>$</span>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleInputChange(`menuItems.${itemIndex}.price`, Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Menu Item Images */}
          <div className={styles.subsection}>
            <h5>Menu Item Images</h5>
            
            <div className={styles.imageUploadArea}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files, itemIndex)}
                className={styles.fileInput}
                id={`menu-images-${itemIndex}`}
              />
              
              <label htmlFor={`menu-images-${itemIndex}`} className={styles.uploadLabel}>
                <FontAwesomeIcon icon={faCamera} />
                <span>Upload Menu Item Images</span>
              </label>
            </div>

            {item.images && item.images.length > 0 && (
              <>
                <p className={styles.sectionDescription}>
                  Click "Set as Primary" to choose the main image for this menu item
                </p>
                <div className={styles.imageGrid}>
                  {item.images.map((image: any, imageIndex) => (
                    <div key={imageIndex} className={styles.imageItem}>
                      <img 
                        src={image.url instanceof File ? URL.createObjectURL(image.url) : image.url} 
                        alt={`Menu item ${imageIndex + 1}`} 
                      />
                      
                      <div className={styles.imageActions}>
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(imageIndex, itemIndex)}
                          className={`${styles.primaryBtn} ${image.isMain ? styles.isPrimary : ''}`}
                          title={image.isMain ? "Primary Image" : "Set as Primary"}
                        >
                          <FontAwesomeIcon icon={image.isMain ? faUtensils : faCamera} />
                          {image.isMain ? "Primary" : "Set Primary"}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => removeImage(imageIndex, itemIndex)}
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

          {/* Side Dishes */}
          <div className={styles.subsection}>
            <div className={styles.subsectionHeader}>
              <h5>Side Dishes</h5>
              <button
                type="button"
                onClick={() => addSideDish(itemIndex)}
                className={styles.addBtn}
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Side
              </button>
            </div>

            {item.sides?.map((side, sideIndex) => (
              <div key={sideIndex} className={styles.sideItem}>
                <input
                  type="text"
                  value={side.name}
                  onChange={(e) => {
                    const updatedSides = [...(item.sides || [])];
                    updatedSides[sideIndex] = { ...updatedSides[sideIndex], name: e.target.value };
                    handleInputChange(`menuItems.${itemIndex}.sides`, updatedSides);
                  }}
                  placeholder="Side dish name"
                />
                <div className={styles.priceInput}>
                  <span className={styles.currency}>$</span>
                  <input
                    type="number"
                    value={side.price}
                    onChange={(e) => {
                      const updatedSides = [...(item.sides || [])];
                      updatedSides[sideIndex] = { ...updatedSides[sideIndex], price: Number(e.target.value) };
                      handleInputChange(`menuItems.${itemIndex}.sides`, updatedSides);
                    }}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSideDish(itemIndex, sideIndex)}
                  className={styles.removeBtn}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {formData.menuItems && formData.menuItems.length === 0 && (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faUtensils} />
          <p>No menu items added</p>
          <small>Add individual menu items or upload a PDF menu in the Basic Info tab</small>
        </div>
      )}
    </div>
  );

  const renderHours = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Operating Hours *</h3>
          <button
            type="button"
            onClick={addOperatingHours}
            className={styles.addBtn}
            disabled={(formData.operatingHours || []).length >= 7}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Day
          </button>
        </div>

        <p className={styles.sectionDescription}>
          Set your restaurant's operating hours for each day
        </p>

        {errors.operatingHours && <span className={styles.errorText}>{errors.operatingHours}</span>}

        {formData.operatingHours?.map((hours, index) => (
          <div key={index} className={styles.hoursCard}>
            <div className={styles.hoursRow}>
              <div className={styles.formGroup}>
                <label>Day</label>
                <select
                  value={hours.day}
                  onChange={(e) => handleInputChange(`operatingHours.${index}.day`, e.target.value)}
                >
                  {DAYS.filter(day => 
                    !formData.operatingHours?.some((h, i) => h.day === day && i !== index)
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
                  onChange={(e) => handleInputChange(`operatingHours.${index}.openTime`, e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Close Time</label>
                <input
                  type="time"
                  value={hours.closeTime}
                  onChange={(e) => handleInputChange(`operatingHours.${index}.closeTime`, e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => removeOperatingHours(index)}
                className={styles.removeBtn}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        ))}

        {formData.operatingHours && formData.operatingHours.length === 0 && (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faClock} />
            <p>No operating hours set</p>
            <small>Add your restaurant's operating schedule</small>
          </div>
        )}
      </div>

      {/* Custom Closures Section */}
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
          Add special dates when your restaurant will be closed (holidays, private events, etc.)
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
                  placeholder="e.g., Holiday, Private Event, Staff Training"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.switchLabel}>
                  <input
                    type="checkbox"
                    checked={closure.isRecurring || false}
                    onChange={(e) => handleInputChange(`customClosures.${index}.isRecurring`, e.target.checked)}
                  />
                  <span className={styles.switch}></span>
                  <span>Yearly Recurring</span>
                </label>
                <small className={styles.helpText}>
                  Check if this closure repeats every year on the same date
                </small>
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

        {formData.customClosures && formData.customClosures.length === 0 && (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faCalendarTimes} />
            <p>No custom closures set</p>
            <small>Add special closure dates for holidays or events</small>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.serviceForm}>
      <div className={styles.formHeader}>
        <h2>Restaurant Details</h2>
        <p>Create your restaurant listing with menu and operating information</p>
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
      {currentTab === 1 && renderMenu()}
      {currentTab === 2 && renderHours()}

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