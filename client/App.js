import React from "react";
import { AppRegistry } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/screens/LoginScreen";
import OtpScreen from "./src/screens/OtpScreen";
import InformationScreen from "./src/screens/InformationScreen";
import AddressScreen from "./src/screens/AddressScreen";
import UserPlans from "./src/screens/UserPlans";
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

const Stack = createStackNavigator();

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
        <Stack.Screen name="AddPartner" component={AddPartner} />
        <Stack.Screen name="Payment" component={Payment} />
        <Stack.Screen name="OrderPlacedSplash" component={OrderPlacedSplash} />
        <Stack.Screen name="PartnerAddress" component={PartnerAddress} />
        <Stack.Screen name="PartnerPlan" component={PartnerPlan} />
        <Stack.Screen name="PartnerPayment" component={PartnerPayment} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="Subscription" component={Subscription} />
        <Stack.Screen name="ContactSupport" component={ContactSupport} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="ItemDetails" component={ItemDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
