import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DeliveryTypeSelector from "../components/DeliveryTypeSelector";
import useOrderStore from "../store/orderStore";

const DeliveryTypeScreen = ({ navigation, route }) => {
  const { selectedAddress } = route.params || {};
  const [deliveryType, setDeliveryType] = useState(null);

  const {
    setSelectedAddress,
    setDeliveryType: storeSetDeliveryType,
    checkDeliveryAvailability,
    fetchNearbyBranches,
    loading,
    error,
    deliveryAvailable,
  } = useOrderStore();

  useEffect(() => {
    // Set the selected address in the store
    if (selectedAddress) {
      setSelectedAddress(selectedAddress);
    } else {
      // If no address is provided, go back
      Alert.alert("Error", "Please select a delivery address first");
      navigation.goBack();
    }
  }, [selectedAddress]);

  const handleSelectDeliveryType = (type) => {
    setDeliveryType(type);
  };

  const handleContinue = async () => {
    if (!deliveryType) {
      Alert.alert("Required", "Please select a delivery type");
      return;
    }

    // Save delivery type to store
    storeSetDeliveryType(deliveryType);

    if (deliveryType === "pickup") {
      // For pickup, fetch nearby branches and navigate to branch selection screen
      const success = await fetchNearbyBranches();

      if (success) {
        navigation.navigate("BranchSelection");
      } else {
        Alert.alert("Error", error || "Failed to fetch nearby branches");
      }
    } else {
      // For delivery, check if delivery is available
      const success = await checkDeliveryAvailability();

      if (success && deliveryAvailable) {
        // Prepare delivery order
        const orderSuccess = await prepareDeliveryOrder();

        if (orderSuccess) {
          // If delivery is available, go to payment screen
          navigation.navigate("Payment");
        } else {
          Alert.alert("Error", error || "Failed to prepare delivery order");
        }
      } else {
        // If delivery is not available, show error and suggest pickup
        Alert.alert(
          "Delivery Unavailable",
          "We cannot deliver to your location. Would you like to pick up your order instead?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Try Pickup",
              onPress: () => {
                setDeliveryType("pickup");
                storeSetDeliveryType("pickup");
                handleContinue();
              },
            },
          ]
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Options</Text>
        <View style={styles.placeholderView} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>Delivery Address</Text>
          <Text style={styles.addressName}>{selectedAddress?.name}</Text>
          <Text style={styles.addressText}>{selectedAddress?.address}</Text>
          {selectedAddress?.apartment && (
            <Text style={styles.addressText}>{selectedAddress.apartment}</Text>
          )}
          <Text style={styles.addressText}>
            {selectedAddress?.city}, {selectedAddress?.state}{" "}
            {selectedAddress?.pincode}
          </Text>

          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>

        <DeliveryTypeSelector
          selectedType={deliveryType}
          onSelectType={handleSelectDeliveryType}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!deliveryType || loading) && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!deliveryType || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholderView: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  addressCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addressLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  changeButton: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  changeButtonText: {
    fontSize: 14,
    color: "#ff6b6b",
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  continueButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DeliveryTypeScreen;
