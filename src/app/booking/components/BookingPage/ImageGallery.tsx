// components/BookingPage/ImageGallery.tsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import styles from '../../bookingpage.module.css';

interface ImageGalleryProps {
  images: string[] | Array<{url: string; isMain?: boolean}>; // Support both formats
  altText: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, altText }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<number>>(new Set([0]));

  // Normalize images to always work with URLs
  const normalizedImages = images.map(img => 
    typeof img === 'string' ? img : img.url
  );

  // Filter out broken images
  const validImages = normalizedImages.filter((_, index) => !imageErrors.has(index));

  const handleImageLoad = (index: number) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageError = (index: number) => {
    console.error(`Failed to load image at index ${index}:`, normalizedImages[index]);
    setImageErrors(prev => new Set(prev).add(index));
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const showNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === validImages.length - 1 ? 0 : prevIndex + 1
    );
    // Preload next image
    const nextIndex = currentImageIndex === validImages.length - 1 ? 0 : currentImageIndex + 1;
    if (!imageLoading.has(nextIndex)) {
      setImageLoading(prev => new Set(prev).add(nextIndex));
    }
  };

  const showPrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? validImages.length - 1 : prevIndex - 1
    );
    // Preload previous image
    const prevIndex = currentImageIndex === 0 ? validImages.length - 1 : currentImageIndex - 1;
    if (!imageLoading.has(prevIndex)) {
      setImageLoading(prev => new Set(prev).add(prevIndex));
    }
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
    if (!imageLoading.has(index)) {
      setImageLoading(prev => new Set(prev).add(index));
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      showPrevImage();
    } else if (event.key === 'ArrowRight') {
      showNextImage();
    }
  };

  // If no valid images, show placeholder
  if (validImages.length === 0) {
    return (
      <div className={styles.mainImageContainer}>
        <div className={`${styles.mainImage} ${styles.noImagePlaceholder}`}>
          <FontAwesomeIcon icon={faImage} className={styles.noImageIcon} />
          <div className={styles.noImageText}>No Images Available</div>
        </div>
      </div>
    );
  }

  const currentImage = validImages[currentImageIndex];

  return (
    <div 
      className={styles.mainImageContainer}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Main Image */}
      <img 
        src={currentImage} 
        alt={altText} 
        className={`${styles.mainImage} ${
          imageLoading.has(currentImageIndex) ? styles.imageLoading : ''
        }`}
        onLoad={() => handleImageLoad(currentImageIndex)}
        onError={() => handleImageError(currentImageIndex)}
      />
      
      {/* Navigation Arrows (show on hover or mobile) */}
      {validImages.length > 1 && (
        <>
          <button
            className={`${styles.imageNavigation} ${styles.prevButton}`}
            onClick={showPrevImage}
            aria-label="Previous image"
            type="button"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          <button
            className={`${styles.imageNavigation} ${styles.nextButton}`}
            onClick={showNextImage}
            aria-label="Next image"
            type="button"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </>
      )}
      
      {/* Image Counter */}
      {validImages.length > 1 && (
        <div className={styles.imageCounter}>
          {currentImageIndex + 1} / {validImages.length}
        </div>
      )}
      
      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className={styles.imageThumbnails}>
          {validImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${altText} ${index + 1}`}
              className={`${styles.thumbnailImage} ${
                index === currentImageIndex ? styles.activeThumbnail : ''
              } ${imageLoading.has(index) ? styles.imageLoading : ''}`}
              onClick={() => selectImage(index)}
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageError(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;