import { GOOGLE_MAPS_API_KEY } from "@env";

/**
 * Configuration for Map related functionality
 */

export const MAP_CONFIG = {
  GOOGLE_MAPS_API_KEY: GOOGLE_MAPS_API_KEY,

  // Map default settings
  DEFAULT_LATITUDE_DELTA: 0.005,
  DEFAULT_LONGITUDE_DELTA: 0.005,

  // Default location (India center)
  DEFAULT_REGION: {
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  },

  // Map style options
  MAP_STYLE: {
    standard: "standard",
    satellite: "satellite",
    hybrid: "hybrid",
  },

  // Geocoding API endpoint
  GEOCODING_API_URL: "https://maps.googleapis.com/maps/api/geocode/json",

  // Places API endpoint
  PLACES_API_URL: "https://maps.googleapis.com/maps/api/place/textsearch/json",

  // Address types
  ADDRESS_TYPES: ["Home", "Office", "Other"],

  // Marker colors
  MARKER_COLORS: {
    default: "#ff6b6b",
    selected: "#ff0000",
    store: "#4285F4",
  },
};
