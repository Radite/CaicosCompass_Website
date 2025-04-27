"use client";

import React from "react";
import styles from "../ThingsToDo.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faMapMarkerAlt, faSort, faFilter } from "@fortawesome/free-solid-svg-icons";

interface FiltersBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  islands: string[];
  selectedIsland: string;
  setSelectedIsland: (value: string) => void;
  sortOption: string;
  setSortOption: (value: string) => void;
  resultsCount: number;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategory,
  setSelectedCategory,
  islands,
  selectedIsland,
  setSelectedIsland,
  sortOption,
  setSortOption,
  resultsCount,
}) => {
  return (
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
        {resultsCount} experiences found
      </div>
    </div>
  );
};

export default FiltersBar;
