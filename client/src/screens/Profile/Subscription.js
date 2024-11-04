import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getActiveSubscriptions, getTodayMenus } from "../../utils/api";

const SubscriptionPage = () => {
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [todayMenus, setTodayMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const subscriptionsRes = await getActiveSubscriptions();
      setActiveSubscriptions(subscriptionsRes.data || []);

      if (subscriptionsRes.data && subscriptionsRes.data.length > 0) {
        const menusRes = await getTodayMenus();
        setTodayMenus(menusRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      Alert.alert(
        "Error",
        "Unable to fetch subscription data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const renderMenuItems = (items) => {
    if (!items || items.length === 0) {
      return (
        <View style={styles.noItemsContainer}>
          <Text style={styles.noMenuText}>No items available for today</Text>
        </View>
      );
    }

    return items.map((item, index) => (
      <View key={index} style={styles.menuItem}>
        <Text style={styles.menuItemName}>{item.nameEnglish}</Text>
        <Text style={styles.menuItemName_ar}>{item.nameArabic}</Text>
        {item.calories && (
          <Text style={styles.menuItemCalories}>{item.calories} calories</Text>
        )}
      </View>
    ));
  };

  const renderSubscriptionCard = (subscription, menu) => {
    if (!menu) {
      return (
        <View key={subscription.orderId} style={styles.subscriptionCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{subscription.plan.name}</Text>
            <Text style={styles.loadingText}>Loading menu...</Text>
          </View>
        </View>
      );
    }

    return (
      <View key={subscription.orderId} style={styles.subscriptionCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{menu.planName}</Text>
          <Text style={styles.dayInfo}>Day {menu.dayNumber}</Text>
        </View>

        {menu.packages.map((packageType) => (
          <View key={packageType} style={styles.packageContainer}>
            <Text style={styles.packageTitle}>
              {packageType.charAt(0).toUpperCase() + packageType.slice(1)}
            </Text>
            <View style={styles.menuItemsContainer}>
              {renderMenuItems(menu.menuItems[packageType])}
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Subscriptions</Text>
        </View>

        {activeSubscriptions.length === 0 ? (
          <View style={styles.noSubscriptionContainer}>
            <Text style={styles.noSubscriptionText}>No active plans</Text>
          </View>
        ) : (
          <View style={styles.subscriptionsContainer}>
            {activeSubscriptions.map((subscription) => {
              const menu = todayMenus.find(
                (m) => m.subscriptionId === subscription.orderId
              );
              return renderSubscriptionCard(subscription, menu);
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  subscriptionsContainer: {
    padding: 16,
  },
  subscriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  dayInfo: {
    fontSize: 14,
    color: "#666666",
  },
  loadingText: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
  },
  packageContainer: {
    marginBottom: 16,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  menuItemsContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
  },
  noItemsContainer: {
    padding: 12,
    alignItems: "center",
  },
  menuItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  menuItemName: {
    fontSize: 16,
    color: "#333333",
  },
  menuItemName_ar: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  menuItemCalories: {
    fontSize: 12,
    color: "#888888",
    marginTop: 4,
  },
  noMenuText: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
  },
  noSubscriptionContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  noSubscriptionText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 16,
  },
});

export default SubscriptionPage;
