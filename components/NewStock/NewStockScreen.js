import React,{useLayoutEffect, useState,useEffect} from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const NewStockScreen = ({ route,navigation }) => {

    useLayoutEffect(() => {
        navigation.setOptions({
          title: 'New Stock',
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

    const handleShipmentSkid = () => {
        const user = route.params;
        // const user = navigation.getParam('user', {});
        navigation.navigate('NewShipmentSKID', { user });
    };

    const handleItem = () => {
        const user = route.params;
        // const user = navigation.getParam('user', {});
        navigation.navigate('SelectCompany', { user });
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.button} onPress={handleShipmentSkid}>
                    <Text style={styles.buttonText}> Receive SKID  </Text>
                </TouchableOpacity>

                {/* <TouchableOpacity style={styles.button} onPress={handleItem}>
                    <Text style={styles.buttonText}>Check In Item </Text>
                </TouchableOpacity> */}

                {/* <TouchableOpacity style={styles.button} onPress={handleInStock}>
                    <Text style={styles.buttonWarehouse}> Warehouse Coordinates </Text>
                </TouchableOpacity> */}
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
        borderRadius: 100,
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 40,
        // fontWeight: 'bold',
        textAlign: 'center',
        color:'white'

    },
    buttonWarehouse: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default NewStockScreen;
