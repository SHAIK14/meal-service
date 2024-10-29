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
import { Ionicons } from "@expo/vector-icons";
import { getUserAddress } from "../utils/api";

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
  const [userAddress, setUserAddress] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const { plan } = route.params;

  useEffect(() => {
    fetchUserAddress();
    validateForm();
  }, [isChecked, cardHolderName, cardNumber, cvv, expiryDate, stcPhoneNumber]);

  const fetchUserAddress = async () => {
    try {
      const response = await getUserAddress();
      setUserAddress(response?.address || null);
    } catch (error) {
      console.error("Error fetching address:", error);
      setUserAddress(null);
    }
  };

  const validateForm = () => {
    if (paymentMethod === "Visa/Mastercard") {
      setIsFormValid(
        isChecked &&
          cardHolderName.trim() &&
          cardNumber.replace(/\s/g, "").length === 16 &&
          cvv.length === 3 &&
          expiryDate.length === 5
      );
    } else if (paymentMethod === "STC Pay") {
      setIsFormValid(isChecked && stcPhoneNumber.length === 10);
    }
  };

  const handleExpiryChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiryDate(cleaned);
    }
  };

  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    const formatted = cleaned
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
    setCardNumber(formatted);
  };

  const applyPromoCode = () => {
    // Here you would typically validate with backend
    if (promoCode.toUpperCase() === "SAVE10") {
      setPromoDiscount(10);
      alert("Promo code applied successfully!");
    } else {
      setPromoDiscount(0);
      alert("Invalid promo code");
    }
  };

  const calculateFinalPrice = () => {
    const basePrice = plan.pricing.final;
    const promoDiscountAmount = (basePrice * promoDiscount) / 100;
    return (basePrice - promoDiscountAmount).toFixed(2);
  };

  const handleCheckout = () => {
    if (!userAddress) {
      alert("Please add a delivery address");
      return;
    }

    if (!isFormValid) {
      alert("Please fill in all required fields");
      return;
    }

    navigation.navigate("OrderSummary", {
      plan,
      paymentMethod,
      paymentDetails:
        paymentMethod === "Visa/Mastercard"
          ? { cardHolderName, cardNumber, expiryDate }
          : { stcPhoneNumber },
      promoDiscount,
      finalAmount: calculateFinalPrice(),
      deliveryAddress: userAddress,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary Section */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDuration}>
              {plan.selectedDuration} • {plan.duration} days/week
            </Text>
            <Text style={styles.planType}>{plan.mealPlanType}</Text>
          </View>

          <View style={styles.priceBreakdown}>
            {plan.pricing.savings > 0 && (
              <>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Original Price</Text>
                  <Text style={styles.originalPrice}>
                    {plan.pricing.original.toFixed(2)} SAR
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Package Savings</Text>
                  <Text style={styles.savingsPrice}>
                    -{plan.pricing.savings.toFixed(2)} SAR
                  </Text>
                </View>
              </>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.subtotalPrice}>
                {plan.pricing.final.toFixed(2)} SAR
              </Text>
            </View>
            {promoDiscount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Promo Discount</Text>
                <Text style={styles.promoPrice}>
                  -{((plan.pricing.final * promoDiscount) / 100).toFixed(2)} SAR
                </Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.finalPriceRow]}>
              <Text style={styles.finalPriceLabel}>Total</Text>
              <Text style={styles.finalPrice}>{calculateFinalPrice()} SAR</Text>
            </View>
          </View>
        </View>

        {/* Delivery Address Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {userAddress ? (
            <View style={styles.addressCard}>
              <Text style={styles.addressType}>{userAddress.saveAs}</Text>
              <Text style={styles.addressText}>{userAddress.fullAddress}</Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => navigation.navigate("UserAddress")}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => navigation.navigate("UserAddress")}
            >
              <Text style={styles.addAddressText}>Add Delivery Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Promo Code Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.promoButton}
              onPress={applyPromoCode}
            >
              <Text style={styles.promoButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "Visa/Mastercard" && styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod("Visa/Mastercard")}
          >
            <Ionicons
              name={
                paymentMethod === "Visa/Mastercard"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={24}
              color="#C5A85F"
            />
            <Text style={styles.paymentOptionText}>Credit Card</Text>
          </TouchableOpacity>

          {paymentMethod === "Visa/Mastercard" && (
            <View style={styles.cardInputs}>
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                value={cardHolderName}
                onChangeText={setCardHolderName}
              />
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="numeric"
                maxLength={19}
              />
              <View style={styles.cardDetailsRow}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={handleExpiryChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "STC Pay" && styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod("STC Pay")}
          >
            <Ionicons
              name={
                paymentMethod === "STC Pay"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={24}
              color="#C5A85F"
            />
            <Text style={styles.paymentOptionText}>STC Pay</Text>
          </TouchableOpacity>

          {paymentMethod === "STC Pay" && (
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={stcPhoneNumber}
              onChangeText={setStcPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />
          )}
        </View>

        {/* Terms Agreement */}
        <View style={styles.termsContainer}>
          <Switch
            value={isChecked}
            onValueChange={setIsChecked}
            trackColor={{ false: "#D1D1D1", true: "#C5A85F" }}
            thumbColor={isChecked ? "#FFFFFF" : "#F4F3F4"}
          />
          <Text style={styles.termsText}>
            I agree to the Terms & Conditions and Privacy Policy
          </Text>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (!isFormValid || !userAddress) && styles.disabledButton,
          ]}
          onPress={handleCheckout}
          disabled={!isFormValid || !userAddress}
        >
          <Text style={styles.checkoutButtonText}>
            Pay {calculateFinalPrice()} SAR
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  planInfo: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  planDuration: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  planType: {
    fontSize: 14,
    color: "#666666",
  },
  priceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666666",
  },
  originalPrice: {
    fontSize: 14,
    color: "#999999",
    textDecorationLine: "line-through",
  },
  savingsPrice: {
    fontSize: 14,
    color: "#4CAF50",
  },
  subtotalPrice: {
    fontSize: 14,
    color: "#333333",
  },
  promoPrice: {
    fontSize: 14,
    color: "#4CAF50",
  },
  finalPriceRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  finalPriceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  finalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  sectionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    padding: 12,
    position: "relative",
  },
  addressType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  changeButton: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  changeButtonText: {
    fontSize: 14,
    color: "#C5A85F",
    fontWeight: "600",
  },
  addAddressButton: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  addAddressText: {
    fontSize: 14,
    color: "#C5A85F",
    fontWeight: "600",
  },
  promoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  promoButton: {
    backgroundColor: "#C5A85F",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  promoButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPayment: {
    borderColor: "#C5A85F",
    backgroundColor: "#FBF7EC",
  },
  paymentOptionText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 12,
  },
  cardInputs: {
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  cardDetailsRow: {
    flexDirection: "row",
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#666666",
  },
  checkoutContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },
  checkoutButton: {
    backgroundColor: "#C5A85F",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
});

export default Payment;
