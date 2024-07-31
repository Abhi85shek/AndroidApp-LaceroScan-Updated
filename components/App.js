import React,{useEffect} from 'react';
import {View} from "react-native";
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer,useNavigation,DrawerActions } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from "react-native-vector-icons/Entypo";
import withAppCloseHandler from './withAppCloseHandler';

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
import ForgetPassword from './ForgetPassword';
import { OTPVerification } from './OTPVerification';
import ChangePassword from './ChangePassword';
import { RecoilRoot } from 'recoil';
import TimeActivity from './TimeActivity';

const CustomHeader = ({ navigation, route }) => {
  if (
    route.name === 'LogIn' ||
    route.name === 'ForgetPassword' ||
    route.name === 'OTPVerification' ||
    route.name === 'ChangePassword'
  ) {
    return null;
  }

  return (
    <TouchableOpacity style={{ marginRight: 15 }} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
      <Icon name="menu" size={30} color="#000" />
    </TouchableOpacity>
  );
};

const StackNavigation = ()=>{
  const Stack = createStackNavigator();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      const route = e.data.state.routes[e.data.state.index];
      if (
        route.name === 'LogIn' ||
        route.name === 'ForgetPassword' ||
        route.name === 'OTPVerification' ||
        route.name === 'ChangePassword'
      ) {
        navigation.dispatch(DrawerActions.closeDrawer());
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <Stack.Navigator initialRouteName="LogIn"  
    screenOptions={({ route }) => ({
      headerRight: () => <CustomHeader navigation={navigation} route={route} />
    })}
  >
        <Stack.Screen name="LogIn" component={LogInScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Home" component={HomeScreen} />
         <Stack.Screen name="NewStock" component={NewStockScreen} />
         <Stack.Screen name="NewShipmentSKID" component={NewShipmentSKIDScreen} />
        <Stack.Screen name="SelectCompany" component={SelectCompanyScreen} />
        <Stack.Screen name="NewItem" component={NewItemScreen} />
        <Stack.Screen name="ExistStock" component={ExistStockScreen} />
        <Stack.Screen name="ProcessItem" component={ProcessItemScreen} />
        <Stack.Screen name="ProcessSkid" component={ProcessSkidScreen} />   
        <Stack.Screen name="TimeActivity" component={TimeActivity} />
        <Stack.Screen name="ForgetPassword" component={ForgetPassword} options={{headerShown: false}}/>
        <Stack.Screen name="OTPVerification" component={OTPVerification} options={{headerShown: false}} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} options={{headerShown: false}} />
      </Stack.Navigator>
  )

};

const DrawerNavigation = ()=>{

  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator drawerContent={(props)=> <DrawerContent {...props}/>} screenOptions={{headerShown:false,swipeEnabled: false}} >
      <Drawer.Screen name='Root' component={StackNavigation}/>
     
  
  </Drawer.Navigator>
  )

};

const App = () => {
  
  const EnhancedDrawerNavigation = withAppCloseHandler(DrawerNavigation); 
  return (
    <RecoilRoot>
    <NavigationContainer>
    <EnhancedDrawerNavigation />
    </NavigationContainer>
    </RecoilRoot>
  );
};

export default App;
