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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getAllPlans,
  getPlanById,
  getPlanWeeklyMenu,
  getItemsBatch,
} from "../utils/api";

const { width, height } = Dimensions.get("window");

// Country codes array
const countryCodes = [
  { code: "+973", country: "Bahrain" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+971", country: "UAE" },
  { code: "+974", country: "Qatar" },
  { code: "+968", country: "Oman" },
  { code: "+965", country: "Kuwait" },
  { code: "+91", country: "India" },
];

const AddPartner = () => {
  const navigation = useNavigation();
  const [plans, setPlans] = useState([]);
  const [weekMenu, setWeekMenu] = useState({});
  const [planItems, setPlanItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Partner details states
  const [partnerName, setPartnerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    countryCodes[0].code
  );
  const [showCountryCodes, setShowCountryCodes] = useState(false);

  // Animation and UI states
  const scrollX = useRef(new Animated.Value(0)).current;
  const modalAnimation = useRef(new Animated.Value(height * 0.4)).current;
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchPlans();
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
    setSelectedCategory(plan.package[0]);
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
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Meal Partner</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Partner Details Section */}
        <View style={styles.partnerSection}>
          <Text style={styles.sectionTitle}>Partner Details</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Partner Name"
              value={partnerName}
              onChangeText={setPartnerName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.phoneInputContainer}>
            <TouchableOpacity
              style={styles.countryCodeButton}
              onPress={() => setShowCountryCodes(!showCountryCodes)}
            >
              <Text style={styles.countryCodeText}>{selectedCountryCode}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            <TextInput
              style={styles.phoneInput}
              placeholder="Mobile Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          {showCountryCodes && (
            <View style={styles.countryCodeList}>
              {countryCodes.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={styles.countryCodeItem}
                  onPress={() => {
                    setSelectedCountryCode(country.code);
                    setShowCountryCodes(false);
                  }}
                >
                  <Text style={styles.countryCodeItemText}>
                    {country.country} ({country.code})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Available Plans</Text>

        <View style={styles.plansContainer}>
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
                      <Text
                        style={[
                          styles.categoryText,
                          selectedCategory === pkg &&
                            styles.selectedCategoryText,
                        ]}
                      >
                        {pkg.charAt(0).toUpperCase() +
                          pkg.slice(1).replace("_", " ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

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
                          selectedDayIndex === i && styles.activeDayText,
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
                    <View key={item._id} style={styles.itemCard}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                      />
                      <Text style={styles.itemName}>{item.nameEnglish}</Text>
                    </View>
                  ))}
                </ScrollView>

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
              </View>
            </ScrollView>

            <View style={styles.selectButtonContainer}>
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
                    partner: {
                      name: partnerName,
                      phone: selectedCountryCode + phoneNumber,
                    },
                  })
                }
              >
                <Text style={styles.selectButtonText}>Select This Plan</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  // Partner Details Section
  partnerSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    paddingHorizontal: 20,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: 100,
  },
  countryCodeText: {
    fontSize: 16,
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  countryCodeList: {
    position: "absolute",
    top: 135,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  countryCodeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  countryCodeItemText: {
    fontSize: 16,
    color: "#333",
  },
  // Plans Section
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: "row",
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 15,
    elevation: 3,
  },
  planImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  planTextContainer: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 15,
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 14,
    color: "#666",
  },
  // Modal Styles
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    height: height * 0.85,
  },
  modalHandle: {
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
  },
  modalScroll: {
    flex: 1,
    marginBottom: 80,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
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
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedCategory: {
    backgroundColor: "#C5A85F",
  },
  categoryText: {
    color: "#666",
    fontWeight: "600",
  },
  selectedCategoryText: {
    color: "#fff",
  },
  // Days Navigation
  daysWrapper: {
    marginBottom: 20,
    height: 50,
  },
  daysContent: {
    paddingHorizontal: 5,
    alignItems: "center",
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    minWidth: 80,
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
  // Items Display
  itemsWrapper: {
    marginBottom: 20,
    height: 200,
  },
  itemsContent: {
    paddingHorizontal: 5,
  },
  itemCard: {
    width: 150,
    marginRight: 15,
    padding: 10,
    borderRadius: 12,
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
    width: "100%",
    height: 130,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#333",
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
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 8,
  },
  activeButton: {
    backgroundColor: "#C5A85F",
  },
  radioText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeButtonText: {
    color: "#fff",
  },
  // Select Button
  selectButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  selectButton: {
    backgroundColor: "#C5A85F",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddPartner;
