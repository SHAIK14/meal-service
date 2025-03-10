import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { getDiningMenuItems, getItemDetails } from "../api/authApi";
import ItemDetailModal from "./ItemDetailModal";
import useCartStore from "../store/cartStore";

const MenuScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filterType, setFilterType] = useState("All"); // 'All', 'Veg', 'Non Veg'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Get cart info from cartStore
  const {
    items: cartItems,
    itemCount,
    cartTotal,
    updateItem,
    fetchCart,
  } = useCartStore();

  // Load menu items on component mount
  useEffect(() => {
    loadData();
    fetchCart(); // Load cart data
  }, []);

  // Filter items when type filter changes
  useEffect(() => {
    filterItems();
  }, [filterType, items]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch menu items
      const itemsResponse = await getDiningMenuItems();
      setItems(itemsResponse.data);

      setLoading(false);
    } catch (err) {
      console.error("Error loading menu data:", err);
      setError("Failed to load menu. Please try again.");
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await fetchCart();
    setRefreshing(false);
  };

  const filterItems = () => {
    let filtered = [...items];

    // Apply type filter (Veg/Non-Veg)
    if (filterType !== "All") {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    setFilteredItems(filtered);
  };

  const handleItemPress = async (item) => {
    try {
      // Get detailed item information if needed
      const response = await getItemDetails(item._id);
      setSelectedItem(response.data);
      setModalVisible(true);
    } catch (err) {
      console.error("Error getting item details:", err);
      // Show the item we already have if we can't get detailed info
      setSelectedItem(item);
      setModalVisible(true);
    }
  };

  // Get item quantity in cart
  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find((item) => item.item._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, change) => {
    const currentQty = getItemQuantity(itemId);
    const newQty = currentQty + change;

    if (newQty <= 0) {
      // Remove item if quantity is 0
      updateItem(itemId, 0);
    } else {
      // Add or update item
      updateItem(itemId, newQty);
    }
  };

  // Get currency from the first cart item or from the first menu item as a fallback
  const getCurrency = () => {
    if (cartItems.length > 0 && cartItems[0].item.prices[0]?.currency) {
      return cartItems[0].item.prices[0].currency;
    } else if (items.length > 0 && items[0].prices[0]?.currency) {
      return items[0].prices[0].currency;
    }
    return ""; // Default empty string if no currency found
  };

  // Render a single menu item
  const renderItem = ({ item }) => {
    const quantity = getItemQuantity(item._id);
    const currency = item.prices[0]?.currency || "";

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemTypeContainer}>
          <View
            style={[
              styles.typeIndicator,
              { backgroundColor: item.type === "Veg" ? "#4CAF50" : "#F44336" },
            ]}
          >
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>

        <Image
          source={{ uri: item.image }}
          style={styles.itemImage}
          resizeMode="cover"
        />

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.nameEnglish}
          </Text>

          <Text style={styles.itemDesc} numberOfLines={2}>
            {item.descriptionEnglish}
          </Text>

          <View style={styles.itemBottom}>
            <Text style={styles.itemPrice}>
              {currency} {item.prices[0]?.sellingPrice?.toFixed(2)}
            </Text>

            {quantity === 0 ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleQuantityChange(item._id, 1)}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item._id, -1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.quantityText}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item._id, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading indicator while loading
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  // Show error message if there was an error
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currency = getCurrency();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Item Detail Modal - Now just for viewing details */}
      <ItemDetailModal
        visible={modalVisible}
        item={selectedItem}
        onClose={() => setModalVisible(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
      </View>

      {/* Type Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "All" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("All")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === "All" && styles.filterButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "Veg" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("Veg")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === "Veg" && styles.filterButtonTextActive,
            ]}
          >
            Vegetarian
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "Non Veg" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("Non Veg")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === "Non Veg" && styles.filterButtonTextActive,
            ]}
          >
            Non-Vegetarian
          </Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ff6b6b"]}
            tintColor="#ff6b6b"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No items found. Try changing filters or pull to refresh.
            </Text>
          </View>
        }
      />

      {/* Cart Summary */}
      {itemCount > 0 && (
        <TouchableOpacity
          style={styles.cartSummary}
          onPress={() => navigation.navigate("Cart")}
        >
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </Text>
            <Text style={styles.cartTotal}>
              {currency} {cartTotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.viewCartButton}>
            <Text style={styles.viewCartText}>View Cart</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
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
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  filterButtonActive: {
    backgroundColor: "#ff6b6b",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  itemsContainer: {
    padding: 8,
    paddingBottom: 120, // Add extra padding for cart summary and tab bar
  },
  itemCard: {
    width: (windowWidth - 24) / 2, // Responsive width for 2 columns with padding
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    margin: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: "relative",
  },
  itemTypeContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
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
  itemImage: {
    width: "100%",
    height: 120,
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  itemDesc: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    height: 32, // Set fixed height for 2 lines
  },
  itemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: -2,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorText: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
  },
  cartSummary: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cartInfo: {
    flexDirection: "column",
  },
  cartItemCount: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 2,
  },
  cartTotal: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  viewCartButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  viewCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MenuScreen;
