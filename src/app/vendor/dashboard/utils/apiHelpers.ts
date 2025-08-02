// utils/apiHelpers.ts
import { ServiceListing } from '../types/listing';

/**
 * Formats form data to match the API structure
 */
export const formatServiceDataForAPI = (data: Partial<ServiceListing>, userId?: string) => {
  const formattedData = { ...data };

  // Add host (user ID) if available
  if (userId) {
    formattedData.host = userId;
  }

  // Ensure coordinates are properly structured
  if (formattedData.coordinates) {
    formattedData.coordinates = {
      latitude: Number(formattedData.coordinates.latitude) || 0,
      longitude: Number(formattedData.coordinates.longitude) || 0
    };
  }

  // Format stay-specific data
  if (formattedData.serviceType === 'stays') {
    const stayData = formattedData as any;
    
    // Ensure addressDetails coordinates match main coordinates
    if (stayData.addressDetails && !stayData.addressDetails.coordinates) {
      stayData.addressDetails.coordinates = formattedData.coordinates;
    }

    // Convert date strings to Date objects for unavailableDates
    if (stayData.unavailableDates) {
      stayData.unavailableDates = stayData.unavailableDates.map((period: any) => ({
        ...period,
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate)
      }));
    }

    // Convert specials dates
    if (stayData.discounts?.specials) {
      stayData.discounts.specials = stayData.discounts.specials.map((special: any) => ({
        ...special,
        startDate: new Date(special.startDate),
        endDate: new Date(special.endDate)
      }));
    }
  }

  // Format activity-specific data
  if (formattedData.serviceType === 'activities') {
    const activityData = formattedData as any;
    
    // Convert dates for custom unavailable dates
    if (activityData.options) {
      activityData.options = activityData.options.map((option: any) => ({
        ...option,
        customUnavailableDates: option.customUnavailableDates?.map((date: any) => ({
          ...date,
          date: new Date(date.date)
        })) || [],
        unavailableTimeSlots: option.unavailableTimeSlots?.map((slot: any) => ({
          ...slot,
          date: new Date(slot.date)
        })) || []
      }));
    }
  }

  // Format spa-specific data
  if (formattedData.serviceType === 'wellnessspas') {
    const spaData = formattedData as any;
    
    if (spaData.servicesOffered) {
      spaData.servicesOffered = spaData.servicesOffered.map((service: any) => ({
        ...service,
        dateExceptions: service.dateExceptions?.map((exception: any) => ({
          ...exception,
          date: new Date(exception.date)
        })) || []
      }));
    }

    if (spaData.customClosures) {
      spaData.customClosures = spaData.customClosures.map((closure: any) => ({
        ...closure,
        date: new Date(closure.date)
      }));
    }
  }

  // Format shopping-specific data
  if (formattedData.serviceType === 'shoppings') {
    const shoppingData = formattedData as any;
    
    if (shoppingData.customClosures) {
      shoppingData.customClosures = shoppingData.customClosures.map((closure: any) => ({
        ...closure,
        date: new Date(closure.date)
      }));
    }
  }

  // Format transportation-specific data
  if (formattedData.serviceType === 'transportations') {
    const transportData = formattedData as any;
    
    if (transportData.availability) {
      transportData.availability = transportData.availability.map((avail: any) => ({
        ...avail,
        date: new Date(avail.date)
      }));
    }

    if (transportData.promotions) {
      transportData.promotions = transportData.promotions.map((promo: any) => ({
        ...promo,
        validUntil: promo.validUntil ? new Date(promo.validUntil) : undefined
      }));
    }
  }

  return formattedData;
};

/**
 * Get user ID from auth token or context
 */
export const getCurrentUserId = (): string | null => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    // Decode JWT token to get user ID
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || null;
  } catch (error) {
    console.error('Error decoding auth token:', error);
    return null;
  }
};

/**
 * Validate required fields for service creation
 */
export const validateServiceData = (data: Partial<ServiceListing>): string[] => {
  const errors: string[] = [];

  // Common required fields
  if (!data.name?.trim()) errors.push('Service name is required');
  if (!data.description?.trim()) errors.push('Description is required');
  if (!data.location?.trim()) errors.push('Location is required');
  if (!data.island?.trim()) errors.push('Island selection is required');
  if (!data.serviceType) errors.push('Service type is required');

  // Service-specific validations
  switch (data.serviceType) {
    case 'stays':
      const stayData = data as any;
      if (!stayData.pricePerNight || stayData.pricePerNight <= 0) {
        errors.push('Valid price per night is required');
      }
      if (!stayData.maxGuests || stayData.maxGuests <= 0) {
        errors.push('Maximum guests must be specified');
      }
      break;

    case 'activities':
      const activityData = data as any;
      if (!activityData.price || activityData.price <= 0) {
        errors.push('Base price is required for activities');
      }
      if (!activityData.options || activityData.options.length === 0) {
        errors.push('At least one activity option is required');
      }
      break;

    case 'transportations':
      const transportData = data as any;
      if (!transportData.basePrice || transportData.basePrice <= 0) {
        errors.push('Base price is required for transportation');
      }
      if (!transportData.contactDetails?.phone?.trim()) {
        errors.push('Contact phone number is required');
      }
      break;

    case 'dinings':
      const diningData = data as any;
      if (!diningData.cuisineTypes || diningData.cuisineTypes.length === 0) {
        errors.push('At least one cuisine type is required');
      }
      if (!diningData.operatingHours || diningData.operatingHours.length === 0) {
        errors.push('Operating hours are required');
      }
      break;
  }

  return errors;
};