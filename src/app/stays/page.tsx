'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import { format, addDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import FiltersModal, { FilterState, initialFilters } from './FiltersModal';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import styles from './stayspage.module.css';

// --- Type Definitions ---
interface Image {
  url: string;
  isMain?: boolean;
  _id: string;
}

interface Review {
  rating: number;
}

interface Discounts {
  weekly?: number;
  monthly?: number;
  specials?: Array<{
    title: string;
    startDate: string;
    endDate: string;
    percentage: number;
  }>;
}

interface Stay {
  _id: string;
  name: string;
  description: string;
  location: string;
  images: Image[];
  island: string;
  reviews: Review[];
  type: 'Hotel' | 'Villa' | 'Airbnb' | string;
  propertyType?: 'House' | 'Apartment' | 'Guesthouse';
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  amenities: string[] | Record<string, boolean>;
  discounts?: Discounts;
  bookingOptions?: {
    instantBook: boolean;
    selfCheckIn: boolean;
    allowPets: boolean;
  };
  tags?: {
    isLuxe: boolean;
    isGuestFavorite: boolean;
  };
}

type StayType = 'All' | 'Hotel' | 'Villa' | 'Airbnb';
type IslandOption = 'All Islands' | 'Providenciales' | 'North Caicos' | 'Middle Caicos' | 'South Caicos' | 'Grand Turk' | 'Salt Cay';

// --- Helper Functions ---
const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).filter(key => value[key] === true);
  }
  if (typeof value === 'string') return value.split(',').map(item => item.trim());
  return [];
};

const getAverageRating = (reviews: Review[]) => {
  if (!reviews || reviews.length === 0) return 'New';
  const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
  return (sum / reviews.length).toFixed(1);
};

const calculatePrice = (stay: Stay, duration: number, checkIn: string, checkOut: string) => {
  if (duration <= 0) {
    return { finalPrice: stay.pricePerNight, basePrice: stay.pricePerNight, appliedDiscount: { type: 'None', percentage: 0 } };
  }
  const basePrice = stay.pricePerNight * duration;
  let discountPercentage = 0;
  let discountType = 'None';
  if (stay.discounts) {
    const userStartDate = new Date(checkIn);
    const userEndDate = new Date(checkOut);
    const activeSpecial = stay.discounts.specials?.find(s => {
      const specialStart = new Date(s.startDate);
      const specialEnd = new Date(s.endDate);
      return userStartDate < specialEnd && userEndDate > specialStart;
    });
    if (activeSpecial) {
      discountPercentage = activeSpecial.percentage;
      discountType = activeSpecial.title || 'Special';
    } else {
      if (duration >= 28 && stay.discounts.monthly) {
        discountPercentage = stay.discounts.monthly;
        discountType = 'Monthly';
      } else if (duration >= 7 && stay.discounts.weekly) {
        discountPercentage = stay.discounts.weekly;
        discountType = 'Weekly';
      }
    }
  }
  const finalPrice = basePrice * (1 - discountPercentage / 100);
  return {
    finalPrice: Math.round(finalPrice),
    basePrice: Math.round(basePrice),
    appliedDiscount: { type: discountType, percentage: discountPercentage },
  };
};

