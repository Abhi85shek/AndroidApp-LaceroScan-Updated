import React, { Component } from 'react';
import {View, Text, StyleSheet, Dimensions, TouchableOpacity, Keyboard, Alert} from 'react-native';
const Sound = require('react-native-sound');
import KeyEvent from 'react-native-keyevent';
Keyboard.dismiss();
import FloatingLabelInputFocus from "../cell/floatingLabelInputFocus";
import { DOMAIN_URL  } from '../../config/config'
export default class NewItemScreen extends Component {
    success = new Sound('success.wav');
    fail = new Sound('fail.mp3');
    constructor(props) {
        super(props);
        this.state = {
            itemCode: '',
            scanned:false,
            focus:true,
            totalScanned:0,
            user:undefined,
            companyId: undefined
        };
    }
    componentDidMount(){
        const {navigation} = this.props;
        const user = navigation.getParam('user', {});
        const companyId = navigation.getParam('companyId','2');
        this.setState({user, companyId});
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
        title: `NEW ITEM`,
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

    handleReceived = async () =>{
        this.setState({
            scanned:true
        },()=>{
            Keyboard.dismiss();
            const barCode = this.state.itemCode;
            let totalScanned = this.state.totalScanned;
            const data = {
                "data": {
                    "barCode": barCode,
                    "companyID" : this.state.companyId
                }
            };
            const token ='Bearer ' + this.state.user.token;
            fetch(`${DOMAIN_URL}/process_task`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(data)
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    if(responseJson.message==="Record Create Successfully"){
                        this.success.play();
                        totalScanned = totalScanned + 1;
                    }else{
                        this.fail.play();
                        this.fail.play();
                    }
                    Alert.alert(
                        responseJson.message,
                        `Total Scanned: ${totalScanned}`,
                        [
                            { text: "OK", onPress: () =>this.setState({
                                    scanning: false,
                                    scanned:false
                                })}
                        ]
                    );
                    this.setState({  itemCode: '',  scanned:false, totalScanned});
                    this.myField2.focus();
                })
                .catch((error) => {
                    console.error(error);
                    this.setState({  itemCode: '',  scanned:false, totalScanned});
                    this.myField2.focus();
                });
        })
    };
    handleNext = () =>{
        this.setState({  itemCode: '',  scanned:false});
        this.myField2.focus()
    };
    render() {
        const { scanned } = this.state;
        return (
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <Text style={styles.textField}>Total Scanned: {this.state.totalScanned}</Text>
                    <FloatingLabelInputFocus
                        onRef={(r) => this.myField2 = r}
                        label="ITEM CODE"
                        value = { this.state.itemCode }
                        autoFocus
                        onKeyMultipleListener={() => alert('Keyboard Hidden')}
                        onChangeText={text => this.setState({itemCode:text})}
                    />
                    { scanned ? <TouchableOpacity style={styles.button}>
                                    <Text style={styles.buttonText}> UPDATING... </Text>
                                </TouchableOpacity>: <TouchableOpacity style={styles.button} onPress={this.handleReceived}>
                                                        <Text style={styles.buttonText}> RECEIVED </Text>
                                                     </TouchableOpacity>}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.handleNext}
                    >
                        <Text style={styles.buttonText}> SCAN NEXT </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

let containerHeight = Dimensions.get('window').height - 200;
const styles = StyleSheet.create({
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
    button:{
        marginTop: 50,
        height:100,
        position: 'relative',
        backgroundColor:'#1baeff',
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center'
    },
    buttonText:{
        fontSize: 50,
        fontWeight: 'bold'
    }
});