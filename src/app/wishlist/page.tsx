"use client";

import React, { useEffect, useState } from "react";
import styles from "./wishlist.module.css";

interface Image {
  url: string;
  isMain?: boolean;
}

interface Option {
  _id: string;
  images?: Image[];
}

interface Service {
  name?: string;
  description?: string;
  imageUrl?: string;
  images?: Image[];
  options?: Option[];
}

interface WishlistItem {
  _id: string;
  serviceId: Service;
  option?: Option;
  optionId?: string;
}

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/favorites-wishlist?type=wishlist", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch wishlist items.");
        }
        return res.json();
      })
      .then((data: WishlistItem[]) => {
        setWishlist(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Returns the main image URL for the wishlist item.
  const getMainImageUrl = (item: WishlistItem) => {
    const service = item.serviceId;
    // Use the option from the item if available; otherwise, look it up from the service.
    const option = item.option || service.options?.find((opt) => opt._id === item.optionId);
    if (option) {
      return option.images?.find((img) => img.isMain)?.url || option.images?.[0]?.url;
    }
    return (
      service.images?.find((img) => img.isMain)?.url ||
      service.images?.[0]?.url ||
      service.imageUrl
    );
  };

  // Function to handle removing an item from wishlist
  const handleRemove = (id: string) => {
    // Implement removal logic here
    console.log("Removing item:", id);
  };

  // Function to handle viewing item details
  const handleViewDetails = (id: string) => {
    // Implement navigation to details page
    console.log("Viewing details for:", id);
  };

  return (
    <div className={styles.container}>
      {/* Page Title */}
      <h1 className={styles.pageTitle}>My Wishlist</h1>

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your wishlist...</p>
        </div>
      )}

      {/* Error Message */}
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      {/* Empty Wishlist Message */}
      {!loading && !error && wishlist.length === 0 && (
        <div className={styles.emptyMessage}>No items in your wishlist.</div>
      )}

      {/* Wishlist Cards */}
      <div className={styles.wishlistGrid}>
        {wishlist.map((item) => {
          const mainImageUrl = getMainImageUrl(item);
          return (
            <div key={item._id} className={styles.card}>
              <div className={styles.cardImageContainer}>
                {mainImageUrl ? (
                  <img 
                    src={mainImageUrl} 
                    alt={item.serviceId.name || "Service"} 
                    className={styles.cardImage} 
                  />
                ) : (
                  <div className={styles.placeholderImage}>
                    No image available
                  </div>
                )}
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>
                  {item.serviceId.name || "Unnamed Service"}
                </h3>
                <p className={styles.cardDescription}>
                  {item.serviceId.description || "No description available."}
                </p>
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewDetails(item._id)}
                  >
                    View Details
                  </button>
                  <button 
                    className={styles.removeButton}
                    onClick={() => handleRemove(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}