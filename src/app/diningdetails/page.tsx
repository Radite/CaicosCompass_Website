"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./diningdetails.module.css";

interface Image {
  url: string;
  isMain?: boolean;
  _id?: string;
}

interface SideDish {
  name: string;
  price: number;
  _id?: string;
}

interface MenuItem {
  _id?: string;
  name: string;
  description?: string;
  category: 'Appetizers' | 'Main Courses' | 'Sides' | 'Desserts' | 'Drinks';
  price: number;
  images?: Image[];
  sides?: SideDish[];
}

interface OperatingHour {
  day: string;
  openTime: string;
  closeTime: string;
  _id?: string;
}

interface CustomClosure {
  date: string | Date;
  reason?: string;
  isRecurring?: boolean;
  _id?: string;
}

interface Review {
  user: string;
  rating: number;
  comment: string;
  createdAt: string;
  _id?: string;
}

interface DiningItem {
  _id: string;
  name: string;
  description: string;
  location: string;
  island: string;
  images: Image[];
  cuisineTypes?: string[];
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  menuPdf?: string;
  menuItems?: MenuItem[];
  operatingHours?: OperatingHour[];
  customClosures?: CustomClosure[];
  reviews?: Review[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  serviceType: string;
  hostId?: string;
}

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch (error) {
    console.error("Error decoding string, using original value:", error);
    return str;
  }
}

