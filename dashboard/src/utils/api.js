import axios from "axios";

// const API_URL = "http://localhost:5001/api";
const API_URL = process.env.REACT_APP_API_URL;
const api = axios.create({
  baseURL: API_URL,
});

// Token management
const getToken = () => localStorage.getItem("adminToken");
const setToken = (token) => localStorage.setItem("adminToken", token);
const removeToken = () => localStorage.removeItem("adminToken");

// Axios request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const handleResponse = async (apiCall) => {
  try {
    const response = await apiCall;
    return { success: true, data: response.data };
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// Authentication
// In api.js, modify the login function:
export const login = async (username, password) => {
  try {
    const response = await api.post("/admin/login", { username, password });
    console.log("Raw login response:", response.data); // Debug log

    if (response.data.success && response.data.data.token) {
      setToken(response.data.data.token);

      // Store user type and services in localStorage
      if (response.data.data.type) {
        localStorage.setItem("userType", response.data.data.type);
      }

      if (response.data.data.services) {
        localStorage.setItem(
          "userServices",
          JSON.stringify(response.data.data.services)
        );
      }

      return {
        success: true,
        data: response.data.data,
      };
    }
    return {
      success: false,
      error: "Invalid credentials",
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};
export const logout = () => {
  removeToken();
  return { success: true, message: "Logged out successfully" };
};

// Category management functions
export const getAllCategories = async () => {
  try {
    const response = await api.get("/admin/categories");
    console.log("Raw API response:", response);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    return { success: false, error: error.message };
  }
};

export const createCategory = (categoryData) =>
  handleResponse(api.post("/admin/categories", categoryData));

export const deleteCategory = (categoryId) =>
  handleResponse(api.delete(`/admin/categories/${categoryId}`));

// Item management functions
export const createItem = (itemData) =>
  handleResponse(api.post("/admin/items", itemData));
// In your api.js file
export const getDashboardItems = async (params) => {
  try {
    const response = await api.get("/admin/items/dashboard", { params });
    return { success: true, ...response.data };
  } catch (error) {
    console.error("Error in getDashboardItems:", error);
    return { success: false, error: error.message };
  }
};
export const getAllItems = async (params) => {
  try {
    const response = await api.get("/admin/items", { params });
    return { success: true, ...response.data };
  } catch (error) {
    console.error("Error in getAllItems:", error);
    return { success: false, error: error.message };
  }
};

export const getItemsByCategory = async (
  categoryName,
  page = 1,
  limit = 10
) => {
  try {
    const response = await api.get(`/admin/items/category/${categoryName}`, {
      params: { page, limit },
    });
    return { success: true, ...response.data };
  } catch (error) {
    console.error("Error in getItemsByCategory:", error);
    return { success: false, error: error.message };
  }
};

export const getItemById = async (itemId) => {
  try {
    const response = await api.get(`/admin/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Error in getItemById:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const updateItem = async (itemId, itemData) => {
  try {
    const response = await api.put(`/admin/items/${itemId}`, itemData);
    return response.data;
  } catch (error) {
    console.error("Error in updateItem:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const deleteItem = async (itemId) => {
  try {
    const response = await api.delete(`/admin/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Error in deleteItem:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};
export const toggleItemAvailability = async (itemId) => {
  try {
    const response = await api.patch(
      `/admin/items/${itemId}/toggle-availability`
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in toggleItemAvailability:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};
// Plan management functions
export const createPlan = (planData) =>
  handleResponse(api.post("/admin/plans", planData));

export const getAllPlans = async () => {
  try {
    const response = await api.get("/admin/plans");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in getAllPlans:", error);
    return { success: false, error: error.message };
  }
};

export const getPlanById = async (planId) => {
  try {
    const response = await api.get(`/admin/plans/${planId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in getPlanById:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const updatePlan = async (planId, planData) => {
  try {
    const response = await api.put(`/admin/plans/${planId}`, planData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in updatePlan:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const deletePlan = async (planId) => {
  try {
    const response = await api.delete(`/admin/plans/${planId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in deletePlan:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const updateWeekMenu = async (planId, weekMenuData) => {
  try {
    const response = await api.patch(
      `/admin/plans/${planId}/week-menu`,
      weekMenuData
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in updateWeekMenu:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const getWeekMenu = async (planId) => {
  try {
    const response = await api.get(`/admin/plans/${planId}/week-menu`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in getWeekMenu:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};
export default api;

// Voucher management functions
export const createVoucher = async (voucherData) => {
  try {
    const response = await api.post("/admin/vouchers", voucherData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in createVoucher:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const getAllVouchers = async () => {
  try {
    const response = await api.get("/admin/vouchers");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in getAllVouchers:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const toggleVoucherStatus = async (voucherId) => {
  try {
    const response = await api.patch(`/admin/vouchers/${voucherId}/toggle`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in toggleVoucherStatus:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const deleteVoucher = async (voucherId) => {
  try {
    const response = await api.delete(`/admin/vouchers/${voucherId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in deleteVoucher:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// Get all subscriptions with filters
// Update these subscription-related functions in your api.js

export const getAllSubscriptions = async (params) => {
  try {
    const response = await api.get("/admin/subscriptions", { params });
    console.log("getAllSubscriptions raw response:", response);

    // Ensure we're returning the correct data structure
    if (response.data && response.data.data) {
      return {
        success: true,
        data: {
          subscriptions: response.data.data.subscriptions || [],
          pagination: response.data.data.pagination || {},
          stats: response.data.data.stats || {},
        },
      };
    }

    // If the response structure is different, try to adapt it
    return {
      success: true,
      data: {
        subscriptions: Array.isArray(response.data) ? response.data : [],
        pagination: response.data.pagination || {},
        stats: response.data.stats || {},
      },
    };
  } catch (error) {
    console.error("Error in getAllSubscriptions:", error);
    console.error("Error response:", error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      data: { subscriptions: [], pagination: {}, stats: {} },
    };
  }
};

export const getSubscriptionAnalytics = async (params) => {
  try {
    const response = await api.get("/admin/subscriptions/analytics", {
      params,
    });
    console.log("getSubscriptionAnalytics raw response:", response);

    return {
      success: true,
      data: response.data.data || response.data || {},
    };
  } catch (error) {
    console.error("Error in getSubscriptionAnalytics:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      data: {},
    };
  }
};

export const updateSubscriptionStatus = async (id, statusData) => {
  try {
    const response = await api.patch(
      `/admin/subscriptions/${id}/status`,
      statusData
    );
    console.log("updateSubscriptionStatus raw response:", response);

    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("Error in updateSubscriptionStatus:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

// Get subscription by ID
export const getSubscriptionById = async (id) => {
  try {
    const response = await api.get(`/admin/subscriptions/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in getSubscriptionById:", error);
    return { success: false, error: error.message };
  }
};

// user.js
export const getAllUsers = async (params) => {
  try {
    const response = await api.get("/admin/users", { params });
    return { success: true, ...response.data };
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return { success: false, error: error.message };
  }
};

export const getUserAnalytics = async () => {
  try {
    const response = await api.get("/admin/users/analytics");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in getUserAnalytics:", error);
    return { success: false, error: error.message };
  }
};
//config
// Add these functions after your existing exports
// Base Configuration
export const getConfiguration = async (branchId) => {
  try {
    const response = await api.get(`/admin/config/${branchId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in getConfiguration:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const updateBasicConfig = async (branchId, configData) => {
  try {
    const response = await api.put(
      `/admin/config/${branchId}/basic`,
      configData
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in updateBasicConfig:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// Location Settings

// Weekly Holidays
export const updateWeeklyHolidays = async (branchId, holidaysData) => {
  try {
    const response = await api.put(
      `/admin/config/${branchId}/weekly-holidays`,
      holidaysData
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in updateWeeklyHolidays:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// National Holidays
export const getNationalHolidays = async (branchId) => {
  try {
    const response = await api.get(`/admin/config/${branchId}/holidays`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in getNationalHolidays:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const addNationalHoliday = async (branchId, holidayData) => {
  try {
    const response = await api.post(
      `/admin/config/${branchId}/holiday`,
      holidayData
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in addNationalHoliday:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const updateNationalHoliday = async (
  branchId,
  holidayId,
  holidayData
) => {
  try {
    const response = await api.put(
      `/admin/config/${branchId}/holiday/${holidayId}`,
      holidayData
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in updateNationalHoliday:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const deleteNationalHoliday = async (branchId, holidayId) => {
  try {
    const response = await api.delete(
      `/admin/config/${branchId}/holiday/${holidayId}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in deleteNationalHoliday:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// Emergency Closures
export const getEmergencyClosures = async (branchId) => {
  try {
    const response = await api.get(`/admin/config/${branchId}/emergencies`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in getEmergencyClosures:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const addEmergencyClosure = async (branchId, closureData) => {
  try {
    const response = await api.post(
      `/admin/config/${branchId}/emergency`,
      closureData
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in addEmergencyClosure:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const updateEmergencyClosure = async (
  branchId,
  closureId,
  closureData
) => {
  try {
    const response = await api.put(
      `/admin/config/${branchId}/emergency/${closureId}`,
      closureData
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in updateEmergencyClosure:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const deleteEmergencyClosure = async (branchId, closureId) => {
  try {
    const response = await api.delete(
      `/admin/config/${branchId}/emergency/${closureId}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in deleteEmergencyClosure:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// Delivery Time Slots
export const getDeliveryTimeSlots = async (branchId) => {
  try {
    const response = await api.get(`/admin/config/${branchId}/delivery-slots`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in getDeliveryTimeSlots:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const updateDeliveryTimeSlots = async (branchId, timeSlotsData) => {
  try {
    const response = await api.put(
      `/admin/config/${branchId}/delivery-slots`,
      timeSlotsData
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in updateDeliveryTimeSlots:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// Plan Durations
export const getPlanDurations = async (branchId) => {
  try {
    const response = await api.get(`/admin/config/${branchId}/plan-durations`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in getPlanDurations:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const addPlanDuration = async (branchId, durationData) => {
  try {
    const response = await api.post(
      `/admin/config/${branchId}/plan-duration`,
      durationData
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in addPlanDuration:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const updatePlanDuration = async (branchId, planId, durationData) => {
  try {
    const response = await api.put(
      `/admin/config/${branchId}/plan-duration/${planId}`,
      durationData
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in updatePlanDuration:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

export const deletePlanDuration = async (branchId, planId) => {
  try {
    const response = await api.delete(
      `/admin/config/${branchId}/plan-duration/${planId}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in deletePlanDuration:", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

/**
 * Sends a bulk upload request to the server
 * @param {Array|Object} itemData - Array of items or single item object
 * @returns {Promise<Object>} - Result of the bulk upload operation
 */

// Bulk Upload API
// Bulk upload items
export const bulkUploadItems = async (itemsData) => {
  return handleResponse(
    api.post("/admin/items/bulk-upload", { items: itemsData })
  );
};

// Process and upload Excel file for bulk item upload
export const processBulkExcelUpload = async (file) => {
  // Create form data if you're sending the file directly
  const formData = new FormData();
  formData.append("file", file);

  // If you're sending the file for server-side processing
  return handleResponse(
    api.post("/admin/items/bulk-upload-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};
