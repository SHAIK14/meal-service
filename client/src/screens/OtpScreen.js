import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import { verifyOTP } from "../utils/api";

const OtpScreen = ({ route, navigation }) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    try {
      const otpString = otp.join("");
      if (otpString.length !== 6) {
        throw new Error("OTP must be 6 digits");
      }
      const response = await verifyOTP(phoneNumber, otpString);
      if (response.message === "OTP verified successfully" && response.token) {
        // await AsyncStorage.setItem("userToken", response.token);
        Alert.alert("Success", "OTP verified successfully");
        if (phoneNumber === "+919876543210") {
          navigation.navigate("Information");
        } else {
          if (response.status === "INFO_COMPLETE") {
            navigation.navigate("Address");
          } else {
            navigation.navigate("Information");
          }
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>Sent to {phoneNumber}</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            ref={(input) => (inputRefs.current[index] = input)}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    fontSize: 20,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});

export default OtpScreen;
