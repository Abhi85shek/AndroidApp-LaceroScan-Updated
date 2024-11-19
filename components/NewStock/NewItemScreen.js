import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Keyboard, Alert } from 'react-native';
import Sound from 'react-native-sound';
import KeyEvent from 'react-native-keyevent';
import FloatingLabelInputFocus from "../cell/floatingLabelInputFocus";
import { DOMAIN_URL } from '../../config/config';

const NewItemScreen = ({ navigation }) => {
    const [itemCode, setItemCode] = useState('');
    const [scanned, setScanned] = useState(false);
    const [totalScanned, setTotalScanned] = useState(0);
    const [user, setUser] = useState(undefined);
    const [companyId, setCompanyId] = useState(undefined);

    const success = new Sound('success.wav');
    const fail = new Sound('fail.mp3');

    useEffect(() => {
        const user = navigation.getParam('user', {});
        const companyId = navigation.getParam('companyId', '2');
        setUser(user);
        setCompanyId(companyId);

        const keyEventSubscription = KeyEvent.onKeyMultipleListener((keyEvent) => {
            console.log(`onKeyMultiple keyCode: ${keyEvent.keyCode}`);
            console.log(`Action: ${keyEvent.action}`);
            console.log(`Characters: ${keyEvent.characters}`);
        });

        return () => {
            keyEventSubscription.remove();
        };
    }, []);

    const handleReceived = async () => {
        setScanned(true);
        Keyboard.dismiss();
        const barCode = itemCode;
        // let totalScannedValue = totalScanned;

        const data = {
            "data": {
                "barCode": barCode,
                "companyID": companyId
            }
        };
        const token = 'Bearer ' + user.token;

        fetch(`${DOMAIN_URL}/process_task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(data)
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if (responseJson.message === "Record Create Successfully") {
                success.play();
                setTotalScanned((previous)=>{
                    
                    return previous + 1;
                });
            } else {
                fail.play();
                fail.play();
            }
            Alert.alert(
             
                responseJson.message,
                `Total Scanned: ${totalScanned}`,
                [{ text: "OK", onPress: () => setScanned(false) }]
            );
            setItemCode('');
            setScanned(false);
            // setTotalScanned(totalScanned);
            myField2.focus();
        })
        .catch((error) => {
            console.error(error);
            setItemCode('');
            setScanned(false);
            // setTotalScanned(totalScanned);
            myField2.focus();
        });
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
                    label="ITEM CODE"
                    value={itemCode}
                    autoFocus
                    onKeyMultipleListener={() => Alert('Keyboard Hidden')}
                    onChangeText={text => setItemCode(text)}
                />
                {scanned ? (
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}> UPDATING... </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.button} onPress={handleReceived}>
                        <Text style={styles.buttonText}> RECEIVED </Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}> SCAN NEXT </Text>
                </TouchableOpacity>
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
        borderRadius: 100,
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 50,
        // fontWeight: 'bold'
        color:'white'
    }
});

export default NewItemScreen;
