import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Picker, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SelectCompanyScreen = () => {
  const navigation = useNavigation();

  const [selectedCompany, setSelectedCompany] = useState("2");

  const handleContinue = () => {
    // const user = navigation.getParam('user', {});
    const user = route.params;
    navigation.navigate('NewItem', {
      user: user,
      companyId: selectedCompany
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Picker
          selectedValue={selectedCompany}
          style={styles.selectPicker}
          itemStyle={styles.pickerItem}
          onValueChange={(itemValue, itemIndex) =>
            setSelectedCompany(itemValue)
          }>
          <Picker.Item label="Honda" value="2" />
          <Picker.Item label="Toyota" value="3" />
        </Picker>

        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default SelectCompanyScreen;

const containerHeight = Dimensions.get('window').height - 200;
const containerWidth = Dimensions.get('window').width - 100;
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
    marginRight: 10,
    alignItems: 'center'
  },
  selectPicker: {
    marginTop: 100,
    marginBottom: 50,
    width: containerWidth,
    height: 50
  },
  pickerItem: {
    fontSize: 25,
    height: 75,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  button: {
    marginTop: 50,
    height: 100,
    position: 'relative',
    backgroundColor: '#1baeff',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});