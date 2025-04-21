import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogBox } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";

// Completely disable all console warnings - USE ONLY DURING DEVELOPMENT
// Remove this in production as warnings are important for debugging
if (__DEV__) {
  // Save the original console.warn
  const originalWarn = console.warn;

  // Override console.warn to filter out specific messages
  console.warn = (...args) => {
    // Check if this is a defaultProps warning
    if (
      typeof args[0] === "string" &&
      args[0].includes("Support for defaultProps will be removed")
    ) {
      // Ignore this specific warning
      return;
    }
    // For all other warnings, use the original console.warn
    originalWarn(...args);
  };
}

// Also keep the existing LogBox ignores as a backup
LogBox.ignoreLogs([
  "Warning: CountryItem: Support for defaultProps",
  "Warning: CountryPicker: Support for defaultProps",
  "Warning: Flag: Support for defaultProps",
  "Warning: Main: Support for defaultProps",
  "Warning: CountryModal: Support for defaultProps",
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
