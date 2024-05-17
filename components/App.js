import React,{useState
} from 'react';
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


const Stack = createStackNavigator();

const StackNavigation = ()=>{
  const navigation = useNavigation();
  
  return (
    <Stack.Navigator
    screenOptions={
    {
      headerRight: ()=>{
        return (
            <Icon 
              name="menu"
              onPress={()=>navigation.dispatch(DrawerActions.openDrawer())}
              size={30}
              color="#fff"
            />
        )
      }
    }
  }
    >
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
    <Drawer.Navigator screenOptions=
    {{drawerPosition:"right",
      headerShown:false
    }}
    >
          <Drawer.Screen name="Test" component={StackNavigation} />
    </Drawer.Navigator>
  )

};


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const Drawer = createDrawerNavigator()
  return (
    <NavigationContainer>
          {isAuthenticated ? (
        <DrawerNavigation />
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="LogIn">
            {(props) => <LogInScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App;
