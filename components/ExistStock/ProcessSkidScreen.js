import React, { useState, useEffect, useRef,useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Keyboard, Alert ,AppState,BackHandler} from 'react-native';
import Sound from 'react-native-sound';
import KeyEvent from 'react-native-keyevent';
import NetInfo from "@react-native-community/netinfo";
import FloatingLabelInputFocus from "../cell/floatingLabelInputFocus";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DOMAIN_URL } from '../../config/config';

const ProcessSkidScreen = ({ route,navigation }) => {
    
    const [itemCode, setItemCode] = useState('');
    const [scanned, setScanned] = useState(false);
    const [token, setToken] = useState(undefined);
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const success = useRef(new Sound('success.wav'));
    const fail = useRef(new Sound('fail.mp3'));

    // const myField2 = useRef(null);

    
    useLayoutEffect(() => {
        navigation.setOptions({
          title: 'Process SKID',
          headerStyle: {
            backgroundColor: '#1bb5d8',
            height: 80
          },
          headerTitleStyle: {
            fontSize: 30,
            alignSelf: 'center',
            textAlign: 'center',
            justifyContent: 'center',
            flex: 1,
            fontWeight: 'bold',
            textAlignVertical: 'center'
          }
        });
      }, [navigation]);


    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

        // const focusListener = navigation.addListener('focus', () => myField2.current.focus());

        const fetchData = async () => {
            const token = await AsyncStorage.getItem('token');
            const userName = await AsyncStorage.getItem('userName');
            const password = await AsyncStorage.getItem('password');

            setToken(token);
            setUserName(userName);
            setPassword(password);
        };

        fetchData();

        return () => {
            backHandler.remove();
            // focusListener.current = null;
        };
    }, []);

    const navigateToProcessItemScreen = async (skid, productsInSkid) => {
        await AsyncStorage.setItem('skid', JSON.stringify(skid));
        await AsyncStorage.setItem('productList', JSON.stringify(productsInSkid));
        navigation.navigate('ProcessItem', { name: "PLEASE SELECT PRODUCT TYPE", color: "#1bb5d8",skid:JSON.stringify(skid) });
    };

    const callHandleUpdateProcess = async (token) => {
        await AsyncStorage.setItem('token', token);
        setToken(token);
        handleProcess();
    };


    const handleProcess = async () => {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                if (itemCode) {
                    setScanned(true);
                    Keyboard.dismiss();
                    const barCode = itemCode;
                    const token = 'Bearer ' + token;

                    fetch(`${DOMAIN_URL}/skid/${barCode}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token
                        },
                    })
                    .then((response) => {
                        
                        if (response.headers.get("Content-Type").indexOf("application/json") >= 0) {
                            return response.json()
                        }
                        else {
                            // fail.play();
                            Alert.alert(
                                "Error",
                                "Please scan the correct barCode.",
                                [{ text: "OK", onPress: () => { return null; } }]
                            );
                            setScanned(false);
                        }
                    })
                    .then((responseSkidDetail) => {
                        if (responseSkidDetail) {
                            if (responseSkidDetail.data.close_status === "Open" && responseSkidDetail.data.process_status !== "UN_RECEIVE") {
                                fetch(`${DOMAIN_URL}/products`, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': token
                                    },
                                })
                                .then((response) => response.json())
                                .then((responseJson) => {
                                    if (responseJson && responseJson.message !== undefined && responseJson.message === "Successfully") {
                                        let productsInSkid = [];
                                        Object.keys(JSON.parse(responseSkidDetail.data.skidContent)).forEach((key) => {
                                            responseJson.data.forEach((product) => {
                                                if (product.id === Number(key)) {
                                                    productsInSkid.push(product);
                                                }
                                            });
                                        });
                                        // success.current().play();
                                        setScanned(false);
                                        setItemCode('');
                                        // setAppState({ scanning: false, scanned: false, itemCode: '' });
                                        navigateToProcessItemScreen(responseSkidDetail.data, productsInSkid);
                                    }
                                })
                                .catch((error) => {
                                    console.error(error);
                                    setScanned(false);
                                });
                            } else if (responseSkidDetail.data.close_status === "Open") {
                                // fail.play();
                                Alert.alert(
                                    'Alert!', 'Please Receive the SKID first before you start scanning items!',
                                    [{ text: "OK", onPress: () =>{
                                        setItemCode('');
                                        setScanned(false);
                                        // setAppState({ scanning: false, scanned: false, itemCode: '' })
                                    }
                                     }]
                                );
                                setScanned(false);
                            } else if (responseSkidDetail.data.close_status === "Closed" || responseSkidDetail.data.close_status === "Close") {
                                // fail.play();
                                Alert.alert(
                                    'Alert!', 'SKID is already closed!',
                                    [{ text: "OK", onPress: () => 
                                            {
                                                setItemCode('');
                                                setScanned(false);
                                            }
                                        // setAppState({ scanning: false, scanned: false, itemCode: '' })
                                     }]
                                );
                                setScanned(false);
                            } else {
                                
                                if (responseSkidDetail.message === "Please authenticate") {
                                    const data = { email: userName, password: password };
                                    fetch(`${DOMAIN_URL}/login`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data)
                                    })
                                    .then((response) => Promise.all([response.status.toString(), response.json()]))
                                    .then((res) => {
                                        if (res[0] == 200) {
                                            callHandleUpdateProcess(res[1].data.token);
                                        } else {
                                            navigate('Login');
                                        }
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                    });
                                } else {
                                    // fail.play();
                                    Alert.alert(
                                        responseSkidDetail.message,
                                        (responseSkidDetail.data.process_status) ? `SKID IN: ${responseSkidDetail.data.process_status} Status!` : '',
                                        [{ text: "OK", onPress: () => 
                                                {
                                                    setItemCode('');
                                                    setScanned(false);
                                                }
                                            // setAppState({ scanning: false, scanned: false, itemCode: '' })
                                         }]
                                    );
                                }
                            }
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        setItemCode('');
                        // setAppState({ itemCode: '', scanned: false });
                        setScanned(false);
                        // myField2.focus();
                    });
                }
            } else {
                Alert.alert(
                    "No Internet!",
                    "Needs to connect to the internet in order to work. Please connect tablet to wifi and try again.",
                    [{ text: "OK", onPress: () => {} }]
                );
                setScanned(false);
            }
        });
    };    

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <FloatingLabelInputFocus
                 onRef={(r) => myField2 = r}
                    label="SKID CODE"
                    value={itemCode}
                    autoFocus
                    onChangeText={text => setItemCode(text)}
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
    );
};

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
    button: {
        marginTop: 50,
        height: 100,
        position: 'relative',
        backgroundColor: '#1baeff',
        alignItems: 'center',
        padding: 10,
        borderRadius: 100,
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 45,
        // fontWeight: 'bold'
        color:'white'
    }
});

export default ProcessSkidScreen;
