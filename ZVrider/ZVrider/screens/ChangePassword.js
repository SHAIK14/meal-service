import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { changePassword } from "../utils/api";

const ChangePassword = ({ route, navigation }) => {
  const { isFirstTime, currentPassword } = route.params;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = (password) => {
    // Add your password validation rules here
    return password.length >= 8; // Basic validation
  };

  const handleChangePassword = async () => {
    try {
      // Reset error
      setError("");

      // Validate passwords
      if (!validatePassword(newPassword)) {
        setError("Password must be at least 8 characters long");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (newPassword === currentPassword) {
        setError("New password must be different from current password");
        return;
      }

      setLoading(true);

      // Call API to change password
      await changePassword(currentPassword, newPassword);

      // Show success message
      Alert.alert("Success", "Password changed successfully", [
        {
          text: "OK",
          onPress: () => navigation.replace("Home"),
        },
      ]);
    } catch (error) {
      setError(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isFirstTime
          ? "Welcome! Please set your new password"
          : "Change Password"}
      </Text>

      <Text style={styles.subtitle}>
        Please create a strong password that includes:
      </Text>
      <Text style={styles.requirement}>• At least 8 characters</Text>
      <Text style={styles.requirement}>• Mix of letters and numbers</Text>
      <Text style={styles.requirement}>• Special characters recommended</Text>

      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!loading}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Change Password</Text>
        )}
      </TouchableOpacity>

      {!isFirstTime && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#666",
  },
  requirement: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 5,
    color: "#666",
  },
  input: {
    borderColor: "#e9e3d5",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0a7273",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#0a7273aa",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  cancelButton: {
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
});

export default ChangePassword;
