import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// const API_URL = "http://localhost:5000/api";
const getApiUrl = () => {
  if (__DEV__) {
    const localIpAddress = "172.20.10.5"; // Replace with your actual IP address if different
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

//  plan-related API calls
export const getAllPlans = async () => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await fetch(`${API_URL}/plans`, {
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

    return response.json();
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

// Validate a promo code
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
