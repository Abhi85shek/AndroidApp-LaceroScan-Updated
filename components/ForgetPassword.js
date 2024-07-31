import React, { useState } from 'react'
import { Text,Image,View, TextInput,TouchableOpacity,KeyboardAvoidingView,Platform, Alert, BackHandler } from 'react-native';
import { DOMAIN_URL } from "../config/config";
import Toast from 'react-native-toast-message';
import Icon from "react-native-vector-icons/Ionicons";

const ForgetPassword = ({ navigation }) => {

const [email,setEmail] = useState('');

const resetPasswordHandler = async ()=>{
    const data = {
        email: email,
      
    };

    fetch(`${DOMAIN_URL}/sendCode`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then((response) => Promise.all([response.status.toString(), response.json()]))
    .then((res) => {
        
        if (res[0] === '200') {
            Toast.show({
                type: 'success',
                text1: 'OTP Send Sucessfull',
              });
            navigation.navigate('OTPVerification', { email: email});
        } else {
            Alert.alert(res[1].message,"Please Check Your Credentials");
            
        }
    })
    .catch((error) => {
       
        console.error(error);
    });
    
 };

 const BackHandler = ()=>{
    navigation.navigate('LogIn');
 };

  return (
    <KeyboardAvoidingView className="m-3 flex-1 mt-5" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity className="mb-5"> 
            <Icon name='arrow-back-sharp' size={20} color="black" onPress={BackHandler}/>
        </TouchableOpacity>
        {/* <Image  className="w-[400px] h-[400px] justify-center item-center" source={require("./Assets/Forgotpassword.png")}/> */}
        <Text className="text-4xl text-black font-semibold">Forget Password</Text>
             {/* <Text className="text-4xl text-black font-semibold">Password?</Text> */}
        <View className="mt-3 mb-3">
            <Text className="text-gray-700 mb-4 text-base">Enter the email address with your account and we'll send an
            email with confirmation to reset your password.</Text>
        </View>

            <TextInput placeholder="Email ID" 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={email}
            onChangeText={(text)=>setEmail(text)}
            />
            <TouchableOpacity
                    className="bg-blue-700 p-4 rounded-full top-10"
                    onPress={resetPasswordHandler}
                >
                    <Text className="text-white text-center text-lg">Send Code</Text>
                </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

export default ForgetPassword