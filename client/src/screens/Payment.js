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
import { getUserAddress } from "../utils/api"; // Assume this function exists to fetch user address

const Payment = ({ route, navigation }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Visa/Mastercard");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [stcPhoneNumber, setStcPhoneNumber] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [userAddress, setUserAddress] = useState(null);

  const { plan } = route.params;

  useEffect(() => {
    fetchUserAddress();
    validateForm();
  }, [isChecked, cardHolderName, cardNumber, cvv, expiryDate, stcPhoneNumber]);

  const fetchUserAddress = async () => {
    try {
      const response = await getUserAddress();
      if (response && response.address) {
        setUserAddress(response.address);
      } else {
        setUserAddress(null);
      }
    } catch (error) {
      console.error("Error fetching user address:", error);
      setUserAddress(null);
    }
  };
  const formatAddress = (fullAddress) => {
    if (!fullAddress) return "";
    const parts = fullAddress.split(", ");
    const building = parts[0];
    const street = parts[1] || "";
    const country = parts[parts.length - 1];
    return `${building}, ${street}, ${country}`;
  };

  const handleExpiryChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiryDate(cleaned);
    }
    validateForm();
  };

  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    const formatted = cleaned
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
    setCardNumber(formatted);
    validateForm();
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
      setIsFormValid(isChecked);
    }
  };

  const handleCheckout = () => {
    if (isChecked) {
      navigation.navigate("OrderSummary", {
        plan,
        paymentMethod,
        ...(paymentMethod === "Visa/Mastercard"
          ? { cardHolderName, cardNumber, cvv, expiryDate }
          : { stcPhoneNumber }),
        promoCode,
      });
    } else {
      alert("Please accept the Privacy and Policy.");
    }
  };

  const handleSaveCard = () => {
    alert("Card details saved successfully!");
  };

  const applyPromoCode = () => {
    if (promoCode === "DISCOUNT10") {
      setDiscount(10);
      alert("Promo code applied: 10% discount");
    } else {
      alert("Invalid promo code");
      setDiscount(0);
    }
  };

  const calculatePrice = () => {
    let basePrice = plan.totalPrice;
    if (plan.selectedDuration === "2 Weeks") {
      basePrice *= 2;
    } else if (plan.selectedDuration === "1 Month") {
      basePrice *= 4;
    }
    const discountedPrice = basePrice - (basePrice * discount) / 100;
    return `${discountedPrice.toFixed(2)} SAR`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Delivery Address</Text>
      {userAddress ? (
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>
            {formatAddress(userAddress.fullAddress)}
          </Text>
          <Text style={styles.addressText}>{userAddress.saveAs}</Text>
        </View>
      ) : (
        <Text style={styles.noAddressText}>No address found</Text>
      )}
      <TouchableOpacity
        style={styles.addAddressButton}
        onPress={() => navigation.navigate("UserAddress")}
      >
        <Text style={styles.addAddressButtonText}>
          {userAddress ? "Change Address" : "Add Address"}
        </Text>
      </TouchableOpacity>
      <Text style={styles.subHeading}>Your Payment Plan</Text>
      <View style={styles.planContainer}>
        <Text style={styles.planText}>
          {plan.name} - {plan.selectedDuration} ({plan.duration} days/week)
        </Text>
        <Text style={styles.planPrice}>{calculatePrice()}</Text>
      </View>

      <Text style={styles.subHeading}>Promo Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Promo Code"
        value={promoCode}
        onChangeText={(text) => setPromoCode(text)}
      />
      <TouchableOpacity style={styles.applyButton} onPress={applyPromoCode}>
        <Text style={styles.applyButtonText}>Apply Promo Code</Text>
      </TouchableOpacity>

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
                validateForm();
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
                  validateForm();
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
            validateForm();
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
        onPress={handleCheckout}
        disabled={!isFormValid}
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
  addressContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addressText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  noAddressText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 20,
  },
  addAddressButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  addAddressButtonText: {
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
  applyButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Payment;
