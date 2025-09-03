import React, {useState, useEffect, useRef, useLayoutEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import Sound from 'react-native-sound';
import KeyEvent from 'react-native-keyevent';
import NetInfo from '@react-native-community/netinfo';
import FloatingLabelInputFocus from '../cell/floatingLabelInputFocus';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMAIN_URL} from '../../config/config';

const ProcessSkidScreen = ({route, navigation}) => {
  const [itemCode, setItemCode] = useState('');
  const [scanned, setScanned] = useState(false);
  const [token, setToken] = useState(undefined);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const success = useRef(new Sound('success.wav'));
  const fail = useRef(new Sound('fail.mp3'));
  const [multipleScanInfo, setMultipleScanInfo] = useState([]);
  const [multiScanIdArray, setMultiScanIdArray] = useState([]);
  // const myField2 = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Process SKID',
      headerStyle: {
        backgroundColor: '#1bb5d8',
        height: 80,
      },
      headerTitleStyle: {
        fontSize: 30,
        alignSelf: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        flex: 1,
        fontWeight: 'bold',
        textAlignVertical: 'center',
      },
    });
  }, [navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => false,
    );

    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');
      const userName = await AsyncStorage.getItem('userName');
      const password = await AsyncStorage.getItem('password');

      setToken(token);
      setUserName(userName);
      setPassword(password);
    };

    fetchData();
    getMultipleScanInfo();
    return () => {
      backHandler.remove();
      
    };
  }, []);

  const navigateToProcessItemScreen = async (
    skid,
    productsInSkid,
    multipleScanInfoArray,
  ) => {
   
    try {
      await AsyncStorage.setItem('skid', JSON.stringify(skid));
      await AsyncStorage.setItem('productList', JSON.stringify(productsInSkid));
      await AsyncStorage.setItem('multipleScanInfo',JSON.stringify(multipleScanInfoArray));
    
    } catch (error) {
      console.error('Error storing data in AsyncStorage:', error);
    }
    navigation.navigate('ProcessItem', {
      name: 'PLEASE SELECT PRODUCT TYPE',
      color: '#1bb5d8',
      skid: JSON.stringify(skid),
      multipleScanInfo: JSON.stringify(multipleScanInfoArray),
    });
  };

  const callHandleUpdateProcess = async token => {
    await AsyncStorage.setItem('token', token);
    setToken(token);
    handleProcess();
  };

  const getMultipleScanInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const extraScanArray = multiScanIdArray;

      if (!extraScanArray || extraScanArray.length === 0) {
        // console.log("No extra scan array available");
        return;
      }

      const response = await fetch(`${DOMAIN_URL}/getScanProductInfoById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({data: extraScanArray}),
      });
      console.log("MultiScanInfo",response)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseJson = await response.json();
      if (responseJson.data) {
        setMultipleScanInfo(responseJson.data);
      }
    } catch (error) {
      console.error('Error fetching scan product info:', error);
      Alert.alert('Error', 'Failed to fetch scan product information');
    }
  };

 
  const handleProcess = async () => {
    try {
      const state = await NetInfo.fetch();

      if (!state.isConnected) {
        Alert.alert(
          'No Internet!',
          'Needs to connect to the internet in order to work. Please connect tablet to wifi and try again.',
          [{text: 'OK', onPress: () => {}}],
        );
        setScanned(false);
        return;
      }

      if (!itemCode) {
        setScanned(false);
        return;
      }

      setScanned(true);
      Keyboard.dismiss();
      const token = `Bearer ${token}`;

      const skidResponse = await fetch(`${DOMAIN_URL}/skid/${itemCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      if (
        skidResponse.headers.get('Content-Type')?.includes('application/json')
      ) {
        const responseSkidDetail = await skidResponse.json();

        if (!responseSkidDetail) {
          setScanned(false);
          return;
        }

        if (
          responseSkidDetail.data?.close_status === 'Open' &&
          responseSkidDetail.data?.process_status !== 'UN_RECEIVE'
        ) {
          const ProductsIdArray = Object.keys(
            JSON.parse(responseSkidDetail.data.skidContent),
          ).map(Number);
          console.log('ProductsIdArray', ProductsIdArray);
          const productResponse = await fetch(
            `${DOMAIN_URL}/getProductWithMultipleScanInfo`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: token,
              },
              body: JSON.stringify({
                data: ProductsIdArray,
                skidProductDetails: responseSkidDetail.data.skidContent,
              }),
            },
          );
          const responseJson = await productResponse.json();
         
          productsInSkid = responseJson.data;
          console.log("ProductInSkid",productsInSkid)
          setScanned(false);
          setItemCode('');
          navigateToProcessItemScreen(
            responseSkidDetail.data,
            productsInSkid,
            [],
          );
        } else if (responseSkidDetail.data?.close_status === 'Open') {
          Alert.alert(
            'Alert!',
            'Please Receive the SKID first before you start scanning items!',
            [{text: 'OK', onPress: () => setScanned(false)}],
          );
        } else if (
          responseSkidDetail.data?.close_status === 'Closed' ||
          responseSkidDetail.data?.close_status === 'Close'
        ) {
          Alert.alert('Alert!', 'SKID is already closed!', [
            {text: 'OK', onPress: () => setScanned(false)},
          ]);
        } else {
          Alert.alert(
            responseSkidDetail.message,
            responseSkidDetail.data?.process_status
              ? `SKID IN: ${responseSkidDetail.data.process_status} Status!`
              : '',
            [{text: 'OK', onPress: () => setScanned(false)}],
          );
        }
      } else {
        Alert.alert('Error', 'Please scan the correct barCode.', [
          {text: 'OK', onPress: () => setScanned(false)},
        ]);
      }
    } catch (error) {
      console.error('Error in handleProcess:', error);
      setScanned(false);
      setItemCode('');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <FloatingLabelInputFocus
              onRef={r => (myField2 = r)}
              label="SKID CODE"
              value={itemCode}
              // autoFocus
              onChangeText={text => setItemCode(text.toUpperCase())}
              autoCapitalize="characters"
            />
            {scanned ? (
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}> UPDATING... </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleProcess}>
                <Text style={styles.buttonText}> PROCESS </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const containerHeight = Dimensions.get('window').height - 200;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: containerHeight,
  },
  inputContainer: {
    flex: 1,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  button: {
    marginTop: 50,
    height: 100,
    position: 'relative',
    backgroundColor: '#1baeff',
    alignItems: 'center',
    padding: 10,
    borderRadius: 100,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 45,
    // fontWeight: 'bold'
    color: 'white',
  },
});

export default ProcessSkidScreen;
