import React, { useState,useLayoutEffect } from 'react';
import { View, Alert, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import FloatingLabelInput from './cell/floatingLabelInput';
import { DOMAIN_URL } from "../config/config";
import axios from 'axios';

const LogInScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    useLayoutEffect(() => {
        navigation.setOptions({
          title: 'Login',
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
        const data = {
            email: userName,
            password: password
        };

     
        // try {
        //     const response = await axios.post(`${DOMAIN_URL}/login`,data,{
        //         headers: {
        //             'Content-Type': 'application/json',
        //         }
        //     });
        //     console.log(response);
        //     if (response.status === 200) {
        //         console.log(response.data);
        //         navigation.navigate('Home', { user: response.data.data });
        //       } else if (response.status ===  404 )
        //         {
        //         console.log(response.data.message);
        //         Alert.alert("Invalid Credentials");
        //       }
        //     } catch (error) {
        //       console.error(error);
        //       console.log("error");
        //     }

        fetch(`${DOMAIN_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)

        })
        .then((response) => Promise.all([response.status.toString(), response.json()]))
        .then((res) => {
            console.log(res);
            if (res[0] === '200') {
                console.log(res);
                navigation.navigate('Home', { user: res[1].data });
            } else {
                Alert.alert(res[1].message,"Please Check Your Credentials");
            }
        })
        .catch((error) => {
            console.log("error");
            console.error(error);
        });
    };

    return (
        <View style={styles.container}>
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
                    <Text style={styles.buttonText}> LOGIN </Text>
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
        top: 150,
        position: 'relative',
        backgroundColor: '#1baeff',
        alignItems: 'center',
        padding: 10,
        borderRadius: 50
    },
    buttonText: {
        fontSize: 30,
        fontWeight: 'bold'
    }
});

export default LogInScreen;
