import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BranchCard = ({ branch, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={() => onSelect(branch)}
    >
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.branchName, isSelected && styles.selectedText]}>
            {branch.name}
          </Text>

          <View
            style={[
              styles.distanceContainer,
              isSelected && styles.selectedDistanceContainer,
            ]}
          >
            <Ionicons
              name="location"
              size={12}
              color={isSelected ? "#fff" : "#ff6b6b"}
            />
            <Text
              style={[styles.distanceText, isSelected && styles.selectedText]}
            >
              {branch.distance} km away
            </Text>
          </View>
        </View>

        <Text
          style={[styles.addressText, isSelected && styles.selectedText]}
          numberOfLines={2}
        >
          {branch.address.mainAddress}, {branch.address.city},{" "}
          {branch.address.state}
        </Text>
      </View>

      <View style={styles.radioContainer}>
        <View
          style={[styles.radioOuter, isSelected && styles.selectedRadioOuter]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedContainer: {
    backgroundColor: "#ff6b6b",
    borderColor: "#ff6b6b",
    borderWidth: 1,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  branchName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  selectedDistanceContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
  },
  selectedText: {
    color: "#fff",
  },
  radioContainer: {
    width: 24,
    alignItems: "center",
    marginLeft: 8,
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

export default BranchCard;
