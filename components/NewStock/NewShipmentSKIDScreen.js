import React, { useState, useEffect,useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Keyboard, Alert, BackHandler,TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
const Sound = require('react-native-sound');
import FloatingLabelInputFocus from "../cell/floatingLabelInputFocus";
import { DOMAIN_URL } from '../../config/config';

const NewShipmentSKIDScreen = ({ route,navigation }) => {
    const [itemCode, setItemCode] = useState('');
    const [scanned, setScanned] = useState(false);
    const [totalScanned, setTotalScanned] = useState(0);
    const [token, setToken] = useState(undefined);
    const success = new Sound('success.wav');
    const fail = new Sound('fail.mp3');


  
  

    useLayoutEffect(() => {
      navigation.setOptions({
        title: 'Receive SKID',
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
          textAlignVertical: 'center'
        }
      });
    }, [navigation]);

    useEffect(() => {
        const getToken = async () => {
            const token = route.params.user.user.user.token
            setToken(token);
        };
        getToken();

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => false);
        return () => backHandler.remove();
    }, []);

    const handleReceived = async () => {
      

       NetInfo.fetch().then(state => {
      
            if (state.isConnected) {
                setScanned(true);
                Keyboard.dismiss();
                const barCode = itemCode;
                const tokenValue = 'Bearer ' + route.params.user.user.user.token;
               
                fetch(`${DOMAIN_URL}/skid/receive`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': tokenValue
                    },
                    body: JSON.stringify({ barCode })
                })
                .then((response) => {
             
                    if (response.headers.get("Content-Type").indexOf("application/json") >= 0) {
                        return response.json();
                    } else {
                        fail.play();
                        Alert.alert(
                            "Error",
                            "Please scan the correct barCode.",
                            [{ text: "OK", onPress: () => null }]
                        );
                    }
                })
                .then((responseJson) => {
                    if (responseJson) {
                        let updatedScannedTotal = totalScanned;
                        if (responseJson.message === "New Skid Receive") {
                            success.play();
                            updatedScannedTotal+=1;
                            setTotalScanned(updatedScannedTotal);
                        } else {
                            fail.play();
                           
                        }
                        Alert.alert(
                            responseJson.message,
                            `Total Scanned: ${updatedScannedTotal}`,
                            [{ text: "OK", onPress: () => setScanned(false) }]
                        ); 
                    }
                    // setItemCode('');
                    setScanned(false);
                    myField2.focus();
                })
                .catch((error) => {
                    console.error(error);
                    // setItemCode('');
                    setScanned(false);
                    myField2.focus();
                });
            } else {
                Alert.alert(
                    "No Internet!",
                    "Needs to connect to the internet in order to work. Please connect tablet to wifi and try again.",
                    [{ text: "OK" }]
                );
            };
        })
    };

    // const handleNext = () => {
    //     setItemCode('');
    //     setScanned(false);
    //     myField2.focus();
    // };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
            <FloatingLabelInputFocus
                        onRef={(r) => this.myField2 = r}
                        label="SKID CODE"
                        value={itemCode}
                        // autoFocus
                        onKeyMultipleListener={() => alert('Keyboard Hidden')}
                        onChangeText={text => 
                            setItemCode(text.toUpperCase())}
                    />
                <Text style={styles.textField}>Total Scanned: {totalScanned}</Text>
                {scanned ? (
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}> UPDATING... </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.button}  onPress={handleReceived}>
                        <Text style={styles.buttonText}> RECEIVED </Text>
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
    textField: {
        fontSize: 35,
        marginTop: 20,
        fontWeight: 'bold',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color:'black'
    },
    button: {
        marginTop: 40,
        height: 100,
        position: 'relative',
        backgroundColor: '#1baeff',
        alignItems: 'center',
        padding: 10,
        borderRadius: 100,
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 40,
        // fontWeight: 'bold',
        color:'white'
    }
});

export default NewShipmentSKIDScreen;
