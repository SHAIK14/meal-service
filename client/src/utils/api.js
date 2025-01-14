import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// const API_URL = "http://localhost:5000/api";
const getApiUrl = () => {
  if (__DEV__) {
    const localIpAddress = "192.168.0.107"; // Replace with your actual IP address if different

    return `http://${localIpAddress}:5000/api`;
  } else {
    return "https://your-production-api-url.com/api";
  }
};

export const API_URL = getApiUrl();
console.log("API_URL:", API_URL);
export const requestOTP = async (phoneNumber) => {
  console.log(
    `Requesting OTP for ${phoneNumber} to ${API_URL}/auth/request-otp`
  );
  try {
    const response = await fetch(`${API_URL}/auth/request-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber }),
    });

    console.log("Response status:", response.status);

    const responseData = await response.json();
    console.log("Response data:", responseData);

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to request OTP");
    }

    return responseData;
  } catch (error) {
    console.error("Error in requestOTP:", error);
    throw error;
  }
};
export const verifyOTP = async (phoneNumber, otp) => {
  const response = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber, otp }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to verify OTP");
  }

  return response.json();
};
export const updateUserInfo = async (userInfo) => {
  const token = await AsyncStorage.getItem("userToken");
  const response = await fetch(`${API_URL}/users/update-info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userInfo),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update user info");
  }

  return response.json();
};

export const getUserStatus = async () => {
  const token = await AsyncStorage.getItem("userToken");
  const response = await fetch(`${API_URL}/users/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to get user status");
  }

  return response.json();
};

export const updateUserAddress = async (addressData) => {
  const token = await AsyncStorage.getItem("userToken");
  const response = await fetch(`${API_URL}/users/update-address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update address");
  }

  return response.json();
};
export const getUserAddress = async () => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/users/address`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      throw new Error("Invalid JSON response from server");
    }
  } catch (error) {
    console.error("Error in getUserAddress:", error);
    throw error;
  }
};
export const getBranchServiceInfo = async () => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/users/branch-service-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch branch service info"
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error in getBranchServiceInfo:", error);
    throw error;
  }
};

//  plan-related API calls
export const getAllPlans = async (filters = {}) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.service) queryParams.append("service", filters.service);
    if (filters.isVeg) queryParams.append("isVeg", filters.isVeg);
    if (filters.isNonVeg) queryParams.append("isNonVeg", filters.isNonVeg);
    if (filters.isIndividual)
      queryParams.append("isIndividual", filters.isIndividual);
    if (filters.isMultiple)
      queryParams.append("isMultiple", filters.isMultiple);

    const queryString = queryParams.toString();
    const url = `${API_URL}/plans${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch plans");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getAllPlans:", error);
    throw error;
  }
};

export const getPlansByService = async (service) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/plans/service/${service}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch plans by service");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getPlansByService:", error);
    throw error;
  }
};

export const getPlanById = async (planId) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/plans/${planId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch plan");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getPlanById:", error);
    throw error;
  }
};

export const getPlanWeeklyMenu = async (planId) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/plans/${planId}/weekly-menu`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch weekly menu");
    }

    const data = await response.json();

    return {
      success: data.success,
      data: {
        weekMenu: data.data.weekMenu,
        packagePricing: data.data.packagePricing,
        currency: data.data.currency,
        status: data.data.status,
        weekNumber: data.data.weekNumber,
        cycleNumber: data.data.cycleNumber,
      },
    };
  } catch (error) {
    console.error("Error in getPlanWeeklyMenu:", error);
    throw error;
  }
};

export const getItemsBatch = async (itemIds) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/plans/items/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch items");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getItemsBatch:", error);
    throw error;
  }
};

// Helper functions for data formatting
export const formatPlanData = (plan) => {
  return {
    ...plan,
    packagePricing: plan.packagePricing
      ? Object.fromEntries(plan.packagePricing)
      : {},
    weekMenu: plan.weekMenu ? formatWeekMenuData(plan.weekMenu) : null,
  };
};

export const formatWeekMenuData = (weekMenu) => {
  if (!weekMenu) return null;

  const formattedMenu = {};
  for (const [day, meals] of Object.entries(weekMenu)) {
    formattedMenu[day] = Object.fromEntries(meals);
  }
  return formattedMenu;
};

// promo code
export const getAvailableVouchers = async () => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    console.log(
      "Fetching vouchers from:",
      `${API_URL}/user/vouchers/available`
    );
    console.log("With token:", token);

    const response = await fetch(`${API_URL}/user/vouchers/available`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing response:", e);
      throw new Error("Invalid response format");
    }

    console.log("Parsed voucher data:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch available vouchers");
    }

    return data;
  } catch (error) {
    console.error("Detailed error in getAvailableVouchers:", error);
    throw error;
  }
};

export const validateVoucher = async (promoCode) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/user/vouchers/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        promoCode,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to validate voucher");
    }

    const responseData = await response.json();
    console.log("Voucher validation response:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error in validateVoucher:", error);
    throw error;
  }
};

// Create new subscription
export const createSubscription = async (subscriptionData) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/subscriptions/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create subscription");
    }

    return response.json();
  } catch (error) {
    console.error("Error in createSubscription:", error);
    throw error;
  }
};

// Get user's active subscriptions
export const getActiveSubscriptions = async () => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/subscriptions/active`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch active subscriptions"
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error in getActiveSubscriptions:", error);
    throw error;
  }
};

