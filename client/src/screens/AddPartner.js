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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const AddPartner = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const modalAnimation = useRef(new Animated.Value(height * 0.4)).current;
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [modalHeight, setModalHeight] = useState(height * 0.6);
  const [selectedMeal, setSelectedMeal] = useState("");

  const mealItems = [
    {
      id: 1,
      name: "Chicken Salad",
      image: {
        uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn4mOc7fcGf1CuLCqOgEgkNWiU8rVVseWRWw&s",
      },
      category: "Lunch",
    },
    {
      id: 2,
      name: "Chicken Biryani",
      image: {
        uri: "https://static.wixstatic.com/media/91e241_76e634b7ab52498e82533ba79b747b55~mv2.jpg/v1/fill/w_666,h_444,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/91e241_76e634b7ab52498e82533ba79b747b55~mv2.jpg",
      },
      category: "Dinner",
    },
    {
      id: 3,
      name: "Dal Makhni",
      image: {
        uri: "https://myfoodstory.com/wp-content/uploads/2018/08/Dal-Makhani-New-3.jpg",
      },
      category: "Lunch",
    },
    {
      id: 4,
      name: "Butter Chicken",
      image: {
        uri: "https://img.hellofresh.com/f_auto,fl_lossy,q_auto,w_1200/hellofresh_s3/image/HF_Y24_R36_W04_UK_SU12275-19_Main__2low-117d75ec.jpg",
      },
      category: "Dinner",
    },
    {
      id: 5,
      name: "Malai Kabab",
      image: {
        uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnNOYuBPjj_ItnBI0mMZBNsx2HanxCzw5SjA&s",
      },
      category: "Lunch",
    },
    {
      id: 6,
      name: "Malai Kabab",
      image: {
        uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnNOYuBPjj_ItnBI0mMZBNsx2HanxCzw5SjA&s",
      },
      category: "Lunch",
    },
    {
      id: 7,
      name: "Malai Kabab",
      image: {
        uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnNOYuBPjj_ItnBI0mMZBNsx2HanxCzw5SjA&s",
      },
      category: "Lunch",
    },
  ];

  const days = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"];
  const [selectedCategory, setSelectedCategory] = useState("Lunch");

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    Animated.spring(modalAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.spring(modalAnimation, {
      toValue: height,
      useNativeDriver: true,
    }).start(() => setSelectedPlan(null));
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

  return (
    <View style={styles.container}>
      {/* Ad Banner */}

      <ScrollView contentContainerStyle={styles.planWrapper}>
        <Text style={styles.partnerPlanTitle}>Select Plan For Partner</Text>
        <View contentContainerStyle={styles.planContainer}>
          {/* Plan Cards */}

          <TouchableOpacity
            style={styles.planCard}
            onPress={() => handlePlanSelect("Sample Plan")}
          >
            <Image
              source={{
                uri: "https://recipes.net/wp-content/uploads/2024/01/how-to-eat-traditional-indian-food-1706505708.jpg",
              }}
              style={styles.planImage}
            />
            <View style={styles.cardTextContainer}>
              <Text style={styles.planName}>Sample Plan 1 </Text>
              <Text style={styles.planDescription}>
                A short description of the sample plan.
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.planCard}
            onPress={() => handlePlanSelect("Sample Plan")}
          >
            <Image
              source={{
                uri: "https://t4.ftcdn.net/jpg/02/75/39/23/360_F_275392381_9upAWW5Rdsa4UE0CV6gRu2CwUETjzbKy.jpg",
              }}
              style={styles.planImage}
            />
            <View style={styles.cardTextContainer}>
              <Text style={styles.planName}>Sample Plan 2 </Text>
              <Text style={styles.planDescription}>
                A short description of the sample plan.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Selected Plan Details Modal */}
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
              <View
                style={styles.modalContent}
                onStartShouldSetResponder={() => true}
              >
                <Text style={styles.modalTitle}>{selectedPlan}</Text>
                <Text style={styles.modalDescription}>
                  Detailed description of the selected plan goes here.
                </Text>

                {/* Category Selection */}
                <View style={styles.categoryContainer}>
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      selectedCategory === "Lunch" && styles.selectedCategory,
                    ]}
                    onPress={() => setSelectedCategory("Lunch")}
                  >
                    <Text style={styles.categoryText}>Lunch</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      selectedCategory === "Dinner" && styles.selectedCategory,
                    ]}
                    onPress={() => setSelectedCategory("Dinner")}
                  >
                    <Text style={styles.categoryText}>Dinner</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.daysWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.daysScroll}
                  >
                    {days.map((day, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dayButton,
                          selectedDayIndex === index && styles.activeDayButton,
                        ]}
                        onPress={() => setSelectedDayIndex(index)}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            selectedDayIndex === index
                              ? styles.activeDayText
                              : styles.inactiveDayText,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                {/* Horizontal ScrollView for Meal Items */}
                <View style={styles.itemsWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.itemsContainer}
                  >
                    {mealItems
                      .filter((item) => item.category === selectedCategory)
                      .map((item) => (
                        <View key={item.id} style={styles.itemCard}>
                          <Image source={item.image} style={styles.itemImage} />
                          <Text style={styles.itemName}>{item.name}</Text>
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

                <TouchableOpacity style={styles.selectButton}>
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
    flexDirection: "row",
    width: width * 0.9,
  },
  cardTextContainer: {
    marginLeft: 10,
  },

  planImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  planDescription: {
    fontSize: 14,
    flexWrap: "wrap",
    width: "100%",
    color: "#666",
  },
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
  categoryContainer: {
    flexDirection: "row",
  },
  categoryButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 5,
    marginRight: 10,
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
  itemsContainer: {
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  itemCard: {
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    Width: 100,
    alignSelf: "flex-start",
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
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  radioButton: {
    backgroundColor: "#eee",
    borderRadius: 5,
    padding: 10,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  radioText: {
    fontWeight: "bold",
  },
  daysWrapper: {
    height: 60,
  },
  itemsWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  selectButton: {
    backgroundColor: "#C5A85F",
    padding: 15,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  selectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
  partnerPlanTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
});

export default AddPartner;
