import React from "react";
import {View,StyleSheet,Text} from 'react-native';
import { DrawerContentScrollView } from "@react-navigation/drawer";
import  {Avatar,Title} from "react-native-paper";
import { TouchableOpacity } from "react-native-gesture-handler";

function DrawerContent(props) {

    return (
        <View>
                <DrawerContentScrollView {...props}>
                    <TouchableOpacity activeOpacity={0.8}>
                        <View>
                                <View>
                                    <Avatar.Text label="AB" size={50} style={{marginTop:5}} />
                                </View>
                        </View>




                    </TouchableOpacity>
                </DrawerContentScrollView>

        </View>
    )




};

export default DrawerContent;