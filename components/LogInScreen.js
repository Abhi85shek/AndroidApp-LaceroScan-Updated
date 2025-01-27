import React, { useState, useEffect } from 'react';
import { View, Alert, TouchableOpacity, Text, StyleSheet, Dimensions, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingLabelInput from './cell/floatingLabelInput';
import Icon from "react-native-vector-icons/Entypo";
import { DOMAIN_URL } from "../config/config";
import CheckBox from 'react-native-check-box';


const LogInScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    

    useEffect(() => {
        const loadCredentials = async () => {
            try {
                const savedUserName = await AsyncStorage.getItem('userName');
                const savedPassword = await AsyncStorage.getItem('password');
                
                if (savedUserName && savedPassword) {
                    setUserName(savedUserName);
                    setPassword(savedPassword);
                    setIsChecked(true);
                }
            } catch (error) {
                console.error('Failed to load credentials', error);
            }
        };

        loadCredentials();
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        const data = {
            email: userName,
            password: password
        };

        try {
            const response = await fetch(`${DOMAIN_URL}/loginOperator`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            setLoading(false);

            
            
            if (response.status === 200) {
                if (isChecked) {
                    await AsyncStorage.setItem('userName', userName);
                    await AsyncStorage.setItem('password', password);
                } else {
                    await AsyncStorage.removeItem('userName');
                    await AsyncStorage.removeItem('password');
                }
                navigation.navigate('Home', { user: result.data });
            } else {
                Alert.alert(result.message, "Please Check Your Credentials");
            }
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    };

    const ForgetPasswordHandler = () => {
        navigation.navigate('ForgetPassword');
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image style={styles.logo} source={require("./Assets/laceroLogo.png")} />
                <Text style={styles.title}>Welcome back!</Text>
                <Text style={styles.subtitle}>Login to Your Account</Text>
            </View>

            {loading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="red" />
                </View>
            )}

            <View style={styles.inputContainer}>
                <FloatingLabelInput
                    label="Email"
                    value={userName}
                    placeholder="Enter your email"
                    placeholderTextColor="#D3D3D3"
                    style={styles.input}
                    onChangeText={(text) => setUserName(text)}
                />
                <View style={styles.passwordContainer}>
                    <FloatingLabelInput
                        secureTextEntry={!showPassword}
                        placeholder="Enter password"
                        placeholderTextColor="#D3D3D3"
                        label="Password"
                        value={password}
                        style={styles.input}
                        onChangeText={(text) => setPassword(text)}
                    />
                    <TouchableOpacity style={styles.toggleIcon} onPress={() => setShowPassword(!showPassword)}>
                        <Icon name={showPassword ? 'eye-with-line' : 'eye'} size={20} color="gray" />
                    </TouchableOpacity>
                </View>
                <View style={styles.checkboxContainer}>
                    <CheckBox
                        onClick={() => setIsChecked(!isChecked)}
                        isChecked={isChecked}
                        style={styles.checkbox}
                    />
                    <Text style={styles.label}>Remember Me</Text>
                </View>
                <TouchableOpacity style={styles.forgetPassword} onPress={ForgetPasswordHandler}>
                    <Text style={styles.forgetPasswordText}>Forget Password?</Text>
                </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.logInButton} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <View style={styles.versionTag}>
                <Text style={styles.versionText}>Version 2.0</Text>
                <Text style={styles.versionText}>Last updated on 28.01.202</Text>
            </View>
        </View>
    );
};

const containerHeight = Dimensions.get('window').height - 200;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        height: containerHeight,
        padding: 20,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    logo: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: 24,
        color: 'black',
    },
    input:{
        color:'black'
    },
    subtitle: {
        color: 'gray',
        fontSize: 16,
    },
    inputContainer: {
        marginTop: 20,
    },
    passwordContainer: {
        position: 'relative',
    },
    toggleIcon: {
        position: 'absolute',
        right: 15,
        bottom: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    checkbox: {
        alignSelf: 'center',
    },
    label: {
        marginLeft: 8,
        color:'black'
    },
    forgetPassword: {
        alignItems: 'flex-end',
        marginTop: 10,
    },
    forgetPasswordText: {
        color: '#1baeff',
    },
    logInButton: {
        backgroundColor: '#1baeff',
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 40,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    versionTag: {
        position: 'absolute', // Positions it absolutely relative to the screen
        bottom: 0, // Places it at the bottom
        left: 0, 
        right: 0, // Ensures it spans full width
        padding: 100,
        alignItems: 'center', // Centers the text horizontally
      },
      versionText: {
        fontSize: 12,
      },
});

export default LogInScreen;
