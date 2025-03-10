"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./diningdetails.module.css";

interface Image {
  url: string;
  isMain?: boolean;
}

interface OperatingHour {
  day: string;
  openTime: string;
  closeTime: string;
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
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function DiningDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<DiningItem | null>(null);

  useEffect(() => {
    const itemParam = searchParams.get("item");
    if (itemParam) {
      try {
        const parsed: DiningItem = JSON.parse(decodeURIComponent(itemParam));
        setItem(parsed);
      } catch (error) {
        console.error("Error parsing dining item:", error);
      }
    }
  }, [searchParams]);

  if (!item) {
    return <div className={styles.container}>Loading dining details...</div>;
  }

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        Back
      </button>
      <div className={styles.carouselContainer}>
        {item.images.map((img, index) => (
          <img
            key={index}
            src={img.url}
            alt={`${item.name} ${index + 1}`}
            className={styles.carouselImage}
          />
        ))}
      </div>
      <h1 className={styles.title}>{item.name}</h1>
      <p className={styles.subtitle}>
        Cuisine: {item.cuisineTypes?.join(", ") || "N/A"}
      </p>
      <div className={styles.operatingHours}>
        <h3>Operating Hours</h3>
        {item.operatingHours && item.operatingHours.length > 0 ? (
          item.operatingHours.map((hour, index) => (
            <div key={index} className={styles.hourRow}>
              <span className={styles.day}>{hour.day}:</span>
              <span className={styles.time}>
                {hour.openTime} - {hour.closeTime}
              </span>
            </div>
          ))
        ) : (
          <p>No operating hours available</p>
        )}
      </div>
      <div className={styles.mapContainer}>
        {/* Replace this with your actual Map component or embed */}
        <p>Map placeholder for {item.location}</p>
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
      </div>
    </div>
  );
}
