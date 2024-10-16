import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

const gccCountryCodes = [
  { label: "+971 ", value: "+971" },
  { label: "+973 ", value: "+973" },
  { label: "+968 ", value: "+968" },
  { label: "+974 ", value: "+974" },
  { label: "+966 ", value: "+966" },
  { label: "+965 ", value: "+965" },
];

const AddPartner = () => {
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [mealType, setMealType] = useState("Lunch");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isPayingForPartner, setIsPayingForPartner] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+966");
  const [selectedIndex, setSelectedIndex] = useState(0); // For SegmentedControl
  const [isButtonPressed, setIsButtonPressed] = useState(false); // Track button press state

  const navigation = useNavigation();

  const handleAddAddress = () => {
    navigation.navigate("PartnerAddress");
  };

  const handleChoosePlan = () => {
    navigation.navigate("PartnerPlan"); // Navigate to PartnerPlan page
  };

  const handleSubmit = () => {
    const partnerDetails = {
      partnerName,
      partnerPhone: `${selectedCountryCode} ${partnerPhone}`,
      mealType,
      specialInstructions,
      isPayingForPartner,
    };
    console.log("Partner Details Submitted: ", partnerDetails);
    alert("Partner details submitted successfully!");

    // Reset form fields
    setPartnerName("");
    setPartnerPhone("");
    setMealType("Lunch");
    setSpecialInstructions("");
    setIsPayingForPartner(false);
    setSelectedCountryCode("+966");
    setSelectedIndex(0); // Reset to default selection for meal type
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add a Meal Partner</Text>

      <TextInput
        style={styles.input}
        placeholder="Partner Name"
        value={partnerName}
        onChangeText={(text) => setPartnerName(text)}
      />

      <View style={styles.phoneRow}>
        <View style={styles.countryCodeContainer}>
          <Picker
            selectedValue={selectedCountryCode}
            style={styles.Picker}
            onValueChange={(itemValue) => setSelectedCountryCode(itemValue)}
          >
            {gccCountryCodes.map((code) => (
              <Picker.Item
                key={code.value}
                label={code.label}
                value={code.value}
              />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.phoneInput}
          placeholder="5XXXXXXXXX"
          keyboardType="phone-pad"
          value={partnerPhone}
          onChangeText={(text) => setPartnerPhone(text)}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAddAddress}>
        <Text style={styles.buttonText}>Add Partner Address</Text>
      </TouchableOpacity>

      {/* Meal Type */}
      <Text style={styles.label}>Select Meal Type</Text>
      <SegmentedControl
        values={["Lunch", "Dinner", "Lunch & Dinner"]}
        selectedIndex={selectedIndex}
        onChange={(event) => {
          const index = event.nativeEvent.selectedSegmentIndex;
          setSelectedIndex(index);
          setMealType(["Lunch", "Dinner", "Lunch & Dinner"][index]); // Updating meal type based on selection
        }}
        style={styles.segmentedControl}
      />
      <Text style={styles.selectedText}> {mealType}</Text>

      {/* Choose Plan Button with dynamic style */}
      <TouchableOpacity
        style={[
          styles.choosePlanButton,
          isButtonPressed
            ? styles.choosePlanButtonPressed
            : styles.choosePlanButtonOutline,
        ]}
        onPressIn={() => setIsButtonPressed(true)} // Set button pressed state on press in
        onPressOut={() => setIsButtonPressed(false)} // Reset button pressed state on press out
        onPress={handleChoosePlan} // Navigate on press
      >
        <Text
          style={
            isButtonPressed
              ? styles.choosePlanButtonTextPressed
              : styles.choosePlanButtonText
          }
        >
          Choose Plan
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    height: "100%",
    backgroundColor: "#FFFF", // Light background for contrast
  },
  heading: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333", // Darker color for text
    marginBottom: 30,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d3d3d3",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff", // White background for input
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    fontSize: 24,
    marginTop: 20,
    marginBottom: 20,
    color: "#666", // Softer color for labels
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  countryCodeContainer: {
    width: 120,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: "#d3d3d3",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    backgroundColor: "#fff",
  },
  choosePlanButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "green",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 15,
  },
  choosePlanButtonPressed: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  choosePlanButtonText: {
    color: "green",
  },
  choosePlanButtonTextPressed: {
    color: "#fff",
  },

  segmentedControlContainer: {
    height: 50,
    justifyContent: "center",
    marginBottom: 30,
  },
  segmentedControl: {
    height: 50,
  },
  selectedText: {
    fontSize: 24,
    marginTop: 20,
  },
});

export default AddPartner;
