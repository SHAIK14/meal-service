import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
// const API_URL = "http://localhost:5000/api";
const getApiUrl = () => {
  if (__DEV__) {
    const localIpAddress = "192.168.1.107"; // Replace with your actual IP address if different
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
