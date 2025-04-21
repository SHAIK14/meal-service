import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL for all API calls
const API_URL = "http://192.168.1.4:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API functions
export const sendOTP = async (phoneNumber, countryCode) => {
  try {
    const response = await api.post("/mobile/auth/send-otp", {
      phoneNumber,
      countryCode,
    });
    return response.data;
  } catch (error) {
    console.error("Send OTP error:", error.response?.data || error.message);
    throw error;
  }
};

export const verifyOTP = async (phoneNumber, countryCode, otp) => {
  try {
    console.log("Verifying OTP with data:", {
      phoneNumber,
      countryCode,
      otp,
    });
    const response = await api.post("/mobile/auth/verify-otp", {
      phoneNumber,
      countryCode,
      otp,
    });
    console.log("Verification response:", response.data);

    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Verify OTP error:", error.response?.data || error.message);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get("/mobile/auth/profile");
    return response.data;
  } catch (error) {
    console.error("Get profile error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put("/mobile/auth/profile", userData);
    return response.data;
  } catch (error) {
    console.error(
      "Update profile error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem("token");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error.message);
    throw error;
  }
};

// Menu API functions
export const getDiningMenuItems = async () => {
  try {
    const response = await api.get("/mobile/menu/dining-items");
    return response.data;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
};

export const getDiningCategories = async () => {
  try {
    const response = await api.get("/mobile/menu/dining-categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getItemsByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/mobile/menu/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching items by category:", error);
    throw error;
  }
};

export const getItemDetails = async (itemId) => {
  try {
    const response = await api.get(`/mobile/menu/item/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching item details:", error);
    throw error;
  }
};

// Cart API functions
export const getCart = async () => {
  try {
    const response = await api.get("/mobile/cart");
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

export const addToCart = async (itemId, quantity) => {
  try {
    const response = await api.post("/mobile/cart/add", {
      itemId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await api.put("/mobile/cart/update", {
      itemId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

export const removeFromCart = async (itemId) => {
  try {
    const response = await api.delete(`/mobile/cart/remove/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await api.delete("/mobile/cart/clear");
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

// Address API functions
export const getAddresses = async () => {
  try {
    const response = await api.get("/mobile/address");
    return response.data;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
};

export const addAddress = async (addressData) => {
  try {
    const response = await api.post("/mobile/address", addressData);
    return response.data;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await api.put(`/mobile/address/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const response = await api.delete(`/mobile/address/${addressId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

export const setDefaultAddress = async (addressId) => {
  try {
    const response = await api.put(`/mobile/address/default/${addressId}`);
    return response.data;
  } catch (error) {
    console.error("Error setting default address:", error);
    throw error;
  }
};

export const geocodeAddress = async (address) => {
  try {
    const response = await api.post("/mobile/address/geocode", { address });
    return response.data;
  } catch (error) {
    console.error("Error geocoding address:", error);
    throw error;
  }
};

// Branch API functions
export const getNearbyBranches = async (coordinates) => {
  try {
    const response = await api.post("/mobile/branches/nearby", coordinates);
    return response.data;
  } catch (error) {
    console.error("Error fetching nearby branches:", error);
    throw error;
  }
};

export const checkDeliveryAvailability = async (coordinates) => {
  try {
    const response = await api.post(
      "/mobile/branches/check-delivery",
      coordinates
    );
    return response.data;
  } catch (error) {
    console.error("Error checking delivery availability:", error);
    throw error;
  }
};

// Order preparation API functions
export const preparePickupOrder = async (branchId, addressId) => {
  try {
    const response = await api.post("/mobile/orders/prepare-pickup", {
      branchId,
      addressId,
    });
    return response.data;
  } catch (error) {
    console.error("Error preparing pickup order:", error);
    throw error;
  }
};

export const prepareDeliveryOrder = async (addressId) => {
  try {
    const response = await api.post("/mobile/orders/prepare-delivery", {
      addressId,
    });
    return response.data;
  } catch (error) {
    console.error("Error preparing delivery order:", error);
    throw error;
  }
};

// Voucher API functions
export const validateVoucher = async (promoCode) => {
  try {
    const response = await api.post("/mobile/voucher/validate", { promoCode });
    return response.data;
  } catch (error) {
    console.error("Error validating voucher:", error);
    throw error;
  }
};

export const applyVoucher = async (voucherId) => {
  try {
    const response = await api.post("/mobile/voucher/apply", { voucherId });
    return response.data;
  } catch (error) {
    console.error("Error applying voucher:", error);
    throw error;
  }
};

// Payment API functions
export const getPaymentMethods = async () => {
  try {
    const response = await api.get("/mobile/payment/methods");
    return response.data;
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    throw error;
  }
};

export const processPayment = async (paymentMethod, voucherId) => {
  try {
    const response = await api.post("/mobile/payment/process", {
      paymentMethod,
      voucherId,
    });
    return response.data;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

export const finalizeOrder = async (orderData) => {
  try {
    const response = await api.post("/mobile/payment/finalize", orderData);
    return response.data;
  } catch (error) {
    console.error("Error finalizing order:", error);
    throw error;
  }
};
// Order tracking API functions
export const getOrderHistory = async (page = 1, limit = 10, status = null) => {
  try {
    let url = `/mobile/orders/history?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching order history:", error);
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`/mobile/orders/details/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

export const getLatestOrder = async () => {
  try {
    const response = await api.get("/mobile/orders/latest");
    return response.data;
  } catch (error) {
    console.error("Error fetching latest order:", error);
    throw error;
  }
};

export const getOrderStatus = async (orderId) => {
  try {
    const response = await api.get(`/mobile/orders/status/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order status:", error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await api.put(`/mobile/orders/cancel/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};
