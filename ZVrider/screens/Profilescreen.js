import React, { useState, useRef } from "react";
import {
  View,
  Modal,
  Animated,
  PanResponder,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import TopBar from './TopBar';
import BottomNav from './Bottomnav';
import Icon from "react-native-vector-icons/MaterialIcons";

const Profilescreen = ({ navigation }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [name, setName] = useState("Abdullah");
  const [phone, setPhone] = useState("+966 51 234 569");
  const [email, setEmail] = useState("abdullah@gmail.com");
  const [deliveries, setDeliveries] = useState([
    { id: 1, date: "2024-11-01", details: "Delivered to Customer A" },
    { id: 2, date: "2024-11-02", details: "Delivered to Customer B" },
    { id: 3, date: "2024-11-02", details: "Delivered to Customer C" },
    { id: 4, date: "2024-11-02", details: "Delivered to Customer D" },
    { id: 5, date: "2024-11-02", details: "Delivered to Customer E" },
  ]);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (_, gestureState) => true,
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
    onPanResponderMove: (_, gestureState) => translateY.setValue(gestureState.dy),
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) closeHistoryModal();
      else Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
    },
  });

  const toggleAvailability = () => setIsOnline(!isOnline);
  const openEditModal = () => setModalVisible(true);
  const closeEditModal = () => setModalVisible(false);
  const openHistoryModal = () => setHistoryModalVisible(true);
  const closeHistoryModal = () => setHistoryModalVisible(false);

  return (
    <View style={styles.container}>
      <TopBar navigation={navigation} />

      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={{
              uri: "https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-309.jpg?w=360",
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{name}</Text>
              <TouchableOpacity onPress={openEditModal}>
                <Icon name="edit" size={20} color="black" style={styles.editButton} />
              </TouchableOpacity>
            </View>
            <Text style={styles.contactInfo}>{phone} | {email}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Icon name="directions-bike" size={30} color="black" />
            <Text style={styles.statValue}>120</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
          <View style={styles.statBox}>
            <Icon name="star" size={30} color="black" />
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Icon name="money" size={30} color="black" />
            <Text style={styles.statValue}>450</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.button} onPress={openHistoryModal}>
          <Text style={styles.buttonText}>View Delivery History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("AccountSettings")}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Account Settings</Text>
           </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <BottomNav navigation={navigation} />

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: translateY }] }]} {...panResponder.panHandlers}>
          <View style={styles.dragBar} />
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
          <TouchableOpacity style={styles.saveButton} onPress={closeEditModal}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* Delivery History Modal */}
      <Modal visible={historyModalVisible} transparent animationType="slide">
        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: translateY }] }]} {...panResponder.panHandlers}>
          <View style={styles.dragBar} />
          <Text style={styles.historyTitle}>Delivery History</Text>
          <ScrollView style={styles.historyList}>
            {deliveries.map(delivery => (
              <View key={delivery.id} style={styles.deliveryItem}>
                <Text style={styles.deliveryDate}>{delivery.date}</Text>
                <Text style={styles.deliveryDetails}>{delivery.details}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 20 },
  profileContainer: { flexDirection: "row", alignItems: "center", marginTop: 10, borderWidth:1.5, borderColor:'#000', backgroundColor: "#fff", padding: 15, borderRadius: 10 },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginRight: 15, borderWidth:2, borderColor:'#000' },
  profileInfo: { flex: 1 },
  nameContainer: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 22, fontWeight: "bold", color: "#333" },
  contactInfo: { fontSize: 16, color: "#777" },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginVertical: 20, paddingHorizontal: 10 },
  statBox: { alignItems: "center", flex: 1, backgroundColor: "#fff", padding: 10, borderRadius: 10,marginHorizontal: 5, borderWidth: 2, borderColor:'#000' },
  statValue: { fontSize: 22, fontWeight: "bold", color: "#333", marginTop: 5 },
  button: { backgroundColor: "#000", padding: 15, borderRadius: 10, marginTop: 10, width: "100%", alignItems: "center", flexDirection: "row", justifyContent: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalContainer: { backgroundColor: "#fff", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, position: "absolute", bottom: 0, width: "100%" },
  dragBar: { width: 40, height: 5, backgroundColor: "#ddd", borderRadius: 2.5, alignSelf: "center", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 15 },
  historyTitle: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 10 },
  historyList: { maxHeight: 300 },
  deliveryItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  deliveryDate: { fontSize: 16, fontWeight: "bold", color: "#333" },
  deliveryDetails: { fontSize: 14, color: "#666" },
});

export default Profilescreen;
