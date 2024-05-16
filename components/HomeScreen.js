import React,{useEffect, useLayoutEffect, useState} from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ route, navigation }) => {

    // const [loginTime,setLoginTime]= useState(null);

    console.log(route.params.user.firstName);
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
            fontWeight: 'bold',
            textAlignVertical: 'center'
          },headerRight: () => (
            <TouchableOpacity>
                <View>
                    <Text>{route.params.user.firstName}</Text>
                </View>
            </TouchableOpacity>
        )
        });
      }, [navigation]);

    useEffect(()=>{
        let isMounted = true;
        const setAsyncStorageData = async () => {
            await AsyncStorage.setItem('userName', route.params.user.email);
            await AsyncStorage.setItem('password', route.params.user.password);
            await AsyncStorage.setItem('token', route.params.user.token);
            // await AsyncStorage.setItem('loginTime',JSON.stringify(Date.now()));
        };
    
        setAsyncStorageData();
        return () => {
            isMounted = false; // Set the flag to indicate unmounting
            // Any cleanup code, if needed
        };

    },[]);
    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const time = await AsyncStorage.getItem('loginTime');
    //             setLoginTime(time ? new Date(parseInt(time)).toLocaleString() : null);
    //         } catch (error) {
    //             console.error('Error fetching login time:', error);
    //         }
    //     };

    //     fetchData();
    // }, []);

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
                    <Text style={styles.buttonText}> New Stock </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleExistStock}
                >
                    <Text style={styles.buttonText}> Exist Stock </Text>
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
    button: {
        marginTop: 50,
        height: 100,
        position: 'relative',
        backgroundColor: '#1baeff',
        alignItems: 'center',
        padding: 10,
        borderRadius: 5
    },
    buttonText: {
        fontSize: 50,
        fontWeight: 'bold'
    }
});

export default HomeScreen;
