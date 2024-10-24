import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const UserPlanDuration = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan } = route.params;

  const durations = [
    { name: "1 Week", multiplier: 1 },
    { name: "2 Weeks", multiplier: 2 },
    { name: "1 Month", multiplier: 4 },
  ];

  const handleSelect = (duration) => {
    navigation.navigate("Payment", {
      plan: {
        ...plan,
        selectedDuration: duration.name,
        totalPrice: plan.totalPrice * duration.multiplier,
      },
    });
  };

  const renderPlanCard = (duration) => (
    <View key={duration.name} style={styles.card}>
      <Text style={styles.cardTitle}>{duration.name}</Text>
      <Text style={styles.durationText}>{plan.duration} days per week</Text>
      <Text style={styles.priceText}>
        Total Price: {plan.totalPrice * duration.multiplier} SAR
      </Text>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => handleSelect(duration)}
      >
        <Text style={styles.selectButtonText}>Select</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{plan.name}</Text>
      <Text style={styles.description}>{plan.description}</Text>
      {durations.map(renderPlanCard)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "white",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    width: "100%",
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  durationText: {
    fontSize: 16,
    marginBottom: 5,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  selectButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  selectButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default UserPlanDuration;
