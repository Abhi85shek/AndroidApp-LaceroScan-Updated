import React, { useState } from 'react'
import { View,Text,TextInput,TouchableOpacity,StyleSheet, Alert } from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import { DOMAIN_URL } from "../config/config";

const ChangePassword = ({navigation,route}) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isValidLength, setIsValidLength] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasUpperLowerCase, setHasUpperLowerCase] = useState(false);  
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    // arrow-back-sharp
    const validatePassword = (input) => {
        setPassword(input);
        
       
        // Check for at least 8 characters
        setIsValidLength(input.length >= 8);
    
        // Check for at least 1 number
        setHasNumber(/\d/.test(input));
    
        // Check for both upper and lower case letters
        setHasUpperLowerCase(/(?=.*[a-z])(?=.*[A-Z])/.test(input));
         // Check if passwords match
        setPasswordsMatch(input === confirmPassword);
      };

      const validateConfirmPassword = (input) => {
        setConfirmPassword(input);
        // Check if passwords match
        setPasswordsMatch(input === password);
      };


    const resetPasswordHandler = ()=>{
            if(passwordsMatch && isValidLength && hasNumber && hasUpperLowerCase && hasUpperLowerCase)
                {
                    const data = {
                        email:route.params.email,
                        password:password
                    }
                    
    fetch(`${DOMAIN_URL}/resetPassword`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then((response) => Promise.all([response.status.toString(), response.json()]))
    .then((res) => {
        
        if (res[0] === '200') {
            Alert.alert("Password Successfully Changed");
            navigation.navigate('LogIn');
        } 
        
    })
    .catch((error) => {
       
        console.error(error);
    });

     }
     else
     {
        Alert("Please Enter Password as Per the Requirement");
     }
    };

  return (
    <View className="m-3 flex-1 mt-5">
        <Text className="text-2xl text-black font-semibold mb-5">Change Password</Text>
            <TextInput placeholder="New Password" secureTextEntry={true}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={password}
            onChangeText={validatePassword}
            />
    
         <TextInput placeholder="Confirm Password" secureTextEntry={true}
            className="bg-gray-50 border mt-5 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={confirmPassword}
            onChangeText={validateConfirmPassword}
            />
        
        <View className="mt-5 flex flex-col justify-center">
            <Text style={[styles.requirement, isValidLength ? styles.valid : styles.invalid]}> <Icon name='checkcircle' size={15} color={isValidLength ? "green" : "red"} className="pr-2" />At least 8 characters</Text>
            <Text style={[styles.requirement, hasNumber ? styles.valid : styles.invalid]}> <Icon name='checkcircle' size={15} color={hasNumber ? "green" : "red"} className="pr-2" />At least 1 number</Text>
            <Text style={[styles.requirement, hasUpperLowerCase ? styles.valid : styles.invalid]}> <Icon name='checkcircle' size={15} color={hasUpperLowerCase ? "green" : "red"} className="pr-2" />Both upper and lower case letters</Text>    
            <Text style={[styles.requirement, passwordsMatch ? styles.valid : styles.invalid]}><Icon name='checkcircle' size={15} color={passwordsMatch ? "green" : "red"} className="pr-2" />Passwords match</Text>
        </View>
         <TouchableOpacity
                    className="bg-blue-700 p-4 rounded-full top-10"
                    // onPress={resetPasswordHandler}
         >
                    <Text className="text-white text-center text-lg" onPress={resetPasswordHandler}>Reset Password</Text>
        </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: '#f8f8f8',
      borderRadius: 10,
      marginVertical: 10,
      marginHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 1,
    },
    input: {
      width: '100%',
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 20,
      paddingLeft: 10,
    },
    requirement: {
      fontSize: 16,
      marginBottom: 10,
    },
    valid: {
      color: 'green',
    },
    invalid: {
      color: 'red',
    },
  });
export default ChangePassword