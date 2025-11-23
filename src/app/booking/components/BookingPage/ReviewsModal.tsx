// components/BookingPage/ReviewsModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { FaStar, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./reviewsmodal.module.css";

interface Review {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  subject: string;
  description: string;
  images?: Array<{ url: string; caption: string }>;
  helpfulCount: number;
  createdAt: string;
  vendorResponse?: {
    text: string;
    respondedAt: string;
  };
}

interface ReviewsModalProps {
  serviceId: string;
  serviceName: string;
  onClose: () => void;
}

interface LightboxImage {
  url: string;
  caption: string;
}

const REVIEWS_PER_PAGE = 5;

export default function ReviewsModal({ serviceId, serviceName, onClose }: ReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null);
  const [allLightboxImages, setAllLightboxImages] = useState<LightboxImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [serviceId, currentPage]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * REVIEWS_PER_PAGE;
      const response = await fetch(
        `${apiUrl}/api/reviews?serviceId=${serviceId}&skip=${skip}&limit=${REVIEWS_PER_PAGE}`
      );

      if (!response.ok) throw new Error("Failed to fetch reviews");

      const data = await response.json();
      setReviews(data.reviews || []);
      setTotalReviews(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading reviews");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

  const handleImageClick = (image: LightboxImage) => {
    // Collect all images from all reviews
    const allImages: LightboxImage[] = [];
    reviews.forEach(review => {
      if (review.images && review.images.length > 0) {
        allImages.push(...review.images);
      }
    });
    
    setAllLightboxImages(allImages);
    setCurrentImageIndex(allImages.findIndex(img => img.url === image.url));
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setAllLightboxImages([]);
    setCurrentImageIndex(0);
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setLightboxImage(allLightboxImages[newIndex]);
    }
  };

  const goToNextImage = () => {
    if (currentImageIndex < allLightboxImages.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setLightboxImage(allLightboxImages[newIndex]);
    }
  };

  const handleLightboxBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeLightbox();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      
      if (e.key === 'ArrowLeft') {
        goToPreviousImage();
      } else if (e.key === 'ArrowRight') {
        goToNextImage();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, currentImageIndex, allLightboxImages]);

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Reviews for {serviceName}</h2>
            <p className={styles.count}>{totalReviews} reviews</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading reviews...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>❌ {error}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className={styles.reviewsList}>
              {reviews.map((review) => (
                <div key={review._id} className={styles.reviewCard}>
                  {/* Review Header */}
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      {review.user?.avatar && (
                        <img 
                          src={review.user.avatar} 
                          alt={review.user.name}
                          className={styles.avatar}
                        />
                      )}
                      <div>
                        <p className={styles.reviewerName}>{review.user?.name || "Anonymous"}</p>
                        <p className={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={styles.rating}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar
                          key={i}
                          style={{
                            color: i < review.rating ? "#FFC107" : "#E0E0E0",
                            fontSize: "0.9rem"
                          }}
                        />
                      ))}
                      <span className={styles.ratingText}>{review.rating}.0</span>
                    </div>
                  </div>

                  {/* Review Subject */}
                  {review.subject && (
                    <h3 className={styles.reviewSubject}>{review.subject}</h3>
                  )}

                  {/* Review Description */}
                  <p className={styles.reviewDescription}>{review.description}</p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className={styles.reviewImages}>
                      {review.images.map((image, idx) => (
                        <div 
                          key={idx} 
                          className={styles.imageWrapper}
                          onClick={() => handleImageClick(image)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleImageClick(image);
                            }
                          }}
                        >
                          <img 
                            src={image.url} 
                            alt={image.caption || "Review image"}
                            className={styles.reviewImage}
                          />
                          {image.caption && (
                            <p className={styles.imageCaption}>{image.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vendor Response */}
                  {review.vendorResponse && (
                    <div className={styles.vendorResponse}>
                      <p className={styles.vendorResponseLabel}>Vendor Response:</p>
                      <p className={styles.vendorResponseText}>{review.vendorResponse.text}</p>
                      <p className={styles.vendorResponseDate}>
                        {new Date(review.vendorResponse.respondedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationBtn}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>

            <div className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </div>

            <button
              className={styles.paginationBtn}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <>
          <div 
            className={styles.lightboxBackdrop} 
            onClick={handleLightboxBackdropClick}
          />
          <div className={styles.lightboxModal}>
            {/* Close Button */}
            <button 
              className={styles.lightboxCloseBtn} 
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <FaTimes />
            </button>

            {/* Previous Button */}
            {currentImageIndex > 0 && (
              <button 
                className={styles.lightboxPrevBtn} 
                onClick={goToPreviousImage}
                aria-label="Previous image"
              >
                <FaChevronLeft />
              </button>
            )}

            {/* Image */}
            <img 
              src={lightboxImage.url} 
              alt={lightboxImage.caption || "Full view"}
              className={styles.lightboxImage}
            />

            {/* Next Button */}
            {currentImageIndex < allLightboxImages.length - 1 && (
              <button 
                className={styles.lightboxNextBtn} 
                onClick={goToNextImage}
                aria-label="Next image"
              >
                <FaChevronRight />
              </button>
            )}

            {/* Caption and Counter */}
            <div className={styles.lightboxFooter}>
              {lightboxImage.caption && (
                <p className={styles.lightboxCaption}>{lightboxImage.caption}</p>
              )}
              <p className={styles.lightboxCounter}>
                {currentImageIndex + 1} / {allLightboxImages.length}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}