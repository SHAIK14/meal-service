// src/utils/api.js
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Token management
const getToken = () => localStorage.getItem("kitchenToken");
const setToken = (token) => localStorage.setItem("kitchenToken", token);
const removeToken = () => localStorage.removeItem("kitchenToken");

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Response handler
const handleResponse = async (apiCall) => {
  try {
    const response = await apiCall;
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response?.status === 401) {
      removeToken();
    }
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// Auth endpoints
export const login = async (username, password) => {
  const result = await handleResponse(
    api.post("/kitchen/login", { username, password })
  );
  if (result.success && result.data.token) {
    setToken(result.data.token);
  }
  return result;
};

export const logout = () => {
  removeToken();
  window.location.href = "/login";
  return { success: true, message: "Logged out successfully" };
};

// Kitchen endpoints
export const getMealCounts = async (date) => {
  return handleResponse(
    api.get("/kitchen/meal-counts", {
      params: { date },
    })
  );
};

export const getOrdersForKOT = async (date) => {
  return handleResponse(
    api.get("/kitchen/orders-for-kot", {
      params: { date },
    })
  );
};

export const generateKOT = async (orders, timeSlot) => {
  return handleResponse(
    api.post("/kitchen/generate-kot", {
      orders,
      timeSlot,
    })
  );
};

export default api;
