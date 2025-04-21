import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DeliveryTypeSelector = ({ selectedType, onSelectType }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        How would you like to receive your order?
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.option,
            selectedType === "delivery" && styles.selectedOption,
          ]}
          onPress={() => onSelectType("delivery")}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name="bicycle"
              size={24}
              color={selectedType === "delivery" ? "#fff" : "#ff6b6b"}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.optionTitle,
                selectedType === "delivery" && styles.selectedText,
              ]}
            >
              Delivery
            </Text>
            <Text
              style={[
                styles.optionSubtitle,
                selectedType === "delivery" && styles.selectedText,
              ]}
            >
              Delivered to your address
            </Text>
          </View>
          <View style={styles.radioContainer}>
            <View
              style={[
                styles.radioOuter,
                selectedType === "delivery" && styles.selectedRadioOuter,
              ]}
            >
              {selectedType === "delivery" && (
                <View style={styles.radioInner} />
              )}
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            selectedType === "pickup" && styles.selectedOption,
          ]}
          onPress={() => onSelectType("pickup")}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name="bag-handle"
              size={24}
              color={selectedType === "pickup" ? "#fff" : "#ff6b6b"}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.optionTitle,
                selectedType === "pickup" && styles.selectedText,
              ]}
            >
              Pickup
            </Text>
            <Text
              style={[
                styles.optionSubtitle,
                selectedType === "pickup" && styles.selectedText,
              ]}
            >
              Collect from restaurant
            </Text>
          </View>
          <View style={styles.radioContainer}>
            <View
              style={[
                styles.radioOuter,
                selectedType === "pickup" && styles.selectedRadioOuter,
              ]}
            >
              {selectedType === "pickup" && <View style={styles.radioInner} />}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  optionsContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#ff6b6b",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  selectedText: {
    color: "#fff",
  },
  radioContainer: {
    width: 24,
    alignItems: "center",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  selectedRadioOuter: {
    borderColor: "#fff",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});

export default DeliveryTypeSelector;