export default function DiningDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<DiningItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [currentModalIndex, setCurrentModalIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hostEmail, setHostEmail] = useState<string | null>(null);

  // Fetch host's email
  const fetchHostEmail = async (hostId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${hostId}/email`);
      if (response.ok) {
        const data = await response.json();
        setHostEmail(data.email);
      }
    } catch (error) {
      console.error('Error fetching host email:', error);
    }
  };

  // Parse the dining item from the query parameter
  useEffect(() => {
    const itemParam = searchParams.get("item");
    if (!itemParam) {
      setLoading(false);
      setError("No restaurant information provided");
      return;
    }

    try {
      let parsed: DiningItem;
      try {
        parsed = JSON.parse(itemParam);
      } catch {
        parsed = JSON.parse(safeDecode(itemParam));
      }
      
      setItem(parsed);
      
      // Set the first image or main image as selected
      const mainImage = parsed.images.find(img => img.isMain)?.url;
      setSelectedImage(mainImage || parsed.images[0]?.url || null);
      
      // Fetch host email
      if (parsed.hostId) {
        fetchHostEmail(parsed.hostId);
      } else {
        fetchHostEmail("6789cf36bd1c2a7c2ef540a7");
      }
    } catch (error) {
      console.error("Error parsing dining item:", error);
      setError("Unable to load restaurant details. Invalid data format.");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!modalImage) return;
      
      if (e.key === 'Escape') {
        closeImageModal();
      } else if (e.key === 'ArrowLeft') {
        navigateModal('prev');
      } else if (e.key === 'ArrowRight') {
        navigateModal('next');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [modalImage, currentModalIndex, modalImages]);

  if (loading) return <div className={styles.container}>Loading restaurant details...</div>;

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>{error}</div>
        <button onClick={() => router.back()} className={styles.backButton}>
          Back
        </button>
      </div>
    );
  }

  if (!item) return <div className={styles.container}>No restaurant details found</div>;

  // Calculate average rating
  const averageRating = item.reviews && item.reviews.length > 0
    ? (item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length).toFixed(1)
    : "N/A";

  // Get price range description
  const getPriceRangeDescription = (priceRange?: string) => {
    switch (priceRange) {
      case '$': return 'Budget-friendly ($10-25)';
      case '$$': return 'Moderate ($25-50)';
      case '$$$': return 'Upscale ($50-100)';
      case '$$$$': return 'Fine dining ($100+)';
      default: return 'Pricing varies';
    }
  };

  // Filter menu items by category
  const categories = ['All', 'Appetizers', 'Main Courses', 'Sides', 'Desserts', 'Drinks'];
  const filteredMenuItems = item.menuItems?.filter(menuItem => 
    selectedCategory === 'All' || menuItem.category === selectedCategory
  ) || [];

  // Group menu items by category for better display
  const groupedMenuItems = item.menuItems?.reduce((acc, menuItem) => {
    if (!acc[menuItem.category]) {
      acc[menuItem.category] = [];
    }
    acc[menuItem.category].push(menuItem);
    return acc;
  }, {} as Record<string, MenuItem[]>) || {};

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Check if restaurant is currently open
  const getCurrentDayHours = () => {
    if (!item.operatingHours || item.operatingHours.length === 0) return null;
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return item.operatingHours.find(hours => hours.day === currentDay);
  };

  const todayHours = getCurrentDayHours();

  // Format date for TCI timezone
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

  const formatLongDate = (dateInput: string | Date) => {
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
    
    return localDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Modal functions
  const openImageModal = (imageUrl: string, allImages: string[] = []) => {
    setModalImage(imageUrl);
    setModalImages(allImages.length > 0 ? allImages : [imageUrl]);
    setCurrentModalIndex(allImages.findIndex(img => img === imageUrl) || 0);
  };

  const closeImageModal = () => {
    setModalImage(null);
    setModalImages([]);
    setCurrentModalIndex(0);
  };

  const navigateModal = (direction: 'prev' | 'next') => {
    if (modalImages.length <= 1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentModalIndex === 0 ? modalImages.length - 1 : currentModalIndex - 1;
    } else {
      newIndex = currentModalIndex === modalImages.length - 1 ? 0 : currentModalIndex + 1;
    }
    
    setCurrentModalIndex(newIndex);
    setModalImage(modalImages[newIndex]);
  };

  // Reservation functions
  const handleMakeReservation = () => {
    const subject = `Reservation Request for ${item.name}`;
    const body = `Hello,\n\nI would like to make a reservation at ${item.name} (${item.location}, ${item.island}).\n\nPlease let me know your availability.\n\nThank you.`;
    const email = hostEmail || "contact@restaurant.com";
    
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handleOrderOnline = () => {
    const subject = `Order Request for ${item.name}`;
    const body = `Hello,\n\nI would like to place an order for pickup at ${item.name}.\n\nPlease let me know the process for ordering.\n\nThank you.`;
    const email = hostEmail || "contact@restaurant.com";
    
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  // Build a Google Maps embed URL centered on the dining location
  const mapSrc = `https://maps.google.com/maps?q=${item.coordinates.latitude},${item.coordinates.longitude}&z=15&output=embed`;

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        Back
      </button>

      {/* Status info above image */}
      {(todayHours || item.priceRange || item.cuisineTypes?.length) && (
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '15px',
          flexWrap: 'wrap'
        }}>
          {todayHours && (
            <div style={{
              background: '#0C54CF',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              🕐 Today: {todayHours.openTime} - {todayHours.closeTime}
            </div>
          )}
          {item.priceRange && (
            <div style={{
              background: '#28a745',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              💰 {item.priceRange} - {getPriceRangeDescription(item.priceRange).split(' (')[0]}
            </div>
          )}
          {item.cuisineTypes && item.cuisineTypes.length > 0 && (
            <div style={{
              background: '#17a2b8',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              🍽️ {item.cuisineTypes.slice(0, 2).join(", ")}
              {item.cuisineTypes.length > 2 && ` +${item.cuisineTypes.length - 2}`}
            </div>
          )}
        </div>
      )}

      <div className={styles.heroSection}>
        <div className={styles.mainImageContainer}>
          <img
            src={selectedImage || item.images[0]?.url || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={item.name}
            className={styles.mainImage}
            onClick={() => openImageModal(
              selectedImage || item.images[0]?.url || "", 
              item.images.map(img => img.url)
            )}
            style={{ cursor: 'pointer' }}
          />
          
          <div className={styles.imageThumbnails}>
            {item.images.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={`${item.name} thumbnail ${index + 1}`}
                className={`${styles.thumbnailImage} ${
                  img.url === selectedImage ? styles.activeThumbnail : ""
                }`}
                onClick={() => setSelectedImage(img.url)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.title}>{item.name}</h1>
          <p className={styles.description}>{item.description}</p>
          
          <div className={styles.infoBox}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>📍 Location:</span>
              <span>{item.location}, {item.island}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>🍽️ Cuisine:</span>
              <span>{item.cuisineTypes?.join(", ") || "Various"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>💰 Price Range:</span>
              <span>{item.priceRange} - {getPriceRangeDescription(item.priceRange).split(' (')[0]}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>⭐ Rating:</span>
              <span className={styles.ratingDisplay}>
                {averageRating} {averageRating !== "N/A" && <span className={styles.ratingStars}>★★★★★</span>}
                {item.reviews && item.reviews.length > 0 && (
                  <span className={styles.reviewCount}> ({item.reviews.length} reviews)</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Use simple div layout instead of CSS grid */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🕐 Operating Hours</h2>
            {item.operatingHours && item.operatingHours.length > 0 ? (
              item.operatingHours.map((hour, index) => {
                const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === hour.day;
                return (
                  <div 
                    key={index} 
                    className={styles.hourRow}
                    style={isToday ? {
                      background: 'rgba(12, 84, 207, 0.1)',
                      borderLeft: '3px solid #0C54CF',
                      paddingLeft: '15px',
                      fontWeight: '600'
                    } : {}}
                  >
                    <span className={styles.day} style={isToday ? { color: '#0C54CF' } : {}}>
                      {hour.day}
                    </span>
                    <span className={styles.time}>
                      {hour.openTime} - {hour.closeTime}
                    </span>
                  </div>
                );
              })
            ) : (
              <p>No operating hours available</p>
            )}
          </div>

          {item.customClosures && item.customClosures.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>📅 Special Closures</h2>
              {item.customClosures.map((closure, index) => (
                <div key={index} className={styles.closure}>
                  <p className={styles.closureDate}>
                    {formatLongDate(closure.date)}
                  </p>
                  <p className={styles.closureReason}>{closure.reason}</p>
                  {closure.isRecurring && (
                    <span className={styles.recurringBadge}>📅 Yearly</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📍 Location & Map</h2>
            <div className={styles.locationInfo}>
              <p><strong>{item.location}</strong></p>
              <p>{item.island}</p>
              <p className={styles.coordinates}>
                📌 {item.coordinates.latitude.toFixed(6)}, {item.coordinates.longitude.toFixed(6)}
              </p>
              <div className={styles.mapContainer}>
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: "10px" }}
                  allowFullScreen
                  loading="lazy"
                  title="Restaurant Location Map"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtonsContainer}>
            <button
              onClick={handleMakeReservation}
              className={styles.primaryActionButton}
            >
              📞 Make Reservation
            </button>
            <button
              onClick={handleOrderOnline}
              className={styles.secondaryActionButton}
            >
              🛒 Order Online
            </button>
            {item.menuPdf && (
              <button
                onClick={() => window.open(item.menuPdf, "_blank")}
                className={styles.tertiaryActionButton}
              >
                📄 View Full Menu (PDF)
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: '2', minWidth: '400px' }}>
          {/* Menu Section */}
          {item.menuItems && item.menuItems.length > 0 && (
            <div className={styles.menuSection}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 className={styles.sectionTitle}>🍽️ Menu</h2>
                <div style={{
                  background: '#e9ecef',
                  color: '#495057',
                  padding: '8px 15px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {filteredMenuItems.length} items
                </div>
              </div>
              
              {/* Category Filter */}
              <div className={styles.categoryFilter}>
                {categories.map(category => {
                  const count = category === 'All' 
                    ? item.menuItems?.length || 0
                    : groupedMenuItems[category]?.length || 0;
                  
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`${styles.categoryButton} ${
                        selectedCategory === category ? styles.active : ''
                      }`}
                      disabled={count === 0}
                    >
                      {category} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Menu Items Display */}
              {selectedCategory === 'All' ? (
                // Show all categories grouped
                Object.entries(groupedMenuItems).map(([category, items]) => (
                  <div key={category} className={styles.menuCategorySection}>
                    <h3 className={styles.menuCategoryTitle}>
                      {category} ({items.length})
                    </h3>
                    <div className={styles.menuGrid}>
                      {items.map((menuItem, index) => (
                        <div key={menuItem._id || index} className={styles.menuItem}>
                          {menuItem.images && menuItem.images.length > 0 && (
                            <div className={styles.menuItemImageContainer}>
                              <img 
                                src={menuItem.images.find(img => img.isMain)?.url || menuItem.images[0]?.url} 
                                alt={menuItem.name}
                                className={styles.menuItemImage}
                                onClick={() => openImageModal(
                                  menuItem.images!.find(img => img.isMain)?.url || menuItem.images![0]?.url || "",
                                  menuItem.images!.map(img => img.url)
                                )}
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                          )}
                          <div className={styles.menuItemContent}>
                            <div className={styles.menuItemHeader}>
                              <h4 className={styles.menuItemName}>{menuItem.name}</h4>
                              <span className={styles.menuItemPrice}>
                                {formatPrice(menuItem.price)}
                              </span>
                            </div>
                            {menuItem.description && (
                              <p className={styles.menuItemDescription}>
                                {menuItem.description}
                              </p>
                            )}
                            <span className={styles.menuItemCategory}>
                              {menuItem.category}
                            </span>
                            {menuItem.sides && menuItem.sides.length > 0 && (
                              <div className={styles.sides}>
                                <span className={styles.sidesLabel}>Available sides:</span>
                                <div className={styles.sidesList}>
                                  {menuItem.sides.map((side, sideIndex) => (
                                    <span key={side._id || sideIndex} className={styles.side}>
                                      {side.name} (+{formatPrice(side.price)})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Show filtered category
                <div className={styles.menuGrid}>
                  {filteredMenuItems.map((menuItem, index) => (
                    <div key={menuItem._id || index} className={styles.menuItem}>
                      {menuItem.images && menuItem.images.length > 0 && (
                        <div className={styles.menuItemImageContainer}>
                          <img 
                            src={menuItem.images.find(img => img.isMain)?.url || menuItem.images[0]?.url} 
                            alt={menuItem.name}
                            className={styles.menuItemImage}
                            onClick={() => openImageModal(
                              menuItem.images!.find(img => img.isMain)?.url || menuItem.images![0]?.url || "",
                              menuItem.images!.map(img => img.url)
                            )}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      )}
                      <div className={styles.menuItemContent}>
                        <div className={styles.menuItemHeader}>
                          <h4 className={styles.menuItemName}>{menuItem.name}</h4>
                          <span className={styles.menuItemPrice}>
                            {formatPrice(menuItem.price)}
                          </span>
                        </div>
                        {menuItem.description && (
                          <p className={styles.menuItemDescription}>
                            {menuItem.description}
                          </p>
                        )}
                        <span className={styles.menuItemCategory}>
                          {menuItem.category}
                        </span>
                        {menuItem.sides && menuItem.sides.length > 0 && (
                          <div className={styles.sides}>
                            <span className={styles.sidesLabel}>Available sides:</span>
                            <div className={styles.sidesList}>
                              {menuItem.sides.map((side, sideIndex) => (
                                <span key={side._id || sideIndex} className={styles.side}>
                                  {side.name} (+{formatPrice(side.price)})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredMenuItems.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '2px dashed #dee2e6'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🍽️</div>
                  <h3 style={{ color: '#495057', marginBottom: '10px' }}>
                    No menu items found
                  </h3>
                  <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                    {selectedCategory === 'All' 
                      ? "This restaurant hasn't added menu items yet."
                      : `No items available in the ${selectedCategory} category.`
                    }
                  </p>
                  {selectedCategory !== 'All' && (
                    <button
                      onClick={() => setSelectedCategory('All')}
                      style={{
                        background: '#0C54CF',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                    >
                      🔄 Show All Categories
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Restaurant Features */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>✨ Restaurant Features</h2>
            <div className={styles.featuresList}>
              {item.cuisineTypes?.map((cuisine, index) => (
                <div key={index} className={styles.feature}>
                  <div className={styles.featureIcon}>🍽️</div>
                  <div className={styles.featureText}>{cuisine} Cuisine</div>
                </div>
              ))}
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🌊</div>
                <div className={styles.featureText}>Island Location</div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🍷</div>
                <div className={styles.featureText}>Beverage Service</div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🛒</div>
                <div className={styles.featureText}>Takeout Available</div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>⭐ Reviews</h2>
            {item.reviews && item.reviews.length > 0 ? (
              <>
                <div style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⭐</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0C54CF' }}>
                    {averageRating}/5.0
                  </div>
                  <div style={{ color: '#6c757d', marginTop: '5px' }}>
                    Based on {item.reviews.length} {item.reviews.length === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
                {item.reviews.map((review, index) => (
                  <div key={index} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewRating}>
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                      <div className={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className={styles.reviewComment}>{review.comment}</p>
                  </div>
                ))}
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⭐</div>
                <h3 style={{ color: '#495057', marginBottom: '10px' }}>No reviews yet</h3>
                <p style={{ color: '#6c757d' }}>Be the first to review this restaurant!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={closeImageModal}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeImageModal}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}
            >
              ✕
            </button>

            {/* Navigation buttons */}
            {modalImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateModal('prev')}
                  style={{
                    position: 'absolute',
                    left: '-60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={() => navigateModal('next')}
                  style={{
                    position: 'absolute',
                    right: '-60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  ›
                </button>
              </>
            )}

            {/* Main image */}
            <img
              src={modalImage}
              alt="Restaurant or menu image"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}
            />

            {/* Image counter */}
            {modalImages.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {currentModalIndex + 1} of {modalImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}