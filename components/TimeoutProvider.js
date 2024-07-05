import React, { createContext, useState, useEffect, useRef } from 'react';
import { View, AppState, PanResponder } from 'react-native';
import { DOMAIN_URL } from "../config/config";
const AUTO_LOGOUT_TIME = 5 * 60 * 1000; // 5 minutes
export const TimeoutContext = createContext();

const TimeoutProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const resetTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(logout, AUTO_LOGOUT_TIME);
    };

    const logout = () => {
      setIsLoggedIn(false);
      console.log('User logged out due to inactivity');

      // Add your logout logic here (e.g., clear session, redirect to login)
    };

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        resetTimeout();
      } else if (nextAppState.match(/inactive|background/)) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => resetTimeout(),
      onPanResponderMove: () => resetTimeout(),
      onPanResponderRelease: () => resetTimeout(),
      onPanResponderTerminate: () => resetTimeout(),
    });

    resetTimeout();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      subscription.remove();
    };
  }, []);

  return (
    <TimeoutContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <View {...panResponder.panHandlers} style={{ flex: 1 }}>
        {children}
      </View>
    </TimeoutContext.Provider>
  );
};

export default TimeoutProvider;
