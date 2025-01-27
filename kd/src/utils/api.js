import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Token management for kitchen staff
const getToken = () => localStorage.getItem("kitchenToken");
const setToken = (token) => localStorage.setItem("kitchenToken", token);
const removeToken = () => localStorage.removeItem("kitchenToken");

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

// Kitchen Authentication
export const kitchenLogin = async (pincode, password) => {
  const result = await handleResponse(
    api.post("/kitchen/auth/login", { pincode, password })
  );
  if (result.success && result.data.data.token) {
    setToken(result.data.data.token);
  }
  return result;
};

export const kitchenLogout = () => {
  removeToken();
  return { success: true, message: "Logged out successfully" };
};
export const getBranchDetails = async () => {
  return handleResponse(api.get("/kitchen/auth/branch-details"));
};

// Utility function to check if kitchen staff is logged in
export const isKitchenAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Get current branch info (can be used in dashboard)
export const getCurrentBranch = () => {
  const token = getToken();
  if (!token) return null;

  try {
    // Parse the JWT token (split by dot and get the payload)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.id,
      name: payload.branchName,
      pincode: payload.pincode,
    };
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
};

// current orders
export const getKitchenOrders = async (date) => {
  return api.get(`/kitchen/orders/by-time`, {
    params: {
      date: date.toISOString().split("T")[0],
    },
  });
};
// KOT Generation
export const getKotByTime = async (date, fromTime, toTime) => {
  return handleResponse(
    api.get(`/kitchen/orders/kot-by-time`, {
      params: {
        date,
        fromTime,
        toTime,
      },
    })
  );
};
//dining
export const getBranchTables = async () => {
  return handleResponse(api.get("/kitchen/dining/tables"));
};

export const getBranchOrders = async (branchId) => {
  try {
    const response = await api.get(`/dining-menu/kitchen/orders/${branchId}`);

    // Ensure we're returning a consistent structure
    return {
      success: true,
      data: response.data.data, // Access the data property from the response
      message: response.data.message,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch orders",
      data: { orders: [] }, // Provide empty orders array as fallback
    };
  }
};
export default api;
