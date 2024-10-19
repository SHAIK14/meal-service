import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Swipeable } from "react-native-gesture-handler";

const EditProfile = () => {
  const [name, setName] = useState("UserName");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [email, setEmail] = useState("user@example.com");
  const [isModalVisible, setModalVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  const [addresses, setAddresses] = useState([
    { type: "Home", address: "123 Main St, City, Country" },
    { type: "Office", address: "456 Elm St, City, Country" },
  ]);
  const [isEditingField, setIsEditingField] = useState({
    name: false,
    phone: false,
    email: false,
  }); // Track editing state

  const handleAddAddress = () => {
    alert("Add New Address Form");
  };

  const handleEditAddress = (index) => {
    alert(`Edit address: ${addresses[index].address}`);
  };

  const handleDeleteAddress = (index) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleVerifyPhone = () => {
    setModalVisible(true);
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...verificationCode];
    newOtp[index] = text;
    setVerificationCode(newOtp);

    // Move to next input
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const renderAddressItem = ({ item, index }) => (
    <Swipeable
      renderRightActions={() => (
        <View style={styles.rightActions}>
          <TouchableOpacity
            onPress={() => handleEditAddress(index)}
            style={styles.actionButton}
          >
            <AntDesign name="edit" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteAddress(index)}
            style={styles.actionButton}
          >
            <AntDesign name="delete" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    >
      <View style={styles.addressContainer}>
        {item.type === "Home" ? (
          <AntDesign name="home" size={20} color="black" />
        ) : (
          <AntDesign name="building" size={20} color="black" />
        )}
        <Text style={styles.addressText}>{item.address}</Text>
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.detailsContainer}>
        <Text style={styles.UserDetailsTitle}>User Details</Text>

        {/* Name Field */}
        <View style={styles.userInfo}>
          <AntDesign name="user" size={20} color="black" />
          <Text style={styles.label}>Name:</Text>
          {isEditingField.name ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          ) : (
            <Text style={styles.value}>{name}</Text>
          )}
          <TouchableOpacity
            onPress={() =>
              setIsEditingField({
                ...isEditingField,
                name: !isEditingField.name,
              })
            }
          >
            <AntDesign
              name={isEditingField.name ? "check" : "edit"}
              size={20}
            />
          </TouchableOpacity>
        </View>

        {/* Phone Field */}
        <View style={styles.userInfo}>
          <AntDesign name="phone" size={20} color="black" />
          <Text style={styles.label}>Phone:</Text>
          {isEditingField.phone ? (
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{phone}</Text>
          )}
          <TouchableOpacity
            onPress={() => {
              if (isEditingField.phone) {
                handleVerifyPhone();
              }
              setIsEditingField({
                ...isEditingField,
                phone: !isEditingField.phone,
              });
            }}
          >
            <AntDesign
              name={isEditingField.phone ? "check" : "edit"}
              size={20}
            />
          </TouchableOpacity>
        </View>

        {/* Email Field */}
        <View style={styles.userInfo}>
          <AntDesign name="mail" size={20} color="black" />
          <Text style={styles.label}>Email:</Text>
          {isEditingField.email ? (
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          ) : (
            <Text style={styles.value}>{email}</Text>
          )}
          <TouchableOpacity
            onPress={() =>
              setIsEditingField({
                ...isEditingField,
                email: !isEditingField.email,
              })
            }
          >
            <AntDesign
              name={isEditingField.email ? "check" : "edit"}
              size={20}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* OTP Modal */}
      <Modal visible={isModalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Enter Verification Code</Text>
          <View style={styles.otpContainer}>
            {verificationCode.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => (inputRefs.current[i] = el)} // Store refs for input boxes
                style={styles.otpInput}
                maxLength={1}
                keyboardType="numeric"
                value={digit}
                onChangeText={(text) => handleOtpChange(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setModalVisible(false);
              alert("Phone number verified!");
            }}
          >
            <Text style={styles.modalButtonText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Saved Addresses */}
      <View style={styles.savedAddressesHeader}>
        <Text style={styles.savedAddressesTitle}>Saved Addresses:</Text>

        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <TouchableOpacity onPress={handleAddAddress} style={styles.plusIcon}>
        <AntDesign name="pluscircleo" size={40} color="gray" />
      </TouchableOpacity>

      {/* Save Changes Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => alert("Changes Saved")}
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f3f3",
  },
  detailsContainer: {
    margin: 20,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 10,
  },
  UserDetailsTitle: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  label: {
    fontWeight: "bold",
    marginRight: 10,
  },
  value: {
    flex: 1,
  },
  input: {
    height: 40,
    flex: 1,
    borderColor: "black",
    borderWidth: 2,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  plusIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalTitle: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "80%",
    marginBottom: 20,
  },
  otpInput: {
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 5,
    color: "white",
    width: 40,
    height: 40,
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  savedAddressesHeader: {
    marginVertical: 20,
  },
  savedAddressesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  addressContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  addressText: {
    marginLeft: 10,
    fontSize: 16,
  },
  rightActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "red",
    width: 100,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  actionButton: {
    padding: 15,
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    margin: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