// Filter matching function without price (for histogram)
const matchesFiltersExceptPrice = (stay: Stay, filters: FilterState, duration: number, checkIn: string, checkOut: string): boolean => {
  // Type filter
  if (filters.type !== 'All' && stay.type !== filters.type) {
    return false;
  }
  
  // Property type filter (for Airbnb only)
  if (filters.propertyType !== 'All' && stay.type === 'Airbnb') {
    if (stay.propertyType !== filters.propertyType) {
      return false;
    }
  }
  
  // Skip price filter for histogram
  
  // Room filters
  if (filters.bedrooms !== '' && stay.bedrooms < filters.bedrooms) {
    return false;
  }
  if (filters.bathrooms !== '' && stay.bathrooms < filters.bathrooms) {
    return false;
  }
  if (filters.beds !== '' && stay.beds < filters.beds) {
    return false;
  }
  
  // Tags filter
  if (filters.isLuxe && !stay.tags?.isLuxe) {
    return false;
  }
  if (filters.isGuestFavorite && !stay.tags?.isGuestFavorite) {
    return false;
  }
  
  // Booking options filter
  if (filters.instantBook && !stay.bookingOptions?.instantBook) {
    return false;
  }
  if (filters.selfCheckIn && !stay.bookingOptions?.selfCheckIn) {
    return false;
  }
  if (filters.allowPets && !stay.bookingOptions?.allowPets) {
    return false;
  }
  
  // Amenities filter
  const stayAmenities = typeof stay.amenities === 'object' && !Array.isArray(stay.amenities) 
    ? stay.amenities 
    : {};
  
  const allAmenities = {
    ...filters.essentials,
    ...filters.luxury,
    ...filters.familyFriendly,
    ...filters.safety
  };
  
  for (const [amenity, required] of Object.entries(allAmenities)) {
    if (required && !stayAmenities[amenity]) {
      return false;
    }
  }
  
  return true;
};

// Filter matching function
const matchesFilters = (stay: Stay, filters: FilterState, duration: number, checkIn: string, checkOut: string): boolean => {
  // Type filter
  if (filters.type !== 'All' && stay.type !== filters.type) {
    return false;
  }
  
  // Property type filter (for Airbnb only)
  if (filters.propertyType !== 'All' && stay.type === 'Airbnb') {
    if (stay.propertyType !== filters.propertyType) {
      return false;
    }
  }
  
  // Price range filter - calculate trip price
  const tripPrice = calculatePrice(stay, duration, checkIn, checkOut).finalPrice;
  if (filters.minPrice !== '' && tripPrice < filters.minPrice) {
    return false;
  }
  if (filters.maxPrice !== '' && tripPrice > filters.maxPrice) {
    return false;
  }
  
  // Room filters
  if (filters.bedrooms !== '' && stay.bedrooms < filters.bedrooms) {
    return false;
  }
  if (filters.bathrooms !== '' && stay.bathrooms < filters.bathrooms) {
    return false;
  }
  if (filters.beds !== '' && stay.beds < filters.beds) {
    return false;
  }
  
  // Tags filter
  if (filters.isLuxe && !stay.tags?.isLuxe) {
    return false;
  }
  if (filters.isGuestFavorite && !stay.tags?.isGuestFavorite) {
    return false;
  }
  
  // Booking options filter
  if (filters.instantBook && !stay.bookingOptions?.instantBook) {
    return false;
  }
  if (filters.selfCheckIn && !stay.bookingOptions?.selfCheckIn) {
    return false;
  }
  if (filters.allowPets && !stay.bookingOptions?.allowPets) {
    return false;
  }
  
  // Amenities filter - convert stay amenities to object format for easier checking
  const stayAmenities = typeof stay.amenities === 'object' && !Array.isArray(stay.amenities) 
    ? stay.amenities 
    : {};
  
  // Check all amenity categories
  const allAmenities = {
    ...filters.essentials,
    ...filters.luxury,
    ...filters.familyFriendly,
    ...filters.safety
  };
  
  for (const [amenity, required] of Object.entries(allAmenities)) {
    if (required && !stayAmenities[amenity]) {
      return false;
    }
  }
  
  return true;
};

