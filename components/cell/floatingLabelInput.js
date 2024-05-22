import React, { useState } from 'react';
import { View, Text, TextInput,TouchableOpacity } from 'react-native';
import Icon from "react-native-vector-icons/Entypo"
const FloatingLabelInput = ({ label, placeholder ,value, ...props}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    // const labelStyle = {
    //     position: 'absolute',
    //     left: 0,
    //     top: (!isFocused && value === "") ? 5 : 0,
    //     fontSize: !isFocused ? 25 : 20,
    //     color: !isFocused ? '#aaa' : '#000',
    // };

    return (
        <View className="pt-8">
            <Text className="text-xl text-black mb-3 font-medium" >{label}</Text>
            <TextInput
                value={value}
                placeholder={placeholder}
                {...props}
                // style={{
                //     height: 50,
                //     fontSize: 25,
                //     color: '#000',
                //     borderBottomWidth: 1,
                //     borderBottomColor: '#555',
                //     marginTop: 25
                // }}
                className="h-30 bg-gray-100 rounded-full  pl-5 p-4 text-xl"
                onFocus={handleFocus}
                onBlur={handleBlur}

            />
      
        </View>
    );
};

export default FloatingLabelInput;
