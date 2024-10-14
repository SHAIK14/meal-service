import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { verifyOTP } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import backgroundImage from "../../assets/background.png";

const { width, height } = Dimensions.get("window");

const OtpScreen = ({ route, navigation }) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

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
    setIsLoading(true);
    try {
      const otpString = otp.join("");
      if (otpString.length !== 6) {
        throw new Error("OTP must be 6 digits");
      }
      const response = await verifyOTP(phoneNumber, otpString);
      if (response.message === "OTP verified successfully" && response.token) {
        await AsyncStorage.setItem("userToken", response.token);
        Alert.alert("Success", "OTP verified successfully");
        
          if (response.status === "INFO_COMPLETE") {
            navigation.navigate("Address");
          } else {
            navigation.navigate("Information");
          }
        
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    // Implement OTP resend logic here
    setTimeLeft(30);
    Alert.alert("OTP Resent", "A new OTP has been sent to your phone number.");
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.formContainer}>
            <Ionicons
              name="lock-closed"
              size={64}
              color="#FAF9D9"
              style={styles.icon}
            />
            <Text style={styles.title}>Verification Code</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {phoneNumber}
            </Text>

            <View style={styles.codeContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.codeInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  ref={(input) => (inputRefs.current[index] = input)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, isLoading && styles.disabledButton]}
              onPress={handleVerifyOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>VERIFY</Text>
              )}
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOtp}
              disabled={timeLeft > 0}
            >
              <Text
                style={[styles.resendText, timeLeft > 0 && styles.disabledText]}
              >
                {timeLeft > 0 ? `Resend OTP in ${timeLeft}s` : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: width * 0.06,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    alignItems: "center",
  },
  icon: {
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.01,
    color: "#333",
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "#666",
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: height * 0.03,
    width: "100%",
  },
  codeInput: {
    width: width * 0.12,
    height: width * 0.12,
    borderColor: "#FAF9D9",
    borderWidth: 2,
    borderRadius: 12,
    textAlign: "center",
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: "#333",
    backgroundColor: "#F0F0F0",
  },
  verifyButton: {
    backgroundColor: "#FAF9D9",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    borderRadius: 25,
    alignItems: "center",
    marginTop: height * 0.02,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#333",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  resendButton: {
    marginTop: height * 0.03,
  },
  resendText: {
    color: "#FAF9D9",
    fontSize: width * 0.04,
    fontWeight: "bold",
  },
  disabledText: {
    color: "#999",
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: height * 0.02,
    textAlign: "center",
    fontSize: width * 0.035,
  },
});

export default OtpScreen;
