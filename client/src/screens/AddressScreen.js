import React, { useEffect, useState, useRef, useCallback } from "react";
import { debounce } from "lodash";
import {
  StyleSheet,
  View,
  TextInput,
  Text,
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
import { useNavigation } from "@react-navigation/native";
import { MAP_CONFIG } from "../config/MapConfig";
import { calculateDistance } from "../utils/locationUtils";
import { updateUserAddress, getBranchServiceInfo } from "../utils/api";

const { width } = Dimensions.get("window");
const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = 0.005;
const INITIAL_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const AddressScreen = () => {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(INITIAL_REGION);
  const [selectedSaveAs, setSelectedSaveAs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [markerPosition, setMarkerPosition] = useState(INITIAL_REGION);
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [addressDetails, setAddressDetails] = useState({
    formattedAddress: "",
    flatNumber: "",
    landmark: "",
  });
  // New state variables to add
  const [branchServiceInfo, setBranchServiceInfo] = useState(null);
  const [userCountry, setUserCountry] = useState(null);
  const [isLocationServiceable, setIsLocationServiceable] = useState(true);
  const [serviceMessage, setServiceMessage] = useState("");
  const [nearestBranch, setNearestBranch] = useState(null);

  const mapRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      try {
        const branchInfo = await getBranchServiceInfo();
        if (mounted) {
          setBranchServiceInfo(branchInfo);
          await requestLocationPermission();
        }
      } catch (error) {
        console.error("Setup error:", error);
        if (mounted) {
          Alert.alert("Error", "Unable to initialize map");
        }
      }
    };

    setup();

    return () => {
      mounted = false;
    };
  }, []);
  const handleRegionChangeComplete = useCallback(
    debounce(async (newRegion) => {
      setRegion(newRegion);
      setMarkerPosition({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });

      await fetchAddressFromCoordinates(
        newRegion.latitude,
        newRegion.longitude
      );
      const serviceCheck = checkBranchServiceability(
        newRegion.latitude,
        newRegion.longitude
      );

      setIsLocationServiceable(serviceCheck.isServiceable);
      setServiceMessage(serviceCheck.message || "");
      setNearestBranch(serviceCheck.branch || null);
    }, 300),
    [branchServiceInfo]
  );
  const requestLocationPermission = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "We need your location to provide better service. Please enable location services.",
          [{ text: "OK" }]
        );
        setIsLoading(false);
        return;
      }

      // For Android, get accurate location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000,
      });

      if (location) {
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };

        setRegion(newRegion);
        setMarkerPosition(newRegion);
        setLocation(location);

        if (mapRef.current) {
          setTimeout(() => {
            mapRef.current.animateToRegion(newRegion, 1000);
          }, 100);
        }

        await fetchAddressFromCoordinates(
          location.coords.latitude,
          location.coords.longitude
        );
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      Alert.alert(
        "Error",
        "Unable to get your location. Please check your location settings."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      setRegion(newRegion);
      setMarkerPosition(newRegion);
      setLocation(location);

      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.animateToRegion(newRegion, 1000);
        }, 100);
      }

      await fetchAddressFromCoordinates(
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your location");
    }
  };
  const fetchAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAP_CONFIG.GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const countryComponent = data.results[0].address_components.find(
          (component) => component.types.includes("country")
        );
        const country = countryComponent?.long_name;
        // console.log("Detected country:", country); // Log 4
        // console.log(
        //   "Available countries:",
        //   branchServiceInfo?.availableCountries
        // ); // Log 5

        // Convert to lowercase for comparison
        const countryLower = country?.toLowerCase();
        setUserCountry(countryLower);

        // Check if country is serviceable (case insensitive)
        if (branchServiceInfo?.availableCountries.includes(countryLower)) {
          // console.log("Country is serviceable"); // Log 6
          setIsLocationServiceable(true);
          setServiceMessage("");
        } else {
          // console.log("Country not serviceable"); // Log 7
          setIsLocationServiceable(false);
          setServiceMessage(`Sorry, we don't operate in ${country} yet`);
        }

        setAddressDetails((prev) => ({
          ...prev,
          formattedAddress: data.results[0].formatted_address,
        }));
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };
  const checkBranchServiceability = (latitude, longitude, country) => {
    // console.log("Checking serviceability for:", {
    //   latitude,
    //   longitude,
    //   country,
    // });
    // console.log("Branch info:", branchServiceInfo);

    // Get all branches from all countries
    const allBranches = [];
    Object.values(branchServiceInfo?.branchesbyCountry || {}).forEach(
      (branches) => {
        allBranches.push(...branches);
      }
    );

    // Filter valid branches
    const validBranches = allBranches.filter(
      (branch) =>
        branch.coordinates &&
        typeof branch.coordinates.latitude === "number" &&
        typeof branch.coordinates.longitude === "number"
    );

    // console.log("Valid branches:", validBranches);

    let closestBranch = null;
    let shortestDistance = Infinity;

    validBranches.forEach((branch) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        branch.coordinates.latitude,
        branch.coordinates.longitude
      );
      // console.log(`Distance to ${branch.name}:`, distance);

      if (distance <= branch.serviceRadius && distance < shortestDistance) {
        closestBranch = branch;
        shortestDistance = distance;
      }
    });

    // console.log("Closest branch:", closestBranch);

    if (!closestBranch) {
      return {
        isServiceable: false,
        message: "Your location is outside our service area",
      };
    }

    return {
      isServiceable: true,
      branch: closestBranch,
      distance: shortestDistance,
    };
  };
  const searchPlaces = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          query
        )}&key=${MAP_CONFIG.GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error("Error searching places:", error);
      Alert.alert("Error", "Failed to search places. Please try again.");
    }
  };

  const handlePlaceSelect = async (place) => {
    try {
      let newRegion;
      if (place.geometry?.location) {
        newRegion = {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
      } else {
        newRegion = {
          latitude: place.lat,
          longitude: place.lng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
      }

      setRegion(newRegion);
      setMarkerPosition(newRegion);

      // This will trigger country and branch validation
      await handleRegionChangeComplete(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
      setSearchModalVisible(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Error selecting place:", error);
      Alert.alert("Error", "Failed to select location. Please try again.");
    }
  };
  const handleSaveAddress = async () => {
    if (!isLocationServiceable) {
      Alert.alert("Error", serviceMessage);
      return;
    }

    if (!selectedSaveAs) {
      Alert.alert(
        "Error",
        "Please select a save option (Home, Office, or Other)"
      );
      return;
    }

    if (!addressDetails.flatNumber) {
      Alert.alert("Error", "Please enter flat/house number");
      return;
    }

    try {
      setIsLoading(true);
      const addressData = {
        fullAddress: addressDetails.formattedAddress,
        flatNumber: addressDetails.flatNumber,
        landmark: addressDetails.landmark,
        saveAs: selectedSaveAs,
        coordinates: {
          type: "Point",
          coordinates: [region.longitude, region.latitude],
        },
        country: userCountry, // Add country for backend validation
      };

      await updateUserAddress(addressData);
      Alert.alert("Success", "Address saved successfully", [
        { text: "OK", onPress: () => navigation.navigate("UserPlans") },
      ]);
    } catch (error) {
      console.error("Error saving address:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to save address. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              placeholder="Search for address"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.length > 2) {
                  searchPlaces(text);
                }
              }}
              autoFocus
            />
          </View>
        </View>

        <FlatList
          data={searchQuery ? searchResults : recentAddresses}
          keyExtractor={(item) => (item.place_id || item.id).toString()}
          ListHeaderComponent={() => (
            <Text style={styles.sectionTitle}>
              {searchQuery ? "Search Results" : "Recent Addresses"}
            </Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchResultItem}
              onPress={() => handlePlaceSelect(item)}
            >
              <Ionicons name="location-outline" size={24} color="#666" />
              <Text style={styles.searchResultText}>
                {item.formatted_address || item.address || item.name}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>
              {searchQuery ? "No results found" : "No recent addresses"}
            </Text>
          )}
        />
      </SafeAreaView>
    </Modal>
  );

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <TouchableOpacity
          style={styles.searchBarButton}
          onPress={() => setSearchModalVisible(true)}
        >
          <Ionicons name="search" size={20} color="#666" />
          <Text style={styles.searchBarButtonText}>Search for address</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView} bounces={false}>
          <View style={styles.mapContainer}>
            <MapView
              {...(Platform.OS === "android"
                ? { provider: PROVIDER_GOOGLE }
                : {})}
              ref={mapRef}
              style={styles.map}
              initialRegion={INITIAL_REGION}
              region={region}
              onRegionChangeComplete={handleRegionChangeComplete}
              loadingEnabled
              showsUserLocation
            >
              {markerPosition && (
                <Marker
                  key="userMarker"
                  coordinate={markerPosition}
                  pinColor="red"
                />
              )}
            </MapView>

            {/* Removed the blue fixed marker (View with Ionicons) */}
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
            >
              <Ionicons name="locate" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {serviceMessage && (
            <View style={styles.serviceMessageContainer}>
              <Text
                style={[
                  styles.serviceMessageText,
                  !isLocationServiceable && styles.serviceMessageError,
                ]}
              >
                {serviceMessage}
              </Text>
              {isLocationServiceable && nearestBranch && (
                <Text style={styles.distanceText}>
                  Distance to nearest branch:{" "}
                  {Math.round(nearestBranch.distance)} km
                </Text>
              )}
            </View>
          )}
          <View style={styles.formContainer}>
            <View style={styles.addressContainer}>
              <Text style={styles.label}>Selected Location</Text>
              <Text style={styles.addressText}>
                {addressDetails.formattedAddress}
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Flat / House No / Floor / Building *
                </Text>
                <TextInput
                  style={styles.input}
                  value={addressDetails.flatNumber}
                  onChangeText={(text) =>
                    setAddressDetails((prev) => ({ ...prev, flatNumber: text }))
                  }
                  placeholder="E.g., Flat 123, Floor 4, Building Name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Landmark (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={addressDetails.landmark}
                  onChangeText={(text) =>
                    setAddressDetails((prev) => ({ ...prev, landmark: text }))
                  }
                  placeholder="E.g., Near Park, Next to Mall"
                />
              </View>
            </View>

            <View style={styles.saveAsSection}>
              <Text style={styles.label}>Save As</Text>
              <View style={styles.saveAsContainer}>
                {["Home", "Office", "Other"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.saveAsButton,
                      selectedSaveAs === option && styles.selectedSaveAsButton,
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
                      color={selectedSaveAs === option ? "#ffffff" : "#000000"}
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

            <TouchableOpacity
              style={[
                styles.saveButton,
                !isLocationServiceable && { opacity: 0.5 },
              ]}
              onPress={handleSaveAddress}
              disabled={isLoading || !isLocationServiceable}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Address</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {renderSearchModal()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    marginTop: Platform.OS === "ios" ? 50 : 25, // Adjust top margin for device header
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: Platform.OS === "android" ? 2 : 0, // Add elevation for Android
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
    overflow: "hidden", // Ensure map doesn't overflow container
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
    backgroundColor: "#dc2626",
    paddingTop: Platform.OS === "android" ? 25 : 0, // Add padding for Android status bar
  },
  modalHeader: {
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 15, // Add extra padding for iOS notch
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

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  searchResultItem: {
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
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: "#666",
    fontSize: 16,
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
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
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

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Add these to your StyleSheet
  serviceMessageContainer: {
    margin: 15,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  serviceMessageText: {
    fontSize: 14,
    color: "#007AFF",
    textAlign: "center",
  },

  serviceMessageError: {
    color: "#FF3B30",
  },

  distanceText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },

  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
});

export default AddressScreen;
