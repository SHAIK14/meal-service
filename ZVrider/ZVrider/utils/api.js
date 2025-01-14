import AsyncStorage from "@react-native-async-storage/async-storage";

const getApiUrl = () => {
  if (__DEV__) {
    const localIpAddress = "192.168.1.105"; // Replace with your IP
    return `http://${localIpAddress}:5000/api`;
  } else {
    return "https://your-production-api-url.com/api";
  }
};

export const API_URL = getApiUrl();

// Driver Login
export const loginDriver = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/driver/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Store token if login successful
    if (data.token) {
      await AsyncStorage.setItem("driverToken", data.token);
      await AsyncStorage.setItem("driverId", data.driverId);
    }

    return data;
  } catch (error) {
    console.error("Error in loginDriver:", error);
    throw error;
  }
};

// Change Password
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const token = await AsyncStorage.getItem("driverToken");

    const response = await fetch(`${API_URL}/driver/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Password change failed");
    }

    return data;
  } catch (error) {
    console.error("Error in changePassword:", error);
    throw error;
  }
};

// Logout
export const logoutDriver = async () => {
  try {
    await AsyncStorage.removeItem("driverToken");
    await AsyncStorage.removeItem("driverId");
  } catch (error) {
    console.error("Error in logout:", error);
    throw error;
  }
};
