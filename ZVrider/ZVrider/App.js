import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./screens/Login";
import Homescreen from "./screens/Homescreen";
import Walletscreen from "./screens/Walletscreen";
import Chatscreen from "./screens/Chatscreen";
import Profilescreen from "./screens/Profilescreen";
import Orderdetails from "./screens/Orderdetails";
import Mapscreen from "./screens/Mapscreen";
import Accountsettings from "./screens/Accountsettings";
import ChangePassword from "./screens/ChangePassword";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="Home" component={Homescreen} />
        <Stack.Screen name="Wallet" component={Walletscreen} />
        <Stack.Screen name="Chat" component={Chatscreen} />
        <Stack.Screen name="Profile" component={Profilescreen} />
        <Stack.Screen name="AccountSettings" component={Accountsettings} />
        <Stack.Screen name="Orderdetails" component={Orderdetails} />
        <Stack.Screen name="Mapscreen" component={Mapscreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
