import React from "react";
import { AppRegistry } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import OtpScreen from "./src/screens/OtpScreen";
import InformationScreen from "./src/screens/InformationScreen";
import AddressScreen from "./src/screens/AddressScreen";
import UserPlans from "./src/screens/UserPlans";
import UserPlanDuration from "./src/screens/UserPlanDuration";
import Profile from "./src/screens/Profile";
import AddPartner from "./src/screens/AddPartner";
import Payment from "./src/screens/Payment";
import OrderPlacedSplash from "./src/screens/OrderPlacedSplash";
import PartnerAddress from "./src/screens/PartnerAddress";
import PartnerPlan from "./src/screens/PartnerPlan";
import PartnerPayment from "./src/screens/PartnerPayment";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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
        <Stack.Screen name="UserPlans" component={UserPlans} />
        <Stack.Screen name="UserPlanDuration" component={UserPlanDuration} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="AddPartner" component={AddPartner} />
        <Stack.Screen name="Payment" component={Payment} />
        <Stack.Screen name="OrderPlacedSplash" component={OrderPlacedSplash} />
        <Stack.Screen name="PartnerAddress" component={PartnerAddress} />
        <Stack.Screen name="PartnerPlan" component={PartnerPlan} />
        <Stack.Screen name="PartnerPayment" component={PartnerPayment} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Make sure to check your imports and registrations.
