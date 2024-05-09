import React, { Component } from 'react';
import {View, Text, StyleSheet, Dimensions, TouchableOpacity, Keyboard, Alert} from 'react-native';
const Sound = require('react-native-sound');
import KeyEvent from 'react-native-keyevent';
Keyboard.dismiss();
import FloatingLabelInputFocus from "../cell/floatingLabelInputFocus";
import { DOMAIN_URL  } from '../../config/config'
export default class ProcessSkidScreen extends Component {
    success = new Sound('success.wav');
    fail = new Sound('fail.mp3');
    constructor(props) {
        super(props);
        this.state = {
            itemCode: '',
            scanned:false,
            focus:true,
            user:undefined
        };
    }
    componentDidMount(){
        const {navigation} = this.props;
        const user = navigation.getParam('user', {});
        this.setState({user});
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
        title: `Process SKID`,
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

    handleProcess = async () =>{
        this.setState({
            scanned:true
        },()=>{
            Keyboard.dismiss();
            const barCode = this.state.itemCode;
            const token ='Bearer ' + this.state.user.token;
            fetch(`${DOMAIN_URL}/skid/processing`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    barCode
                })
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    if(responseJson.message==="Record found"){
                        this.success.play();
                        //transfer to next page
                        const {navigation} = this.props;
                        const navigate = navigation.navigate;
                        const user = navigation.getParam('user', {});
                        navigate('ProcessItem', {user,
                                                 skid: responseJson.data
                        });
                    }else{
                        this.fail.play();
                        this.fail.play();
                        Alert.alert(
                            responseJson.message,
                            `SKID IN: ${responseJson.data.process_status} Status!`,
                            [
                                { text: "OK", onPress: () =>this.setState({
                                        scanning: false,
                                        scanned:false
                                    })}
                            ]
                        );
                    }
                    this.setState({  itemCode: '',  scanned:false});
                    this.myField2.focus();
                })
                .catch((error) => {
                    console.error(error);
                    this.setState({  itemCode: '',  scanned:false});
                    this.myField2.focus();
                });
        })
    };
    render() {
        const { scanned } = this.state;
        const {navigation} = this.props;
        const user = navigation.getParam('user', {});
        return (
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <FloatingLabelInputFocus
                        onRef={(r) => this.myField2 = r}
                        label="SKID CODE"
                        value = { this.state.itemCode }
                        autoFocus
                        onKeyMultipleListener={() => alert('Keyboard Hidden')}
                        onChangeText={text => this.setState({itemCode:text})}
                    />
                    { scanned ? <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}> UPDATING... </Text>
                    </TouchableOpacity>: <TouchableOpacity style={styles.button} onPress={this.handleProcess}>
                        <Text style={styles.buttonText}> PROCESS </Text>
                    </TouchableOpacity>}
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