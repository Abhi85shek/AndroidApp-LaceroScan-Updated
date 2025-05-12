import React, { useState } from 'react';
import { View, Image, Modal, Pressable, StyleSheet,Text } from 'react-native';

const ZoomableImage = ({ source, style, resizeMode,label }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
    <Pressable onLongPress={() => setModalVisible(true)}>
      <Image source={source} style={style} resizeMode={resizeMode} />
    </Pressable>

    <Modal
      visible={modalVisible}
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <Pressable
        style={styles.modalContainer}
        onPress={() => setModalVisible(false)}
      >
        <Image source={source} style={styles.zoomedImage} resizeMode="contain" />
        {label && (
          <Text style={styles.labelText}>{label}</Text>
        )}
      </Pressable>
    </Modal>
  </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
   
  },
  zoomedImage: {
    width: '90%',
    height: '90%',
  },
  labelText: {
    position: 'absolute',
    bottom: 40,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  }
  
});

export default ZoomableImage;