// --- Main Component ---
export default function StaysPage() {
  const [stays, setStays] = useState<Stay[]>([]);
  const [filteredStays, setFilteredStays] = useState<Stay[]>([]);
  const [filteredStaysForHistogram, setFilteredStaysForHistogram] = useState<Stay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Filters State ---
  const [selectedIsland, setSelectedIsland] = useState<IslandOption>('All Islands');
  const [guestCount, setGuestCount] = useState<number | ''>('');
  const [typeFilter, setTypeFilter] = useState<StayType>('All');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  // --- Date Picker State ---
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [stayDuration, setStayDuration] = useState<number>(0);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: addDays(new Date(), 7),
    key: 'selection',
  });
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);

  const islands: IslandOption[] = ['All Islands', 'Providenciales', 'North Caicos', 'Middle Caicos', 'South Caicos', 'Grand Turk', 'Salt Cay'];
  const availableAmenities = ['WiFi', 'Pool', 'Kitchen', 'Air conditioning', 'Free parking', 'Beachfront'];

  // --- Data Fetching ---
  useEffect(() => {
    const fetchStays = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/services/type/stays');
        if (!response.ok) {
          throw new Error(`Failed to fetch stays. Status: ${response.status}`);
        }
        const data: Stay[] = await response.json();
        
        const processedData = data.map(stay => ({ ...stay, amenities: ensureArray(stay.amenities) }));
        setStays(processedData);
        setFilteredStays(processedData);
        
        const initialIndices: Record<string, number> = {};
        processedData.forEach(stay => { initialIndices[stay._id] = 0; });
        setActiveImageIndices(initialIndices);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Failed to fetch stays:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStays();
  }, []);

  // --- Filtering Logic ---
  useEffect(() => {
    let filtered = stays;
    
    // Apply basic filters
    if (guestCount && guestCount > 0) {
      filtered = filtered.filter(stay => stay.maxGuests >= guestCount);
    }
    if (selectedIsland !== 'All Islands') {
      filtered = filtered.filter(stay => stay.island === selectedIsland);
    }
    if (typeFilter !== 'All') {
      filtered = filtered.filter(stay => stay.type === typeFilter);
    }
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(stay => selectedAmenities.every(amenity => (stay.amenities as string[]).includes(amenity)));
    }
    
    // Create filtered stays for histogram (excludes price filter)
    const filteredForHistogram = filtered.filter(stay => matchesFiltersExceptPrice(stay, filters, stayDuration, checkInDate, checkOutDate));
    setFilteredStaysForHistogram(filteredForHistogram);
    
    // Apply all filters including price
    filtered = filtered.filter(stay => matchesFilters(stay, filters, stayDuration, checkInDate, checkOutDate));
    
    setFilteredStays(filtered);
  }, [selectedIsland, typeFilter, selectedAmenities, guestCount, stays, filters, stayDuration, checkInDate, checkOutDate]);

  // --- Sync Date Picker state with component state (FIXED) ---
useEffect(() => {
  if (dateRange.startDate) {
    setCheckInDate(format(dateRange.startDate, 'yyyy-MM-dd'));
  }
  if (dateRange.endDate) {
    setCheckOutDate(format(dateRange.endDate, 'yyyy-MM-dd'));
  }

  if (dateRange.startDate && dateRange.endDate) {
    const start = dateRange.startDate;
    const end = dateRange.endDate;
    
    if (end <= start) {
      setStayDuration(0);
      return;
    }
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    setStayDuration(daysDiff > 0 ? daysDiff : 0);
  } else {
    setStayDuration(0);
  }
}, [dateRange]);

// 3. Replace the date display button (in the searchBar div) with this:
<button
  onClick={() => setCalendarOpen(!isCalendarOpen)}
  className={styles.dateDisplayButton}
>
  {checkInDate && checkOutDate ? (
    `${format(dateRange.startDate, 'MMM d')} - ${format(dateRange.endDate, 'MMM d')}`
  ) : (
    'Add dates'
  )}
</button>

  // --- Handle clicks outside the calendar to close it ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarRef]);

