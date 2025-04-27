"use client";

import React from "react";
import { useActivities } from "./hooks/useActivities";
import ActivityCard from "./components/ActivityCard";
import FiltersBar from "./components/FiltersBar";
import styles from "./ThingsToDo.module.css";

export default function ThingsToDo() {
  const {
    filteredActivities,
    categories,
    islands,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedIsland,
    setSelectedIsland,
    sortOption,
    setSortOption,
    isLoading,
    resetFilters
  } = useActivities();

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Discover Extraordinary Experiences</h1>
        <p className={styles.subtitle}>Explore the finest activities and excursions in Turks and Caicos</p>
      </div>

      <FiltersBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        islands={islands}
        selectedIsland={selectedIsland}
        setSelectedIsland={setSelectedIsland}
        sortOption={sortOption}
        setSortOption={setSortOption}
        resultsCount={filteredActivities.length}
      />

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Discovering exceptional experiences...</p>
        </div>
      ) : (
        <div className={styles.cardContainer}>
          {filteredActivities.length === 0 ? (
            <div className={styles.noResults}>
              <p>No experiences found matching your criteria.</p>
              <button
                className={styles.resetButton}
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <ActivityCard key={activity._id} activity={activity} sortOption={sortOption} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
