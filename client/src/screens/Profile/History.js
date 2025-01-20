import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const HistoryScreen = () => {
  const historyData = [
    {
      id: "1",
      name: "High Protien",
      duration: "1 Month",
      price: "SAR 1850",
      startDate: "2024-07-01",
      endDate: "2024-09-30",
    },
    {
      id: "2",
      name: "Vegeterian",
      duration: "1 Month",
      price: "SAR 2000",
      startDate: "2024-06-01",
      endDate: "2024-06-30",
    },
    {
      id: "3",
      name: "Only Carbs",
      duration: "1 Week",
      price: "SAR 500",
      startDate: "2024-05-15",
      endDate: "2024-05-21",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Your Subscription History</Text>
      <FlatList
        data={historyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="pricetag-outline" size={24} color="#444" />
              <Text style={styles.subscriptionName}>{item.name}</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.row}>
                <Ionicons name="calendar-outline" size={20} color="#888" />
                <Text style={styles.text}>
                  {item.startDate} - {item.endDate}
                </Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="time-outline" size={20} color="#888" />
                <Text style={styles.text}>{item.duration}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="cash-outline" size={20} color="#888" />
                <Text style={styles.text}>{item.price}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 30,
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
  },
  cardContent: {
    marginLeft: 30,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10,
  },
});

export default HistoryScreen;
