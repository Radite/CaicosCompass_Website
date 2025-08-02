"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./wellnessspa.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, 
  faFilter, 
  faMapMarkerAlt, 
  faStar, 
  faClock, 
  faCreditCard, 
  faCalendarTimes,
  faChevronDown,
  faChevronUp,
  faSpa,
  faDollarSign,
  faHeart
} from "@fortawesome/free-solid-svg-icons";

interface Image {
  url: string;
  isMain?: boolean;
}

interface Review {
  user: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

interface ServiceOffered {
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  duration: number;
  category: string;
}

interface WellnessSpaItem {
  _id: string;
  name: string;
  description: string;
  location: string;
  island: string;
  images: Image[];
  spaType: string;
  servicesOffered: ServiceOffered[];
  openingHours: {
    day: string;
    openTime: string;
    closeTime: string;
  }[];
  customClosures?: {
    date: string;
    reason?: string;
  }[];
  paymentOptions: string[];
  reviews: Review[];
  cancellationPolicy?: string;
  ageRestrictions?: {
    minAge: number;
    maxAge?: number;
  };
}

export default function WellnessSpaPage() {
  const router = useRouter();
  const [items, setItems] = useState<WellnessSpaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WellnessSpaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const [selectedFilters, setSelectedFilters] = useState({
    spaType: "All",
  });

  const spaTypes = ["All", "Resort Spa", "Day Spa", "Medical Spa", "Holistic Spa", "Wellness Retreat"];

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/services/type/wellnessspas")
      .then((res) => {
        setItems(res.data);
        setFilteredItems(res.data);
      })
      .catch((err) => console.error("Error fetching wellness spa data:", err))
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = () => {
    let updated = [...items];
    if (selectedFilters.spaType !== "All") {
      updated = updated.filter((item) => item.spaType === selectedFilters.spaType);
    }
    if (searchQuery.trim()) {
      updated = updated
        .map((item) => ({
          ...item,
          matchScore: item.name.toLowerCase().indexOf(searchQuery.toLowerCase()),
        }))
        .filter((item) => item.matchScore !== -1)
        .sort((a, b) => a.matchScore - b.matchScore);
    }
    setFilteredItems(updated);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedFilters, searchQuery, items]);

  const handleViewDetails = (item: WellnessSpaItem) => {
    const queryParam = encodeURIComponent(JSON.stringify(item));
    router.push(`/wellnessspadetails?item=${queryParam}`);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedFilters({ spaType: "All" });
  };

