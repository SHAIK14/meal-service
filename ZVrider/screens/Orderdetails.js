// OrderDetails.js

import React from 'react';
import { View } from 'react-native';
import Orderdetailscontent from './Orderdetailscontent';

const Orderdetails = ({ navigation, route }) => {
  const { order, onAccept } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <Orderdetailscontent navigation={navigation} order={order} onAccept={onAccept} />
    </View>
  );
};

export default Orderdetails;
