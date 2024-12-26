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
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  format,
  addDays,
  parseISO,
  isBefore,
  startOfDay,
  isAfter,
} from "date-fns";
import CalendarPicker from "react-native-calendar-picker";
import { getConfig } from "../utils/api";

const { width } = Dimensions.get("window");
const DAY_ITEM_WIDTH = width * 0.12;

const SubscriptionDays = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { plan, durationData } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [subscriptionDays, setSubscriptionDays] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [extraDays, setExtraDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(plan.totalPrice);
  const [showCalendar, setShowCalendar] = useState(false);
  const [minSelectableDate, setMinSelectableDate] = useState(null);
  const [actualStartDate, setActualStartDate] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await getConfig();
      const configData = response.data;
      setConfig(configData);

      const startDate = addDays(new Date(), configData.planStartDelay);
      setSelectedStartDate(startDate);
      setMinSelectableDate(startDate);
      generateSubscriptionDays(startDate, configData, 0);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching config:", error);
      setLoading(false);
    }
  };

  const getMaxExtraDays = () => {
    switch (durationData.durationType) {
      case "2_week":
        return 4;
      case "1_month":
        return 8;
      default:
        return 2;
    }
  };

  const isDateAvailable = (date, configData) => {
    const dayName = format(date, "EEEE");
    const dateStr = format(date, "yyyy-MM-dd");

    // Check weekly holiday (weekend)
    if (configData.weeklyHolidays?.includes(dayName)) {
      return false;
    }

    // Check national holidays
    if (configData.nationalHolidays?.length > 0) {
      const isNationalHoliday = configData.nationalHolidays.some(
        (holiday) => format(parseISO(holiday.date), "yyyy-MM-dd") === dateStr
      );
      if (isNationalHoliday) return false;
    }

    // Check emergency closures
    if (configData.emergencyClosures?.length > 0) {
      const isEmergencyClosure = configData.emergencyClosures.some(
        (closure) => format(parseISO(closure.date), "yyyy-MM-dd") === dateStr
      );
      if (isEmergencyClosure) return false;
    }

    return true;
  };

  const getUnavailabilityReason = (date, configData) => {
    const dayName = format(date, "EEEE");
    const dateStr = format(date, "yyyy-MM-dd");

    if (configData.weeklyHolidays?.includes(dayName)) {
      return "Weekend";
    }

    if (configData.nationalHolidays?.length > 0) {
      const holiday = configData.nationalHolidays.find(
        (h) => format(parseISO(h.date), "yyyy-MM-dd") === dateStr
      );
      if (holiday) return `Holiday: ${holiday.name}`;
    }

    if (configData.emergencyClosures?.length > 0) {
      const closure = configData.emergencyClosures.find(
        (c) => format(parseISO(c.date), "yyyy-MM-dd") === dateStr
      );
      if (closure) return `Emergency Closure: ${closure.description}`;
    }

    return null;
  };

  const generateSubscriptionDays = (startDate, configData, extraDaysCount) => {
    const days = [];
    let currentDate = startDate;
    let availableDaysCount = 0;
    let firstAvailableDate = null;
    const minRequired = durationData.minDays || 5;
    const totalDaysNeeded = minRequired + extraDaysCount;

    console.log(
      "Starting date calculation from:",
      format(currentDate, "yyyy-MM-dd")
    );

    while (availableDaysCount < totalDaysNeeded) {
      const isAvailable = isDateAvailable(currentDate, configData);

      const dayInfo = {
        date: currentDate,
        displayDate: format(currentDate, "d"),
        displayMonth: format(currentDate, "MMM"),
        dayName: format(currentDate, "EEEE"),
        isAvailable: isAvailable,
        unavailableReason: null,
      };

      if (!isAvailable) {
        dayInfo.unavailableReason = getUnavailabilityReason(
          currentDate,
          configData
        );
      } else {
        if (firstAvailableDate === null) {
          console.log(
            "Found first available date:",
            format(currentDate, "yyyy-MM-dd")
          );
          firstAvailableDate = currentDate;
          setActualStartDate(currentDate);
        }
        availableDaysCount++;
      }

      days.push(dayInfo);
      currentDate = addDays(currentDate, 1);
    }

    console.log(
      "Generated days:",
      days.map((d) => ({
        date: format(d.date, "yyyy-MM-dd"),
        isAvailable: d.isAvailable,
        reason: d.unavailableReason,
      }))
    );

    setSubscriptionDays(days);
    updateTotalPrice(totalDaysNeeded);
  };

  const handleDateSelect = (date) => {
    const selectedDate = startOfDay(new Date(date));

    if (isDateAvailable(selectedDate, config)) {
      setSelectedStartDate(selectedDate);
      setExtraDays(0); // Reset extra days on date change
      generateSubscriptionDays(selectedDate, config, 0);
      setShowCalendar(false);
    }
  };

  const handleExtraDaysChange = (value) => {
    const maxExtra = getMaxExtraDays();
    const newExtraDays = Math.min(Math.max(0, value), maxExtra);
    setExtraDays(newExtraDays);
    generateSubscriptionDays(selectedStartDate, config, newExtraDays);
  };

  const updateTotalPrice = (days) => {
    const dailyRate = plan.selectedPackages.reduce((total, pkg) => {
      return total + (plan.packagePricing[pkg] || 0);
    }, 0);
    setTotalPrice(dailyRate * days);
  };

  const customDayStylesFunction = (date) => {
    const currentDate = startOfDay(new Date(date));

    if (isBefore(currentDate, minSelectableDate)) {
      return {
        textStyle: { color: "#ccc" },
        disabled: true,
      };
    }

    if (!isDateAvailable(currentDate, config)) {
      return {
        textStyle: { color: "#999" },
        disabled: true,
      };
    }

    return {};
  };
  const handleContinue = () => {
    if (!selectedTimeSlot || !selectedStartDate || !actualStartDate) return;
    console.log(
      "Debug - Actual Start Date:",
      format(actualStartDate, "yyyy-MM-dd")
    );
    console.log(
      "Debug - All subscription days before filter:",
      subscriptionDays.map((d) => ({
        date: format(d.date, "yyyy-MM-dd"),
        isAvailable: d.isAvailable,
        reason: d.unavailableReason,
      }))
    );

    // Filter subscription days starting from actual start date
    const validSubscriptionDays = subscriptionDays
      .filter((day) => {
        const dayDate = startOfDay(day.date);
        // Change from !isBefore to isAfter or equal
        const shouldInclude =
          isAfter(dayDate, actualStartDate) ||
          format(dayDate, "yyyy-MM-dd") ===
            format(actualStartDate, "yyyy-MM-dd");
        console.log(
          "Debug - Checking date:",
          format(dayDate, "yyyy-MM-dd"),
          "Include?:",
          shouldInclude,
          "Comparing with actualStart:",
          format(actualStartDate, "yyyy-MM-dd")
        );
        return shouldInclude;
      })
      .map((day) => ({
        date: format(day.date, "yyyy-MM-dd"),
        isAvailable: day.isAvailable,
        unavailableReason: day.unavailableReason,
        isSkipped: false,
        skippedAt: null,
        isExtensionDay: false,
        originalSkippedDate: null,
      }));
    console.log(
      "Debug - Valid subscription days after filter:",
      validSubscriptionDays.map((d) => ({
        date: format(d.date, "yyyy-MM-dd"),
        isAvailable: d.isAvailable,
        reason: d.unavailableReason,
      }))
    );

    // Get end date from filtered subscription days
    const endDate =
      validSubscriptionDays[validSubscriptionDays.length - 1].date;

    // Calculate daily rate (keeping existing logic)
    const dailyRate = plan.selectedPackages.reduce((total, pkg) => {
      return total + (plan.packagePricing[pkg] || 0);
    }, 0);

    const paymentData = {
      subscriptionData: {
        // Plan info from previous screens
        id: plan.id,
        name: plan.name,
        selectedPackages: plan.selectedPackages,
        packagePricing: plan.packagePricing,
        currency: plan.currency,
        durationType: plan.durationType,
        minDays: plan.minDays,

        // Dates and delivery - Now using actualStartDate
        startDate: format(actualStartDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        deliveryTime: selectedTimeSlot,

        // Days calculation
        totalDays: durationData.minDays + extraDays,
        availableDaysCount: validSubscriptionDays.filter(
          (day) => day.isAvailable
        ).length,
        subscriptionDays: validSubscriptionDays,
        skippedDays: validSubscriptionDays.filter((day) => !day.isAvailable),

        // Price details
        dailyRate: dailyRate,
        totalPrice: totalPrice,

        // Additional plan settings
        extraDaysAdded: extraDays,
      },
    };

    console.log("Navigating to Payment with:", paymentData);
    navigation.navigate("Payment", paymentData);
  };

  if (loading || !config) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Details</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPackages}>
              {plan.selectedPackages.join(" & ")}
            </Text>
          </View>

          {/* Start Date Selection */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Start Date</Text>
              <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => setShowCalendar(!showCalendar)}
              >
                <Ionicons name="calendar" size={24} color="#DC2626" />
                <Text style={styles.calendarButtonText}>
                  {format(selectedStartDate, "dd MMM yyyy")}
                </Text>
              </TouchableOpacity>
            </View>

            <View></View>

            {showCalendar && (
              <View style={styles.calendarContainer}>
                <CalendarPicker
                  onDateChange={handleDateSelect}
                  minDate={minSelectableDate}
                  selectedStartDate={selectedStartDate}
                  customDatesStyles={customDayStylesFunction}
                  selectedDayColor="#DC2626"
                  selectedDayTextColor="#FFFFFF"
                  todayBackgroundColor="transparent"
                  restrictMonthNavigation
                />
              </View>
            )}
          </View>

          {/* Subscription Days */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Subscription Days</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.daysScroll}
            >
              <View style={styles.daysContainer}>
                {subscriptionDays.map((day, index) => (
                  <View key={index} style={styles.dayColumn}>
                    <View
                      style={[
                        styles.dayCircle,
                        !day.isAvailable && styles.unavailableDayCircle,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          !day.isAvailable && styles.unavailableDayText,
                        ]}
                      >
                        {day.displayDate}
                      </Text>
                      <Text
                        style={[
                          styles.dayMonth,
                          !day.isAvailable && styles.unavailableDayText,
                        ]}
                      >
                        {day.displayMonth}
                      </Text>
                    </View>
                    {!day.isAvailable && (
                      <Text style={styles.reasonText}>
                        {day.unavailableReason}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Extra Days */}
          {/* Extra Days */}
          {getMaxExtraDays() > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Extra Days</Text>
              <View style={styles.extraDaysControl}>
                <TouchableOpacity
                  style={styles.extraDayButton}
                  onPress={() => handleExtraDaysChange(extraDays - 1)}
                  disabled={extraDays === 0}
                >
                  <Ionicons
                    name="remove"
                    size={24}
                    color={extraDays === 0 ? "#999" : "#DC2626"}
                  />
                </TouchableOpacity>
                <View style={styles.extraDaysInfo}>
                  <Text style={styles.extraDaysCount}>{extraDays}</Text>
                  <Text style={styles.maxDaysText}>
                    Max: {getMaxExtraDays()} days
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.extraDayButton}
                  onPress={() => handleExtraDaysChange(extraDays + 1)}
                  disabled={extraDays === getMaxExtraDays()}
                >
                  <Ionicons
                    name="add"
                    size={24}
                    color={extraDays === getMaxExtraDays() ? "#999" : "#DC2626"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Delivery Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Delivery Time</Text>
            <View style={styles.timeSlots}>
              {config.deliveryTimeSlots
                ?.filter((slot) => slot.isActive)
                .map((slot) => (
                  <TouchableOpacity
                    key={slot._id}
                    style={[
                      styles.timeSlot,
                      selectedTimeSlot === slot && styles.selectedTimeSlot,
                    ]}
                    onPress={() => setSelectedTimeSlot(slot)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedTimeSlot === slot &&
                          styles.selectedTimeSlotText,
                      ]}
                    >
                      {slot.fromTime} - {slot.toTime}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Start Date:</Text>
              <Text style={styles.summaryValue}>
                {format(actualStartDate, "dd MMM yyyy")}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Days:</Text>
              <Text style={styles.summaryValue}>
                {durationData.minDays + extraDays} days
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Price:</Text>
              <Text style={styles.summaryValue}>
                {totalPrice} {plan.currency}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedTimeSlot || !selectedStartDate) &&
                styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedTimeSlot || !selectedStartDate}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  planInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  planName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  planPackages: {
    fontSize: 15,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  calendarButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },

  // Subscription Days Styles
  daysScroll: {
    marginVertical: 10,

    width: "100%",
  },
  daysContainer: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  dayColumn: {
    width: DAY_ITEM_WIDTH,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "flex-start",
    height: 100, // Fixed height for consistency
  },
  dayCircle: {
    width: DAY_ITEM_WIDTH,
    height: DAY_ITEM_WIDTH,
    borderRadius: DAY_ITEM_WIDTH / 2,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 8,
    color: "#ff4444",
    textAlign: "center",
    marginTop: 2,
    width: DAY_ITEM_WIDTH + 8,
    height: 20,
  },
  unavailableDayCircle: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#eee",
  },

  dayNumber: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  dayMonth: {
    fontSize: 9,
    color: "#fff",
    marginTop: 1,
  },

  unavailableDayText: {
    color: "#999",
  },
  reasonText: {
    fontSize: 8,
    color: "#ff4444",
    textAlign: "center",
    marginTop: 2,
    maxWidth: DAY_ITEM_WIDTH + 8,
    height: 20,
    lineHeight: 10,
  },

  // Extra Days Control
  extraDaysControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  extraDayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  extraDaysInfo: {
    alignItems: "center",
    marginHorizontal: 20,
  },
  extraDaysCount: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },

  maxDaysText: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },

  // Time Slots
  timeSlots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },

  timeSlot: {
    flex: 1,
    minWidth: "45%",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedTimeSlot: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  selectedTimeSlotText: {
    color: "#fff",
  },

  // Summary
  summary: {
    backgroundColor: "#f8f8f8",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#666",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  // Continue Button
  continueButton: {
    backgroundColor: "#DC2626",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
export default SubscriptionDays;