  const toggleCardExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedCards(newExpanded);
  };

  const getCurrentDayHours = (openingHours: WellnessSpaItem['openingHours']) => {
    if (!openingHours || openingHours.length === 0) return null;
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return openingHours.find(hours => hours.day === currentDay);
  };

  const formatDate = (dateInput: string | Date) => {
    let dateString: string;
    
    // Handle both string and Date object cases
    if (dateInput instanceof Date) {
      dateString = dateInput.toISOString();
    } else if (typeof dateInput === 'string') {
      dateString = dateInput;
    } else {
      return 'Invalid Date';
    }
    
    // Parse the date string and extract just the date part to avoid timezone issues
    const dateOnly = dateString.split('T')[0]; // Gets "2025-07-30" from "2025-07-30T00:00:00.000+00:00"
    const [year, month, day] = dateOnly.split('-').map(Number);
    
    // Create date object using local timezone constructor to avoid UTC conversion
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    
    return localDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getUpcomingClosure = (customClosures?: WellnessSpaItem['customClosures']) => {
    if (!customClosures || customClosures.length === 0) return null;
    
    // Get today's date in TCI timezone
    const now = new Date();
    const tciOffset = -4 * 60; // GMT-4 in minutes
    const tciNow = new Date(now.getTime() + (tciOffset * 60 * 1000));
    const todayDateString = tciNow.toISOString().split('T')[0]; // "YYYY-MM-DD"
    
    const upcoming = customClosures
      .map(closure => {
        // Handle both string and Date object cases for closure.date
        let dateString: string;
        if (closure.date instanceof Date) {
          dateString = closure.date.toISOString();
        } else if (typeof closure.date === 'string') {
          dateString = closure.date;
        } else {
          dateString = new Date(closure.date).toISOString();
        }
        
        return {
          ...closure,
          dateString: dateString.split('T')[0], // Extract date part only
          date: new Date(closure.date)
        };
      })
      .filter(closure => closure.dateString >= todayDateString) // Compare date strings directly
      .sort((a, b) => a.dateString.localeCompare(b.dateString))[0]; // Sort by date string
    
    return upcoming;
  };

  // Helper function to get the lowest price
  const getStartingPrice = (services: ServiceOffered[]) => {
    return services.length > 0 ? Math.min(...services.map((s) => s.discountedPrice ?? s.price)) : 0;
  };

  // Helper function to calculate the average rating
  const getAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Wellness & Spa</h1>
        <p className={styles.subtitle}>
          Discover rejuvenating experiences at our exclusive wellness and spa centers
        </p>
      </div>

      {/* Filter Section */}
      <div className={styles.filterContainer}>
        <div className={styles.filterSection}>
          <div className={styles.searchInputContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Search spas..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedFilters.spaType}
              onChange={(e) =>
                setSelectedFilters({ ...selectedFilters, spaType: e.target.value })
              }
            >
              {spaTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.resultsCount}>
          {filteredItems.length} options found
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading wellness & spa experiences...</p>
        </div>
      ) : (
        <div className={styles.cardContainer}>
          {filteredItems.length === 0 ? (
            <div className={styles.noResults}>
              <p>No wellness & spa options available.</p>
              <button className={styles.resetButton} onClick={handleResetFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = expandedCards.has(item._id);
              const startingPrice = getStartingPrice(item.servicesOffered);
              const avgRating = getAverageRating(item.reviews);
              const todayHours = getCurrentDayHours(item.openingHours);
              const upcomingClosure = getUpcomingClosure(item.customClosures);

              return (
                <div
                  key={item._id}
                  className={`${styles.card} ${isExpanded ? styles.cardExpanded : ''}`}
                >
                  <div className={styles.cardImageContainer}>
                    <img
                      src={
                        item.images.find((img) => img.isMain)?.url ||
                        item.images[0]?.url ||
                        "https://via.placeholder.com/400x220?text=Spa"
                      }
                      alt={item.name}
                      className={styles.cardImg}
                    />
                    {item.ageRestrictions?.minAge && item.ageRestrictions.minAge > 0 && (
                      <div className={styles.ageBadge}>
                        {item.ageRestrictions.minAge}+ Only
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{item.name}</h3>
                    
                    <div className={styles.locationContainer}>
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className={styles.locationIcon}
                      />
                      <p className={styles.locationText}>
                        {item.location}, {item.island}
                      </p>
                    </div>

                    <div className={styles.basicInfo}>
                      <p className={styles.cardText}>
                        <FontAwesomeIcon icon={faSpa} className={styles.infoIcon} />
                        {item.spaType}
                      </p>
                      
                      {startingPrice > 0 && (
                        <p className={styles.cardText}>
                          <FontAwesomeIcon icon={faDollarSign} className={styles.infoIcon} />
                          Starting from ${startingPrice}
                        </p>
                      )}
                      
                      {todayHours && (
                        <p className={styles.cardText}>
                          <FontAwesomeIcon icon={faClock} className={styles.infoIcon} />
                          Today: {todayHours.openTime} - {todayHours.closeTime}
                        </p>
                      )}
                      
                      {upcomingClosure && (
                        <p className={styles.closureText}>
                          <FontAwesomeIcon icon={faCalendarTimes} className={styles.infoIcon} />
                          Closed {formatDate(upcomingClosure.date)} - {upcomingClosure.reason}
                        </p>
                      )}
                    </div>

                    {/* Reviews Section */}
                    {item.reviews && item.reviews.length > 0 && (
                      <div className={styles.ratingContainer}>
                        <FontAwesomeIcon icon={faStar} className={styles.starIcon} />
                        <span className={styles.ratingText}>
                          {avgRating} ({item.reviews.length} {item.reviews.length === 1 ? "review" : "reviews"})
                        </span>
                      </div>
                    )}

                    {item.description && (
                      <p className={styles.description}>
                        {item.description}
                      </p>
                    )}

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className={styles.expandedContent}>
                        {/* Services Section */}
                        {item.servicesOffered && item.servicesOffered.length > 0 && (
                          <div className={styles.servicesSection}>
                            <h4 className={styles.sectionTitle}>Featured Services</h4>
                            <div className={styles.servicesList}>
                              {item.servicesOffered.slice(0, 3).map((service, index) => (
                                <div key={index} className={styles.serviceItem}>
                                  <div className={styles.serviceInfo}>
                                    <span className={styles.serviceName}>{service.name}</span>
                                    <span className={styles.serviceDuration}>{service.duration} mins</span>
                                    <span className={styles.servicePrice}>
                                      {service.discountedPrice ? (
                                        <>
                                          <span className={styles.originalPrice}>${service.price}</span>
                                          <span className={styles.discountedPrice}>${service.discountedPrice}</span>
                                        </>
                                      ) : (
                                        <span>${service.price}</span>
                                      )}
                                    </span>
                                  </div>
                                  <span className={styles.serviceCategory}>
                                    {service.category}
                                  </span>
                                </div>
                              ))}
                              {item.servicesOffered.length > 3 && (
                                <p className={styles.moreServices}>
                                  +{item.servicesOffered.length - 3} more services
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Hours Section */}
                        {item.openingHours && item.openingHours.length > 0 && (
                          <div className={styles.hoursSection}>
                            <h4 className={styles.sectionTitle}>Opening Hours</h4>
                            <div className={styles.hoursList}>
                              {item.openingHours.map((hours, index) => (
                                <div key={index} className={styles.hoursItem}>
                                  <span className={styles.day}>{hours.day}</span>
                                  <span className={styles.time}>{hours.openTime} - {hours.closeTime}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Payment Options */}
                        {item.paymentOptions && item.paymentOptions.length > 0 && (
                          <div className={styles.paymentSection}>
                            <h4 className={styles.sectionTitle}>Payment Options</h4>
                            <div className={styles.paymentOptions}>
                              {item.paymentOptions.map((option, index) => (
                                <span key={index} className={styles.paymentOption}>
                                  <FontAwesomeIcon icon={faCreditCard} />
                                  {option}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Age Restrictions */}
                        {item.ageRestrictions && (
                          <div className={styles.ageSection}>
                            <h4 className={styles.sectionTitle}>Age Requirements</h4>
                            <p className={styles.ageInfo}>
                              <FontAwesomeIcon icon={faHeart} className={styles.infoIcon} />
                              Minimum age: {item.ageRestrictions.minAge}
                              {item.ageRestrictions.maxAge && ` • Maximum age: ${item.ageRestrictions.maxAge}`}
                            </p>
                          </div>
                        )}

                        {/* Cancellation Policy */}
                        {item.cancellationPolicy && (
                          <div className={styles.policySection}>
                            <h4 className={styles.sectionTitle}>Cancellation Policy</h4>
                            <p className={styles.policyText}>{item.cancellationPolicy}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className={styles.cardActions}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardExpansion(item._id);
                        }}
                        className={styles.expandButton}
                      >
                        {isExpanded ? (
                          <>
                            <FontAwesomeIcon icon={faChevronUp} />
                            Show Less
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faChevronDown} />
                            Show More
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(item);
                        }}
                        className={styles.cardButton}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}