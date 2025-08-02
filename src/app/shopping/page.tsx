"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./shoppingpage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, 
  faFilter, 
  faMapMarkerAlt, 
  faClock, 
  faCreditCard, 
  faTruck, 
  faTag, 
  faCalendarTimes,
  faChevronDown,
  faChevronUp
} from "@fortawesome/free-solid-svg-icons";

interface Image {
  url: string;
  isMain?: boolean;
}

interface Product {
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  category: string;
  images: Image[];
  availability: string;
}

interface ShoppingItem {
  _id: string;
  name: string;
  description: string;
  location: string;
  island: string;
  images: Image[];
  storeType: string;
  priceRange: string;
  products: Product[];
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
  deliveryAvailable: boolean;
  host: string;
}

export default function ShoppingPage() {
  const router = useRouter();
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Filter state for storeType and priceRange.
  const [selectedFilters, setSelectedFilters] = useState({
    storeType: "All",
    priceRange: "All",
  });

  const storeTypes = ["All", "Boutique", "Market", "Luxury Store", "Souvenir Shop", "Specialty Store"];
  const priceRanges = ["All", "$", "$$", "$$$", "$$$$"];

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/services/type/shoppings")
      .then((res) => {
        setShoppingItems(res.data);
        setFilteredItems(res.data);
      })
      .catch((err) => console.error("Error fetching shopping data:", err))
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = () => {
    let updated = [...shoppingItems];
    if (selectedFilters.storeType !== "All") {
      updated = updated.filter((item) => item.storeType === selectedFilters.storeType);
    }
    if (selectedFilters.priceRange !== "All") {
      updated = updated.filter((item) => item.priceRange === selectedFilters.priceRange);
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
  }, [selectedFilters, searchQuery, shoppingItems]);

  const handleViewDetails = (item: ShoppingItem) => {
    const queryParam = encodeURIComponent(JSON.stringify(item));
    router.push(`/shoppingdetails?item=${queryParam}`);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedFilters({ storeType: "All", priceRange: "All" });
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

  const getCurrentDayHours = (openingHours: ShoppingItem['openingHours']) => {
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return openingHours.find(hours => hours.day === currentDay);
  };

// Replace your formatDate function and getUpcomingClosure function with these:

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

const getUpcomingClosure = (customClosures?: ShoppingItem['customClosures']) => {
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

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Shopping</h1>
        <p className={styles.subtitle}>
          Explore exclusive shopping experiences in Turks and Caicos
        </p>
      </div>

      {/* Filter Section */}
      <div className={styles.filterContainer}>
        <div className={styles.filterSection}>
          <div className={styles.searchInputContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Search shopping..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedFilters.storeType}
              onChange={(e) =>
                setSelectedFilters({ ...selectedFilters, storeType: e.target.value })
              }
            >
              {storeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedFilters.priceRange}
              onChange={(e) =>
                setSelectedFilters({ ...selectedFilters, priceRange: e.target.value })
              }
            >
              {priceRanges.map((pr) => (
                <option key={pr} value={pr}>
                  {pr}
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
          <p>Discovering exceptional shopping options...</p>
        </div>
      ) : (
        <>
          {/* Shopping Cards */}
          <div className={styles.cardContainer}>
            {filteredItems.length === 0 ? (
              <div className={styles.noResults}>
                <p>No shopping options available.</p>
                <button className={styles.resetButton} onClick={handleResetFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isExpanded = expandedCards.has(item._id);
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
                          "https://via.placeholder.com/400x220?text=Shopping"
                        }
                        alt={item.name}
                        className={styles.cardImg}
                      />
                      {item.deliveryAvailable && (
                        <div className={styles.deliveryBadge}>
                          <FontAwesomeIcon icon={faTruck} /> Delivery
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
                          <FontAwesomeIcon icon={faTag} className={styles.infoIcon} />
                          {item.storeType} • {item.priceRange}
                        </p>
                        
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

                      {item.description && (
                        <p className={styles.description}>
                          {item.description}
                        </p>
                      )}

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className={styles.expandedContent}>
                          {/* Products Section */}
                          {item.products && item.products.length > 0 && (
                            <div className={styles.productsSection}>
                              <h4 className={styles.sectionTitle}>Featured Products</h4>
                              <div className={styles.productsList}>
                                {item.products.slice(0, 3).map((product, index) => (
                                  <div key={index} className={styles.productItem}>
                                    <div className={styles.productInfo}>
                                      <span className={styles.productName}>{product.name}</span>
                                      <span className={styles.productPrice}>
                                        {product.discountedPrice ? (
                                          <>
                                            <span className={styles.originalPrice}>${product.price}</span>
                                            <span className={styles.discountedPrice}>${product.discountedPrice}</span>
                                          </>
                                        ) : (
                                          <span>${product.price}</span>
                                        )}
                                      </span>
                                    </div>
                                    <span className={`${styles.availability} ${
                                      product.availability === 'In Stock' ? styles.inStock : styles.limited
                                    }`}>
                                      {product.availability}
                                    </span>
                                  </div>
                                ))}
                                {item.products.length > 3 && (
                                  <p className={styles.moreProducts}>
                                    +{item.products.length - 3} more products
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Hours Section */}
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

                          {/* Payment Options */}
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
                        </div>
                      )}

                      <div className={styles.cardActions}>

                        
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
        </>
      )}
    </div>
  );
}