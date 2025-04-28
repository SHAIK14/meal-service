import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import useAuthStore from "../store/authStore";

const HomeScreen = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Meal Service</Text>

      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>
            Phone: {user.countryCode} {user.phoneNumber}
          </Text>
          {user.name && <Text style={styles.userText}>Name: {user.name}</Text>}
        </View>
      )}

      <Text style={styles.message}>You are successfully logged in!</Text>
      <Text style={styles.subtitle}>
        This is where the menu will be displayed.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#ff6b6b",
  },
  userInfo: {
    marginBottom: 30,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  userText: {
    fontSize: 16,
    marginBottom: 5,
  },
  message: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
