import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendOTP, verifyOTP, getUserProfile, logout } from "../api/authApi";

// Create auth store
const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Send OTP
  sendOTP: async (phoneNumber, countryCode) => {
    try {
      set({ loading: true, error: null });
      const response = await sendOTP(phoneNumber, countryCode);
      set({ loading: false });
      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to send OTP",
      });
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (phoneNumber, countryCode, otp) => {
    try {
      set({ loading: true, error: null });
      const response = await verifyOTP(phoneNumber, countryCode, otp);

      set({
        loading: false,
        user: response.user,
        token: response.token,
        isAuthenticated: true,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to verify OTP",
      });
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getUserProfile();

      set({
        loading: false,
        user: response.user,
        isAuthenticated: true,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to get profile",
      });
      throw error;
    }
  },

  // Check if user is logged in
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        set({ isAuthenticated: false, user: null, token: null });
        return false;
      }

      set({ token, loading: true });

      // Try to get user profile
      try {
        await get().getUserProfile();
        return true;
      } catch (error) {
        // If token is invalid, logout
        await get().logout();
        return false;
      }
    } catch (error) {
      console.error("Check auth error:", error);
      set({ isAuthenticated: false, user: null, token: null });
      return false;
    }
  },

  // Logout
  logout: async () => {
    try {
      await logout();
      set({ user: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
}));

export default useAuthStore;
