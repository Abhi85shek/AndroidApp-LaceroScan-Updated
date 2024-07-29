import React,{useEffect, useLayoutEffect, useState} from 'react'
import { View,Text,ScrollView, StyleSheet } from 'react-native'
import { DOMAIN_URL } from "../config/config";
import { FlatList } from 'react-native-gesture-handler';
const TimeActivity = ({navigation,route}) => {

  const [timeLogs,setTimeLogs]=useState([]);
  const [totalTime,setTotalTime] = useState(0);

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

  const totalProductiveHours = ()=>{

      var total =0;
      for(let i=0;i<timeLogs.length;i++)
          {
            
             total = total + parseFloat(timeLogs[i].total);
          
          }

          return Math.floor(total*60);
  };

  const formatProductiveHours = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} Hour(s) ${remainingMinutes} Minute(s)`;
    } else {
      return `${minutes} Minute(s)`;
    }
  };

  const renderItem = ({item})=>
    (
      <View style={styles.row}>
          <Text style={styles.cell}>{item.loginTime}</Text>
          <Text style={styles.cell}>{item.logoutTime}</Text>
          <View style={styles.cell}>
            {/* <Text>{item.total} Hours</Text> */}
           { item.total < 0 ?  (<Text>{Math.round((item.total) )} Hours</Text>) : (<Text>{Math.round((item.total)* 60 )} Minutes</Text>) }
          </View>
      </View>
    )

    const totalMinutes = totalProductiveHours();
  return (

    <View style={styles.container}> 
      <View style={styles.header}>
          <Text style={styles.heading}>Login Time</Text>
          <Text style={styles.heading}>Logout Time</Text>
          <Text style={styles.heading}>Total</Text>
      </View>
      <FlatList
          data={timeLogs}
          keyExtractor={(item,index)=> {item}}
          renderItem={renderItem}
      />       
      <View>
      <Text>Total Productive Hours: {formatProductiveHours(totalMinutes)}</Text>
        {/* <Text>Total Productive Hours: {totalProductiveHours()} Minutes</Text> */}
      </View>
    </View>
  )
}

export default TimeActivity;


const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#fff',
    paddingVertical:30,
    paddingHorizontal:30
  },
  header:{
    flexDirection:'row',
    justifyContent:'space-between',
    padding:10,
    textAlign:'center'
    
  },
  heading:{
    flex:1,
    fontSize:15,
    fontWeight:'bold',
    textAlign:'center'
  },
  row:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginVertical:0,
    marginHorizontal:2,
    elevation:1,
    borderRadius:3,
    borderColor:'#fff',
    padding:10,
    backgroundColor:'#fff'
  },
  cell:{
    fontSize:15,
    textAlign:'left',
    flex:1,
    textAlign:'center',
    padding:3
  }
});