import React, { useState } from "react";
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
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { requestOTP } from "../utils/api";
import backgroundImage from "../../assets/background.png";

const { width, height } = Dimensions.get("window");

const countryCodes = [
  { code: "+966", country: "Saudi Arabia", maxLength: 9, flag: "🇸🇦" },
  { code: "+91", country: "India", maxLength: 10, flag: "🇮🇳" },
];

const LoginScreen = ({ navigation }) => {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    setError("");
    setIsLoading(true);
    try {
      if (phoneNumber.length !== selectedCountry.maxLength) {
        throw new Error(
          `Phone number must be ${selectedCountry.maxLength} digits for ${selectedCountry.country}`
        );
      }
      const fullPhoneNumber = selectedCountry.code + phoneNumber;
      console.log(`Sending OTP to ${fullPhoneNumber}`);
      const response = await requestOTP(fullPhoneNumber);
      setIsLoading(false);
      console.log("OTP request successful:", response);
      navigation.navigate("OtpScreen", {
        phoneNumber: fullPhoneNumber,
      });
    } catch (err) {
      setIsLoading(false);
      console.error("Error sending OTP:", err);
      setError(err.message || "An error occurred while sending OTP");
      Alert.alert(
        "Error",
        err.message || "An error occurred while sending OTP"
      );
    }
  };
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
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
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome to Zafran Valley</Text>
            <View style={styles.phoneContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={toggleDropdown}
              >
                <Text style={styles.dropdownButtonText}>
                  {selectedCountry.flag} {selectedCountry.code}
                </Text>
                <Ionicons name="chevron-down" size={24} color="black" />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={selectedCountry.maxLength}
              />
            </View>
            <TouchableOpacity
              style={[styles.verifyButton, isLoading && styles.disabledButton]}
              onPress={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text style={styles.buttonText}>VERIFY</Text>
              )}
            </TouchableOpacity>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={isDropdownOpen} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Country</Text>
            {countryCodes.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={styles.countryOption}
                onPress={() => selectCountry(country)}
              >
                <Text style={styles.countryOptionText}>
                  {country.flag} {country.country} ({country.code})
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleDropdown}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    padding: width * 0.05,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    width: "100%",
    maxHeight: height * 0.7,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: width * 0.25,
    height: 50,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: width * 0.02,
  },
  dropdownButtonText: {
    fontSize: width * 0.04,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: width * 0.04,
  },
  verifyButton: {
    backgroundColor: "#FAF9D9",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    borderRadius: 5,
    alignItems: "center",
    marginTop: height * 0.03,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "black",
    fontSize: width * 0.04,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginTop: height * 0.02,
    textAlign: "center",
    fontSize: width * 0.035,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  countryOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  countryOptionText: {
    fontSize: width * 0.04,
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#FAF9D9",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: width * 0.04,
    fontWeight: "bold",
  },
});

export default LoginScreen;
