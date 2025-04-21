import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import useAuthStore from "../store/authStore";

const PhoneScreen = ({ navigation }) => {
  // Using separate state for the formatted phone number input
  // and the actual phone number we'll send to the API
  const [formattedValue, setFormattedValue] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const phoneInput = useRef(null);

  const { sendOTP, loading, error } = useAuthStore();

  const handleSendOTP = async () => {
    // Basic validation
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    try {
      // Call the API to send OTP
      console.log("Sending with:", {
        phoneNumber: phoneNumber,
        countryCode: countryCode,
      });

      const response = await sendOTP(phoneNumber, countryCode);
      console.log("OTP sent successfully", response);

      // Navigate to OTP screen with the necessary data
      navigation.navigate("OTP", {
        phoneNumber,
        countryCode,
        // Only for development - remove in production
        devOtp: response.otp,
      });
    } catch (err) {
      console.error("Error sending OTP:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enter Your Phone</Text>
        <Text style={styles.subtitle}>We'll send you a verification code</Text>
      </View>

      <View style={styles.inputContainer}>
        <PhoneInput
          ref={phoneInput}
          defaultValue={phoneNumber}
          defaultCode="IN"
          layout="first"
          onChangeText={(text) => {
            setPhoneNumber(text);
          }}
          onChangeFormattedText={(text) => {
            setFormattedValue(text);

            // Get country code from phone input
            const currentCountryCode = phoneInput.current?.getCallingCode();
            if (currentCountryCode) {
              setCountryCode(`+${currentCountryCode}`);
            }
          }}
          containerStyle={styles.phoneInput}
          textContainerStyle={styles.phoneTextInput}
          textInputStyle={{ height: 50 }}
          textInputProps={{
            placeholderTextColor: "#999",
            selectionColor: "#ff6b6b",
            maxLength: 15,
          }}
          disableArrowIcon={false}
          flagButtonStyle={{ width: 60 }}
          withDarkTheme={false}
          withShadow={false}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSendOTP}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  inputContainer: {
    marginTop: 20,
  },
  phoneInput: {
    width: "100%",
    height: 60,
    marginBottom: 20,
    borderRadius: 8,
  },
  phoneTextInput: {
    height: 60,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#ff6b6b",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    marginBottom: 20,
  },
  footerText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
});

export default PhoneScreen;
