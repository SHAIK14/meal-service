// src/utils/api.js
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Validate takeaway access based on pincode
export const validateTakeAwayAccess = async (pincode) => {
  try {
    const response = await api.get(`/takeaway/order/access/${pincode}`);
    return response.data;
  } catch (error) {
    console.error("Error validating takeaway access:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to validate QR code",
    };
  }
};

// Get takeaway menu items for a branch
export const getTakeAwayMenuItems = async (branchId) => {
  try {
    const response = await api.get(`/takeaway/order/menu/${branchId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching takeaway menu items:", error);
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
      `/takeaway/order/item/${branchId}/${itemId}`
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

// Create takeaway order
export const createTakeAwayOrder = async (orderData) => {
  try {
    const response = await api.post(`/takeaway/order/order`, orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating takeaway order:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create order",
    };
  }
};

// Check order status by token
export const getOrderStatus = async (token) => {
  try {
    const response = await api.get(`/takeaway/order/order/${token}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order status:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch order status",
    };
  }
};

export default api;
