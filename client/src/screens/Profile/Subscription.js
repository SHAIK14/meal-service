import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { Calendar } from "react-native-calendars"; // Importing Calendar component
import caloriesIcon from "../../../assets/Cal.png";
import proteinIcon from "../../../assets/Pro.png";
import fatIcon from "../../../assets/Fat.png";
import carbsIcon from "../../../assets/Carb.png";
import Icon from "react-native-vector-icons/MaterialIcons";

const SubscriptionPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [translateY] = useState(new Animated.Value(0));
  const [skippedDates, setSkippedDates] = useState(new Set()); // Track skipped dates
  const [selectedMeal, setSelectedMeal] = useState(null); // Track selected meal for display

  const meals = {
    0: {
      name: "Chicken Salad",
      description: "A healthy chicken salad with veggies.",
      image:
        "https://assets.epicurious.com/photos/64a845e67799ee8651e4fb8f/4:3/w_5322,h_3991,c_limit/AshaGrilledChickenSalad_RECIPE_070523_56498.jpg",
      calories: 300,
      protein: 25,
      fat: 10,
      carbs: 20,
    },
    1: {
      name: "Dal Fry",
      description: "A delicious stir-fry with mixed vegetables.",
      image:
        "https://tikkastotapas.com/wp-content/uploads/2021/08/IMG_9208-2.jpg",
      calories: 250,
      protein: 10,
      fat: 5,
      carbs: 30,
    },
    2: {
      name: "Palak Paneer",
      description: "Fresh veggies stir-fried to perfection.",
      image:
        "https://food-images.files.bbci.co.uk/food/recipes/palak_paneer_85769_16x9.jpg",
      calories: 180,
      protein: 5,
      fat: 3,
      carbs: 32,
    },
    3: {
      name: "Chicken Biryani",
      description: "Savory beef tacos with fresh toppings.",
      image:
        "https://c.ndtvimg.com/2023-03/7n07er7o_biryani_625x300_09_March_23.jpg",
      calories: 400,
      protein: 20,
      fat: 20,
      carbs: 30,
    },
  };

  // Function to generate marked dates
  const getMarkedDates = () => {
    const today = new Date();
    const markedDates = {};
    for (let i = -1; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0];
      markedDates[dateString] = {
        disabled: i < 0 || skippedDates.has(dateString),
        color: i < 0 || skippedDates.has(dateString) ? "gray" : "white", // Gray out past and skipped dates
      };
    }
    markedDates[today.toISOString().split("T")[0]] = {
      selected: selectedDate === today.toISOString().split("T")[0],
    };
    return markedDates;
  };

  const onDaySelect = (day) => {
    if (!skippedDates.has(day.dateString)) {
      setSelectedDate(day.dateString);
      setIsVisible(true);
    }
  };

  const togglePopup = () => {
    setIsVisible(!isVisible);
    setExpanded(false);
  };

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  const collapsePopup = () => {
    setExpanded(false);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const onGestureEvent = (event) => {
    const { translationY } = event.nativeEvent;
    if (translationY > 100) {
      collapsePopup();
    }
  };

  const skipDay = () => {
    if (selectedDate) {
      setSkippedDates((prev) => new Set(prev).add(selectedDate));
      togglePopup();
    }
  };

  const handleMealSelect = (meal) => {
    setSelectedMeal(meal);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Calendar
          onDayPress={onDaySelect}
          markingType="multi-dot"
          markedDates={getMarkedDates()}
          theme={{
            selectedDayBackgroundColor: "#00adf5",
            todayTextColor: "#00adf5",
            dayTextColor: "#2d4150",
          }}
        />

        <Modal transparent visible={isVisible} animationType="slide">
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={togglePopup}
            activeOpacity={1}
          >
            <View />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.popUpContainer,
              { height: expanded ? "100%" : "60%" },
            ]}
          >
            <PanGestureHandler onGestureEvent={onGestureEvent}>
              <Animated.View style={{ transform: [{ translateY }] }}>
                <View style={styles.mealImageContainer}>
                  <Image
                    source={{
                      uri: selectedMeal ? selectedMeal.image : meals[0]?.image,
                    }} // Use selected meal if available
                    style={styles.mealImage}
                  />
                  <TouchableOpacity style={styles.skipButton} onPress={skipDay}>
                    <Text style={styles.skipButtonText}>Skip the Day</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.mealInfoContainer}>
                  <Text style={styles.mealName}>
                    {selectedMeal ? selectedMeal.name : meals[0]?.name}
                  </Text>
                  <Text style={styles.mealDescription}>
                    {selectedMeal
                      ? selectedMeal.description
                      : meals[0]?.description}
                  </Text>
                  <Text style={styles.selectedDateText}>
                    Selected Date: {selectedDate || "None"}
                  </Text>
                </View>

                <View style={styles.nutritionContainer}>
                  <NutritionItem
                    icon={caloriesIcon}
                    value={
                      selectedMeal ? selectedMeal.calories : meals[0]?.calories
                    }
                    label="Cal."
                  />
                  <NutritionItem
                    icon={proteinIcon}
                    value={
                      selectedMeal ? selectedMeal.protein : meals[0]?.protein
                    }
                    label="Protein"
                  />
                  <NutritionItem
                    icon={fatIcon}
                    value={selectedMeal ? selectedMeal.fat : meals[0]?.fat}
                    label="Fat"
                  />
                  <NutritionItem
                    icon={carbsIcon}
                    value={selectedMeal ? selectedMeal.carbs : meals[0]?.carbs}
                    label="Carbs"
                  />
                </View>

                <TouchableOpacity
                  onPress={toggleExpand}
                  style={styles.expandButton}
                >
                  <Text>
                    <Icon
                      name={expanded ? "arrow-drop-up" : "arrow-drop-down"}
                      size={30} // Adjust size as needed
                      color="#000" // Change color as needed
                    />
                  </Text>
                </TouchableOpacity>

                {expanded && (
                  <ScrollView style={styles.itemList}>
                    {Object.values(meals).map((meal, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleMealSelect(meal)}
                        style={styles.mealOption}
                      >
                        <Image
                          source={{ uri: meal.image }}
                          style={styles.optionImage}
                        />
                        <Text style={styles.optionText}>{meal.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
};

const NutritionItem = ({ icon, value, label }) => (
  <View style={styles.nutritionItem}>
    <Image source={icon} style={styles.nutritionIcon} />
    <Text style={styles.nutritionTitle}>{value} g</Text>
    <Text>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
  },
  popUpContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  mealImageContainer: {
    alignItems: "center",
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: "hidden",
  },
  mealImage: {
    width: "100%",
    height: "100%",
  },

  skipButton: {
    marginTop: 10,
    padding: 10,
    position: "absolute",
    right: 10,
    backgroundColor: "#ff4444",
    borderRadius: 5,
  },
  skipButtonText: {
    color: "#fff",
  },
  mealInfoContainer: {
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  mealName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  mealDescription: {
    marginVertical: 5,
  },
  selectedDateText: {
    marginTop: 10,
    fontStyle: "italic",
  },
  nutritionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionIcon: {
    width: 24,
    height: 24,
  },
  nutritionTitle: {
    fontWeight: "bold",
  },
  expandButton: {
    alignSelf: "center",
    padding: 10,

    borderRadius: 5,
    marginVertical: 10,
  },
  itemList: {
    maxHeight: 200,
  },
  mealOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  optionImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  optionText: {
    marginLeft: 10,
  },
});

export default SubscriptionPage;
