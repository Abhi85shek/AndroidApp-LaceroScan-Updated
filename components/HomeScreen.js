import React,{useEffect, useLayoutEffect, useState,useRef} from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity,Alert,AppState,PanResponder } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import workingActivity from './atom/workingActivity';

const AUTO_LOGOUT_TIME = 60 * 60 * 1000; 
import { DOMAIN_URL } from "../config/config";
import { useRecoilState } from 'recoil';

const HomeScreen = ({ route, navigation }) => {

  
  console.log(route.params);
    const [loginTime,setLoginTime]= useState(null);
    const [operatorId,setOperatorId] = useState(route.params.user.id);
    const timeoutRef = useRef(null);
    // const timeActivity = useRecoilState(workingActivity);
    const [timeActivity,setTimeActivity] = useRecoilState(workingActivity);
   

    useEffect(() => {
        const resetTimeout = () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(logout, AUTO_LOGOUT_TIME);
        };
    
        const logout = () => {
        //   setIsLoggedIn(false);

          console.log('User logged out due to inactivity');
          operatorLogOutTime();
          navigation.navigate('LogIn');
          // Add your logout logic here (e.g., clear session, redirect to login)
        };
    
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
              timeStampId:timeActivity
              
          }
          console.log(timeActivity);

          console.log(data);
  
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
  

        const handleAppStateChange = (nextAppState) => {
          if (nextAppState === 'active') {
            resetTimeout();
          } else if (nextAppState.match(/inactive|background/)) {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }
        };
    
        const subscription = AppState.addEventListener('change', handleAppStateChange);
    
        const panResponder = PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: () => resetTimeout(),
          onPanResponderMove: () => resetTimeout(),
          onPanResponderRelease: () => resetTimeout(),
          onPanResponderTerminate: () => resetTimeout(),
        });
    
        resetTimeout();
    
        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          subscription.remove();
        };
      }, []);


   
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

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const dateOnly = `${year}-${month}-${day}`;

    const timeOnly = now.toLocaleTimeString();

    const operatorLoginTime = async ()=>{

        const data = {

            opeatorId : route.params.user.id,
            role:route.params.user.role,
            loginTime:timeOnly,
            date:dateOnly

        }
        console.log(data);
        fetch(`${DOMAIN_URL}/insertOperatorLoginTime`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)

        }).then((response) => Promise.all([response.status.toString(), response.json()]))
         .then((res) => {
            if (res[0] === '200') {
                console.log(res);
                setTimeActivity(res[1].data.id);
            } 
        })
        .catch((error) => {
            console.error(error);
        });
    };


    useEffect(()=>{
        Toast.show({
            type: 'success',
            text1: 'Login Sucessfull',
            text2: `Welcome ${route.params.user.firstName}👋`
          });

        if(route.params.user.role == "operator")
            {
            operatorLoginTime();
            }
        let isMounted = true;
        const setAsyncStorageData = async () => {
            await AsyncStorage.setItem('userName', route.params.user.email);
            await AsyncStorage.setItem("name",route.params.user.firstName);
            await AsyncStorage.setItem('password', route.params.user.password);
            await AsyncStorage.setItem('token', route.params.user.token);
            await AsyncStorage.setItem('operatorID',JSON.stringify(route.params.user.id));
            await AsyncStorage.setItem('workingHours',JSON.stringify(route.params.user.workingHours));
        };

    
        setAsyncStorageData();
        return () => {
            isMounted = false; // Set the flag to indicate unmounting
            // Any cleanup code, if needed
        };

    },[]);
        useEffect(() => {
            const fetchData = async () => {
                try {
                    const time = await AsyncStorage.getItem('loginTime');
                    setLoginTime(time ? new Date(parseInt(time)).toLocaleString() : null);
                } catch (error) {
                    console.error('Error fetching login time:', error);
                }
            };

            fetchData();
        }, []);

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
