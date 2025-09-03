import React,{useEffect, useLayoutEffect, useState,useRef} from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity,Alert,AppState,PanResponder } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import workingActivity from './atom/workingActivity';
import { loginParamsState } from "./atom/state";
const AUTO_LOGOUT_TIME = 60 * 60 * 1000; 
import { DOMAIN_URL } from "../config/config";
import { useRecoilState } from 'recoil';

const HomeScreen = ({ route, navigation }) => {


    // const [loginTime,setLoginTime]= useState(null);
    // const [operatorId,setOperatorId] = useState(route.params.user.id);
    // const timeoutRef = useRef(null);
  
    // const [loginParams, setLoginParams] = useRecoilState(loginParamsState);
   
    useLayoutEffect(() => {
        navigation.setOptions({
          title: 'Choose Type',
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
            textAlignVertical: 'center'
          }
        });
      }, [navigation]);

  

    useEffect(()=>{
        Toast.show({
            type: 'success',
            text1: 'Login Sucessfull',
            text2: `Welcome ${route.params.user.firstName}👋`
          });

        
        let isMounted = true;
        const setAsyncStorageData = async () => {
            await AsyncStorage.setItem('userName', route.params.user.email);
            await AsyncStorage.setItem("name",route.params.user.firstName);
            await AsyncStorage.setItem('password', route.params.user.password);
            await AsyncStorage.setItem('token', route.params.user.token);
            await AsyncStorage.setItem('operatorID',JSON.stringify(route.params.user.id));
           
        };

    
        setAsyncStorageData();
        return () => {
            isMounted = false; // Set the flag to indicate unmounting
            // Any cleanup code, if needed
        };

    },[]);

        

    const handleNewStock = () => {
      
           const user = route.params;
        navigation.navigate('NewStock', { user });
    };

    const handleExistStock = () => {
        const user = route.params;
        navigation.navigate('ExistStock', { user });
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
          
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleNewStock}
                >
                    <Text style={styles.buttonText} > New Stock </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleExistStock}
                >
                    <Text style={styles.buttonText}> Existing Stock </Text>
                </TouchableOpacity>
            </View>
            <Toast />
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
        justifyContent:'center',
        padding: 10,
        borderRadius: 100,
        shadowColor:'black',
        shadowOffset:10
    },
    buttonText: {
        fontSize: 45,
        // fontWeight: 'bold',
        color:'white'
    }
});

export default HomeScreen;
