"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import styles from "./preferences.module.css";

interface PreferencesData {
  travelPreferences: {
    style: string[];
    preferredDestinations: string[];
    activities: string[];
    transportation: string;
  };
  accommodationPreferences: {
    type: string;
    amenities: string[];
    location: string;
    roomRequirements: {
      numberOfRooms: number;
      bedType: string;
    };
    accommodationFor: string[];
    numberOfKids: number;
    includeGuestsInActivities: boolean;
  };
  groupDetails: {
    adults: number;
    children: number;
    pets: boolean;
    accessibilityNeeds: string[];
    dietaryRestrictions: string[];
  };
  budget: {
    total: number;
    allocation: {
      accommodation: number;
      food: number;
      activities: number;
      transportation: number;
    };
  };
  foodPreferences: {
    cuisines: string[];
    diningStyle: string;
  };
  mustDoActivities: string[];
  fitnessLevel: string;
  logistics: {
    departureLocation: string;
    travelInsurance: boolean;
    passportDetails: string;
  };
  customization: {
    pace: string;
    durationPerDestination: number;
    specialOccasions: string[];
  };
  environmentalPreferences: {
    sustainability: boolean;
    supportLocal: boolean;
  };
  otherConsiderations: {
    healthConcerns: string[];
    seasonalPreferences: string[];
    shoppingPreferences: string[];
    privacyRequirements: boolean;
  };
  lengthOfStay: number;
}

