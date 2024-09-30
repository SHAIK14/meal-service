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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { updateUserInfo, getUserStatus } from "../utils/api";
import backgroundImage from "../../assets/background.png";

const { height, width } = Dimensions.get("window");

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
      const userInfo = { firstName, lastName, email, gender };
      await updateUserInfo(userInfo);
      Alert.alert("Success", "Information saved successfully");
      navigation.navigate("Address");
    } catch (error) {
      Alert.alert("Error", "Failed to save information");
    }
  };

  const isValidEmail = (email) => {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

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
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Complete Your Profile</Text>

            <Text style={styles.subtitle}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={styles.subtitle}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={styles.subtitle}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.subtitle}>Select your Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>

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
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    padding: width * 0.05,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.8,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: height * 0.02,
    textAlign: "center",
  },
  subtitle: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#858585",
    marginBottom: height * 0.01,
  },
  input: {
    height: height * 0.06,
    borderBottomColor: "#858585",
    borderBottomWidth: 1,
    marginBottom: height * 0.02,
    fontSize: width * 0.04,
  },
  pickerContainer: {
    borderColor: "#858585",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: height * 0.02,
  },
  picker: {
    height: height * 0.06,
    width: "100%",
    color: "#858585",
  },
  nextButton: {
    backgroundColor: "#FAF9D9",
    paddingVertical: height * 0.015,
    borderRadius: 5,
    alignItems: "center",
    marginTop: height * 0.02,
  },
  buttonText: {
    color: "black",
    fontSize: width * 0.04,
    fontWeight: "bold",
  },
});

export default InformationScreen;
