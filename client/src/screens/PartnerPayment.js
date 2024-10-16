import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Animatable from "react-native-animatable";

const PartnerPayment = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("options"); // State to manage active tab
  const [paymentMethod, setPaymentMethod] = useState("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [stcDetails, setStcDetails] = useState("");
  const [savedPayments, setSavedPayments] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate("NextScreen"); // Change to your next screen
    }, 3000); // Change duration as needed

    return () => clearTimeout(timer);
  }, [navigation]);

  const handlePaymentSubmit = () => {
    const paymentInfo = {
      method: paymentMethod,
      cardNumber:
        paymentMethod === "visa" || paymentMethod === "master"
          ? cardNumber
          : null,
      expiryDate:
        paymentMethod === "visa" || paymentMethod === "master"
          ? expiryDate
          : null,
      cvv: paymentMethod === "visa" || paymentMethod === "master" ? cvv : null,
      cardHolderName:
        paymentMethod === "visa" || paymentMethod === "master"
          ? cardHolderName
          : null,
      stcDetails: paymentMethod === "stc" ? stcDetails : null,
    };

    console.log("Payment submitted:", paymentInfo);
    alert("Payment method saved successfully!");
    setSavedPayments([...savedPayments, paymentInfo]);
    clearForm();
  };

  const clearForm = () => {
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setCardHolderName("");
    setStcDetails("");
    setPaymentMethod("visa");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animatable.View animation="bounceIn" style={styles.tickContainer}>
        {/* You can add an icon or tick mark here */}
      </Animatable.View>
      <Text style={styles.successText}>Partner Payment</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "options" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("options")}
        >
          <Text style={styles.tabText}>Payment Options</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "saved" && styles.activeTab]}
          onPress={() => setActiveTab("saved")}
        >
          <Text style={styles.tabText}>Saved Payments</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === "options" ? (
        <View style={styles.paymentOptions}>
          {/* Payment Method Selection */}
          <View style={styles.paymentMethodSelection}>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod === "visa" && styles.activeMethod,
              ]}
              onPress={() => setPaymentMethod("visa")}
            >
              <Text style={styles.methodText}>Visa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod === "master" && styles.activeMethod,
              ]}
              onPress={() => setPaymentMethod("master")}
            >
              <Text style={styles.methodText}>MasterCard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod === "stc" && styles.activeMethod,
              ]}
              onPress={() => setPaymentMethod("stc")}
            >
              <Text style={styles.methodText}>STC Pay</Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic Payment Details Form */}
          {paymentMethod === "visa" || paymentMethod === "master" ? (
            <View style={styles.paymentForm}>
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
                onChangeText={setCardNumber}
                keyboardType="numeric"
              />
              <View style={styles.expiryCvvContainer}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Expiry Date (MM/YY)"
                  value={expiryDate}
                  onChangeText={(text) => {
                    const numericText = text.replace(/\D/g, "");
                    if (numericText.length <= 4) {
                      const formattedText = numericText.replace(
                        /(\d{2})(\d{0,2})/,
                        "$1/$2"
                      );
                      setExpiryDate(formattedText);
                    }
                  }}
                  maxLength={7}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  maxLength={3}
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>
            </View>
          ) : paymentMethod === "stc" ? (
            <View style={styles.paymentForm}>
              <TextInput
                style={styles.input}
                placeholder="Enter STC Pay Details"
                value={stcDetails}
                onChangeText={setStcDetails}
              />
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handlePaymentSubmit}
          >
            <Text style={styles.buttonText}>Save Payment Method</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.savedPayments}>
          <Text style={styles.savedMethodsTitle}>Saved Payment Methods:</Text>
          <FlatList
            data={savedPayments}
            renderItem={({ item }) => (
              <View style={styles.savedPaymentCard}>
                <Text style={styles.savedPaymentText}>
                  {item.method === "stc"
                    ? "STC Pay"
                    : `${item.method}: ${item.cardHolderName}`}
                </Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyMessage}>No saved payment methods</Text>
            }
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 30,
  },
  tickContainer: {
    marginBottom: 20,
    fontSize: 100,
    color: "#4CAF50",
  },
  successText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginBottom: 30,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  tabButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#4CAF50",
  },

  tabText: {
    fontSize: 16,
    color: "#333",
  },
  paymentOptions: {
    width: "100%",
  },
  paymentMethodSelection: {
    flexDirection: "row",
    width: "100",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  paymentMethodButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  activeMethod: {
    backgroundColor: "#4CAF50",
  },
  methodText: {
    fontSize: 16,
    color: "#333",
  },
  paymentForm: {
    width: "100%",
    marginBottom: 20,
  },
  expiryCvvContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  savedPayments: {
    width: "100%",
  },
  savedMethodsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  savedPaymentCard: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  savedPaymentText: {
    fontSize: 16,
    color: "#333",
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
});

export default PartnerPayment;
