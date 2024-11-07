import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";
import {
  getActiveSubscriptions,
  getMenuForDate,
  getSubscriptionDates,
} from "../../utils/api";

const SubscriptionPage = () => {
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Get correct day number based on weekday (Sun=1, Mon=2, etc)
  const getAdminDayNumber = (date) => {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek === 0 ? 1 : dayOfWeek + 1;
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  // Check if date is a delivery day based on plan duration
  const isDeliveryDay = (date, planDuration) => {
    const dayOfWeek = new Date(date).getDay();
    switch (planDuration) {
      case 5:
        return dayOfWeek !== 5 && dayOfWeek !== 6; // Not Friday or Saturday
      case 6:
        return dayOfWeek !== 5; // Not Friday
      case 7:
        return true; // All days
      default:
        return false;
    }
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const subscriptionsRes = await getActiveSubscriptions();
      const subscriptions = subscriptionsRes.data || [];
      setActiveSubscriptions(subscriptions);

      if (subscriptions.length > 0) {
        const defaultSub = subscriptions[0];
        setSelectedSubscription(defaultSub);
        await fetchMenuForDate(selectedDate);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubscriptionChange = async (subscription) => {
    try {
      setLoading(true);
      setSelectedSubscription(subscription);
      await fetchMenuForDate(selectedDate);
    } catch (error) {
      console.error("Error changing subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuForDate = async (date) => {
    try {
      setLoading(true);
      const formattedDate = formatDate(date);
      const dayNumber = getAdminDayNumber(date).toString();
      const menuRes = await getMenuForDate(formattedDate);

      // Filter and process menus for the correct day
      const filteredMenus = (menuRes.data || []).map((menu) => ({
        ...menu,
        dayNumber,
      }));

      setMenus(filteredMenus);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    const selectedDateTime = new Date(date.timestamp);
    const isDateValid = isDeliveryDay(
      selectedDateTime,
      selectedSubscription?.plan.duration
    );

    if (isDateValid) {
      setSelectedDate(selectedDateTime);
      setShowCalendar(false);
      fetchMenuForDate(selectedDateTime);
    }
  };

  const getMarkedDates = () => {
    if (!selectedSubscription) return {};

    const markedDates = {};
    const start = new Date(selectedSubscription.startDate);
    const end = new Date(selectedSubscription.endDate);
    let current = new Date(start);

    while (current <= end) {
      const dateString = formatDate(current);
      const isDelivery = isDeliveryDay(
        current,
        selectedSubscription.plan.duration
      );
      const isSelected = formatDate(selectedDate) === dateString;

      if (current >= start && current <= end) {
        markedDates[dateString] = {
          marked: isDelivery,
          disabled: !isDelivery,
          disableTouchEvent: !isDelivery,
          selected: isSelected,
          selectedColor: "#0066CC",
          selectedTextColor: "#FFFFFF",
        };
      }

      current.setDate(current.getDate() + 1);
    }

    return markedDates;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const renderSubscriptionPicker = () => {
    if (!activeSubscriptions.length) return null;

    return (
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedSubscription?.orderId}
          onValueChange={(itemValue) => {
            const subscription = activeSubscriptions.find(
              (sub) => sub.orderId === itemValue
            );
            handleSubscriptionChange(subscription);
          }}
          style={styles.picker}
        >
          {activeSubscriptions.map((subscription) => (
            <Picker.Item
              key={subscription.orderId}
              label={`${subscription.plan.planId.nameEnglish} (${subscription.plan.duration} days/week)`}
              value={subscription.orderId}
            />
          ))}
        </Picker>
      </View>
    );
  };

  const renderDateSelector = () => {
    const dayNumber = getAdminDayNumber(selectedDate);
    return (
      <TouchableOpacity
        style={styles.dateSelector}
        onPress={() => setShowCalendar(true)}
      >
        <Text style={styles.dateSelectorText}>
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.dayNumber}>Day {dayNumber}</Text>
      </TouchableOpacity>
    );
  };

  const renderCalendarModal = () => (
    <Modal visible={showCalendar} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={getMarkedDates()}
            minDate={selectedSubscription?.startDate}
            maxDate={selectedSubscription?.endDate}
            onDayPress={handleDateSelect}
            theme={{
              selectedDayBackgroundColor: "#0066CC",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#0066CC",
              disabledTextColor: "#CCCCCC",
            }}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCalendar(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderMenuItems = (items) => {
    if (!items || items.length === 0) {
      return (
        <View style={styles.noItemsContainer}>
          <Text style={styles.noMenuText}>No items available for this day</Text>
        </View>
      );
    }

    return items.map((item, index) => (
      <View key={index} style={styles.menuItem}>
        <View style={styles.menuItemHeader}>
          <Text style={styles.menuItemName}>{item.nameEnglish}</Text>
          <Text style={styles.menuItemCalories}>{item.calories} cal</Text>
        </View>
        <Text style={styles.menuItemNameAr}>{item.nameArabic}</Text>
        <View style={styles.nutritionInfo}>
          <Text style={styles.nutritionText}>P: {item.protein}g</Text>
          <Text style={styles.nutritionText}>C: {item.carbs}g</Text>
          <Text style={styles.nutritionText}>F: {item.fat}g</Text>
        </View>
      </View>
    ));
  };

  const renderSubscriptionMenu = (menu) => {
    if (menu.subscriptionId !== selectedSubscription?.orderId) return null;

    const dayNumber = getAdminDayNumber(selectedDate);

    return (
      <View key={menu.subscriptionId} style={styles.menuCard}>
        <View style={styles.menuHeader}>
          <Text style={styles.planName}>Day {dayNumber} Menu</Text>
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

  if (loading && !menus.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
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
        {renderSubscriptionPicker()}
        {renderDateSelector()}
        {renderCalendarModal()}

        {loading ? (
          <ActivityIndicator style={styles.menuLoader} color="#0066CC" />
        ) : menus.length > 0 ? (
          <View style={styles.menusContainer}>
            {menus.map(renderSubscriptionMenu)}
          </View>
        ) : (
          <View style={styles.noSubscriptionContainer}>
            <Text style={styles.noSubscriptionText}>
              No menu available for selected date
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  // Picker Styles
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  picker: {
    height: 50,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },

  // Date Selector Styles
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Calendar Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  calendarContainer: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#0066CC",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },

  // Menu Container
  menusContainer: {
    padding: 16,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  menuHeader: {
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },

  // Package Section
  packageContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
    backgroundColor: "#F8F9FA",
    padding: 8,
    borderRadius: 8,
  },
  menuItemsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },

  // Menu Items
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    flex: 1,
  },
  menuItemNameAr: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
    textAlign: "right",
  },
  menuItemCalories: {
    fontSize: 14,
    color: "#FF9500",
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#FFF5E6",
    borderRadius: 4,
  },
  nutritionInfo: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  nutritionText: {
    fontSize: 12,
    color: "#666666",
    marginRight: 16,
    fontWeight: "500",
  },

  // Empty States
  noItemsContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  noMenuText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  noSubscriptionContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  noSubscriptionText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },

  // Loading States
  menuLoader: {
    marginTop: 24,
    marginBottom: 24,
  },
});

export default SubscriptionPage;
