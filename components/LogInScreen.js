import React, { useState,useLayoutEffect } from 'react';
import { View, Alert, TouchableOpacity, Text, StyleSheet, Dimensions,ActivityIndicator } from 'react-native';
import FloatingLabelInput from './cell/floatingLabelInput';

import { DOMAIN_URL } from "../config/config";

const LogInScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
          title: 'Lacero Scan',
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

    const handleLogin = async () => {

        setLoading(true);
        const data = {
            email: userName,
            password: password
        };

        fetch(`${DOMAIN_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)

        })
        .then((response) => Promise.all([response.status.toString(), response.json()]))
        .then((res) => {
            setLoading(false);
            if (res[0] === '200') {
            
                navigation.navigate('Home', { user: res[1].data });
            } else {
                Alert.alert(res[1].message,"Please Check Your Credentials");
            }
        })
        .catch((error) => {
            setLoading(false);
            console.error(error);
        });
    };

    return (
        <View style={styles.container} className="bg-black">
            
            {loading && (
                <View style={styles.overlay}>
                     <ActivityIndicator size="large" color="red" />
                </View>
            )}
           
            <View style={styles.inputContainer}>
                <FloatingLabelInput
                    label="User Name"
                    value={userName}
                    onChangeText={(text) => setUserName(text)}
                />
                <FloatingLabelInput
                    secureTextEntry={true}
                    label="Password"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />

                <TouchableOpacity
                    style={styles.logInButton}
                    onPress={handleLogin}
                >
                    <Text style={styles.buttonText}> Login </Text>
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
    logInButton: {
        top: 80,
        position: 'relative',
        backgroundColor: '#1baeff',
        alignItems: 'center',
        padding: 10,
        borderRadius: 50
    },
    buttonText: {
        fontSize: 30,
        fontWeight: 'bold'
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LogInScreen;
