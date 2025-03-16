import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const OrderCard = ({ order, onPress }) => {
  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#F59E0B"; // Amber
      case "accepted":
      case "preparing":
        return "#3B82F6"; // Blue
      case "ready":
        return "#10B981"; // Green
      case "out_for_delivery":
        return "#8B5CF6"; // Purple
      case "completed":
      case "delivered":
        return "#10B981"; // Green
      case "cancelled":
        return "#EF4444"; // Red
      default:
        return "#6B7280"; // Gray
    }
  };

  // Function to get status text
  const getStatusText = (status, deliveryType) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "preparing":
        return "Preparing";
      case "ready":
        return deliveryType === "pickup"
          ? "Ready for Pickup"
          : "Ready for Delivery";
      case "out_for_delivery":
        return "Out for Delivery";
      case "completed":
        return "Completed";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  // Calculate total items
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.orderNumberContainer}>
          <Text style={styles.orderNumberLabel}>Order #</Text>
          <Text style={styles.orderNumber}>
            {order._id.substring(order._id.length - 8)}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusText(order.status, order.deliveryType)}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons
            name={
              order.deliveryType === "pickup"
                ? "bag-handle-outline"
                : "bicycle-outline"
            }
            size={16}
            color="#666"
          />
          <Text style={styles.infoText}>
            {order.deliveryType === "pickup" ? "Pickup" : "Delivery"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{formatDate(order.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.itemCount}>
          {totalItems} item{totalItems !== 1 ? "s" : ""}
        </Text>
        <Text style={styles.totalAmount}>
          SAR {order.finalAmount?.toFixed(2) || order.totalAmount?.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderNumberLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 4,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
  },
});

export default OrderCard;
