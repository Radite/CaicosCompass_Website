// pages/dining/index.tsx

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./diningpage.module.css";
import HeroSection from "./components/Dining/HeroSection";
import DiningFilter from "./components/Dining/DiningFilter";
import DiningList from "./components/Dining/DiningList";
import LoadingSpinner from "./components/Dining/LoadingSpinner";
import useDining from "./hooks/useDining";
import { DiningItem } from "./types";

export default function DiningPage() {
  const router = useRouter();
  const {
    filteredItems,
    loading,
    searchQuery,
    setSearchQuery,
    selectedFilters,
    setSelectedFilters,
    handleResetFilters
  } = useDining();

  const handleViewDetails = (item: DiningItem) => {
    const queryParam = encodeURIComponent(JSON.stringify(item));
    router.push(`./diningdetails?item=${queryParam}`);
  };

  return (
    <div className={styles.container}>
      <HeroSection />
      
      <DiningFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        resultsCount={filteredItems.length}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DiningList
          items={filteredItems}
          onViewDetails={handleViewDetails}
          onResetFilters={handleResetFilters}
        />
      )}
    </div>
  );
}