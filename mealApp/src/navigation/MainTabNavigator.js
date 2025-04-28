import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import screens
import MenuScreen from "../screens/MenuScreen";
import CartScreen from "../screens/CartScreen";
import ProfileScreen from "../screens/ProfileScreen";
import OrdersScreen from "../screens/OrdersScreen";

// Import store
import useCartStore from "../store/cartStore";
import { getLatestOrder } from "../api/authApi";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { fetchCart, itemCount } = useCartStore();
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  useEffect(() => {
    // Fetch cart data when tab navigator mounts
    fetchCart();

    // Check for active orders
    checkActiveOrders();

    // Set up interval to check for active orders
    const interval = setInterval(checkActiveOrders, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Function to check for active orders
  // Function to check for active orders
  const checkActiveOrders = async () => {
    try {
      const response = await getLatestOrder();
      if (response.success && response.active) {
        setActiveOrderCount(1);
      } else {
        setActiveOrderCount(0);
      }
    } catch (error) {
      console.error("Error checking active orders:", error);

      setActiveOrderCount(0);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Menu") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "Cart") {
            iconName = focused ? "cart" : "cart-outline";
          } else if (route.name === "Orders") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#ff6b6b",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingVertical: 5,
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarBadge: itemCount > 0 ? itemCount : null,
          tabBarBadgeStyle: {
            backgroundColor: "#ff6b6b",
            fontSize: 12,
          },
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarBadge: activeOrderCount > 0 ? activeOrderCount : null,
          tabBarBadgeStyle: {
            backgroundColor: "#ff6b6b",
            fontSize: 12,
          },
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
