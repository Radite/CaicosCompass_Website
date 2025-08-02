// Enhanced CreateListing.tsx with better debugging and error handling
"use client";

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils, faBed, faMap, faCar, faSpa, faShoppingBag,
  faCheck, faArrowLeft, faArrowRight, faSave, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import styles from './CreateListing.module.css';

// Import service-specific forms
import ActivityForm from './forms/ActivityForm';
import DiningForm from './forms/DiningForm';
import ShoppingForm from './forms/ShoppingForm';
import StayForm from './forms/StayForm';
import TransportationForm from './forms/TransportationForm';
import WellnessSpaForm from './forms/WellnessSpaForm';

import { ServiceListing } from '../types/listing';

interface CreateListingProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

const serviceTypes = [
  {
    value: 'activities',
    label: 'Tours & Activities',
    icon: faMap,
    description: 'Tours, excursions, experiences, cultural sites, nature trails',
    color: '#10B981'
  },
  {
    value: 'dinings',
    label: 'Restaurants & Dining',
    icon: faUtensils,
    description: 'Restaurants, cafes, bars, food trucks, catering services',
    color: '#F59E0B'
  },
  {
    value: 'shoppings',
    label: 'Shopping & Retail',
    icon: faShoppingBag,
    description: 'Boutiques, markets, souvenir shops, specialty stores',
    color: '#EF4444'
  },
  {
    value: 'stays',
    label: 'Accommodations',
    icon: faBed,
    description: 'Hotels, villas, apartments, B&Bs, vacation rentals',
    color: '#3B82F6'
  },
  {
    value: 'transportations',
    label: 'Transportation',
    icon: faCar,
    description: 'Car rentals, transfers, taxi services, ferry transport',
    color: '#8B5CF6'
  },
  {
    value: 'wellnessspas',
    label: 'Wellness & Spa',
    icon: faSpa,
    description: 'Spas, wellness centers, massage therapy, holistic treatments',
    color: '#06B6D4'
  }
];

const steps = [
  { key: 'type', label: 'Service Type' },
  { key: 'details', label: 'Service Details' },
  { key: 'review', label: 'Review & Publish' }
];

