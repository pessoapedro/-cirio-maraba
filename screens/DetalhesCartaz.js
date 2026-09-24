import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity, Share, Modal, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DetalhesCartaz = ({ route }) => {
  const { item } = route.params || {};
  const [modalVisible, setModalVisible] = useState(false);

  const onShare = async () => {
    try {
      await Share.share({ message: `Cartaz ${item.ano}`, url: item.imagem });
    } catch (error) {
      console.warn(error);
    }
  };

  const onDownload = async () => {
    // Download implementation depends on platform and native modules (e.g., react-native-fs)
    // Here we provide a placeholder. Integrate RNFS or similar for production.
    alert('Download não implementado. Instale e integre react-native-fs ou similar.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{item.ano}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onShare} style={styles.iconBtn}>
          <Ionicons name="share-social" size={22} color="#0f172a" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDownload} style={styles.iconBtn}>
          <Ionicons name="download" size={22} color="#0f172a" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconBtn}>
          <Ionicons name="expand" size={22} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} maximumZoomScale={Platform.OS === 'ios' ? 3 : 1}>
        <Image source={item.imagem} style={styles.image} resizeMode="contain" />
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            <Image source={item.imagem} style={styles.modalImage} resizeMode="contain" />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 12, gap: 12 },
  iconBtn: { marginHorizontal: 6, padding: 8 },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 18 },
  image: { width: '100%', height: 520 },
  modalSafe: { flex: 1, backgroundColor: '#000' },
  closeBtn: { position: 'absolute', top: 20, right: 18, zIndex: 10 },
  modalContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalImage: { width: '100%', height: '100%' },
});

export default DetalhesCartaz;
