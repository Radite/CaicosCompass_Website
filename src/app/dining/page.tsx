"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./diningpage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, 
  faFilter, 
  faMapMarkerAlt, 
  faStar, 
  faClock, 
  faDollarSign, 
  faCalendarTimes,
  faChevronDown,
  faChevronUp,
  faUtensils,
  faHeart,
  faEye
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

interface MenuItem {
  name: string;
  description?: string;
  category: string;
  price: number;
  images?: Image[];
}

interface OperatingHour {
  day: string;
  openTime: string;
  closeTime: string;
}

interface CustomClosure {
  date: string | Date;
  reason?: string;
  isRecurring?: boolean;
}

interface DiningItem {
  _id: string;
  name: string;
  description: string;
  location: string;
  island: string;
  images: Image[];
  cuisineTypes: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  menuItems?: MenuItem[];
  operatingHours: OperatingHour[];
  customClosures?: CustomClosure[];
  reviews?: Review[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function DiningPage() {
  const router = useRouter();
  const [items, setItems] = useState<DiningItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DiningItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const [selectedFilters, setSelectedFilters] = useState({
    cuisineType: "All",
    priceRange: "All",
    island: "All",
  });

  const cuisineTypes = ["All", "Caribbean", "American", "Seafood", "Italian", "Mediterranean", "Indian", "Vegan", "Mexican", "Japanese", "Chinese", "French", "BBQ"];
  const priceRanges = ["All", "$", "$$", "$$$", "$$$$"];
  const islands = ["All", "Providenciales", "Grand Turk", "North Caicos", "Middle Caicos", "South Caicos", "Salt Cay"];

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/services/type/dinings")
      .then((res) => {
        setItems(res.data);
        setFilteredItems(res.data);
      })
      .catch((err) => console.error("Error fetching dining data:", err))
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = () => {
    let updated = [...items];
    
    if (selectedFilters.cuisineType !== "All") {
      updated = updated.filter((item) => 
        item.cuisineTypes?.includes(selectedFilters.cuisineType)
      );
    }
    
    if (selectedFilters.priceRange !== "All") {
      updated = updated.filter((item) => item.priceRange === selectedFilters.priceRange);
    }
    
    if (selectedFilters.island !== "All") {
      updated = updated.filter((item) => item.island === selectedFilters.island);
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

  const handleViewDetails = (item: DiningItem) => {
    const queryParam = encodeURIComponent(JSON.stringify(item));
    router.push(`/diningdetails?item=${queryParam}`);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedFilters({ 
      cuisineType: "All", 
      priceRange: "All", 
      island: "All" 
    });
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

  const getCurrentDayHours = (operatingHours: OperatingHour[]) => {
    if (!operatingHours || operatingHours.length === 0) return null;
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return operatingHours.find(hours => hours.day === currentDay);
  };

  const formatDate = (dateInput: string | Date) => {
    let dateString: string;
    
    if (dateInput instanceof Date) {
      dateString = dateInput.toISOString();
    } else if (typeof dateInput === 'string') {
      dateString = dateInput;
    } else {
      return 'Invalid Date';
    }
    
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    return localDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getUpcomingClosure = (customClosures?: CustomClosure[]) => {
    if (!customClosures || customClosures.length === 0) return null;
    
    const now = new Date();
    const tciOffset = -4 * 60;
    const tciNow = new Date(now.getTime() + (tciOffset * 60 * 1000));
    const todayDateString = tciNow.toISOString().split('T')[0];
    
    const upcoming = customClosures
      .map(closure => {
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
          dateString: dateString.split('T')[0],
          date: new Date(closure.date)
        };
      })
      .filter(closure => closure.dateString >= todayDateString)
      .sort((a, b) => a.dateString.localeCompare(b.dateString))[0];
    
    return upcoming;
  };

  const getPriceRangeDescription = (priceRange: string) => {
    switch (priceRange) {
      case '$': return 'Budget ($10-25)';
      case '$$': return 'Moderate ($25-50)';
      case '$$$': return 'Upscale ($50-100)';
      case '$$$$': return 'Fine Dining ($100+)';
      default: return 'Pricing varies';
    }
  };

  const getMenuPreview = (menuItems?: MenuItem[]) => {
    if (!menuItems || menuItems.length === 0) return null;
    return menuItems.slice(0, 3);
  };

  const getAverageRating = (reviews?: Review[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Restaurants & Dining</h1>
        <p className={styles.subtitle}>
          Discover authentic flavors and exceptional dining experiences across the Turks and Caicos Islands
        </p>
      </div>

      {/* Filter Section */}
      <div className={styles.filterContainer}>
        <div className={styles.filterSection}>
          <div className={styles.searchInputContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Search restaurants..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faUtensils} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedFilters.cuisineType}
              onChange={(e) =>
                setSelectedFilters({ ...selectedFilters, cuisineType: e.target.value })
              }
            >
              {cuisineTypes.map((type) => (
                <option key={type} value={type}>
                  {type} Cuisine
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faDollarSign} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedFilters.priceRange}
              onChange={(e) =>
                setSelectedFilters({ ...selectedFilters, priceRange: e.target.value })
              }
            >
              {priceRanges.map((range) => (
                <option key={range} value={range}>
                  {range === "All" ? "All Prices" : getPriceRangeDescription(range)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedFilters.island}
              onChange={(e) =>
                setSelectedFilters({ ...selectedFilters, island: e.target.value })
              }
            >
              {islands.map((island) => (
                <option key={island} value={island}>
                  {island === "All" ? "All Islands" : island}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={styles.resultsCount}>
          {filteredItems.length} restaurants found
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading restaurants...</p>
        </div>
      ) : (
        <div className={styles.cardContainer}>
          {filteredItems.length === 0 ? (
            <div className={styles.noResults}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🍽️</div>
              <h3>No restaurants found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button className={styles.resetButton} onClick={handleResetFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = expandedCards.has(item._id);
              const avgRating = getAverageRating(item.reviews);
              const todayHours = getCurrentDayHours(item.operatingHours);
              const upcomingClosure = getUpcomingClosure(item.customClosures);
              const menuPreview = getMenuPreview(item.menuItems);

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
                        "https://via.placeholder.com/400x220?text=Restaurant"
                      }
                      alt={item.name}
                      className={styles.cardImg}
                    />
                    <div className={styles.priceBadge}>
                      {item.priceRange}
                    </div>
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
                        <FontAwesomeIcon icon={faUtensils} className={styles.infoIcon} />
                        {item.cuisineTypes?.join(", ") || "Various cuisines"}
                      </p>
                      
                      <p className={styles.cardText}>
                        <FontAwesomeIcon icon={faDollarSign} className={styles.infoIcon} />
                        {getPriceRangeDescription(item.priceRange)}
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
                        {/* Menu Preview */}
                        {menuPreview && menuPreview.length > 0 && (
                          <div className={styles.menuSection}>
                            <h4 className={styles.sectionTitle}>Menu Highlights</h4>
                            <div className={styles.menuPreviewList}>
                              {menuPreview.map((menuItem, index) => (
                                <div key={index} className={styles.menuPreviewItem}>
                                  <div className={styles.menuItemInfo}>
                                    <span className={styles.menuItemName}>{menuItem.name}</span>
                                    <span className={styles.menuItemCategory}>{menuItem.category}</span>
                                    <span className={styles.menuItemPrice}>${menuItem.price}</span>
                                  </div>
                                  {menuItem.description && (
                                    <p className={styles.menuItemDescription}>
                                      {menuItem.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                              {item.menuItems && item.menuItems.length > 3 && (
                                <p className={styles.moreMenuItems}>
                                  +{item.menuItems.length - 3} more menu items
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Operating Hours */}
                        {item.operatingHours && item.operatingHours.length > 0 && (
                          <div className={styles.hoursSection}>
                            <h4 className={styles.sectionTitle}>Operating Hours</h4>
                            <div className={styles.hoursList}>
                              {item.operatingHours.map((hours, index) => {
                                const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === hours.day;
                                return (
                                  <div 
                                    key={index} 
                                    className={styles.hoursItem}
                                    style={isToday ? {
                                      background: 'rgba(12, 84, 207, 0.1)',
                                      fontWeight: '600',
                                      color: '#0C54CF'
                                    } : {}}
                                  >
                                    <span className={styles.day}>{hours.day}</span>
                                    <span className={styles.time}>{hours.openTime} - {hours.closeTime}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Cuisine Types */}
                        {item.cuisineTypes && item.cuisineTypes.length > 0 && (
                          <div className={styles.cuisineSection}>
                            <h4 className={styles.sectionTitle}>Cuisine Types</h4>
                            <div className={styles.cuisineTags}>
                              {item.cuisineTypes.map((cuisine, index) => (
                                <span key={index} className={styles.cuisineTag}>
                                  {cuisine}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reviews Preview */}
                        {item.reviews && item.reviews.length > 0 && (
                          <div className={styles.reviewsSection}>
                            <h4 className={styles.sectionTitle}>Recent Reviews</h4>
                            {item.reviews.slice(0, 2).map((review, index) => (
                              <div key={index} className={styles.reviewPreview}>
                                <div className={styles.reviewHeader}>
                                  <div className={styles.reviewRating}>
                                    {"★".repeat(review.rating)}
                                    {"☆".repeat(5 - review.rating)}
                                  </div>
                                  <div className={styles.reviewDate}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                                {review.comment && (
                                  <p className={styles.reviewComment}>
                                    {review.comment.length > 100 
                                      ? `${review.comment.substring(0, 100)}...` 
                                      : review.comment
                                    }
                                  </p>
                                )}
                              </div>
                            ))}
                            {item.reviews.length > 2 && (
                              <p className={styles.moreReviews}>
                                +{item.reviews.length - 2} more reviews
                              </p>
                            )}
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
                        <FontAwesomeIcon icon={faEye} />
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