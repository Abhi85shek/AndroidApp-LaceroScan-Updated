import React,{useEffect, useLayoutEffect, useState} from 'react'
import { View,Text,ScrollView } from 'react-native'
import { DOMAIN_URL } from "../config/config";
const TimeActivity = ({navigation,route}) => {

  const [timeLogs,setTimeLogs]=useState([]);

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
        fontWeight: 'bold',
        textAlignVertical: 'center'
      }
    });
  }, [navigation]);

  useEffect(()=>{
    getTimeActivityLog();
  },[]);

  const getTimeActivityLog = async ()=>{

    
    const data = {
      operatorId : route.params.operatorId,
      date:route.params.date,
      role:"Operator"
  }

  fetch(`${DOMAIN_URL}/timeActivityLog`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
      
  }).then((response) => Promise.all([response.status.toString(), response.json()]))
   .then((res) => {
      if (res[0] === '200') {
          setTimeLogs(res[1].data)
      } 

      // console.log(response[0]);
  })
  .catch((error) => {
      console.error(error);
  });


  };
  return (
    <View>
      {timeLogs.map((time,index)=> (
          <View key={index} className="flex flex-row justify-between p-3">
          
            <Text>{time.loginTime}</Text>
            <Text>{time.logoutTime}</Text>
            <Text>{(time.total)*60} Hours</Text>
         
          </View>
            
      ))}
       
    </View>
  )
}

export default TimeActivity;