import React, { useEffect, useState } from "react";
import {View,StyleSheet,Text} from 'react-native';
import { DrawerContentScrollView } from "@react-navigation/drawer";
import  {Avatar,Button,Title} from "react-native-paper";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/AntDesign";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DOMAIN_URL } from "../../config/config";
function DrawerContent({navigation,...props}) {

    const [userName,setUserName] = useState("");
    const [email,setEmail] = useState("");
    const [operatorId,setOperatorId] = useState(0);
    const [workHour,setWorkHour] = useState("");
    const [timeStampId,setTimeStampId] = useState(null);

    const fetchData = async () => {
        const name = await AsyncStorage.getItem('name');
        const email = await AsyncStorage.getItem('userName');
        const operatorID = await AsyncStorage.getItem('operatorID');
        const workingHours = await AsyncStorage.getItem('workingHours');
        const timeStampID  = await AsyncStorage.getItem('timeStampID');
        console.log(workingHours);
        setUserName(name);
        setEmail(email);
        setOperatorId(operatorID);
        setWorkHour(workingHours);
        setTimeStampId(timeStampID);
      };


    const setAsyncStorageData = async () => {
        await AsyncStorage.removeItem('userName');
        await AsyncStorage.removeItem('password');
        await AsyncStorage.removeItem('token');
        // await AsyncStorage.setItem('loginTime',JSON.stringify(Date.now()));
    };

    console.log(workHour);
    const operatorLogOutTime = async ()=>{
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
        const day = String(now.getDate()).padStart(2, '0');
        const dateOnly = `${year}-${month}-${day}`;

        const data = {

            date:dateOnly,
            role:"operator",
            operatorId:operatorId,
            timeStampId:timeStampId
            
        }

        // Testing Is Done

        fetch(`${DOMAIN_URL}/insertOperatorLogoutTime`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)

        }) .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.error(error);
        });
    };

    
    const signOutHandler = ()=>{
        operatorLogOutTime();
        navigation.navigate('LogIn')
        setAsyncStorageData();
    };

    useEffect(()=>{
        fetchData();
    },[]);

    return (
               <DrawerContentScrollView {...props} >
                    <TouchableOpacity activeOpacity={0.8} className="mt-0 pt-0">
                        <View className="flex flex-row pt-8 pb-20 pl-3 bg-gray-100">
                                <Avatar.Text label="AB" size={60}  />
                                <View className="ml-2 flex-col">
                                    <Title>{userName}</Title>
                                    <Text numberOfLines={1}>
                                        {email}
                                    </Text>
                                </View>
                        </View>
                    </TouchableOpacity>
                    <View className="flex justify-center items-center border-t-orange-300 border-b-2 border-t-2 p-3" >
                        <Text className="mb-4 text-xl font-extrabold leading-none tracking-tight text-gray-900 md:text-xl lg:text-xl dark:text-white">Maximum Working Hours</Text>
                        <Text className="bg-blue-100 text-blue-800 text-2xl font-semibold me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-800 ms-2">{workHour}</Text>
                    </View>
                    <View>
                        <Button onPress={signOutHandler}>Sign Out</Button>
                    </View>
                </DrawerContentScrollView>  
    )
};

export default DrawerContent;