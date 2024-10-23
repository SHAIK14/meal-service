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

const UserPlan = () => {
  const navigation = useNavigation();
  const [plans, setPlans] = useState([]);
  const [weekMenu, setWeekMenu] = useState({});
  const [planItems, setPlanItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation and UI states
  const scrollX = useRef(new Animated.Value(0)).current;
  const modalAnimation = useRef(new Animated.Value(height * 0.4)).current;
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [modalHeight, setModalHeight] = useState(height * 0.6);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Ads data (keep this if you still want to show ads)
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

    // Ad rotation interval
    const interval = setInterval(() => {
      scrollX.setValue((prev) => (prev + width) % (width * ads.length));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getAllPlans();
      setPlans(data.data);
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
    setSelectedCategory(plan.package[0]); // Select first package by default
    setSelectedDayIndex(0);

    // Fetch menu data if not already fetched
    if (!weekMenu[plan._id]) {
      const menuData = await fetchWeekMenu(plan._id);
      if (menuData) {
        await fetchPlanItems(plan._id, menuData);
      }
    }

    // Animate modal
    Animated.spring(modalAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.spring(modalAnimation, {
      toValue: height,
      useNativeDriver: true,
    }).start(() => {
      setSelectedPlan(null);
      setSelectedCategory(null);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          closeModal();
        }
      },
    })
  ).current;

  const getFilteredItems = () => {
    if (!selectedPlan || !weekMenu[selectedPlan._id]) return [];

    const dayMenu = weekMenu[selectedPlan._id].weekMenu[selectedDayIndex + 1];
    if (!dayMenu || !dayMenu[selectedCategory]) return [];

    return dayMenu[selectedCategory]
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
          <Text style={styles.buttonText}>Add Meal Partner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={40} color="#000" />
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
            style={styles.scrollView}
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
            <Text style={styles.planName}>{plan.nameEnglish}</Text>
            <Text style={styles.planDescription}>
              {plan.descriptionEnglish}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedPlan && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                height: modalHeight,
                transform: [{ translateY: modalAnimation }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <ScrollView>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {selectedPlan.nameEnglish}
                </Text>
                <Text style={styles.modalDescription}>
                  {selectedPlan.descriptionEnglish}
                </Text>

                <View style={styles.categoryContainer}>
                  {selectedPlan.package.map((pkg) => (
                    <TouchableOpacity
                      key={pkg}
                      style={[
                        styles.categoryButton,
                        selectedCategory === pkg && styles.selectedCategory,
                      ]}
                      onPress={() => setSelectedCategory(pkg)}
                    >
                      <Text style={styles.categoryText}>
                        {pkg.charAt(0).toUpperCase() +
                          pkg.slice(1).replace("_", " ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.daysWrapper}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                            selectedDayIndex === i
                              ? styles.activeDayText
                              : styles.inactiveDayText,
                          ]}
                        >
                          Day {i + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.itemsWrapper}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {getFilteredItems().map((item) => (
                      <View key={item._id} style={styles.itemCard}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.itemImage}
                        />
                        <Text style={styles.itemName}>{item.nameEnglish}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.radioContainer}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      selectedMeal === "One Meal" && styles.activeButton,
                    ]}
                    onPress={() => setSelectedMeal("One Meal")}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        selectedMeal === "One Meal" && styles.activeButtonText,
                      ]}
                    >
                      One Meal
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      selectedMeal === "Full Day Meal" && styles.activeButton,
                    ]}
                    onPress={() => setSelectedMeal("Full Day Meal")}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        selectedMeal === "Full Day Meal" &&
                          styles.activeButtonText,
                      ]}
                    >
                      Full Day Meal
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() =>
                    navigation.navigate("UserPlanDuration", {
                      plan: {
                        id: selectedPlan._id,
                        name: selectedPlan.nameEnglish,
                        description: selectedPlan.descriptionEnglish,
                        duration: selectedPlan.duration,
                        totalPrice: selectedPlan.totalPrice,
                        package: selectedPlan.package,
                      },
                    })
                  }
                >
                  <Text style={styles.selectButtonText}>Select This Plan</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#C5A85F",
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  profileIcon: {
    padding: 10,
  },
  // Carousel
  carousel: {
    height: height * 0.2,
    alignSelf: "center",
  },
  scrollView: {
    flexGrow: 1,
  },
  adContainer: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
  },
  adImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
    resizeMode: "cover",
  },
  // Plan List
  planWrapper: {
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginVertical: 10,
    marginHorizontal: 5,
    padding: 10,
    width: width * 0.9,
    elevation: 3,
  },
  planImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  planDescription: {
    fontSize: 14,
    color: "#666",
  },
  // Modal
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: width,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  // Categories
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  categoryButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  selectedCategory: {
    backgroundColor: "#C5A85F",
  },
  categoryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // Days Navigation
  daysWrapper: {
    height: 60,
  },
  daysScroll: {
    marginBottom: 5,
    paddingVertical: 10,
    height: 10,
  },
  dayButton: {
    borderRadius: 5,
    padding: 10,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  dayText: {
    fontWeight: "bold",
  },
  activeDayText: {
    color: "#C5A85F",
    fontWeight: "bold",
  },
  inactiveDayText: {
    color: "#666",
    fontWeight: "normal",
  },
  // Items Display
  itemsWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  itemsContainer: {
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  itemCard: {
    borderRadius: 10,
    marginRight: 10,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemName: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
  // Radio Buttons
  radioContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  radioButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#C5A85F",
  },
  radioText: {
    color: "#000",
    fontWeight: "bold",
  },
  activeButtonText: {
    color: "white",
  },
  // Select Button
  selectButton: {
    backgroundColor: "#C5A85F",
    padding: 15,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  selectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserPlan;
