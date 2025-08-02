"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faStar, faImage } from "@fortawesome/free-solid-svg-icons";
import { Activity } from "../utils/fetchActivities";
import { getAverageRating, getLowestPrice, getHighestPrice, formatRating } from "../utils/filters";
import styles from "../ThingsToDo.module.css";

interface Props {
  activity: Activity;
  sortOption: string;
}

const ActivityCard: React.FC<Props> = ({ activity, sortOption }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleViewDetails = () => {
    const queryParam = encodeURIComponent(JSON.stringify(activity));
    router.push(`/booking?activity=${queryParam}`);
  };

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

  // Get the main image URL
  const mainImage = activity.images?.find((img) => img.isMain);
  const imageUrl = mainImage?.url;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Render image content
  const renderImageContent = () => {
    if (imageError || !imageUrl) {
      return (
        <div className={`${styles.cardImg} ${styles.imageError}`}>
          <div style={{ textAlign: 'center' }}>
            <FontAwesomeIcon icon={faImage} style={{ fontSize: '24px', marginBottom: '8px' }} />
            <div>No Image Available</div>
          </div>
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={activity.name}
        className={`${styles.cardImg} ${imageLoading ? styles.imageLoading : ''}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    );
  };

  // Alternative: Background image approach (uncomment to use)
  /*
  const renderBackgroundImage = () => {
    const backgroundStyle = {
      backgroundImage: imageUrl && !imageError ? `url(${imageUrl})` : 'none',
      backgroundColor: '#f8f9fa'
    };

    return (
      <div 
        className={`${styles.cardImageContainer_bg} ${imageLoading ? styles.imageLoading : ''}`}
        style={backgroundStyle}
      >
        {(!imageUrl || imageError) && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <FontAwesomeIcon icon={faImage} style={{ fontSize: '24px', marginBottom: '8px' }} />
            <div>No Image Available</div>
          </div>
        )}
        {activity.category && (
          <span className={styles.categoryTag}>{activity.category}</span>
        )}
      </div>
    );
  };
  */

  return (
    <div className={styles.card}>
      <div className={styles.cardImageContainer}>
        {renderImageContent()}
        
        {activity.category && (
          <span className={styles.categoryTag}>{activity.category}</span>
        )}
      </div>
      
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{activity.name}</h3>

        <div className={styles.locationContainer}>
          <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.locationIcon} />
          <p className={styles.locationText}>
            {activity.location}, {activity.island}
          </p>
        </div>

        {activity.reviews && activity.reviews.length > 0 && (
          <div className={styles.ratingContainer}>
            <FontAwesomeIcon icon={faStar} className={styles.starIcon} />
            <span className={styles.ratingText}>
              {formatRating(avgRating)} ({activity.reviews.length} {activity.reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}

        {/* HOST NAME DISPLAY */}
        {activity.host && (
          <div className={styles.locationContainer}>
            <p className={styles.locationText}>
              Host:{" "}
              {typeof activity.host === "string" ? (
                "Unknown Host"
              ) : (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/host/${activity.host._id}`);
                  }}
                  className={styles.hostLink}
                >
                  {activity.host.name || "Unknown Host"}
                </span>
              )}
            </p>
          </div>
        )}

        <div className={styles.priceContainer}>
          <span className={styles.priceLabel}>{priceLabel}</span>
          <span className={styles.priceValue}>{priceDisplay}</span>
        </div>

        <button
          onClick={handleViewDetails}
          className={styles.cardButton}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ActivityCard;