const defaultPreferences: PreferencesData = {
  travelPreferences: {
    style: [],
    preferredDestinations: [],
    activities: [],
    transportation: "car rentals",
  },
  accommodationPreferences: {
    type: "hotel",
    amenities: [],
    location: "city center",
    roomRequirements: { numberOfRooms: 1, bedType: "king" },
    accommodationFor: [],
    numberOfKids: 0,
    includeGuestsInActivities: false,
  },
  groupDetails: {
    adults: 1,
    children: 0,
    pets: false,
    accessibilityNeeds: [],
    dietaryRestrictions: [],
  },
  budget: {
    total: 0,
    allocation: { accommodation: 0, food: 0, activities: 0, transportation: 0 },
  },
  foodPreferences: {
    cuisines: [],
    diningStyle: "casual",
  },
  mustDoActivities: [],
  fitnessLevel: "medium",
  logistics: { departureLocation: "", travelInsurance: false, passportDetails: "" },
  customization: { pace: "relaxed", durationPerDestination: 0, specialOccasions: [] },
  environmentalPreferences: { sustainability: false, supportLocal: true },
  otherConsiderations: {
    healthConcerns: [],
    seasonalPreferences: [],
    shoppingPreferences: [],
    privacyRequirements: false,
  },
  lengthOfStay: 0,
};

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<PreferencesData>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch current preferences
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessage("User not authenticated.");
      setLoading(false);
      return;
    }
    axios
      .get("http://localhost:5000/api/users/preferences", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPreferences(res.data.preferences);
        setLoading(false);
      })
      .catch((err) => {
        setMessage(err.response?.data?.message || "Failed to load preferences.");
        setLoading(false);
      });
  }, []);

  // Update top-level fields
  const handleChange = (
    section: keyof PreferencesData,
    field: string,
    value: any
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Update nested fields (e.g. roomRequirements)
  const handleNestedChange = (
    section: keyof PreferencesData,
    nested: string,
    field: string,
    value: any
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nested]: {
          ...prev[section][nested as keyof typeof prev[section]],
          [field]: value,
        },
      },
    }));
  };

  // Update fields that are arrays (multi-select)
  const handleMultiSelectChange = (
    section: keyof PreferencesData,
    field: string,
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: values,
      },
    }));
  };

  // For simple top-level fields like lengthOfStay
  const handleSimpleChange = (field: keyof PreferencesData, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessage("User not authenticated.");
      return;
    }
    axios
      .put("http://localhost:5000/api/users/preferences", preferences, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessage("Preferences updated successfully."))
      .catch((err) =>
        setMessage(err.response?.data?.message || "Failed to update preferences.")
      );
  };

  if (loading) {
    return (
      <div className="container py-5">
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className={`container py-5 ${styles.preferencesPage}`}>
      <h2 className="mb-4">Edit Your Preferences</h2>
      {message && <p className="alert alert-info">{message}</p>}
      <form onSubmit={handleSubmit}>
        {/* Travel Preferences */}
        <div className={styles.cardSection}>
          <h4>Travel Preferences</h4>
          <div className="mb-3">
            <label>Travel Style</label>
            <select
              multiple
              className="form-control"
              value={preferences.travelPreferences.style}
              onChange={(e) =>
                handleMultiSelectChange("travelPreferences", "style", e)
              }
            >
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Preferred Destinations</label>
            <select
              multiple
              className="form-control"
              value={preferences.travelPreferences.preferredDestinations}
              onChange={(e) =>
                handleMultiSelectChange("travelPreferences", "preferredDestinations", e)
              }
            >
              <option value="Providenciales">Providenciales</option>
              <option value="Grand Turk">Grand Turk</option>
              <option value="North Caicos & Middle Caicos">North Caicos & Middle Caicos</option>
              <option value="South Caicos">South Caicos</option>
              <option value="Salt Cay">Salt Cay</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Activities of Interest</label>
            <select
              multiple
              className="form-control"
              value={preferences.travelPreferences.activities}
              onChange={(e) =>
                handleMultiSelectChange("travelPreferences", "activities", e)
              }
            >
              <option value="outdoor">Outdoor</option>
              <option value="watersports">Watersports</option>
              <option value="snorkeling">Snorkeling</option>
              <option value="diving">Diving</option>
              <option value="sightseeing">Sightseeing</option>
              <option value="hiking">Hiking</option>
              <option value="cycling">Cycling</option>
              <option value="kayaking">Kayaking</option>
              <option value="fishing">Fishing</option>
              <option value="boating">Boating</option>
              <option value="cultural">Cultural</option>
              <option value="shopping">Shopping</option>
              <option value="nightlife">Nightlife</option>
              <option value="golf">Golf</option>
              <option value="spa">Spa</option>
              <option value="adventure">Adventure</option>
              <option value="wildlife">Wildlife</option>
              <option value="sailing">Sailing</option>
              <option value="yachting">Yachting</option>
              <option value="eco-tourism">Eco-Tourism</option>
              <option value="photography">Photography</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Transportation</label>
            <select
              className="form-control"
              value={preferences.travelPreferences.transportation}
              onChange={(e) =>
                handleChange("travelPreferences", "transportation", e.target.value)
              }
            >
              <option value="car rentals">Car Rentals</option>
              <option value="public transport">Public Transport</option>
              <option value="walking">Walking</option>
              <option value="taxis">Taxis</option>
            </select>
          </div>
        </div>

        {/* Accommodation Preferences */}
        <div className={styles.cardSection}>
          <h4>Accommodation Preferences</h4>
          <div className="mb-3">
            <label>Type</label>
            <select
              className="form-control"
              value={preferences.accommodationPreferences.type}
              onChange={(e) =>
                handleChange("accommodationPreferences", "type", e.target.value)
              }
            >
              <option value="hotel">Hotel</option>
              <option value="resort">Resort</option>
              <option value="hostel">Hostel</option>
              <option value="camping">Camping</option>
              <option value="Airbnb">Airbnb</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Amenities (comma-separated)</label>
            <input
              type="text"
              className="form-control"
              value={preferences.accommodationPreferences.amenities.join(", ")}
              onChange={(e) =>
                handleChange(
                  "accommodationPreferences",
                  "amenities",
                  e.target.value.split(",").map(s => s.trim())
                )
              }
              placeholder="e.g., WiFi, Pool, Gym"
            />
          </div>
          <div className="mb-3">
            <label>Location</label>
            <select
              className="form-control"
              value={preferences.accommodationPreferences.location}
              onChange={(e) =>
                handleChange("accommodationPreferences", "location", e.target.value)
              }
            >
              <option value="city center">City Center</option>
              <option value="secluded">Secluded</option>
              <option value="near the beach">Near the Beach</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Number of Rooms</label>
            <input
              type="number"
              className="form-control"
              value={preferences.accommodationPreferences.roomRequirements.numberOfRooms}
              onChange={(e) =>
                handleNestedChange("accommodationPreferences", "roomRequirements", "numberOfRooms", parseInt(e.target.value))
              }
            />
          </div>
          <div className="mb-3">
            <label>Bed Type</label>
            <select
              className="form-control"
              value={preferences.accommodationPreferences.roomRequirements.bedType}
              onChange={(e) =>
                handleNestedChange("accommodationPreferences", "roomRequirements", "bedType", e.target.value)
              }
            >
              <option value="king">King</option>
              <option value="queen">Queen</option>
              <option value="twin">Twin</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Accommodation For (select multiple)</label>
            <select
              multiple
              className="form-control"
              value={preferences.accommodationPreferences.accommodationFor}
              onChange={(e) =>
                handleMultiSelectChange(
                  "accommodationPreferences",
                  "accommodationFor",
                  e
                )
              }
            >
              <option value="couple">Couple</option>
              <option value="single">Single</option>
              <option value="family">Family</option>
              <option value="with kids">With Kids</option>
              <option value="toddler">Toddler</option>
              <option value="pets">Pets</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Number of Kids</label>
            <input
              type="number"
              className="form-control"
              value={preferences.accommodationPreferences.numberOfKids}
              onChange={(e) =>
                handleChange("accommodationPreferences", "numberOfKids", parseInt(e.target.value))
              }
            />
          </div>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={preferences.accommodationPreferences.includeGuestsInActivities}
              onChange={(e) =>
                handleChange("accommodationPreferences", "includeGuestsInActivities", e.target.checked)
              }
              id="includeGuestsInActivities"
            />
            <label className="form-check-label" htmlFor="includeGuestsInActivities">
              Factor kids/toddlers/pets into all activities
            </label>
          </div>
        </div>

        {/* Group Details */}
        <div className={styles.cardSection}>
          <h4>Group Details</h4>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label>Adults</label>
              <input
                type="number"
                className="form-control"
                value={preferences.groupDetails.adults}
                onChange={(e) =>
                  handleChange("groupDetails", "adults", parseInt(e.target.value))
                }
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>Children</label>
              <input
                type="number"
                className="form-control"
                value={preferences.groupDetails.children}
                onChange={(e) =>
                  handleChange("groupDetails", "children", parseInt(e.target.value))
                }
              />
            </div>
            <div className="col-md-4 mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={preferences.groupDetails.pets}
                onChange={(e) =>
                  handleChange("groupDetails", "pets", e.target.checked)
                }
                id="groupPets"
              />
              <label className="form-check-label" htmlFor="groupPets">
                Pets
              </label>
            </div>
          </div>
          <div className="mb-3">
            <label>Accessibility Needs (select multiple)</label>
            <select
              multiple
              className="form-control"
              value={preferences.groupDetails.accessibilityNeeds}
              onChange={(e) =>
                handleMultiSelectChange(
                  "groupDetails",
                  "accessibilityNeeds",
                  e
                )
              }
            >
              <option value="wheelchair accessible">Wheelchair Accessible</option>
              <option value="visual assistance">Visual Assistance</option>
              <option value="hearing assistance">Hearing Assistance</option>
              <option value="cognitive support">Cognitive Support</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Dietary Restrictions (select multiple)</label>
            <select
              multiple
              className="form-control"
              value={preferences.groupDetails.dietaryRestrictions}
              onChange={(e) =>
                handleMultiSelectChange(
                  "groupDetails",
                  "dietaryRestrictions",
                  e
                )
              }
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="dairy-free">Dairy-Free</option>
              <option value="nut-free">Nut-Free</option>
              <option value="halal">Halal</option>
              <option value="kosher">Kosher</option>
              <option value="low-carb">Low-Carb</option>
              <option value="low-sodium">Low-Sodium</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        {/* Budget Section */}
        <div className={styles.cardSection}>
          <h4>Budget</h4>
          <div className="mb-3">
            <label>Total Budget ($)</label>
            <input
              type="number"
              className="form-control"
              value={preferences.budget.total}
              onChange={(e) =>
                handleChange("budget", "total", parseFloat(e.target.value))
              }
            />
          </div>
          <div className="row">
            <div className="col-md-3 mb-3">
              <label>Accommodation (%)</label>
              <input
                type="number"
                className="form-control"
                value={preferences.budget.allocation.accommodation}
                onChange={(e) =>
                  handleChange("budget", "allocation", {
                    ...preferences.budget.allocation,
                    accommodation: parseFloat(e.target.value)
                  })
                }
              />
            </div>
            <div className="col-md-3 mb-3">
              <label>Food (%)</label>
              <input
                type="number"
                className="form-control"
                value={preferences.budget.allocation.food}
                onChange={(e) =>
                  handleChange("budget", "allocation", {
                    ...preferences.budget.allocation,
                    food: parseFloat(e.target.value)
                  })
                }
              />
            </div>
            <div className="col-md-3 mb-3">
              <label>Activities (%)</label>
              <input
                type="number"
                className="form-control"
                value={preferences.budget.allocation.activities}
                onChange={(e) =>
                  handleChange("budget", "allocation", {
                    ...preferences.budget.allocation,
                    activities: parseFloat(e.target.value)
                  })
                }
              />
            </div>
            <div className="col-md-3 mb-3">
              <label>Transportation (%)</label>
              <input
                type="number"
                className="form-control"
                value={preferences.budget.allocation.transportation}
                onChange={(e) =>
                  handleChange("budget", "allocation", {
                    ...preferences.budget.allocation,
                    transportation: parseFloat(e.target.value)
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Food Preferences Section */}
        <div className={styles.cardSection}>
          <h4>Food Preferences</h4>
          <div className="mb-3">
            <label>Cuisines (select multiple)</label>
            <select
              multiple
              className="form-control"
              value={preferences.foodPreferences.cuisines}
              onChange={(e) =>
                handleMultiSelectChange(
                  "foodPreferences",
                  "cuisines",
                  e
                )
              }
            >
              <option value="American">American</option>
              <option value="Italian">Italian</option>
              <option value="Mexican">Mexican</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Thai">Thai</option>
              <option value="Indian">Indian</option>
              <option value="French">French</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Caribbean">Caribbean</option>
              <option value="Lebanese">Lebanese</option>
              <option value="Greek">Greek</option>
              <option value="Spanish">Spanish</option>
              <option value="Korean">Korean</option>
              <option value="Vietnamese">Vietnamese</option>
              <option value="Turkish">Turkish</option>
              <option value="Fusion">Fusion</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Dining Style</label>
            <select
              className="form-control"
              value={preferences.foodPreferences.diningStyle}
              onChange={(e) =>
                handleChange("foodPreferences", "diningStyle", e.target.value)
              }
            >
              <option value="fine dining">Fine Dining</option>
              <option value="street food">Street Food</option>
              <option value="casual">Casual</option>
            </select>
          </div>
        </div>

        {/* Must Do Activities Section */}
        <div className={styles.cardSection}>
          <h4>Must Do Activities</h4>
          <div className="mb-3">
            <label>Select Activities (multiple)</label>
            <select
              multiple
              className="form-control"
              value={preferences.mustDoActivities}
              onChange={(e) =>
                handleMultiSelectChange("mustDoActivities", "", e)
              }
            >
              <option value="go to the beach">Go to the Beach</option>
              <option value="visit a historical site">Visit a Historical Site</option>
              <option value="snorkeling">Snorkeling</option>
              <option value="diving">Diving</option>
              <option value="explore local culture">Explore Local Culture</option>
              <option value="hiking">Hiking</option>
              <option value="sightseeing">Sightseeing</option>
              <option value="shopping">Shopping</option>
              <option value="food tour">Food Tour</option>
              <option value="boat ride">Boat Ride</option>
              <option value="nature walk">Nature Walk</option>
              <option value="museum visit">Museum Visit</option>
              <option value="attend a festival">Attend a Festival</option>
              <option value="wine tasting">Wine Tasting</option>
              <option value="local market tour">Local Market Tour</option>
              <option value="island hopping">Island Hopping</option>
              <option value="sunset cruise">Sunset Cruise</option>
              <option value="kayaking">Kayaking</option>
              <option value="camping">Camping</option>
            </select>
          </div>
        </div>

        {/* Fitness Level Section */}
        <div className={styles.cardSection}>
          <h4>Fitness Level</h4>
          <div className="mb-3">
            <select
              className="form-control"
              value={preferences.fitnessLevel}
              onChange={(e) =>
                handleSimpleChange("fitnessLevel", e.target.value)
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Logistics Section */}
        <div className={styles.cardSection}>
          <h4>Logistics</h4>
          <div className="mb-3">
            <label>Departure Location</label>
            <input
              type="text"
              className="form-control"
              value={preferences.logistics.departureLocation}
              onChange={(e) =>
                handleChange("logistics", "departureLocation", e.target.value)
              }
            />
          </div>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={preferences.logistics.travelInsurance}
              onChange={(e) =>
                handleChange("logistics", "travelInsurance", e.target.checked)
              }
              id="travelInsurance"
            />
            <label className="form-check-label" htmlFor="travelInsurance">
              Travel Insurance
            </label>
          </div>
          <div className="mb-3">
            <label>Passport Details</label>
            <input
              type="text"
              className="form-control"
              value={preferences.logistics.passportDetails}
              onChange={(e) =>
                handleChange("logistics", "passportDetails", e.target.value)
              }
            />
          </div>
        </div>

        {/* Customization Section */}
        <div className={styles.cardSection}>
          <h4>Customization</h4>
          <div className="mb-3">
            <label>Travel Pace</label>
            <select
              className="form-control"
              value={preferences.customization.pace}
              onChange={(e) =>
                handleChange("customization", "pace", e.target.value)
              }
            >
              <option value="relaxed">Relaxed</option>
              <option value="packed">Packed</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Duration per Destination (days)</label>
            <input
              type="number"
              className="form-control"
              value={preferences.customization.durationPerDestination}
              onChange={(e) =>
                handleChange("customization", "durationPerDestination", parseInt(e.target.value))
              }
            />
          </div>
          <div className="mb-3">
            <label>Special Occasions (select multiple)</label>
            <select
              multiple
              className="form-control"
              value={preferences.customization.specialOccasions}
              onChange={(e) =>
                handleMultiSelectChange("customization", "specialOccasions", e)
              }
            >
              <option value="Birthday">Birthday</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Honeymoon">Honeymoon</option>
              <option value="Family Reunion">Family Reunion</option>
              <option value="Festival">Festival</option>
              <option value="Holiday">Holiday</option>
              <option value="Graduation">Graduation</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Environmental Preferences Section */}
        <div className={styles.cardSection}>
          <h4>Environmental Preferences</h4>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={preferences.environmentalPreferences.sustainability}
              onChange={(e) =>
                handleChange("environmentalPreferences", "sustainability", e.target.checked)
              }
              id="sustainability"
            />
            <label className="form-check-label" htmlFor="sustainability">
              Sustainability
            </label>
          </div>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={preferences.environmentalPreferences.supportLocal}
              onChange={(e) =>
                handleChange("environmentalPreferences", "supportLocal", e.target.checked)
              }
              id="supportLocal"
            />
            <label className="form-check-label" htmlFor="supportLocal">
              Support Local Businesses
            </label>
          </div>
        </div>

        {/* Other Considerations Section */}
        <div className={styles.cardSection}>
          <h4>Other Considerations</h4>
          <div className="mb-3">
            <label>Health Concerns (select multiple)</label>
            <select
              multiple
              className="form-control"
              value={preferences.otherConsiderations.healthConcerns}
              onChange={(e) =>
                handleMultiSelectChange("otherConsiderations", "healthConcerns", e)
              }
            >
              <option value="diabetes">Diabetes</option>
              <option value="hypertension">Hypertension</option>
              <option value="heart condition">Heart Condition</option>
              <option value="allergies">Allergies</option>
              <option value="asthma">Asthma</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Seasonal Preferences (select multiple)</label>
            <select
              multiple
              className="form-control"
              value={preferences.otherConsiderations.seasonalPreferences}
              onChange={(e) =>
                handleMultiSelectChange("otherConsiderations", "seasonalPreferences", e)
              }
            >
              <option value="Peak Season">Peak Season</option>
              <option value="Shoulder Season">Shoulder Season</option>
              <option value="Off-Peak">Off-Peak</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Shopping Preferences (select multiple)</label>
            <select
              multiple
              className="form-control"
              value={preferences.otherConsiderations.shoppingPreferences}
              onChange={(e) =>
                handleMultiSelectChange("otherConsiderations", "shoppingPreferences", e)
              }
            >
              <option value="luxury">Luxury</option>
              <option value="budget">Budget</option>
              <option value="boutique">Boutique</option>
              <option value="mall">Mall</option>
              <option value="local markets">Local Markets</option>
              <option value="artisan">Artisan</option>
              <option value="discount">Discount</option>
              <option value="high-end">High-End</option>
              <option value="mid-range">Mid-Range</option>
            </select>
          </div>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={preferences.otherConsiderations.privacyRequirements}
              onChange={(e) =>
                handleChange("otherConsiderations", "privacyRequirements", e.target.checked)
              }
              id="privacyRequirements"
            />
            <label className="form-check-label" htmlFor="privacyRequirements">
              Privacy Requirements
            </label>
          </div>
        </div>

        {/* Length of Stay Section */}
        <div className={styles.cardSection}>
          <h4>Length of Stay</h4>
          <div className="mb-3">
            <label>Days</label>
            <input
              type="number"
              className="form-control"
              value={preferences.lengthOfStay}
              onChange={(e) =>
                handleSimpleChange("lengthOfStay", parseInt(e.target.value))
              }
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mb-4">
          <button type="submit" className="btn btn-success save-button w-100">
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
