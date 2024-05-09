import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

const FloatingLabelInputFocus = ({ label, onRef, value, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const labelStyle = {
        position: 'absolute',
        left: 0,
        top: (!isFocused && value === "") ? 5 : 0,
        fontSize: !isFocused ? 25 : 20,
        color: !isFocused ? '#aaa' : '#000',
    };

    return (
        <View style={{ paddingTop: 10 }}>
            <Text style={labelStyle}>{label}</Text>
            <TextInput
                ref={(r) => onRef(r)}
                value={value}
                {...props}
                style={{
                    height: 50,
                    fontSize: 25,
                    color: '#000',
                    borderBottomWidth: 1,
                    borderBottomColor: '#555',
                    marginTop: 25
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
        </View>
    );
};

export default FloatingLabelInputFocus;