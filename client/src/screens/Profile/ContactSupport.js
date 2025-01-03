import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ContactSupport = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>This is Contact Support Page</Text>
    </View>
  );
};

export default ContactSupport;

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
