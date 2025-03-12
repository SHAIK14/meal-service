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

const PaymentScreen = ({ navigation }) => {
  const [orderNotes, setOrderNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const {
    loading,
    error,
    selectedPaymentMethod,
    processPayment,
    finalizeOrder,
    orderPlaced,
    orderId,
    deliveryType,
  } = useOrderStore();

  const { itemCount } = useCartStore();

  // If no items in cart, go back to main
  useEffect(() => {
    if (itemCount === 0) {
      Alert.alert(
        "Cart Empty",
        "Your cart is empty. Please add items to continue."
      );
      navigation.navigate("Main"); // Navigate to Main instead of Cart
    }
  }, [itemCount]);

  // Handle order placed
  useEffect(() => {
    if (orderPlaced && orderId) {
      // Format order ID for display if needed
      const displayOrderId =
        orderId.length > 8 ? orderId.substring(orderId.length - 8) : orderId;

      Alert.alert(
        "Order Placed Successfully",
        `Your order #${displayOrderId} has been placed successfully!`,
        [
          {
            text: "OK",
            onPress: () => {
              // Reset navigation to main screen
              navigation.reset({
                index: 0,
                routes: [{ name: "Main" }], // Reset navigation stack
              });
            },
          },
        ]
      );
    }
  }, [orderPlaced, orderId]);

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert(
        "Payment Method Required",
        "Please select a payment method to continue."
      );
      return;
    }

    try {
      setProcessing(true);

      // Process payment
      const paymentSuccess = await processPayment();

      if (!paymentSuccess) {
        setProcessing(false);
        Alert.alert(
          "Payment Failed",
          "There was an error processing your payment. Please try again."
        );
        return;
      }

      // Finalize order
      const orderSuccess = await finalizeOrder(orderNotes);

      setProcessing(false);

      if (!orderSuccess) {
        Alert.alert(
          "Order Failed",
          "There was an error placing your order. Please try again."
        );
      }
    } catch (err) {
      setProcessing(false);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      console.error("Place order error:", err);
    }
  };

  const handleChangeAddress = () => {
    // Go back to address selection or delivery type selection based on current flow
    if (deliveryType === "pickup") {
      navigation.navigate("BranchSelection");
    } else {
      navigation.navigate("DeliveryType");
    }
  };

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
            (loading || processing || !selectedPaymentMethod) &&
              styles.disabledButton,
          ]}
          onPress={handlePlaceOrder}
          disabled={loading || processing || !selectedPaymentMethod}
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
