import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, Modal, Button } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const Mapscreen = ({ navigation, route }) => {
  const { order } = route.params;
  const [isContainerVisible, setIsContainerVisible] = useState(true);
  const [pickupLocation, setPickupLocation] = useState({ latitude: 24.7136, longitude: 46.6753 });
  const [dropLocation, setDropLocation] = useState({ latitude: 24.7115, longitude: 46.6741 });
  const [isCallPopupVisible, setIsCallPopupVisible] = useState(false);
  const [isChatPopupVisible, setIsChatPopupVisible] = useState(false);

  const handleLocationSelect = (location, isPickup) => {
    if (isPickup) {
      setPickupLocation(location);
    } else {
      setDropLocation(location);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Order Navigation</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

       
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 24.7136,
          longitude: 46.6753,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {pickupLocation && <Marker coordinate={pickupLocation} title="Pickup Location" />}
        {dropLocation && <Marker coordinate={dropLocation} title="Drop Location" />}
        <Polyline
          coordinates={[pickupLocation, dropLocation]}
          strokeColor="darkgreen"
          strokeWidth={4}
        />
      </MapView>

       
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="locate" size={25} color="green" style={styles.icon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pickup Location"
            onSubmitEditing={() =>
              handleLocationSelect({ latitude: 24.7136, longitude: 46.6753 }, true)
            }
          />
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="location-outline" size={25} color="#d2042d" style={styles.icon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Drop Location"
            onSubmitEditing={() =>
              handleLocationSelect({ latitude: 24.7115, longitude: 46.6741 }, false)
            }
          />
        </View>
      </View>

       
      {isContainerVisible && (
        <View style={styles.orderDetailsContainer}>
          <TouchableOpacity style={styles.hideButton} onPress={() => setIsContainerVisible(false)}>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#888" />
          </TouchableOpacity>

          <View style={styles.orderHeader}>
            <Text style={styles.orderDetail}>Order ID: {order.id}</Text>
            <Text style={styles.orderDetail}>ETA: 20 mins</Text>
          </View>
          <View style={styles.contactButtons}>
            <TouchableOpacity onPress={() => setIsCallPopupVisible(true)}>
              <Ionicons name="call-outline" size={24} color="#000" style={styles.headerIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsChatPopupVisible(true)}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#000" style={styles.headerIcon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.completeButton}>
            <Text style={styles.completeButtonText}>Order Picked</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Show Details Button when Order Container is Hidden */}
      {!isContainerVisible && (
        <TouchableOpacity style={styles.unhideButton} onPress={() => setIsContainerVisible(true)}>
          <MaterialIcons name="keyboard-arrow-up" size={35} color="#00008b" />
          <Text style={styles.unhideButtonText}>Show Details</Text>
        </TouchableOpacity>
      )}

      {/* Call Popup */}
      <Modal visible={isCallPopupVisible} transparent animationType="slide">
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsCallPopupVisible(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.popupText}>Order ID: {order.id}</Text>
            <Text style={styles.popupText}>Call Number: 0540565745</Text>
            <Button title="Call" onPress={() => { /* Call action here */ }} />
          </View>
        </View>
      </Modal>

      {/* Chat Popup */}
      <Modal visible={isChatPopupVisible} transparent animationType="slide">
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsChatPopupVisible(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.popupText}>Order ID: {order.id}</Text>
            <Text style={styles.popupText}>Chat Box</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  
  // Adjusted Top Bar styling
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 40, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  backButton: { padding: 5 },
  helpButton: { padding: 5 },

  map: { flex: 1 },

  searchContainer: {
    position: 'absolute',
    top: 90,
    width: '90%',
    alignSelf: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth : 1,
    borderColor : 'grey'
  },
  searchInput: { flex: 1, paddingLeft: 5, fontSize: 14, color: '#000' },
  icon: { marginRight: 10 },

  orderDetailsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  hideButton: { position: 'absolute', top: 8, alignSelf: 'center' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  contactButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderDetail: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  headerIcon: { marginHorizontal: 10 },

  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  completeButtonText: { color: '#fff', fontSize: 16 },

  unhideButton: {
    position: 'absolute',
    bottom: 13,
    left: '50%',
    borderWidth: 1.5,
    borderColor: '#00008b',
    marginLeft: -75,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  unhideButtonText: { fontSize: 14, fontWeight: 'bold', color: '#00008b' },

  popupContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  popupText: { fontSize: 16, marginBottom: 10 },
});

export default Mapscreen;
