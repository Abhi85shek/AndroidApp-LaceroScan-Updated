import React, { useState } from 'react';
import { View, Alert, TouchableOpacity, Text, StyleSheet, Dimensions,ActivityIndicator,Image } from 'react-native';
import FloatingLabelInput from './cell/floatingLabelInput';
import Icon from "react-native-vector-icons/Entypo";
import { DOMAIN_URL } from "../config/config";

import CheckBox from 'react-native-check-box'


const LogInScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword,setShowPassword] = useState(false);
    const [isChecked,setIsChecked] = useState(false);


    const handleLogin = async () => {

        setLoading(true);
        const data = {
            email: userName,
            password: password
        };

        fetch(`${DOMAIN_URL}/loginOperator`, {
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

    const ForgetPasswordHandler = ()=>{
        navigation.navigate('ForgetPassword');

    };

    return (
        <View style={styles.container} className="p-5 ">
                <View className="flex justify-center items-center mt-8">
                <Image  className="w-20 h-20 justify-center item-center" source={require("./Assets/laceroLogo.png")}/>
                <Text className="text-3xl text-black">Welcome back!</Text>
                <Text className="text-gray-600 text-lg">Login to Your Account</Text>
                </View>
            {loading && (
                <View  style={styles.overlay}>
                     <ActivityIndicator size="large" color="red" />
                </View>
            )}
           

            <View>
                <FloatingLabelInput
                    label="Email"
                    value={userName}
                    placeholder="Enter your email"
                    onChangeText={(text) => setUserName(text)}
                />
                <FloatingLabelInput
                    secureTextEntry={!showPassword}
                    placeholder="Enter password"
                    label="Password"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />
                <View className="relative">
                <TouchableOpacity
                    // style={styles.toggleIcon}
                    className="absolute right-4 bottom-5"
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Icon name={showPassword ? 'eye-with-line' : 'eye'} size={20} color="gray" />
                    {/* <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={20} color="gray" /> */}
                </TouchableOpacity>  
                </View>
                <View className="flex flex-row mt-5">
                <CheckBox
                    onClick={()=>{
                            setIsChecked((prev)=> !prev);
                    }}
                    isChecked={isChecked}
                    
                />
                
                <Text className="flex">Remember Me</Text>
                
                </View>
                
                
                <View className="flex items-end mt-5">
                <TouchableOpacity  onPress={ForgetPasswordHandler}>
                <Text className="text-blue-600">Forget Password?</Text>
                </TouchableOpacity>
                </View>
                </View>
                <TouchableOpacity
                    className="bg-blue-700 p-4 rounded-full top-10"
                    onPress={handleLogin}
                >
                    <Text className="text-white text-center text-lg"> Login </Text>
                </TouchableOpacity>
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
    checkboxContainer: {
        flexDirection: 'row',
        marginBottom: 20,
      },
      checkbox: {
        alignSelf: 'center',
      },
      label: {
        margin: 8,
      },
});

export default LogInScreen;
