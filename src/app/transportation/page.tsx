"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import styles from "./transportation.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faStar, faMapMarkerAlt, faCar, faUsers, faSort, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

// --- INTERFACES (Unchanged from original) ---
interface Fleet {
  vehicleId: string; make: string; model: string; year: number; category: string; capacity: number; status: 'available' | 'rented' | 'maintenance' | 'out-of-service'; amenities: string[]; priceOverride?: number;
}
interface Driver {
  driverId: string; name: string; rating?: number; experience?: number; status: 'active' | 'inactive' | 'on-duty' | 'off-duty';
}
interface PresetLocation {
  name: string; address: string; coordinates: { latitude: number; longitude: number; }; type: 'pickup' | 'dropoff' | 'both'; isPopular: boolean; priceModifier: number;
}
interface Promotion {
  title: string; description: string; type: 'percentage' | 'fixed-amount' | 'buy-x-get-y' | 'loyalty'; value: number; validFrom: string; validUntil: string; promoCode?: string; isActive: boolean;
}
interface TransportationItem {
  _id: string; name: string; description: string; category: string; pricingModel: string; basePrice: number; flatPrice?: number; perMilePrice?: number; perHourPrice?: number; perDayPrice?: number; location: string; coordinates: { latitude: number; longitude: number; }; island: string; images: { url: string; isMain?: boolean }[]; vendor: { _id: string; name: string; businessProfile?: { businessName: string; isApproved: boolean; }; }; fleet?: Fleet[]; drivers?: Driver[]; presetLocations?: PresetLocation[]; longTermDiscounts?: Array<{ duration: 'weekly' | 'monthly' | 'seasonal'; discountPercentage: number; minimumDays: number; }>; distancePricing?: { enabled: boolean; baseRate: number; perMileRate: number; minimumFare: number; maximumFare: number; }; promotions?: Promotion[]; contactDetails: { phone: string; email?: string; website?: string; operatingHours?: Array<{ day: string; startTime: string; endTime: string; is24Hours?: boolean; }>; }; reviews: Array<{ user: string; rating: number; comment: string; createdAt: string; }>; performanceMetrics?: { totalBookings: number; averageRating: number; totalReviews: number; }; status: 'active' | 'inactive' | 'pending'; createdAt: string;
}

// --- CONSTANTS ---
const MAX_PRICE = 1000;
const API_BASE_URL = "http://localhost:5000/api/services";

const CATEGORIES = ["All", "Car Rental", "Jeep & 4x4 Rental", "Scooter & Moped Rental", "Taxi", "Airport Transfer", "Private VIP Transport", "Ferry", "Flight"];
const ISLANDS = ["All", "Providenciales", "Grand Turk", "North Caicos", "Middle Caicos", "South Caicos", "Salt Cay"];
const SORT_OPTIONS = [
  { value: "name", label: "Name A-Z" }, { value: "price-low", label: "Price: Low to High" }, { value: "price-high", label: "Price: High to Low" }, { value: "rating", label: "Highest Rated" }, { value: "newest", label: "Newest First" }
];

// --- HELPER HOOK for Debouncing ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- UTILITY FUNCTIONS (Refactored for clarity) ---
const getAverageRating = (item: TransportationItem): number => {
  if (item.performanceMetrics?.averageRating) return item.performanceMetrics.averageRating;
  if (item.reviews && item.reviews.length > 0) return item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length;
  return 0;
};
const getDisplayPrice = (item: TransportationItem): number => {
  switch (item.pricingModel) {
    case 'per-day': return item.perDayPrice || item.basePrice;
    case 'per-hour': return item.perHourPrice || item.basePrice;
    case 'per-mile': return item.perMilePrice || item.basePrice;
    case 'flat': return item.flatPrice || item.basePrice;
    default: return item.basePrice;
  }
};
const getPriceLabel = (item: TransportationItem): string => {
  switch (item.pricingModel) {
    case 'per-day': return '/day';
    case 'per-hour': return '/hour';
    case 'per-mile': return '/mile';
    default: return '';
  }
};
const getOperatingStatus = (item: TransportationItem): { text: string; className: string } => {
  const now = new Date();
  const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5);
  const todayHours = item.contactDetails.operatingHours?.find(h => h.day === currentDay);

  if (!todayHours) return { text: 'Hours Unavailable', className: styles.statusUnavailable };
  if (todayHours.is24Hours) return { text: 'Open 24/7', className: styles.statusOpen };

  const isOpen = currentTime >= todayHours.startTime && currentTime <= todayHours.endTime;
  return isOpen ? { text: 'Open Now', className: styles.statusOpen } : { text: 'Closed', className: styles.statusClosed };
};

