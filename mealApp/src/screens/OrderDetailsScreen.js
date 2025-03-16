import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getOrderDetails,
  getOrderStatus,
  cancelOrder,
  getOrderHistory,
} from "../api/authApi";
import OrderStatusTracker from "../components/OrderStatusTracker";
import OrderItemsList from "../components/OrderItemsList";

const OrderDetailsScreen = ({ navigation, route }) => {
  const { orderId } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [error, setError] = useState(null);

  // Load order details
  // In OrderDetailsScreen.js, modify the loadOrderDetails function:

  // Load order details with support for shortened IDs
  const loadOrderDetails = useCallback(async () => {
    try {
      setError(null);

      // If orderId is already the full MongoDB ObjectId (24 chars), use it directly
      // If it's the shortened version (8 chars), we need to get the full ID first
      let fullOrderId = orderId;

      // If orderId is shorter than 24 characters, it's likely a shortened ID
      if (orderId.length < 24) {
        // First try to get the latest orders to find the matching one
        const historyResponse = await getOrderHistory(1, 20); // Get recent orders

        if (historyResponse.success) {
          // Find the order that has this shortId in its ending
          const matchingOrder = historyResponse.data.orders.find((order) =>
            order._id.endsWith(orderId)
          );

          if (matchingOrder) {
            fullOrderId = matchingOrder._id;
          } else {
            throw new Error("Could not find the complete order ID");
          }
        }
      }

      // Now proceed with the full order ID
      const detailsResponse = await getOrderDetails(fullOrderId);
      if (detailsResponse.success) {
        setOrder(detailsResponse.data);
      }

      const statusResponse = await getOrderStatus(fullOrderId);
      if (statusResponse.success) {
        setOrderStatus(statusResponse.data);
      }
    } catch (err) {
      setError("Failed to load order details. Pull to refresh.");
      console.error("Error loading order details:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  // Initial load
  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadOrderDetails();
  };

  // Handle cancel order
  const handleCancelOrder = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const response = await cancelOrder(orderId);
            if (response.success) {
              Alert.alert("Success", "Order cancelled successfully");
              loadOrderDetails();
            }
          } catch (err) {
            Alert.alert("Error", "Failed to cancel order. Please try again.");
            console.error("Error cancelling order:", err);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // Format date
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

  // Format time from now
  const formatTimeFromNow = (timeString) => {
    if (!timeString) return "";

    const estimatedTime = new Date(timeString);
    const now = new Date();
    const diffMs = estimatedTime - now;

    if (diffMs <= 0) return "Any moment now";

    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours > 0) {
      return `${hours} hr ${mins} min`;
    } else {
      return `${mins} min`;
    }
  };

  if (loading && !order) {
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
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholderView} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
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
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholderView} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>
          Order #{orderId.substring(orderId.length - 8)}
        </Text>
        <View style={styles.placeholderView} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#FF6B6B"]}
            tintColor="#FF6B6B"
          />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Order Status</Text>
            {orderStatus &&
              orderStatus.estimatedTime &&
              order.status !== "completed" &&
              order.status !== "delivered" &&
              order.status !== "cancelled" && (
                <View style={styles.estimatedTimeContainer}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.estimatedTimeText}>
                    Est. {formatTimeFromNow(orderStatus.estimatedTime)}
                  </Text>
                </View>
              )}
          </View>

          {/* Status Text */}
          <Text style={styles.statusText}>
            {orderStatus?.statusText ||
              (order.status === "cancelled"
                ? "Order cancelled"
                : "Status not available")}
          </Text>

          {/* Status Tracker */}
          <OrderStatusTracker
            status={order.status}
            deliveryType={order.deliveryType}
          />

          {/* Cancel button for pending orders */}
          {order.status === "pending" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Order Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID:</Text>
            <Text style={styles.infoValue}>
              #{orderId.substring(orderId.length - 8)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Type:</Text>
            <Text style={styles.infoValue}>
              {order.deliveryType === "pickup" ? "Pickup" : "Delivery"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Method:</Text>
            <Text style={styles.infoValue}>
              {order.paymentMethod === "credit_card"
                ? "Credit Card"
                : order.paymentMethod === "apple_pay"
                ? "Apple Pay"
                : order.paymentMethod === "mada"
                ? "MADA"
                : order.paymentMethod === "stc_pay"
                ? "STC Pay"
                : "Cash"}
            </Text>
          </View>
        </View>

        {/* Branch/Delivery Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            {order.deliveryType === "pickup"
              ? "Pickup Location"
              : "Delivery Address"}
          </Text>

          {order.deliveryType === "pickup" ? (
            <>
              <Text style={styles.locationName}>{order.branch.name}</Text>
              <Text style={styles.locationAddress}>
                {order.branch.address.mainAddress}, {order.branch.address.city}
              </Text>
            </>
          ) : (
            order.deliveryAddress && (
              <>
                <Text style={styles.locationAddress}>
                  {order.deliveryAddress.address}
                </Text>
                {order.deliveryAddress.apartment && (
                  <Text style={styles.locationAddress}>
                    {order.deliveryAddress.apartment}
                  </Text>
                )}
                <Text style={styles.locationAddress}>
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                  {order.deliveryAddress.pincode}
                </Text>
              </>
            )
          )}
        </View>

        {/* Order Items */}
        <OrderItemsList items={order.items} />

        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              SAR {order.totalAmount.toFixed(2)}
            </Text>
          </View>

          {order.discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.discountLabel}>Discount</Text>
              <Text style={styles.discountValue}>
                - SAR {order.discountAmount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              SAR {order.finalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  statusCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  estimatedTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4F4",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  estimatedTimeText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "500",
    marginLeft: 4,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  cancelButton: {
    marginTop: 16,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#EF4444",
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  locationName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  discountLabel: {
    fontSize: 14,
    color: "#4CAF50",
  },
  discountValue: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
  },
});

export default OrderDetailsScreen;
