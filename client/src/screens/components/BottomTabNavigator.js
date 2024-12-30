import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
} from "react-native";
import UserPlans from "../UserPlans";
import Subscription from "../Profile/Subscription";
import Profile from "../Profile/Profile";

const Tab = createBottomTabNavigator();

function MyTabs({ isModalOpen }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.navContainer}>
          <Tab.Navigator
            screenOptions={{
              tabBarShowLabel: false,
              tabBarStyle: isModalOpen ? { display: "none" } : styles.tabBar,
              headerShown: false,
            }}
          >
            <Tab.Screen
              name="Userplan"
              component={UserPlans}
              options={{
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                  <View style={styles.tabItem}>
                    <Ionicons
                      name="home"
                      size={16}
                      color={focused ? "#DC2626" : "#6C757D"}
                    />
                    <Text
                      style={[
                        styles.label,
                        { color: focused ? "#DC2626" : "#6C757D" },
                      ]}
                    >
                      Home
                    </Text>
                  </View>
                ),
              }}
            />
            <Tab.Screen
              name="Subscriptions"
              component={Subscription}
              options={{
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                  <View style={styles.tabItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={focused ? "#DC2626" : "#6C757D"}
                    />
                    <Text
                      style={[
                        styles.label,
                        { color: focused ? "#DC2626" : "#6C757D" },
                      ]}
                    >
                      Subscriptions
                    </Text>
                  </View>
                ),
              }}
            />
            <Tab.Screen
              name="Profile"
              component={Profile}
              options={{
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                  <View style={styles.tabItem}>
                    <Ionicons
                      name="person"
                      size={16}
                      color={focused ? "#DC2626" : "#6C757D"}
                    />
                    <Text
                      style={[
                        styles.label,
                        { color: focused ? "#DC2626" : "#6C757D" },
                      ]}
                    >
                      Profile
                    </Text>
                  </View>
                ),
              }}
            />
          </Tab.Navigator>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flex: 1,
  },
  tabBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 0,
  },
  tabItem: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: 60,
    height: 60,
  },
  label: {
    fontSize: 8,
    marginTop: 4,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default MyTabs;
