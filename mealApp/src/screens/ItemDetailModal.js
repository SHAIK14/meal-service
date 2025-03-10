import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from "react-native";

const ItemDetailModal = ({ visible, item, onClose }) => {
  // If no item is provided, don't render the modal content
  if (!item) return null;

  // Calculate total for macros for the progress bars
  const totalMacros = item.protein + item.carbs + item.fat;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Item image */}
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Content */}
          <View style={styles.content}>
            {/* Header with name and type indicator */}
            <View style={styles.header}>
              <Text style={styles.name}>{item.nameEnglish}</Text>
              <View
                style={[
                  styles.typeIndicator,
                  {
                    backgroundColor:
                      item.type === "Veg" ? "#4CAF50" : "#F44336",
                  },
                ]}
              >
                <Text style={styles.typeText}>{item.type}</Text>
              </View>
            </View>

            {/* Price */}
            <Text style={styles.price}>
              {item.prices[0]?.currency}{" "}
              {item.prices[0]?.sellingPrice?.toFixed(2)}
              {item.prices[0]?.discountPrice && (
                <Text style={styles.discountPrice}>
                  {" "}
                  {item.prices[0]?.currency}{" "}
                  {item.prices[0]?.discountPrice?.toFixed(2)}
                </Text>
              )}
            </Text>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{item.descriptionEnglish}</Text>
            </View>

            {/* Nutritional Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutritional Information</Text>

              {/* Calories */}
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Calories</Text>
                <Text style={styles.nutritionValue}>{item.calories} kcal</Text>
              </View>

              {/* Macros with progress bars */}
              <View style={styles.macros}>
                {/* Protein */}
                <View style={styles.macroItem}>
                  <View style={styles.macroHeader}>
                    <Text style={styles.macroLabel}>Protein</Text>
                    <Text style={styles.macroValue}>{item.protein}g</Text>
                  </View>
                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${(item.protein / totalMacros) * 100}%`,
                          backgroundColor: "#4285F4",
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Carbs */}
                <View style={styles.macroItem}>
                  <View style={styles.macroHeader}>
                    <Text style={styles.macroLabel}>Carbs</Text>
                    <Text style={styles.macroValue}>{item.carbs}g</Text>
                  </View>
                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${(item.carbs / totalMacros) * 100}%`,
                          backgroundColor: "#EA4335",
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Fat */}
                <View style={styles.macroItem}>
                  <View style={styles.macroHeader}>
                    <Text style={styles.macroLabel}>Fat</Text>
                    <Text style={styles.macroValue}>{item.fat}g</Text>
                  </View>
                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${(item.fat / totalMacros) * 100}%`,
                          backgroundColor: "#FBBC05",
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Text style={styles.categoryText}>
                {item.category?.nameEnglish}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 30,
  },
  image: {
    width: windowWidth,
    height: windowWidth * 0.7,
  },
  content: {
    padding: 20,
    paddingBottom: 40, // Add some padding at the bottom
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  typeIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  typeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginBottom: 20,
  },
  discountPrice: {
    textDecorationLine: "line-through",
    color: "#aaa",
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  nutritionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  nutritionLabel: {
    fontSize: 16,
    color: "#666",
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  macros: {
    marginTop: 8,
  },
  macroItem: {
    marginBottom: 12,
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 14,
    color: "#666",
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  progressBackground: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  categoryText: {
    fontSize: 16,
    color: "#666",
  },
});

export default ItemDetailModal;
