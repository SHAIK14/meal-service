import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Validate catering access based on pincode
export const validateCateringAccess = async (pincode) => {
  try {
    const response = await api.get(`/catering-menu/validate/${pincode}`);
    return response.data;
  } catch (error) {
    console.error("Error validating catering access:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to validate QR code",
    };
  }
};

// Get catering menu items for a branch
export const getCateringMenuItems = async (branchId) => {
  try {
    const response = await api.get(`/catering-menu/menu/${branchId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching catering menu items:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch menu items",
    };
  }
};

// Get detailed item information
export const getItemDetails = async (branchId, itemId) => {
  try {
    const response = await api.get(
      `/catering-menu/menu/${branchId}/items/${itemId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching item details:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch item details",
    };
  }
};

// Create catering order
export const createCateringOrder = async (orderData) => {
  try {
    const response = await api.post(
      `/catering-menu/catering-orders`,
      orderData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating catering order:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create order",
    };
  }
};

export default api;
