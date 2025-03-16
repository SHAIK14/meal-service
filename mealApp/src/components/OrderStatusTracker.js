import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const OrderStatusTracker = ({ status, deliveryType }) => {
  // Define the steps based on delivery type
  const pickupSteps = [
    { key: "pending", label: "Order Placed", icon: "receipt-outline" },
    { key: "accepted", label: "Accepted", icon: "checkmark-circle-outline" },
    { key: "preparing", label: "Preparing", icon: "restaurant-outline" },
    { key: "ready", label: "Ready for Pickup", icon: "bag-check-outline" },
    { key: "completed", label: "Completed", icon: "flag-outline" },
  ];

  const deliverySteps = [
    { key: "pending", label: "Order Placed", icon: "receipt-outline" },
    { key: "accepted", label: "Accepted", icon: "checkmark-circle-outline" },
    { key: "preparing", label: "Preparing", icon: "restaurant-outline" },
    { key: "ready", label: "Ready", icon: "bag-check-outline" },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      icon: "bicycle-outline",
    },
    { key: "delivered", label: "Delivered", icon: "flag-outline" },
  ];

  // Select the appropriate steps based on delivery type
  const steps = deliveryType === "pickup" ? pickupSteps : deliverySteps;

  // Find the current step index
  const currentStepIndex = steps.findIndex((step) => step.key === status);

  // Special handling for cancelled orders
  if (status === "cancelled") {
    return (
      <View style={styles.cancelledContainer}>
        <View style={styles.cancelledIconContainer}>
          <Ionicons name="close-circle" size={48} color="#EF4444" />
        </View>
        <Text style={styles.cancelledText}>Order Cancelled</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        // Determine step status (completed, current, or upcoming)
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <View key={step.key} style={styles.stepContainer}>
            {/* Line before first step shouldn't be shown */}
            {index > 0 && (
              <View
                style={[
                  styles.line,
                  isCompleted ? styles.completedLine : styles.upcomingLine,
                ]}
              />
            )}

            {/* Step circle */}
            <View
              style={[
                styles.circle,
                isCompleted ? styles.completedCircle : styles.upcomingCircle,
                isCurrent && styles.currentCircle,
              ]}
            >
              <Ionicons
                name={step.icon}
                size={16}
                color={isCompleted ? "#FFF" : "#CCC"}
              />
            </View>

            {/* Line after last step shouldn't be shown */}
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.line,
                  index < currentStepIndex
                    ? styles.completedLine
                    : styles.upcomingLine,
                ]}
              />
            )}

            {/* Step label */}
            <Text
              style={[
                styles.stepLabel,
                isCompleted
                  ? styles.completedStepLabel
                  : styles.upcomingStepLabel,
                isCurrent && styles.currentStepLabel,
              ]}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  stepContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
  },
  line: {
    position: "absolute",
    height: 3,
    width: "100%",
    top: 12,
  },
  completedLine: {
    backgroundColor: "#FF6B6B",
  },
  upcomingLine: {
    backgroundColor: "#EEEEEE",
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "#FFF",
    borderWidth: 2,
  },
  completedCircle: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  currentCircle: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FF6B6B",
    transform: [{ scale: 1.1 }],
  },
  upcomingCircle: {
    borderColor: "#CCC",
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 6,
    textAlign: "center",
  },
  completedStepLabel: {
    color: "#333",
    fontWeight: "500",
  },
  currentStepLabel: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  upcomingStepLabel: {
    color: "#999",
  },
  cancelledContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  cancelledIconContainer: {
    marginBottom: 10,
  },
  cancelledText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "600",
  },
});

export default OrderStatusTracker;
