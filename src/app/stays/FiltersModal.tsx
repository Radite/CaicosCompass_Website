'use client';

import { useState } from 'react';
import PriceRangeSlider from './PriceRangeSlider';
import styles from './FiltersModal.module.css';

// --- Type Definitions ---
interface FilterState {
  // Type & Property
  type: 'All' | 'Villa' | 'Airbnb';
  propertyType: 'All' | 'House' | 'Apartment' | 'Guesthouse';
  
  // Pricing & Guests
  minPrice: number | '';
  maxPrice: number | '';
  bedrooms: number | '';
  bathrooms: number | '';
  beds: number | '';
  
  // Tags & Booking Options
  isLuxe: boolean;
  isGuestFavorite: boolean;
  instantBook: boolean;
  selfCheckIn: boolean;
  allowPets: boolean;
  
  // Amenities
  essentials: {
    kitchen: boolean;
    washer: boolean;
    dryer: boolean;
    heating: boolean;
    ac: boolean;
    wifi: boolean;
    dedicatedWorkspace: boolean;
    tv: boolean;
    hairDryer: boolean;
    iron: boolean;
  };
  
  luxury: {
    hotTub: boolean;
    pool: boolean;
    beachfront: boolean;
    kingBed: boolean;
    bbqGrill: boolean;
    breakfast: boolean;
    gym: boolean;
    indoorFireplace: boolean;
    evCharger: boolean;
  };
  
  familyFriendly: {
    crib: boolean;
    smokingAllowed: boolean;
    freeParking: boolean;
  };
  
  safety: {
    smokeAlarm: boolean;
    carbonMonoxideAlarm: boolean;
  };
}

interface Stay {
  _id: string;
  pricePerNight: number;
  type: 'Hotel' | 'Villa' | 'Airbnb' | string;
  propertyType?: 'House' | 'Apartment' | 'Guesthouse';
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  island: string;
  amenities: string[] | Record<string, boolean>;
  bookingOptions?: {
    instantBook: boolean;
    selfCheckIn: boolean;
    allowPets: boolean;
  };
  tags?: {
    isLuxe: boolean;
    isGuestFavorite: boolean;
  };
  discounts?: {
    weekly?: number;
    monthly?: number;
    specials?: Array<{
      title: string;
      startDate: string;
      endDate: string;
      percentage: number;
    }>;
  };
}

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  allStays: Stay[];
  filteredStaysForHistogram: Stay[]; // Stays filtered by everything except price
  duration: number;
  checkIn: string;
  checkOut: string;
}

const initialFilters: FilterState = {
  type: 'All',
  propertyType: 'All',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  bathrooms: '',
  beds: '',
  isLuxe: false,
  isGuestFavorite: false,
  instantBook: false,
  selfCheckIn: false,
  allowPets: false,
  essentials: {
    kitchen: false,
    washer: false,
    dryer: false,
    heating: false,
    ac: false,
    wifi: false,
    dedicatedWorkspace: false,
    tv: false,
    hairDryer: false,
    iron: false,
  },
  luxury: {
    hotTub: false,
    pool: false,
    beachfront: false,
    kingBed: false,
    bbqGrill: false,
    breakfast: false,
    gym: false,
    indoorFireplace: false,
    evCharger: false,
  },
  familyFriendly: {
    crib: false,
    smokingAllowed: false,
    freeParking: false,
  },
  safety: {
    smokeAlarm: false,
    carbonMonoxideAlarm: false,
  },
};

