import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  PanResponder,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Accountsettings = ({ navigation }) => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [confirmButtonLabel, setConfirmButtonLabel] = useState("Confirm");
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [modalTranslateY, setModalTranslateY] = useState(0);

  const modalPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        setModalTranslateY(gestureState.dy);
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 150) setIsModalVisible(false);
        setModalTranslateY(0);
      },
    })
  ).current;

  const toggleNotifications = () => setIsNotificationsEnabled((prev) => !prev);

  const handlePasswordReset = () => {
    Alert.alert("Password Reset", "Password reset functionality not implemented.");
  };

  const handleAccountManagement = () => setIsModalVisible(true);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setConfirmButtonLabel(option === "Temporary Disable" ? "Confirm Disable Account" : "Confirm Deletion");
  };

  const handleModalClose = () => setIsModalVisible(false);

  const handleReasonSelect = (reason) => setSelectedReason(reason);

  const handleOtherReasonChange = (text) => setOtherReason(text);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBarButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.topBarButtonText}></Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Account Settings</Text>
        <TouchableOpacity onPress={() => Alert.alert("Help", "Help information not available.")} style={styles.topBarButton}>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Vehicle Information</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Make: Tesla</Text>
            <Text style={styles.cardTitle}>Model: Model X</Text>
            <Text style={styles.cardTitle}>License Plate: ABC123</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account Settings</Text>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Enable Push Notifications</Text>
            <Switch
              value={isNotificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: "#ccc", true: "#4CAF50" }}
              thumbColor={isNotificationsEnabled ? "#fff" : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity style={[styles.button, styles.buttonMargin]} onPress={handlePasswordReset}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleAccountManagement}>
            <Text style={styles.buttonText}>Account Management</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="none"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={[styles.modalOverlay, { transform: [{ translateY: modalTranslateY }] }]}>
          <View style={styles.modalContainer} {...modalPanResponder.panHandlers}>
            <Text style={styles.modalTitle}>Select Account Option</Text>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => handleOptionSelect("Temporary Disable")}
            >
              <Text style={styles.radioText}>Temporary Disable</Text>
              {selectedOption === "Temporary Disable" && <Text style={styles.radioSelected}>✔</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => handleOptionSelect("Delete Account")}
            >
              <Text style={styles.radioText}>Delete Account</Text>
              {selectedOption === "Delete Account" && <Text style={styles.radioSelected}>✔</Text>}
            </TouchableOpacity>

            {selectedOption === "Delete Account" && (
              <View style={styles.reasonsContainer}>
                <Text style={styles.reasonText}>Reason for deleting account:</Text>
                {["Not satisfied", "Privacy concerns", "Found a better alternative", "Other"].map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={styles.radioButton}
                    onPress={() => handleReasonSelect(reason)}
                  >
                    <Text style={styles.radioText}>{reason}</Text>
                    {selectedReason === reason && <Text style={styles.radioSelected}>✔</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedReason === "Other" && (
              <TextInput
                style={styles.reasonInput}
                placeholder="Specify your reason"
                value={otherReason}
                onChangeText={handleOtherReasonChange}
                multiline
              />
            )}

            <TouchableOpacity style={styles.button} onPress={handleModalClose}>
              <Text style={styles.buttonText}>{confirmButtonLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#000",
    marginTop: Platform.OS === "android" ? 40 : 0, // Fix for Android overlapping
  },
  topBarButton: { flexDirection: "row", alignItems: "center" },
  topBarButtonText: { marginLeft: 5, fontSize: 16, color: "#333" },
  topBarTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  scrollContainer: { padding: 20 },
  section: { marginVertical: 15 },
  sectionHeader: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth:2,
    borderColor:'#000'
  },
  cardTitle: { fontSize: 16, color: "#666", marginBottom: 10 },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth:2,
    borderColor:'#000'
  },
  toggleText: { fontSize: 16, color: "#333", fontWeight: "bold" },
  button: {
    backgroundColor: "black",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  buttonMargin: { marginBottom: 15 }, // Added margin for spacing below Reset Password button
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "100%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10
  },
  radioText: { fontSize: 16, color: "#333" },
  radioSelected: { marginLeft: 10, color: "green", fontSize: 16 },
  reasonsContainer: { width: "100%", marginVertical: 10 },
  reasonText: { fontSize: 16, color: "#333", fontWeight: "bold", marginBottom: 5 },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#333",
    marginTop: 10,
    textAlignVertical: "top",
    height: 100,
    width: "100%",
  },
});

export default Accountsettings;
