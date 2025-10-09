"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import styles from "./transportation.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faStar, faMapMarkerAlt, faCar, faUsers } from "@fortawesome/free-solid-svg-icons";

interface Fleet {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  category: string;
  capacity: number;
  status: 'available' | 'rented' | 'maintenance' | 'out-of-service';
  amenities: string[];
  priceOverride?: number;
}

interface Driver {
  driverId: string;
  name: string;
  rating?: number;
  experience?: number;
  status: 'active' | 'inactive' | 'on-duty' | 'off-duty';
}

interface PresetLocation {
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: 'pickup' | 'dropoff' | 'both';
  isPopular: boolean;
  priceModifier: number;
}

interface Promotion {
  title: string;
  description: string;
  type: 'percentage' | 'fixed-amount' | 'buy-x-get-y' | 'loyalty';
  value: number;
  validFrom: string;
  validUntil: string;
  promoCode?: string;
  isActive: boolean;
}

interface TransportationItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  pricingModel: string;
  basePrice: number;
  flatPrice?: number;
  perMilePrice?: number;
  perHourPrice?: number;
  perDayPrice?: number;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  island: string;
  images: { url: string; isMain?: boolean }[];
  vendor: {
    _id: string;
    name: string;
    businessProfile?: {
      businessName: string;
      isApproved: boolean;
    };
  };
  fleet?: Fleet[];
  drivers?: Driver[];
  presetLocations?: PresetLocation[];
  longTermDiscounts?: Array<{
    duration: 'weekly' | 'monthly' | 'seasonal';
    discountPercentage: number;
    minimumDays: number;
  }>;
  distancePricing?: {
    enabled: boolean;
    baseRate: number;
    perMileRate: number;
    minimumFare: number;
    maximumFare: number;
  };
  promotions?: Promotion[];
  contactDetails: {
    phone: string;
    email?: string;
    website?: string;
    operatingHours?: Array<{
      day: string;
      startTime: string;
      endTime: string;
      is24Hours?: boolean;
    }>;
  };
  reviews: Array<{
    user: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  performanceMetrics?: {
    totalBookings: number;
    averageRating: number;
    totalReviews: number;
  };
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export default function TransportationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [transportationItems, setTransportationItems] = useState<TransportationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>("name");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 500 });
  const [selectedIsland, setSelectedIsland] = useState<string>("All");

  const categories = [
    "All",
    "Car Rental",
    "Jeep & 4x4 Rental",
    "Scooter & Moped Rental",
    "Taxi",
    "Airport Transfer",
    "Private VIP Transport",
    "Ferry",
    "Flight",
  ];

  const islands = ["All", "Providenciales", "Grand Turk", "North Caicos", "Middle Caicos", "South Caicos", "Salt Cay"];

  const sortOptions = [
    { value: "name", label: "Name A-Z" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest First" }
  ];

  const fetchTransportationItems = async (category: string) => {
    setLoading(true);
    try {
      let response;
      if (category === "All") {
        response = await axios.get("http://localhost:5000/api/services/type/transportations");
      } else {
        response = await axios.get(
          `http://localhost:5000/api/services/transportation/category/${encodeURIComponent(category)}`
        );
      }
      
      // Filter by active status and approved vendors
const activeServices = response.data.filter((item: TransportationItem) => {
  const isActive = item.status === 'active';
  
  // Handle both old (host) and new (vendor) field names
  const vendorField = item.vendor || item.host;
  
  // If it's just an ID string (old data), assume approved
  if (typeof vendorField === 'string') {
    return isActive;
  }
  
  // If it's populated vendor object, check approval
  const isApproved = vendorField?.businessProfile?.isApproved !== false;
  
  return isActive && isApproved;
});
      
      setTransportationItems(activeServices);
    } catch (error) {
      console.error("Error fetching transportation items:", error);
      setTransportationItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportationItems(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    const categoryFromQuery = searchParams.get("category") || "All";
    setSelectedCategory(categoryFromQuery);
  }, [searchParams]);

  const getAverageRating = (item: TransportationItem): number => {
    if (item.performanceMetrics?.averageRating) {
      return item.performanceMetrics.averageRating;
    }
    if (item.reviews && item.reviews.length > 0) {
      return item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length;
    }
    return 0;
  };

  const getDisplayPrice = (item: TransportationItem): number => {
    switch (item.pricingModel) {
      case 'per-day':
        return item.perDayPrice || item.basePrice;
      case 'per-hour':
        return item.perHourPrice || item.basePrice;
      case 'per-mile':
        return item.perMilePrice || item.basePrice;
      case 'flat':
        return item.flatPrice || item.basePrice;
      default:
        return item.basePrice;
    }
  };

  const getPriceLabel = (item: TransportationItem): string => {
    switch (item.pricingModel) {
      case 'per-day':
        return '/day';
      case 'per-hour':
        return '/hour';
      case 'per-mile':
        return '/mile';
      case 'flat':
        return '';
      default:
        return '';
    }
  };

  const getAvailableVehicles = (item: TransportationItem): number => {
    if (!item.fleet) return 0;
    return item.fleet.filter(vehicle => vehicle.status === 'available').length;
  };

  const getActiveDrivers = (item: TransportationItem): number => {
    if (!item.drivers) return 0;
    return item.drivers.filter(driver => 
      driver.status === 'active' || driver.status === 'on-duty'
    ).length;
  };

  const hasActivePromotions = (item: TransportationItem): boolean => {
    if (!item.promotions) return false;
    const now = new Date();
    return item.promotions.some(promo => 
      promo.isActive && 
      new Date(promo.validFrom) <= now && 
      new Date(promo.validUntil) >= now
    );
  };

  const getOperatingStatus = (item: TransportationItem): string => {
    const now = new Date();
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5);

    const todayHours = item.contactDetails.operatingHours?.find(
      hours => hours.day === currentDay
    );

    if (!todayHours) return 'Hours not available';
    if (todayHours.is24Hours) return 'Open 24/7';
    
    const isOpen = currentTime >= todayHours.startTime && currentTime <= todayHours.endTime;
    return isOpen ? 'Open Now' : 'Closed';
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = transportationItems.filter(item => {
      // Filter by island
      if (selectedIsland !== "All" && item.island !== selectedIsland) {
        return false;
      }
      
      // Filter by price range
      const price = getDisplayPrice(item);
      if (price < priceRange.min || price > priceRange.max) {
        return false;
      }
      
      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return getDisplayPrice(a) - getDisplayPrice(b);
        case 'price-high':
          return getDisplayPrice(b) - getDisplayPrice(a);
        case 'rating':
          return getAverageRating(b) - getAverageRating(a);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [transportationItems, selectedIsland, priceRange, sortBy]);

  const handleItemClick = (item: TransportationItem) => {
    router.push(`/transportationdetails?id=${item._id}`);
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Transportation Services</h1>
        <p className={styles.subtitle}>
          Discover reliable and comfortable transportation options across Turks and Caicos
        </p>
      </div>

      {/* Enhanced Filter Section */}
      <div className={styles.filterContainer}>
        <div className={styles.filtersRow}>
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedIsland}
              onChange={(e) => setSelectedIsland(e.target.value)}
            >
              {islands.map((island) => (
                <option key={island} value={island}>
                  {island}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectContainer}>
            <select
              className={styles.select}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.priceRangeContainer}>
          <label className={styles.priceLabel}>
            Price Range: ${priceRange.min} - ${priceRange.max}
          </label>
          <div className={styles.rangeInputs}>
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
              className={styles.rangeInput}
            />
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
              className={styles.rangeInput}
            />
          </div>
        </div>

        <div className={styles.resultsCount}>
          {filteredAndSortedItems.length} services found
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
          {selectedIsland !== "All" && ` on ${selectedIsland}`}
        </div>
      </div>

      {/* Loading & Cards */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading transportation services...</p>
        </div>
      ) : (
        <div className={styles.cardContainer}>
          {filteredAndSortedItems.length > 0 ? (
            filteredAndSortedItems.map((item) => (
              <div
                key={item._id}
                className={styles.card}
                onClick={() => handleItemClick(item)}
              >
                <div className={styles.cardImageContainer}>
                  {hasActivePromotions(item) && (
                    <div className={styles.promotionBadge}>SPECIAL OFFER</div>
                  )}
                  <img
                    src={item.images.find((img) => img.isMain)?.url || item.images[0]?.url || '/images/default-transport.jpg'}
                    alt={item.name}
                    className={styles.cardImg}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/default-transport.jpg';
                    }}
                  />
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>{item.name}</h2>
                    <div className={styles.vendorInfo}>
                      by {item.vendor?.businessProfile?.businessName || item.vendor?.name}
                    </div>
                  </div>

                  <p className={styles.cardCategory}>{item.category}</p>
                  <p className={styles.cardDescription}>{item.description}</p>

                  <div className={styles.cardStats}>
                    <div className={styles.statItem}>
                      <FontAwesomeIcon icon={faStar} className={styles.statIcon} />
                      <span>{getAverageRating(item).toFixed(1)}</span>
                      <span className={styles.reviewCount}>
                        ({item.performanceMetrics?.totalReviews || item.reviews?.length || 0})
                      </span>
                    </div>

                    {item.fleet && (
                      <div className={styles.statItem}>
                        <FontAwesomeIcon icon={faCar} className={styles.statIcon} />
                        <span>{getAvailableVehicles(item)} available</span>
                      </div>
                    )}

                    {item.drivers && (
                      <div className={styles.statItem}>
                        <FontAwesomeIcon icon={faUsers} className={styles.statIcon} />
                        <span>{getActiveDrivers(item)} drivers</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.locationInfo}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.locationIcon} />
                    <span>{item.location}, {item.island}</span>
                  </div>

                  <div className={styles.operatingStatus}>
                    <span className={styles.statusIndicator}>
                      {getOperatingStatus(item)}
                    </span>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.priceInfo}>
                      <span className={styles.priceLabel}>Starting from</span>
                      <span className={styles.price}>
                        ${getDisplayPrice(item)}{getPriceLabel(item)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                      className={styles.cardButton}
                    >
                      View Details
                    </button>
                  </div>

                  {hasActivePromotions(item) && (
                    <div className={styles.promotionInfo}>
                      <span className={styles.promotionText}>
                        Special offers available!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🚗</div>
              <h3>No transportation services found</h3>
              <p>
                {selectedCategory !== "All" || selectedIsland !== "All" 
                  ? "Try adjusting your filters to see more options."
                  : "No transportation services are currently available."}
              </p>
              <button 
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedIsland("All");
                  setPriceRange({ min: 0, max: 500 });
                }}
                className={styles.resetFiltersButton}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}