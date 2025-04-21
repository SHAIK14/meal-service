import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import useAuthStore from "../store/authStore";

// Screens
import PhoneScreen from "../screens/PhoneScreen";
import OtpScreen from "../screens/OtpScreen";
import MainTabNavigator from "./MainTabNavigator";
import AddressScreen from "../screens/AddressScreen";
import DeliveryTypeScreen from "../screens/DeliveryTypeScreen";
import BranchSelectionScreen from "../screens/BranchSelectionScreen";
import PaymentScreen from "../screens/PaymentScreen";
import OrderDetailsScreen from "../screens/OrderDetailsScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, checkAuth, loading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if user is already logged in when app starts
    const initAuth = async () => {
      await checkAuth();
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  // Show loading screen while checking authentication
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Authenticated user screens
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="Address"
              component={AddressScreen}
              options={{
                presentation: "modal",
                headerShown: true,
                headerTitle: "Delivery Address",
                headerTintColor: "#333",
                headerStyle: {
                  backgroundColor: "#fff",
                  elevation: 0,
                  shadowOpacity: 0,
                },
              }}
            />
            <Stack.Screen
              name="DeliveryType"
              component={DeliveryTypeScreen}
              options={{
                headerShown: true,
                headerTitle: "Delivery Options",
                headerTintColor: "#333",
                headerStyle: {
                  backgroundColor: "#fff",
                  elevation: 0,
                  shadowOpacity: 0,
                },
              }}
            />
            <Stack.Screen
              name="BranchSelection"
              component={BranchSelectionScreen}
              options={{
                headerShown: true,
                headerTitle: "Select Pickup Location",
                headerTintColor: "#333",
                headerStyle: {
                  backgroundColor: "#fff",
                  elevation: 0,
                  shadowOpacity: 0,
                },
              }}
            />
            <Stack.Screen
              name="Payment"
              component={PaymentScreen}
              options={{
                headerShown: true,
                headerTitle: "Checkout & Payment",
                headerTintColor: "#333",
                headerStyle: {
                  backgroundColor: "#fff",
                  elevation: 0,
                  shadowOpacity: 0,
                },
              }}
            />
            <Stack.Screen
              name="OrderDetails"
              component={OrderDetailsScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        ) : (
          // Authentication screens
          <>
            <Stack.Screen name="Phone" component={PhoneScreen} />
            <Stack.Screen name="OTP" component={OtpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
