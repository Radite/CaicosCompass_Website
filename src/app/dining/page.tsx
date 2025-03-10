"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./diningpage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

interface DiningItem {
  _id: string;
  name: string;
  location: string;
  island: string;
  images: { url: string; isMain?: boolean }[];
  cuisineTypes?: string[];
  priceRange?: string;
  reviews?: { rating: number }[]; // Optional: for sorting by reviews
  // Additional fields as needed
}

export default function DiningPage() {
  const router = useRouter();
  const [diningItems, setDiningItems] = useState<DiningItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DiningItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected filter values.
  const [selectedFilters, setSelectedFilters] = useState({
    islands: "All",
    cuisine: "All",
    sortOptions: "Reviews",
  });

  const islandsOptions = ["All", "Providenciales", "Grand Turk", "South Caicos"];
  const cuisineOptions = ["All", "Caribbean", "American", "Seafood", "Italian", "Vegan"];
  const sortOptions = ["Alphabetical", "Reviews"];

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/services/type/dining")
      .then((res) => {
        setDiningItems(res.data);
        setFilteredItems(res.data);
      })
      .catch((err) => console.error("Error fetching dining data:", err))
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = () => {
    let updatedItems = [...diningItems];

    // Filter by island.
    if (selectedFilters.islands !== "All") {
      updatedItems = updatedItems.filter(
        (item) => item.island === selectedFilters.islands
      );
    }

    // Filter by cuisine.
    if (selectedFilters.cuisine !== "All") {
      updatedItems = updatedItems.filter(
        (item) =>
          item.cuisineTypes && item.cuisineTypes.includes(selectedFilters.cuisine)
      );
    }

    // Sort items.
    if (selectedFilters.sortOptions === "Alphabetical") {
      updatedItems.sort((a, b) => a.name.localeCompare(b.name));
    } else if (selectedFilters.sortOptions === "Reviews") {
      updatedItems.sort(
        (a, b) =>
          ((b as any).reviews?.length || 0) - ((a as any).reviews?.length || 0)
      );
    }

    // Apply search filter.
    if (searchQuery.trim()) {
      updatedItems = updatedItems
        .map((item) => ({
          ...item,
          matchScore: item.name.toLowerCase().indexOf(searchQuery.toLowerCase()),
        }))
        .filter((item) => item.matchScore !== -1)
        .sort((a, b) => a.matchScore - b.matchScore);
    }

    setFilteredItems(updatedItems);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedFilters, searchQuery, diningItems]);

  const handleViewDetails = (item: DiningItem) => {
    const queryParam = encodeURIComponent(JSON.stringify(item));
    router.push(`./diningdetails?item=${queryParam}`);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedFilters({
      islands: "All",
      cuisine: "All",
      sortOptions: "Reviews",
    });
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Dining</h1>
        <p className={styles.subtitle}>
          Savor exquisite culinary experiences in Turks and Caicos
        </p>
      </div>

      {/* Filter Section */}
      <div className={styles.filterContainer}>
        <div className={styles.filterSection}>
          <div className={styles.searchInputContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Search dining..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedFilters.islands}
              onChange={(e) =>
                setSelectedFilters({ ...selectedFilters, islands: e.target.value })
              }
            >
              {islandsOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedFilters.cuisine}
              onChange={(e) =>
                setSelectedFilters({ ...selectedFilters, cuisine: e.target.value })
              }
            >
              {cuisineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedFilters.sortOptions}
              onChange={(e) =>
                setSelectedFilters({ ...selectedFilters, sortOptions: e.target.value })
              }
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.resultsCount}>
          {filteredItems.length} dining options found
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Discovering dining experiences...</p>
        </div>
      ) : (
        <div className={styles.cardContainer}>
          {filteredItems.length === 0 ? (
            <div className={styles.noResults}>
              <p>No dining options available.</p>
              <button className={styles.resetButton} onClick={handleResetFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item._id}
                className={styles.card}
                onClick={() => handleViewDetails(item)}
              >
                <div className={styles.cardImageContainer}>
                  <img
                    src={
                      item.images.find((img) => img.isMain)?.url ||
                      item.images[0]?.url ||
                      "https://via.placeholder.com/400x220?text=Dining"
                    }
                    alt={item.name}
                    className={styles.cardImg}
                  />
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.name}</h3>
                  <div className={styles.locationContainer}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.locationIcon} />
                    <p className={styles.locationText}>
                      {item.location}, {item.island}
                    </p>
                  </div>
                  <p className={styles.cardText}>
                    Cuisine: {item.cuisineTypes?.join(", ") || "N/A"}
                  </p>
                  <p className={styles.cardText}>
                    Price Range: {item.priceRange || "N/A"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
