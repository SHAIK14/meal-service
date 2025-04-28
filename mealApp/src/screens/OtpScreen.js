import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import useAuthStore from "../store/authStore";

const OtpScreen = ({ route, navigation }) => {
  const { phoneNumber, countryCode, devOtp } = route.params;
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);

  const { verifyOTP, loading, error } = useAuthStore();

  // We're removing the auto-fill functionality
  // If you want to see the OTP for development, you can log it
  useEffect(() => {
    if (__DEV__ && devOtp) {
      console.log("Development OTP:", devOtp);
    }
  }, [devOtp]);

  useEffect(() => {
    // Countdown timer for resending OTP
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    try {
      await verifyOTP(phoneNumber, countryCode, otp);
      // Navigation will happen automatically via AppNavigator when auth state changes
    } catch (err) {
      console.error("Error verifying OTP:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Invalid verification code"
      );
    }
  };

  const handleResendOTP = () => {
    // Go back to phone screen to resend OTP
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We've sent a 4-digit code to {countryCode} {phoneNumber}
        </Text>

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={setOtp}
          placeholder="1234"
          keyboardType="number-pad"
          maxLength={4}
          autoFocus
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Verifying..." : "Verify Code"}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend code in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  backButton: {
    marginTop: 50,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "#ff6b6b",
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  otpInput: {
    fontSize: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
    marginBottom: 40,
    letterSpacing: 2,
  },
  errorText: {
    color: "red",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff6b6b",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  timerText: {
    color: "#666",
  },
  resendText: {
    color: "#ff6b6b",
    fontWeight: "bold",
  },
});

export default OtpScreen;
