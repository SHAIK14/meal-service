import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Text,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const TopBar = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

   
  const openSidebar = () => setSidebarVisible(true);
  const closeSidebar = () => setSidebarVisible(false);

   
  const openNotifications = () => setNotificationsVisible(true);
  const closeNotifications = () => setNotificationsVisible(false);

  return (
    <View style={styles.topBar}>
       
      <TouchableOpacity onPress={openSidebar}>
        <Icon name="menu-outline" size={28} color="#2e4f4f" />
      </TouchableOpacity>

       
      <TouchableOpacity onPress={openNotifications} style={styles.notificationIcon}>
        <Icon name="notifications-outline" size={28} color="#2e4f4f" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>5</Text>
        </View>
      </TouchableOpacity>

       
      <Modal
        animationType="fade"
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={closeSidebar}
      >
        <View style={styles.sidebarOverlay}>
          <SafeAreaView style={styles.sidebarContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closeSidebar}>
              <Icon name="arrow-back" size={30} color="#cbe4de" />
            </TouchableOpacity>

             
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>Abdullah Khan</Text>
              <Text style={styles.driverId}>Driver ID: ZFD101</Text>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>{isOnline ? 'Online' : 'Offline'}</Text>
                <Switch
                  value={isOnline}
                  onValueChange={setIsOnline}
                  thumbColor={isOnline ? '#000' : '#000'}
                  trackColor={{ false: '#fff', true: '#2e4f4f' }}
                />
              </View>
            </View>

             
            <View style={styles.sidebarOptions}>
              <TouchableOpacity style={styles.sidebarOption}>
                <Text style={styles.optionText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarOption}>
                <Text style={styles.optionText}>Language</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarOption}>
                <Text style={styles.optionText}>Help & Support</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

       
      <Modal
        animationType="fade"
        transparent={true}
        visible={notificationsVisible}
        onRequestClose={closeNotifications}
      >
        <View style={styles.overlay}>
          <View style={styles.notificationPopup}>
            <TouchableOpacity style={styles.closeButtonRight} onPress={closeNotifications}>
              <Icon name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.popupTitle}>Notifications</Text>
            <ScrollView contentContainerStyle={styles.notificationContent}>
              {[...Array(5)].map((_, index) => (
                <View key={index} style={styles.notificationItem}>
                  <Text style={styles.notificationText}>Order received from Zafran Valley</Text>
                  <Text style={styles.notificationTime}>30 mins ago</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  notificationIcon: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#2e4f4f',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: { color: 'white', fontSize: 12 },

   
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-start',
  },
  sidebarContainer: {
    width: '60%',
    height: '100%',
    backgroundColor: '#033043',
    paddingHorizontal: 20,
    paddingTop: 50,
    justifyContent: 'flex-start',
    borderTopRightRadius: 8,
    borderBottomRightRadius:8,
    elevation :6
  },
  closeButton: { alignSelf: 'flex-start', padding: 10 ,marginBottom : 20},

   
  driverInfo: {
    backgroundColor: '#f1f9ec',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  driverName: { fontSize: 25, fontWeight: 'bold', color: '#2e4f4f' },
  driverId: { fontSize: 17, color: '#2e4f4f', marginTop: 5 , fontWeight:'condensed'},
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  toggleLabel: { fontSize: 18, color: '#2e4f4f', fontWeight: '500' },

   
  sidebarOptions: { marginTop: 20 },
  sidebarOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  optionText: { fontSize: 22, color: '#f1f9ec',fontWeight:'bold' },

   
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationPopup: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  closeButtonRight: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
  },
  notificationContent: { paddingBottom: 10 },
  notificationItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    elevation: 1,
  },
  notificationText: { fontSize: 16, color: '#333' },
  notificationTime: { fontSize: 12, color: 'green', alignSelf: 'flex-end', marginTop: 5 },
});

export default TopBar;
