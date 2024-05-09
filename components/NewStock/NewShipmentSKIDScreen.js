import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Keyboard, Alert } from 'react-native';
import Sound from 'react-native-sound';
import { useNavigation } from '@react-navigation/native';
import KeyEvent from 'react-native-keyevent';
import FloatingLabelInputFocus from '../cell/floatingLabelInputFocus';
import { DOMAIN_URL } from '../../config/config';

const NewShipmentSKIDScreen = ({route,navigation}) => {
//   const navigation = useNavigation();

  const [itemCode, setItemCode] = useState('');
  const [scanned, setScanned] = useState(false);
  const [totalScanned, setTotalScanned] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = navigation.getParam('user', null);
    setUser(fetchUser);

    const onKeyMultipleListener = (keyEvent) => {
      console.log(`onKeyMultiple keyCode: ${keyEvent.keyCode}`);
      console.log(`Action: ${keyEvent.action}`);
      console.log(`Characters: ${keyEvent.characters}`);
    };
    KeyEvent.onKeyMultipleListener(onKeyMultipleListener);

    return () => {
      KeyEvent.removeKeyMultipleListener();
    };
  }, [navigation]);

  const success = new Sound('success.wav', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
  });

  const fail = new Sound('fail.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
  });

  const handleReceived = async () => {
    setScanned(true);
    Keyboard.dismiss();
    const barCode = itemCode;

    try {
      const token = 'Bearer ' + user.token;
      const response = await fetch(`${DOMAIN_URL}/skid/receive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ barCode })
      });

      const responseJson = await response.json();
      if (responseJson.message === "New Skid Receive") {
        success.play();
        setTotalScanned(totalScanned + 1);
      } else {
        fail.play();
        fail.play(); // not sure why it's played twice in your original code
      }

      Alert.alert(
        responseJson.message,
        `Total Scanned: ${totalScanned}`,
        [{ text: "OK", onPress: () => setScanned(false) }]
      );

      setItemCode('');
      setScanned(false);
      setTotalScanned(totalScanned);
      myField2.focus();
    } catch (error) {
      console.error(error);
      setItemCode('');
      setScanned(false);
      setTotalScanned(totalScanned);
      myField2.focus();
    }
  };

  const handleNext = () => {
    setItemCode('');
    setScanned(false);
    myField2.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.textField}>Total Scanned: {totalScanned}</Text>
        <FloatingLabelInputFocus
          onRef={(r) => myField2 = r}
          label="SKID CODE"
          value={itemCode}
          autoFocus
          onChangeText={text => setItemCode(text)}
        />
        {scanned ? <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}> UPDATING... </Text>
        </TouchableOpacity> : <TouchableOpacity style={styles.button} onPress={handleReceived}>
          <Text style={styles.buttonText}> RECEIVED </Text>
        </TouchableOpacity>}
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}> SCAN NEXT </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default NewShipmentSKIDScreen;

const containerHeight = Dimensions.get('window').height - 200;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: containerHeight
  },
  inputContainer: {
    flex: 1,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10
  },
  textField: {
    fontSize: 50,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  button: {
    marginTop: 50,
    height: 100,
    position: 'relative',
    backgroundColor: '#1baeff',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 50,
    fontWeight: 'bold'
  }
});
