import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from "react-native";
import TopBar from "./TopBar";
import BottomNav from "./Bottomnav";

const Walletscreen = ({ navigation }) => {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const availableBalance = 120.5;

  const handleWithdrawal = () => {
    setModalVisible(true);
  };

  const handleSubmitWithdrawal = () => {
    console.log("Withdrawal submitted:", withdrawAmount);
  };

  const formatAmount = (amount) => {
    const cleanedAmount = amount.replace(/[^\d.]/g, "");
    if (cleanedAmount) {
      const parts = cleanedAmount.split(".");
      if (parts[1] && parts[1].length > 2) {
        return `${parts[0]}.${parts[1].substring(0, 2)}`;
      }
      return cleanedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return "";
  };

  const handleChange = (text) => {
    const formattedAmount = formatAmount(text);
    setWithdrawAmount(formattedAmount);

    const numericAmount = parseFloat(formattedAmount.replace(/,/g, ""));
    if (numericAmount > availableBalance) {
      setInsufficientFunds(true);
    } else {
      setInsufficientFunds(false);
    }
  };

  const transactions = [
    { date: "12/11/24", amount: 30.0, type: "inward" },
    { date: "11/11/24", amount: -40.0, type: "outward" },
    { date: "10/11/24", amount: 20.0, type: "inward" },
    { date: "09/11/24", amount: -25.0, type: "outward" },
    { date: "08/11/24", amount: 35.0, type: "inward" },
    { date: "07/11/24", amount: -50.0, type: "outward" },
  ];

  const transactionsToShow = showAllTransactions ? transactions : transactions.slice(0, 3);
  const isButtonDisabled = !withdrawAmount || insufficientFunds;

  return (
    <View style={styles.container}>
      <TopBar navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.walletAmountWrapper}>
          <Text style={styles.walletHeading}>My Earnings</Text>
          <View style={styles.balanceSection}>
            <Text style={styles.balanceText}>{availableBalance.toFixed(2)} SAR</Text>
          </View>
          <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdrawal}>
            <Text style={styles.withdrawButtonText}>Withdraw Amount</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Pending Payments</Text>
          <Text style={styles.paymentText}>Pending Delivery: 50.00 SAR</Text>
        </View>

        <View style={styles.transactionHistorySection}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {transactionsToShow.map((transaction, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.transactionDetails}>
                <Text style={styles.historyText}>
                  <Text style={styles.boldText}>
                    {transaction.type === "inward" ? "Inward Payment" : "Outward Payment"}
                  </Text>
                </Text>
                <Text style={styles.dateText}>{transaction.date}</Text>
              </View>
              <Text
                style={[
                  styles.amountText,
                  transaction.amount > 0 ? styles.inwardAmount : styles.outwardAmount,
                ]}
              >
                {transaction.amount > 0
                  ? `+${transaction.amount.toFixed(2)}`
                  : `-${Math.abs(transaction.amount).toFixed(2)}`}
              </Text>
            </View>
          ))}
          {transactions.length > 3 && (
            <TouchableOpacity
              style={styles.viewToggleButton}
              onPress={() => setShowAllTransactions(!showAllTransactions)}
            >
              <Text style={styles.viewToggleButtonText}>
                {showAllTransactions ? "View Less Transactions" : "View All Transactions"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <BottomNav navigation={navigation} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Withdrawl Amount</Text>
            <TextInput
              style={[styles.input, isFocused && styles.inputFocused]}
              placeholder="Enter Amount"
              placeholderTextColor="#D3D3D3"
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={15}
            />
            {insufficientFunds && <Text style={styles.errorText}>Insufficient Funds</Text>}
            <View style={styles.ButtonsContainer}>
              <TouchableOpacity
                style={[styles.sendButton, isButtonDisabled && styles.sendButtonDisabled]}
                onPress={handleSubmitWithdrawal}
                disabled={isButtonDisabled}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  walletHeading: { fontSize: 16, color: "white", marginBottom: 22 },
  walletAmountWrapper: {
    backgroundColor: "black",
    borderRadius: 20,
    marginVertical: 25,
    padding: 25,
  },
  balanceSection: { alignItems: "flex-start" },
  balanceText: { fontSize: 40, fontWeight: "bold", color: "white" },
  detailsSection: {
    backgroundColor: "#F4F6FC",
    borderRadius: 20,
    padding: 25,
    marginVertical: 10,
    borderWidth:2,
    borderColor:'#000'
  },
  sectionTitle: { fontSize: 18, fontWeight: "500" },
  paymentText: { fontSize: 16, color: "red" },
  transactionHistorySection: {
    marginVertical: 20,
    padding: 25,
    backgroundColor: "#F4F6FC",
    borderRadius: 10,
    borderWidth:2,
    borderColor:'#000'
  },
  historyItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  transactionDetails: { flexDirection: "column" },
  historyText: { fontSize: 16, color: "#555" },
  boldText: { fontWeight: "bold" },
  dateText: { fontSize: 14, color: "#888" },
  amountText: { fontSize: 18 },
  inwardAmount: { color: "green" },
  outwardAmount: { color: "red" },
  viewToggleButton: { alignItems: "center", paddingVertical: 10 , borderWidth:2, borderColor:'#000'},
  viewToggleButtonText: { color: "black", fontSize: 14, fontWeight: "bold" },
  withdrawButton: { backgroundColor: "#fff", alignItems: "center", borderRadius: 25, padding: 12, borderColor: "#000" },
  withdrawButtonText: { fontSize: 16, fontWeight: "bold", color: "#000" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center" },
  modalContainer: { backgroundColor: "white", padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  input: { height: 60, fontSize: 25, color: "black", borderBottomWidth: 2, marginBottom: 20 },
  sendButton: { backgroundColor: "#000", alignItems: "center", borderRadius: 25, padding: 12, borderColor: "#000", marginBottom: 10},
  sendButtonDisabled: { backgroundColor: "#B0B0B0" },
  sendButtonText: { color: "white", fontWeight: "bold" },
  closeButton: { backgroundColor: "#000", alignItems: "center", borderRadius: 25, padding: 12, borderColor: "#000"},
  closeButtonText: { color: "#fff",alignItems: "center", fontWeight: "bold" },
  errorText: { color: "red", fontSize: 12 },
});

export default Walletscreen;
