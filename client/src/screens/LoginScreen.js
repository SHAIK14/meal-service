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
const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

const countryCodes = [
  { code: "+966", country: "Saudi Arabia", maxLength: 9, flag: "🇸🇦" },
  { code: "+971", country: "UAE", maxLength: 10, flag: "🇦🇪" },
  { code: "+973", country: "Bahrain", maxLength: 8, flag: "🇧🇭" },
  { code: "+968", country: "Oman", maxLength: 8, flag: "🇴🇲" },
  { code: "+974", country: "Qatar", maxLength: 8, flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", maxLength: 8, flag: "🇰🇼" },
  { code: "+964", country: "Iraq", maxLength: 10, flag: "🇮🇶" },
  { code: "+962", country: "Jordan", maxLength: 9, flag: "🇯🇴" },
  { code: "+963", country: "Syria", maxLength: 9, flag: "🇸🇾" },
  { code: "+961", country: "Lebanon", maxLength: 8, flag: "🇱🇧" },
  { code: "+91", country: "India", maxLength: 10, flag: "🇮🇳" },
];

const LoginScreen = ({ navigation }) => {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter the countries based on the search query
  const filteredCountries = countryCodes.filter(
    (country) =>
      country.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.includes(searchQuery)
  );

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
            <Text style={styles.title}>Log in to Zafran Valley</Text>
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

      {/* Modal for selecting country */}
      {/* Modal for selecting country */}
      <Modal visible={isDropdownOpen} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* "X" Close Icon */}
            <TouchableOpacity style={styles.closeIcon} onPress={toggleDropdown}>
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Select Country</Text>

            {/* Search bar */}
            <TextInput
              style={styles.searchBar}
              placeholder="Search by country name or code"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <ScrollView style={styles.countryListScroll}>
              {filteredCountries.map((country) => (
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
            </ScrollView>
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
    maxHeight: height * 1,
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
    borderBottomWidth: 1,
    borderBottomColor: "#d1d1d1",
    paddingVertical: 10,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: "#d1d1d1",
    marginRight: 10,
  },

  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
    paddingHorizontal: 5,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  searchBar: {
    borderColor: "#d1d1d1",
    borderBottomWidth: 2,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
    color: "#333",
  },
  modalContent: {
    width: "80%",
    maxHeight: "40%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 32,
    position: "relative",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  countryOption: {
    paddingVertical: 10,
    marginVertical: 6,
    padding: 10,
    borderRadius: 5,
  },
  countryOptionText: {
    fontSize: 16,
    color: "#333",
  },
  closeIcon: {
    position: "absolute",
    top: 15,
    right: 20,
  },
  closeIconText: {
    fontSize: 20,
    color: "#333",
  },
});

export default LoginScreen;
