'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './PriceRangeSlider.module.css';

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

interface PriceRangeSliderProps {
  allStays: Stay[]; // All stays for determining the overall price range
  filteredStays: Stay[]; // Filtered stays for the histogram
  duration: number;
  checkIn: string;
  checkOut: string;
  minPrice: number | '';
  maxPrice: number | '';
  onPriceChange: (min: number | '', max: number | '') => void;
}

const calculateTripPrice = (stay: Stay, duration: number, checkIn: string, checkOut: string): number => {
  if (duration <= 0) {
    return stay.pricePerNight;
  }
  
  const basePrice = stay.pricePerNight * duration;
  let discountPercentage = 0;
  
  if (stay.discounts) {
    const userStartDate = new Date(checkIn);
    const userEndDate = new Date(checkOut);
    
    // Check for special deals first
    const activeSpecial = stay.discounts.specials?.find(s => {
      const specialStart = new Date(s.startDate);
      const specialEnd = new Date(s.endDate);
      return userStartDate < specialEnd && userEndDate > specialStart;
    });
    
    if (activeSpecial) {
      discountPercentage = activeSpecial.percentage;
    } else {
      // Check for length-based discounts
      if (duration >= 28 && stay.discounts.monthly) {
        discountPercentage = stay.discounts.monthly;
      } else if (duration >= 7 && stay.discounts.weekly) {
        discountPercentage = stay.discounts.weekly;
      }
    }
  }
  
  const finalPrice = basePrice * (1 - discountPercentage / 100);
  return Math.round(finalPrice);
};

export default function PriceRangeSlider({ 
  allStays,
  filteredStays, 
  duration, 
  checkIn, 
  checkOut, 
  minPrice, 
  maxPrice, 
  onPriceChange 
}: PriceRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [histogram, setHistogram] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculate price range and histogram
  useEffect(() => {
    if (allStays.length === 0) return;

    // Use all stays to determine the overall price range (so it stays consistent)
    const allTripPrices = allStays.map(stay => calculateTripPrice(stay, duration, checkIn, checkOut));
    const minTripPrice = Math.min(...allTripPrices);
    const maxTripPrice = Math.max(...allTripPrices);
    
    // Round to nice numbers
    const roundedMin = Math.floor(minTripPrice / 10) * 10;
    const roundedMax = Math.ceil(maxTripPrice / 10) * 10;
    
    setPriceRange({ min: roundedMin, max: roundedMax });
    
    // Create histogram with filtered stays only
    const filteredTripPrices = filteredStays.map(stay => calculateTripPrice(stay, duration, checkIn, checkOut));
    
    const bins = 50;
    const binSize = (roundedMax - roundedMin) / bins;
    const histogramData = new Array(bins).fill(0);
    
    filteredTripPrices.forEach(price => {
      const binIndex = Math.min(Math.floor((price - roundedMin) / binSize), bins - 1);
      histogramData[binIndex]++;
    });
    
    setHistogram(histogramData);
    
    // Set initial values if not set
    if (minPrice === '' && maxPrice === '') {
      onPriceChange(roundedMin, roundedMax);
    }
  }, [allStays, filteredStays, duration, checkIn, checkOut]);

  const getSliderValue = (price: number | ''): number => {
    if (price === '') return priceRange.min;
    return Math.max(priceRange.min, Math.min(priceRange.max, price));
  };

  const getPercentage = (value: number): number => {
    return ((value - priceRange.min) / (priceRange.max - priceRange.min)) * 100;
  };

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    setIsDragging(type);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const value = Math.round(priceRange.min + (percentage / 100) * (priceRange.max - priceRange.min));

    const currentMin = getSliderValue(minPrice);
    const currentMax = getSliderValue(maxPrice);

    if (isDragging === 'min') {
      const newMin = Math.min(value, currentMax - 10);
      onPriceChange(newMin, maxPrice);
    } else {
      const newMax = Math.max(value, currentMin + 10);
      onPriceChange(minPrice, newMax);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, minPrice, maxPrice, priceRange]);

  const maxHistogramValue = Math.max(...histogram);

  const handleInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? '' : Math.max(0, parseInt(value) || 0);
    
    if (type === 'min') {
      onPriceChange(numValue, maxPrice);
    } else {
      onPriceChange(minPrice, numValue);
    }
  };

  const minPercentage = getPercentage(getSliderValue(minPrice));
  const maxPercentage = getPercentage(getSliderValue(maxPrice));

  return (
    <div className={styles.priceRangeContainer}>
      <div className={styles.header}>
        <h4 className={styles.title}>Price range</h4>
        <p className={styles.subtitle}>
          {duration > 0 
            ? `Trip price for ${duration} ${duration === 1 ? 'night' : 'nights'}, includes all fees`
            : 'Nightly price, includes all fees'
          }
        </p>
      </div>

      <div className={styles.sliderContainer}>
        {/* Histogram bars */}
        <div className={styles.histogram}>
          {histogram.map((count, index) => (
            <div
              key={index}
              className={styles.histogramBar}
              style={{
                height: maxHistogramValue > 0 ? `${(count / maxHistogramValue) * 100}%` : '0%',
                left: `${(index / histogram.length) * 100}%`,
                width: `${100 / histogram.length}%`
              }}
            />
          ))}
        </div>

        {/* Slider track */}
        <div className={styles.sliderTrack} ref={sliderRef}>
          {/* Active range */}
          <div
            className={styles.sliderRange}
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
          
          {/* Min handle */}
          <div
            className={`${styles.sliderHandle} ${styles.minHandle}`}
            style={{ left: `${minPercentage}%` }}
            onMouseDown={handleMouseDown('min')}
          />
          
          {/* Max handle */}
          <div
            className={`${styles.sliderHandle} ${styles.maxHandle}`}
            style={{ left: `${maxPercentage}%` }}
            onMouseDown={handleMouseDown('max')}
          />
        </div>
      </div>

      {/* Price inputs */}
      <div className={styles.priceInputs}>
        <div className={styles.priceInputGroup}>
          <label className={styles.inputLabel}>Minimum</label>
          <div className={styles.inputWrapper}>
            <span className={styles.currencySymbol}>$</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => handleInputChange('min', e.target.value)}
              className={styles.priceInput}
              min={priceRange.min}
              max={priceRange.max}
            />
          </div>
        </div>
        
        <div className={styles.priceInputGroup}>
          <label className={styles.inputLabel}>Maximum</label>
          <div className={styles.inputWrapper}>
            <span className={styles.currencySymbol}>$</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => handleInputChange('max', e.target.value)}
              className={styles.priceInput}
              min={priceRange.min}
              max={priceRange.max}
            />
          </div>
        </div>
      </div>
    </div>
  );
}