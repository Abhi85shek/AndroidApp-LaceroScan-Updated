import React from 'react';
import {View} from "react-native";
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer,useNavigation,DrawerActions } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from "react-native-vector-icons/Entypo";

// // Import your screen components
import HomeScreen from './HomeScreen';

import LogInScreen from './LogInScreen';
import NewStockScreen from './NewStock/NewStockScreen';
import NewShipmentSKIDScreen from './NewStock/NewShipmentSKIDScreen';
import SelectCompanyScreen from './NewStock/SelectCompanyScreen';
import NewItemScreen from './NewStock/NewItemScreen';
import ExistStockScreen from './ExistStock/ExistStockScreen';
import ProcessItemScreen from './ExistStock/ProcessItemScreen';
import ProcessSkidScreen from './ExistStock/ProcessSkidScreen';
import DrawerContent from './DrawerNavigator/DrawerContent';
import { TouchableOpacity } from 'react-native-gesture-handler';




const StackNavigation = ()=>{
  const Stack = createStackNavigator();
  const navigation = useNavigation();
  return (
    <Stack.Navigator initialRouteName="LogIn" screenOptions={
      {
        headerRight:()=>{
          return (
              <TouchableOpacity  className="mr-5">
              <Icon name="menu" size={30}  color="#000"  
              onPress={()=>navigation.dispatch(DrawerActions.openDrawer)}
              />
              </TouchableOpacity>
          )
        }
      }
    }>
        <Stack.Screen name="LogIn" component={LogInScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Home" component={HomeScreen} />
         <Stack.Screen name="NewStock" component={NewStockScreen} />
         <Stack.Screen name="NewShipmentSKID" component={NewShipmentSKIDScreen} />
        <Stack.Screen name="SelectCompany" component={SelectCompanyScreen} />
        <Stack.Screen name="NewItem" component={NewItemScreen} />
        <Stack.Screen name="ExistStock" component={ExistStockScreen} />
        <Stack.Screen name="ProcessItem" component={ProcessItemScreen} />
        <Stack.Screen name="ProcessSkid" component={ProcessSkidScreen} />   
      </Stack.Navigator>
  )

};

const DrawerNavigation = ()=>{

  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator 
    drawerContent={(props)=> <DrawerContent {...props}/>} screenOptions={{headerShown:false}}>
      <Drawer.Screen name='Root' component={StackNavigation}/>
  </Drawer.Navigator>
  )

};

const App = () => {
 
  return (
    <NavigationContainer>
            <DrawerNavigation />
    </NavigationContainer>
  );
};

export default App;
