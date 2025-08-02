"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./shoppingdetails.module.css";

interface Image {
  url: string;
  isMain?: boolean;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  quantity?: number;
  images: Image[];
  availability: string;
}

interface OpeningHour {
  day: string;
  openTime: string;
  closeTime: string;
  _id?: string;
}

interface CustomClosure {
  date: string;
  reason?: string;
  _id?: string;
}

interface ShoppingItem {
  _id: string;
  name: string;
  description: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  images: Image[];
  island: string;
  serviceType: string;
  storeType: string;
  priceRange: string;
  products: Product[];
  openingHours: OpeningHour[];
  customClosures?: CustomClosure[];
  paymentOptions: string[];
  deliveryAvailable: boolean;
}

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch (error) {
    console.error("Error parsing shopping item:", error);
    return str;
  }
}

// Helper function to determine stock status based on quantity
function getStockStatus(quantity: number = 0): {
  status: 'In Stock' | 'Limited' | 'Out of Stock';
  color: string;
  icon: string;
} {
  if (quantity === 0) {
    return { status: 'Out of Stock', color: '#dc3545', icon: '❌' };
  } else if (quantity <= 5) {
    return { status: 'Limited', color: '#ffc107', icon: '⚠️' };
  } else {
    return { status: 'In Stock', color: '#28a745', icon: '✅' };
  }
}

// Helper function to get stock display text
function getStockDisplayText(quantity: number = 0): string {
  if (quantity === 0) {
    return 'Out of Stock';
  } else if (quantity <= 5) {
    return `Only ${quantity} left`;
  } else if (quantity <= 20) {
    return `${quantity} in stock`;
  } else {
    return 'In Stock';
  }
}

