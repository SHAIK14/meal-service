import React, { useRef, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
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
import { SafeAreaView } from "react-native-safe-area-context";
import AdsCarousel from "./components/AdsCarousel";

const { width, height } = Dimensions.get("window");
const truncateDescription = (description) => {
  const words = description.split(" ");
  if (words.length > 5) {
    return words.slice(0, 5).join(" ") + "...";
  }
  return description;
};
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
  const [refreshing, setRefreshing] = useState(false);
  // Hide navigation bar when modal opens, show when modal closes

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate an API call or reload logic
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  useEffect(() => {
    if (selectedPlan) {
      navigation.setOptions({ headerShown: false });
    } else {
      navigation.setOptions({ headerShown: true });
    }

    return () => {
      // Clean up the effect when component unmounts
      navigation.setOptions({ headerShown: true });
    };
  }, [selectedPlan, navigation]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getAllPlans();
      console.log("fetched Data:", data);
      if (data.data) {
        const subscriptionPlans = data.data.filter(
          (plan) => plan.service === "subscription"
        );
        // Log filtered subscription plans to check the results
        console.log("Filtered Subscription Plans:", subscriptionPlans);
        setPlans(subscriptionPlans);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Function to get the starting price (lowest price from the package) and multiply by 5
  const getStartingPriceFor5Days = (pricing) => {
    // Find the minimum price from the available meals (breakfast, lunch, dinner)
    const prices = Object.values(pricing); // Convert pricing object to array of prices
    const minPrice = Math.min(...prices); // Get the minimum price
    return minPrice * 5; // Multiply by 5 for a 5-day plan
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

    const pricingObject = {};
    selectedPackages.forEach((pkg) => {
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
        packagePricing: pricingObject,
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
        <ActivityIndicator size="large" color="#DC2626" />
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.planWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.AdContainer}>
          <AdsCarousel />
        </View>
        <View styles={styles.plansContainer}>
          <View style={styles.PlanTitleContainer}>
            <Text style={styles.PlansTitle}>Select Your Plans</Text>
          </View>

          {plans.map((plan) => (
            <TouchableOpacity
              key={plan._id}
              style={styles.planCard}
              onPress={() => handlePlanSelect(plan)}
            >
              {/* Image on the top */}
              <Image source={{ uri: plan.image }} style={styles.planImage} />

              {/* Plan details below the image */}
              <View style={styles.planTextContainer}>
                {/* Left side: Plan name and description */}
                <View style={{ flex: 1 }}>
                  {/* Plan name (big size) */}
                  <Text style={styles.planName}>{plan.nameEnglish}</Text>

                  {/* Short description (smaller size, truncated) */}
                  <Text style={styles.planDescription}>
                    {truncateDescription(plan.descriptionEnglish)}
                  </Text>
                </View>

                {/* Right side: Price */}
                <View style={styles.priceContainer}>
                  {/* Starting price (big size and bold) */}
                  <Text style={styles.startingFrom}>Starting from: </Text>
                  <Text style={styles.price}>
                    {getStartingPriceFor5Days(plan.packagePricing)}{" "}
                    <Text style={styles.sar}>SAR</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.selectButtonContainerCard}>
                <TouchableOpacity
                  style={[styles.selectButton]}
                  onPress={handleNavigateToUserPlanDuration}
                  disabled={!canProceed()}
                >
                  <Text style={styles.selectButtonText}>Select Plan</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
                zIndex: 10,
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
                {/* Full Description */}
                <View style={styles.modalDescriptionWrapper}>
                  <Text style={styles.modalDescription}>
                    {selectedPlan.descriptionEnglish}
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
                      showsHorizontalScrollIndicator={true}
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
                          <Text
                            style={[
                              styles.dayNameText,
                              format(selectedDate, "yyyy-MM-dd") ===
                                dateInfo.fullDate && styles.activeDayText, // Make day text white when active
                            ]}
                          >
                            {dateInfo.displayDay}
                          </Text>
                          <Text
                            style={[
                              styles.dayText,
                              format(selectedDate, "yyyy-MM-dd") ===
                                dateInfo.fullDate && styles.activeDayText, // Make date text white when active
                            ]}
                          >
                            {dateInfo.displayDate}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={true}
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
                            selectedPackages.includes(pkg) ? "#fff" : "#DC2626"
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
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  AdContainer: {
    marginBottom: 10,
    backgroundColor: "white",
    width: "100%",
  },

  AdText: {
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 20,
    fontSize: 20,
    textAlign: "center",
    fontWeight: 600,
    color: "black",
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
  },

  PlanTitleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  PlansTitle: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: 600,
    color: "black",
  },

  planWrapper: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  planCard: {
    overflow: "hidden",
    backgroundColor: "#f7f7f7",
    borderRadius: 30,
    marginBottom: 20,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 10,

    elevation: 10,
  },

  planImage: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  planTextContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },

  planDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
    maxWidth: 180,
  },

  startingFrom: {
    fontSize: 12,

    color: "#333",
  },

  priceContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
    flexShrink: 1,
  },

  price: {
    fontSize: 26, // Make the price font a bit smaller
    fontWeight: "900",
    color: "#DC2626", // Red color for price to make it stand out
  },

  sar: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#333",
  },

  selectButtonContainerCard: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
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
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    height: height * 0.7,
    zIndex: 10,
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
    fontSize: 25,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },

  modalDescriptionWrapper: {
    marginHorizontal: 20,
    textAlign: "center",
    alignItems: "center",
  },

  modalDescription: {
    textAlign: "center",
    marginBottom: 5,
  },

  modalImage: {
    width: "100%",
    backgroundColor: "red",
  },

  packageTabsContainer: {
    flexDirection: "row",
    height: "auto",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  packageTab: {
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    width: 100,
    justifyContent: "center",
    height: 40,
  },

  activePackageTab: {
    backgroundColor: "#DC2626",
  },

  packageTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },

  activePackageTabText: {
    color: "#fff",
  },

  daysWrapper: {
    marginBottom: 15,
    height: "auto",
    paddingVertical: 15,
    paddingHorizontal: 5,
    backgroundColor: "#F2F2F2F2",
  },

  daysContent: {
    paddingHorizontal: 5,
  },

  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    // backgroundColor: "#f0f0f0",
    marginHorizontal: 4,
    minWidth: 55,
    alignItems: "center",
  },

  activeDayButton: {
    backgroundColor: "#DC2626",
    color: "white",
  },

  todayButton: {
    borderWidth: 1,
    borderColor: "#DC2626",
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
    color: "white",
  },

  itemsWrapper: {
    marginBottom: 20,
    display: "flex",
    marginTop: 20,
    paddingVertical: 20,
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
    borderTopColor: "#eee",
  },

  packageSelectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginBottom: 12,
  },

  packageButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
  },

  packageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#eee",
    minWidth: 100,
  },

  packageButtonSelected: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
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
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 20,
  },

  selectButton: {
    backgroundColor: "#DC2626",
    borderRadius: 25,
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
