import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useOrderStore from "../store/orderStore";

const PaymentMethodSelector = () => {
  const {
    paymentMethods,
    selectedPaymentMethod,
    loading,
    error,
    fetchPaymentMethods,
    setSelectedPaymentMethod,
  } = useOrderStore();

  useEffect(() => {
    // Fetch payment methods when component mounts
    fetchPaymentMethods();
  }, []);

  const handleSelectMethod = (method) => {
    setSelectedPaymentMethod(method);
  };

  // Get icon name based on payment method ID
  const getIconName = (methodId) => {
    switch (methodId) {
      case "credit_card":
        return "card-outline";
      case "apple_pay":
        return "logo-apple";
      case "mada":
        return "card-outline";
      case "stc_pay":
        return "phone-portrait-outline";
      case "cash":
        return "cash-outline";
      default:
        return "wallet-outline";
    }
  };

  const renderPaymentMethod = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.methodCard,
        selectedPaymentMethod?.id === item.id && styles.selectedMethodCard,
      ]}
      onPress={() => handleSelectMethod(item)}
    >
      <View style={styles.methodIconContainer}>
        <Ionicons
          name={getIconName(item.id)}
          size={24}
          color={selectedPaymentMethod?.id === item.id ? "#fff" : "#666"}
        />
      </View>

      <View style={styles.methodDetails}>
        <Text
          style={[
            styles.methodName,
            selectedPaymentMethod?.id === item.id && styles.selectedMethodText,
          ]}
        >
          {item.name}
        </Text>
      </View>

      <View style={styles.radioContainer}>
        <View
          style={[
            styles.radioOuter,
            selectedPaymentMethod?.id === item.id && styles.selectedRadioOuter,
          ]}
        >
          {selectedPaymentMethod?.id === item.id && (
            <View style={styles.radioInner} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#ff6b6b" />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchPaymentMethods}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>

      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentMethod}
        keyExtractor={(item) => item.id}
        style={styles.methodsList}
        scrollEnabled={false}
      />
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
  methodsList: {
    marginTop: 8,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f8f8f8",
  },
  selectedMethodCard: {
    backgroundColor: "#ff6b6b",
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedMethodText: {
    color: "#fff",
  },
  radioContainer: {
    marginLeft: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  selectedRadioOuter: {
    borderColor: "#fff",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ff6b6b",
  },
  loadingContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: {
    color: "#ff6b6b",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default PaymentMethodSelector;
