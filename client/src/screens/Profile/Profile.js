import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const Profile = ({ navigation }) => {
  const clientName = "UserName";
  const clientPhone = "+91 98765 43210";

  return (
    <View style={styles.container}>
      {/* Client Info */}
      <TouchableOpacity
        style={styles.userInfo}
        onPress={() => navigation.navigate("EditProfile")}
      >
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/5951/5951752.png",
          }}
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.clientName}>{clientName}</Text>
          <Text style={styles.clientPhone}>{clientPhone}</Text>
        </View>
        <AntDesign
          name="edit"
          size={24}
          color="black"
          style={styles.editIcon}
        />
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Subscription")}
        >
          <FontAwesome
            name="list-alt"
            size={24}
            color="black"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Subscription</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("ContactSupport")}
        >
          <AntDesign
            name="customerservice"
            size={24}
            color="black"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("PrivacyPolicy")}
        >
          <Icon name="lock" size={24} color="black" style={styles.icon} />
          <Text style={styles.buttonText}>Privacy & Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={() => alert("Logged out")}
        >
          <AntDesign name="logout" size={24} color="red" style={styles.icon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.banner}>
        <Image
          source={require("../../../assets/logoVertical.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "space-between",
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 10,
    marginBottom: 10,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },

  clientName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },

  clientPhone: {
    fontSize: 16,
    color: "#666",
  },

  editIcon: {
    marginLeft: "auto",
    paddingLeft: 10,
  },

  buttonsContainer: {
    flex: 1,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginVertical: 10,
    padding: 15,
  },

  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 15,
  },

  icon: {
    marginLeft: 10,
  },

  logoutButton: {
    backgroundColor: "white",
  },

  logoutButtonText: {
    color: "red",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 15,
  },

  banner: {
    backgroundColor: "black",
    alignItems: "center",
    padding: 25,
    justifyContent: "center",
  },

  logo: {
    width: "100%",
  },
});
