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
    console.error("Error decoding string, using original value:", error);
    return str;
  }
}

export default function ShoppingDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<ShoppingItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("all");

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

  if (!item) {
    return <div className={styles.container}>Loading shopping details...</div>;
  }

  // Filter products based on selected category tab
  const filteredProducts =
    selectedTab === "all"
      ? item.products
      : item.products.filter(
          (product) =>
            product.category.toLowerCase() === selectedTab.toLowerCase()
        );

  // Get unique categories for product tabs
  const categories = [
    "all",
    ...new Set(item.products.map((product) => product.category.toLowerCase())),
  ];

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        Back
      </button>

      <div className={styles.heroSection}>
        <div className={styles.mainImageContainer}>
          <img
            src={selectedImage || item.images[0]?.url}
            alt={item.name}
            className={styles.mainImage}
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
              />
            ))}
          </div>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.title}>{item.name}</h1>
          <p className={styles.description}>{item.description}</p>

          <div className={styles.infoBox}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Location:</span>
              <span>
                {item.location} - {item.island}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Store Type:</span>
              <span>{item.storeType}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Price Range:</span>
              <span>{item.priceRange}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Delivery:</span>
              <span>{item.deliveryAvailable ? "Available" : "Not Available"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Payment:</span>
              <span>{item.paymentOptions.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <aside className={styles.sidebarSection}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Operating Hours</h2>
            {item.openingHours.map((hour, index) => (
              <div key={index} className={styles.hourRow}>
                <span className={styles.day}>{hour.day}</span>
                <span className={styles.time}>
                  {hour.openTime} - {hour.closeTime}
                </span>
              </div>
            ))}
          </section>

          {item.customClosures && item.customClosures.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Holiday Closures</h2>
              {item.customClosures.map((closure, index) => (
                <div key={index} className={styles.closure}>
                  <p className={styles.closureDate}>
                    {new Date(closure.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className={styles.closureReason}>{closure.reason}</p>
                </div>
              ))}
            </section>
          )}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Location</h2>
            <div className={styles.locationInfo}>
              <p>{item.location}</p>
              <p>{item.island}</p>
              <p className={styles.coordinates}>
                Coordinates: {item.coordinates.latitude.toFixed(6)},{" "}
                {item.coordinates.longitude.toFixed(6)}
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
          </section>
        </aside>

        <main className={styles.mainContent}>
          <section className={styles.servicesSection}>
            <h2 className={styles.sectionTitle}>Products</h2>

            {/* Product category tabs */}
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

            {/* Display filtered products */}
            {filteredProducts.length === 0 ? (
              <p className={styles.noAvailability}>
                No products available in this category.
              </p>
            ) : (
              filteredProducts.map((product) => (
                <div key={product._id} className={styles.serviceDetails}>
                  <div className={styles.serviceHeader}>
                    <div>
                      <h3 className={styles.serviceName}>{product.name}</h3>
                      <p className={styles.serviceCategory}>{product.category}</p>
                    </div>
                    <div className={styles.serviceMeta}>
                      <div className={styles.serviceAvailability}>
                        Availability: {product.availability}
                      </div>
                      <div className={styles.servicePrice}>
                        {product.discountedPrice ? (
                          <>
                            <span className={styles.discountedPrice}>
                              ${product.discountedPrice}
                            </span>
                            <span className={styles.originalPrice}>
                              ${product.price}
                            </span>
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
                        />
                      ))}
                    </div>
                  )}

                  {/* Purchase functionality removed – view-only mode */}
                </div>
              ))
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
