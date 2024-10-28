import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const UserPlanDuration = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan } = route.params;

  const durations = [
    { name: "1 Week", multiplier: 1 },
    { name: "2 Weeks", multiplier: 2 },
    { name: "1 Month", multiplier: 4 },
  ];

  const calculatePackagePrices = (packageDetails, multiplier) => {
    return packageDetails.map((pkg) => ({
      ...pkg,
      originalPrice: pkg.originalPrice * multiplier,
      discountedPrice: pkg.discountedPrice * multiplier,
      savings: pkg.savings * multiplier,
    }));
  };

  const calculateTotalPrice = (packagePricing) => {
    return packagePricing.reduce(
      (acc, pkg) => ({
        original: acc.original + pkg.originalPrice,
        final: acc.final + pkg.discountedPrice,
        savings: acc.savings + pkg.savings,
      }),
      { original: 0, final: 0, savings: 0 }
    );
  };

  const handleSelect = (duration) => {
    const finalPackagePricing = calculatePackagePrices(
      plan.packageDetails,
      duration.multiplier
    );
    const finalTotalPricing = calculateTotalPrice(finalPackagePricing);

    navigation.navigate("Payment", {
      plan: {
        ...plan,
        selectedDuration: duration.name,
        pricing: finalTotalPricing,
        packageDetails: finalPackagePricing,
      },
    });
  };

  const renderPriceBreakdown = (pricing) => {
    if (pricing.savings > 0) {
      return (
        <View style={styles.priceContainer}>
          <Text style={styles.originalPrice}>
            {pricing.original.toFixed(2)} SAR
          </Text>
          <Text style={styles.savings}>
            Save {pricing.savings.toFixed(2)} SAR
          </Text>
          <Text style={styles.finalPrice}>{pricing.final.toFixed(2)} SAR</Text>
        </View>
      );
    }
    return <Text style={styles.priceText}>{pricing.final.toFixed(2)} SAR</Text>;
  };

  const renderPackagePrice = (pkg) => {
    if (pkg.hasDiscount) {
      return (
        <View style={styles.discountedPriceContainer}>
          <Text style={styles.originalPackagePrice}>
            {pkg.originalPrice.toFixed(2)} SAR
          </Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{pkg.discountPercent}% OFF</Text>
          </View>
          <Text style={styles.finalPackagePrice}>
            {pkg.discountedPrice.toFixed(2)} SAR
          </Text>
        </View>
      );
    }
    return (
      <Text style={styles.regularPrice}>
        {pkg.originalPrice.toFixed(2)} SAR
      </Text>
    );
  };

  const renderPlanCard = (duration) => {
    const packagePricing = calculatePackagePrices(
      plan.packageDetails,
      duration.multiplier
    );
    const totalPricing = calculateTotalPrice(packagePricing);

    return (
      <View key={duration.name} style={styles.card}>
        <View style={styles.durationHeader}>
          <Text style={styles.cardTitle}>{duration.name}</Text>
          <Text style={styles.durationSubtext}>
            {plan.duration} days per week
          </Text>
        </View>

        <Text style={styles.packageInfo}>{plan.mealPlanType}</Text>

        {renderPriceBreakdown(totalPricing)}

        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Package Breakdown</Text>
          {packagePricing.map((pkg) => (
            <View key={pkg.package} style={styles.packageBreakdown}>
              <View style={styles.packageNameContainer}>
                <Text style={styles.packageName}>
                  {pkg.package.charAt(0).toUpperCase() + pkg.package.slice(1)}
                </Text>
                {pkg.hasDiscount && (
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerText}>Special Offer</Text>
                  </View>
                )}
              </View>
              {renderPackagePrice(pkg)}
            </View>
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
        {durations.map(renderPlanCard)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333333",
  },
  card: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  durationHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  durationSubtext: {
    fontSize: 14,
    color: "#666666",
  },
  packageInfo: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 12,
  },
  priceContainer: {
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: "#999999",
    textDecorationLine: "line-through",
  },
  savings: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginVertical: 4,
  },
  finalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  priceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 16,
  },
  breakdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  packageBreakdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  packageNameContainer: {
    flex: 1,
  },
  packageName: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  offerBadge: {
    backgroundColor: "#FFE0E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  offerText: {
    fontSize: 10,
    color: "#E53935",
    fontWeight: "600",
  },
  discountedPriceContainer: {
    alignItems: "flex-end",
  },
  originalPackagePrice: {
    fontSize: 12,
    color: "#999999",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginVertical: 2,
  },
  discountText: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "600",
  },
  finalPackagePrice: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
  },
  regularPrice: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  selectButton: {
    backgroundColor: "#C5A85F",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default UserPlanDuration;
