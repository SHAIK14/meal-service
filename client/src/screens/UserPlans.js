import React, { useRef, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, addDays } from "date-fns";
import {
  getAllPlans,
  getPlanById,
  getPlanWeeklyMenu,
  getItemsBatch,
} from "../utils/api";

const { width, height } = Dimensions.get("window");

const getWeekDates = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    return {
      date,
      displayDate: format(date, "d"),
      displayDay: format(date, "EEE"),
      fullDate: format(date, "yyyy-MM-dd"),
      isToday: i === 0,
    };
  });
};

const UserPlan = () => {
  const navigation = useNavigation();
  const [plans, setPlans] = useState([]);
  const [weekMenu, setWeekMenu] = useState({});
  const [planItems, setPlanItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const modalAnimation = useRef(new Animated.Value(height * 0.4)).current;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState(getWeekDates());
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [selectedPackages, setSelectedPackages] = useState([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getAllPlans();
      if (data.data) {
        const subscriptionPlans = data.data.filter(
          (plan) => plan.service === "subscription"
        );
        setPlans(subscriptionPlans);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchWeekMenu = async (planId) => {
    try {
      const data = await getPlanWeeklyMenu(planId);
      setWeekMenu((prev) => ({ ...prev, [planId]: data.data }));
      return data.data;
    } catch (err) {
      console.error("Error fetching week menu:", err);
      return null;
    }
  };

  const fetchPlanItems = async (planId, weekMenuData) => {
    try {
      if (!weekMenuData?.weekMenu) return;

      const itemIds = new Set();
      Object.values(weekMenuData.weekMenu).forEach((dayData) => {
        Object.values(dayData).forEach((packageItems) => {
          packageItems.forEach((itemId) => itemIds.add(itemId));
        });
      });

      const itemIdsArray = Array.from(itemIds);
      if (itemIdsArray.length === 0) {
        setPlanItems((prev) => ({ ...prev, [planId]: [] }));
        return;
      }

      const data = await getItemsBatch(itemIdsArray);
      if (data.success && Array.isArray(data.data)) {
        setPlanItems((prev) => ({ ...prev, [planId]: data.data }));
      }
    } catch (err) {
      console.error("Error fetching plan items:", err);
      setPlanItems((prev) => ({ ...prev, [planId]: [] }));
    }
  };

  // In UserPlan component
  const handleNavigateToUserPlanDuration = () => {
    if (!canProceed()) return;

    console.log("Selected Plan Raw:", selectedPlan);

    // Convert Map to regular object for selected packages
    const pricingObject = {};
    selectedPackages.forEach((pkg) => {
      // Handle both Map and regular object cases
      const price =
        selectedPlan.packagePricing instanceof Map
          ? selectedPlan.packagePricing.get(pkg)
          : selectedPlan.packagePricing[pkg];

      pricingObject[pkg] = price;
    });

    console.log("Pricing Object Created:", pricingObject);

    const navigationData = {
      plan: {
        id: selectedPlan._id,
        name: selectedPlan.nameEnglish,
        selectedPackages,
        packagePricing: pricingObject, // Send the converted pricing object
        currency: selectedPlan.currency || "SAR",
      },
    };

    console.log("Navigating with data:", navigationData);
    navigation.navigate("UserPlanDuration", navigationData);
  };
  // Remove validatePlanData function - we don't need it
  const getFilteredItems = () => {
    if (!selectedPlan || !weekMenu[selectedPlan._id] || !viewingCategory)
      return [];

    const selectedDayName = format(selectedDate, "EEEE").toLowerCase();
    const dayMenu = weekMenu[selectedPlan._id]?.weekMenu?.[selectedDayName];

    if (!dayMenu || !dayMenu[viewingCategory]) return [];

    return dayMenu[viewingCategory]
      .map((itemId) =>
        planItems[selectedPlan._id]?.find((item) => item._id === itemId)
      )
      .filter(Boolean);
  };

  const handlePlanSelect = async (plan) => {
    console.log("Plan Selected:", {
      id: plan._id,
      name: plan.nameEnglish,
      packages: plan.package,
      pricing:
        plan.packagePricing instanceof Map
          ? Object.fromEntries(plan.packagePricing)
          : plan.packagePricing,
    });

    setSelectedPlan(plan);
    setViewingCategory(plan.package[0]);
    setSelectedPackages([]);
    setSelectedDate(new Date());

    if (!weekMenu[plan._id]) {
      const menuData = await fetchWeekMenu(plan._id);
      if (menuData) {
        await fetchPlanItems(plan._id, menuData);
      }
    }

    Animated.spring(modalAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };
  const handlePackageToggle = (pkg) => {
    setSelectedPackages((prev) => {
      const newPackages = prev.includes(pkg)
        ? prev.filter((p) => p !== pkg)
        : [...prev, pkg];

      console.log("Packages Selected:", newPackages);
      return newPackages;
    });
  };

  const canProceed = () => {
    return selectedPackages.length > 0;
  };

  const closeModal = () => {
    Animated.spring(modalAnimation, {
      toValue: height,
      useNativeDriver: true,
    }).start(() => {
      setSelectedPlan(null);
      setViewingCategory(null);
      setSelectedPackages([]);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeModal();
        } else {
          Animated.spring(modalAnimation, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          modalAnimation.setValue(gestureState.dy);
        }
      },
    })
  ).current;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A85F" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("AddPartner")}
        >
          <Text style={styles.buttonText}>Add Partner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-circle-outline" size={32} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.planWrapper}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan._id}
            style={styles.planCard}
            onPress={() => handlePlanSelect(plan)}
          >
            <Image source={{ uri: plan.image }} style={styles.planImage} />
            <View style={styles.planTextContainer}>
              <Text style={styles.planName}>{plan.nameEnglish}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedPlan && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: modalAnimation }],
              },
            ]}
          >
            <View {...panResponder.panHandlers} style={styles.modalHandle}>
              <View style={styles.handleBar} />
            </View>

            <ScrollView
              style={styles.modalScroll}
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalTitleWrapper}>
                  <Text style={styles.modalTitle}>
                    {selectedPlan.nameEnglish}
                  </Text>
                </View>

                {/* Package Tabs */}
                <View style={styles.packageTabsContainer}>
                  {selectedPlan.package.map((pkg) => (
                    <TouchableOpacity
                      key={pkg}
                      style={[
                        styles.packageTab,
                        viewingCategory === pkg && styles.activePackageTab,
                      ]}
                      onPress={() => setViewingCategory(pkg)}
                    >
                      <Text
                        style={[
                          styles.packageTabText,
                          viewingCategory === pkg &&
                            styles.activePackageTabText,
                        ]}
                      >
                        {pkg.charAt(0).toUpperCase() + pkg.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Calendar and Items Section */}
                {viewingCategory && (
                  <>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.daysWrapper}
                      contentContainerStyle={styles.daysContent}
                    >
                      {weekDates.map((dateInfo, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dayButton,
                            format(selectedDate, "yyyy-MM-dd") ===
                              dateInfo.fullDate && styles.activeDayButton,
                            dateInfo.isToday && styles.todayButton,
                          ]}
                          onPress={() =>
                            setSelectedDate(new Date(dateInfo.fullDate))
                          }
                        >
                          <Text style={styles.dayNameText}>
                            {dateInfo.displayDay}
                          </Text>
                          <Text
                            style={[
                              styles.dayText,
                              format(selectedDate, "yyyy-MM-dd") ===
                                dateInfo.fullDate && styles.activeDayText,
                            ]}
                          >
                            {dateInfo.displayDate}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.itemsWrapper}
                      contentContainerStyle={styles.itemsContent}
                    >
                      {getFilteredItems().map((item) => (
                        <View key={item._id} style={styles.itemContainer}>
                          <TouchableOpacity
                            style={styles.itemCard}
                            onPress={() =>
                              navigation.navigate("ItemDetails", { item })
                            }
                          >
                            <Image
                              source={{ uri: item.image }}
                              style={styles.itemImage}
                            />
                          </TouchableOpacity>
                          <Text numberOfLines={2} style={styles.itemName}>
                            {item.nameEnglish}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </>
                )}

                {/* Package Selection */}
                <View style={styles.packageSelectionContainer}>
                  <Text style={styles.packageSelectionTitle}>
                    Select your packages:
                  </Text>
                  <View style={styles.packageButtonsContainer}>
                    {selectedPlan.package.map((pkg) => (
                      <TouchableOpacity
                        key={pkg}
                        style={[
                          styles.packageButton,
                          selectedPackages.includes(pkg) &&
                            styles.packageButtonSelected,
                        ]}
                        onPress={() => handlePackageToggle(pkg)}
                      >
                        <Ionicons
                          name={
                            selectedPackages.includes(pkg)
                              ? "checkmark-circle"
                              : "restaurant-outline"
                          }
                          size={18}
                          color={
                            selectedPackages.includes(pkg) ? "#fff" : "#C5A85F"
                          }
                        />
                        <Text
                          style={[
                            styles.packageButtonText,
                            selectedPackages.includes(pkg) &&
                              styles.packageButtonTextSelected,
                          ]}
                        >
                          {pkg.charAt(0).toUpperCase() + pkg.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Select Button */}
            <View style={styles.selectButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  !canProceed() && styles.disabledButton,
                ]}
                onPress={handleNavigateToUserPlanDuration}
                disabled={!canProceed()}
              >
                <Text style={styles.selectButtonText}>
                  Select Plan ({selectedPackages.length} packages)
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    color: "red",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#C5A85F",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  profileIcon: {
    padding: 4,
  },
  planWrapper: {
    padding: 12,
    paddingBottom: 24,
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: "row",
    marginVertical: 6,
    padding: 10,
    width: "100%",
    elevation: 2,
  },
  planImage: {
    width: 56,
    height: 56,
    borderRadius: 6,
  },
  planTextContainer: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 10,
  },
  planName: {
    fontSize: 15,
    fontWeight: "600",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.8,
  },
  modalHandle: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  handleBar: {
    width: 32,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
  },
  modalScroll: {
    flex: 1,
    marginBottom: 60,
  },
  modalContent: {
    padding: 0,
  },
  modalTitleWrapper: {
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  packageTabsContainer: {
    flexDirection: "row",
    height: 32,
    justifyContent: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  packageTab: {
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    marginHorizontal: 5,
    paddingHorizontal: 16,
    justifyContent: "center",
    height: 32,
  },
  activePackageTab: {
    backgroundColor: "#C5A85F",
  },
  packageTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  activePackageTabText: {
    color: "#fff",
  },
  daysWrapper: {
    marginBottom: 15,
    marginHorizontal: 15,
  },
  daysContent: {
    paddingHorizontal: 5,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 4,
    minWidth: 55,
    alignItems: "center",
  },
  activeDayButton: {
    backgroundColor: "#C5A85F",
  },
  todayButton: {
    borderWidth: 1,
    borderColor: "#C5A85F",
  },
  dayNameText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    fontWeight: "500",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeDayText: {
    color: "#fff",
  },
  itemsWrapper: {
    marginBottom: 20,
  },
  itemsContent: {
    paddingHorizontal: 15,
  },
  itemContainer: {
    width: 120,
    marginRight: 10,
  },
  itemCard: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 6,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  itemName: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    color: "#333",
    height: 32,
  },
  packageSelectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 10,
  },
  packageSelectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 12,
  },
  packageButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  packageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    minWidth: 100,
  },
  packageButtonSelected: {
    backgroundColor: "#C5A85F",
    borderColor: "#C5A85F",
  },
  packageButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    marginLeft: 6,
  },
  packageButtonTextSelected: {
    color: "#fff",
  },
  selectButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  selectButton: {
    backgroundColor: "#C5A85F",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
    opacity: 0.7,
  },
});

export default UserPlan;
