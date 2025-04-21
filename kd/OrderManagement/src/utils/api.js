import axios from "axios";

const API_URL = "http://192.168.1.4:5000/api";

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
// Table Management
export const updateTableStatus = async (tableId, status) => {
  try {
    const response = await api.put(`/kitchen/dining/tables/${tableId}/status`, {
      status,
    });
    return {
      success: true,
      data: response.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error updating table status:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update table status",
    };
  }
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
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/dining-menu/orders/${orderId}/status`, {
      status,
    });
    return {
      success: true,
      data: response.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update order status",
    };
  }
};
export const getTableSession = async (tableName) => {
  return handleResponse(api.get(`/kitchen/dining/tables/${tableName}/session`));
};

export const completeSession = async (sessionId) => {
  return handleResponse(
    api.post(`/kitchen/dining/sessions/${sessionId}/complete`)
  );
};

export const generateInvoice = async (sessionId) => {
  return handleResponse(
    api.get(`/kitchen/dining/sessions/${sessionId}/invoice`)
  );
};
// Get pending catering orders that need acceptance
export const getPendingCateringOrders = async () => {
  return handleResponse(api.get("/kitchen/catering/orders/pending"));
};

// Get catering orders for a specific date
export const getCateringOrdersByDate = async (date) => {
  const formattedDate =
    date instanceof Date ? date.toISOString().split("T")[0] : date;

  return handleResponse(
    api.get(`/kitchen/catering/orders/date/${formattedDate}`)
  );
};

// Get upcoming accepted catering orders
export const getUpcomingCateringOrders = async () => {
  return handleResponse(api.get("/kitchen/catering/orders/upcoming"));
};

// Get order counts by month (for calendar)
export const getCateringOrderCountsByMonth = async (year, month) => {
  return handleResponse(
    api.get(`/kitchen/catering/orders/counts/${year}/${month}`)
  );
};

// Update catering order status
export const updateCateringOrderStatus = async (orderId, status) => {
  return handleResponse(
    api.put(`/kitchen/catering/orders/${orderId}/status`, { status })
  );
};

// Get specific catering order details
export const getCateringOrderById = async (orderId) => {
  return handleResponse(api.get(`/kitchen/catering/orders/${orderId}`));
};

// Get pending takeaway orders that need acceptance
export const getPendingTakeawayOrders = async () => {
  return handleResponse(api.get("/kitchen/takeaway/orders/pending"));
};

// Get accepted takeaway orders
export const getAcceptedTakeawayOrders = async () => {
  return handleResponse(api.get("/kitchen/takeaway/orders/accepted"));
};

// Get takeaway orders for a specific date
export const getTakeawayOrdersByDate = async (date) => {
  const formattedDate =
    date instanceof Date ? date.toISOString().split("T")[0] : date;

  return handleResponse(
    api.get(`/kitchen/takeaway/orders/date/${formattedDate}`)
  );
};

// Update takeaway order status (accept, decline, etc.)
export const updateTakeawayOrderStatus = async (orderId, status) => {
  return handleResponse(
    api.put(`/kitchen/takeaway/orders/${orderId}/status`, { status })
  );
};

// Generate KOT for a takeaway order
export const generateTakeawayKOT = async (orderId) => {
  return handleResponse(api.post(`/kitchen/takeaway/orders/${orderId}/kot`));
};

// Get specific takeaway order details
export const getTakeawayOrderById = async (orderId) => {
  return handleResponse(api.get(`/kitchen/takeaway/orders/${orderId}`));
};

// Get all takeaway orders with optional filtering
export const getAllTakeawayOrders = async (filters) => {
  return handleResponse(
    api.get("/kitchen/takeaway/orders", { params: filters })
  );
};
// Get pending meal orders that need acceptance (admin only)
export const getPendingMealOrders = async () => {
  return handleResponse(api.get("/kitchen/meal/orders/pending"));
};

// Get accepted meal orders (for kitchen staff)
export const getAcceptedMealOrders = async () => {
  return handleResponse(api.get("/kitchen/meal/orders/accepted"));
};

// Get ready meal orders (admin only)
export const getReadyMealOrders = async () => {
  return handleResponse(api.get("/kitchen/meal/orders/ready"));
};

// Get meal orders for a specific date (admin view)
export const getMealOrdersByDate = async (date) => {
  const formattedDate =
    date instanceof Date ? date.toISOString().split("T")[0] : date;

  return handleResponse(api.get(`/kitchen/meal/orders/date/${formattedDate}`));
};

// Get meal orders for staff by date (only accepted/preparing)
export const getStaffMealOrdersByDate = async (date) => {
  const formattedDate =
    date instanceof Date ? date.toISOString().split("T")[0] : date;

  return handleResponse(
    api.get(`/kitchen/meal/staff/orders/date/${formattedDate}`)
  );
};

// Update meal order status (admin only)
export const updateMealOrderStatus = async (orderId, status) => {
  return handleResponse(
    api.put(`/kitchen/meal/orders/${orderId}/status`, { status })
  );
};

// Get specific meal order details
export const getMealOrderById = async (orderId) => {
  return handleResponse(api.get(`/kitchen/meal/orders/${orderId}`));
};

// Get all meal orders with filters (admin only)
export const getAllMealOrders = async (filters) => {
  return handleResponse(api.get("/kitchen/meal/orders", { params: filters }));
};

// Get meal order dashboard statistics
export const getMealOrderStats = async () => {
  return handleResponse(api.get("/kitchen/meal/stats"));
};

// Update order status (admin_approved, in_preparation, ready_for_pickup, etc.)
export const updateKitchenOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/kitchen/dining/orders/${orderId}/status`, {
      status,
    });
    return {
      success: true,
      data: response.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error updating kitchen order status:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update order status",
    };
  }
};

// Return/cancel items (admin only)// api.js - Add these new functions

// Cancel items (before serving)
export const cancelOrderItem = async (orderId, itemIndex, quantity, reason) => {
  try {
    const response = await api.post(
      `/kitchen/dining/orders/${orderId}/items/${itemIndex}/process`,
      {
        quantity,
        reason,
        actionType: "cancel",
      }
    );
    return {
      success: true,
      data: response.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error cancelling order item:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to cancel item",
    };
  }
};

// Return items (after serving)
export const returnOrderItem = async (orderId, itemIndex, quantity, reason) => {
  try {
    const response = await api.post(
      `/kitchen/dining/orders/${orderId}/items/${itemIndex}/process`,
      {
        quantity,
        reason,
        actionType: "return",
      }
    );
    return {
      success: true,
      data: response.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error returning order item:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to return item",
    };
  }
};
export default api;
