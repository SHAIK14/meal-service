import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Orderdetailscontent = ({ order, navigation }) => {
  const handleBackPress = () => navigation.goBack();
  const handleHelpPress = () => alert('Help section');
  const handleCancelOrder = () => Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
    { text: 'No', style: 'cancel' },
    { text: 'Yes', onPress: () => alert('Order has been canceled') },
  ]);

  const stages = [
    { label: 'Order Ready', icon: 'check-circle' },
    { label: 'Order Picked', icon: 'truck' },
    { label: 'Order Delivered', icon: 'check' },
  ];

  const isOrderReady = order.status === 'Ready';

  return (
    <View style={styles.container}>
      {/* Top bar with Back button, Order Details title, and Help button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <TouchableOpacity style={styles.helpButton} onPress={handleHelpPress}>
          <Ionicons name="help-circle-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        {stages.map((stage, index) => (
          <View key={index} style={styles.progressStage}>
            <Icon
              name={stage.icon}
              size={24}
              color={index === 0 ? (isOrderReady ? 'green' : 'grey') : 'grey'}
            />
            <Text style={styles.stageLabel}>{stage.label}</Text>
          </View>
        ))}
      </View>

      {/* Order Details Container */}
      <View style={styles.orderDetailsContainer}>
        {/* Meal Icon */}
        <FontAwesome5 name="utensils" size={30} color="#000" style={styles.mealIcon} />

        {/* Order Status */}
        <Text style={[styles.orderStatus, { color: order.status === 'Ready' ? 'green' : '#d2042d' }]}>
          {order.status}
        </Text>

        {/* Order Details */}
        <ScrollView style={styles.detailsScroll}>
          <View style={styles.detailItem}>
            <MaterialIcons name="receipt" size={20} color="#000" />
            <Text style={styles.detailText}>Order ID: {order.id}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="person" size={20} color="#000" />
            <Text style={styles.detailText}>Customer ID: {order.customerID}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={20} color="#000" />
            <Text style={styles.detailText}>Pickup Time: {order.pickupTime}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="fast-food" size={20} color="#000" />
            <Text style={styles.detailText}>Meal Type: {order.mealType}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={20} color="#000" />
            <Text style={styles.detailText}>Pickup Address: {order.pickupAddress}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="home" size={20} color="#000" />
            <Text style={styles.detailText}>Drop Address: {order.address}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="comment" size={20} color="#000" />
            <Text style={styles.detailText}>Special Request: {order.specialRequest}</Text>
          </View>
        </ScrollView>
      </View>

      {/* Cancel Order Button */}
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
        <Text style={styles.cancelButtonText}>Cancel Order</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, backgroundColor: '#f5f5f5' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10
  },
  backButton: { padding: 8 },
  helpButton: { padding: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    marginTop: 10,
  },
  progressStage: { alignItems: 'center' },
  stageLabel: { fontSize: 10, color: 'grey' },
  orderDetailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    elevation: 3,
    borderWidth : 2,
    borderColor: '#000'
  },
  mealIcon: { alignSelf: 'center', marginBottom: 15 },
  orderStatus: { alignSelf: 'flex-end', fontSize: 12, fontWeight: 'bold' },
  detailsScroll: { paddingVertical: 10 },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { marginLeft: 10, fontSize: 15 },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000'
  },
  cancelButtonText: { color: '#d2042d', fontSize: 16, fontWeight: 'bold' },
});

export default Orderdetailscontent;
