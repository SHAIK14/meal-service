import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Easing,
  Animated,
  Platform,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { requestOTP } from "../utils/api";
import backgroundImage from "../../assets/background.png";
import Lottie from "lottie-react-native";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

const countryCodes = [
  { code: "+966", country: "Saudi Arabia", maxLength: 9, flag: "🇸🇦" },
  { code: "+971", country: "UAE", maxLength: 10, flag: "🇦🇪" },
  { code: "+973", country: "Bahrain", maxLength: 8, flag: "🇧🇭" },
  { code: "+968", country: "Oman", maxLength: 8, flag: "🇴🇲" },
  { code: "+974", country: "Qatar", maxLength: 8, flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", maxLength: 8, flag: "🇰🇼" },
  { code: "+964", country: "Iraq", maxLength: 10, flag: "🇮🇶" },
  { code: "+962", country: "Jordan", maxLength: 9, flag: "🇯🇴" },
  { code: "+963", country: "Syria", maxLength: 9, flag: "🇸🇾" },
  { code: "+961", country: "Lebanon", maxLength: 8, flag: "🇱🇧" },
  { code: "+91", country: "India", maxLength: 10, flag: "🇮🇳" },
];

const LoginScreen = ({ navigation }) => {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentText, setCurrentText] = useState('Flavourful');
  const [isAnimating, setIsAnimating] = useState(false); // To track animation state
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const cuttingAnimation = useRef(new Animated.Value(1)).current;
  const [nextText, setNextText] = useState('Delicious'); // Initially set a synonym
  const fadeAnim = useState(new Animated.Value(1))[0]; // Start with full opacity (1)
  const scaleAnim = new Animated.Value(0.5); 
  const [displayedText, setDisplayedText] = useState('');
  const flipAnim = new Animated.Value(0); // Flip animation value
  const [currentIndex, setCurrentIndex] = useState(0);


  const typingAnim = new Animated.Value(0); // Typing effect (progress of text)
  const synonyms = ['Flavourful', 'Delicious', 'Tasty', 'Scrumptious', 'Yummy'];
  let textIndex = 0; // Starting index

  useEffect(() => {
    const changeText = () => {
      // Fade out the current text
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade out to 0 opacity
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change to the next word
        textIndex = (textIndex + 1) % synonyms.length; // Cycle through synonyms
        setCurrentText(synonyms[textIndex]);

        // Fade in the new text
        Animated.timing(fadeAnim, {
          toValue: 1, // Fade in to full opacity
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    };

    const interval = setInterval(changeText, 1000); // Change text every 3 seconds
    return () => clearInterval(interval); // Clean up interval on unmount
  }, [fadeAnim]);



  const [translateY] = useState(new Animated.Value(600)); // Start off-screen position
  useEffect(() => {
    // Trigger the slide-up animation when the component is mounted
    Animated.spring(translateY, {
      toValue: 0, // Final position (fully visible)
      friction: 8, // Adjust the smoothness of the animation
      tension: 40, // Adjust how fast the animation happens
      useNativeDriver: true, // Use the native driver for better performance
    }).start();
  }, []);

  const handleSendOtp = async () => {
    setError("");
    setIsLoading(true);
    try {
      if (phoneNumber.length !== selectedCountry.maxLength) {
        throw new Error(
          `Phone number must be ${selectedCountry.maxLength} digits for ${selectedCountry.country}`
        );
      }
      const fullPhoneNumber = selectedCountry.code + phoneNumber;
      console.log(`Sending OTP to ${fullPhoneNumber}`);
      const response = await requestOTP(fullPhoneNumber);
      setIsLoading(false);
      console.log("OTP request successful:", response);
      navigation.navigate("OtpScreen", {
        phoneNumber: fullPhoneNumber,
      });
    } catch (err) {
      setIsLoading(false);
      console.error("Error sending OTP:", err);
      setError(err.message || "An error occurred while sending OTP");
      Alert.alert(
        "Error",
        err.message || "An error occurred while sending OTP"
      );
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
  };

  const isPhoneNumberFilled = phoneNumber.length > 0;

  // Filter the countries based on the search query
  const filteredCountries = countryCodes.filter(
    (country) =>
      country.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.includes(searchQuery)
  );

  return (
    <KeyboardAvoidingView style={styles.container}>
      
   
    
    {/* Main Form */}
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.taglineContainer}>
      <Text style={styles.taglineFresh}>Fresh</Text>

      {/* Fading Text */}
      <View style={styles.taglineFlavourful}>
        <Animated.Text
          style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: '#DC2626',
            fontStyle:"italic",
            opacity: fadeAnim, 
            marginVertical:5,
          }}
        >
          {currentText}
        </Animated.Text>
      </View>

      <Text style={styles.taglineTailored}>Tailored</Text>
    </View>
        <Animated.View style={[styles.formContainer]}>
          <Text style={styles.title}>Log in to Zafran Valley</Text>
          <View style={styles.phoneContainer}>
        
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={toggleDropdown}
              >
                <Text style={styles.dropdownButtonText}>
                  {selectedCountry.flag} {selectedCountry.code}
                </Text>
                <Ionicons name="chevron-down" size={24} color="black" />
              </TouchableOpacity>

              <TextInput
                style={styles.phoneInput}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={15} // Adjust maxLength based on the country code
              />
            </View>
          </View>
          <View style={styles.verifyButtonContainer}>
            <TouchableOpacity
              style={[
                styles.verifyButton,
                !isPhoneNumberFilled && styles.disabledButton,
              ]}
              onPress={handleSendOtp}
              disabled={!isPhoneNumberFilled || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="black" />
              ) : (
                <Ionicons name="arrow-forward" size={24} color="#dc2626" />
              )}
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>

    {/* Modal for country selection */}
    <Modal visible={isDropdownOpen} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeIcon} onPress={toggleDropdown}>
            <Text style={styles.closeIconText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Select Country</Text>

          <TextInput
            style={styles.searchBar}
            placeholder="Search by country name or code"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <ScrollView style={styles.countryListScroll}>
            {filteredCountries.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={styles.countryOption}
                onPress={() => selectCountry(country)}
              >
                <Text style={styles.countryOptionText}>
                  {country.flag} {country.country} ({country.code})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  </KeyboardAvoidingView>
  
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "flex-end",
  },

  taglineContainer: {
    flex: 1,
    height:450,
    justifyContent: "center",
    paddingHorizontal:40,
    paddingTop: "20%",
  },

  taglineFresh: {
    fontSize: 48,
    fontWeight: 'bold',
  },

  taglineTailored: {
    fontSize: 48,
    fontWeight: 'bold',
  },

  formContainer: {
    flex: 1,
    paddingTop:40,
    backgroundColor:"#dc2626",
    alignItems: "center",
    height:420,
    borderTopRightRadius:50,
    borderTopLeftRadius:50,
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color:"white",
  },

  phoneContainer: {
    width: "100%",
    marginTop:20,
    marginBottom: 20,
    
  },

  label: {
    fontSize: 24,
    marginBottom: 10,
    paddingHorizontal:10,
    color:"white",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 40,
    backgroundColor:'white',
    borderColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  dropdownButtonText: {
    fontSize: 16,
    marginRight: 10,
  },

  phoneInput: {
    flex: 1,
    fontSize: 16,
  },

  verifyButtonContainer:{
    width: "100%",
  },

  verifyButton:{
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    backgroundColor: "#ccc",
  },

  errorText: {
    color: "red",
    marginTop: 10,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },

  closeIcon: {
    alignSelf: "flex-end",
  },

  closeIconText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchBar: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  countryListScroll: {
    maxHeight: 300,
  },
  countryOption: {
    paddingVertical: 10,
  },
  countryOptionText: {
    fontSize: 16,
  },
});

export default LoginScreen;
