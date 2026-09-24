import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList } from 'react-native';
import CartazCard from '../components/CartazCard';

// Example data. Replace require(...) paths with your real image files in assets/cartazes/
const cartazes = [
  { id: '2025', ano: '2025', imagem: require('../assets/cartazes/2025.jpg') },
  { id: '2024', ano: '2024', imagem: require('../assets/cartazes/2024.jpg') },
  { id: '2023', ano: '2023', imagem: require('../assets/cartazes/2023.jpg') },
  { id: '2022', ano: '2022', imagem: require('../assets/cartazes/2022.jpg') },
];

const CartazesScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <CartazCard
      item={item}
      onPress={() => navigation.navigate('DetalhesCartaz', { item })}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Cartazes</Text>
      </View>

      <FlatList
        data={cartazes}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 6 },
  title: { fontSize: 34, fontWeight: '800', color: '#0f172a' },
  row: { justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 18 },
  listContent: { paddingTop: 12, paddingBottom: 140 }, // reserve space for footer/banner
});

export default CartazesScreen;
