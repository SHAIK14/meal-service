import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useOrderStore from "../store/orderStore";

const DeliveryInfo = ({ onChangeAddress }) => {
  const { deliveryType, selectedAddress, selectedBranch } = useOrderStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {deliveryType === "pickup"
          ? "Pickup Information"
          : "Delivery Information"}
      </Text>

      <View style={styles.infoContainer}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={
              deliveryType === "pickup"
                ? "bag-handle-outline"
                : "bicycle-outline"
            }
            size={24}
            color="#ff6b6b"
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.typeLabel}>
            {deliveryType === "pickup" ? "Self Pickup" : "Delivery"}
          </Text>

          {deliveryType === "pickup" && selectedBranch ? (
            <>
              <Text style={styles.branchName}>{selectedBranch.name}</Text>
              <Text style={styles.addressText}>
                {selectedBranch.address?.mainAddress},{" "}
                {selectedBranch.address?.city}
              </Text>
              {selectedBranch.distance && (
                <Text style={styles.distanceText}>
                  {selectedBranch.distance} km away
                </Text>
              )}
            </>
          ) : (
            selectedAddress && (
              <>
                <Text style={styles.addressName}>{selectedAddress.name}</Text>
                <Text style={styles.addressText}>
                  {selectedAddress.address}
                </Text>
                {selectedAddress.apartment && (
                  <Text style={styles.addressText}>
                    {selectedAddress.apartment}
                  </Text>
                )}
                <Text style={styles.addressText}>
                  {selectedAddress.city}, {selectedAddress.state}{" "}
                  {selectedAddress.pincode}
                </Text>
              </>
            )
          )}
        </View>
      </View>

      {onChangeAddress && (
        <TouchableOpacity style={styles.changeButton} onPress={onChangeAddress}>
          <Text style={styles.changeButtonText}>Change</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff4f4",
    borderRadius: 20,
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff6b6b",
    marginBottom: 4,
  },
  branchName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  changeButton: {
    alignSelf: "flex-end",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  changeButtonText: {
    fontSize: 14,
    color: "#ff6b6b",
    fontWeight: "500",
  },
});

export default DeliveryInfo;
