import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Image,
} from "react-native";
import { format, isToday, isBefore, isAfter, addDays } from "date-fns";
import {
  getActiveSubscriptionMenus,
  getConfig,
  getSubscriptionTodayMenu,
  getSubscriptionUpcomingMenus,
} from "../../utils/api.js";

const { width } = Dimensions.get("window");

const SubscriptionPage = () => {
  // States for data management
  const [loading, setLoading] = useState(true);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [menuForDate, setMenuForDate] = useState(null);
  const [upcomingMenus, setUpcomingMenus] = useState([]);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch all required data
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [configResponse, subscriptionsResponse] = await Promise.all([
        getConfig(),
        getActiveSubscriptionMenus(),
      ]);

      setConfig(configResponse.data);

      if (
        subscriptionsResponse.success &&
        subscriptionsResponse.data.length > 0
      ) {
        const subscriptions = subscriptionsResponse.data;
        setActiveSubscriptions(subscriptions);

        const firstSub = subscriptions[0];
        setSelectedSubscription(firstSub);
        setSelectedPackage(firstSub.plan.selectedPackages[0]);

        // Set initial selected date based on subscription status
        const today = new Date();
        const startDate = new Date(firstSub.startDate);

        if (isBefore(today, startDate)) {
          setSelectedDate(startDate); // Show start date menu if plan hasn't started
        } else {
          setSelectedDate(today); // Show today's menu if plan is active
        }

        await fetchSubscriptionDetails(firstSub.orderId);
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuForDate = async (orderId, date) => {
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const response = await getSubscriptionTodayMenu(orderId, formattedDate);

      if (response.success) {
        const menuData = response.data;
        setMenuForDate({
          isAvailable: menuData.isAvailable,
          menu: menuData.menu || {},
          reason: menuData.reason,
          deliveryTime: selectedSubscription?.plan.deliveryTime,
        });
      }
    } catch (error) {
      console.error("Error fetching menu for date:", error);
    }
  };

  const handleDaySelect = async (date) => {
    setSelectedDate(date);
    if (selectedSubscription) {
      const formattedSelectedDate = format(date, "yyyy-MM-dd");

      // First check in upcomingMenus
      const selectedDayMenu = upcomingMenus.find(
        (day) =>
          format(new Date(day.date), "yyyy-MM-dd") === formattedSelectedDate
      );

      if (selectedDayMenu) {
        setMenuForDate({
          isAvailable: selectedDayMenu.isAvailable,
          menu: selectedDayMenu.menu || {},
          reason: selectedDayMenu.unavailableReason,
          deliveryTime: selectedSubscription.plan.deliveryTime,
        });
      } else {
        // If not found in upcomingMenus, fetch from server
        await fetchMenuForDate(selectedSubscription.orderId, date);
      }
    }
  };

  const fetchSubscriptionDetails = async (orderId) => {
    try {
      const [menuResponse, upcomingResponse] = await Promise.all([
        getSubscriptionTodayMenu(orderId),
        getSubscriptionUpcomingMenus(orderId),
      ]);

      if (menuResponse.success) {
        setMenuForDate(menuResponse.data);
      }

      if (upcomingResponse.success) {
        // Process and set upcoming menus
        const processedUpcomingMenus = upcomingResponse.data.map((day) => ({
          ...day,
          date: new Date(day.date),
        }));
        setUpcomingMenus(processedUpcomingMenus);

        // If it's an upcoming subscription, set the menu for the start date
        if (selectedSubscription?.status === "upcoming") {
          const startDateMenu = processedUpcomingMenus.find(
            (menu) =>
              format(menu.date, "yyyy-MM-dd") ===
              format(new Date(selectedSubscription.startDate), "yyyy-MM-dd")
          );
          if (startDateMenu) {
            setMenuForDate({
              isAvailable: startDateMenu.isAvailable,
              menu: startDateMenu.menu || {},
              reason: startDateMenu.unavailableReason,
              deliveryTime: selectedSubscription.plan.deliveryTime,
            });
          }
        }
      }
    } catch (err) {
      console.error("Error fetching subscription details:", err);
      setError("Failed to load menu details");
    }
  };

  const handleSubscriptionSelect = async (subscription) => {
    setSelectedSubscription(subscription);
    setSelectedPackage(subscription.plan.selectedPackages[0]);
    await fetchSubscriptionDetails(subscription.orderId);
  };

  const isHolidayDate = (date) => {
    if (!config) return false;

    const dayName = format(date, "EEEE");
    const dateStr = format(date, "yyyy-MM-dd");

    // Check weekly holidays
    if (config.weeklyHolidays.includes(dayName)) {
      return { isHoliday: true, reason: "Weekend Holiday" };
    }

    // Check national holidays
    const nationalHoliday = config.nationalHolidays.find(
      (h) => format(new Date(h.date), "yyyy-MM-dd") === dateStr
    );
    if (nationalHoliday) {
      return {
        isHoliday: true,
        reason: `National Holiday: ${nationalHoliday.name}`,
      };
    }

    // Check emergency closures
    const emergencyClosure = config.emergencyClosures.find(
      (c) => format(new Date(c.date), "yyyy-MM-dd") === dateStr
    );
    if (emergencyClosure) {
      return {
        isHoliday: true,
        reason: `Emergency Closure: ${emergencyClosure.description}`,
      };
    }

    return { isHoliday: false, reason: null };
  };

  const getSubscriptionStatus = (subscription) => {
    const today = new Date();
    const startDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);

    if (isBefore(today, startDate)) {
      const daysToStart = Math.ceil(
        (startDate - today) / (1000 * 60 * 60 * 24)
      );
      return {
        status: "upcoming",
        message: `Starts in ${daysToStart} day${daysToStart > 1 ? "s" : ""}`,
      };
    }

    if (isAfter(today, endDate)) {
      return { status: "completed", message: "Subscription ended" };
    }

    const daysToEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    if (daysToEnd <= 3) {
      return {
        status: "ending",
        message: `Ends in ${daysToEnd} day${daysToEnd > 1 ? "s" : ""}`,
      };
    }

    return { status: "active", message: "Active" };
  };

  const getMenuSectionTitle = () => {
    if (!selectedDate) return "";

    const today = new Date();
    if (format(selectedDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Today's Menu";
    }
    return format(selectedDate, "EEEE, dd MMMM");
  };

  const processMenuItems = (menu) => {
    if (!menu) return [];

    return Object.entries(menu).map(([packageType, items]) => ({
      packageType,
      items: Array.isArray(items) ? items : [],
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const getDeliveryStatus = () => {
    if (!selectedSubscription || !menuForDate) return null;

    const currentTime = new Date();
    const deliveryTime = new Date();
    const [hours, minutes] =
      selectedSubscription.plan.deliveryTime.fromTime.split(":");
    deliveryTime.setHours(parseInt(hours), parseInt(minutes), 0);

    if (isAfter(currentTime, deliveryTime)) {
      return "Delivered";
    }

    return "Pending Delivery";
  };

  // Render helper for menu items
  const renderMenuItems = ({ items }) => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.menuItemsScroll}
      >
        {items.map((item) => (
          <View key={item._id} style={styles.menuItemCard}>
            <Image
              source={{ uri: item.image }}
              style={styles.menuItemImage}
              // defaultSource={require("../../assets/placeholder-food.png")}
            />
            <View style={styles.menuItemDetails}>
              <Text style={styles.menuItemName} numberOfLines={1}>
                {item.nameEnglish}
              </Text>
              <Text style={styles.menuItemDesc} numberOfLines={2}>
                {item.descriptionEnglish}
              </Text>
              {item.calories && (
                <Text style={styles.caloriesText}>
                  {item.calories} calories
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Subscriptions</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C5A85F" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchInitialData}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : activeSubscriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active subscriptions found</Text>
        </View>
      ) : (
        <ScrollView
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Subscriptions Horizontal Scroll */}
          <View style={styles.subscriptionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {activeSubscriptions.map((subscription) => {
                const { status, message } = getSubscriptionStatus(subscription);
                return (
                  <TouchableOpacity
                    key={subscription.orderId}
                    style={[
                      styles.subscriptionCard,
                      selectedSubscription?.orderId === subscription.orderId &&
                        styles.selectedCard,
                    ]}
                    onPress={() => handleSubscriptionSelect(subscription)}
                  >
                    <Text
                      style={[
                        styles.planName,
                        selectedSubscription?.orderId ===
                          subscription.orderId && styles.selectedCardText,
                      ]}
                    >
                      {subscription.plan.name.english}
                    </Text>
                    <Text
                      style={[
                        styles.packageInfo,
                        selectedSubscription?.orderId ===
                          subscription.orderId && styles.selectedCardText,
                      ]}
                    >
                      {subscription.plan.selectedPackages.join(" & ")}
                    </Text>
                    <View
                      style={[styles.statusBadge, styles[`status${status}`]]}
                    >
                      <Text style={styles.statusText}>{message}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {selectedSubscription && (
            <View style={styles.contentContainer}>
              {/* Upcoming Days Preview */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming Days</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.upcomingDaysScroll}
                >
                  {upcomingMenus.map((day) => {
                    const holidayCheck = isHolidayDate(new Date(day.date));
                    const isSelected =
                      format(new Date(day.date), "yyyy-MM-dd") ===
                      format(selectedDate, "yyyy-MM-dd");

                    return (
                      <TouchableOpacity
                        key={day.date}
                        style={[
                          styles.dayCard,
                          holidayCheck.isHoliday && styles.holidayCard,
                          isSelected && styles.selectedDayCard,
                        ]}
                        onPress={() => handleDaySelect(new Date(day.date))}
                      >
                        <Text style={styles.dayName}>
                          {format(new Date(day.date), "EEE")}
                        </Text>
                        <Text style={styles.dayDate}>
                          {format(new Date(day.date), "dd")}
                        </Text>
                        {holidayCheck.isHoliday ? (
                          <Text style={styles.holidayText}>
                            {holidayCheck.reason.split(":")[1]?.trim() ||
                              holidayCheck.reason}
                          </Text>
                        ) : (
                          <View style={styles.packageIndicators}>
                            {selectedSubscription.plan.selectedPackages.map(
                              (pkg) => (
                                <View
                                  key={pkg}
                                  style={[
                                    styles.packageDot,
                                    day.menu?.[pkg] && styles.activePackageDot,
                                  ]}
                                />
                              )
                            )}
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Selected Day Menu Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{getMenuSectionTitle()}</Text>

                {/* Package Selector */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.packageSelector}
                >
                  {selectedSubscription.plan.selectedPackages.map((pkg) => (
                    <TouchableOpacity
                      key={pkg}
                      style={[
                        styles.packageButton,
                        selectedPackage === pkg && styles.selectedPackage,
                      ]}
                      onPress={() => setSelectedPackage(pkg)}
                    >
                      <Text
                        style={[
                          styles.packageButtonText,
                          selectedPackage === pkg && styles.selectedPackageText,
                        ]}
                      >
                        {pkg.charAt(0).toUpperCase() + pkg.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Menu Items */}
                {menuForDate?.isAvailable ? (
                  <View style={styles.menuContainer}>
                    <View style={styles.deliveryInfo}>
                      <Text style={styles.deliveryTime}>
                        Delivery Time:{" "}
                        {selectedSubscription.plan.deliveryTime.fromTime} -{" "}
                        {selectedSubscription.plan.deliveryTime.toTime}
                      </Text>
                      {isToday(selectedDate) && (
                        <Text style={styles.deliveryStatus}>
                          {getDeliveryStatus()}
                        </Text>
                      )}
                    </View>

                    {menuForDate?.menu[selectedPackage] ? (
                      renderMenuItems({
                        items: menuForDate.menu[selectedPackage],
                      })
                    ) : (
                      <View style={styles.unavailableContainer}>
                        <Text style={styles.unavailableText}>
                          No menu items available for {selectedPackage}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.unavailableContainer}>
                    <Text style={styles.unavailableText}>
                      {selectedSubscription.status === "upcoming"
                        ? "Subscription not started yet"
                        : menuForDate?.reason ||
                          "Menu not available for this day"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },

  // Loading, Error, and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    backgroundColor: "#C5A85F",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  // Subscription Cards
  subscriptionsContainer: {
    padding: 16,
  },
  subscriptionCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: width * 0.8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: "#C5A85F",
  },
  selectedCardText: {
    color: "#fff",
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  packageInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusactive: {
    backgroundColor: "#4CAF50",
  },
  statusupcoming: {
    backgroundColor: "#2196F3",
  },
  statusending: {
    backgroundColor: "#FF9800",
  },
  statuscompleted: {
    backgroundColor: "#9E9E9E",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },

  // Content Container
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },

  // Upcoming Days
  upcomingDaysScroll: {
    marginTop: 8,
  },
  dayCard: {
    width: width * 0.15,
    height: width * 0.2,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedDayCard: {
    borderColor: "#C5A85F",
    borderWidth: 2,
  },
  holidayCard: {
    backgroundColor: "#f8f8f8",
  },
  dayName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  holidayText: {
    fontSize: 10,
    color: "#ff4444",
    textAlign: "center",
    maxWidth: width * 0.13,
  },
  packageIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  packageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#eee",
  },
  activePackageDot: {
    backgroundColor: "#C5A85F",
  },

  // Package Selector
  packageSelector: {
    marginBottom: 16,
  },
  packageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 12,
  },
  selectedPackage: {
    backgroundColor: "#C5A85F",
  },
  packageButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  selectedPackageText: {
    color: "#fff",
  },

  // Menu Container and Items
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  deliveryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  deliveryTime: {
    fontSize: 14,
    color: "#666",
  },
  deliveryStatus: {
    fontSize: 14,
    color: "#C5A85F",
    fontWeight: "500",
  },
  menuItemsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  menuItemCard: {
    width: width * 0.6,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  menuItemImage: {
    width: "100%",
    height: width * 0.4,
    resizeMode: "cover",
  },
  menuItemDetails: {
    padding: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  menuItemDesc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
  caloriesText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },

  // Unavailable Container
  unavailableContainer: {
    padding: 20,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    alignItems: "center",
  },
  unavailableText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default SubscriptionPage;