export default function FiltersModal({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange,
  allStays,
  filteredStaysForHistogram,
  duration,
  checkIn,
  checkOut
}: FiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  if (!isOpen) return null;

  const handlePriceChange = (min: number | '', max: number | '') => {
    setLocalFilters(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max
    }));
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedFilterChange = (section: 'essentials' | 'luxury' | 'familyFriendly' | 'safety', key: string, value: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setLocalFilters(initialFilters);
    onFiltersChange(initialFilters);
    onClose();
  };

  const renderToggleButton = (label: string, isActive: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.toggleButton} ${isActive ? styles.active : ''}`}
    >
      {label}
    </button>
  );

  const renderNumberInput = (label: string, value: number | '', onChange: (value: number | '') => void, placeholder: string) => (
    <div className={styles.numberInputGroup}>
      <label className={styles.inputLabel}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        placeholder={placeholder}
        className={styles.numberInput}
        min="0"
      />
    </div>
  );

  const renderAmenitySection = (title: string, amenities: Record<string, boolean>, section: 'essentials' | 'luxury' | 'familyFriendly' | 'safety') => (
    <div className={styles.amenitySection}>
      <h4 className={styles.sectionTitle}>{title}</h4>
      <div className={styles.amenityGrid}>
        {Object.entries(amenities).map(([key, value]) => (
          <label key={key} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleNestedFilterChange(section, key, e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Filters</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Type & Property Section */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🏠</span>
              Type & Property
            </h3>
            
            <div className={styles.filterGroup}>
              <label className={styles.inputLabel}>Stay Type</label>
              <div className={styles.buttonGroup}>
                {renderToggleButton('All', localFilters.type === 'All', () => handleFilterChange('type', 'All'))}
                {renderToggleButton('Villa', localFilters.type === 'Villa', () => handleFilterChange('type', 'Villa'))}
                {renderToggleButton('Airbnb', localFilters.type === 'Airbnb', () => handleFilterChange('type', 'Airbnb'))}
              </div>
            </div>

            {localFilters.type === 'Airbnb' && (
              <div className={styles.filterGroup}>
                <label className={styles.inputLabel}>Property Type</label>
                <div className={styles.buttonGroup}>
                  {renderToggleButton('All', localFilters.propertyType === 'All', () => handleFilterChange('propertyType', 'All'))}
                  {renderToggleButton('House', localFilters.propertyType === 'House', () => handleFilterChange('propertyType', 'House'))}
                  {renderToggleButton('Apartment', localFilters.propertyType === 'Apartment', () => handleFilterChange('propertyType', 'Apartment'))}
                  {renderToggleButton('Guesthouse', localFilters.propertyType === 'Guesthouse', () => handleFilterChange('propertyType', 'Guesthouse'))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Guests Section */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💵</span>
              Pricing & Guests
            </h3>
            
            <div className={styles.filterGroup}>
              <PriceRangeSlider
                allStays={allStays}
                filteredStays={filteredStaysForHistogram}
                duration={duration}
                checkIn={checkIn}
                checkOut={checkOut}
                minPrice={localFilters.minPrice}
                maxPrice={localFilters.maxPrice}
                onPriceChange={handlePriceChange}
              />
            </div>

            <div className={styles.guestInputs}>
              {renderNumberInput('Bedrooms', localFilters.bedrooms, (value) => handleFilterChange('bedrooms', value), 'Any')}
              {renderNumberInput('Bathrooms', localFilters.bathrooms, (value) => handleFilterChange('bathrooms', value), 'Any')}
              {renderNumberInput('Beds', localFilters.beds, (value) => handleFilterChange('beds', value), 'Any')}
            </div>
          </div>

          {/* Tags & Booking Options */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Tags & Booking Options
            </h3>
            
            <div className={styles.tagGrid}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={localFilters.isLuxe}
                  onChange={(e) => handleFilterChange('isLuxe', e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Luxe</span>
              </label>
              
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={localFilters.isGuestFavorite}
                  onChange={(e) => handleFilterChange('isGuestFavorite', e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Guest Favorite</span>
              </label>
              
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={localFilters.instantBook}
                  onChange={(e) => handleFilterChange('instantBook', e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Instant Book</span>
              </label>
              
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={localFilters.selfCheckIn}
                  onChange={(e) => handleFilterChange('selfCheckIn', e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Self Check-in</span>
              </label>
              
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={localFilters.allowPets}
                  onChange={(e) => handleFilterChange('allowPets', e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Pet Friendly</span>
              </label>
            </div>
          </div>

          {/* Amenities Sections */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🛏️</span>
              Amenities
            </h3>
            
            {renderAmenitySection('Essentials', localFilters.essentials, 'essentials')}
            {renderAmenitySection('Luxury & Leisure', localFilters.luxury, 'luxury')}
            {renderAmenitySection('Family Friendly', localFilters.familyFriendly, 'familyFriendly')}
            {renderAmenitySection('Safety', localFilters.safety, 'safety')}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={handleClearFilters} className={styles.clearButton}>
            Clear all
          </button>
          <button onClick={handleApplyFilters} className={styles.applyButton}>
            Apply filters
          </button>
        </div>
      </div>
    </div>
  );
}

export { type FilterState, initialFilters };