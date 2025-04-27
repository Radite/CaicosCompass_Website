"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faStar } from "@fortawesome/free-solid-svg-icons";
import { Activity } from "../utils/fetchActivities";
import { getAverageRating, getLowestPrice, getHighestPrice, formatRating } from "../utils/filters";
import styles from "../ThingsToDo.module.css";

interface Props {
  activity: Activity;
  sortOption: string;
}

const ActivityCard: React.FC<Props> = ({ activity, sortOption }) => {
  const router = useRouter();

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

  return (
    <div className={styles.card}>
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
