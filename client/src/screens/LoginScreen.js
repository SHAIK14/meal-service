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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { requestOTP } from "../utils/api";
import backgroundImage from "../../assets/background.png";

const { width, height } = Dimensions.get("window");

const countryCodes = [
  { code: "+966", country: "Saudi Arabia", maxLength: 9 },
  { code: "+91", country: "India", maxLength: 10 },
];

const LoginScreen = ({ navigation }) => {
  const [countryCode, setCountryCode] = useState("+966");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setError("");
    try {
      const selectedCountry = countryCodes.find((c) => c.code === countryCode);
      if (phoneNumber.length !== selectedCountry.maxLength) {
        throw new Error(
          `Phone number must be ${selectedCountry.maxLength} digits for ${selectedCountry.country}`
        );
      }
      await requestOTP(countryCode + phoneNumber);
      navigation.navigate("OtpScreen", {
        phoneNumber: countryCode + phoneNumber,
      });
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
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome to Zafran Valley</Text>
            <View style={styles.phoneContainer}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={countryCode}
                  onValueChange={(itemValue) => setCountryCode(itemValue)}
                  style={styles.picker}
                >
                  {countryCodes.map((country) => (
                    <Picker.Item
                      key={country.code}
                      label={country.code}
                      value={country.code}
                    />
                  ))}
                </Picker>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={
                  countryCodes.find((c) => c.code === countryCode).maxLength
                }
              />
            </View>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleSendOtp}
            >
              <Text style={styles.buttonText}>VERIFY</Text>
            </TouchableOpacity>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  pickerContainer: {
    width: width * 0.25,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    marginRight: width * 0.02,
  },
  picker: {
    height: 40,
  },
  phoneInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  verifyButton: {
    backgroundColor: "#FAF9D9",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    borderRadius: 5,
    alignItems: "center",
    marginTop: height * 0.03,
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
});

export default LoginScreen;