export default function CreateListing({ onSuccess, onCancel }: CreateListingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [listingData, setListingData] = useState<Partial<ServiceListing>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  }, []);

  // Simple function to get current user ID from token
  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      // Decode JWT token (simple base64 decode for payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.userId || payload.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Format data for API (fix common issues)
  const formatServiceDataForAPI = (data: any, userId: string) => {
    const formattedData = { ...data };
    
    // Fix the vendor vs host field issue
    formattedData.vendor = userId;
    delete formattedData.host;
    
    // Ensure coordinates are properly set
    if (!formattedData.coordinates || 
        formattedData.coordinates.latitude === 0 && formattedData.coordinates.longitude === 0) {
      // Set default coordinates for Turks and Caicos
      formattedData.coordinates = {
        latitude: 21.694, // Default TCI coordinates
        longitude: -71.797
      };
    }
    
    // Clean up images - remove any File objects that weren't processed
    if (formattedData.images && Array.isArray(formattedData.images)) {
      formattedData.images = formattedData.images
        .filter((img: any) => {
          // Remove images that still have File objects
          return !(img.file instanceof File) && !(img.url instanceof File);
        })
        .map((img: any) => {
          if (typeof img === 'string') {
            return { url: img, isMain: false };
          }
          // Clean the image object - remove file property and ensure url is string
          const cleanImg: any = { 
            url: img.url, 
            isMain: img.isMain || false 
          };
          
          // Double-check that url is a string
          if (typeof cleanImg.url !== 'string') {
            console.error('Image URL is not a string:', cleanImg.url);
            return null;
          }
          
          return cleanImg;
        })
        .filter(Boolean); // Remove any null entries
      
      // Ensure at least one image is marked as main
      if (formattedData.images.length > 0 && !formattedData.images.some((img: any) => img.isMain)) {
        formattedData.images[0].isMain = true;
      }
    }
    
    // Clean up option images if they exist
    if (formattedData.options && Array.isArray(formattedData.options)) {
      formattedData.options.forEach((option: any) => {
        if (option.images && Array.isArray(option.images)) {
          option.images = option.images
            .filter((img: any) => {
              // Remove images that still have File objects
              return !(img.file instanceof File) && !(img.url instanceof File);
            })
            .map((img: any) => {
              if (typeof img === 'string') {
                return { url: img, isMain: false };
              }
              // Clean the image object
              const cleanImg: any = { 
                url: img.url, 
                isMain: img.isMain || false 
              };
              
              // Double-check that url is a string
              if (typeof cleanImg.url !== 'string') {
                console.error('Option image URL is not a string:', cleanImg.url);
                return null;
              }
              
              return cleanImg;
            })
            .filter(Boolean); // Remove any null entries
        }
      });
    }
    
    return formattedData;
  };

  const handleServiceTypeSelect = (serviceType: string) => {
    setSelectedServiceType(serviceType);
    setListingData(prev => ({ ...prev, serviceType: serviceType as any }));
  };

  const handleNext = (data?: Partial<ServiceListing>) => {
    console.log('handleNext called with data:', data);
    
    if (data) {
      console.log('Updating listing data:', data);
      setListingData(prev => {
        const newData = { ...prev, ...data };
        console.log('New listing data state:', newData);
        return newData;
      });
    }

    if (currentStep === 0 && !selectedServiceType) {
      setErrors({ serviceType: 'Please select a service type' });
      return;
    }

    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const uploadImages = async (imageFiles: File[]): Promise<string[]> => {
    const uploadPromises = imageFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/image`,
        formData,
        { 
          headers: { 
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data.url;
    });
    
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('=== SUBMIT DEBUG INFO ===');
      console.log('Original listing data:', listingData);
      
      // Handle image uploads if there are any file objects
      const processedData = { ...listingData };
      
      console.log('Checking for images to upload...');
      console.log('processedData.images:', processedData.images);
      
      // Check for File objects in different possible locations
      const hasFileInUrl = processedData.images?.some((img: any) => img.url instanceof File);
      const hasFileInFile = processedData.images?.some((img: any) => img.file instanceof File);
      
      console.log('hasFileInUrl:', hasFileInUrl);
      console.log('hasFileInFile:', hasFileInFile);
      
      // Upload main service images - handle both possible structures
      if (hasFileInUrl || hasFileInFile) {
        console.log('Uploading main images...');
        
        const imageFiles: File[] = [];
        const imageStructure: any[] = [];
        
        processedData.images.forEach((img: any) => {
          if (img.url instanceof File) {
            // File is in url property (old structure)
            imageFiles.push(img.url);
            imageStructure.push({ ...img, fileIndex: imageFiles.length - 1 });
          } else if (img.file instanceof File) {
            // File is in file property (new structure)
            imageFiles.push(img.file);
            imageStructure.push({ ...img, fileIndex: imageFiles.length - 1 });
          } else {
            // Already a valid image object
            imageStructure.push(img);
          }
        });
        
        console.log('Files to upload:', imageFiles.length);
        
        if (imageFiles.length > 0) {
          const uploadedUrls = await uploadImages(imageFiles);
          console.log('Images uploaded:', uploadedUrls);
          
          // Reconstruct images array with uploaded URLs
          processedData.images = imageStructure.map((img: any) => {
            if (img.fileIndex !== undefined) {
              return {
                url: uploadedUrls[img.fileIndex],
                isMain: img.isMain || false
              };
            }
            return img;
          });
        }
      }

      // Handle service-specific image uploads
      await processServiceSpecificImages(processedData);

      // Get current user ID for vendor field
      const userId = getCurrentUserId();
      console.log('Current user ID:', userId);
      
      if (!userId) {
        setErrors({ submit: 'User authentication required. Please log in again.' });
        return;
      }

      // Format data for API
      const formattedData = formatServiceDataForAPI(processedData, userId);
      console.log('Formatted data for API:', formattedData);

      // Debug: Check for any remaining File objects
      const checkForFileObjects = (obj: any, path = ''): string[] => {
        const fileObjects: string[] = [];
        if (obj && typeof obj === 'object') {
          for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            if (value instanceof File) {
              fileObjects.push(currentPath);
            } else if (typeof value === 'object' && value !== null) {
              fileObjects.push(...checkForFileObjects(value, currentPath));
            }
          }
        }
        return fileObjects;
      };

      const remainingFiles = checkForFileObjects(formattedData);
      if (remainingFiles.length > 0) {
        console.error('WARNING: Found remaining File objects at paths:', remainingFiles);
        setErrors({ submit: `Error: Found unprocessed images at: ${remainingFiles.join(', ')}. Please try again.` });
        return;
      }

      // Basic validation
      const requiredFields = ['name', 'description', 'location', 'island'];
      const missingFields = requiredFields.filter(field => !formattedData[field]);
      
      if (missingFields.length > 0) {
        setErrors({ submit: `Missing required fields: ${missingFields.join(', ')}` });
        return;
      }
      
      // Use the services endpoint
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/services`;
      
      console.log('Sending POST request to:', endpoint);
      console.log('Request headers:', getAuthHeaders());
      console.log('Request body:', JSON.stringify(formattedData, null, 2));
      
      const response = await axios.post(endpoint, formattedData, { 
        headers: getAuthHeaders() 
      });
      
      console.log('Success response:', response.data);
      onSuccess();
      
    } catch (error: any) {
      console.error('=== ERROR DEBUG INFO ===');
      console.error('Full error object:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      let errorMessage = 'Error creating listing. Please try again.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      // Add debug info to error message in development
      if (process.env.NODE_ENV === 'development') {
        errorMessage += `\n\nDebug: ${error.message}`;
        if (error.response?.status) {
          errorMessage += `\nStatus: ${error.response.status}`;
        }
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

const processServiceSpecificImages = async (data: any) => {
  // Handle Activity images
  if (data.serviceType === 'activities' && data.options) {
    for (const option of data.options) {
      if (option.images && Array.isArray(option.images)) {
        const hasFileInUrl = option.images.some((img: any) => img.url instanceof File);
        const hasFileInFile = option.images.some((img: any) => img.file instanceof File);
        
        if (hasFileInUrl || hasFileInFile) {
          const imageFiles: File[] = [];
          const imageStructure: any[] = [];
          
          option.images.forEach((img: any) => {
            if (img.url instanceof File) {
              imageFiles.push(img.url);
              imageStructure.push({ ...img, fileIndex: imageFiles.length - 1 });
            } else if (img.file instanceof File) {
              imageFiles.push(img.file);
              imageStructure.push({ ...img, fileIndex: imageFiles.length - 1 });
            } else {
              imageStructure.push(img);
            }
          });
          
          if (imageFiles.length > 0) {
            const uploadedUrls = await uploadImages(imageFiles);
            
            option.images = imageStructure.map((img: any) => {
              if (img.fileIndex !== undefined) {
                return {
                  url: uploadedUrls[img.fileIndex],
                  isMain: img.isMain || false
                };
              }
              return img;
            });
          }
        }
      }
    }
  }

  // Handle Wellness Spa service images
  if (data.serviceType === 'wellnessspas' && data.servicesOffered) {
    for (const service of data.servicesOffered) {
      if (service.images && Array.isArray(service.images)) {
        const hasFileInUrl = service.images.some((img: any) => img.url instanceof File);
        const hasFileInFile = service.images.some((img: any) => img.file instanceof File);
        
        if (hasFileInUrl || hasFileInFile) {
          console.log('Processing wellness spa service images...');
          
          const imageFiles: File[] = [];
          const imageStructure: any[] = [];
          
          service.images.forEach((img: any) => {
            if (img.url instanceof File) {
              imageFiles.push(img.url);
              imageStructure.push({ ...img, fileIndex: imageFiles.length - 1 });
            } else if (img.file instanceof File) {
              imageFiles.push(img.file);
              imageStructure.push({ ...img, fileIndex: imageFiles.length - 1 });
            } else {
              imageStructure.push(img);
            }
          });
          
          if (imageFiles.length > 0) {
            const uploadedUrls = await uploadImages(imageFiles);
            console.log('Wellness spa service images uploaded:', uploadedUrls);
            
            service.images = imageStructure.map((img: any) => {
              if (img.fileIndex !== undefined) {
                return {
                  url: uploadedUrls[img.fileIndex],
                  isMain: img.isMain || false
                };
              }
              return img;
            });
          }
        }
      }
    }
  }

  // Handle Dining service images (menu items, dishes, etc.)
// Handle Dining menu item images - FIXED
if (data.serviceType === 'dinings' && data.menuItems) {
  console.log('Processing dining menu item images...');
  console.log('Menu items found:', data.menuItems.length);
  
  for (const item of data.menuItems) {
    if (item.images && Array.isArray(item.images)) {
      console.log('Processing images for menu item:', item.name);
      console.log('Images before processing:', item.images);
      
      const hasFileInUrl = item.images.some((img: any) => img.url instanceof File);
      const hasFileInFile = item.images.some((img: any) => img.file instanceof File);
      
      console.log('hasFileInUrl:', hasFileInUrl, 'hasFileInFile:', hasFileInFile);
      
      if (hasFileInUrl || hasFileInFile) {
        const imageFiles: File[] = [];
        const imageStructure: any[] = [];
        
        item.images.forEach((img: any, index: number) => {
          console.log(`Processing image ${index}:`, img);
          if (img.url instanceof File) {
            imageFiles.push(img.url);
            imageStructure.push({ ...img, fileIndex: imageFiles.length - 1 });
          } else if (img.file instanceof File) {
            imageFiles.push(img.file);
            imageStructure.push({ ...img, fileIndex: imageFiles.length - 1 });
          } else {
            imageStructure.push(img);
          }
        });
        
        if (imageFiles.length > 0) {
          console.log('Uploading menu item images:', imageFiles.length);
          const uploadedUrls = await uploadImages(imageFiles);
          console.log('Menu item images uploaded:', uploadedUrls);
          
          item.images = imageStructure.map((img: any) => {
            if (img.fileIndex !== undefined) {
              return {
                url: uploadedUrls[img.fileIndex],
                isMain: img.isMain || false
              };
            }
            return img;
          });
          
          console.log('Images after processing:', item.images);
        }
      }
    }
  }
}

 // Handle Stay additional images (stayImages array)
if (data.serviceType === 'stays' && data.stayImages) {
  console.log('Processing stay additional images...');
  console.log('Stay images found:', data.stayImages.length);
  
  // Check if stayImages contains File objects
  const hasFileObjects = data.stayImages.some((img: any) => img instanceof File);
  
  if (hasFileObjects) {
    console.log('Found File objects in stayImages, uploading...');
    
    const imageFiles: File[] = [];
    const imageStructure: any[] = [];
    
    data.stayImages.forEach((img: any, index: number) => {
      console.log(`Processing stayImage ${index}:`, img);
      if (img instanceof File) {
        imageFiles.push(img);
        imageStructure.push({ fileIndex: imageFiles.length - 1 });
      } else {
        // Already a URL string
        imageStructure.push(img);
      }
    });
    
    if (imageFiles.length > 0) {
      console.log('Uploading stay additional images:', imageFiles.length);
      const uploadedUrls = await uploadImages(imageFiles);
      console.log('Stay additional images uploaded:', uploadedUrls);
      
      data.stayImages = imageStructure.map((img: any) => {
        if (img.fileIndex !== undefined) {
          return uploadedUrls[img.fileIndex];
        }
        return img;
      });
      
      console.log('StayImages after processing:', data.stayImages);
    }
  }
}

  // Handle Transportation vehicle images
  if (data.serviceType === 'transportations' && data.vehicles) {
    for (const vehicle of data.vehicles) {
      if (vehicle.images && Array.isArray(vehicle.images)) {
        const hasFileInUrl = vehicle.images.some((img: any) => img.url instanceof File);
        const hasFileInFile = vehicle.images.some((img: any) => img.file instanceof File);
        
        if (hasFileInUrl || hasFileInFile) {
          const imageFiles: File[] = [];
          const imageStructure: any[] = [];
          
          vehicle.images.forEach((img: any) => {
            if (img.url instanceof File) {
              imageFiles.push(img.url);
              imageStructure.push({ ...img, fileIndex: imageFiles.length - 1 });
            } else if (img.file instanceof File) {
              imageFiles.push(img.file);
              imageStructure.push({ ...img, fileIndex: imageFiles.length - 1 });
            } else {
              imageStructure.push(img);
            }
          });
          
          if (imageFiles.length > 0) {
            const uploadedUrls = await uploadImages(imageFiles);
            
            vehicle.images = imageStructure.map((img: any) => {
              if (img.fileIndex !== undefined) {
                return {
                  url: uploadedUrls[img.fileIndex],
                  isMain: img.isMain || false
                };
              }
              return img;
            });
          }
        }
      }
    }
  }

  // Handle Shopping product images
  if (data.serviceType === 'shoppings' && data.products) {
    for (const product of data.products) {
      if (product.images && Array.isArray(product.images)) {
        const hasFileInUrl = product.images.some((img: any) => img.url instanceof File);
        const hasFileInFile = product.images.some((img: any) => img.file instanceof File);
        
        if (hasFileInUrl || hasFileInFile) {
          const imageFiles: File[] = [];
          const imageStructure: any[] = [];
          
          product.images.forEach((img: any) => {
            if (img.url instanceof File) {
              imageFiles.push(img.url);
              imageStructure.push({ ...img, fileIndex: imageFiles.length - 1 });
            } else if (img.file instanceof File) {
              imageFiles.push(img.file);
              imageStructure.push({ ...img, fileIndex: imageFiles.length - 1 });
            } else {
              imageStructure.push(img);
            }
          });
          
          if (imageFiles.length > 0) {
            const uploadedUrls = await uploadImages(imageFiles);
            
            product.images = imageStructure.map((img: any) => {
              if (img.fileIndex !== undefined) {
                return {
                  url: uploadedUrls[img.fileIndex],
                  isMain: img.isMain || false
                };
              }
              return img;
            });
          }
        }
      }
    }
  }
};

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={styles.serviceTypeSelection}>
            <div className={styles.stepHeader}>
              <h2>What type of service are you offering?</h2>
              <p>Choose the category that best describes your business</p>
            </div>

            <div className={styles.serviceGrid}>
              {serviceTypes.map((type) => (
                <div
                  key={type.value}
                  className={`${styles.serviceCard} ${
                    selectedServiceType === type.value ? styles.selected : ''
                  }`}
                  onClick={() => handleServiceTypeSelect(type.value)}
                  style={{ '--accent-color': type.color } as React.CSSProperties}
                >
                  <div className={styles.serviceIcon}>
                    <FontAwesomeIcon icon={type.icon} />
                  </div>
                  <h3>{type.label}</h3>
                  <p>{type.description}</p>
                  {selectedServiceType === type.value && (
                    <div className={styles.selectedBadge}>
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {errors.serviceType && (
              <div className={styles.errorMessage}>{errors.serviceType}</div>
            )}
          </div>
        );

      case 1:
        console.log('Rendering service form for type:', selectedServiceType);
        
        return (
          <div className={styles.serviceForm}>
            {selectedServiceType === 'activities' && (
              <ActivityForm
                onNext={handleNext}
                onPrev={handlePrev}
                initialData={listingData}
              />
            )}
            {selectedServiceType === 'dinings' && (
              <DiningForm
                onNext={handleNext}
                onPrev={handlePrev}
                initialData={listingData}
              />
            )}
            {selectedServiceType === 'shoppings' && (
              <ShoppingForm
                onNext={handleNext}
                onPrev={handlePrev}
                initialData={listingData}
              />
            )}
            {selectedServiceType === 'stays' && (
              <StayForm
                onNext={handleNext}
                onPrev={handlePrev}
                initialData={listingData}
              />
            )}
            {selectedServiceType === 'transportations' && (
              <TransportationForm
                onNext={handleNext}
                onPrev={handlePrev}
                initialData={listingData}
              />
            )}
            {selectedServiceType === 'wellnessspas' && (
              <WellnessSpaForm
                onNext={handleNext}
                onPrev={handlePrev}
                initialData={listingData}
              />
            )}
            
            {!selectedServiceType && (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>No service type selected. Please go back and select a service type.</p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className={styles.reviewStep}>
            <div className={styles.stepHeader}>
              <h2>Review Your Listing</h2>
              <p>Please review all details before publishing</p>
            </div>

            <div className={styles.reviewContent}>
              <div className={styles.reviewSection}>
                <h3>Service Information</h3>
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewItem}>
                    <label>Service Type</label>
                    <span>{serviceTypes.find(t => t.value === selectedServiceType)?.label}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <label>Name</label>
                    <span>{listingData.name || 'Not provided'}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <label>Island</label>
                    <span>{listingData.island || 'Not selected'}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <label>Location</label>
                    <span>{listingData.location || 'Not provided'}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <label>Coordinates</label>
                    <span>
                      {listingData.coordinates ? 
                        `${listingData.coordinates.latitude}, ${listingData.coordinates.longitude}` : 
                        'Default coordinates will be used'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Debug: Show current listing data */}
              <details style={{ marginTop: '2rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Debug: Current Listing Data (Click to expand)
                </summary>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '1rem', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  overflow: 'auto',
                  marginTop: '1rem'
                }}>
                  {JSON.stringify(listingData, null, 2)}
                </pre>
              </details>

              {listingData.images && listingData.images.length > 0 && (
                <div className={styles.reviewSection}>
                  <h3>Images ({listingData.images.length})</h3>
                  <div className={styles.imagePreview}>
                    {listingData.images.slice(0, 4).map((image: any, index) => (
                      <div key={index} className={styles.imageThumb}>
                        <img 
                          src={image.file ? URL.createObjectURL(image.file) : (image.url || image)} 
                          alt={`Preview ${index + 1}`} 
                        />
                        {index === 0 && <span className={styles.primaryBadge}>Primary</span>}
                      </div>
                    ))}
                    {listingData.images.length > 4 && (
                      <div className={styles.moreImages}>
                        +{listingData.images.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.publishOptions}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked />
                  <span>Publish listing immediately</span>
                </label>
              </div>
            </div>

            {errors.submit && (
              <div className={styles.errorMessage} style={{ whiteSpace: 'pre-wrap' }}>
                {errors.submit}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.createListing}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Create New Listing</h1>
        <div className={styles.progressIndicator}>
          {steps.map((step, index) => (
            <div key={step.key} className={styles.progressStep}>
              <div 
                className={`${styles.stepCircle} ${
                  index <= currentStep ? styles.active : ''
                } ${index < currentStep ? styles.completed : ''}`}
              >
                {index < currentStep ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : (
                  index + 1
                )}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
              {index < steps.length - 1 && <div className={styles.stepConnector} />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <div className={styles.navLeft}>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel} 
              className={styles.cancelBtn}
            >
              Cancel
            </button>
          )}
        </div>

        <div className={styles.navRight}>
          {currentStep !== 1 && (
            <>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className={styles.prevBtn}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Previous
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => handleNext()}
                  className={styles.nextBtn}
                  disabled={currentStep === 0 && !selectedServiceType}
                >
                  Next
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Publish Listing
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}