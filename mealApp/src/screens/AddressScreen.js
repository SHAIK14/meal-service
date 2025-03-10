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
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
} from "react-native";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  geocodeAddress,
} from "../api/authApi";

const AddressScreen = ({ navigation, route }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formMode, setFormMode] = useState("add"); // 'add' or 'edit'
  const [currentAddress, setCurrentAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    coordinates: { latitude: 0, longitude: 0 },
    isDefault: false,
  });

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

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const openAddressForm = (mode, address = null) => {
    if (mode === "edit" && address) {
      setFormData({
        name: address.name || "",
        address: address.address || "",
        apartment: address.apartment || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        coordinates: address.coordinates || { latitude: 0, longitude: 0 },
        isDefault: address.isDefault || false,
      });
      setCurrentAddress(address);
    } else {
      // Default values for new address
      setFormData({
        name: "",
        address: "",
        apartment: "",
        city: "",
        state: "",
        pincode: "",
        coordinates: { latitude: 0, longitude: 0 },
        isDefault: addresses.length === 0, // Make default if it's the first address
      });
      setCurrentAddress(null);
    }

    setFormMode(mode);
    setModalVisible(true);
  };

  const searchLocation = async () => {
    try {
      if (!formData.address) {
        Alert.alert("Error", "Please enter an address to search");
        return;
      }

      setLoading(true);
      const searchQuery = `${formData.address}, ${formData.city || ""} ${
        formData.state || ""
      } ${formData.pincode || ""}`;

      const response = await geocodeAddress(searchQuery);
      const { coordinates, city, state, pincode, formattedAddress } =
        response.data;

      setFormData({
        ...formData,
        address: formattedAddress || formData.address,
        city: city || formData.city,
        state: state || formData.state,
        pincode: pincode || formData.pincode,
        coordinates,
      });

      setLoading(false);
    } catch (error) {
      console.error("Geocode error:", error);
      Alert.alert(
        "Error",
        "Failed to find location. Please check the address."
      );
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    try {
      // Validate form
      if (
        !formData.address ||
        !formData.city ||
        !formData.state ||
        !formData.pincode
      ) {
        Alert.alert("Error", "Please fill all required fields");
        return;
      }

      setLoading(true);

      if (formMode === "add") {
        await addAddress(formData);
      } else if (formMode === "edit" && currentAddress) {
        await updateAddress(currentAddress._id, formData);
      }

      // Refresh addresses list
      await loadAddresses();
      setModalVisible(false);
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
      // If coming from checkout, go back with the selected address
      navigation.navigate("Cart", { selectedAddress: address });
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

      {loading && !modalVisible ? (
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

      {/* Address Form Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {formMode === "add" ? "Add New Address" : "Edit Address"}
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Address Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Home, Work, etc."
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
              />

              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Street address"
                value={formData.address}
                onChangeText={(text) => handleInputChange("address", text)}
              />

              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchLocation}
              >
                <Text style={styles.searchButtonText}>Find on Map</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Apartment / Building</Text>
              <TextInput
                style={styles.input}
                placeholder="Apartment, building, floor, etc."
                value={formData.apartment}
                onChangeText={(text) => handleInputChange("apartment", text)}
              />

              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => handleInputChange("city", text)}
              />

              <Text style={styles.inputLabel}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                value={formData.state}
                onChangeText={(text) => handleInputChange("state", text)}
              />

              <Text style={styles.inputLabel}>Pincode</Text>
              <TextInput
                style={styles.input}
                placeholder="Pincode"
                value={formData.pincode}
                onChangeText={(text) => handleInputChange("pincode", text)}
                keyboardType="number-pad"
              />

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    formData.isDefault && styles.checkboxChecked,
                  ]}
                  onPress={() =>
                    handleInputChange("isDefault", !formData.isDefault)
                  }
                >
                  {formData.isDefault && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Set as default address</Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveAddress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Address</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
  },
  formContainer: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  searchButtonText: {
    color: "#ff6b6b",
    fontWeight: "600",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#ff6b6b",
    borderColor: "#ff6b6b",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    margin: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddressScreen;
