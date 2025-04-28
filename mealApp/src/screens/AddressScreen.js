import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../api/authApi";
import MapAddressSelector from "../components/MapAddressSelector";

const AddressScreen = ({ navigation, route }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [formMode, setFormMode] = useState("add"); // 'add' or 'edit'

  const fromCheckout = route.params?.fromCheckout || false;

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAddresses();
      setAddresses(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading addresses:", err);
      setError("Failed to load addresses. Please try again.");
      setLoading(false);
    }
  };

  const openAddressForm = (mode, address = null) => {
    setFormMode(mode);
    setCurrentAddress(address);
    setMapVisible(true);
  };

  const handleSaveAddress = async (addressData) => {
    try {
      setLoading(true);

      if (formMode === "add") {
        await addAddress(addressData);
        Alert.alert("Success", "Address added successfully");
      } else if (formMode === "edit" && currentAddress) {
        await updateAddress(currentAddress._id, addressData);
        Alert.alert("Success", "Address updated successfully");
      }

      // Refresh addresses list
      await loadAddresses();
      setLoading(false);
    } catch (error) {
      console.error("Save address error:", error);
      Alert.alert("Error", "Failed to save address");
      setLoading(false);
    }
  };

  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteAddress(addressId);
              await loadAddresses();
              setLoading(false);
            } catch (error) {
              console.error("Delete address error:", error);
              Alert.alert("Error", "Failed to delete address");
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleSetDefault = async (addressId) => {
    try {
      setLoading(true);
      await setDefaultAddress(addressId);
      await loadAddresses();
      setLoading(false);
    } catch (error) {
      console.error("Set default address error:", error);
      Alert.alert("Error", "Failed to set default address");
      setLoading(false);
    }
  };

  const handleSelectAddress = (address) => {
    if (fromCheckout) {
      // If coming from checkout, go to delivery type screen with the selected address
      navigation.navigate("DeliveryType", { selectedAddress: address });
    }
  };

  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.addressCard, item.isDefault && styles.defaultAddressCard]}
      onPress={() => handleSelectAddress(item)}
      activeOpacity={fromCheckout ? 0.7 : 1}
    >
      <View style={styles.addressHeader}>
        <Text style={styles.addressName}>{item.name}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>

      <Text style={styles.addressText}>{item.address}</Text>
      {item.apartment && (
        <Text style={styles.addressText}>{item.apartment}</Text>
      )}
      <Text style={styles.addressText}>
        {item.city}, {item.state} {item.pincode}
      </Text>

      <View style={styles.addressActions}>
        <TouchableOpacity
          style={styles.addressAction}
          onPress={() => openAddressForm("edit", item)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        {!item.isDefault && (
          <TouchableOpacity
            style={styles.addressAction}
            onPress={() => handleSetDefault(item._id)}
          >
            <Text style={styles.actionText}>Set as Default</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.addressAction}
          onPress={() => handleDeleteAddress(item._id)}
        >
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Addresses</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openAddressForm("add")}
        >
          <Text style={styles.addButtonText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {loading && !mapVisible ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAddresses}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            You don't have any saved addresses
          </Text>
          <Text style={styles.emptySubtext}>
            Add an address to proceed with delivery
          </Text>

          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={() => openAddressForm("add")}
          >
            <Text style={styles.addAddressButtonText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.addressList}
        />
      )}

      {/* Map Address Selector Component */}
      <MapAddressSelector
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        onSave={handleSaveAddress}
        initialAddress={currentAddress}
        fromCheckout={fromCheckout}
      />
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  addButtonText: {
    fontSize: 14,
    color: "#ff6b6b",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  addAddressButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  addAddressButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  addressList: {
    padding: 16,
  },
  addressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  defaultAddressCard: {
    borderWidth: 2,
    borderColor: "#ff6b6b",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addressName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  defaultBadge: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  addressText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  addressActions: {
    flexDirection: "row",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  addressAction: {
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    color: "#ff6b6b",
    fontWeight: "600",
  },
  deleteText: {
    color: "#ff4b4b",
  },
});

export default AddressScreen;