const handleDateChange = (rangesByKey: RangeKeyDict) => {
    const { selection } = rangesByKey;
    
    // Add this line to see the selected dates in the console
    console.log('Dates selected:', selection);

    setDateRange(selection as any);
  };
  
  // Modified handleStayCardClick to pass dates
  const handleStayCardClick = (stayId: string) => {
    const params = new URLSearchParams();
    params.set('id', stayId);
    
    // Add dates to URL if they are selected
    if (checkInDate) {
      params.set('checkIn', checkInDate);
    }
    if (checkOutDate) {
      params.set('checkOut', checkOutDate);
    }
    if (guestCount) {
      params.set('guests', guestCount.toString());
    }
    
    router.push(`/staydetails?${params.toString()}`);
  };
  
  const toggleAmenity = (amenity: string) => setSelectedAmenities(prev => prev.includes(amenity) ? prev.filter(item => item !== amenity) : [...prev, amenity]);
  const handleImageNavigation = (e: React.MouseEvent, stayId: string, direction: 'prev' | 'next') => {
    e.stopPropagation();
    setActiveImageIndices(prev => {
      const stay = stays.find(s => s._id === stayId);
      if (!stay || !stay.images || stay.images.length < 2) return prev;
      const imagesCount = stay.images.length;
      const currentIndex = prev[stayId] || 0;
      const newIndex = direction === 'next' ? (currentIndex + 1) % imagesCount : (currentIndex - 1 + imagesCount) % imagesCount;
      return { ...prev, [stayId]: newIndex };
    });
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Count active filters for display
  const getActiveFiltersCount = (): number => {
    let count = 0;
    
    if (filters.type !== 'All') count++;
    if (filters.propertyType !== 'All') count++;
    if (filters.minPrice !== '' || filters.maxPrice !== '') count++;
    if (filters.bedrooms !== '' || filters.bathrooms !== '' || filters.beds !== '') count++;
    if (filters.isLuxe || filters.isGuestFavorite || filters.instantBook || filters.selfCheckIn || filters.allowPets) count++;
    
    // Count amenity filters
    const allAmenities = { ...filters.essentials, ...filters.luxury, ...filters.familyFriendly, ...filters.safety };
    if (Object.values(allAmenities).some(Boolean)) count++;
    
    return count;
  };

  const renderSkeletonLoader = () => (
    <div className={styles.listings}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonImage}></div>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonTextShort}></div>
        </div>
      ))}
    </div>
  );

  const renderStays = () => (
    <div className={styles.listings}>
      {filteredStays.map(stay => {
        const priceInfo = calculatePrice(stay, stayDuration, checkInDate, checkOutDate);
        const hasDiscount = priceInfo.appliedDiscount.type !== 'None';
        return (
          <div key={stay._id} className={styles.listingCard} onClick={() => handleStayCardClick(stay._id)}>
            <div className={styles.listingImageContainer}>
              {hasDiscount && stayDuration > 0 && <div className={styles.discountBadge}>{priceInfo.appliedDiscount.type} Deal!</div>}
              <img src={stay.images[activeImageIndices[stay._id] || 0]?.url || '/placeholder.svg'} alt={stay.name} className={styles.listingImage} />
              <div className={styles.imageOverlay}>
                <button className={styles.favoriteButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
                {stay.images && stay.images.length > 1 && (
                  <>
                    <button className={`${styles.carouselControl} ${styles.prev}`} onClick={(e) => handleImageNavigation(e, stay._id, 'prev')}>‹</button>
                    <button className={`${styles.carouselControl} ${styles.next}`} onClick={(e) => handleImageNavigation(e, stay._id, 'next')}>›</button>
                  </>
                )}
              </div>
            </div>
            <div className={styles.listingDetails}>
              <div className={styles.listingHeader}>
                <h3 className={styles.listingName}>{stay.name}</h3>
                <div className={styles.listingRating}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  {getAverageRating(stay.reviews)}
                </div>
              </div>
              <p className={styles.listingLocation}>{stay.location}</p>
              <div className={styles.listingPrice}>
                {stayDuration > 0 ? (
                  <div className={styles.priceContainer}>
                    {hasDiscount && <del className={styles.originalPrice}>${priceInfo.basePrice}</del>}
                    <strong>${priceInfo.finalPrice}</strong>
                    <span> total for {stayDuration} {stayDuration > 1 ? 'nights' : 'night'}</span>
                  </div>
                ) : (
                  <div><strong>${stay.pricePerNight}</strong> / night</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header} ref={headerRef}>
        <div className={styles.headerContent}>
          <div className={styles.logo}><a href="/">The Lodging Compass</a></div>
          <div className={styles.searchBar}>
            <select value={selectedIsland} onChange={(e) => setSelectedIsland(e.target.value as IslandOption)}>
              {islands.map(island => <option key={island} value={island}>{island}</option>)}
            </select>
            <span className={styles.divider}></span>
            <div className={styles.dateRangePickerContainer} ref={calendarRef}>
<button
  onClick={() => setCalendarOpen(!isCalendarOpen)}
  className={styles.dateDisplayButton}
>
  {checkInDate && checkOutDate ?
    // Use formatInTimeZone for accurate display
    `${formatInTimeZone(new Date(checkInDate), 'America/Los_Angeles', 'MMM d')} - ${formatInTimeZone(new Date(checkOutDate), 'America/Los_Angeles', 'MMM d')}` :
    'Add dates'
  }
</button>
                {isCalendarOpen && (
                    <div className={styles.calendarWrapper}>
                        <DateRangePicker
                            ranges={[dateRange]}
                            onChange={handleDateChange}
                            minDate={new Date()}
                            months={2}
                            direction="horizontal"
                            showDateDisplay={false}
                        />
                    </div>
                )}
            </div>
            <span className={styles.divider}></span>
            <input 
              type="number"
              placeholder="Add guests"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value ? Number(e.target.value) : '')}
              min="1"
              className={styles.guestInput}
            />
            <button className={styles.searchButton}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            </button>
          </div>
          <div className={styles.userMenu}>
            <a href="#" className={styles.hostLink}>Become a Host</a>
            <div className={styles.profileIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
          </div>
        </div>
      </header>
      <div className={styles.filtersContainer}>
        <div className={styles.typeFilter}>
          <button onClick={() => setTypeFilter('All')} className={typeFilter === 'All' ? styles.active : ''}>All</button>
          <button onClick={() => setTypeFilter('Hotel')} className={typeFilter === 'Hotel' ? styles.active : ''}>Hotels</button>
          <button onClick={() => setTypeFilter('Villa')} className={typeFilter === 'Villa' ? styles.active : ''}>Villas</button>
          <button onClick={() => setTypeFilter('Airbnb')} className={typeFilter === 'Airbnb' ? styles.active : ''}>Airbnb</button>
        </div>
        <div className={styles.amenitiesFilter}>
          {availableAmenities.map(amenity => (
            <button 
              key={amenity} 
              onClick={() => toggleAmenity(amenity)}
              className={selectedAmenities.includes(amenity) ? styles.active : ''}
            >
              {amenity}
            </button>
          ))}
          <button 
            onClick={() => setIsFiltersModalOpen(true)}
            className={`${styles.filtersButton} ${getActiveFiltersCount() > 0 ? styles.hasActiveFilters : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 6h10l-5.01 6.3L7 6zm-2.75-.39C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.73-4.8 5.75-7.39A.998.998 0 0018.95 4H5.05c-.57 0-.92.51-.8 1.61z"/>
            </svg>
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className={styles.filtersBadge}>{getActiveFiltersCount()}</span>
            )}
          </button>
        </div>
      </div>
      <main className={styles.mainContent}>
        {isLoading ? renderSkeletonLoader() : error ? (
          <div className={styles.errorState}>
            <h3>Oops! Something went wrong.</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : filteredStays.length > 0 ? renderStays() : (
          <div className={styles.emptyState}>
            <h3>No Matching Stays Found</h3>
            <p>Try adjusting your filters to find the perfect place.</p>
          </div>
        )}
      </main>
      <footer className={styles.footer}>
        <p>© 2025 The Lodging Compass. All rights reserved. A premium experience.</p>
      </footer>
      
      <FiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        allStays={stays}
        filteredStaysForHistogram={filteredStaysForHistogram}
        duration={stayDuration}
        checkIn={checkInDate}
        checkOut={checkOutDate}
      />
    </div>
  );
}