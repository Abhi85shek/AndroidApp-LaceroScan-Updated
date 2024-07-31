// withAppCloseHandler.js
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { useRecoilValue } from 'recoil';
import { loginParamsState } from './atom/state';
import { useNavigation } from '@react-navigation/native';

import { DOMAIN_URL } from "../config/config"; // Replace with your actual domain URL

const withAppCloseHandler = (WrappedComponent) => {
  const EnhancedComponent = (props) => {
    const { operatorId, timeActivity } = useRecoilValue(loginParamsState);
    const navigation = useNavigation();

    const operatorLogOutTime = async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateOnly = `${year}-${month}-${day}`;
      

      const data = {
        date: dateOnly,
        role: 'operator',
        operatorId,
        timeStampId: timeActivity,
      };
      console.log(data);

      try {
        console.log("Hello2");
        const response = await fetch(`${DOMAIN_URL}/insertOperatorLogoutTime`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        console.log("Hello4");
        console.log('Logout API call successful:', response);
        // navigation.navigate('LogIn');
      } catch (error) {
        console.error('Logout API call failed:', error);
        navigation.navigate('LogIn');
      }
    };

    const operatorLogInTime = async () => {
        
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const dateOnly = `${year}-${month}-${day}`;

    const timeOnly = now.toLocaleTimeString();
        const data = {

            opeatorId : operatorId,
            role:'operator',
            loginTime:timeOnly,
            date:dateOnly

        }
      // Implement your login API call logic here
      try {
        const response = await fetch(`${DOMAIN_URL}/insertOperatorLoginTime`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        console.log('Login API call successful:', response);
      } catch (error) {
        console.error('Login API call failed:', error);
      }
    };

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
          if (nextAppState === 'active') {
            operatorLogInTime();
          } else if (nextAppState === 'background' || nextAppState === 'inactive') {
            operatorLogOutTime();
          }
        };
  
        const subscription = AppState.addEventListener('change', handleAppStateChange);
  
        return () => {
          subscription.remove();
        };
      }, [operatorId, timeActivity]);

    return <WrappedComponent {...props} />;
  };

  return EnhancedComponent;
};

export default withAppCloseHandler;
