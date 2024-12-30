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
import { SafeAreaView } from "react-native-safe-area-context";

const UserPlanDuration = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planDurations, setPlanDurations] = useState([]);

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
        <ActivityIndicator size="large" color="#DC2626" />
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
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
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

      {/* Plan Details */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.selectedPackages}>
            Selected: {plan.selectedPackages.join(", ")}
          </Text>
        </View>

        {/* Duration Cards */}
        {planDurations.map((duration, index) => {
          const totalPrice = calculateTotalPrice(duration.minDays);

          // Define colors for each card
          const cardColors = ["#599527", "#005081", "#DC2626"]; // Add more colors if needed
          const cardColor = cardColors[index % cardColors.length]; // Cycle through colors
          return (
            <TouchableOpacity
              key={duration.durationType}
              style={[styles.durationCard, { backgroundColor: cardColor }]}
              onPress={() => handleDurationSelect(duration)}
            >
              {/* Price Section */}
              <View style={styles.priceSection}>
                <Text style={styles.bigPrice}>{totalPrice.toFixed(2)}</Text>
                <Text style={styles.smallCurrency}>{plan.currency}</Text>
              </View>

              {/* Bottom Section */}
              <View style={styles.bottomSection}>
                {/* Left: Duration and Per Day Price */}
                <View style={styles.leftBottom}>
                  <Text style={styles.durationType}>
                    {duration.durationType.replace(/_/g, " ")}
                  </Text>
                  <Text style={styles.perDayPrice}>
                    {(totalPrice / duration.minDays).toFixed(2)} {plan.currency}{" "}
                    / Day
                  </Text>
                </View>

                {/* Right: Days */}
                <View style={styles.rightBottom}>
                  <Text style={styles.minDays}>{duration.minDays} Days</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 50,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  titleContainer: {
    paddingHorizontal: 20,
  },
  planName: {
    fontSize: 26,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },

  selectedPackages: {
    fontSize: 14,
    textAlign: "center",
    color: "#777",
    marginBottom: 24,
  },

  scrollContent: {
    flex: 1,
    paddingHorizontal: 30,
    padding: 10,
  },
  durationCard: {
    backgroundColor: "#fff",

    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  priceSection: {
    alignItems: "center",

    marginBottom: 12,
  },
  bigPrice: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
  },
  smallCurrency: {
    fontSize: 16,
    color: "white",
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftBottom: {
    flex: 1,
  },
  durationType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  perDayPrice: {
    fontSize: 14,
    color: "white",
  },
  rightBottom: {
    alignItems: "flex-end",
    backgroundColor: "white",
    padding: 8,
    width: 80,
    display: "flex",
    alignItems: "center",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  minDays: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
  },
});

export default UserPlanDuration;
