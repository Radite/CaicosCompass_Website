"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./diningdetails.module.css";

interface Image {
  url: string;
  isMain?: boolean;
  _id?: string;
}

interface OperatingHour {
  day: string;
  openTime: string;
  closeTime: string;
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
  priceRange?: string;
  menuUrl?: string;
  operatingHours?: OperatingHour[];
  reviews?: Review[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  serviceType: string;
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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Parse the dining item from the query parameter.
  useEffect(() => {
    const itemParam = searchParams.get("item");
    if (itemParam) {
      try {
        const parsed: DiningItem = JSON.parse(safeDecode(itemParam));
        setItem(parsed);
        
        // Set the first image or main image as selected
        const mainImage = parsed.images.find(img => img.isMain)?.url;
        setSelectedImage(mainImage || parsed.images[0]?.url || null);
      } catch (error) {
        console.error("Error parsing dining item:", error);
      }
    }
  }, [searchParams]);

  // Get the user's location.
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error retrieving user location:", error);
        }
      );
    }
  }, []);

  if (!item) {
    return <div className={styles.container}>Loading dining details...</div>;
  }

  // Build a Google Maps embed URL centered on the dining location.
  const mapSrc = `https://maps.google.com/maps?q=${item.coordinates.latitude},${item.coordinates.longitude}&z=15&output=embed`;

  // Calculate average rating
  const averageRating = item.reviews && item.reviews.length > 0
    ? (item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length).toFixed(1)
    : "N/A";

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
                className={`${styles.thumbnailImage} ${img.url === selectedImage ? styles.activeThumbnail : ""}`}
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
              <span>{item.location} - {item.island}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Cuisine:</span>
              <span>{item.cuisineTypes?.join(", ") || "Various"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Price Range:</span>
              <span>{item.priceRange || "N/A"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Rating:</span>
              <span className={styles.ratingDisplay}>
                {averageRating} {averageRating !== "N/A" && <span className={styles.ratingStars}>★★★★★</span>}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <aside className={styles.sidebarSection}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Operating Hours</h2>
            {item.operatingHours && item.operatingHours.length > 0 ? (
              item.operatingHours.map((hour, index) => (
                <div key={index} className={styles.hourRow}>
                  <span className={styles.day}>{hour.day}</span>
                  <span className={styles.time}>{hour.openTime} - {hour.closeTime}</span>
                </div>
              ))
            ) : (
              <p>No operating hours available</p>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Location</h2>
            <div className={styles.locationInfo}>
              <p>{item.location}</p>
              <p>{item.island}</p>
              <p className={styles.coordinates}>
                Coordinates: {item.coordinates.latitude.toFixed(6)}, {item.coordinates.longitude.toFixed(6)}
              </p>
              <div className={styles.mapContainer}>
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: "10px" }}
                  allowFullScreen
                  loading="lazy"
                  title="Dining Location Map"
                ></iframe>
              </div>
            </div>
          </section>
        </aside>

        <main className={styles.mainContent}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Special Features</h2>
            <div className={styles.featuresList}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🍽️</div>
                <div className={styles.featureText}>Caribbean Cuisine</div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🌊</div>
                <div className={styles.featureText}>Ocean View</div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🍷</div>
                <div className={styles.featureText}>Full Bar</div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>♿</div>
                <div className={styles.featureText}>Wheelchair Accessible</div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Reviews</h2>
            {item.reviews && item.reviews.length > 0 ? (
              item.reviews.map((review, index) => (
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
              ))
            ) : (
              <p className={styles.noReviews}>No reviews yet. Be the first to review!</p>
            )}
          </section>
        </main>
      </div>
      <div className={styles.actions}>
  <button
    onClick={() => router.push("/favorites")}
    className={styles.actionButton}
  >
    Add to Favorites
  </button>
  <button
    onClick={() => {
      if (item.menuUrl) {
        window.open(item.menuUrl, "_blank");
      } else {
        alert("Menu unavailable.");
      }
    }}
    className={styles.actionButton}
  >
    View Menu
  </button>
  <button
    className={styles.actionButton}
    onClick={() => router.push(`/reservations?restaurant=${item.name}`)}
  >

    Make an Order
  </button>
  <p className={styles.orderNote}>* Orders are pickup only.</p>
</div>


    </div>
  );
}