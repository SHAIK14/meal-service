import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = ({ userInfo, onEditProfile, navigation }) => {
  userInfo = userInfo || {
    name: "Mirza Ibrahim",
    email: "Ibrahimafroz77@gmail.com",
    phone: "+966 597336794",
  };

  const menuOptions = [
    {
      title: "Subscription",
      icon: "card-outline",
      action: () => navigation.navigate("Subscription"),
    },
    {
      title: "Contact Support",
      icon: "help-circle-outline",
      action: () => navigation.navigate("ContactSupport"),
    },
    {
      title: "Privacy and Policy",
      icon: "document-text-outline",
      action: () => navigation.navigate("PrivacyPolicy"),
    },
    {
      title: "History",
      icon: "time-outline",
      action: () => navigation.navigate("History"),
    },
    {
      title: "Logout",
      icon: "exit-outline",
      action: () => console.log("Logging out..."),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top User Information */}
      <View style={styles.userInfoContainer}>
        <View style={styles.userInfo}>
          <Image
            source={require("../../../assets/profile-user.png")}
            style={styles.userImage}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userInfo.name}</Text>
            <Text style={styles.userEmail}>{userInfo.email}</Text>
            <Text style={styles.userPhone}>{userInfo.phone}</Text>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Options */}
      <FlatList
        data={menuOptions}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.menuItem} onPress={item.action}>
            <Ionicons
              name={item.icon}
              size={24}
              color="#444"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.menuContainer}
      />

      {/* Bottom Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/logoVertical.png")}
          style={styles.logo}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    justifyContent: "space-between",
  },

  userInfoContainer: {
    padding: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  userImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
    padding: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    marginBottom: 5,
  },

  userEmail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },

  userPhone: {
    fontSize: 14,
    color: "#555",
  },

  editProfileButton: {
    width: "100%",
    backgroundColor: "#dc2626",
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
    alignItems: "center",
  },

  editProfileText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },

  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
    borderRadius: 30,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  logoContainer: {
    alignItems: "center",
    width: "100%",
    backgroundColor: "black",
    padding: 20,
    justifyContent: "center",
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  logo: {
    width: "100%",
    height: 80,
    resizeMode: "contain",
  },
});

export default ProfileScreen;
