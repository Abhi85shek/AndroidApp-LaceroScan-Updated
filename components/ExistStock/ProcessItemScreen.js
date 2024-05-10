import React, { useState, useEffect, useLayoutEffect,useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView,Dimensions,Modal,BackHandler,Image } from 'react-native';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import KeyEvent from 'react-native-keyevent';
import { DOMAIN_URL } from '../../config/config';

const ProcessItemScreen = ({ navigation,route}) => {

    const [scanned, setScanned] = useState(false);
    const [warning, setWarning] = useState(false);
    const [totalProcessed, setTotalProcessed] = useState(0);
    const [totalProcessedToday, setTotalProcessedToday] = useState(0);
    const [items, setItems] = useState([
      { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
      { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
      { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
      { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
      { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
      { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" }
    ]);
    const [token, setToken] = useState(null);
    const [skid, setSkid] = useState(route.params.skid);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [selectedProductName, setSelectedProductName] = useState("");
    const [selectedProductPrefix, setSelectedProductPrefix] = useState("");
    const [selectedBackgroundColor, setSelectedBackgroundColor] = useState("#1bb5d8");
    const [modalVisible, setModalVisible] = useState(false);
    const [productList, setProductList] = useState([]);
    const [backgroundColors, setBackgroundColors] = useState([]);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const inputRefs = useRef([]);

    useLayoutEffect(() => {
      navigation.setOptions({
        title: `${route.params.name} ? ${route.params.name} : "Processing Items" `,
        headerStyle: {
          backgroundColor: `${selectedBackgroundColor}`,
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

    const fetchData = async () => {
        const token = await AsyncStorage.getItem('token');
        var skid = await AsyncStorage.getItem('skid');
        const productList = await AsyncStorage.getItem('productList');
        const userName = await AsyncStorage.getItem('userName');
        const password = await AsyncStorage.getItem('password');
        setToken(token);
        setSkid(skid);
        setEmail(userName);
        setPassword(password);
        setProductList(JSON.parse(productList));
        setTotalProcessed(JSON.parse(skid).totalProcessed);
        setTotalProcessedToday(JSON.parse(skid).totalProcessedToday);
        setBackgroundColors(["#00a3e8", "#ff7f26", "#a349a3", "#1db590", "#fbb03c"]);
        
      };

    useEffect(() => { 
              
        fetchData();
        
      }, []);
    
      useEffect(() => {


        if (JSON.parse(skid).totalProcessed >= JSON.parse(skid).units) {
          Alert.alert(
            'Warning!',
            "Total number of items on the skid has been exceeded from the original purchase order. Do you want to proceed? ",
            [
              {
                text: "YES",
                onPress: () => {
                  setItems([
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" }
                  ]);
                  setScanned(false);
                  setWarning(true);
                  setModalVisible(true);
                }
              },
              {
                text: "NO",
                onPress: () => {
                  setItems([
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" }
                  ]);
                  setScanned(false);
                  setWarning(true);
                  setModalVisible(false);
                  navigation.navigate('ProcessSkid');
                }
              },
            ]
          );
        } else {
          setModalVisible(true);
        }

      }, [skid]);
    
      useEffect(() => {
        const beforeRemoveListener = navigation.addListener('beforeRemove', (e) => {
          e.preventDefault();
          if (items[0].barCode !== "") {
            Alert.alert(
              'Attention!',
              'You have unsaved items. Please click on UPDATE STATUS first and go back.',
              [
                {
                  text: "OK",
                  style: 'cancel',
                  onPress: () => console.log('OK Pressed')
                },
                {
                  text: 'Go Back',
                  style: 'destructive',
                  onPress: () => navigation.dispatch(e.data.action),
                },
              ]
            );
          } else {
            navigation.dispatch(e.data.action)
          }
        });
    
        // return () => {
        //   beforeRemoveListener.remove();
        // };
      }, [items]);
    
      const callHandleUpdateStatus = async (token) => {
        await AsyncStorage.setItem('token', token);
        setToken(token);
        handleUpdateStatus();
      } 

    
  const handleUpdateStatus = () => {

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        //Add SKID ID
        const data = {
          data: {
            items: items
              .filter(item => item.barCode !== "")
              .map(item => {
                item.skidID = JSON.parse(skid).id;
                item.productId = selectedProductId;
                item.status = "SUCCESSFULLY_DEACTIVATED";
                item.billing_status = "READY_FOR_INVOICE";
                item.companyID = JSON.parse(skid).companyId;
                item.barCode = item.barCode;

                return item;
              }),
            skidID: JSON.parse(skid).id
          }
        };

        if (data.data.items.length !== 0) {
            setScanned(true);
    

          const token = "Bearer " + token;

            console.log(token);
            console.log(data.data.items);


          fetch(`${DOMAIN_URL}/process_task_bulk`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token
            },
            body: JSON.stringify(data)
          })
            .then(response => response.json()
          )
            .then(responseJson => {
              console.log(JSON.stringify(responseJson));
              if (responseJson.data.totalProcessed && responseJson.data.totalProcessed >= JSON.parse(skid).units) {
                var message = "";
                if (responseJson.data.createdList) {
                  console.log("BArCode Scanned");
                  message = "\n" + responseJson.data.createdList.length + " barcodes scanned :\n\n"

                  responseJson.data.createdList.map(value => {
                    message = message.concat(" ", "    " + value + " \n");
                  })
                }
                if (responseJson.data.totalProcessed && responseJson.data.existList && responseJson.data.existList.length !== 0) {
                  message = message.concat(" ", "\n" + responseJson.data.existList.length + " barcodes already exists:\n\n");
                  responseJson.data.existList.map(value => {
                    message = message.concat(" ", "    " + value + " \n");
                  })
                }
                message = message.concat(" ", "\nTotal number of items on the skid has been exceeded from original purchase order. Do you want to proceed? ");

                // console.log("BArCode Scanned");

                Alert.alert(
                  `Process Results - Total Created: ${responseJson.data.totalCreated}`,
                  `"${message}"`
                  ,
                  [
                    {
                      text: "YES",
                      onPress: () =>
                            {
                        setItems([
                            { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                            { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                            { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                            { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                            { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                            { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' }
                        ]);
                        setScanned(false);
                        setWarning(true);
                        setTotalProcessed(responseJson.data.totalProcessed);
                        setTotalProcessedToday( responseJson.data.totalProcessedToday);
                        setModalVisible(true);
                    }
                    },
                    {
                      text: "NO",
                      onPress: () => {
                        {
                            setItems([
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' }
                            ]);
                            setScanned(false);
                            setWarning(true);
                            setModalVisible(true);
                        }
      
                        navigation.navigate('ProcessSkid');
                      }
                    },
                  ]
                );

              }
              else if (responseJson.data.totalProcessed) {

                var message = "";
                if (responseJson.data.createdList) {
                  message = "\n" + responseJson.data.createdList.length + " barcodes scanned :\n\n"

                  responseJson.data.createdList.map(value => {
                    message = message.concat(" ", "    " + value + " \n");
                  })
                }
                if (responseJson.data.totalProcessed && responseJson.data.existList && responseJson.data.existList.length !== 0) {
                  message = message.concat(" ", "\n" + responseJson.data.existList.length + " barcodes already exists:\n\n");
                  responseJson.data.existList.map(value => {
                    message = message.concat(" ", "    " + value + " \n");
                  })
                }
                message = message.concat(" ", "\nContinue Scanning " + this.state.selectedProductName + " ?");


                Alert.alert(
                  `Process Results - Total Created: ${responseJson.data.totalCreated
                  }`,
                  message,
                  [
                    {
                      text: "YES",
                      onPress: () => 
                        {
                            setItems([
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' }
                            ]);
                            setScanned(false);
                            setTotalProcessed(responseJson.data.totalProcessed);
                            setTotalProcessedToday( responseJson.data.totalProcessedToday);
                            
                        }
                      
                    },
                    {
                      text: "NO",
                      onPress: () => {
                        {
                            setItems([
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                                { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' }
                            ]);
                            setScanned(false);
                            setTotalProcessed(responseJson.data.totalProcessed);
                            setTotalProcessedToday( responseJson.data.totalProcessedToday);
                            setModalVisible(true);
                            
                        }
                      }
                    },
                  ]
                );
              }
              else {

                const data = {
                  email: userName,
                  password: password
                };

                fetch(`${DOMAIN_URL}/login`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data)
                })
                  .then((response) => {
                    const statusCode = response.status.toString();
                    const data = response.json();
                    return Promise.all([statusCode, data]);
                  })
                  .then((res) => {

                    if (res[0] == 200) {
                      callHandleUpdateStatus(res[1].data.token);
                    } else {
                      navigate('Login');
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              }
            })
            .catch(error => {
              Alert.alert(
                "Error!",
                error,
                [
                  {
                    text: "OK",
                    onPress: () => {
                        setScanned(true);
                    }
                  }
                ]
              );
            });

        }
      }
      else {
        Alert.alert(
          "No Internet!",
          "Needs to connect to the internet in order to work. Please connect tablet to wifi and try again.",
          [
            {
              text: "OK",
              onPress: () => { }
            }
          ]
        );
      };
    })
  }


    const handleReset = () => {
        Alert.alert(
            "RESET SCANNED ITEMS",
            "This will clear the scanned items. Are you sure about this to continue?",
            [
              {
                text: "YES",
                onPress: () => {
                    setItems([
                        { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                        { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                        { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                        { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                        { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' },
                        { barCode: '', status: 'SUCCESSFULLY_DEACTIVATED' }
                    ]);
                    setScanned(false);
                }
              },
              {
                text: "NO",
                onPress: () => { }
              }
            ]
          );
       
    };

    const handleFinish = () => {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
      
              Alert.alert(
                "SKID CLOSING",
                "Are you sure that all the items in this skid is already scanned and continue closing this skid?",
                [
                  {
                    text: "YES",
                    onPress: () => {
                        
                      const totalUnits = skid.units;
                      const totalProcessed = totalProcessed;
                      if (totalUnits === totalProcessed) {
                        //update skid status
                        const skid = skid;
                        skid.process_status = "PROCESSED";
                        const token = "Bearer " + token;
                        fetch(`${DOMAIN_URL}/skid/finish`, {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: token
                          },
                          body: JSON.stringify(skid)
                        })
                          .then(response => response.json())
                          .then(responseJson => {
                            if (responseJson.message === "Skid Status Updated!") {
                              this.success.play();
                              Alert.alert(responseJson.message, `Finish Skid Succeed!`, [
                                {
                                  text: "OK",
                                  onPress: () => {
                                    const { navigation } = this.props;
                                    const navigate = navigation.navigate;
      
                                    navigate("ProcessSkid");
                                  }
                                }
                              ]);
                            } else {
                              fail.play();
                              fail.play();
                              Alert.alert(responseJson.message, `Finish Skid Failed!`, [
                                {
                                  text: "OK",
                                  onPress: () =>
                                    this.setState({
                                      scanning: false,
                                      scanned: false
                                    })
                                }
                              ]);
                            }
                          })
                          .catch(error => {
                            console.error(error);
                          });
                      }
                      else {
                        Alert.alert(
                          "Units in the current skid doesn't finish !!!",
                          `Only ${totalProcessed} out of ${totalUnits} units processed in the skid, need to process ${totalUnits -
                          totalProcessed} more units!`,
                          [
                            {
                              text: "OK",
                              onPress: () =>
                                this.setState({
                                  scanning: false,
                                  scanned: false
                                })
                            }
                          ]
                        );
                      }
                    }
                  },
                  {
                    text: "NO",
                    onPress: () => { }
                  }
                ]
              );
      
            }
            else {
              Alert.alert(
                "No Internet!",
                "Needs to connect to the internet in order to work. Please connect tablet to wifi and try again.",
                [
                  {
                    text: "OK",
                    onPress: () => { }
                  }
                ]
              );
            };
          })
    };

    const handleRenderSection = (index) => {
        switch (index) {
            case 0:
              return selectedProduct ? selectedProduct.shortCut : "";
            case 1:
              return selectedProduct ? selectedProduct.shortCut : "";
            case 2:
              return selectedProduct ? selectedProduct.shortCut : "";
            case 3:
              return selectedProduct ? selectedProduct.shortCut : "";
            case 4:
              return selectedProduct ? selectedProduct.shortCut : "";
            case 5:
              return selectedProduct ? selectedProduct.shortCut : "";
            default:
              return "";
          }
        };
   
   
        const handleRenderList = () => {

          return items.map((data, index) => {
                const yesStyle = {
                  backgroundColor: "#30b29d",
                  height: "95%",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center"
                };
          
                return (
                  <View style={styles.row} key={index}>
                    <View style={{ width: "10%", justifyContent: "center" }}>
                      <Text style={styles.sectionField}>
                        {handleRenderSection(index)}
                      </Text>
                    </View>
                    <View style={{ width: "60%" }}>
                      <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                      >
                        <TextInput
                          style={styles.textInput}
                          value={data.barCode}
                          autoFocus={index === 0}
                          // onKeyMultipleListener={() => alert("Keyboard Hidden")}
                          ref={inputRefs[index]}
                          onSubmitEditing={() => {
                            if (index < 5) {
                              inputRefs[index + 1].current.focus();
                            } else if (index === 5) {
                              inputRefs[5].current.focus();
                            }
                          }}
                          onChangeText={text => {
                            const updatedItems = [...items]; // Create a copy of items array
                            updatedItems[index].barCode = text;
                            setItems(updatedItems); 
                          }}
                          onBlur={() => {
                            if (data.barCode !== "") {
                              const totalCode = items.filter(item => item.barCode === data.barCode).length;
                              if (totalCode > 1) {
                                Alert.alert(`${data.barCode} already exists!`);
                                const updatedItems = [...items];
                                updatedItems[index].barCode = "";
                                setItems(updatedItems);
                                inputRefs[index].current.focus();
                              }
                            }
                          }}
                        />
                      </ScrollView>
                    </View>
                    <View style={{ width: "30%" }}>
                      <View style={styles.row}>
                        <View style={styles.inputWrap}>
                          <TouchableOpacity
                            style={yesStyle}
                            onPress={() => {
                              const updatedItems = [...items];
                              const date = new Date();
                              updatedItems[index].barCode = "barcode_" + date.getFullYear() + "" + date.getMonth() + "" + date.getDate() + "" + date.getHours() + "" + date.getMinutes() + "" + date.getSeconds() + "" + index
                              setItems(updatedItems);
                              if (index !== 5 && inputRefs.current[index + 1]) {
                                inputRefs[index + 1].current.focus();
                              }
                            }}
                          >
                            <Text style={styles.label}>Generate Barcode</Text>
                          </TouchableOpacity>
                        </View>
                       
                      </View>
                    </View>
                  </View>
                );
              });
            };
          
    
        return (
                <View style={styles.container}>
                  <View style={styles.inputContainer} touch>
                    {warning && (
                      <Text style={styles.warning}>
                        Total number of items on the skid has been exceeded from original purchase order.
                      </Text>
                    )}
                    {skid !== undefined && (
                      <Text style={styles.barCode}>
                        {JSON.parse(skid).barCode} {" \n"}
                        <Text style={styles.units}>      
                             
                          Total Units: {JSON.parse(skid).units}  
                        </Text>
          
                      </Text>
                    )}
                    {skid !== undefined && (
          
                      <Text style={styles.textField}>
                        Total Processed: {totalProcessed}
                        {" | "} Today: {totalProcessedToday}
                      </Text>
          
                    )}
          
                    {handleRenderList()}
          
                    {scanned ? (
                      <TouchableOpacity style={[
                        styles.button,
                        { backgroundColor: selectedBackgroundColor }
                      ]}>
                        <Text style={styles.buttonText}> UPDATING... </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.button,
                          { backgroundColor: selectedBackgroundColor }
                        ]}
                        onPress={handleUpdateStatus}
                      >
                        <Text style={styles.buttonText}> UPDATE STATUS </Text>
                      </TouchableOpacity>
                    )}
                    <View style={styles.container1}>
                      <View style={styles.button1}>
                        <TouchableOpacity
                          style={styles.button}
                          onPress={handleReset}
                        >
                          <Text style={styles.buttonText}> RESET </Text>
                        </TouchableOpacity>
                      </View>
                      {   /*  <View style={styles.button1}>
                        <TouchableOpacity
                          style={styles.finishButton}
                          onPress={this.handleFinish}
                        >
                          <Text style={styles.buttonText}> FINISH SKID </Text>
                        </TouchableOpacity>
                      </View>*/}
                    </View>
                  </View>
          
          
          
                  <Modal
                    animationType="none"
                    visible={modalVisible}
                    transparent={true}
                    onRequestClose={() => {
                      //transfer to Process Skid Screen page
                      const { navigation } = this.props;
                      const navigate = navigation.navigate;
                      // const user = navigation.getParam('user', {});
                      /// const user = this.props.route.params.user ? this.props.route.params.user : {};
                      navigate('ProcessSkid');
                    }}
                  >
                    <View style={styles.modal}>
                      <View style={styles.modalContainer}>
                        <View>
                          <Text style={styles.title}>Product Selection Menu</Text>
                          <View style={styles.divider} />
                        </View>
                        <ScrollView>
                          {productList.map((product, index) => (
          
                            <TouchableOpacity
                              style={[
                                styles.item,
                                { backgroundColor: backgroundColors[index] }
                              ]}
                              key={index}
                              onPress={() =>
          
          
                                Alert.alert(
                                  "Confirm",
                                  "Scanning " + product.productName,
                                  [
          
                                    {
                                      text: "NO",
                                      onPress: () => {
          
                                      }
          
                                    }, {
                                      text: "YES",
                                      onPress: () => {
          
          
                                        navigation.navigate('ProcessItem', {
                                          name: `PROCESSING ` + product.productName,
                                          color: backgroundColors[
                                            index
                                          ]
                                        });
          
    
                                        // Need to Change Here
                                        setSelectedProduct(product);
                                        setSelectedProductName(product.productName);
                                        setSelectedProductId(product.id);
                                        setSelectedProductPrefix(product.shortCut);
                                        setSelectedBackgroundColor(backgroundColors[index]);
                                        setModalVisible(false);
                                       
                                      }
                                    }
                                  ]
                                )
                              }
                            >
          
                              <Image
                                source={
                                  product.productUrl !== "" ? { uri: "https://drive.google.com/thumbnail?id=" + product.productUrl } :
                                    product.shortCut === "FAB"
                                      ? require("./images/FAB.png")
                                      : product.shortCut === "SBT" ||
                                        product.shortCut === "ABT"
                                        ? require("./images/SBT.jpg")
                                        : product.shortCut === "ABI"
                                          ? require("./images/ABI.png")
                                          : require("./images/ABI.png")
                                }
                                style={styles.image}
                              />
          
                              <Text style={styles.productTitle}>
                                {product.productName}
                              </Text>
          
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
          
                      </View>
                    </View>
                  </Modal>
                </View>
              );
   
    };

  
          

let containerHeight = Dimensions.get("window").height - 200;
const styles = StyleSheet.create({
  container1: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  button1: {
    width: "100%"
  },
  row: {
    flex: 1,
    flexDirection: "row"
  },
  inputWrap: {
    flex: 1
  },
  textInput: {
    height: "100%",
    backgroundColor: "#ecebed",
    fontSize: 21,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  yesField: {
    backgroundColor: "#4d954a",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  sectionField: {
    backgroundColor: "#fbff17",
    fontSize: 15,
    paddingBottom: 5,
    paddingTop: 5,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  selected: {},
  noField: {
    backgroundColor: "#8c8f94",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    height: containerHeight
  },
  modal: {
    backgroundColor: "#00000099",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  modalContainer: {
    backgroundColor: "#f9fafb",
    width: "80%",
    borderRadius: 5
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    padding: 15,
    color: "#000"
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "lightgray"
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    margin: 2,
    borderColor: "#2a4944",
    borderWidth: 1,
    backgroundColor: "#d2f7f1"
  },
  photo: {
    height: 40,
    width: 40
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "bold",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    color: "#FFFFFF",
    marginLeft: 30,
    textAlign: "center"
  },
  inputContainer: {
    flex: 1,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10
  },
  textField: {
    fontSize: 20,
    fontWeight: "bold",
    bottom: 5,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: 'cover'
  },
  barCode: {
    fontSize: 24,
    fontWeight: "bold",
    color: "green",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  warning: {
    fontSize: 9,
    fontWeight: "bold",
    color: "red",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  units: {
    fontSize: 20,
    color: "red",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  button: {
    marginTop: 5,
    flex: 1,
    position: "relative",
    backgroundColor: "#1baeff",
    alignItems: "center",
    padding: 5,
    borderRadius: 5,
    justifyContent: "center"
  },
  finishButton: {
    marginTop: 5,
    flex: 1,
    position: "relative",
    backgroundColor: "#ff1c36",
    alignItems: "center",
    padding: 5,
    borderRadius: 5,
    justifyContent: "center"
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold"
  }
});



export default ProcessItemScreen;