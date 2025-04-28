import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import {
  getUserAddress,
  getAvailableVouchers,
  validateVoucher,
  createSubscription,
} from "../utils/api";

const Payment = ({ route, navigation }) => {
  const { subscriptionData } = route.params;

  // Format subscription days to be serializable
  const formattedSubscriptionData = {
    ...subscriptionData,
    subscriptionDays: subscriptionData.subscriptionDays.map((day) => ({
      ...day,
      date: format(new Date(day.date), "yyyy-MM-dd"),
    })),
  };

  // Address State
  const [userAddress, setUserAddress] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState(null);

  // Voucher States
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  // Payment States
  const [isChecked, setIsChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("STC Pay");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [stcPhoneNumber, setStcPhoneNumber] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finalAmount, setFinalAmount] = useState(subscriptionData.totalPrice);

  // Format address for display
  // const formatAddress = (address) => {
  //   if (!address) return null;
  //   return {
  //     type: address.saveAs,
  //     details: `${address.street}, ${address.area}`,
  //   };
  // };

  useEffect(() => {
    fetchUserAddress();
    fetchAvailableVouchers();
    validateForm();
  }, [isChecked, cardHolderName, cardNumber, cvv, expiryDate, stcPhoneNumber]);

  const fetchUserAddress = async () => {
    try {
      const response = await getUserAddress();
      setUserAddress(response?.address || null);
      console.log(userAddress);
    } catch (error) {
      console.error("Error fetching address:", error);
      setUserAddress(null);
    }
  };

  const fetchAvailableVouchers = async () => {
    setIsLoadingVouchers(true);
    try {
      const response = await getAvailableVouchers();
      if (response.success) {
        setAvailableVouchers(response.data);
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setVoucherError(error.message || "Failed to load vouchers");
    } finally {
      setIsLoadingVouchers(false);
    }
  };

  const calculateDiscount = (voucher) => {
    if (!voucher) return 0;

    const originalPrice = subscriptionData.totalPrice;

    if (voucher.discountType === "percentage") {
      const rawDiscount = (originalPrice * voucher.discountValue) / 100;
      return voucher.maxThreshold
        ? Math.min(rawDiscount, voucher.maxThreshold)
        : rawDiscount;
    } else {
      return Math.min(voucher.discountValue, originalPrice);
    }
  };

  const updateFinalAmount = () => {
    const discount = selectedVoucher ? calculateDiscount(selectedVoucher) : 0;
    setFinalAmount(subscriptionData.totalPrice - discount);
  };

  useEffect(() => {
    updateFinalAmount();
  }, [selectedVoucher]);

  const handleSelectVoucher = async (voucher) => {
    try {
      const validationResult = await validateVoucher(voucher.promoCode);
      if (validationResult.success) {
        setSelectedVoucher(voucher);
        setShowVoucherModal(false);
      } else {
        Alert.alert("Error", validationResult.message);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
  };

  // Find the validateForm function and update it:
  const validateForm = () => {
    if (!userAddress) {
      setIsFormValid(false);
      return;
    }

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

  const handleCheckout = async () => {
    if (!userAddress) {
      Alert.alert("Error", "Please add a delivery address");
      return;
    }

    if (!isFormValid) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Extract street and area from fullAddress
      const addressParts = userAddress.fullAddress.split(",");

      const paymentData = {
        plan: {
          id: formattedSubscriptionData.id,
          planId: formattedSubscriptionData.id,
          name: formattedSubscriptionData.name,
          selectedPackages: formattedSubscriptionData.selectedPackages,
          durationType: formattedSubscriptionData.durationType,
          startDate: formattedSubscriptionData.startDate,
          endDate: formattedSubscriptionData.endDate,
          deliveryTime: formattedSubscriptionData.deliveryTime,
          totalDays: formattedSubscriptionData.totalDays,
          subscriptionDays: formattedSubscriptionData.subscriptionDays,
        },
        pricing: {
          dailyRate: subscriptionData.dailyRate, // Use the dailyRate directly from subscriptionData
          totalPrice: formattedSubscriptionData.totalPrice,
          finalAmount: finalAmount,
          discount: selectedVoucher ? calculateDiscount(selectedVoucher) : 0,
        },
        voucherDetails: selectedVoucher
          ? {
              _id: selectedVoucher._id,
              promoCode: selectedVoucher.promoCode,
              discountType: selectedVoucher.discountType,
              discountValue: selectedVoucher.discountValue,
            }
          : null,
        deliveryAddress: {
          type: userAddress.saveAs,
          street: addressParts[0].trim(), // First part of the address
          area: addressParts[1].trim(), // Second part of the address
          coordinates: userAddress.coordinates,
        },
        paymentDetails: {
          method: paymentMethod,
          ...(paymentMethod === "Visa/Mastercard"
            ? {
                cardHolderName,
                cardNumber: cardNumber.replace(/\s/g, ""),
              }
            : {
                stcPhoneNumber,
              }),
        },
      };

      // Debug log to see what we're sending
      console.log(
        "Payment Data being sent:",
        JSON.stringify(paymentData, null, 2)
      );

      const response = await createSubscription(paymentData);

      if (response.success) {
        Alert.alert(
          "Success!",
          "Your subscription has been created successfully!",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("UserPlans"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error in checkout:", error);
      // Add more detailed error message
      Alert.alert(
        "Error",
        `Failed to process payment: ${error.message}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
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
          {selectedVoucher ? (
            <View style={styles.selectedVoucherCard}>
              <View>
                <Text style={styles.voucherCode}>
                  {selectedVoucher.promoCode}
                </Text>
                <Text style={styles.voucherDescription}>
                  {selectedVoucher.discountType === "percentage"
                    ? `${selectedVoucher.discountValue}% off${
                        selectedVoucher.maxThreshold
                          ? ` (up to ${selectedVoucher.maxThreshold} SAR)`
                          : ""
                      }`
                    : `${selectedVoucher.discountValue} SAR off`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeVoucherButton}
                onPress={handleRemoveVoucher}
              >
                <Text style={styles.removeVoucherText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addPromoButton}
              onPress={() => setShowVoucherModal(true)}
            >
              <Text style={styles.addPromoText}>Select Promo Code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Summary Section */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>{subscriptionData.name}</Text>
            <Text style={styles.planType}>
              {subscriptionData.durationType.replace("_", " ")}
            </Text>
            <Text style={styles.planDuration}>
              Selected: {subscriptionData.selectedPackages.join(" & ")}
            </Text>
            <Text style={styles.planDetails}>
              Total Days: {subscriptionData.totalDays}
            </Text>
          </View>

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.subtotalPrice}>
                {subscriptionData.totalPrice} SAR
              </Text>
            </View>

            {selectedVoucher && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Promo Discount</Text>
                <Text style={styles.promoPrice}>
                  -{calculateDiscount(selectedVoucher).toFixed(2)} SAR
                </Text>
              </View>
            )}

            <View style={[styles.priceRow, styles.finalPriceRow]}>
              <Text style={styles.finalPriceLabel}>Total</Text>
              <Text style={styles.finalPrice}>
                {finalAmount.toFixed(2)} SAR
              </Text>
            </View>
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
            (loading || !isFormValid || !userAddress) && styles.disabledButton,
          ]}
          onPress={handleCheckout}
          disabled={loading || !isFormValid || !userAddress}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.checkoutButtonText}>
              Pay {finalAmount.toFixed(2)} SAR
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Voucher Modal */}
      <Modal
        visible={showVoucherModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVoucherModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Vouchers</Text>
              <TouchableOpacity onPress={() => setShowVoucherModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {isLoadingVouchers ? (
              <ActivityIndicator size="large" color="#C5A85F" />
            ) : voucherError ? (
              <Text style={styles.errorText}>{voucherError}</Text>
            ) : availableVouchers.length === 0 ? (
              <Text style={styles.noVouchersText}>No vouchers available</Text>
            ) : (
              <ScrollView>
                {availableVouchers.map((voucher, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.voucherItem}
                    onPress={() => handleSelectVoucher(voucher)}
                  >
                    <Text style={styles.voucherCode}>{voucher.promoCode}</Text>
                    <Text style={styles.voucherDescription}>
                      {voucher.discountType === "percentage"
                        ? `${voucher.discountValue}% off${
                            voucher.maxThreshold
                              ? ` (up to ${voucher.maxThreshold} SAR)`
                              : ""
                          }`
                        : `${voucher.discountValue} SAR off`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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

  // Common Section Styles
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

  // Address Section
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

  // Voucher Section
  selectedVoucherCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voucherCode: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  voucherDescription: {
    fontSize: 12,
    color: "#666666",
  },
  addPromoButton: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  addPromoText: {
    fontSize: 14,
    color: "#C5A85F",
    fontWeight: "600",
  },
  removeVoucherButton: {
    padding: 8,
  },
  removeVoucherText: {
    fontSize: 14,
    color: "#FF4444",
    fontWeight: "600",
  },

  // Order Summary Section
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

  // Payment Method Section
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

  // Terms Section
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

  // Checkout Section
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

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  voucherItem: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  noVouchersText: {
    textAlign: "center",
    color: "#666666",
    marginTop: 20,
  },
  errorText: {
    color: "#FF4444",
    textAlign: "center",
    marginTop: 20,
  },
});

export default Payment;
