import React, { useEffect, useState } from 'react';
import { BackHandler, Text,TouchableOpacity,View,Alert } from 'react-native';
import { DOMAIN_URL } from "../config/config";
import { SafeAreaView } from 'react-native-safe-area-context';
import { OtpInput } from "react-native-otp-entry";
import Toast from 'react-native-toast-message';
import Icon from "react-native-vector-icons/Ionicons";

export const OTPVerification = ({route, navigation }) => {

    const [timer,setTimer] = useState(60);
    const [isExpired,setIsExpired] = useState(false);
    const email = route.params.email;
    const [otp,setOtp] = useState(0);

    useEffect(()=>{

            if(timer>0)
                    {
                        const intervalId =setInterval(()=>{
                            setTimer((prevTimer)=> prevTimer -1 )
                        },1000);

                        return () => clearInterval(intervalId);
                    }
                    else
                    {
                        setIsExpired(true);
                    }


    },[timer]);

    const OTPVerificationHandler = ()=>{
        const data = {
            email: email,
            otp : otp
        };
       
        fetch(`${DOMAIN_URL}/verifyOTP`, {
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
                  navigation.navigate('ChangePassword', { email: email});
            } else {
                Alert.alert("Invalid OTP");
               
            }
        })
        .catch((error) => {
           
            console.error(error);
        });
        
        
    };

    // 

    const BackHandler = ()=>{
        
        navigation.navigate('ForgetPassword');
        
    };

    const otpHandler = (input)=>{
        setOtp(input);
    };
    return (
    <SafeAreaView  className="m-3 flex-1 mt-5">
            <TouchableOpacity className="mb-5" onPress={BackHandler}>
                 <Icon name='arrow-back-sharp' size={20} color="black" />
            </TouchableOpacity>
            <View>
                <Text className="text-xl text-black font-semibold">Please Check your Email</Text>
            </View>
            <View className="mt-4">
                <Text>We have sent the code to <Text className="font-semibold">{email}</Text></Text>
            </View>
            <View className="mt-4">
                <OtpInput numberOfDigits={6} onTextChange={otpHandler} value={otp}/>
            </View>
            {/* <View className="mt-4 flex justify-center items-center ">
                <Text className="text-black">Send code again {timer} seconds</Text>
                {isExpired && <Text>OTP has expired. <Text className="text-blue-600">Please resend OTP.</Text></Text>}
            </View> */}
            <TouchableOpacity
                    className="bg-blue-700 p-4 rounded-full top-10"
                    onPress={OTPVerificationHandler}
                >
                    <Text className="text-white text-center text-lg">Verification</Text>
                </TouchableOpacity>
          
          
    </SafeAreaView>
  )
};
