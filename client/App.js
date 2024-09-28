import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import OtpScreen from "./src/screens/OtpScreen";
import InformationScreen from "./src/screens/InformationScreen";
import AddressScreen from "./src/screens/AddressScreen";

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
