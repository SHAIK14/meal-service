import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

const AddressScreen = ({ navigation }) => {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = () => {
    if (!street || !city || !state || !zipCode || !country) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    
    console.log("Address Info:", { street, city, state, zipCode, country });
    Alert.alert("Success", "Address information collected successfully");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Enter Your Address</Text>

        <TextInput
          style={styles.input}
          placeholder="Street"
          value={street}
          onChangeText={setStreet}
        />

        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          onChangeText={setCity}
        />

        <TextInput
          style={styles.input}
          placeholder="State"
          value={state}
          onChangeText={setState}
        />

        <TextInput
          style={styles.input}
          placeholder="Zip Code"
          value={zipCode}
          onChangeText={setZipCode}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Country"
          value={country}
          onChangeText={setCountry}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Save Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "yellow", // Softer background color
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 30, // Increase vertical padding for more spacing
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26, // Slightly larger title
    fontWeight: "700", // Heavier font-weight for a bolder look
    color: "#333", // Darker text color for better readability
    marginBottom: 25, // Increased spacing below title
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fafafa", // Lighter background for input
    borderWidth: 1,
    borderColor: "#ccc", // Softer border color
    borderRadius: 8, // More rounded corners
    padding: 12, // Slightly more padding for a comfortable input size
    marginBottom: 20, // Increased margin for better separation
    fontSize: 16,
    shadowColor: "#000", // Subtle shadow effect
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Elevation for shadow effect in Android
  },
  button: {
    backgroundColor: "#28a745", // Changed to a green color for a fresher look
    paddingVertical: 15,
    paddingHorizontal: 25, // Added horizontal padding for a bigger button
    borderRadius: 8, // More rounded button corners
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // Elevation for shadow in Android
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600", // Slightly lighter font-weight
    textTransform: "uppercase", // Capitalize text for emphasis
    letterSpacing: 1, // Spacing between letters for a sleek look
  },
});

export default AddressScreen;