// --- SUB-COMPONENTS ---
const SkeletonCard = () => (
  <div className={`${styles.card} ${styles.skeleton}`}>
    <div className={styles.skeletonImage}></div>
    <div className={styles.cardBody}>
      <div className={styles.skeletonText} style={{ width: '80%', height: '24px' }}></div>
      <div className={styles.skeletonText} style={{ width: '50%' }}></div>
      <div className={styles.skeletonText} style={{ width: '90%', marginTop: '1rem' }}></div>
      <div className={styles.skeletonText} style={{ width: '85%' }}></div>
      <div className={styles.cardFooter} style={{ marginTop: 'auto' }}>
        <div className={styles.skeletonText} style={{ width: '40%', height: '30px' }}></div>
        <div className={styles.skeletonButton}></div>
      </div>
    </div>
  </div>
);

const TransportationCard = ({ item, onClick }: { item: TransportationItem, onClick: (item: TransportationItem) => void }) => {
    const hasActivePromotions = useMemo(() => {
        if (!item.promotions) return false;
        const now = new Date();
        return item.promotions.some(p => p.isActive && new Date(p.validFrom) <= now && new Date(p.validUntil) >= now);
    }, [item.promotions]);

    const availableVehicles = useMemo(() => {
        if (!item.fleet) return 0;
        return item.fleet.filter(v => v.status === 'available').length;
    }, [item.fleet]);
    
    const activeDrivers = useMemo(() => {
        if (!item.drivers) return 0;
        return item.drivers.filter(d => d.status === 'active' || d.status === 'on-duty').length;
    }, [item.drivers]);
    
    const status = getOperatingStatus(item);
    
    return (
        <div key={item._id} className={styles.card} onClick={() => onClick(item)} role="button" tabIndex={0}>
            <div className={styles.cardImageContainer}>
                {hasActivePromotions && <div className={styles.promotionBadge}>SPECIAL OFFER</div>}
                <img
                    src={item.images.find(img => img.isMain)?.url || item.images[0]?.url || '/images/default-transport.jpg'}
                    alt={item.name}
                    className={styles.cardImg}
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-transport.jpg'; }}
                />
            </div>
            <div className={styles.cardBody}>
                <p className={styles.cardCategory}>{item.category}</p>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>{item.name}</h2>
                    <div className={styles.vendorInfo}>by {item.vendor?.businessProfile?.businessName || item.vendor?.name}</div>
                </div>
                <div className={styles.cardStats}>
                    <div className={styles.statItem} title={`${getAverageRating(item).toFixed(1)} star rating`}>
                        <FontAwesomeIcon icon={faStar} className={styles.statIcon} />
                        <span>{getAverageRating(item).toFixed(1)}</span>
                        <span className={styles.reviewCount}>({item.performanceMetrics?.totalReviews || item.reviews?.length || 0})</span>
                    </div>
                    {item.fleet && <div className={styles.statItem}><FontAwesomeIcon icon={faCar} className={styles.statIcon} /><span>{availableVehicles} available</span></div>}
                    {item.drivers && <div className={styles.statItem}><FontAwesomeIcon icon={faUsers} className={styles.statIcon} /><span>{activeDrivers} drivers</span></div>}
                </div>
                <div className={styles.locationInfo}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.locationIcon} />
                    <span>{item.location}, {item.island}</span>
                </div>
                <div className={styles.operatingStatus}>
                    <span className={`${styles.statusIndicator} ${status.className}`}>{status.text}</span>
                </div>
                <div className={styles.cardFooter}>
                    <div className={styles.priceInfo}>
                        <span className={styles.priceLabel}>Starting from</span>
                        <span className={styles.price}>${getDisplayPrice(item)}<small>{getPriceLabel(item)}</small></span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onClick(item); }} className={styles.cardButton}>View Details</button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
