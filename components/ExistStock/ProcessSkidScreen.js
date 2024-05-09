import React, { useState, useEffect, useRef,useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Keyboard, Alert } from 'react-native';
import Sound from 'react-native-sound';
import KeyEvent from 'react-native-keyevent';
import FloatingLabelInputFocus from "../cell/floatingLabelInputFocus";
import { DOMAIN_URL } from '../../config/config';

const ProcessSkidScreen = ({ route,navigation }) => {
    const success = useRef(new Sound('success.wav'));
    const fail = useRef(new Sound('fail.mp3'));
    const [itemCode, setItemCode] = useState('');
    const [scanned, setScanned] = useState(false);
    const [user, setUser] = useState(undefined);

    
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
        const userParam = route.params;
        // const userParam = navigation.getParam('user', {});
        setUser(userParam);

        const keyListener = KeyEvent.onKeyMultipleListener((keyEvent) => {
            console.log(`onKeyMultiple keyCode: ${keyEvent.keyCode}`);
            console.log(`Action: ${keyEvent.action}`);
            console.log(`Characters: ${keyEvent.characters}`);
        });

        return () => {
            keyListener.remove();
        };
    }, [navigation]);

    const handleProcess = async () => {
        setScanned(true);
        Keyboard.dismiss();
        const barCode = itemCode;
        const token = 'Bearer ' + route.params.user.user.user.token;
        console.log();
        
        try {
            const response = await fetch(`${DOMAIN_URL}/skid/processing`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ barCode })
            });

            const responseJson = await response.json();

            if (responseJson.message === "Record found") {
                success.current.play();
                navigation.navigate('ProcessItem', {
                    user,
                    skid: responseJson.data
                });
            } else {
                fail.current.play();
                Alert.alert(
                    responseJson.message,
                    `SKID IN: ${responseJson.data.process_status} Status!`,
                    [{ text: "OK", onPress: () => setScanned(false) }]
                );
            }
            setItemCode('');
            setScanned(false);
            // myField2.current.focus();
        } catch (error) {
            console.error(error);
            setItemCode('');
            setScanned(false);
            // myField2.current.focus();
        }
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
        borderRadius: 5,
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 50,
        fontWeight: 'bold'
    }
});

export default ProcessSkidScreen;
