"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./shoppingpage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

interface Image {
  url: string;
  isMain?: boolean;
}

interface Product {
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  category: string;
  images: Image[];
  availability: string;
}

interface ShoppingItem {
  _id: string;
  name: string;
  description: string;
  location: string;
  island: string;
  images: Image[];
  storeType: string;
  priceRange: string;
  products: Product[];
  openingHours: {
    day: string;
    openTime: string;
    closeTime: string;
  }[];
  customClosures?: {
    date: string;
    reason?: string;
  }[];
  paymentOptions: string[];
  deliveryAvailable: boolean;
  host: string;
}

export default function ShoppingPage() {
  const router = useRouter();
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter state for storeType and priceRange.
  const [selectedFilters, setSelectedFilters] = useState({
    storeType: "All",
    priceRange: "All",
  });

  const storeTypes = ["All", "Boutique", "Market", "Luxury Store", "Souvenir Shop", "Specialty Store"];
  const priceRanges = ["All", "$", "$$", "$$$", "$$$$"];

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/services/type/shopping")
      .then((res) => {
        setShoppingItems(res.data);
        setFilteredItems(res.data);
      })
      .catch((err) => console.error("Error fetching shopping data:", err))
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = () => {
    let updated = [...shoppingItems];
    if (selectedFilters.storeType !== "All") {
      updated = updated.filter((item) => item.storeType === selectedFilters.storeType);
    }
    if (selectedFilters.priceRange !== "All") {
      updated = updated.filter((item) => item.priceRange === selectedFilters.priceRange);
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
  }, [selectedFilters, searchQuery, shoppingItems]);

  const handleViewDetails = (item: ShoppingItem) => {
    const queryParam = encodeURIComponent(JSON.stringify(item));
    router.push(`/shoppingdetails?item=${queryParam}`);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedFilters({ storeType: "All", priceRange: "All" });
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Shopping</h1>
        <p className={styles.subtitle}>
          Explore exclusive shopping experiences in Turks and Caicos
        </p>
      </div>

      {/* Filter Section */}
      <div className={styles.filterContainer}>
        <div className={styles.filterSection}>
          <div className={styles.searchInputContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Search shopping..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedFilters.storeType}
              onChange={(e) =>
                setSelectedFilters({ ...selectedFilters, storeType: e.target.value })
              }
            >
              {storeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.selectContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.inputIcon} />
            <select
              className={styles.select}
              value={selectedFilters.priceRange}
              onChange={(e) =>
                setSelectedFilters({ ...selectedFilters, priceRange: e.target.value })
              }
            >
              {priceRanges.map((pr) => (
                <option key={pr} value={pr}>
                  {pr}
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
          <p>Discovering exceptional shopping options...</p>
        </div>
      ) : (
        <>
          {/* Shopping Cards */}
          <div className={styles.cardContainer}>
            {filteredItems.length === 0 ? (
              <div className={styles.noResults}>
                <p>No shopping options available.</p>
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
                        "https://via.placeholder.com/400x220?text=Shopping"
                      }
                      alt={item.name}
                      className={styles.cardImg}
                    />
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
                    <p className={styles.cardText}>Store Type: {item.storeType}</p>
                    <p className={styles.cardText}>Price Range: {item.priceRange}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(item);
                      }}
                      className={styles.cardButton}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
