import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import TopBar from './TopBar';
import BottomNav from './Bottomnav';

const Homescreen = ({ navigation }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState("New Orders");
  const [newOrders, setNewOrders] = useState([
    { id: 'OD101', customerID: 'C101', mealType: 'Breakfast', pickupTime: '10:00 AM', address: '3rd Floor, Al rajhi Building, opp LULU, Olaya', pickupAddress: 'Zafran Valley', status: 'Not Ready', specialRequest: 'Call before arriving' },
    { id: 'OD102', customerID: 'C102', mealType: 'Lunch', pickupTime: '11:00 AM', address: 'Sulaimaniyah St...', pickupAddress: 'Zafran Valley', status: 'Ready', specialRequest: 'No plastic' },
    { id: 'OD103', customerID: 'C103', mealType: 'Dinner', pickupTime: '12:00 PM', address: 'Al Kharj Road...', pickupAddress: 'Zafran Valley', status: 'Not Ready', specialRequest: 'None' },
    { id: 'OD104', customerID: 'C104', mealType: 'Lunch', pickupTime: '1:00 PM', address: 'Malaz Road...', pickupAddress: 'Zafran Valley', status: 'Ready', specialRequest: 'Contactless delivery' },
    { id: 'OD105', customerID: 'C105', mealType: 'Dinner', pickupTime: '2:00 PM', address: 'Kingdom Centre...', pickupAddress: 'Zafran Valley', status: 'Not Ready', specialRequest: 'Leave at the door' },
  ]);

  const [myOrders, setMyOrders] = useState([]);

  const handleToggle = () => setIsOnline(!isOnline);

  const acceptOrder = (order) => {
    setNewOrders(newOrders.filter(o => o.id !== order.id));
    setMyOrders([...myOrders, order]);
  };

  return (
    <View style={styles.container}>
      <TopBar navigation={navigation} />

      {/* Lottie Animation */}
      <View style={styles.animationContainer}>
        <LottieView
          source={require('../assets/Animation - 1731873480690.json')} 
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      {/* Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setActiveTab("New Orders")} style={[styles.navTab, activeTab === "New Orders" && styles.activeNavTab]}>
          <Text style={[styles.tabText, activeTab === "New Orders" && styles.activeTabText]}>
            New Orders ({newOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("My Orders")} style={[styles.navTab, activeTab === "My Orders" && styles.activeNavTab]}>
          <Text style={[styles.tabText, activeTab === "My Orders" && styles.activeTabText]}>
            My Orders ({myOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Order List */}
      <ScrollView style={styles.orderListContainer}>
        {(activeTab === "New Orders" ? newOrders : myOrders).map((order) => (
          <View key={order.id} style={styles.orderContainer}>
            <Text style={styles.orderID}>Order ID: {order.id}</Text>
            <Text style={styles.deliveryAddress}>Drop Address: {order.address}</Text>
            <Text style={styles.pickupTime}>Pickup Time: {order.pickupTime}</Text>

            <View style={styles.orderActions}>
              <Text
                style={[
                  styles.orderStatus,
                  { color: order.status === 'Ready' ? 'green' : '#d2042d' },
                ]}
              >
                {order.status}
              </Text>
              {activeTab === "New Orders" ? (
                <TouchableOpacity style={styles.acceptOrderButton} onPress={() => acceptOrder(order)}>
                  <Text style={styles.acceptOrderText}>Accept</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.inProgressButton}
                  onPress={() => navigation.navigate('Mapscreen', { order })}
                >
                  <Text style={styles.inProgressText}>Directions</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => navigation.navigate('Orderdetails', { order, onAccept: acceptOrder })}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 , backgroundColor: '#fff'},
  animationContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 0,
  },
  lottie: { width: 300, height: 300 },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 7,
    backgroundColor: '#033043',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    elevation: 5,
  },
  navTab: { flex: 1, alignItems: 'center', padding: 7, borderRadius: 10 },
  activeNavTab: { backgroundColor: '#f1f9ec' },
  tabText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  activeTabText: { color: '#033043', fontWeight: 'bold' },
  orderListContainer: { flex: 1, marginHorizontal: 20 },
  orderContainer: {
    backgroundColor: '#f1f9ec',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
  },
  orderID: { fontSize: 10, fontWeight: '500', marginBottom: 15 },
  deliveryAddress: { fontSize: 18, fontWeight: 'bold', color: '#2e4f4f', marginBottom: 5 },
  pickupTime: { fontSize: 13, color: '#0e8388', fontWeight: '600', marginBottom: 7 },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  orderStatus: { fontSize: 11, fontWeight: 'bold', alignSelf: 'flex-start' },
  acceptOrderButton: {
    backgroundColor: '#0a7273',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  acceptOrderText: { color: '#cbe4de', fontSize: 11, fontWeight: 'bold' },
  inProgressButton: {
    backgroundColor: '#0a7273',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  inProgressText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  viewDetailsButton: {
    position: 'absolute',
    top: 10,
    right: 14,
    backgroundColor: '#033043',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  viewDetailsText: { color: '#cbe4de', fontSize: 11, fontWeight: 'bold' },
});

export default Homescreen;
