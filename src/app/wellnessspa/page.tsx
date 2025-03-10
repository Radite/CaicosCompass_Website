"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./wellnessspa.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter, faMapMarkerAlt, faStar } from "@fortawesome/free-solid-svg-icons";

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
  price: number;
  discountedPrice?: number;
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
  reviews: Review[];
}

export default function WellnessSpaPage() {
  const router = useRouter();
  const [items, setItems] = useState<WellnessSpaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WellnessSpaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedFilters, setSelectedFilters] = useState({
    spaType: "All",
  });

  const spaTypes = ["All", "Resort Spa", "Day Spa", "Medical Spa", "Holistic Spa", "Wellness Retreat"];

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/services/type/wellnessspa")
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
      updated = updated.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
              <button
                className={styles.resetButton}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFilters({ spaType: "All" });
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const startingPrice = getStartingPrice(item.servicesOffered);
              const avgRating = getAverageRating(item.reviews);

              return (
                <div key={item._id} className={styles.card} onClick={() => handleViewDetails(item)}>
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
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{item.name}</h3>
                    <div className={styles.locationContainer}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.locationIcon} />
                      <p className={styles.locationText}>{item.location} - {item.island}</p>
                    </div>
                    <p className={styles.cardText}>Spa Type: {item.spaType}</p>
                    <p className={styles.cardText}>Starting Price: ${startingPrice}</p>

                    {/* Reviews Section */}
                    {item.reviews && item.reviews.length > 0 && (
                      <div className={styles.ratingContainer}>
                        <FontAwesomeIcon icon={faStar} className={styles.starIcon} />
                        <span className={styles.ratingText}>
                          {avgRating} ({item.reviews.length} {item.reviews.length === 1 ? "review" : "reviews"})
                        </span>
                      </div>
                    )}

                    <button onClick={() => handleViewDetails(item)} className={styles.cardButton}>
                      View Details
                    </button>
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
