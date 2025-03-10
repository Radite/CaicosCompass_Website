"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import styles from "./transportation.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

interface TransportationItem {
  _id: string;
  category: string;
  pricingModel: string;
  basePrice: number;
  flatPrice?: number;
  perMilePrice?: number;
  perHourPrice?: number;
  perDayPrice?: number;
  capacity?: number;
  amenities?: string[];
  specialConditions?: {
    noSmoking?: boolean;
    petFriendly?: boolean;
    minAgeRequirement?: number;
    validLicenseRequired?: boolean;
    securityDepositRequired?: boolean;
  };
  availability?: {
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
  images: { url: string; isMain?: boolean }[];
  contactDetails: {
    phone: string;
    email?: string;
    website?: string;
  };
}

export default function TransportationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [transportationItems, setTransportationItems] = useState<TransportationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  const fetchTransportationItems = async (category: string) => {
    setLoading(true);
    try {
      let response;
      if (category === "All") {
        response = await axios.get("http://localhost:5000/api/services/type/transportation");
      } else {
        response = await axios.get(
          `http://localhost:5000/api/services/transportation/category/${encodeURIComponent(category)}`
        );
      }
      setTransportationItems(response.data);
    } catch (error) {
      console.error("Error fetching transportation items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportationItems(selectedCategory);
  }, [selectedCategory]);

  // In case the query parameter changes, update the filter.
  useEffect(() => {
    const categoryFromQuery = searchParams.get("category") || "All";
    setSelectedCategory(categoryFromQuery);
  }, [searchParams]);

  const handleItemClick = (item: TransportationItem) => {
    router.push(`/transportationdetails?item=${encodeURIComponent(JSON.stringify(item))}`);
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Transportation Services</h1>
        <p className={styles.subtitle}>
          Discover seamless travel options in Turks and Caicos
        </p>
      </div>

      {/* Filter Section */}
      <div className={styles.filterContainer}>
        <div className={styles.filterSection}>
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
        </div>
        <div className={styles.resultsCount}>
          {transportationItems.length} services found
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
          {transportationItems.length > 0 ? (
            transportationItems.map((item) => (
              <div
                key={item._id}
                className={styles.card}
                onClick={() => handleItemClick(item)}
              >
                <div className={styles.cardImageContainer}>
                  <img
                    src={item.images.find((img) => img.isMain)?.url || item.images[0]?.url}
                    alt={item.category}
                    className={styles.cardImg}
                  />
                </div>
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{item.category}</h2>
                  <p className={styles.cardText}>Pricing Model: {item.pricingModel}</p>
                  <p className={styles.cardText}>Base Price: ${item.basePrice}</p>
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
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              <p>No transportation services available in this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
