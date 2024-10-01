import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import MapView from "react-native-maps";

const AddressScreen = ({ navigation }) => {
  const handleSubmit = () => {
    // This is a placeholder for the submit functionality
    // You can implement the address submission logic here
    console.log("Address submitted");
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} />
      <View style={styles.overlay}>
        <Text style={styles.title}>Select Your Address</Text>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddressScreen;
