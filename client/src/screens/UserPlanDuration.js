import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const UserPlanDuration = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan } = route.params;

  const durations = [
    { name: "1 Week", multiplier: 1 },
    { name: "2 Weeks", multiplier: 2 },
    { name: "1 Month", multiplier: 4 },
  ];

  const calculatePrice = (multiplier) => {
    const basePrice = {
      original: plan.pricing.original * multiplier,
      final: plan.pricing.final * multiplier,
      savings: plan.pricing.savings * multiplier,
    };

    return basePrice;
  };

  const handleSelect = (duration) => {
    const finalPricing = calculatePrice(duration.multiplier);

    navigation.navigate("Payment", {
      plan: {
        ...plan,
        selectedDuration: duration.name,
        pricing: finalPricing,
      },
    });
  };

  const renderPlanCard = (duration) => {
    const pricing = calculatePrice(duration.multiplier);

    return (
      <View key={duration.name} style={styles.card}>
        <Text style={styles.cardTitle}>{duration.name}</Text>
        <Text style={styles.durationText}>{plan.duration} days per week</Text>
        <Text style={styles.packageInfo}>{plan.mealPlanType}</Text>

        {pricing.savings > 0 ? (
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>
              {pricing.original.toFixed(2)} SAR
            </Text>
            <Text style={styles.savings}>
              Save {pricing.savings.toFixed(2)} SAR
            </Text>
            <Text style={styles.finalPrice}>
              {pricing.final.toFixed(2)} SAR
            </Text>
          </View>
        ) : (
          <Text style={styles.priceText}>{pricing.final.toFixed(2)} SAR</Text>
        )}

        <View style={styles.breakdownContainer}>
          {plan.package.map((pkg) => (
            <Text key={pkg} style={styles.breakdownText}>
              {pkg.charAt(0).toUpperCase() + pkg.slice(1)}:
              {(pricing.final / plan.package.length).toFixed(2)} SAR
            </Text>
          ))}
        </View>

        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => handleSelect(duration)}
        >
          <Text style={styles.selectButtonText}>Select</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{plan.name}</Text>
      <View style={styles.durationContainer}>
        {durations.map(renderPlanCard)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  durationContainer: {
    width: "100%",
  },
  card: {
    width: "100%",
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  durationText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#666",
  },
  packageInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  priceContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: "#666",
    textDecorationLine: "line-through",
  },
  savings: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginVertical: 4,
  },
  finalPrice: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  priceText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  breakdownContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  breakdownText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  selectButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  selectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserPlanDuration;
