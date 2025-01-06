import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  Alert,
  TextInput,
  ScrollView,
  Modal,
  Image,
  BackHandler
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
// import AwesomeAlert from '../customAlert/AwesomeAlert';

const Sound = require("react-native-sound");
Keyboard.dismiss();
import { DOMAIN_URL } from "../../config/config";

export default class ProcessItemScreen extends Component {
  success = new Sound("success.wav");
  fail = new Sound("fail.mp3");
  constructor(props) {
    super(props);
    this.state = {
      scanned: false,
      warning: false,
      totalProcessed: 0,
      totalProcessedToday: 0,
      items: [
        { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
        { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
        { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
        { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
        { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
        { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" }
      ],
      token: undefined,
      skid: undefined,
      selectedProduct: undefined,
      selectedProductId: "",
      selectedProductName: "",
      selectedProductPrefix: "",
      selectedBackgroundColor: "#1bb5d8",
      modalVisible: false,
      productList: [],
      backgroundColors: [],
      email: "",
      password: "",

    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    const token = await AsyncStorage.getItem('token');
    const skid = await AsyncStorage.getItem('skid');
    const productList = await AsyncStorage.getItem('productList');
    const userName = await AsyncStorage.getItem('userName');
    const password = await AsyncStorage.getItem('password');

    BackHandler.addEventListener('hardwareBackPress', () => {
      return false;
    });
    this.setState({
      token: token,
      skid: JSON.parse(skid),
      userName: userName,
      password: password,
      productList: JSON.parse(productList),
      totalProcessed: JSON.parse(skid).totalProcessed,
      totalProcessedToday: JSON.parse(skid).totalProcessedToday,
      backgroundColors: ["#00a3e8", "#ff7f26", "#a349a3", "#1db590", "#fbb03c"],
    });

    navigation.navigate('ProcessItem', {
      name: 'PLEASE SELECT PRODUCT TYPE',
      color: "#1bb5d8"
    })

    if (this.state.skid.totalProcessed >= this.state.skid.units) {

      Alert.alert(
        'Warning!',
        "Total number of items on the skid has been exceeded from original purchase order. Do you want to proceed? ",
        [
          {
            text: "YES",
            onPress: () =>
              this.setState(
                {
                  items: [
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" }
                  ],
                  scanned: false,
                  warning: true,
                  modalVisible: true
                },
                () => this[0].focus()
              )
          },
          {
            text: "NO",
            onPress: () => {
              this.setState(
                {
                  items: [
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                    { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" }
                  ],
                  scanned: false,
                  warning: true,
                  modalVisible: false
                },

              )
              const { navigation } = this.props;
              const navigate = navigation.navigate;
              // const user = this.props.route.params.user ? this.props.route.params.user : {};
              //  const user = navigation.getParam('user', {});
              navigate('ProcessSkid');
            }
          },
        ]
      );
    }
    else {
      this.setState({
        modalVisible: true
      });
    }

    navigation.addListener('beforeRemove', (e) => {

      // Prevent default behavior of leaving the screen
      e.preventDefault();
      if (this.state.items[0].barCode !== "") {

        Alert.alert(
          'Attention!',
          'You have unsaved items. Please click on UPDATE STATUS first and go back.',

          [{ text: "OK", style: 'cancel', onPress: () => console.log('OK Pressed') },
          {
            text: 'Go Back',
            style: 'destructive',
            // If the user confirmed, then we dispatch the action we blocked earlier
            // This will continue the action that had triggered the removal of the screen
            onPress: () => navigation.dispatch(e.data.action),
          },]

        );
      } else {
        navigation.dispatch(e.data.action)
      }
    })
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
    BackHandler.removeEventListener('hardwareBackPress');

  }
  callHandleUpdateStatus = async (token) => {
    await AsyncStorage.setItem('token', token);

    this.setState({
      token: token,
    });

    this.handleUpdateStatus();
  }

  handleUpdateStatus = () => {

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        //Add SKID ID
        const data = {
          data: {
            items: this.state.items
              .filter(item => item.barCode !== "")
              .map(item => {
                item.skidID = this.state.skid.id;
                item.productId = this.state.selectedProductId;
                item.status = "SUCCESSFULLY_DEACTIVATED";
                item.billing_status = "READY_FOR_INVOICE";
                item.companyID = this.state.skid.companyId;
                item.barCode = item.barCode;

                return item;
              }),
            skidID: this.state.skid.id
          }
        };

        if (data.data.items.length !== 0) {
          this.setState(
            {
              scanned: true
            });


          const token = "Bearer " + this.state.token;



          fetch(`${DOMAIN_URL}/process_task_bulk`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token
            },
            body: JSON.stringify(data)
          })
            .then(response => response.json())
            .then(responseJson => {
              console.log(JSON.stringify(responseJson));
              if (responseJson.data.totalProcessed && responseJson.data.totalProcessed >= this.state.skid.units) {
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
                message = message.concat(" ", "\nTotal number of items on the skid has been exceeded from original purchase order. Do you want to proceed? ");

                Alert.alert(
                  `Process Results - Total Created: ${responseJson.data.totalCreated
                  }`,
                  message
                  ,
                  [
                    {
                      text: "NO",
                      onPress: () => {
                        this.setState(
                          {
                            items: [
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" }
                            ],
                            scanned: false,
                            warning: true,
                            modalVisible: false
                          }
                        )
                        const { navigation } = this.props;
                        const navigate = navigation.navigate;

                        // const user = this.props.route.params.user ? this.props.route.params.user : {};
                        navigate('ProcessSkid');
                      }
                    },
                    {
                      text: "YES",
                      onPress: () =>
                        this.setState(
                          {
                            items: [
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" }
                            ],
                            scanned: false,
                            warning: true,
                            totalProcessed: responseJson.data.totalProcessed,
                            totalProcessedToday: responseJson.data.totalProcessedToday,
                            modalVisible: true
                          },
                          () => this[0].focus()
                        )
                    }
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
                      onPress: () => {
                        this.setState({
                          scanning: false,
                          items: [
                            { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                            { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                            { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                            { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                            { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                            { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" }
                          ],
                          scanned: false,
                          totalProcessed: responseJson.data.totalProcessed,
                          totalProcessedToday: responseJson.data.totalProcessedToday
                        }),
                          this[0].focus();
                      }
                    },
                    {
                      text: "NO",
                      onPress: () => {
                        this.setState(
                          {
                            items: [
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                              { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" }
                            ],
                            scanned: false,
                            totalProcessed: responseJson.data.totalProcessed,
                            totalProcessedToday: responseJson.data.totalProcessedToday,
                            modalVisible: true
                          },

                        );
                        this[0].focus();
                      }
                    },
                  ]
                );
              }
              else {

                const data = {
                  email: this.state.userName,
                  password: this.state.password
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
                      this.callHandleUpdateStatus(res[1].data.token);
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
                      this.setState(
                        { scanned: true })
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
  handleReset = () => {
    Alert.alert(
      "RESET SCANNED ITEMS",
      "This will clear the scanned items. Are you sure about this to continue?",
      [
        {
          text: "YES",
          onPress: () => {
            this.setState(
              {
                items: [
                  { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                  { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                  { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                  { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                  { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" },
                  { barCode: "", status: "SUCCESSFULLY_DEACTIVATED" }
                ],
                scanned: false
              },
              () => this[0].focus()
            );
          }
        },
        {
          text: "NO",
          onPress: () => { }
        }
      ]
    );
  };
  handleFinish = () => {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {

        Alert.alert(
          "SKID CLOSING",
          "Are you sure that all the items in this skid is already scanned and continue closing this skid?",
          [
            {
              text: "YES",
              onPress: () => {

                const totalUnits = this.state.skid.units;
                const totalProcessed = this.state.totalProcessed;
                if (totalUnits === totalProcessed) {
                  //update skid status
                  const skid = this.state.skid;
                  skid.process_status = "PROCESSED";
                  const token = "Bearer " + this.state.token;
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
                        this.fail.play();
                        this.fail.play();
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

  handleRenderSection = index => {
    switch (index) {
      case 0:
        return this.state.selectedProduct ? this.state.selectedProduct.shortCut : "";
      case 1:
        return this.state.selectedProduct ? this.state.selectedProduct.shortCut : "";
      case 2:
        return this.state.selectedProduct ? this.state.selectedProduct.shortCut : "";
      case 3:
        return this.state.selectedProduct ? this.state.selectedProduct.shortCut : "";
      case 4:
        return this.state.selectedProduct ? this.state.selectedProduct.shortCut : "";
      case 5:
        return this.state.selectedProduct ? this.state.selectedProduct.shortCut : "";
      default:
        return "";
    }
  };
  handleRenderList = () => {
    return this.state.items.map((data, index) => {
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
              {this.handleRenderSection(index)}
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
                ref={input => {
                  this[index] = input;
                }}
                onSubmitEditing={() => {
                  if (index < 5) {
                    this[index + 1].focus();
                  } else if (index === 5) {
                    this[5].focus();
                  }
                }}
                onChangeText={text => {
                  const items = this.state.items;
                  items[index].barCode = text;
                  this.setState({
                    items
                  });
                }}
                onBlur={() => {
                  if (data.barCode !== "") {
                    const items = this.state.items;
                    const totalCode = items.filter(
                      item => item.barCode === data.barCode
                    ).length;
                    if (totalCode > 1) {
                      Alert.alert(`${data.barCode} already exist!`);
                      items[index].barCode = "";
                      this[index].focus();
                    }
                    this.setState({
                      items
                    });
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
                    const items = this.state.items;
                    const date = new Date();
                    items[index].barCode = "barcode_" + date.getFullYear() + "" + date.getMonth() + "" + date.getDate() + "" + date.getHours() + "" + date.getMinutes() + "" + date.getSeconds() + "" + index
                    this.setState({
                      items
                    });
                    if (index !== 5) {
                      this[index + 1].focus();
                    }
                  }}
                >
                  <Text style={styles.label}>Generate Barcode</Text>
                </TouchableOpacity>
              </View>
              {   /* <View style={styles.inputWrap}>
                <TouchableOpacity
                  style={noStyle}
                  onPress={() => {
                    const items = this.state.items;
                    items[index].status = "UNSUCCESSFULLY_DEACTIVATED";
                    this.setState({
                      items
                    });
                  }}
                >
                  <Text style={styles.label}>NO</Text>
                </TouchableOpacity>
              </View>*/}
            </View>
          </View>
        </View>
      );
    });
  };

  render() {

    return (

      <View style={styles.container}>



        <View style={styles.inputContainer} touch>
          {this.state.warning && (
            <Text style={styles.warning}>
              Total number of items on the skid has been exceeded from original purchase order.
            </Text>
          )}
          {this.state.skid !== undefined && (
            <Text style={styles.barCode}>
              {this.state.skid.barCode} {" \n"}
              <Text style={styles.units}>
                Total Units: {this.state.skid.units}
              </Text>

            </Text>
          )}
          {this.state.skid !== undefined && (

            <Text style={styles.textField}>
              Total Processed: {this.state.totalProcessed}
              {" | "} Today: {this.state.totalProcessedToday}
            </Text>

          )}

          {this.handleRenderList()}

          {this.state.scanned ? (
            <TouchableOpacity style={[
              styles.button,
              { backgroundColor: this.state.selectedBackgroundColor }
            ]}>
              <Text style={styles.buttonText}> UPDATING... </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: this.state.selectedBackgroundColor }
              ]}
              onPress={this.handleUpdateStatus}
            >
              <Text style={styles.buttonText}> UPDATE STATUS </Text>
            </TouchableOpacity>
          )}
          <View style={styles.container1}>
            <View style={styles.button1}>
              <TouchableOpacity
                style={styles.button}
                onPress={this.handleReset}
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
          visible={this.state.modalVisible}
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
                {this.state.productList.map((product, index) => (

                  <TouchableOpacity
                    style={[
                      styles.item,
                      { backgroundColor: this.state.backgroundColors[index] }
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


                              this.props.navigation.navigate('ProcessItem', {
                                name: `PROCESSING ` + product.productName,
                                color: this.state.backgroundColors[
                                  index
                                ]
                              });

                              this.setState({
                                selectedProduct: product,
                                selectedProductId: product.id,
                                selectedProductName: product.productName,
                                selectedProductPrefix: product.shortCut,
                                selectedBackgroundColor: this.state
                                  .backgroundColors[index],
                                modalVisible: false
                              });
                              this[0].focus()
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
                                : require("./images/default.png")
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
  }
}

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
    color:"black",
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
    color:"black",
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