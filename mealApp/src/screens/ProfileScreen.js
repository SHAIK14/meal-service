import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import useAuthStore from "../store/authStore";

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : user?.phoneNumber.charAt(0)}
              </Text>
            </View>
          </View>

          <Text style={styles.name}>{user?.name || "Guest User"}</Text>

          <Text style={styles.phone}>
            {user?.countryCode} {user?.phoneNumber}
          </Text>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsCard}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Edit Profile</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Orders</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Help & Support</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: "#666",
  },
  optionsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#444",
  },
  optionArrow: {
    fontSize: 20,
    color: "#aaa",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ff6b6b",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff6b6b",
  },
  versionText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
  },
});
export default ProfileScreen;
