import React from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import useCartStore from "../store/cartStore";
import useOrderStore from "../store/orderStore";

const OrderSummary = () => {
  const { items } = useCartStore();
  const { cartTotal, discountAmount, finalTotal } = useOrderStore();

  // Get currency from first item in cart (if any)
  const currency =
    items.length > 0 ? items[0].item.prices[0]?.currency || "SAR" : "SAR";

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.item.image }}
        style={styles.itemImage}
        resizeMode="cover"
      />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.item.nameEnglish}
        </Text>

        <View style={styles.itemPriceRow}>
          <Text style={styles.itemQuantity}>{item.quantity} x</Text>
          <Text style={styles.itemPrice}>
            {currency} {item.price.toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={styles.itemTotalPrice}>
        {currency} {(item.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.item._id}
        style={styles.itemsList}
        scrollEnabled={false}
        ListFooterComponent={() => (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {currency} {cartTotal.toFixed(2)}
              </Text>
            </View>

            {discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.discountLabel}>Discount</Text>
                <Text style={styles.discountValue}>
                  - {currency} {discountAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {currency} {finalTotal.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  itemsList: {
    marginTop: 8,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
    marginRight: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
  },
  itemTotalPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  summaryContainer: {
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
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
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
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
    color: "#ff6b6b",
  },
});
export default OrderSummary;
