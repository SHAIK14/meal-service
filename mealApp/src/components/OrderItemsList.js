import React from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";

const OrderItemsList = ({ items, currency = "SAR" }) => {
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {item.item.image && (
        <Image
          source={{ uri: item.item.image }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.item.nameEnglish}
        </Text>

        <View style={styles.itemPriceRow}>
          <Text style={styles.itemPrice}>
            {currency} {item.price.toFixed(2)}
          </Text>

          {item.item.type && (
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
          )}
        </View>
      </View>

      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>x{item.quantity}</Text>
        <Text style={styles.totalPrice}>
          {currency} {(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Order Items</Text>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.item._id}-${index}`}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  typeIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  quantityContainer: {
    alignItems: "flex-end",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});

export default OrderItemsList;
