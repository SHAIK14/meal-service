import React, { useState } from "react";
import { AppRegistry } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/screens/LoginScreen";
import OtpScreen from "./src/screens/OtpScreen";
import InformationScreen from "./src/screens/InformationScreen";
import AddressScreen from "./src/screens/AddressScreen";
import UserPlanDuration from "./src/screens/UserPlanDuration";
import AddPartner from "./src/screens/AddPartner";
import Payment from "./src/screens/Payment";
import OrderPlacedSplash from "./src/screens/OrderPlacedSplash";
import PartnerAddress from "./src/screens/PartnerAddress";
import PartnerPlan from "./src/screens/PartnerPlan";
import PartnerPayment from "./src/screens/PartnerPayment";
import Profile from "./src/screens/Profile/Profile";
import PrivacyPolicy from "./src/screens/Profile/PrivacyPolicy";
import Subscription from "./src/screens/Profile/Subscription";
import ContactSupport from "./src/screens/Profile/ContactSupport";
import EditProfile from "./src/screens/Profile/EditProfile";
import ItemDetails from "./src/screens/ItemDetails";
import SubscriptionDays from "./src/screens/SubscriptionDays";
import MyTabs from "./src/screens/components/BottomTabNavigator"; // BottomTabNavigator
import HistoryScreen from "./src/screens/Profile/History"; // BottomTabNavigator

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "Tabs" : "Login"}>
        {/* Add the login and OTP screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OtpScreen"
          component={OtpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Information"
          component={InformationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Address"
          component={AddressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="UserPlanDuration"
          component={UserPlanDuration}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="AddPartner"
          component={AddPartner}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Payment"
          component={Payment}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="OrderPlacedSplash"
          component={OrderPlacedSplash}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="PartnerAddress"
          component={PartnerAddress}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="PartnerPlan"
          component={PartnerPlan}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="PartnerPayment"
          component={PartnerPayment}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="PrivacyPolicy"
          component={PrivacyPolicy}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="ContactSupport"
          component={ContactSupport}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="History"
          component={HistoryScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="EditProfile"
          component={EditProfile}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="ItemDetails"
          component={ItemDetails}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Subscription"
          component={Subscription}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="SubscriptionDays"
          component={SubscriptionDays}
        />

        {/* Add Tab Navigation after the login flow */}
        <Stack.Screen
          name="Tabs"
          component={MyTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
