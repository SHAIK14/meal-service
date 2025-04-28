import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { format, addDays } from "date-fns";
import { getConfig } from "../utils/api";

const UserPlanDuration = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planDurations, setPlanDurations] = useState([]);

  // Debug received data
  useEffect(() => {
    console.log("Received Plan Data:", {
      id: plan.id,
      name: plan.name,
      selectedPackages: plan.selectedPackages,
      pricing: plan.packagePricing,
    });
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await getConfig();
      console.log("Config Loaded:", response.data.planDurations);

      const availableDurations = response.data.planDurations
        .filter((duration) => duration.isActive)
        .sort((a, b) => a.minDays - b.minDays);

      setPlanDurations(availableDurations);
      setLoading(false);
    } catch (err) {
      console.error("Config Load Error:", err);
      setError("Failed to load durations");
      setLoading(false);
    }
  };

  const calculateTotalPrice = (minDays) => {
    console.log("Calculating price with:", {
      packages: plan.selectedPackages,
      pricing: plan.packagePricing,
      days: minDays,
    });

    const dailyTotal = plan.selectedPackages.reduce((total, pkg) => {
      const price = Number(plan.packagePricing[pkg] || 0);
      console.log(`Price for ${pkg}:`, price);
      return total + price;
    }, 0);

    const totalPrice = dailyTotal * minDays;
    console.log("Calculated:", {
      dailyTotal,
      days: minDays,
      total: totalPrice,
    });

    return totalPrice;
  };
  const handleDurationSelect = (duration) => {
    const totalPrice = calculateTotalPrice(duration.minDays);

    navigation.navigate("SubscriptionDays", {
      plan: {
        ...plan,
        durationType: duration.durationType,
        minDays: duration.minDays,
        totalPrice,
      },
      durationData: duration, // Add duration data separately
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A85F" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            loadConfig();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Duration</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.selectedPackages}>
          Selected: {plan.selectedPackages.join(", ")}
        </Text>

        {planDurations.map((duration) => {
          const totalPrice = calculateTotalPrice(duration.minDays);
          return (
            <TouchableOpacity
              key={duration.durationType}
              style={styles.durationCard}
              onPress={() => handleDurationSelect(duration)}
            >
              <View style={styles.durationInfo}>
                <Text style={styles.durationType}>
                  {duration.durationType.replace(/_/g, " ")}
                </Text>
                <Text style={styles.minDays}>{duration.minDays} days</Text>
                <Text style={styles.perDayPrice}>
                  {(totalPrice / duration.minDays).toFixed(2)} {plan.currency}
                  /day
                </Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  {totalPrice.toFixed(2)} {plan.currency}
                </Text>
                <Text style={styles.priceLabel}>Total Price</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#C5A85F",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  selectedPackages: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  durationCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  durationInfo: {
    flex: 1,
  },
  durationType: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  minDays: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  perDayPrice: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C5A85F",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});

export default UserPlanDuration;
