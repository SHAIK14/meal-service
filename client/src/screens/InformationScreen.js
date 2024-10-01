import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { updateUserInfo, getUserStatus } from "../utils/api";
import backgroundImage from "../../assets/background.png";

const { height, width } = Dimensions.get("window");

const CustomInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
}) => (
  <View style={styles.inputContainer}>
    <Ionicons name={icon} size={24} color="#858585" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  </View>
);

const GenderSelector = ({ gender, setGender }) => (
  <View style={styles.genderContainer}>
    <TouchableOpacity
      style={[styles.genderButton, gender === "male" && styles.selectedGender]}
      onPress={() => setGender("male")}
    >
      <Ionicons
        name="man"
        size={24}
        color={gender === "male" ? "#FAF9D9" : "#858585"}
      />
      <Text
        style={[
          styles.genderText,
          gender === "male" && styles.selectedGenderText,
        ]}
      >
        Male
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.genderButton,
        gender === "female" && styles.selectedGender,
      ]}
      onPress={() => setGender("female")}
    >
      <Ionicons
        name="woman"
        size={24}
        color={gender === "female" ? "#FAF9D9" : "#858585"}
      />
      <Text
        style={[
          styles.genderText,
          gender === "female" && styles.selectedGenderText,
        ]}
      >
        Female
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.genderButton, gender === "other" && styles.selectedGender]}
      onPress={() => setGender("other")}
    >
      <Ionicons
        name="person"
        size={24}
        color={gender === "other" ? "#FAF9D9" : "#858585"}
      />
      <Text
        style={[
          styles.genderText,
          gender === "other" && styles.selectedGenderText,
        ]}
      >
        Other
      </Text>
    </TouchableOpacity>
  </View>
);

const InformationScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userStatus = await getUserStatus();
        if (userStatus.isInfoComplete) {
          const userInfo = await updateUserInfo({});
          setFirstName(userInfo.firstName || "");
          setLastName(userInfo.lastName || "");
          setEmail(userInfo.email || "");
          setGender(userInfo.gender || "");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !gender) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      const userInfo = { firstName, lastName, email, gender };
      await updateUserInfo(userInfo);
      Alert.alert("Success", "Information saved successfully");
      navigation.navigate("Address");
    } catch (error) {
      Alert.alert("Error", "Failed to save information");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FAF9D9" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Complete Your Profile</Text>

            <CustomInput
              icon="person-outline"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
            />

            <CustomInput
              icon="person-outline"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
            />

            <CustomInput
              icon="mail-outline"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Text style={styles.subtitle}>Select your Gender</Text>
            <GenderSelector gender={gender} setGender={setGender} />

            <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>NEXT</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: width * 0.06,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    marginBottom: height * 0.03,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    color: "#333",
    marginBottom: height * 0.02,
    marginTop: height * 0.02,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#858585",
    marginBottom: height * 0.02,
  },
  inputIcon: {
    marginRight: width * 0.03,
  },
  input: {
    flex: 1,
    height: height * 0.06,
    fontSize: width * 0.04,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: height * 0.03,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: height * 0.015,
    borderWidth: 1,
    borderColor: "#858585",
    borderRadius: 10,
    marginHorizontal: width * 0.01,
  },
  selectedGender: {
    backgroundColor: "#333",
    borderColor: "#333",
  },
  genderText: {
    marginLeft: width * 0.02,
    fontSize: width * 0.035,
    color: "#858585",
  },
  selectedGenderText: {
    color: "#FAF9D9",
  },
  nextButton: {
    backgroundColor: "#FAF9D9",
    paddingVertical: height * 0.02,
    borderRadius: 25,
    alignItems: "center",
    marginTop: height * 0.03,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#333",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
});

export default InformationScreen;
