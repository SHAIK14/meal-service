import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import { updateUserAddress } from "../utils/api";

const { width, height } = Dimensions.get("window");

const AddressScreen = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);
  const [selectedSaveAs, setSelectedSaveAs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const navigation = useNavigation(); // Use useNavigation hook

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setIsLoading(false);
        return;
      }

      try {
        let userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const userRegion = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setRegion(userRegion);
        setLocation(userRegion);
        await fetchAddress(
          userLocation.coords.latitude,
          userLocation.coords.longitude
        );
      } catch (error) {
        setErrorMsg("Failed to get current location");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const handleAddressChange = async (newAddress) => {
    setAddress(newAddress);
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          newAddress
        )}&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const newRegion = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    fetchAddress(newRegion.latitude, newRegion.longitude);
  };

  const handleSaveAddress = async () => {
    if (!selectedSaveAs) {
      Alert.alert(
        "Error",
        "Please select a save option (Home, Office, or Other)"
      );
      return;
    }

    try {
      setIsLoading(true);
      const addressData = {
        fullAddress: address,
        saveAs: selectedSaveAs,
        coordinates: {
          type: "Point",
          coordinates: [region.longitude, region.latitude],
        },
      };

      const response = await updateUserAddress(addressData);

      Alert.alert("Success", "Address saved successfully", [
        {
          text: "OK",
          onPress: () => navigation.navigate("UserPlans"),
        },
      ]);
    } catch (error) {
      console.error("Error saving address:", error);
      Alert.alert("Error", "Failed to save address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </SafeAreaView>
    );
  }

  if (!region) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={handleRegionChange}
        >
          <Marker coordinate={region} />
        </MapView>

        <View style={styles.contentContainer}>
          <Text style={styles.heading}>Select Location</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter address"
              value={address}
              onChangeText={handleAddressChange}
            />
            {isLoading && (
              <ActivityIndicator
                style={styles.loader}
                size="small"
                color="#007AFF"
              />
            )}
          </View>

          <Text style={styles.heading}>Save As</Text>
          <View style={styles.saveAsContainer}>
            {[
              { name: "Home", icon: "home" },
              { name: "Office", icon: "business" },
              { name: "Other", icon: "location" },
            ].map((option) => (
              <TouchableOpacity
                key={option.name}
                style={[
                  styles.saveAsButton,
                  selectedSaveAs === option.name && styles.selectedSaveAsButton,
                ]}
                onPress={() => setSelectedSaveAs(option.name)}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={selectedSaveAs === option.name ? "#ffffff" : "#000000"}
                />
                <Text
                  style={[
                    styles.saveAsButtonText,
                    selectedSaveAs === option.name &&
                      styles.selectedSaveAsButtonText,
                  ]}
                >
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveAddress}
          >
            <Text style={styles.saveButtonText}>Save Address</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  map: {
    width: "100%",
    height: "50%",
  },
  contentContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: "#007AFF",
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  loader: {
    position: "absolute",
    right: 10,
  },
  saveAsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  saveAsButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#000000",
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
    fontWeight: "bold",
  },
  selectedSaveAsButtonText: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
export default AddressScreen;
