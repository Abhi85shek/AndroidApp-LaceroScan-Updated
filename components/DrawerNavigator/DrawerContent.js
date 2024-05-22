import React from "react";
import {View,StyleSheet,Text} from 'react-native';
import { DrawerContentScrollView } from "@react-navigation/drawer";
import  {Avatar,Button,Title} from "react-native-paper";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/AntDesign";
import AsyncStorage from '@react-native-async-storage/async-storage';
function DrawerContent({navigation,...props}) {

    const setAsyncStorageData = async () => {
        await AsyncStorage.removeItem('userName');
        await AsyncStorage.removeItem('password');
        await AsyncStorage.removeItem('token');
        // await AsyncStorage.setItem('loginTime',JSON.stringify(Date.now()));
    };
    

    const signOutHandler = ()=>{

        navigation.navigate('LogIn')
       

        setAsyncStorageData();
    };

    return (
                
                <DrawerContentScrollView {...props} >
                    <TouchableOpacity activeOpacity={0.8} className="mt-0 pt-0">
                        <View className="flex flex-row pt-8 pb-20 pl-3 bg-gray-100">
                                <Avatar.Text label="AB" size={60}  />
                                <View className="ml-2 flex-col">
                                    <Title>Abhishek</Title>
                                    <Text numberOfLines={1}>
                                        abhishek.kumar@arkilos.com
                                    </Text>
                                </View>
                        </View>
                    </TouchableOpacity>
                    <View>
                        <Icon name="logout" />
                        <Button onPress={signOutHandler}>Sign Out</Button>
                    </View>
                </DrawerContentScrollView>
                

        
    )




};

export default DrawerContent;