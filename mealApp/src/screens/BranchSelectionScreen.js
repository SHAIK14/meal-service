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
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BranchCard from "../components/BranchCard";
import useOrderStore from "../store/orderStore";

const BranchSelectionScreen = ({ navigation }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);

  const {
    nearbyBranches,
    loading,
    error,
    setSelectedBranch: storeSetSelectedBranch,
    preparePickupOrder,
  } = useOrderStore();

  const handleSelectBranch = (branch) => {
    console.log("Branch selected:", branch._id);
    setSelectedBranch(branch);
  };

  // Inside handleContinue function
  const handleContinue = async () => {
    console.log("==========================================");
    console.log("handleContinue STARTED in BranchSelectionScreen");
    console.log("Selected branch:", selectedBranch?._id);
    console.log("==========================================");

    if (!selectedBranch) {
      console.log("No branch selected, showing alert");
      Alert.alert("Required", "Please select a branch for pickup");
      return;
    }

    console.log("Setting selected branch in store");
    storeSetSelectedBranch(selectedBranch);

    console.log("Calling preparePickupOrder");
    const success = await preparePickupOrder();
    console.log("preparePickupOrder result:", success);

    if (success) {
      console.log("Order prepared successfully, navigating to Payment screen");
      // Navigate to payment screen
      navigation.navigate("Payment");
    } else {
      console.log("Order preparation failed:", error);
      Alert.alert("Error", error || "Failed to prepare order");
    }
  };

  const renderBranchItem = ({ item }) => (
    <BranchCard
      branch={item}
      isSelected={selectedBranch && selectedBranch._id === item._id}
      onSelect={handleSelectBranch}
    />
  );

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
        <Text style={styles.headerTitle}>Select Pickup Location</Text>
        <View style={styles.placeholderView} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Finding nearby branches...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : nearbyBranches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No branches found near you</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Try Different Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={nearbyBranches}
          renderItem={renderBranchItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <Text style={styles.infoText}>
              Select a branch to pick up your order
            </Text>
          )}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedBranch || loading) && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedBranch || loading}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    fontSize: 16,
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
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    marginHorizontal: 16,
    marginVertical: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
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
export default BranchSelectionScreen;
