import axios from "axios";

const API_URL = "http://localhost:5000/api";
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
export const login = async (username, password) => {
  const result = await handleResponse(
    api.post("/admin/login", { username, password })
  );
  if (result.success && result.data.token) {
    setToken(result.data.token);
  }
  return result;
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

export default api;
