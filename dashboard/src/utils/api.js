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
  if (result.success && result.data.message === "Logged in successfully") {
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

export const getAllItems = () => handleResponse(api.get("/admin/items"));

export const getItem = (id) => handleResponse(api.get(`/admin/items/${id}`));

export const updateItem = (id, itemData) =>
  handleResponse(api.put(`/admin/items/${id}`, itemData));

export const deleteItem = (id) =>
  handleResponse(api.delete(`/admin/items/${id}`));

export const toggleItemAvailability = (id) =>
  handleResponse(api.patch(`/admin/items/${id}/toggle-availability`));

export default api;
