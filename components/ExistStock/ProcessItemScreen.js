import React, { Component } from 'react';
import {View, Text, StyleSheet, Dimensions, TouchableOpacity, Keyboard, Alert, TextInput,ScrollView} from 'react-native';
const Sound = require('react-native-sound');
import KeyEvent from 'react-native-keyevent';
Keyboard.dismiss();
import { DOMAIN_URL  } from '../../config/config'
export default class ProcessItemScreen extends Component {
    success = new Sound('success.wav');
    fail = new Sound('fail.mp3');
    constructor(props) {
        super(props);
        this.state = {
            scanned:false,
            totalProcessed:0,
            items:[
                {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'}
            ],
            user:undefined,
            skid: undefined
        };
    }
    componentDidMount(){
        const {navigation} = this.props;
        const user = navigation.getParam('user', {});
        const skid = navigation.getParam('skid', {});
        this.setState({
            user,
            skid,
            totalProcessed: skid.totalProcessed
        });
        KeyEvent.onKeyMultipleListener((keyEvent) => {
            console.log(`onKeyMultiple keyCode: ${keyEvent.keyCode}`);
            console.log(`Action: ${keyEvent.action}`);
            console.log(`Characters: ${keyEvent.characters}`);
        });
    }
    componentWillUnmount () {
        KeyEvent.removeKeyMultipleListener();
    }
    static navigationOptions = {
        title: `PROCESSING ITEM`,
        //headerLeft: null,
        headerStyle:{
            backgroundColor: '#1bb5d8',
            height: 100
        },
        headerTitleStyle: {
            fontSize: 30,
            alignSelf: 'center',
            textAlign: "center",
            justifyContent: 'center',
            flex: 1,
            fontWeight: 'bold',
            textAlignVertical: 'center'
        },
    };

    handleUpdateStatus = async () =>{
        this.setState({
            scanned:true
        },()=>{
            Keyboard.dismiss();
            //Add SKID ID
            const data = {
                "data": {
                    "items": this.state.items.filter(item=>item.barCode!=="").map(item=>{
                        item.skidID = this.state.skid.id;
                        item.companyID = this.state.skid.companyID;
                        return item;
                    }),
                    "skidID" : this.state.skid.id
                }
            };
            const token ='Bearer ' + this.state.user.token;
            fetch(`${DOMAIN_URL}/process_task_bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(data)
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    Alert.alert(
                        `Process Results - Total Created: ${responseJson.data.totalCreated}`,
                         responseJson.message,
                        [
                            { text: "OK", onPress: () =>this.setState({
                                    scanning: false,
                                    scanned:false
                                })}
                        ]
                    );
                    this.setState({
                        items:[
                            {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                            {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                            {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                            {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                            {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                            {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'}
                        ],
                        scanned:false,
                        totalProcessed: responseJson.data.totalProcessed
                    },()=>  this[0].focus());
                })
                .catch((error) => {
                    console.error(error);
                    this.setState({
                        items:[
                            {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                            {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                            {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                            {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                            {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                            {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'}
                        ],
                        scanned:false
                    });
                });
        })
    };
    handleReset = () =>{
        this.setState({
            items:[
                {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'},
                {barCode:'',status:'SUCCESSFULLY_DEACTIVATED'}
            ],
            scanned:false
        },()=>this[0].focus());
    };
    handleFinish = ()=>{
        const totalUnits = this.state.skid.units;
        const totalProcessed = this.state.totalProcessed;
        if(totalUnits === totalProcessed){
            //update skid status
            const skid = this.state.skid;
            skid.process_status = "PROCESSED";
            const token ='Bearer ' + this.state.user.token;
            fetch(`${DOMAIN_URL}/skid/finish`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(skid)
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    if(responseJson.message==="Skid Status Updated!"){
                        this.success.play();
                        Alert.alert(
                            responseJson.message,
                            `Finish Skid Succeed!`,
                            [
                                { text: "OK", onPress: () =>{
                                        const {navigation} = this.props;
                                        const navigate = navigation.navigate;
                                        const user = this.state.user;
                                        navigate('ProcessSkid', {user});
                                    }
                                }
                            ]
                        );
                    }else{
                        this.fail.play();
                        this.fail.play();
                        Alert.alert(
                            responseJson.message,
                            `Finish Skid Failed!`,
                            [
                                { text: "OK", onPress: () =>this.setState({
                                        scanning: false,
                                        scanned:false
                                    })}
                            ]
                        );
                    }
                })
                .catch((error) => {
                    console.error(error);
                });

        }else{
            Alert.alert(
                "Units in the current skid doesn't finish !!!",
                `Only ${totalProcessed} out of ${totalUnits} units processed in the skid, need to process ${totalUnits - totalProcessed} more units!`,
                [
                    { text: "OK", onPress: () =>this.setState({
                            scanning: false,
                            scanned:false
                        })}
                ]
            );
        }
    };

    handleRenderSection = (index)=>{
        switch (index) {
            case 0: return "S1 L";
            case 1: return "S1 R";
            case 2: return "S2 L";
            case 3: return "S2 R";
            case 4: return "S3 L";
            default: return "S3 R";
        }
    };
    handleRenderList = () =>{
       return this.state.items.map((data,index)=>{
            const yesStyle = data.status === "SUCCESSFULLY_DEACTIVATED"?{
                    backgroundColor:'#30b29d',
                    height:'100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                }:
                {
                    backgroundColor:'#8c8f94',
                    height:'100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
            };
           const noStyle = data.status === "UNSUCCESSFULLY_DEACTIVATED"?{
                   backgroundColor:'#ab2240',
                   height:'100%',
                   justifyContent: 'center',
                   alignItems: 'center',
                   textAlign: 'center'
               }:
               {
                   backgroundColor:'#8c8f94',
                   height:'100%',
                   justifyContent: 'center',
                   alignItems: 'center',
                   textAlign: 'center'
               };
            return ( <View style={styles.row} key={index}>
                <View><Text  style={styles.sectionField}>
                    {this.handleRenderSection(index)}
                </Text></View>
                <View style={styles.inputWrap}>
                    <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>
                        <TextInput
                            style={styles.textInput}
                            value = { data.barCode }
                            autoFocus = {index === 0}
                            onKeyMultipleListener={() => alert('Keyboard Hidden')}
                            ref={ input => { this[index] = input}}
                            onSubmitEditing={() =>{
                                if(index<5){
                                    this[(index+1)].focus()
                                }
                            }}
                            onChangeText={text =>{
                                const items = this.state.items;
                                items[index].barCode = text;
                                this.setState({
                                    items
                                });
                            }}
                            onBlur={() => {
                                if(data.barCode !== ''){
                                    const items = this.state.items;
                                    const totalCode = (items.filter(item=>item.barCode === data.barCode)).length;
                                    if(totalCode > 1){
                                        Alert.alert(`${data.barCode} already exist!`);
                                        items[index].barCode = '';
                                        this[index].focus();
                                    }
                                    this.setState({
                                        items
                                    })
                                }
                            }}
                        />
                    </ScrollView>
                </View>
                <View style={styles.inputWrap}>
                    <View style={styles.row} >
                        <View style={styles.inputWrap}>
                            <TouchableOpacity style={yesStyle} onPress={()=>{
                                const items = this.state.items;
                                items[index].status = 'SUCCESSFULLY_DEACTIVATED';
                                this.setState({
                                    items
                                });
                            }}>
                                <Text style={styles.label}>YES</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputWrap}>
                            <TouchableOpacity style={noStyle} onPress={()=>{
                                const items = this.state.items;
                                items[index].status = 'UNSUCCESSFULLY_DEACTIVATED';
                                this.setState({
                                    items
                                });
                            }}>
                                <Text style={styles.label}>NO</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>)
        })
    };
    render() {
        const { scanned } = this.state;
        return (
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    {this.state.skid!==undefined &&
                    <Text style={styles.barCode}>{this.state.skid.barCode} - <Text style={styles.units}>total units: {this.state.skid.units}</Text></Text>
                    }
                    {this.state.skid !== undefined &&
                    <Text style={styles.textField}>Total Processed: {this.state.totalProcessed}</Text>
                    }
                    {this.handleRenderList()}

                    { scanned ? <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}> UPDATING... </Text>
                    </TouchableOpacity>: <TouchableOpacity style={styles.button} onPress={this.handleUpdateStatus}>
                        <Text style={styles.buttonText}> UPDATE STATUS </Text>
                    </TouchableOpacity>}
                    <View style={styles.container1}>
                        <View style={styles.button1}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={this.handleReset}
                            >
                                <Text style={styles.buttonText}> RESET </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.button1}>
                            <TouchableOpacity
                                style={styles.finishButton}
                                onPress={this.handleFinish}
                            >
                                <Text style={styles.buttonText}> FINISH SKID </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

let containerHeight = Dimensions.get('window').height - 200;
const styles = StyleSheet.create({
    container1: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    button1: {
        width: '45%'
    },
    row: {
        flex: 1,
        flexDirection: "row",
    },
    inputWrap: {
        flex: 1
    },
    textInput:{
        height:'100%',
        backgroundColor:'#ecebed',
        fontSize: 30,
        fontWeight: 'bold',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    yesField: {
        backgroundColor:'#4d954a',
        height:'100%',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    sectionField:{
        backgroundColor:'#fbff17',
        fontSize: 30,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        width: 100
    },
    noField: {
        backgroundColor:'#8c8f94',
        height:'100%',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    label:{
        fontSize: 40,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        height: containerHeight
    },
    inputContainer:{
        flex: 1,
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10
    },
    textField:{
        fontSize: 50,
        fontWeight: 'bold',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    barCode:{
        fontSize: 35,
        fontWeight: 'bold',
        color: 'green',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    units:{
        fontSize: 20,
        color: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    button:{
        marginTop: 5,
        flex: 1,
        position: 'relative',
        backgroundColor:'#1baeff',
        alignItems: 'center',
        padding: 5,
        borderRadius: 5,
        justifyContent: 'center'
    },
    finishButton:{
        marginTop: 5,
        flex: 1,
        position: 'relative',
        backgroundColor:'#ff1c36',
        alignItems: 'center',
        padding: 5,
        borderRadius: 5,
        justifyContent: 'center'
    },
    buttonText:{
        fontSize: 20,
        fontWeight: 'bold'
    }
});