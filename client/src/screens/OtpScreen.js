import React, { useState, useRef } from "react";
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
} from "react-native";
import { verifyOTP } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import backgroundImage from "../../assets/background.png";

const { height } = Dimensions.get("window");

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
        await AsyncStorage.setItem("userToken", response.token);
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
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formContainer}
      >
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          Enter verification code sent to {phoneNumber}
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

        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOtp}>
          <Text style={styles.buttonText}>SUBMIT</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.resendText}>
          Didn't Get the Code? <Text style={styles.boldText}>Resend</Text>
        </Text>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 40,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: height * 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#858585",
    textAlign: "center",
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  codeInput: {
    width: 40,
    height: 40,
    borderColor: "#858585",
    borderWidth: 1,
    borderRadius: 5,
    textAlign: "center",
    fontSize: 18,
    marginHorizontal: 5,
  },
  verifyButton: {
    backgroundColor: "#FAF9D9",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  resendText: {
    textAlign: "center",
    marginTop: 20,
  },
  boldText: {
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});

export default OtpScreen;
