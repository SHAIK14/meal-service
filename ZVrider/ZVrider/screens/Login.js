import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import { loginDriver } from "../utils/api";

const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await loginDriver(username, password);

      if (response.requirePasswordChange) {
        // Navigate to force password change screen
        navigation.navigate("ChangePassword", {
          isFirstTime: true,
          currentPassword: password, // Needed for verification
        });
      } else {
        // Navigate to home screen
        navigation.navigate("Home");
      }
    } catch (error) {
      setError(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Zafran Valley</Text>

      <LottieView
        source={require("../assets/Animation - 1732115076936.json")}
        autoPlay
        loop
        style={styles.animation}
      />

      <TextInput
        style={styles.input}
        placeholder="Username (National ID)"
        value={username}
        onChangeText={setUsername}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 45,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000",
    textAlign: "center",
  },
  animation: {
    width: 300,
    height: 300,
    alignSelf: "center",
    marginBottom: 5,
  },
  input: {
    borderColor: "#e9e3d5",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: "#0a7273",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#0a7273aa",
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default Login;
