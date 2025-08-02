// forms/ShoppingForm.tsx
"use client";

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faMinus, faUpload, faTimes, faShoppingBag,
  faClock, faCamera, faDollarSign, faTruck, faCreditCard,
  faMapMarkerAlt, faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import { Shopping, ListingFormProps } from '../../../types/listing';
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

const STORE_TYPES = [
  'Boutique',
  'Market',
  'Luxury Store',
  'Souvenir Shop',
  'Specialty Store'
];

const PRICE_RANGES = [
  { value: '$', label: '$ - Budget ($5-25)' },
  { value: '$$', label: '$$ - Moderate ($25-75)' },
  { value: '$$$', label: '$$$ - Upscale ($75-200)' },
  { value: '$$$$', label: '$$$$ - Luxury ($200+)' }
];

const AVAILABILITY_OPTIONS = [
  'In Stock',
  'Limited',
  'Out of Stock'
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



export default function ShoppingForm({ onNext, onPrev, initialData }: ListingFormProps) {
  const [formData, setFormData] = useState<Partial<Shopping>>({
    serviceType: 'Shopping',
    name: '',
    description: '',
    location: '',
    island: '',
    coordinates: { latitude: 0, longitude: 0 },
    images: [],
    storeType: 'Boutique',
    priceRange: '$$',
    products: [],
    openingHours: [],
    customClosures: [],
    paymentOptions: ['Cash', 'Credit Card'],
    deliveryAvailable: false,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState(0);
  const [showMap, setShowMap] = useState(false);

  const tabs = [
    { key: 'basic', label: 'Store Info' },
    { key: 'products', label: 'Products' },
    { key: 'operations', label: 'Operations' }
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

  // Function to set primary image for store or product
const setPrimaryImage = (index: number, productIndex?: number) => {
  if (productIndex !== undefined) {
    // For product images
    const currentImages = formData.products?.[productIndex]?.images || [];
    const updatedImages = currentImages.map((image, i) => ({
      ...image,
      isMain: i === index
    }));
    handleInputChange(`products.${productIndex}.images`, updatedImages);
  } else {
    // For main store images
    const currentImages = formData.images || [];
    const updatedImages = currentImages.map((image, i) => ({
      ...image,
      isMain: i === index
    }));
    handleInputChange('images', updatedImages);
  }
};
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    handleInputChange('coordinates', { latitude: lat, longitude: lng });
  }, []);

const handleImageUpload = (files: FileList, productIndex?: number) => {
  const newFiles = Array.from(files);
  
  if (productIndex !== undefined) {
    // For product images
    const currentImages = formData.products?.[productIndex]?.images || [];
    const newImages = newFiles.map((file) => ({
      url: file as any,
      isMain: false // Don't automatically set as main - let user choose
    }));
    
    handleInputChange(`products.${productIndex}.images`, [...currentImages, ...newImages]);
  } else {
    // For main store images
    const currentImages = formData.images || [];
    const newImages = newFiles.map((file) => ({
      url: file as any,
      isMain: false // Don't automatically set as main - let user choose
    }));
    
    handleInputChange('images', [...currentImages, ...newImages]);
  }
};

  const removeImage = (index: number, productIndex?: number) => {
    if (productIndex !== undefined) {
      const currentImages = formData.products?.[productIndex]?.images || [];
      const newImages = currentImages.filter((_, i) => i !== index);
      handleInputChange(`products.${productIndex}.images`, newImages);
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

  // Add this helper function in ShoppingForm.tsx
  const updateAvailabilityBasedOnQuantity = (productIndex: number, quantity: number) => {
    let availability: string;
    
    if (quantity === 0) {
      availability = 'Out of Stock';
    } else if (quantity <= 5) {
      availability = 'Limited';
    } else {
      availability = 'In Stock';
    }
    
    handleInputChange(`products.${productIndex}.availability`, availability);
  };
  

  const addProduct = () => {
    const newProduct = {
      name: '',
      description: '',
      price: 0,
      category: '',
      quantity: 0,
      images: [],
      availability: 'In Stock' as const
    };

    const currentProducts = formData.products || [];
    handleInputChange('products', [...currentProducts, newProduct]);
  };

  const removeProduct = (index: number) => {
    const currentProducts = formData.products || [];
    const newProducts = currentProducts.filter((_, i) => i !== index);
    handleInputChange('products', newProducts);
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

// Add these helper functions in your ShoppingForm component:

// Simple approach: store dates as YYYY-MM-DD strings to avoid timezone issues
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

// Update the addCustomClosure function:
const addCustomClosure = () => {
  // Get today's date in local timezone and format as YYYY-MM-DD
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
      newErrors.name = 'Store name is required';
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

    if (!formData.paymentOptions || formData.paymentOptions.length === 0) {
      newErrors.paymentOptions = 'At least one payment method is required';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('ShoppingForm handleSubmit called');
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
        <h3>Store Information</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Store Name *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter store name"
              className={errors.name ? styles.error : ''}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Store Type *</label>
            <select
              value={formData.storeType || ''}
              onChange={(e) => handleInputChange('storeType', e.target.value)}
            >
              {STORE_TYPES.map(type => (
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
            placeholder="Describe your store, products, specialties..."
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
              placeholder="Enter store address"
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

        <div className={styles.formGroup}>
          <label>Price Range *</label>
          <div className={styles.priceRangeGrid}>
            {PRICE_RANGES.map(range => (
              <label key={range.value} className={styles.radioCard}>
                <input
                  type="radio"
                  name="priceRange"
                  value={range.value}
                  checked={formData.priceRange === range.value}
                  onChange={(e) => handleInputChange('priceRange', e.target.value)}
                />
                <span className={styles.radioLabel}>{range.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

{/* Store Images Section - REPLACE EXISTING */}
<div className={styles.section}>
  <h3>Store Images *</h3>
  
  <div className={styles.imageUploadArea}>
    <input
      type="file"
      multiple
      accept="image/*"
      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
      className={styles.fileInput}
      id="store-images"
    />
    
    <label htmlFor="store-images" className={styles.uploadLabel}>
      <FontAwesomeIcon icon={faUpload} />
      <span>Upload Store Images</span>
      <small>Interior, exterior, storefront (Max 5MB each)</small>
    </label>
  </div>

  {errors.images && <span className={styles.errorText}>{errors.images}</span>}

  {formData.images && formData.images.length > 0 && (
    <>
      <p className={styles.sectionDescription}>
        Click "Set as Primary" to choose your main store image
      </p>
      <div className={styles.imageGrid}>
        {formData.images.map((image: any, index) => (
          <div key={index} className={styles.imageItem}>
            <img 
              src={image.url instanceof File ? URL.createObjectURL(image.url) : image.url} 
              alt={`Store ${index + 1}`} 
            />
            
            <div className={styles.imageActions}>
              <button
                type="button"
                onClick={() => setPrimaryImage(index)}
                className={`${styles.primaryBtn} ${image.isMain ? styles.isPrimary : ''}`}
                title={image.isMain ? "Primary Image" : "Set as Primary"}
              >
                <FontAwesomeIcon icon={image.isMain ? faLocationDot : faMapMarkerAlt} />
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

  const renderProducts = () => (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h3>Products</h3>
        <button
          type="button"
          onClick={addProduct}
          className={styles.addBtn}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Product
        </button>
      </div>

      <p className={styles.sectionDescription}>
        Add products available in your store (optional but recommended)
      </p>

      {formData.products?.map((product, productIndex) => (
        <div key={productIndex} className={styles.productCard}>
          <div className={styles.cardHeader}>
            <h4>Product {productIndex + 1}</h4>
            <button
              type="button"
              onClick={() => removeProduct(productIndex)}
              className={styles.removeBtn}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Product Name *</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => handleInputChange(`products.${productIndex}.name`, e.target.value)}
                placeholder="e.g., Handwoven Basket, Local Artwork"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Category *</label>
              <input
                type="text"
                value={product.category}
                onChange={(e) => handleInputChange(`products.${productIndex}.category`, e.target.value)}
                placeholder="e.g., Crafts, Clothing, Jewelry"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={product.description || ''}
              onChange={(e) => handleInputChange(`products.${productIndex}.description`, e.target.value)}
              placeholder="Describe the product, materials, origin..."
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
                  value={product.price}
                  onChange={(e) => handleInputChange(`products.${productIndex}.price`, Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Discounted Price</label>
              <div className={styles.priceInput}>
                <span className={styles.currency}>$</span>
                <input
                  type="number"
                  value={product.discountedPrice || ''}
                  onChange={(e) => handleInputChange(`products.${productIndex}.discountedPrice`, Number(e.target.value) || undefined)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Quantity in Stock</label>
              <input
                type="number"
                value={product.quantity || 0}
                onChange={(e) => {
                  const newQuantity = Number(e.target.value) || 0;
                  handleInputChange(`products.${productIndex}.quantity`, newQuantity);
                  updateAvailabilityBasedOnQuantity(productIndex, newQuantity);
                }}
                placeholder="0"
                min="0"
              />
              <small className={styles.helpText}>Number of items you have available</small>
            </div>

            <div className={styles.formGroup}>
              <label>Availability</label>
              <select
                value={product.availability}
                onChange={(e) => handleInputChange(`products.${productIndex}.availability`, e.target.value)}
              >
                {AVAILABILITY_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Images */}
{/* Product Images Section - REPLACE EXISTING */}
<div className={styles.subsection}>
  <h5>Product Images</h5>
  
  <div className={styles.imageUploadArea}>
    <input
      type="file"
      multiple
      accept="image/*"
      onChange={(e) => e.target.files && handleImageUpload(e.target.files, productIndex)}
      className={styles.fileInput}
      id={`product-images-${productIndex}`}
    />
    
    <label htmlFor={`product-images-${productIndex}`} className={styles.uploadLabel}>
      <FontAwesomeIcon icon={faCamera} />
      <span>Upload Product Images</span>
    </label>
  </div>

  {product.images && product.images.length > 0 && (
    <>
      <p className={styles.sectionDescription}>
        Click "Set as Primary" to choose the main product image
      </p>
      <div className={styles.imageGrid}>
        {product.images.map((image: any, imageIndex) => (
          <div key={imageIndex} className={styles.imageItem}>
            <img 
              src={image.url instanceof File ? URL.createObjectURL(image.url) : image.url} 
              alt={`Product ${imageIndex + 1}`} 
            />
            
            <div className={styles.imageActions}>
              <button
                type="button"
                onClick={() => setPrimaryImage(imageIndex, productIndex)}
                className={`${styles.primaryBtn} ${image.isMain ? styles.isPrimary : ''}`}
                title={image.isMain ? "Primary Image" : "Set as Primary"}
              >
                <FontAwesomeIcon icon={image.isMain ? faLocationDot : faMapMarkerAlt} />
                {image.isMain ? "Primary" : "Set Primary"}
              </button>
              
              <button
                type="button"
                onClick={() => removeImage(imageIndex, productIndex)}
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

      {formData.products && formData.products.length === 0 && (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faShoppingBag} />
          <p>No products added</p>
          <small>Add products to showcase your inventory</small>
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
              <FontAwesomeIcon icon={faCreditCard} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Delivery & Services</h3>
        
        <label className={styles.switchLabel}>
          <input
            type="checkbox"
            checked={formData.deliveryAvailable || false}
            onChange={(e) => handleInputChange('deliveryAvailable', e.target.checked)}
          />
          <span className={styles.switch}></span>
          <span>Delivery Available</span>
        </label>
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
    Add special dates when your store will be closed (holidays, renovations, etc.)
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
            placeholder="e.g., Holiday, Renovation"
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
</div>
    </div>
  );

  return (
    <div className={styles.serviceForm}>
      <div className={styles.formHeader}>
        <h2>Store Details</h2>
        <p>Create your store listing with products and operating information</p>
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
      {currentTab === 1 && renderProducts()}
      {currentTab === 2 && renderOperations()}

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