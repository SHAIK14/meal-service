import AsyncStorage from "@react-native-async-storage/async-storage";
const API_URL = "http://localhost:5000/api";

export const requestOTP = async (phoneNumber) => {
  const response = await fetch(`${API_URL}/auth/request-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to request OTP");
  }

  return response.json();
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

// export const getUserInfo = async (token) => {
//   const response = await fetch(`${API_URL}/me`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.message || "Failed to get user info");
//   }

//   return response.json();
// };
