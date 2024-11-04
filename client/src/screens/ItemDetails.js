// src/Pages/ItemDetails.js
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import caloriesImage from "../../assets/Cal.png";
import fatImage from "../../assets/Fat.png";
import proteinImage from "../../assets/Pro.png";
import carbsImage from "../../assets/Carb.png";
const ItemDetails = ({ route, navigation }) => {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      {/* Full Width Photo */}
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* Close Button (X) */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>

      {/* Modal for Item Details */}
      <View style={styles.detailsContainer}>
        <ScrollView contentContainerStyle={styles.detailsScroll}>
          <Text style={styles.name}>{item.nameEnglish}</Text>
          <Text style={styles.description}>
            {item.description}This is Description of the Item, Lorem Ipsum Lorem
            Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
          </Text>

          {/* Nutrition Facts */}
          <Text style={styles.nutritionTitle}>Nutrition Facts</Text>
          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <Image source={caloriesImage} style={styles.nutritionImage} />
              <Text style={styles.nutritionName}>Calories</Text>
              <Text style={styles.nutritionValue}>
                {item.nutrition?.calories || "N/A"}g
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Image source={fatImage} style={styles.nutritionImage} />
              <Text style={styles.nutritionName}>Fat</Text>
              <Text style={styles.nutritionValue}>
                {item.nutrition?.fat || "N/A"}g
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Image source={proteinImage} style={styles.nutritionImage} />
              <Text style={styles.nutritionName}>Protein</Text>
              <Text style={styles.nutritionValue}>
                {item.nutrition?.protein || "N/A"}g
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Image source={carbsImage} style={styles.nutritionImage} />
              <Text style={styles.nutritionName}>Carbs</Text>
              <Text style={styles.nutritionValue}>
                {item.nutrition?.carbs || "N/A"}g
              </Text>
            </View>
          </View>
          <View style={styles.whatInTheBox}>
            <Text style={styles.inTheBoxTitle}>
              {item.inTheBoxTitle}This Includes
            </Text>
            <Text style={styles.inTheBoxDetails}>
              {item.inTheBoxDetails}Salad: 250g
            </Text>
            <Text style={styles.inTheBoxDetails}>
              {item.inTheBoxDetails}Rice: 175g
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "50%",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    width: 45,
    height: 45,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  detailsContainer: {
    flex: 1,
    padding: 20,

    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  detailsScroll: {
    flexGrow: 1,
  },
  name: {
    fontSize: 36,
    fontWeight: "bold",
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  nutritionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  nutritionContainer: {
    flexDirection: "row",
    marginVertical: 25,
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  nutritionItem: {
    alignItems: "center",
    width: "24%",
    marginBottom: 20,
  },
  nutritionImage: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  nutritionName: {
    fontSize: 14,

    marginBottom: 3,
  },
  nutritionValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  inTheBoxTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  whatInTheBox: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },
  inTheBoxDetails: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ItemDetails;
