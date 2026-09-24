import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ImageBackground, Platform } from 'react-native';

const CartazCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.container} onPress={onPress}>
      <ImageBackground source={item.imagem} style={styles.image} imageStyle={styles.imageStyle}>
        <View style={styles.gradient} />
        <View style={styles.captionWrap} accessible accessibilityLabel={`Cartaz ${item.ano}`}>
          <Text style={styles.caption}>{item.ano}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    aspectRatio: 2/3, // vertical poster
    borderRadius: 18,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 18,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: '40%',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  captionWrap: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  caption: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  }
});

export default CartazCard;
