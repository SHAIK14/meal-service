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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getAllPlans,
  getPlanById,
  getPlanWeeklyMenu,
  getItemsBatch,
} from "../utils/api";

const { width, height } = Dimensions.get("window");

const calculatePackagePrice = (plan, packageName) => {
  if (!plan?.packagePricing?.[packageName]) {
    return {
      originalPrice: 0,
      discountedPrice: 0,
      discountPercent: 0,
      hasDiscount: false,
    };
  }

  const pricing = plan.packagePricing[packageName];
  const originalPrice = pricing.totalPrice || 0;
  const discountPercent = pricing.discountPercentage || 0;
  const discountedPrice = pricing.finalPrice || originalPrice;
  const savings = originalPrice - discountedPrice;

  return {
    originalPrice,
    discountedPrice,
    discountPercent,
    hasDiscount: discountPercent > 0,
    savings,
  };
};

const UserPlan = () => {
  const navigation = useNavigation();
  const [plans, setPlans] = useState([]);
  const [weekMenu, setWeekMenu] = useState({});
  const [planItems, setPlanItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const scrollX = useRef(new Animated.Value(0)).current;
  const modalAnimation = useRef(new Animated.Value(height * 0.4)).current;
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedMealType, setSelectedMealType] = useState("One Meal");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [selectedPackages, setSelectedPackages] = useState([]);

  const ads = [
    {
      id: 1,
      image: {
        uri: "https://parsonsnose.co.uk/dyn/bMDmN5SiQHNuq56KFMOMH6UYufV1XxRNZqiJxs5hLjU~/crop/width:1600-fit/uploads/components/newsarticle/AdobeStock_654390147-6630d5df12f56.jpg",
      },
    },
  ];

  useEffect(() => {
    fetchPlans();
    const interval = setInterval(() => {
      scrollX.setValue((prev) => (prev + width) % (width * ads.length));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Replace the existing fetchPlans function with this:
  const fetchPlans = async () => {
    try {
      const data = await getAllPlans();
      if (data.data) {
        // Filter plans to only show subscription service plans
        const subscriptionPlans = data.data.filter(
          (plan) => plan.service === "subscription"
        );
        setPlans(subscriptionPlans);
      }
      setLoading(false);
    } catch (err) {
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

  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);
    setSelectedMealType("One Meal");
    setViewingCategory(plan.package[0]);
    setSelectedPackages([plan.package[0]]);
    setSelectedDayIndex(0);

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

  const handleMealTypeSelect = (type) => {
    setSelectedMealType(type);
    if (type === "Full Day Meal") {
      setSelectedPackages(selectedPlan.package);
    } else if (type === "One Meal") {
      setSelectedPackages([selectedPlan.package[0]]);
    } else {
      setSelectedPackages([]);
    }
  };

  const handlePackageToggle = (pkg) => {
    if (selectedMealType === "Full Day Meal") return;

    if (selectedMealType === "One Meal") {
      setSelectedPackages([pkg]);
    } else if (selectedMealType === "Combo Meal") {
      if (selectedPackages.includes(pkg)) {
        setSelectedPackages(selectedPackages.filter((p) => p !== pkg));
      } else if (selectedPackages.length < 2) {
        setSelectedPackages([...selectedPackages, pkg]);
      }
    }
  };

  const isPackageSelected = (pkg) => {
    return selectedPackages.includes(pkg);
  };

  const handleNavigateToUserPlanDuration = () => {
    if (!selectedPlan || !selectedMealType || selectedPackages.length === 0) {
      return;
    }

    let mealPlanType = "";
    if (selectedMealType === "Full Day Meal") {
      mealPlanType = "Full Day: " + selectedPlan.package.join(", ");
    } else if (selectedMealType === "Combo Meal") {
      mealPlanType = "Combo: " + selectedPackages.join(", ");
    } else {
      mealPlanType = "One Meal: " + selectedPackages[0];
    }

    // Calculate detailed pricing information for each selected package
    const packageDetails = selectedPackages.map((pkg) => {
      const pricing = calculatePackagePrice(selectedPlan, pkg);
      return {
        package: pkg,
        originalPrice: pricing.originalPrice,
        discountedPrice: pricing.discountedPrice,
        discountPercent: pricing.discountPercent,
        hasDiscount: pricing.hasDiscount,
        savings: pricing.savings,
      };
    });

    // Calculate total pricing
    const totalPricing = packageDetails.reduce(
      (acc, pkg) => ({
        original: acc.original + pkg.originalPrice,
        final: acc.final + pkg.discountedPrice,
        savings: acc.savings + pkg.savings,
      }),
      { original: 0, final: 0, savings: 0 }
    );

    navigation.navigate("UserPlanDuration", {
      plan: {
        id: selectedPlan._id,
        name: selectedPlan.nameEnglish,
        duration: selectedPlan.duration,
        pricing: totalPricing,
        packageDetails: packageDetails, // Added package-specific details
        package: selectedPackages,
        mealPlanType: mealPlanType,
      },
    });
  };

  const closeModal = () => {
    Animated.spring(modalAnimation, {
      toValue: height,
      useNativeDriver: true,
    }).start(() => {
      setSelectedPlan(null);
      setViewingCategory(null);
      setSelectedMealType("One Meal");
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

  const getFilteredItems = () => {
    if (!selectedPlan || !weekMenu[selectedPlan._id] || !viewingCategory)
      return [];

    const dayMenu =
      weekMenu[selectedPlan._id]?.weekMenu?.[selectedDayIndex + 1];
    if (!dayMenu || !dayMenu[viewingCategory]) return [];

    return dayMenu[viewingCategory]
      .map((itemId) =>
        planItems[selectedPlan._id]?.find((item) => item._id === itemId)
      )
      .filter(Boolean);
  };

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
        <TouchableOpacity style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={32} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.planWrapper}>
        <View style={styles.carousel}>
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
          >
            {ads.map((ad) => (
              <View key={ad.id} style={styles.adContainer}>
                <Image source={ad.image} style={styles.adImage} />
              </View>
            ))}
          </Animated.ScrollView>
        </View>

        {plans.map((plan) => (
          <TouchableOpacity
            key={plan._id}
            style={styles.planCard}
            onPress={() => handlePlanSelect(plan)}
          >
            <Image source={{ uri: plan.image }} style={styles.planImage} />
            <View style={styles.planTextContainer}>
              <Text style={styles.planName}>{plan.nameEnglish}</Text>
              <Text style={styles.planDescription}>
                {plan.descriptionEnglish}
              </Text>
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
                  <Text style={styles.modalDescription}>
                    This is Description is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s,
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

                {/* Days and Items */}
                {viewingCategory && (
                  <>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.daysWrapper}
                      contentContainerStyle={styles.daysContent}
                    >
                      {Array.from({ length: selectedPlan.duration }, (_, i) => (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.dayButton,
                            selectedDayIndex === i && styles.activeDayButton,
                          ]}
                          onPress={() => setSelectedDayIndex(i)}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              selectedDayIndex === i && styles.activeDayText, // Apply active text color here
                            ]}
                          >
                            Day {i + 1}
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
                        <TouchableOpacity
                          key={item._id} // Use TouchableOpacity for clickable item
                          style={styles.itemCard}
                          onPress={() =>
                            navigation.navigate("ItemDetails", { item })
                          } // Navigate to ItemDetails with item data
                        >
                          <Image
                            source={{ uri: item.image }}
                            style={styles.itemImage}
                          />
                          <Text style={styles.itemName}>
                            {item.nameEnglish}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}
              </View>

              {/* Meal Type Selection */}
              <View style={styles.mealTypeContainer}>
                <View style={styles.radioContainer}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      selectedMealType === "One Meal" && styles.activeButton,
                    ]}
                    onPress={() => handleMealTypeSelect("One Meal")}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        selectedMealType === "One Meal" && styles.activeText,
                      ]}
                    >
                      One Meal
                    </Text>
                  </TouchableOpacity>

                  {selectedPlan.package.length > 1 && (
                    <>
                      {selectedPlan.package.length > 2 && (
                        <TouchableOpacity
                          style={[
                            styles.radioButton,
                            selectedMealType === "Combo Meal" &&
                              styles.activeButton,
                          ]}
                          onPress={() => handleMealTypeSelect("Combo Meal")}
                        >
                          <Text
                            style={[
                              styles.radioText,
                              selectedMealType === "Combo Meal" &&
                                styles.activeText,
                            ]}
                          >
                            Combo
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.radioButton,
                          selectedMealType === "Full Day Meal" &&
                            styles.activeButton,
                        ]}
                        onPress={() => handleMealTypeSelect("Full Day Meal")}
                      >
                        <Text
                          style={[
                            styles.radioText,
                            selectedMealType === "Full Day Meal" &&
                              styles.activeText, // Update condition here
                          ]}
                        >
                          Full Day
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              {/* Package Selection */}
              <View style={styles.checkboxContainer}>
                {selectedPlan.package.map((pkg) => (
                  <TouchableOpacity
                    key={pkg}
                    style={styles.checkboxRow}
                    onPress={() => handlePackageToggle(pkg)}
                    disabled={selectedMealType === "Full Day Meal"}
                  >
                    <View style={styles.checkboxWrapper}>
                      <View
                        style={[
                          styles.checkbox,
                          isPackageSelected(pkg) && styles.checkboxChecked,
                        ]}
                      >
                        {isPackageSelected(pkg) && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        {pkg.charAt(0).toUpperCase() + pkg.slice(1)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Select Button */}
            <View style={styles.selectButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  (!selectedMealType || selectedPackages.length === 0) &&
                    styles.disabledButton,
                ]}
                onPress={handleNavigateToUserPlanDuration}
                disabled={!selectedMealType || selectedPackages.length === 0}
              >
                <Text style={styles.selectButtonText}>Select Plan</Text>
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
  carousel: {
    height: height * 0.15,
    alignSelf: "center",
    marginBottom: 12,
  },
  adContainer: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
  },
  adImage: {
    width: "92%",
    height: "90%",
    borderRadius: 10,
    resizeMode: "cover",
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
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 12,
    color: "#666",
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
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    height: height * 0.75,
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
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitleWrapper: {
    marginTop: 30,
    marginVertical: 10,
    textAlign: "Left",
    paddingHorizontal: 30,
  },
  modalDescription: {
    textAlign: "justify",
    color: "gray",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: "bold",
    textAlign: "Left",
  },
  mealTypeContainer: {
    marginBottom: 16,
    paddingHorizontal: 30,
  },
  radioContainer: {
    flexDirection: "row",
    height: 35,
    justifyContent: "space-evenly",
    marginVertical: 10,
  },
  radioButton: {
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    marginHorizontal: 10,
    paddingHorizontal: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#C5A85F",
    color: "white",
  },
  radioText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666",
  },
  activeButtonText: {
    color: "white",
    fontWeight: "600",
  },
  activeText: {
    color: "white",
    fontWeight: "600",
  },
  mealTypeDescription: {
    textAlign: "center",
    color: "#666",
    fontSize: 11,
    marginTop: 4,
  },
  packageTabsContainer: {
    flexDirection: "row",
    height: 35,
    justifyContent: "space-evenly",
    marginVertical: 10,
    marginBottom: 35,
  },
  packageTab: {
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    marginHorizontal: 15,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  activePackageTab: {
    backgroundColor: "#C5A85F",
  },
  packageTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  activePackageTabText: {
    color: "#fff",
  },
  checkboxContainer: {
    marginBottom: 12,
    flexDirection: "row",
    paddingHorizontal: 35,
    borderRadius: 8,
    paddingHorizontal: 30,
    justifyContent: "space-between",
    padding: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#C5A85F",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#C5A85F",
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#333",
    marginLeft: 8,
  },
  daysWrapper: {
    marginBottom: 24,

    marginHorizontal: 15,
  },
  daysContent: {
    alignItems: "center",
  },
  dayButton: {
    paddingVertical: 6,
    justifyContent: "center",
    paddingHorizontal: 12,
    marginRight: 6,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    minWidth: 65,
    minHeight: 65,
    alignItems: "center",
  },
  activeDayButton: {
    backgroundColor: "#C5A85F",
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
    marginBottom: 12,
    height: 180,
  },
  itemsContent: {
    paddingVertical: 10,
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  itemCard: {
    width: 200,
    marginRight: 10,
    borderRadius: 8,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
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
