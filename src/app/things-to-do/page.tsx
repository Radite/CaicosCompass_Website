"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ThingsToDo.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, 
  faMapMarkerAlt, 
  faStar, 
  faSort, 
  faFilter 
} from "@fortawesome/free-solid-svg-icons";

interface Activity {
  _id: string;
  name: string;
  location: string;
  island: string;
  price?: number;
  options?: { cost: number }[];
  category?: string;
  images?: { url: string; isMain?: boolean }[];
  reviews?: { rating: number }[];
}

export default function ThingsToDo() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [islands, setIslands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIsland, setSelectedIsland] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:5000/api/services/type/activities")
      .then((res) => res.json())
      .then((data: Activity[]) => {
        setActivities(data);
        setFilteredActivities(data);
        extractFilters(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch activities:", err);
        setIsLoading(false);
      });
  }, []);

  const extractFilters = (data: Activity[]) => {
    const categorySet = new Set<string>();
    const islandSet = new Set<string>();
    data.forEach((activity) => {
      if (activity.category) categorySet.add(activity.category);
      if (activity.island) islandSet.add(activity.island);
    });
    setCategories(Array.from(categorySet));
    setIslands(Array.from(islandSet));
  };

  // Helper function to get the lowest price from an activity
  const getLowestPrice = (activity: Activity): number => {
    if (activity.options && activity.options.length > 0) {
      const prices = activity.options.map(option => option.cost);
      return Math.min(...prices);
    }
    return activity.price || 0;
  };

  // Helper function to get the highest price from an activity
  const getHighestPrice = (activity: Activity): number => {
    if (activity.options && activity.options.length > 0) {
      const prices = activity.options.map(option => option.cost);
      return Math.max(...prices);
    }
    return activity.price || 0;
  };

  // Calculate average rating
  const getAverageRating = (reviews?: { rating: number }[]): number => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  };

  const handleFilter = () => {
    let filtered = [...activities];

    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (selectedIsland) {
      filtered = filtered.filter((item) => item.island === selectedIsland);
    }

    if (sortOption) {
      filtered = filtered.sort((a, b) => {
        switch (sortOption) {
          case "PriceLowHigh":
            return getLowestPrice(a) - getLowestPrice(b);
          case "PriceHighLow":
            return getHighestPrice(b) - getHighestPrice(a);
          case "AtoZ":
            return a.name.localeCompare(b.name);
          case "ZtoA":
            return b.name.localeCompare(a.name);
          case "RatingHighLow":
            return getAverageRating(b.reviews) - getAverageRating(a.reviews);
          default:
            return 0;
        }
      });
    }

    setFilteredActivities(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [searchQuery, selectedCategory, selectedIsland, sortOption]);

  const handleViewDetails = (activity: Activity) => {
    const queryParam = encodeURIComponent(JSON.stringify(activity));
    router.push(`/booking?activity=${queryParam}`);
  };

  // Format rating for display
  const formatRating = (rating: number): string => {
    return rating.toFixed(1);
  };

  return (
    <div className={styles.container}>
      {/* Page Title Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Discover Extraordinary Experiences</h1>
        <p className={styles.subtitle}>
          Explore the finest activities and excursions in Turks and Caicos
        </p>
      </div>

      {/* Filter Section */}
      <div className={styles.filterContainer}>
        <div className={styles.filterSection}>
          <div className={styles.searchInputContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Search experiences..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedIsland}
              onChange={(e) => setSelectedIsland(e.target.value)}
            >
              <option value="">All Islands</option>
              {islands.map((island) => (
                <option key={island} value={island}>
                  {island}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faSort} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="AtoZ">A-Z</option>
              <option value="ZtoA">Z-A</option>
              <option value="PriceLowHigh">Price: Low to High</option>
              <option value="PriceHighLow">Price: High to Low</option>
              <option value="RatingHighLow">Top Rated</option>
            </select>
          </div>
        </div>
        
        <div className={styles.resultsCount}>
          {filteredActivities.length} experiences found
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Discovering exceptional experiences...</p>
        </div>
      ) : (
        <>
          {/* Excursion Cards */}
          <div className={styles.cardContainer}>
            {filteredActivities.length === 0 ? (
              <div className={styles.noResults}>
                <p>No experiences found matching your criteria.</p>
                <button 
                  className={styles.resetButton}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedIsland("");
                    setSortOption("");
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                // Determine Price Display
                let priceDisplay = "Pricing varies";
                let priceLabel = "From";
                
                if (activity.options && activity.options.length > 0) {
                  if (sortOption === "PriceHighLow") {
                    const highestPrice = getHighestPrice(activity);
                    priceDisplay = `$${highestPrice}`;
                    priceLabel = "Highest Price";
                  } else {
                    const lowestPrice = getLowestPrice(activity);
                    priceDisplay = `$${lowestPrice}`;
                  }
                } else if (activity.price) {
                  priceDisplay = `$${activity.price}`;
                  if (sortOption === "PriceHighLow") {
                    priceLabel = "Highest Price";
                  }
                }

                const avgRating = getAverageRating(activity.reviews);

                return (
                  <div key={activity._id} className={styles.card}>
                    <div className={styles.cardImageContainer}>
                      <img
                        src={
                          activity.images?.find((img) => img.isMain)?.url ||
                          "https://via.placeholder.com/400x220?text=Experience"
                        }
                        alt={activity.name}
                        className={styles.cardImg}
                      />
                      {activity.category && (
                        <span className={styles.categoryTag}>
                          {activity.category}
                        </span>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{activity.name}</h3>
                      
                      <div className={styles.locationContainer}>
                        <FontAwesomeIcon 
                          icon={faMapMarkerAlt} 
                          className={styles.locationIcon} 
                        />
                        <p className={styles.locationText}>
                          {activity.location}, {activity.island}
                        </p>
                      </div>
                      
                      {activity.reviews && activity.reviews.length > 0 && (
                        <div className={styles.ratingContainer}>
                          <FontAwesomeIcon 
                            icon={faStar} 
                            className={styles.starIcon} 
                          />
                          <span className={styles.ratingText}>
                            {formatRating(avgRating)} ({activity.reviews.length} {activity.reviews.length === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      )}
                      
                      <div className={styles.priceContainer}>
                        <span className={styles.priceLabel}>{priceLabel}</span>
                        <span className={styles.priceValue}>{priceDisplay}</span>
                      </div>
                      
                      <button
                        onClick={() => handleViewDetails(activity)}
                        className={styles.cardButton}
                      >
                        View Details
                      </button>
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