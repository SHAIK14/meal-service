import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useOrderStore from "../store/orderStore";

const PromoCodeInput = () => {
  const [promoCode, setPromoCode] = useState("");
  const {
    voucher,
    voucherLoading,
    voucherError,
    discountAmount,
    validateVoucher,
    clearVoucher,
  } = useOrderStore();

  const handleValidateVoucher = async () => {
    if (!promoCode.trim()) return;
    await validateVoucher(promoCode.trim());
  };

  const handleClearVoucher = () => {
    setPromoCode("");
    clearVoucher();
  };

  // If a voucher is already applied, show summary
  if (voucher) {
    return (
      <View style={styles.container}>
        <View style={styles.appliedVoucherContainer}>
          <View style={styles.voucherInfo}>
            <Text style={styles.appliedVoucherText}>
              Applied: {voucher.promoCode}
            </Text>
            <Text style={styles.discountText}>
              Discount: SAR {discountAmount.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleClearVoucher}
          >
            <Ionicons name="close-circle" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Have a promo code?</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter promo code"
          value={promoCode}
          onChangeText={setPromoCode}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[
            styles.applyButton,
            (!promoCode.trim() || voucherLoading) && styles.disabledButton,
          ]}
          onPress={handleValidateVoucher}
          disabled={!promoCode.trim() || voucherLoading}
        >
          {voucherLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.applyButtonText}>Apply</Text>
          )}
        </TouchableOpacity>
      </View>

      {voucherError && <Text style={styles.errorText}>{voucherError}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: "#ff6b6b",
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    color: "#ff6b6b",
    marginTop: 8,
    fontSize: 14,
  },
  appliedVoucherContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  voucherInfo: {
    flex: 1,
  },
  appliedVoucherText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  discountText: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 4,
  },
  removeButton: {
    padding: 4,
  },
});

export default PromoCodeInput;
