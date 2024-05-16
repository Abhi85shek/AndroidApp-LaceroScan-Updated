import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
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

const Stack = createStackNavigator();


const App = () => {
  const Drawer = createDrawerNavigator()
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LogIn">
        <Stack.Screen name="LogIn" component={LogInScreen} />
      
        <Stack.Screen name="Home" component={HomeScreen} />
         <Stack.Screen name="NewStock" component={NewStockScreen} />
         <Stack.Screen name="NewShipmentSKID" component={NewShipmentSKIDScreen} />
        <Stack.Screen name="SelectCompany" component={SelectCompanyScreen} />
        <Stack.Screen name="NewItem" component={NewItemScreen} />
        <Stack.Screen name="ExistStock" component={ExistStockScreen} />
        <Stack.Screen name="ProcessItem" component={ProcessItemScreen} />
        <Stack.Screen name="ProcessSkid" component={ProcessSkidScreen} />   
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
