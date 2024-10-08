import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Replace with your actual API URL

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

// Helper function to handle API responses
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

export const getPlans = () => handleResponse(api.get("/admin/plans"));

// Item management functions
export const createItem = (itemData) =>
  handleResponse(api.post("/admin/items", itemData));

export const getAllItems = (params) =>
  handleResponse(api.get("/admin/items", { params }));

export const getItem = (id) => handleResponse(api.get(`/admin/items/${id}`));

export const updateItem = (id, itemData) =>
  handleResponse(api.put(`/admin/items/${id}`, itemData));

export const deleteItem = (id) =>
  handleResponse(api.delete(`/admin/items/${id}`));

export const toggleItemAvailability = (id) =>
  handleResponse(api.patch(`/admin/items/${id}/toggle-availability`));

// Category management functions
export const getAllCategories = () =>
  handleResponse(api.get("/admin/categories"));

export const createCategory = (categoryData) =>
  handleResponse(api.post("/admin/categories", categoryData));

export const deleteCategory = (id) =>
  handleResponse(api.delete(`/admin/categories/${id}`));

export const getItemsByCategory = (categoryName, page = 1, limit = 10) =>
  handleResponse(
    api.get(`/admin/items/category/${categoryName}`, {
      params: { page, limit },
    })
  );
export default api;
