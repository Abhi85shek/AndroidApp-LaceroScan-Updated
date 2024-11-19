import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, AppState } from 'react-native';
import { DOMAIN_URL } from '../config/config';
import workingActivity from "./atom/workingActivity";
import { useRecoilState } from "recoil";
import { FlatList } from 'react-native-gesture-handler';

const TimeActivity = ({ navigation, route }) => {
  const [timeLogs, setTimeLogs] = useState([]);
  const [appState, setAppState] = useState(AppState.currentState);
  const timeActivity = useRecoilState(workingActivity);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Work Activity',
      headerStyle: {
        backgroundColor: '#1bb5d8',
        height: 80
      },
      headerTitleStyle: {
        fontSize: 30,
        alignSelf: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        flex: 1,
        textAlignVertical: 'center'
      }
    });
  }, [navigation]);

  useEffect(() => {
    getTimeActivityLog();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
    } else if (nextAppState.match(/inactive|background/)) {
      console.log('App is going to the background or is closed');
      await storeLogoutTime();
    }
    setAppState(nextAppState);
  };

  const storeLogoutTime = async () => {

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const dateOnly = `${year}-${month}-${day}`;

    const data = {
      operatorId: route.params.operatorId,
      timeStampId:timeActivity[0],
      role: 'operator',
      date:dateOnly
    };
    
    try {
      const response = await fetch(`${DOMAIN_URL}/insertOperatorLogoutTime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.status !== 200) {
        console.error('Failed to store logout time');
      }
    } catch (error) {
      console.error('Error storing logout time:', error);
    }
  };

  const getTimeActivityLog = async () => {
    const data = {
      operatorId: route.params.operatorId,
      date: route.params.date,
      role: 'Operator'
    };

    try {
      const response = await fetch(`${DOMAIN_URL}/timeActivityLog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.status === 200) {
        setTimeLogs(result.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const totalProductiveMinutes = () => {
    return timeLogs.reduce((total, log) => total + parseFloat(log.total) * 60, 0);
  };

  const formatProductiveHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours} Hour(s) ${remainingMinutes} Minute(s)`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.loginTime}</Text>
      <Text style={styles.cell}>{item.logoutTime}</Text>
      <View style={styles.cell}>
        <Text>{Math.round(item.total * 60)} Minutes</Text>
      </View>
    </View>
  );

  const totalMinutes = totalProductiveMinutes();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Login Time</Text>
        <Text style={styles.heading}>Logout Time</Text>
        <Text style={styles.heading}>Total</Text>
      </View>
      <FlatList
        data={timeLogs}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={renderItem}
      />
      <View>
        <Text>Total Productive Hours: {formatProductiveHours(totalMinutes)}</Text>
      </View>
    </View>
  );
};

export default TimeActivity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 30
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    textAlign: 'center'
  },
  heading: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 0,
    marginHorizontal: 2,
    elevation: 1,
    borderRadius: 3,
    borderColor: '#fff',
    padding: 10,
    backgroundColor: '#fff'
  },
  cell: {
    fontSize: 15,
    textAlign: 'left',
    flex: 1,
    textAlign: 'center',
    padding: 3
  }
});
