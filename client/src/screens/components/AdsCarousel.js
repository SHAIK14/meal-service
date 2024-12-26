import React, { useState, useRef, useEffect } from 'react';
import { View, Image, FlatList, Dimensions, StyleSheet } from 'react-native';

const AdsCarousel = () => {
  const [ads] = useState([
    { id: '1', image: require('../../../assets/Ads-01.jpg') },
    { id: '2', image: require('../../../assets/Ads-03.jpg') },
    { id: '3', image: require('../../../assets/Ads-02.jpg') },
    { id: '4', image: require('../../../assets/Ads-04.jpg') },
  ]);

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = screenWidth * 0.8; 
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % ads.length; 
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000); 

    return () => clearInterval(interval); 
  }, [currentIndex, ads.length]);

  const renderItem = ({ item }) => (
    <View style={[styles.carouselItem, { width: itemWidth }]}>
      <Image source={item.image} style={styles.adImage} resizeMode="cover" />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={ads}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        onScrollToIndexFailed={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
  },
  carouselItem: {
    borderRadius: 10,
    marginHorizontal: 10,
    marginLeft:10,
    overflow: 'hidden',
    backgroundColor: 'red',
  },
  adImage: {
    width: '100%',
    height: 150,
  },
  contentContainer: {
    paddingHorizontal: 20, 
  },
});

export default AdsCarousel;
