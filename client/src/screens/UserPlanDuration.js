import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";

const UserPlanDuration = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDays, setSelectedDays] = useState(null);

  const plans = [
    { name: "1 Week", id: "1" },
    { name: "2 Weeks", id: "2" },
    { name: "1 Month", id: "3" },
  ];

  const handleSelectPlan = (plan, days) => {
    setSelectedPlan(plan);
    setSelectedDays(days);
  };

  const getPrice = (days) => {
    if (selectedPlan === "1 Week") {
      return days === "5 Days" ? "500 SAR" : "600 SAR";
    } else if (selectedPlan === "2 Weeks") {
      return days === "5 Days" ? "900 SAR" : "1100 SAR";
    } else if (selectedPlan === "1 Month") {
      return days === "5 Days" ? "1600 SAR" : "1900 SAR";
    }
    return "0 SAR";
  };

  const handleSelect = () => {
    if (selectedPlan && selectedDays) {
      navigation.navigate("Payment", {
        selectedPlan,
        selectedDays,
      });
    }
  };

  const renderPlanCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.dayButton,
            selectedPlan === item.name && selectedDays === "5 Days"
              ? styles.selectedButton
              : styles.outlineButton,
          ]}
          onPress={() => handleSelectPlan(item.name, "5 Days")}
        >
          <Text>5 Days Week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.dayButton,
            selectedPlan === item.name && selectedDays === "6 Days"
              ? styles.selectedButton
              : styles.outlineButton,
          ]}
          onPress={() => handleSelectPlan(item.name, "6 Days")}
        >
          <Text>6 Days Week</Text>
        </TouchableOpacity>
      </View>
      {selectedPlan === item.name && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
            Total Price: {getPrice(selectedDays)}
          </Text>
          <TouchableOpacity style={styles.selectButton} onPress={handleSelect}>
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Plan Duration</Text>
      <FlatList
        data={plans}
        renderItem={renderPlanCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToAlignment="center" // Center the item on snap
        snapToInterval={300} // Adjust based on card width + margin
        contentContainerStyle={styles.carousel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "White",
    justifyContent: "center", // Center content vertically
  },
  title: {
    marginTop: 30,
    fontSize: 24,
    position: "absolute",
    fontWeight: "bold",
    top: 100,
    margin: 30,
    zIndex: 1,
  },

  carousel: {
    alignItems: "center",
  },

  card: {
    marginHorizontal: 10,
    padding: 25,
    borderRadius: 20,
    borderColor: "#ccc",
    backgroundColor: "white",
    height: 400,
    width: 250,
    alignItems: "left",
    justifyContent: "center",
  },

  cardTitle: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "left",
  },
  buttonContainer: {
    flexDirection: "column",
    marginBottom: 10,
    width: "100%",
  },
  dayButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 25,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
  },
  outlineButton: {
    borderWidth: 1,

    borderColor: "#4CAF50",
    backgroundColor: "#fff",
  },
  priceContainer: {
    flexDirection: "collum",
    justifyContent: "space-between",
    alignItems: "left",
    width: "left",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  selectButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  selectButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default UserPlanDuration;
