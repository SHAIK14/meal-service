/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first coordinate
 * @param {number} lon1 - Longitude of first coordinate
 * @param {number} lat2 - Latitude of second coordinate
 * @param {number} lon2 - Longitude of second coordinate
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance;
};

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Get formatted address components from geocoding result
 * @param {Object} result - Geocoding API result
 * @returns {Object} Formatted address components
 */
export const extractAddressComponents = (result) => {
  if (!result || !result.address_components) {
    return {};
  }

  const components = {};

  result.address_components.forEach((component) => {
    if (component.types.includes("locality")) {
      components.city = component.long_name;
    } else if (component.types.includes("administrative_area_level_1")) {
      components.state = component.long_name;
    } else if (component.types.includes("country")) {
      components.country = component.long_name;
    } else if (component.types.includes("postal_code")) {
      components.pincode = component.long_name;
    } else if (component.types.includes("route")) {
      components.route = component.long_name;
    } else if (
      component.types.includes("sublocality_level_1") ||
      component.types.includes("sublocality")
    ) {
      components.area = component.long_name;
    }
  });

  return components;
};

/**
 * Get current location
 * @returns {Promise<Object>} Location object with coordinates
 */
export const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Permission to access location was denied");
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return location;
};
