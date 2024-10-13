import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const Plans = () => {
  const navigation = useNavigation();
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("Select Address");
  const [selectedDay, setSelectedDay] = useState(1);

  const plans = [
    {
      id: 1,
      name: "Basic Plan",
      description: "A basic meal plan for 2 meals a day.",
      image: require("../../assets/background.png"),
      details: "This plan includes  lunch, and dinner with healthy meals.",
      imagesForDays: [
        [
          { src: require("../../assets/image_1.jpg"), name: "Meal 1" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 2" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 3" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 4" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 5" },
        ],
        // Add images for Day 2, Day 3, etc.
        [
          { src: require("../../assets/image_1.jpg"), name: "Meal 1" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 2" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 3" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 4" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 5" },
        ],
        [
          { src: require("../../assets/image_1.jpg"), name: "Meal 1" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 2" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 3" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 4" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 5" },
        ],
        [
          { src: require("../../assets/image_1.jpg"), name: "Meal 1" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 2" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 3" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 4" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 5" },
        ],
        [
          { src: require("../../assets/image_1.jpg"), name: "Meal 1" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 2" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 3" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 4" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 5" },
        ],
      ],
    },
    {
      id: 2,
      name: "Premium Plan",
      description: "A premium plan with customized meals.",
      image: require("../../assets/background.png"),
      details: "Includes breakfast, lunch, dinner, and snack options.",
      imagesForDays: [
        [
          { src: require("../../assets/image_1.jpg"), name: "Meal 1" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 2" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 3" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 4" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 5" },
        ],
        // Add images for Day 2, Day 3, etc.
        [
          { src: require("../../assets/image_1.jpg"), name: "Meal 1" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 2" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 3" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 4" },
          { src: require("../../assets/image_1.jpg"), name: "Meal 5" },
        ],
      ],
    },
  ];

  // Handles plan expansion
  const toggleExpand = (planId) => {
    setExpandedPlan(planId === expandedPlan ? null : planId);
    setSelectedDay(1); // Reset selected day when changing plan
  };

  // Handles address bar expansion
  const toggleAddressExpand = () => {
    setIsAddressExpanded(!isAddressExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Address Bar and Profile Icon */}
      <View style={styles.addressContainer}>
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => navigation.navigate("Profile")}
        >
          <Image
            source={require("../../assets/profile-user.png")}
            style={styles.iconImage}
          />
        </TouchableOpacity>
      </View>

      {/* Expanded Address Options */}
      {isAddressExpanded && (
        <View style={styles.addressOptions}>
          <TouchableOpacity onPress={() => setSelectedAddress("Address 1")}>
            <Text style={styles.optionText}>Address 1</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedAddress("Address 2")}>
            <Text style={styles.optionText}>Address 2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedAddress("Add New Address")}
          >
            <Text style={styles.optionText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Ad Banner */}
      <Image
        source={require("../../assets/ad-banner.jpg")}
        style={styles.adBanner}
      />

      {/* Plans List */}
      <ScrollView>
        {plans.map((plan) => (
          <TouchableOpacity key={plan.id} onPress={() => toggleExpand(plan.id)}>
            <View style={styles.planCard}>
              <Image source={plan.image} style={styles.planImage} />
              <View style={styles.planTextContainer}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
              </View>
            </View>
            {/* Expanded Plan Details */}
            {expandedPlan === plan.id && (
              <View style={styles.expandedDetails}>
                <Text style={styles.planDetails}>{plan.details}</Text>

                {/* Days Navigation */}
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

                {/* Horizontal Sliding Carousel */}
                <FlatList
                  data={plan.imagesForDays[selectedDay - 1]}
                  renderItem={({ item }) => (
                    <View style={styles.carouselItem}>
                      <Image source={item.src} style={styles.carouselImage} />
                      <Text style={styles.carouselImageText}>{item.name}</Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.name}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.carousel}
                />

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() =>
                    navigation.navigate("PlanDetails", { planId: plan.id })
                  }
                >
                  <Text style={styles.selectButtonText}>Select Plan</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
        {/* Custom Plan Button */}
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

  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
  },

  addressBar: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#e0e0e0",

    borderRadius: 20,
  },

  addressText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },

  profileIcon: {
    marginLeft: 10,
    width: "95%",
    left: 320,
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
    marginHorizontal: "auto",
    borderRadius: 25,
  },

  addressOptions: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
    width: "95%",
    borderRadius: 15,
    margin: "auto",
  },

  optionText: {
    fontSize: 14,
    color: "red",
    paddingVertical: 5,
  },

  planCard: {
    flexDirection: "row",
    backgroundColor: "#ececec",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "95%",
    marginHorizontal: "auto",
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
    margin: "auto",
  },

  planDetails: {
    fontSize: 14,
    color: "#e0e0e0",
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

  daysNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },

  dayButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: "#e0e0e0",
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

  customPlanButton: {
    marginTop: 10,
    backgroundColor: "#ececec",
    borderRadius: 20,
    width: "fit-content",
    padding: 20,
    alignItems: "center",
    margin: "auto",
  },
});

export default Plans;