// Get subscription history
export const getSubscriptionHistory = async () => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/subscriptions/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch subscription history"
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error in getSubscriptionHistory:", error);
    throw error;
  }
};

// Get specific subscription details
export const getSubscriptionDetails = async (orderId) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/subscriptions/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch subscription details"
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error in getSubscriptionDetails:", error);
    throw error;
  }
};

// Update subscription status (cancel/pause)
export const updateSubscriptionStatus = async (orderId, status) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/subscriptions/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to update subscription status"
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error in updateSubscriptionStatus:", error);
    throw error;
  }
};
// subsctiption
export const getTodayMenus = async () => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/menu/today`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch today's menus");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getTodayMenus:", error);
    throw error;
  }
};

export const getWeeklyMenu = async (orderId) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/menu/weekly/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch weekly menu");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getWeeklyMenu:", error);
    throw error;
  }
};

// Get menu for a specific date
export const getMenuForDate = async (date) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/menu/date?date=${date}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch menu for date");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getMenuForDate:", error);
    throw error;
  }
};

// Get all available dates for a subscription
export const getSubscriptionDates = async (orderId) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/menu/dates/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch subscription dates"
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error in getSubscriptionDates:", error);
    throw error;
  }
};
// user config

export const getConfig = async () => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/config`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch configuration");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getConfig:", error);
    throw error;
  }
};
// Active Subscription APIs
export const getActiveSubscriptionMenus = async () => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    // This will fetch all active subscriptions with today's menu
    const response = await fetch(`${API_URL}/subscriptions/user/active`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch active subscription menus"
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error in getActiveSubscriptionMenus:", error);
    throw error;
  }
};

export const getSubscriptionTodayMenu = async (orderId) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(
      `${API_URL}/subscriptions/user/${orderId}/today-menu`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch today's menu");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getSubscriptionTodayMenu:", error);
    throw error;
  }
};

export const getSubscriptionUpcomingMenus = async (orderId) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(
      `${API_URL}/subscriptions/user/${orderId}/upcoming`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch upcoming menus");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getSubscriptionUpcomingMenus:", error);
    throw error;
  }
};

// Helper function to process subscription menu data
export const processMenuData = (menuData) => {
  return {
    ...menuData,
    isAvailable: menuData.isAvailable ?? false,
    packages: menuData.packages ? Object.fromEntries(menuData.packages) : {},
    deliveryTime: menuData.deliveryTime || null,
    unavailableReason: menuData.unavailableReason || null,
  };
};

// Helper function to format menu items
export const formatMenuItem = (item) => {
  return {
    id: item._id,
    nameEnglish: item.nameEnglish,
    nameArabic: item.nameArabic,
    descriptionEnglish: item.descriptionEnglish,
    descriptionArabic: item.descriptionArabic,
    image: item.image,
    calories: item.calories,
    ingredients: item.ingredients || [],
  };
};

// Get skip availability for a subscription
export const getSkipAvailability = async (orderId) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(
      `${API_URL}/subscriptions/user/${orderId}/skip-availability`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch skip availability");
    }

    return response.json();
  } catch (error) {
    console.error("Error in getSkipAvailability:", error);
    throw error;
  }
};

// Skip a meal for a specific date
export const skipSubscriptionDay = async (orderId, skipDate) => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(
      `${API_URL}/subscriptions/user/${orderId}/skip`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skipDate }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to skip subscription day");
    }

    return response.json();
  } catch (error) {
    console.error("Error in skipSubscriptionDay:", error);
    throw error;
  }
};