export default function ShoppingDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<ShoppingItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedStockFilter, setSelectedStockFilter] = useState<string>("all");
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [currentModalIndex, setCurrentModalIndex] = useState<number>(0);

  useEffect(() => {
    const itemParam = searchParams.get("item");
    if (itemParam) {
      try {
        const parsed: ShoppingItem = JSON.parse(safeDecode(itemParam));
        setItem(parsed);
        const mainImage = parsed.images.find((img) => img.isMain)?.url;
        setSelectedImage(mainImage || parsed.images[0]?.url || null);
      } catch (error) {
        console.error("Error parsing shopping item:", error);
      }
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

  if (!item) {
    return <div className={styles.container}>Loading shopping details...</div>;
  }

  // Filter products based on both category and stock status
  const filteredProducts = item.products.filter(product => {
    // Category filter
    const categoryMatch = selectedTab === "all" || 
      product.category.toLowerCase() === selectedTab.toLowerCase();
    
    // Stock filter
    let stockMatch = true;
    if (selectedStockFilter !== "all") {
      const stockInfo = getStockStatus(product.quantity || 0);
      stockMatch = stockInfo.status.toLowerCase().replace(/\s+/g, '') === 
                   selectedStockFilter.toLowerCase().replace(/\s+/g, '');
    }
    
    return categoryMatch && stockMatch;
  });

  // Get unique categories for product tabs
  const categories = [
    "all",
    ...new Set(item.products.map((product) => product.category.toLowerCase())),
  ];

  // Get stock status counts for filter buttons
  const stockCounts = {
    all: item.products.length,
    instock: item.products.filter(p => (p.quantity || 0) > 5).length,
    limited: item.products.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) <= 5).length,
    outofstock: item.products.filter(p => (p.quantity || 0) === 0).length
  };

  // Check if store is currently open
  const getCurrentDayHours = () => {
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return item.openingHours.find(hours => hours.day === currentDay);
  };

  const todayHours = getCurrentDayHours();

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

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        Back
      </button>

      {/* Status info above image */}
      {(item.deliveryAvailable || todayHours || item.products.length > 0) && (
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '15px',
          flexWrap: 'wrap'
        }}>
          {item.deliveryAvailable && (
            <div style={{
              background: '#28a745',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              🚚 Delivery Available
            </div>
          )}
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
              <span className={styles.infoLabel}>🏪 Store Type:</span>
              <span>{item.storeType}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>💰 Price Range:</span>
              <span>{item.priceRange}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>🚚 Delivery:</span>
              <span style={{ 
                color: item.deliveryAvailable ? '#28a745' : '#dc3545',
                fontWeight: '600'
              }}>
                {item.deliveryAvailable ? "✅ Available" : "❌ Not Available"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>💳 Payment:</span>
              <span>{item.paymentOptions.join(", ")}</span>
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
            {item.openingHours.map((hour, index) => {
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
            })}
          </div>

{item.customClosures && item.customClosures.length > 0 && (
  <div className={styles.section}>
    <h2 className={styles.sectionTitle}>📅 Special Closures</h2>
    {item.customClosures.map((closure, index) => {
      // Format date for TCI timezone - extract date part to avoid UTC conversion
      const formatClosureDate = (dateInput: string | Date) => {
        let dateString: string;
        
        if (dateInput instanceof Date) {
          dateString = dateInput.toISOString();
        } else if (typeof dateInput === 'string') {
          dateString = dateInput;
        } else {
          return 'Invalid Date';
        }
        
        const dateOnly = dateString.split('T')[0]; // Gets "2025-07-30"
        const [year, month, day] = dateOnly.split('-').map(Number);
        const localDate = new Date(year, month - 1, day); // month is 0-indexed
        
        return localDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      };
      
      return (
        <div key={index} className={styles.closure}>
          <p className={styles.closureDate}>
            {formatClosureDate(closure.date)}
          </p>
          <p className={styles.closureReason}>{closure.reason}</p>
        </div>
      );
    })}
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
                  src={`https://maps.google.com/maps?q=${item.coordinates.latitude},${item.coordinates.longitude}&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: "10px" }}
                  allowFullScreen
                  loading="lazy"
                  title="Shop Location Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: '2', minWidth: '400px' }}>
          <div className={styles.servicesSection}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 className={styles.sectionTitle}>🛍️ Products & Services</h2>
              <div style={{
                background: '#e9ecef',
                color: '#495057',
                padding: '8px 15px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
              </div>
            </div>

            {/* Stock Status Filter */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '1rem',
                color: '#495057',
                fontWeight: '600'
              }}>
                📦 Filter by Stock Status:
              </h4>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '15px'
              }}>
                <button
                  onClick={() => setSelectedStockFilter("all")}
                  style={{
                    background: selectedStockFilter === "all" ? '#0C54CF' : '#f8f9fa',
                    color: selectedStockFilter === "all" ? 'white' : '#495057',
                    border: '1px solid #dee2e6',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  All ({stockCounts.all})
                </button>
                <button
                  onClick={() => setSelectedStockFilter("instock")}
                  style={{
                    background: selectedStockFilter === "instock" ? '#28a745' : '#f8f9fa',
                    color: selectedStockFilter === "instock" ? 'white' : '#495057',
                    border: '1px solid #dee2e6',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ✅ In Stock ({stockCounts.instock})
                </button>
                <button
                  onClick={() => setSelectedStockFilter("limited")}
                  style={{
                    background: selectedStockFilter === "limited" ? '#ffc107' : '#f8f9fa',
                    color: selectedStockFilter === "limited" ? 'white' : '#495057',
                    border: '1px solid #dee2e6',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ⚠️ Limited ({stockCounts.limited})
                </button>
                <button
                  onClick={() => setSelectedStockFilter("outofstock")}
                  style={{
                    background: selectedStockFilter === "outofstock" ? '#dc3545' : '#f8f9fa',
                    color: selectedStockFilter === "outofstock" ? 'white' : '#495057',
                    border: '1px solid #dee2e6',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ❌ Out of Stock ({stockCounts.outofstock})
                </button>
              </div>
            </div>

            {/* Product category tabs */}
            {categories.length > 1 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  margin: '0 0 10px 0', 
                  fontSize: '1rem',
                  color: '#495057',
                  fontWeight: '600'
                }}>
                  🏷️ Filter by Category:
                </h4>
                <div className={styles.servicesTabs}>
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`${styles.serviceTab} ${
                        selectedTab === category ? styles.activeTab : ""
                      }`}
                      onClick={() => setSelectedTab(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active filters display */}
            {(selectedTab !== "all" || selectedStockFilter !== "all") && (
              <div style={{
                background: '#f8f9fa',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ 
                    fontSize: '0.9rem', 
                    color: '#495057',
                    fontWeight: '600' 
                  }}>
                    🔍 Active Filters:
                  </span>
                  {selectedTab !== "all" && (
                    <span style={{
                      background: '#0C54CF',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      Category: {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                    </span>
                  )}
                  {selectedStockFilter !== "all" && (
                    <span style={{
                      background: selectedStockFilter === "instock" ? '#28a745' :
                                 selectedStockFilter === "limited" ? '#ffc107' : '#dc3545',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      Stock: {selectedStockFilter.charAt(0).toUpperCase() + 
                               selectedStockFilter.slice(1).replace(/([A-Z])/g, ' $1')}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedTab("all");
                      setSelectedStockFilter("all");
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#6c757d',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}

            {/* Display filtered products */}
            {filteredProducts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
                  {selectedStockFilter === "outofstock" ? "📦" : 
                   selectedStockFilter === "limited" ? "⚠️" : 
                   selectedStockFilter === "instock" ? "✅" : "🔍"}
                </div>
                <h3 style={{ color: '#495057', marginBottom: '10px' }}>
                  {selectedStockFilter === "outofstock" ? "No out-of-stock items" :
                   selectedStockFilter === "limited" ? "No limited stock items" :
                   selectedStockFilter === "instock" ? "No in-stock items" :
                   "No products found"}
                </h3>
                <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                  {selectedTab !== "all" && selectedStockFilter !== "all" 
                    ? `No ${selectedStockFilter.replace(/([A-Z])/g, ' $1').toLowerCase()} products in the ${selectedTab} category.`
                    : selectedTab !== "all" 
                    ? `No products available in the ${selectedTab} category.`
                    : selectedStockFilter !== "all"
                    ? `No ${selectedStockFilter.replace(/([A-Z])/g, ' $1').toLowerCase()} products available.`
                    : "No products are available in this store."
                  }
                </p>
                {(selectedTab !== "all" || selectedStockFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSelectedTab("all");
                      setSelectedStockFilter("all");
                    }}
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
                    🔄 Show All Products
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map((product) => {
                const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
                const savingsAmount = hasDiscount ? product.price - product.discountedPrice! : 0;
                const stockInfo = getStockStatus(product.quantity || 0);
                const stockDisplayText = getStockDisplayText(product.quantity || 0);
                const isOutOfStock = (product.quantity || 0) === 0;
                
                return (
                  <div key={product._id} className={styles.serviceDetails}>
                    <div className={styles.serviceHeader}>
                      <div>
                        <h3 className={styles.serviceName}>{product.name}</h3>
                        <p className={styles.serviceCategory}>📦 {product.category}</p>
                      </div>
                      <div className={styles.serviceMeta}>
                        <div className={styles.serviceAvailability} style={{
                          color: stockInfo.color
                        }}>
                          {stockInfo.icon} {stockDisplayText}
                        </div>
                        <div className={styles.servicePrice}>
                          {hasDiscount ? (
                            <>
                              <span className={styles.discountedPrice}>
                                ${product.discountedPrice}
                              </span>
                              <span className={styles.originalPrice}>
                                ${product.price}
                              </span>
                              <div style={{
                                fontSize: '0.8rem',
                                color: '#28a745',
                                fontWeight: '600',
                                marginTop: '4px'
                              }}>
                                💰 Save ${savingsAmount.toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <span>${product.price}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className={styles.serviceDescription}>
                      {product.description}
                    </p>

                    {product.images && product.images.length > 0 && (
                      <div className={styles.serviceImages}>
                        {product.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt={`${product.name} ${idx + 1}`}
                            className={styles.serviceImage}
                            onClick={() => openImageModal(img.url, product.images.map(i => i.url))}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Quantity and Stock Info */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '15px',
                      padding: '12px',
                      background: isOutOfStock ? '#ffebee' : '#f8f9fa',
                      borderRadius: '8px',
                      border: isOutOfStock ? '1px solid #ffcdd2' : '1px solid #e9ecef'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: stockInfo.color,
                          fontWeight: '600' 
                        }}>
                          {stockInfo.icon} {stockInfo.status}
                        </div>
                        {product.quantity !== undefined && (
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#6c757d',
                            marginTop: '2px'
                          }}>
                            {product.quantity > 0 ? `${product.quantity} available` : 'Currently unavailable'}
                          </div>
                        )}
                      </div>
                      
                      <button
                        style={{
                          background: isOutOfStock ? '#6c757d' : '#0C54CF',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          opacity: isOutOfStock ? 0.6 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        disabled={isOutOfStock}
                        onMouseOver={(e) => {
                          if (!isOutOfStock) {
                            e.currentTarget.style.background = '#0a4bb8';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isOutOfStock) {
                            e.currentTarget.style.background = '#0C54CF';
                          }
                        }}
                        onClick={() => {
                          if (!isOutOfStock) {
                            // Add your buy/cart logic here
                            alert(`Adding ${product.name} to cart!`);
                          }
                        }}
                      >
                        {isOutOfStock ? '❌ Unavailable' : '🛒 Add to Cart'}
                      </button>
                    </div>

                    {hasDiscount && !isOutOfStock && (
                      <div style={{
                        background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        marginTop: '15px',
                        fontWeight: '600',
                        textAlign: 'center',
                        fontSize: '0.95rem'
                      }}>
                        🔥 Limited Time: {Math.round((savingsAmount / product.price) * 100)}% OFF!
                      </div>
                    )}

                    {/* Low stock warning */}
                    {!isOutOfStock && (product.quantity || 0) <= 5 && (product.quantity || 0) > 0 && (
                      <div style={{
                        background: '#fff3cd',
                        color: '#856404',
                        padding: '10px 15px',
                        borderRadius: '6px',
                        marginTop: '10px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        border: '1px solid #ffeaa7'
                      }}>
                        ⚠️ Hurry! Only {product.quantity} left in stock
                      </div>
                    )}
                  </div>
                );
              })
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
              alt="Product image"
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