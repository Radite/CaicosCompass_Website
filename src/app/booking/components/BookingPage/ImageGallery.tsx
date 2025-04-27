// components/BookingPage/ImageGallery.tsx
import React, { useState } from 'react';
import styles from '../../bookingpage.module.css';

interface ImageGalleryProps {
  images: string[];
  altText: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, altText }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const showNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const showPrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (images.length === 0) {
    return (
      <img 
        src="https://via.placeholder.com/800x500?text=Activity" 
        alt="Activity placeholder" 
        className={styles.mainImage} 
      />
    );
  }

  return (
    <div className={styles.mainImageContainer}>
      <img 
        src={images[currentImageIndex]} 
        alt={altText} 
        className={styles.mainImage} 
      />
      
      {images.length > 1 && (
        <div className={styles.imageThumbnails}>
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index + 1}`}
              className={`${styles.thumbnailImage} ${index === currentImageIndex ? styles.activeThumbnail : ''}`}
              onClick={() => selectImage(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;