import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";

const Payment = ({ route, navigation }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Visa/Mastercard");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [stcPhoneNumber, setStcPhoneNumber] = useState("");
  const [isFormValid, setIsFormValid] = useState(false); // New state for form validation
  const { selectedPlan, selectedDays, planName } = route.params;

  const handleExpiryChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiryDate(cleaned);
    }
    validateForm(); // Validate form on expiry date change
  };

  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    const formatted = cleaned
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
    setCardNumber(formatted);
    validateForm(); // Validate form on card number change
  };

  const validateForm = () => {
    if (paymentMethod === "Visa/Mastercard") {
      setIsFormValid(
        isChecked &&
          cardHolderName.trim() &&
          cardNumber.trim() &&
          cvv.trim() &&
          expiryDate.trim()
      );
    } else if (paymentMethod === "STC Pay") {
      setIsFormValid(isChecked && stcPhoneNumber.trim());
    } else {
      setIsFormValid(isChecked); // Only checkbox checked
    }
  };

  const handleCheckout = () => {
    if (isChecked) {
      navigation.navigate("OrderSummary", {
        selectedPlan,
        selectedDays,
        paymentMethod,
        ...(paymentMethod === "Visa/Mastercard"
          ? { cardHolderName, cardNumber, cvv, expiryDate }
          : { stcPhoneNumber }),
      });
    } else {
      alert("Please accept the Privacy and Policy.");
    }
  };

  const handleSaveCard = () => {
    alert("Card details saved successfully!");
  };

  useEffect(() => {
    validateForm(); // Validate form on mount
  }, [isChecked, cardHolderName, cardNumber, cvv, expiryDate, stcPhoneNumber]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Select Your Address</Text>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => navigation.navigate("UserAddress")}
      >
        <Text style={styles.selectButtonText}>Choose Address</Text>
      </TouchableOpacity>

      <Text style={styles.subHeading}>Your Payment Plan</Text>
      <View style={styles.planContainer}>
        <Text style={styles.planText}>
          {planName} - {selectedPlan} ({selectedDays})
        </Text>
        <Text style={styles.planPrice}>
          {selectedPlan === "1 Week"
            ? selectedDays === "5 Days"
              ? "500 SAR"
              : "600 SAR"
            : selectedPlan === "2 Weeks"
            ? selectedDays === "5 Days"
              ? "900 SAR"
              : "1100 SAR"
            : selectedDays === "5 Days"
            ? "1600 SAR"
            : "1900 SAR"}
        </Text>
      </View>

      <Text style={styles.subHeading}>Choose Payment Method</Text>
      <View style={styles.paymentMethodContainer}>
        <TouchableOpacity
          style={styles.radioContainer}
          onPress={() => setPaymentMethod("Visa/Mastercard")}
        >
          <View
            style={[
              styles.radioButton,
              paymentMethod === "Visa/Mastercard" && styles.selectedRadio,
            ]}
          />
          <Text style={styles.radioText}>Visa/Mastercard</Text>
        </TouchableOpacity>
        {paymentMethod === "Visa/Mastercard" && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Card Holder Name"
              value={cardHolderName}
              onChangeText={(text) => {
                setCardHolderName(text);
                validateForm(); // Validate form on card holder name change
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="XXXX XXXX XXXX XXX"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
            />
            <View style={styles.rowContainer}>
              <TextInput
                style={styles.halfInput}
                placeholder="CVV"
                keyboardType="numeric"
                value={cvv}
                onChangeText={(text) => {
                  setCvv(text);
                  validateForm(); // Validate form on CVV change
                }}
                maxLength={3}
                secureTextEntry
              />
              <TextInput
                style={styles.halfInput}
                placeholder="Expiry Date (MM/YY)"
                value={expiryDate}
                onChangeText={handleExpiryChange}
              />
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveCard}
            >
              <Text style={styles.saveButtonText}>Save Card</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.radioContainer}
          onPress={() => setPaymentMethod("STC Pay")}
        >
          <View
            style={[
              styles.radioButton,
              paymentMethod === "STC Pay" && styles.selectedRadio,
            ]}
          />
          <Text style={styles.radioText}>STC Pay</Text>
        </TouchableOpacity>
        {paymentMethod === "STC Pay" && (
          <TextInput
            style={styles.input}
            placeholder="05XXXXXXXX"
            keyboardType="phone-pad"
            maxLength={10}
            value={stcPhoneNumber}
            onChangeText={(text) => {
              setStcPhoneNumber(text);
              validateForm();
            }}
          />
        )}
      </View>

      <View style={styles.policyContainer}>
        <Switch
          value={isChecked}
          onValueChange={(value) => {
            setIsChecked(value);
            validateForm(); // Validate form on checkbox change
          }}
          style={styles.checkbox}
        />
        <Text style={styles.policyText}>
          I accept all the Privacy and Policy
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.checkoutButton,
          isFormValid ? styles.activeButton : styles.disabledButton,
        ]}
        onPress={() => navigation.navigate("OrderPlacedSplash")}
        disabled={!isFormValid} // Use isFormValid to control the disabled state
      >
        <Text style={styles.checkoutButtonText}>Checkout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  selectButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  selectButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  planContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  planText: {
    fontSize: 18,
    color: "#333",
  },
  planPrice: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#4CAF50",
  },
  paymentMethodContainer: {
    marginBottom: 20,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4CAF50",
    marginRight: 10,
  },
  selectedRadio: {
    backgroundColor: "#4CAF50",
  },
  radioText: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginRight: 5,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  policyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  policyText: {
    fontSize: 16,
    color: "#333",
  },
  checkoutButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  activeButton: {
    backgroundColor: "#4CAF50",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default Payment;
