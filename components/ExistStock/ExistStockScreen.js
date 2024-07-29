import React,{useLayoutEffect} from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ExistStockScreen = ({route,navigation}) => {

    useLayoutEffect(() => {
        navigation.setOptions({
          title: 'Exist Stock',
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

  const handleProcessSkid = () => {
    const user = route.params;
    navigation.navigate('ProcessSkid', { user });
  };

  const handleInStock = () => {
    const user = route.params;
    navigation.navigate('Home', { user });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleProcessSkid}
        >
          <Text style={styles.buttonText}> Process Skid </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.button}
          onPress={handleInStock}
        >
          <Text style={styles.buttonText}> Exist Stock </Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

export default ExistStockScreen;

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
    borderRadius: 100
  },
  buttonText: {
    fontSize: 45,
    // fontWeight: 'bold',
    color:'white'
  }
});
