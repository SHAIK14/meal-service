import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PrivacyPolicy = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>This is Privacy & Policy Page</Text>
    </View>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
