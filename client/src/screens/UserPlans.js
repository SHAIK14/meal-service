import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAllPlans,
  getPlanById,
  getPlanWeeklyMenu,
  getItemsBatch,
} from "../utils/api";
import profileUserIcon from "../../assets/profile-user.png";
import adBannerImage from "../../assets/ad-banner.jpg";

const Plans = () => {
  const navigation = useNavigation();
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [plans, setPlans] = useState([]);
  const [weekMenu, setWeekMenu] = useState({});
  const [planItems, setPlanItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    console.log("Fetching plans...");
    try {
      const data = await getAllPlans();
      console.log("Fetched plans:", data);
      setPlans(data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchWeekMenu = async (planId) => {
    console.log(`Fetching week menu for plan ${planId}...`);
    try {
      const data = await getPlanWeeklyMenu(planId);
      console.log("Fetched week menu:", data);
      setWeekMenu((prevWeekMenu) => ({ ...prevWeekMenu, [planId]: data.data }));
    } catch (err) {
      console.error("Error fetching week menu:", err);
    }
  };

  const fetchPlanItems = async (planId, weekMenuData) => {
    console.log(`Fetching items for plan ${planId}...`);
    try {
      if (!weekMenuData || !weekMenuData.weekMenu) {
        console.log("No week menu data available for fetching items");
        return;
      }

      const itemIds = Object.values(weekMenuData.weekMenu).flat();
      console.log("Item IDs to fetch:", itemIds);

      if (itemIds.length === 0) {
        console.log("No item IDs found in the week menu");
        setPlanItems((prevPlanItems) => ({ ...prevPlanItems, [planId]: [] }));
        return;
      }

      const data = await getItemsBatch(itemIds);
      console.log("Fetched plan items:", data);

      if (data.success && Array.isArray(data.data)) {
        setPlanItems((prevPlanItems) => ({
          ...prevPlanItems,
          [planId]: data.data,
        }));
      } else {
        console.log("Unexpected data structure from getItemsBatch:", data);
        setPlanItems((prevPlanItems) => ({ ...prevPlanItems, [planId]: [] }));
      }
    } catch (err) {
      console.error("Error fetching plan items:", err);
      setPlanItems((prevPlanItems) => ({ ...prevPlanItems, [planId]: [] }));
    }
  };

  const toggleExpand = async (planId) => {
    console.log(`Toggling expand for plan ${planId}`);
    if (expandedPlan === planId) {
      setExpandedPlan(null);
    } else {
      setExpandedPlan(planId);
      setSelectedDay(1);

      if (!weekMenu[planId]) {
        console.log(`Fetching week menu for plan ${planId}...`);
        try {
          const data = await getPlanWeeklyMenu(planId);
          console.log("Fetched week menu:", data);
          setWeekMenu((prevWeekMenu) => {
            const updatedWeekMenu = { ...prevWeekMenu, [planId]: data.data };
            fetchPlanItems(planId, updatedWeekMenu[planId]);
            return updatedWeekMenu;
          });
        } catch (err) {
          console.error("Error fetching week menu:", err);
        }
      } else {
        fetchPlanItems(planId, weekMenu[planId]);
      }
    }
  };

  const renderWeekMenuItem = ({ item, index }) => {
    console.log("Rendering week menu item:", item);
    return (
      <View style={styles.carouselItem}>
        <Image source={{ uri: item.image }} style={styles.carouselImage} />
        <Text style={styles.carouselImageText}>{item.nameEnglish}</Text>
      </View>
    );
  };

  const renderPlanItem = ({ item, index }) => {
    console.log("Rendering plan item:", item);
    return (
      <View style={styles.itemCard}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <Text style={styles.itemName}>{item.nameEnglish}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.addressContainer}>
        <TouchableOpacity
          style={styles.addMealPartnerButton}
          onPress={() => navigation.navigate("AddPartner")}
        >
          <Text style={styles.addMealPartnerButtonText}>Add Meal Partner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => navigation.navigate("Profile")}
        >
          <Image source={profileUserIcon} style={styles.iconImage} />
        </TouchableOpacity>
      </View>

      <Image source={adBannerImage} style={styles.adBanner} />

      <ScrollView>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan._id}
            onPress={() => toggleExpand(plan._id)}
          >
            <View style={styles.planCard}>
              <Image source={{ uri: plan.image }} style={styles.planImage} />
              <View style={styles.planTextContainer}>
                <Text style={styles.planName}>{plan.nameEnglish}</Text>
                <Text style={styles.planDescription}>
                  {plan.descriptionEnglish}
                </Text>
              </View>
            </View>
            {expandedPlan === plan._id && (
              <View style={styles.expandedDetails}>
                <Text style={styles.planDetails}>
                  {plan.descriptionEnglish}
                </Text>

                <View style={styles.daysNavigation}>
                  {[1, 2, 3, 4, 5].map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={styles.dayButton}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text
                        style={
                          selectedDay === day
                            ? styles.activeDayText
                            : styles.dayText
                        }
                      >
                        Day {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {weekMenu[plan._id] && weekMenu[plan._id].weekMenu && (
                  <FlatList
                    data={weekMenu[plan._id].weekMenu[selectedDay] || []}
                    renderItem={({ item }) => {
                      const itemDetails = planItems[plan._id]?.find(
                        (i) => i._id === item
                      );
                      return itemDetails ? (
                        <View style={styles.carouselItem}>
                          <Image
                            source={{ uri: itemDetails.image }}
                            style={styles.carouselImage}
                          />
                          <Text style={styles.carouselImageText}>
                            {itemDetails.nameEnglish}
                          </Text>
                        </View>
                      ) : null;
                    }}
                    keyExtractor={(item, index) => `weekmenu-${item || index}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.carousel}
                  />
                )}

                {(!planItems[plan._id] || planItems[plan._id].length === 0) && (
                  <Text style={styles.noItemsText}>
                    No items available for this plan
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() =>
                    navigation.navigate("PlanDetails", { planId: plan._id })
                  }
                >
                  <Text style={styles.selectButtonText}>Select Plan</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.customPlanButton}
          onPress={() => navigation.navigate("SelectMeals")}
        >
          <Text style={styles.customPlanButtonText}>Create Custom Plan</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  addressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 10,
  },
  addMealPartnerButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
  },
  addMealPartnerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  profileIcon: {
    padding: 10,
  },
  iconImage: {
    width: 35,
    height: 35,
    borderRadius: 20,
  },
  adBanner: {
    height: undefined,
    aspectRatio: 16 / 9,
    marginTop: 10,
    width: "95%",
    alignSelf: "center",
    borderRadius: 25,
  },
  planCard: {
    flexDirection: "row",
    backgroundColor: "#ececec",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "95%",
    alignSelf: "center",
    marginVertical: 10,
    alignItems: "center",
  },
  planImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  planTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  planDescription: {
    fontSize: 14,
    color: "#666",
  },
  expandedDetails: {
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    width: "95%",
    alignSelf: "center",
  },
  planDetails: {
    fontSize: 14,
    color: "#333",
  },
  daysNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  dayButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
  },
  activeDayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  dayText: {
    fontSize: 16,
    color: "#333",
  },
  carousel: {
    marginVertical: 10,
  },
  carouselItem: {
    alignItems: "center",
    marginRight: 10,
  },
  carouselImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  carouselImageText: {
    marginTop: 5,
    textAlign: "center",
  },
  itemCarousel: {
    marginTop: 10,
  },
  itemCard: {
    alignItems: "center",
    marginRight: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemName: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 12,
  },
  noItemsText: {
    textAlign: "center",
    marginTop: 10,
    color: "#666",
  },
  selectButton: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  customPlanButton: {
    marginTop: 10,
    backgroundColor: "#ececec",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    alignSelf: "center",
  },
  customPlanButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
});

export default Plans;