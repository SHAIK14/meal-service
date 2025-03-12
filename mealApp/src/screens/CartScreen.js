import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import useCartStore from "../store/cartStore";
import useOrderStore from "../store/orderStore";
import { getAddresses } from "../api/authApi";

const CartScreen = ({ navigation, route }) => {
  const {
    items,
    itemCount,
    cartTotal,
    loading,
    fetchCart,
    updateItem,
    removeItem,
    clearCartItems,
  } = useCartStore();

  const { setSelectedAddress } = useOrderStore();

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

  // Extract selectedAddress from route params
  const { selectedAddress } = route.params || {};

  useEffect(() => {
    // Load cart data when component mounts
    fetchCart();

    // Check if user has addresses
    checkAddresses();
  }, []);

  // Handle address selection from route params
  useEffect(() => {
    if (selectedAddress) {
      // If an address was selected, store it and proceed to delivery type selection
      setSelectedAddress(selectedAddress);

      // Navigate to delivery type screen with the selected address
      navigation.navigate("DeliveryType", { selectedAddress });
    }
  }, [selectedAddress]);

  const checkAddresses = async () => {
    try {
      setAddressLoading(true);
      const response = await getAddresses();
      setAddresses(response.data || []);
      setAddressLoading(false);
    } catch (error) {
      console.error("Error checking addresses:", error);
      setAddressLoading(false);
    }
  };

  const handleQuantityChange = (itemId, currentQuantity, change) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    updateItem(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => removeItem(itemId),
          style: "destructive",
        },
      ]
    );
  };

  const handleClearCart = () => {
    if (items.length === 0) return;

    Alert.alert("Clear Cart", "Are you sure you want to clear your cart?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear",
        onPress: () => clearCartItems(),
        style: "destructive",
      },
    ]);
  };

  const handleCheckout = () => {
    if (addresses.length === 0) {
      // No addresses - navigate to add address screen
      Alert.alert(
        "No Delivery Address",
        "Please add a delivery address to continue",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Add Address",
            onPress: () => navigation.navigate("Address"),
          },
        ]
      );
    } else {
      // Has addresses - navigate to address selection screen
      navigation.navigate("Address", { fromCheckout: true });
    }
  };

  const renderCartItem = ({ item }) => {
    // Get currency from the item
    const currency = item.item.prices[0]?.currency || "";

    return (
      <View style={styles.cartItem}>
        <Image
          source={{ uri: item.item.image }}
          style={styles.itemImage}
          resizeMode="cover"
        />

        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.item.nameEnglish}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>
              {currency} {(item.price * item.quantity).toFixed(2)}
            </Text>

            <View
              style={[
                styles.typeIndicator,
                {
                  backgroundColor:
                    item.item.type === "Veg" ? "#4CAF50" : "#F44336",
                },
              ]}
            >
              <Text style={styles.typeText}>{item.item.type}</Text>
            </View>
          </View>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                handleQuantityChange(item.item._id, item.quantity, -1)
              }
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                handleQuantityChange(item.item._id, item.quantity, 1)
              }
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.item._id)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Get currency from first item in cart (if any)
  const currency =
    items.length > 0 ? items[0].item.prices[0]?.currency || "" : "";

  // Empty cart view
  if (!loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Cart</Text>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.clearButtonText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>
            Add items from the menu to get started
          </Text>

          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate("Menu")}
          >
            <Text style={styles.browseButtonText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearCart}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.item._id}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {currency} {cartTotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {currency} {cartTotal.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              disabled={addressLoading}
            >
              {addressLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.checkoutButtonText}>
                  Proceed to Checkout
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  clearButtonText: {
    fontSize: 14,
    color: "#666",
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
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  typeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "bold",
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff6b6b",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6b6b",
  },
  checkoutButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CartScreen;
