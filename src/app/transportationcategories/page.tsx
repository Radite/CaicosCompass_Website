"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./transportationcategories.module.css";

const categories = [
  { name: "Car Rental", image: "/images/car-rental.jpg" },
  { name: "Taxi", image: "/images/taxi.jpg" },
  { name: "Airport Transfer", image: "/images/airport-transfer.jpg" },
  { name: "Private VIP Transport", image: "/images/vip-transport.jpg" },
];

export default function TransportationCategoriesPage() {
  const router = useRouter();

  const handleCategoryClick = (category) => {
    router.push(`/transportation?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Select Your Transportation Category</h1>
      <div className={styles.categoriesContainer}>
        {categories.map((cat, index) => (
          <div
            key={index}
            className={styles.categoryCard}
            onClick={() => handleCategoryClick(cat.name)}
            style={{
              backgroundImage: `url(${cat.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <h2 className={styles.categoryTitle}>{cat.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
