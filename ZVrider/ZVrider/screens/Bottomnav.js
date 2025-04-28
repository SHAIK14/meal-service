
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Bottomnav = ({ navigation }) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Icon name="home-outline" size={25} color={'#000'} />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
        <Icon name="wallet-outline" size={25} color={'#000'}/>
        <Text style={styles.navText}>Wallet</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
        <Icon name="chatbubble-outline" size={25} color={'#000'}/>
        <Text style={styles.navText}>Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Icon name="person-outline" size={25} color={'#000'}/>
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopLeftRadius:15,
    borderTopRightRadius: 15,
    borderTopColor: '#fff',
    backgroundColor: '#fff',
  },
  navText: { fontSize: 11,fontWeight:'bold', marginTop: 5 , color: '#000'},
});

export default Bottomnav;