export default function TransportationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [transportationItems, setTransportationItems] = useState<TransportationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  
  const [filters, setFilters] = useState(() => ({
      category: searchParams.get("category") || "All",
      island: searchParams.get("island") || "All",
      sortBy: searchParams.get("sortBy") || "name",
      minPrice: parseInt(searchParams.get("minPrice") || "0", 10),
      maxPrice: parseInt(searchParams.get("maxPrice") || `${MAX_PRICE}`, 10)
  }));
  
  const debouncedMinPrice = useDebounce(filters.minPrice, 300);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 300);

  // Effect to update URL when debounced filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category !== "All") params.set("category", filters.category);
    if (filters.island !== "All") params.set("island", filters.island);
    if (filters.sortBy !== "name") params.set("sortBy", filters.sortBy);
    if (debouncedMinPrice > 0) params.set("minPrice", debouncedMinPrice.toString());
    if (debouncedMaxPrice < MAX_PRICE) params.set("maxPrice", debouncedMaxPrice.toString());
    
    // Using replace to avoid polluting browser history on every filter change
    router.replace(`/transportation?${params.toString()}`);
    
    // Set filtering state for visual feedback
    const filteringTimeout = setTimeout(() => setIsFiltering(false), 400);
    return () => clearTimeout(filteringTimeout);

  }, [filters.category, filters.island, filters.sortBy, debouncedMinPrice, debouncedMaxPrice, router]);

  // Data fetching
  const fetchTransportationItems = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = category === "All"
        ? `${API_BASE_URL}/type/transportations`
        : `${API_BASE_URL}/transportation/category/${encodeURIComponent(category)}`;
      const response = await axios.get(endpoint);
      
      const activeServices = response.data.filter((item: any) => 
        item.status === 'active' && (item.vendor || item.host)?.businessProfile?.isApproved !== false
      );
      setTransportationItems(activeServices);
    } catch (err) {
      console.error("Error fetching transportation items:", err);
      setError("Failed to load transportation services. Please try again later.");
      setTransportationItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransportationItems(filters.category);
  }, [filters.category, fetchTransportationItems]);

  // Memoized filtering and sorting
  const filteredAndSortedItems = useMemo(() => {
    let filtered = transportationItems.filter(item => {
      if (filters.island !== "All" && item.island !== filters.island) return false;
      const price = getDisplayPrice(item);
      if (price < filters.minPrice || price > filters.maxPrice) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low': return getDisplayPrice(a) - getDisplayPrice(b);
        case 'price-high': return getDisplayPrice(b) - getDisplayPrice(a);
        case 'rating': return getAverageRating(b) - getAverageRating(a);
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [transportationItems, filters.island, filters.minPrice, filters.maxPrice, filters.sortBy]);
  
  const handleFilterChange = (key: string, value: string | number) => {
      setIsFiltering(true);
      setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    setIsFiltering(true);
    setFilters(prev => {
        const newMin = type === 'min' ? value : prev.minPrice;
        const newMax = type === 'max' ? value : prev.maxPrice;
        // Prevent min from exceeding max and vice-versa
        return {
            ...prev,
            minPrice: Math.min(newMin, newMax),
            maxPrice: Math.max(newMin, newMax)
        };
    });
  };

  const resetFilters = () => {
      const defaultFilters = { category: "All", island: "All", sortBy: "name", minPrice: 0, maxPrice: MAX_PRICE };
      setFilters(defaultFilters);
      router.push('/transportation');
  };

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Transportation Services</h1>
        <p className={styles.subtitle}>Discover reliable and comfortable transportation options across Turks and Caicos.</p>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filtersRow}>
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
            <select aria-label="Filter by category" className={styles.select} value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.inputIcon} />
            <select aria-label="Filter by island" className={styles.select} value={filters.island} onChange={(e) => handleFilterChange('island', e.target.value)}>
              {ISLANDS.map(island => <option key={island} value={island}>{island}</option>)}
            </select>
          </div>
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faSort} className={styles.inputIcon} />
            <select aria-label="Sort by" className={styles.select} value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.priceRangeContainer}>
            <div className={styles.priceLabels}>
                <label htmlFor="minPrice" className={styles.priceValue}>${filters.minPrice}</label>
                <span className={styles.priceLabel}>Price Range</span>
                <label htmlFor="maxPrice" className={styles.priceValue}>${filters.maxPrice === MAX_PRICE ? `${MAX_PRICE}+` : `$${filters.maxPrice}`}</label>
            </div>
            <div className={styles.dualRangeContainer}>
                <div className={styles.rangeTrack}></div>
                <div className={styles.rangeProgress} style={{ left: `${(filters.minPrice / MAX_PRICE) * 100}%`, right: `${100 - (filters.maxPrice / MAX_PRICE) * 100}%` }}></div>
                <input id="minPrice" type="range" min="0" max={MAX_PRICE} value={filters.minPrice} onChange={(e) => handlePriceChange('min', parseInt(e.target.value))} className={`${styles.rangeInput} ${styles.rangeMin}`} />
                <input id="maxPrice" type="range" min="0" max={MAX_PRICE} value={filters.maxPrice} onChange={(e) => handlePriceChange('max', parseInt(e.target.value))} className={`${styles.rangeInput} ${styles.rangeMax}`} />
            </div>
        </div>

        <div className={styles.resultsCount}>
          {filteredAndSortedItems.length} service{filteredAndSortedItems.length !== 1 && 's'} found
        </div>
      </div>
      
      {error && (
        <div className={styles.errorContainer}>
            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
            <h3>An Error Occurred</h3>
            <p>{error}</p>
            <button onClick={() => fetchTransportationItems(filters.category)} className={styles.resetFiltersButton}>Try Again</button>
        </div>
      )}

      {!error && (
        <div className={`${styles.cardContainer} ${isFiltering ? styles.isFiltering : ''}`}>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
          ) : filteredAndSortedItems.length > 0 ? (
            filteredAndSortedItems.map(item => (
              <TransportationCard key={item._id} item={item} onClick={(i) => router.push(`/transportationdetails?id=${i._id}`)} />
            ))
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🚐</div>
              <h3>No Services Found</h3>
              <p>Try adjusting your search filters to find what you're looking for.</p>
              <button onClick={resetFilters} className={styles.resetFiltersButton}>Reset All Filters</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}