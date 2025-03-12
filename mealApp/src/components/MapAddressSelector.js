import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { debounce } from "lodash";

const { width } = Dimensions.get("window");
const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = 0.005;

// Development hardcoded values
const DEV_COORDS = {
  latitude: 14.192478601365677,
  longitude: 79.16086103068511,
};

const DEV_ADDRESS = {
  formattedAddress: "6/279x, Baalajinagar, Rajampet, 516116, Andhra Pradesh",
  city: "Rajampet",
  state: "Andhra Pradesh",
  pincode: "516116",
};

// Initial region with hardcoded development coordinates
const INITIAL_REGION = {
  latitude: DEV_COORDS.latitude,
  longitude: DEV_COORDS.longitude,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

// Flag to indicate we're in development mode
const DEV_MODE = true;

const MapAddressSelector = ({
  visible,
  onClose,
  onSave,
  initialAddress = null,
  fromCheckout = false,
}) => {
  // Map and location states
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(INITIAL_REGION);
  const [markerPosition, setMarkerPosition] = useState(INITIAL_REGION);

  // Address and form states
  const [addressDetails, setAddressDetails] = useState({
    formattedAddress: DEV_ADDRESS.formattedAddress,
    name: initialAddress?.name || "",
    address: initialAddress?.address || DEV_ADDRESS.formattedAddress,
    apartment: initialAddress?.apartment || "",
    city: initialAddress?.city || DEV_ADDRESS.city,
    state: initialAddress?.state || DEV_ADDRESS.state,
    pincode: initialAddress?.pincode || DEV_ADDRESS.pincode,
    coordinates: initialAddress?.coordinates || DEV_COORDS,
    isDefault: initialAddress?.isDefault || false,
  });

  // UI states
  const [selectedSaveAs, setSelectedSaveAs] = useState(
    initialAddress?.name ? initialAddress.name : "Home"
  );
  const [isLoading, setIsLoading] = useState(false);

  // Search states - temporarily disabled in development mode
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const mapRef = useRef(null);

  // Initialize the map with developer coordinates or initial address
  useEffect(() => {
    if (visible) {
      if (initialAddress && initialAddress.coordinates) {
        // If editing an existing address, use its coordinates
        const coords = initialAddress.coordinates;
        const initRegion = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        setRegion(initRegion);
        setMarkerPosition(initRegion);
      } else {
        // Otherwise use development coordinates
        setRegion(INITIAL_REGION);
        setMarkerPosition(INITIAL_REGION);

        // Set the hardcoded address
        setAddressDetails((prev) => ({
          ...prev,
          formattedAddress: DEV_ADDRESS.formattedAddress,
          city: DEV_ADDRESS.city,
          state: DEV_ADDRESS.state,
          pincode: DEV_ADDRESS.pincode,
          coordinates: DEV_COORDS,
        }));
      }
    }
  }, [visible, initialAddress]);

  // Simulate location permission request and get current location
  const requestLocationPermission = async () => {
    try {
      setIsLoading(true);

      // In development mode, just use hardcoded values
      if (DEV_MODE) {
        setTimeout(() => {
          setRegion(INITIAL_REGION);
          setMarkerPosition(INITIAL_REGION);

          if (mapRef.current) {
            mapRef.current.animateToRegion(INITIAL_REGION, 1000);
          }

          setIsLoading(false);
        }, 500); // Add slight delay to simulate loading
        return;
      }

      // Real implementation would go here if not in dev mode
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "We need your location to provide better service."
        );
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // ... rest of real implementation
    } catch (error) {
      console.error("Error getting location:", error);
      // Fallback to dev coordinates on error
      setRegion(INITIAL_REGION);
      setMarkerPosition(INITIAL_REGION);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current location button handler (using dev coordinates)
  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);

      // In dev mode, just simulate getting location
      setTimeout(() => {
        setRegion(INITIAL_REGION);
        setMarkerPosition(INITIAL_REGION);

        if (mapRef.current) {
          mapRef.current.animateToRegion(INITIAL_REGION, 1000);
        }

        setIsLoading(false);
      }, 500); // Add slight delay to simulate loading
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Error", "Failed to get your location");
      setIsLoading(false);
    }
  };

  // Handle map region change with debounce
  const handleRegionChangeComplete = useCallback(
    debounce((newRegion) => {
      setRegion(newRegion);
      setMarkerPosition({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });

      // Don't make any API calls in dev mode,
      // just update the coordinates but keep the hardcoded address
      if (DEV_MODE) {
        setAddressDetails((prev) => ({
          ...prev,
          coordinates: {
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
          },
        }));
      }

      // In real mode, we would call fetchAddressFromCoordinates here
    }, 300),
    []
  );

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setAddressDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Save address
  const handleSaveAddress = () => {
    if (!addressDetails.apartment) {
      Alert.alert("Error", "Please enter flat/house number");
      return;
    }

    if (!selectedSaveAs) {
      Alert.alert(
        "Error",
        "Please select where to save this address (Home, Office, or Other)"
      );
      return;
    }

    const newAddress = {
      name: selectedSaveAs,
      address: addressDetails.formattedAddress || addressDetails.address,
      apartment: addressDetails.apartment,
      city: addressDetails.city,
      state: addressDetails.state,
      pincode: addressDetails.pincode,
      coordinates: {
        latitude: markerPosition.latitude,
        longitude: markerPosition.longitude,
      },
      isDefault: addressDetails.isDefault,
    };

    onSave(newAddress);
    onClose();
  };

  // Search modal component (simplified for dev mode)
  const renderSearchModal = () => (
    <Modal
      visible={searchModalVisible}
      animationType="slide"
      onRequestClose={() => {
        setSearchModalVisible(false);
        setSearchQuery("");
      }}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => {
              setSearchModalVisible(false);
              setSearchQuery("");
            }}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.modalSearchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search for address (Dev Mode: Search disabled)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        </View>

        <View style={styles.devModeMessage}>
          <Text style={styles.devModeText}>
            ⚠️ Development Mode: Search is disabled
          </Text>
          <Text style={styles.devModeSubtext}>
            Using hardcoded address for development
          </Text>
        </View>

        <TouchableOpacity
          style={styles.devAddressItem}
          onPress={() => {
            setSearchModalVisible(false);
            // Use hardcoded address
            setRegion(INITIAL_REGION);
            setMarkerPosition(INITIAL_REGION);

            if (mapRef.current) {
              mapRef.current.animateToRegion(INITIAL_REGION, 1000);
            }
          }}
        >
          <Ionicons name="location-outline" size={24} color="#666" />
          <Text style={styles.searchResultText}>
            {DEV_ADDRESS.formattedAddress}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {initialAddress ? "Edit Address" : "Add New Address"}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Dev Mode Banner */}
          <View style={styles.devBanner}>
            <Text style={styles.devBannerText}>
              Development Mode: Using hardcoded address
            </Text>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBarButton}
            onPress={() => setSearchModalVisible(true)}
          >
            <Ionicons name="search" size={20} color="#666" />
            <Text style={styles.searchBarButtonText}>Search for address</Text>
          </TouchableOpacity>

          <ScrollView style={styles.scrollView} bounces={false}>
            {/* Map */}
            <View style={styles.mapContainer}>
              {isLoading ? (
                <View style={[styles.map, styles.loadingContainer]}>
                  <ActivityIndicator size="large" color="#ff6b6b" />
                </View>
              ) : (
                <>
                  <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={region}
                    onRegionChangeComplete={handleRegionChangeComplete}
                    showsUserLocation
                  >
                    <Marker coordinate={markerPosition} pinColor="#ff6b6b" />
                  </MapView>

                  {/* Center PIN indicator */}
                  <View style={styles.centerMarker}>
                    <Ionicons name="location" size={40} color="#ff6b6b" />
                  </View>

                  {/* Current location button */}
                  <TouchableOpacity
                    style={styles.currentLocationButton}
                    onPress={getCurrentLocation}
                  >
                    <Ionicons name="locate" size={24} color="#ff6b6b" />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Address Form */}
            <View style={styles.formContainer}>
              {/* Selected Address Display */}
              <View style={styles.addressContainer}>
                <Text style={styles.label}>Selected Location</Text>
                <Text style={styles.addressText}>
                  {addressDetails.formattedAddress || "No address selected"}
                </Text>
              </View>

              {/* Detail Fields */}
              <View style={styles.detailsContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Flat / House No / Floor / Building{" "}
                    <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={addressDetails.apartment}
                    onChangeText={(text) =>
                      handleInputChange("apartment", text)
                    }
                    placeholder="E.g., Flat 123, Floor 4, Building Name"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Landmark (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={addressDetails.landmark}
                    onChangeText={(text) => handleInputChange("landmark", text)}
                    placeholder="E.g., Near Park, Next to Mall"
                  />
                </View>
              </View>

              {/* Save As Options */}
              <View style={styles.saveAsSection}>
                <Text style={styles.label}>Save As</Text>
                <View style={styles.saveAsContainer}>
                  {["Home", "Office", "Other"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.saveAsButton,
                        selectedSaveAs === option &&
                          styles.selectedSaveAsButton,
                      ]}
                      onPress={() => setSelectedSaveAs(option)}
                    >
                      <Ionicons
                        name={
                          option === "Home"
                            ? "home"
                            : option === "Office"
                            ? "business"
                            : "location"
                        }
                        size={24}
                        color={
                          selectedSaveAs === option ? "#ffffff" : "#000000"
                        }
                      />
                      <Text
                        style={[
                          styles.saveAsButtonText,
                          selectedSaveAs === option &&
                            styles.selectedSaveAsButtonText,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Default Address Option */}
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    addressDetails.isDefault && styles.checkboxChecked,
                  ]}
                  onPress={() =>
                    handleInputChange("isDefault", !addressDetails.isDefault)
                  }
                >
                  {addressDetails.isDefault && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Set as default address</Text>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAddress}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {renderSearchModal()}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
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
    paddingTop: Platform.OS === "android" ? 25 : 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  devBanner: {
    backgroundColor: "#ffeb3b",
    padding: 8,
    alignItems: "center",
  },
  devBannerText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  searchBarButton: {
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: Platform.OS === "android" ? 2 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchBarButtonText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: width * 0.7,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -40, // Adjust for the icon height
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  modalHeader: {
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  closeButton: {
    marginBottom: 10,
  },
  modalSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    height: 40,
  },
  devModeMessage: {
    backgroundColor: "#fff3cd",
    padding: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  devModeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#856404",
  },
  devModeSubtext: {
    fontSize: 14,
    color: "#856404",
    marginTop: 5,
  },
  devAddressItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchResultText: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  formContainer: {
    padding: 15,
  },
  addressContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
    fontWeight: "500",
  },
  required: {
    color: "#ff6b6b",
  },
  addressText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  input: {
    height: 45,
    borderColor: "#ddd",
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  saveAsSection: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  saveAsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveAsButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  selectedSaveAsButton: {
    backgroundColor: "#ff6b6b",
    borderColor: "#ff6b6b",
  },
  saveAsButtonText: {
    textAlign: "center",
    marginTop: 5,
    color: "#000000",
    fontSize: 12,
    fontWeight: "500",
  },
  selectedSaveAsButtonText: {
    color: "#fff",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ddd",
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
    fontSize: 14,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#ff6b6b",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MapAddressSelector;
