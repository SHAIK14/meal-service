import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import OrderSummary from "../components/OrderSummary";
import DeliveryInfo from "../components/DeliveryInfo";
import PromoCodeInput from "../components/PromoCodeInput";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import useOrderStore from "../store/orderStore";
import useCartStore from "../store/cartStore";

const PaymentScreen = ({ navigation, route }) => {
  const [orderNotes, setOrderNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [canPlaceOrder, setCanPlaceOrder] = useState(true);

  const {
    loading,
    error,
    selectedPaymentMethod,
    processPayment,
    finalizeOrder,
    orderPlaced,
    orderId,
    deliveryType,
    resetOrderState,
  } = useOrderStore();

  const { itemCount } = useCartStore();

  // Enhanced logging when component mounts
  useEffect(() => {
    console.log("==========================================");
    console.log("PaymentScreen MOUNTED with state:", {
      orderPlaced,
      orderId,
      selectedPaymentMethod,
      deliveryType,
      loading,
      error,
    });
    console.log("==========================================");

    // Cleanup function when component unmounts
    return () => {
      console.log("==========================================");
      console.log("PaymentScreen UNMOUNTING");
      console.log("==========================================");
    };
  }, []);

  // Check if we're coming from order completion
  useEffect(() => {
    if (route.params?.fromOrderCompletion) {
      setOrderCompleted(true);
    }
  }, [route.params]);

  // If no items in cart, go back to main - BUT only if not coming from order completion
  useEffect(() => {
    console.log("ItemCount check effect triggered:", {
      itemCount,
      orderCompleted,
    });
    if (itemCount === 0 && !orderCompleted) {
      console.log("Cart is empty, navigating to Main");
      Alert.alert(
        "Cart Empty",
        "Your cart is empty. Please add items to continue."
      );
      navigation.navigate("Main");
    }
  }, [itemCount, orderCompleted]);

  // Handle order placed
  useEffect(() => {
    console.log("==========================================");
    console.log("Order placed effect TRIGGERED with:", {
      orderPlaced,
      orderId,
      timestamp: new Date().toISOString(),
    });
    console.log("==========================================");

    if (orderPlaced && orderId) {
      console.log("Showing order success alert for orderId:", orderId);

      // Save the full orderId for navigation
      const fullOrderId = orderId;
      const displayOrderId =
        orderId.length > 8 ? orderId.substring(orderId.length - 8) : orderId;

      // Mark order as completed to prevent empty cart alert
      setOrderCompleted(true);

      // IMPORTANT: Reset the order state BEFORE showing the alert
      console.log("Resetting order state after successful order");
      resetOrderState();

      Alert.alert(
        "Order Placed Successfully",
        `Your order #${displayOrderId} has been placed successfully!`,
        [
          {
            text: "View Order",
            onPress: () => {
              console.log("User selected to view order details");
              // Navigate to Orders tab first, then to details
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Main",
                    // Add this params object to pass the flag
                    params: {
                      screen: "Orders",
                      params: { fromOrderCompletion: true },
                    },
                  },
                ],
              });

              // Pass the same flag to OrderDetails
              setTimeout(() => {
                navigation.navigate("OrderDetails", {
                  orderId: fullOrderId,
                  fromOrderCompletion: true, // Add this flag
                });
              }, 500);
            },
          },
        ]
      );
    }
  }, [orderPlaced, orderId]);

  const handlePlaceOrder = async () => {
    console.log("==========================================");
    console.log(
      "handlePlaceOrder STARTED with payment method:",
      selectedPaymentMethod?.id
    );
    console.log("==========================================");

    // Prevent multiple order placements in quick succession
    if (!canPlaceOrder) {
      console.log("Order placement prevented - too soon after previous order");
      return;
    }

    if (!selectedPaymentMethod) {
      console.log("No payment method selected, showing alert");
      Alert.alert(
        "Payment Method Required",
        "Please select a payment method to continue."
      );
      return;
    }

    try {
      // Disable order placement temporarily
      setCanPlaceOrder(false);
      setProcessing(true);
      console.log("Processing payment...");

      // Process payment
      const paymentSuccess = await processPayment();
      console.log("Payment process result:", paymentSuccess);

      if (!paymentSuccess) {
        setProcessing(false);
        setCanPlaceOrder(true); // Re-enable order placement
        console.log("Payment failed");
        Alert.alert(
          "Payment Failed",
          "There was an error processing your payment. Please try again."
        );
        return;
      }

      console.log(
        "Payment successful, finalizing order with notes:",
        orderNotes
      );
      // Finalize order
      const orderSuccess = await finalizeOrder(orderNotes);
      console.log("Order finalization result:", orderSuccess);

      setProcessing(false);

      if (!orderSuccess) {
        setCanPlaceOrder(true); // Re-enable order placement
        console.log("Order finalization failed");
        Alert.alert(
          "Order Failed",
          "There was an error placing your order. Please try again."
        );
      }

      // Re-enable order placement after a delay
      setTimeout(() => {
        setCanPlaceOrder(true);
      }, 3000);
    } catch (err) {
      console.error("Place order error:", err);
      setProcessing(false);
      setCanPlaceOrder(true); // Re-enable on error
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  const handleChangeAddress = () => {
    console.log("Change address requested, delivery type:", deliveryType);
    // Go back to address selection or delivery type selection based on current flow
    if (deliveryType === "pickup") {
      navigation.navigate("BranchSelection");
    } else {
      navigation.navigate("DeliveryType");
    }
  };

  // Add a log when back button is pressed
  const handleBackPress = () => {
    console.log("Back button pressed on PaymentScreen");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholderView} />
      </View>

      <ScrollView style={styles.content}>
        {/* Order Summary */}
        <OrderSummary />

        {/* Delivery Information */}
        <DeliveryInfo onChangeAddress={handleChangeAddress} />

        {/* Promo Code Input */}
        <PromoCodeInput />

        {/* Payment Method Selector */}
        <PaymentMethodSelector />

        {/* Order Notes */}
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Order Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add special instructions for your order..."
            multiline
            value={orderNotes}
            onChangeText={setOrderNotes}
            maxLength={200}
          />
        </View>
      </ScrollView>

      {/* Footer with Place Order Button */}
      <View style={styles.footer}>
        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (loading ||
              processing ||
              !selectedPaymentMethod ||
              !canPlaceOrder) &&
              styles.disabledButton,
          ]}
          onPress={handlePlaceOrder}
          disabled={
            loading || processing || !selectedPaymentMethod || !canPlaceOrder
          }
        >
          {processing || loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>Place Order</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  notesContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    maxHeight: 120,
    fontSize: 14,
    color: "#333",
    textAlignVertical: "top",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  errorText: {
    color: "#ff6b6b",
    marginBottom: 8,
    textAlign: "center",
  },
  placeOrderButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PaymentScreen;
