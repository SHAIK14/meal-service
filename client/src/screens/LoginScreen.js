import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { requestOTP } from "../utils/api";

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Enter Your Phone Number</Text>
      <View style={styles.inputContainer}>
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
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          maxLength={countryCodes.find((c) => c.code === countryCode).maxLength}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
        <Text style={styles.buttonText}>Send OTP</Text>
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
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  picker: {
    width: 100,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
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

export default LoginScreen;
