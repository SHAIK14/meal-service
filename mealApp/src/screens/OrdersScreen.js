import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getOrderHistory, getLatestOrder } from "../api/authApi";
import OrderCard from "../components/OrderCard";

const OrdersScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [showAllPastOrders, setShowAllPastOrders] = useState(false);
  const INITIAL_PAST_ORDERS_COUNT = 5;

  // Load orders data
  const loadOrders = useCallback(
    async (refresh = false) => {
      try {
        setError(null);

        if (refresh) {
          setRefreshing(true);
          setPage(1);
        } else if (!refresh && !loading) {
          setLoading(true);
        }

        // Get active orders - these are orders that are not completed, delivered, or cancelled
        const activeResponse = await getOrderHistory(1, 10, "active");

        if (activeResponse.success) {
          setActiveOrders(activeResponse.data.orders);
        }

        // Get past orders (completed, delivered, or cancelled)
        const pastResponse = await getOrderHistory(
          refresh ? 1 : page,
          showAllPastOrders ? 10 : INITIAL_PAST_ORDERS_COUNT,
          "past"
        );

        if (pastResponse.success) {
          const { orders, pagination } = pastResponse.data;

          if (refresh) {
            setPastOrders(orders);
          } else {
            setPastOrders((prev) => [...prev, ...orders]);
          }

          setHasMore(pagination.page < pagination.pages);
          if (!refresh) {
            setPage((prev) => prev + 1);
          }
        }
      } catch (err) {
        setError("Failed to load orders. Pull down to refresh.");
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, loading, showAllPastOrders]
  );

  // Initial load
  useEffect(() => {
    loadOrders();
  }, []);

  // Reload when showAllPastOrders changes
  useEffect(() => {
    loadOrders(true);
  }, [showAllPastOrders]);

  // Handle refresh
  const handleRefresh = () => {
    loadOrders(true);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && hasMore && showAllPastOrders) {
      loadOrders();
    }
  };

  // Navigate to order details
  const handleOrderPress = (order) => {
    navigation.navigate("OrderDetails", { orderId: order._id });
  };

  // Render active orders section

  const renderActiveOrders = () => {
    if (activeOrders.length === 0) return null;

    return (
      <View style={styles.activeOrdersContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Orders</Text>
        </View>
        {activeOrders.map((order, index) => (
          <OrderCard
            key={`active-${order._id}-${index}`}
            order={order}
            onPress={() => handleOrderPress(order)}
          />
        ))}
      </View>
    );
  };

  // Render list header
  const renderListHeader = () => (
    <>
      {renderActiveOrders()}

      <View style={styles.pastOrdersHeader}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Past Orders</Text>

          {pastOrders.length > INITIAL_PAST_ORDERS_COUNT && (
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowAllPastOrders(!showAllPastOrders)}
            >
              <Text style={styles.toggleButtonText}>
                {showAllPastOrders ? "Show Less" : "Show All"}
              </Text>
              <Ionicons
                name={showAllPastOrders ? "chevron-up" : "chevron-down"}
                size={16}
                color="#FF6B6B"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );

  // Render empty state
  const renderEmpty = () => {
    // Only show empty state if both active and past orders are empty
    if ((loading && page === 1) || activeOrders.length > 0) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color="#CCC" />
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptyDescription}>
          Your order history will appear here once you place an order.
        </Text>

        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate("Menu")}
        >
          <Text style={styles.browseButtonText}>Browse Menu</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render footer with loading indicator
  const renderFooter = () => {
    if (!loading || refreshing || !showAllPastOrders) return null;

    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#FF6B6B" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pastOrders}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => handleOrderPress(item)} />
          )}
          keyExtractor={(item, index) => `past-${item._id}-${index}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#FF6B6B"]}
              tintColor="#FF6B6B"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 12 : 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  activeOrdersContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleButtonText: {
    fontSize: 14,
    color: "#FF6B6B",
    marginRight: 4,
  },
  pastOrdersHeader: {
    marginBottom: 8,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#FF6B6B",
    marginRight: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  browseButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerContainer: {
    padding: 16,
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
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
});

export default OrdersScreen;
