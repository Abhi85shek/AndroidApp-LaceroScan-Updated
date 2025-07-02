import React, {useState, useEffect, useRef, useCallback} from 'react';
import Loader from '../Util/Loader';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Modal,
  Image,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Sound from 'react-native-sound';
import {DOMAIN_URL} from '../../config/config';
import ZoomableImage from '../Util/ZoomableImage';
// import Loader from '../Util/Loader';

const ProcessItemScreen = ({navigation, route}) => {
  const success = new Sound('success.wav', Sound.MAIN_BUNDLE);
  const fail = new Sound('fail.mp3', Sound.MAIN_BUNDLE);

  const [state, setState] = useState({
    scanned: false,
    warning: false,
    scanning: false,
    totalProcessed: 0,
    totalProcessedToday: 0,
    extraScan: false,
    extraScanLength: 0,
    items: [],
    token: undefined,
    skid: undefined,
    selectedProduct: undefined,
    selectedProductId: '',
    selectedProductName: '',
    selectedProductPrefix: '',
    selectedProductMultipleScanLength: 0,
    selectedBackgroundColor: '',
    productCount: 0,
    selectedProductMultipleScanDetails: [],
    selectedProductTotalCountTillNow: 0,
    modalVisible: false,
    scanDetails: [],
    productList: [],
    backgroundColors: [],
    selectedProductTotalCount: 0,
    scanProductInfo: [],
    userName: '',
    password: '',
  });

  const inputRefs = useRef([]);

  // Function to generate items array based on multipleScanLength
  const generateItemsArray = useCallback(multipleScanLength => {
    const arrayLength =
      multipleScanLength === 0 ? 4 : multipleScanLength === 2 ? 1 : 2;
    return new Array(arrayLength).fill({
      barCode: '',
      status: 'SUCCESSFULLY_DEACTIVATED',
      scanItem1: '',
      scanItem2: '',
    });
  }, []);

  useEffect(() => {
    const setup = async () => {
      try {
        const [token, skid, productList, userName, password] =
          await Promise.all([
            AsyncStorage.getItem('token'),
            AsyncStorage.getItem('skid'),
            AsyncStorage.getItem('productList'),
            AsyncStorage.getItem('userName'),
            AsyncStorage.getItem('password'),
          ]);

        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          () => false,
        );

        const jsonParsedList = JSON.parse(productList) || [];
        const parsedSkid = JSON.parse(skid) || {};
        const selectedProduct = jsonParsedList[0] || {};
        const multipleScanLength = selectedProduct.multipleScanLength || 0;

        setState(prev => ({
          ...prev,
          token,
          skid: parsedSkid,
          userName,
          password,
          productList: jsonParsedList,
          totalProcessed: parsedSkid.totalProcessed || 0,
          totalProcessedToday: parsedSkid.totalProcessedToday || 0,
          backgroundColors: [
            '#00a3e8',
            '#ff7f26',
            '#a349a3',
            '#1db590',
            '#fbb03c',
          ],
          productCount: parsedSkid.productCount || 0,
          selectedProductMultipleScanLength: multipleScanLength,
          selectedProductMultipleScanDetails: [],
          // selectedProductMultipleScanDetails: typeof selectedProduct.scanDetails === "string"
          //   ? JSON.parse(selectedProduct.scanDetails)
          //   : selectedProduct.scanDetails,
          items: generateItemsArray(multipleScanLength),
        }));

        navigation.navigate('ProcessItem', {
          name: 'PLEASE SELECT PRODUCT TYPE',
          color: '#1bb5d8',
        });

        if (!state.modalVisible && !state.selectedProduct) {
          if (parsedSkid.totalProcessed >= parsedSkid.units) {
            handleWarningAlert();
          } else {
            setState(prev => ({...prev, modalVisible: true}));
          }
        }
      } catch (error) {
        console.error('Setup failed:', error);
        Alert.alert('Error', 'Failed to initialize the app');
      }
    };

    setup();

    return () => {
      BackHandler.removeEventListener('hardwareBackPress');
    };
  }, [navigation, generateItemsArray]);

  // console.log('Parsed Skid', state.skid);

  // Get the Count of the Select product Till Now!

  const getCountOfSelectedProduct = async (skidId, productId) => {
    const response = await fetch(
      `${DOMAIN_URL}/getTotalCountofProductTillNow`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          skidId: skidId,
        }),
      },
    );

    const data = await response.json();

    return data.data;
  };

  const handleWarningAlert = () => {
    Alert.alert(
      'Warning!',
      'Total number of items on the skid has been exceeded from original purchase order. Do you want to proceed?',
      [
        {
          text: 'YES',
          onPress: () => {
            setState(prev => ({
              ...prev,
              items: generateItemsArray(
                state.selectedProductMultipleScanLength,
              ),
              scanned: false,
              warning: true,
              modalVisible: true,
            }));
            inputRefs.current[0]?.focus();
          },
        },
        {
          text: 'NO',
          onPress: () => {
            setState(prev => ({
              ...prev,
              items: generateItemsArray(
                state.selectedProductMultipleScanLength,
              ),
              scanned: false,
              warning: true,
              modalVisible: false,
            }));
            navigation.navigate('ProcessSkid');
          },
        },
      ],
    );
  };

  const handleRenderSection = useCallback(
    index => {
      return state.selectedProduct ? state.selectedProduct.shortCut : '';
    },
    [state.selectedProduct],
  );

  const pad = n => n.toString().padStart(2, '0');

  const generateCode = (prefix, index) => {
    const date = new Date();
    return `${prefix}_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
      date.getDate(),
    )}${pad(date.getHours())}${pad(date.getMinutes())}${pad(
      date.getSeconds(),
    )}${index}`;
  };

  const handleRenderList = useCallback(() => {
    return (
      <ScrollView
        contentContainerStyle={{
          paddingVertical: 10,
          paddingHorizontal: 5,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled">
        {state.items.map((data, index) => (
          <View
            key={index}
            style={{
              backgroundColor: 'white',
              padding: 15,
              marginBottom: 10,
              borderRadius: 5,
              elevation: 5,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: '20%',
                  backgroundColor:
                    `${state.selectedBackgroundColor}` || 'yellow',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 20,
                  padding: 5,
                }}>
                <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                  {handleRenderSection(index)}
                </Text>
              </View>

              {/* Responsible for showing the image of the extra scan */}

              {state.selectedProductMultipleScanDetails &&
                state.selectedProductMultipleScanDetails?.length > 0 && (
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 20,
                      padding: 5,
                      flexDirection: 'row',
                      gap: 10,
                    }}>
                    {state.selectedProductMultipleScanDetails.map(
                      (scan, scanIndex) => (
                        <ZoomableImage
                          key={scanIndex}
                          source={{uri: scan.imageURL}}
                          style={{width: 40, height: 40, borderRadius: 20}}
                          resizeMode="contain"
                          label={scan.scanName}
                        />
                      ),
                    )}
                  </View>
                )}
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}>
              <View style={{width: '80%'}}>
                <ScrollView
                  contentContainerStyle={{flexGrow: 1}}
                  keyboardShouldPersistTaps="handled">
                  <TextInput
                    value={data.barCode}
                    style={{
                      padding: 6,
                      backgroundColor: '#ecebed',
                      fontSize: 15,
                      borderTopLeftRadius: 8,
                      borderBottomLeftRadius: 8,
                    }}
                    autoFocus={index === 0}
                    placeholder="Enter Barcode"
                    ref={input => {
                      inputRefs.current[index] = input;
                    }}
                    onSubmitEditing={() => {
                      if (data.barCode && index < state.items.length - 1) {
                        inputRefs.current[index + 1]?.focus();
                      }
                    }}
                    onChangeText={text => {
                      const items = [...state.items];
                      items[index] = {...items[index], barCode: text};
                      setState(prev => ({...prev, items}));
                    }}
                    onBlur={() => {
                      if (data.barCode !== '') {
                        const items = [...state.items];
                        const totalCode = items.filter(
                          item => item.barCode === data.barCode,
                        ).length;
                        if (totalCode > 1) {
                          Alert.alert(`${data.barCode} already exists!`);
                          items[index] = {...items[index], barCode: ''};
                          inputRefs.current[index]?.focus();
                        }
                        setState(prev => ({...prev, items}));
                      }
                    }}
                  />
                </ScrollView>
              </View>
              <View>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#30b29d',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 40,
                    width: 100,
                    padding: 5,
                    borderTopRightRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                  onPress={() => {
                    const barcode = generateCode('barcode', index);
                    const items = [...state.items];
                    items[index] = {...items[index], barCode: barcode};
                    setState(prev => ({...prev, items}));
                    if (index < state.items.length - 1) {
                      inputRefs.current[index + 1]?.focus();
                    }
                  }}>
                  <Text style={styles.label}>Generate Barcode</Text>
                </TouchableOpacity>
              </View>
            </View>
            {state.selectedProductMultipleScanDetails?.map(
              (scan, scanIndex) => (
                <View
                  key={scanIndex}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    marginBottom: 10,
                  }}>
                  <View style={{width: '80%'}}>
                    <TextInput
                      style={{
                        padding: 6,
                        backgroundColor: '#ecebed',
                        fontSize: 15,
                        borderTopLeftRadius: 8,
                        borderBottomLeftRadius: 8,
                      }}
                      autoFocus={index === 0}
                      value={data[`scanItem${scanIndex + 1}`] || ''}
                      placeholder={`Enter ${scan.scanName}`}
                      onChangeText={text => {
                        const items = [...state.items];
                        items[index] = {
                          ...items[index],
                          [`scanItem${scanIndex + 1}`]: text,
                        };
                        setState(prev => ({...prev, items}));
                      }}
                    />
                  </View>
                  <View>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#30b29d',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 40,
                        width: 100,
                        padding: 5,
                        borderTopRightRadius: 8,
                        borderBottomRightRadius: 8,
                      }}
                      onPress={() => {
                        const scanValue = generateCode(scan.scanName, index);
                        const items = [...state.items];
                        items[index] = {
                          ...items[index],
                          [`scanItem${scanIndex + 1}`]: scanValue,
                        };
                        setState(prev => ({...prev, items}));
                        if (index < state.items.length - 1) {
                          inputRefs.current[index + 1]?.focus();
                        }
                      }}>
                      <Text style={styles.label}>Generate {scan.scanName}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ),
            )}
          </View>
        ))}
      </ScrollView>
    );
  }, [
    state.items,
    state.selectedProduct,
    state.selectedProductMultipleScanDetails,
    generateItemsArray,
    handleRenderSection,
  ]);

  const handleUpdateStatus = async () => {
    // console.log('Update Status Data', state.selectedProductMultipleScanDetails);
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        Alert.alert(
          'No Internet!',
          'Needs to connect to the internet in order to work. Please connect tablet to wifi and try again.',
          [{text: 'OK'}],
        );
        return;
      }

      const data = {
        data: {
          items: state.items
            .filter(item => item.barCode !== '')
            .map(item => ({
              skidID: state.skid.id,
              productId: state.selectedProductId,
              status: 'SUCCESSFULLY_DEACTIVATED',
              billing_status: 'READY_FOR_INVOICE',
              companyID: state.skid.companyId,
              barCode: item.barCode,
              scanItem1: item.scanItem1,
              scanItem2: item.scanItem2,
            })),
          skidID: state.skid.id,
          additionalScan: state.selectedProductMultipleScanDetails.map(scan => {
            return {
              scanName: scan.scanName,
              scanValue: scan.multiScan_id,
            };
          }),
        },
      };
      // console.log(
      //   'Update Status Data',
      //   JSON.parse(JSON.stringify(data)).data.additionalScan,
      // );

      if (data.data.items.length === 0) {
        Alert.alert('Error', 'No items to process');
        return;
      }
      // console.dir('Update Status Data', data, {depth: null});

      // console.log("Update Status Data", data);
      setState(prev => ({...prev, scanned: true}));

      const response = await fetch(`${DOMAIN_URL}/process_task_bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(data),
      });

      const responseJson = await response.json();
      // console.log("Update Status Data Response JSON", responseJson);
      // if(responseJson.data.totalCountofProductTillNow >   state.productCount) {
      //   console.log("Update Status Data Response JSON Additional Scan List", responseJson.data.additionalScanList);
      //   Alert.alert("Error", "Total number of Products on the skid has been exceeded from original purchase order. Do you want to proceed?");
      //   return;
      // }
      if (responseJson.data.totalProcessed >= state.skid.units) {
        let message = '';
        if (responseJson.data.createdList) {
          message += `\n${responseJson.data.createdList.length} barcodes scanned:\n\n`;
          responseJson.data.createdList.forEach(value => {
            message += `    ${value}\n`;
          });

          if (responseJson.data.additionalScanList.length > 0) {
            message += `\n${responseJson.data.additionalScanList.length} additional scans:\n\n`;
            responseJson.data.additionalScanList.forEach(value => {
              message += `    ${value}\n`;
            });
          }
        }
        if (responseJson.data.existList?.length > 0) {
          message += `\n${responseJson.data.existList.length} barcodes already exist:\n\n`;
          responseJson.data.existList.forEach(value => {
            message += `    ${value}\n`;
          });
        }
        message +=
          '\nTotal number of items on the skid has been exceeded from original purchase order. Do you want to proceed?';

        Alert.alert(
          `Process Results - Total Created: ${responseJson.data.totalCreated}`,
          message,
          [
            {
              text: 'NO',
              onPress: () => {
                setState(prev => ({
                  ...prev,
                  items: generateItemsArray(
                    state.selectedProductMultipleScanLength,
                  ),
                  scanned: false,
                  warning: true,
                  modalVisible: false,
                }));
                navigation.navigate('ProcessSkid');
              },
            },
            {
              text: 'YES',
              onPress: () => {
                setState(prev => ({
                  ...prev,
                  items: generateItemsArray(
                    state.selectedProductMultipleScanLength,
                  ),
                  scanned: false,
                  warning: true,
                  totalProcessed: responseJson.data.totalProcessed,
                  totalProcessedToday: responseJson.data.totalProcessedToday,
                  modalVisible: true,
                }));
                inputRefs.current[0]?.focus();
              },
            },
          ],
        );
      } else if (responseJson.data.totalProcessed) {
        let message = '';
        if (responseJson.data.createdList) {
          message += `\n${responseJson.data.createdList.length} barcodes scanned:\n\n`;
          responseJson.data.createdList.forEach(value => {
            message += `    ${value}\n`;
          });
        }
        if (responseJson.data.existList?.length > 0) {
          message += `\n${responseJson.data.existList.length} barcodes already exist:\n\n`;
          responseJson.data.existList.forEach(value => {
            message += `    ${value}\n`;
          });
        }
        message += `\nContinue Scanning ${state.selectedProductName}?`;

        Alert.alert(
          `Process Results - Total Created: ${responseJson.data.totalCreated}`,
          message,
          [
            {
              text: 'YES',
              onPress: () => {
                setState(prev => ({
                  ...prev,
                  scanning: false,
                  items: generateItemsArray(
                    state.selectedProductMultipleScanLength,
                  ),
                  scanned: false,
                  totalProcessed: responseJson.data.totalProcessed,
                  totalProcessedToday: responseJson.data.totalProcessedToday,
                }));
                inputRefs.current[0]?.focus();
              },
            },
            {
              text: 'NO',
              onPress: () => {
                setState(prev => ({
                  ...prev,
                  items: generateItemsArray(
                    state.selectedProductMultipleScanLength,
                  ),
                  scanned: false,
                  totalProcessed: responseJson.data.totalProcessed,
                  totalProcessedToday: responseJson.data.totalProcessedToday,
                  modalVisible: true,
                }));
                inputRefs.current[0]?.focus();
              },
            },
          ],
        );
      } else {
        // const loginData = {
        //   email: state.userName,
        //   password: state.password,
        // };
        // const loginResponse = await fetch(`${DOMAIN_URL}/login`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(loginData),
        // });
        // const [statusCode, loginDataJson] = await Promise.all([
        //   loginResponse.status.toString(),
        //   loginResponse.json(),
        // ]);
        // if (statusCode === "200") {
        //   await AsyncStorage.setItem("token", loginDataJson.data.token);
        //   setState((prev) => ({ ...prev, token: loginDataJson.data.token }));
        //   // handleUpdateStatus();
        // } else {
        //   navigation.navigate("Login");
        // }
      }
    } catch (error) {
      console.error('Error in handleUpdateStatus:', error);
      Alert.alert('Error', 'Failed to update status');
      setState(prev => ({...prev, scanned: false}));
    }
  };

  const handleReset = () => {
    Alert.alert(
      'RESET SCANNED ITEMS',
      'This will clear the scanned items. Are you sure about this to continue?',
      [
        {
          text: 'YES',
          onPress: () => {
            setState(prev => ({
              ...prev,
              items: generateItemsArray(
                state.selectedProductMultipleScanLength,
              ),
              scanned: false,
            }));
            inputRefs.current[0]?.focus();
          },
        },
        {text: 'NO'},
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {state.warning && (
          <Text style={styles.warning}>
            Total number of items on the skid has been exceeded from original
            purchase order.
          </Text>
        )}
        {state.skid && (
          <Text style={styles.barCode}>
            {state.skid.barCode} {' \n'}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
              }}>
              <Text style={styles.units}>Total Units: {state.skid.units}</Text>
            </View>
          </Text>
        )}
        {state.productCount > 0 && (
          <Text style={styles.units}>
            Total {state.selectedProductName}: {state.productCount}
          </Text>
        )}
        {state.skid && (
          <Text style={styles.textField}>
            Total Processed: {state.totalProcessed} | Today:{' '}
            {state.totalProcessedToday}
          </Text>
        )}
        {handleRenderList()}
        {state.scanned ? (
          <Loader visible={true} />
        ) : (
          // <TouchableOpacity
          //   style={{
          //     backgroundColor: state.selectedBackgroundColor,
          //     padding: 10,
          //     justifyContent: 'center',
          //     alignItems: 'center',
          //   }}
          //   disabled>
          //   <Text style={styles.buttonText}>UPDATING...</Text>
          // </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: state.selectedBackgroundColor,
              padding: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={handleUpdateStatus}>
            <Text style={styles.buttonText}>UPDATE STATUS</Text>
          </TouchableOpacity>
        )}
        <View style={styles.container1}>
          <View style={styles.button1}>
            <TouchableOpacity style={styles.button} onPress={handleReset}>
              <Text style={styles.buttonText}>RESET</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal
        animationType="none"
        visible={state.modalVisible}
        transparent
        onRequestClose={() => navigation.navigate('ProcessSkid')}>
        <View style={styles.modal}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Product Selection Menu</Text>
            <View style={styles.divider} />
            <ScrollView>
              {state.productList.map((product, index) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    {backgroundColor: state.backgroundColors[index]},
                  ]}
                  key={index}
                  onPress={() =>
                    Alert.alert('Confirm', `Scanning ${product.productName}`, [
                      {text: 'NO'},
                      {
                        text: 'YES',
                        onPress: async () => {
                          const multipleScanLength =
                            product.multipleScanLength || 0;

                          const selectedProductTotalCountTillNow =
                            await getCountOfSelectedProduct(
                              state.skid.id,
                              product.id,
                            );

                          console.log(
                            'Selected Product Total Count Till Now',
                            selectedProductTotalCountTillNow,
                          );
                          // Promise.all([]);

                          if (
                            selectedProductTotalCountTillNow >
                            product.productCount
                          ) {
                            Alert.alert(
                              'Limit Exceeded',
                              'You Already Scanned More Items Than the Original Purchase Order. Do you want to proceed?',
                              [
                                {text: 'NO'},
                                {
                                  text: 'YES',
                                  onPress: () => {
                                    setState(prev => ({
                                      ...prev,
                                      selectedProduct: product,
                                      selectedProductId: product.id,
                                      selectedProductName: product.productName,
                                      selectedProductPrefix: product.shortCut,
                                      selectedProductMultipleScanLength:
                                        multipleScanLength,
                                      selectedBackgroundColor:
                                        state.backgroundColors[index],
                                      productCount: product.productCount,
                                      selectedProductTotalCountTillNow:
                                        selectedProductTotalCountTillNow,
                                      selectedProductMultipleScanDetails:
                                        typeof product.scanDetails === 'string'
                                          ? JSON.parse(product.scanDetails)
                                          : product.scanDetails,
                                      modalVisible: false,
                                      items:
                                        generateItemsArray(multipleScanLength),
                                    }));

                                    navigation.navigate('ProcessItem', {
                                      name: `PROCESSING ${product.productName}`,
                                      color: state.backgroundColors[index],
                                    });
                                    inputRefs.current[0]?.focus();
                                  },
                                },
                              ],
                            );
                            return;
                          }
                          // setState(prev => ({
                          //   ...prev,
                          //   selectedProduct: product,
                          //   selectedProductId: product.id,
                          //   selectedProductName: product.productName,
                          //   selectedProductPrefix: product.shortCut,
                          //   selectedProductMultipleScanLength:
                          //     multipleScanLength,
                          //   selectedBackgroundColor:
                          //     state.backgroundColors[index],
                          //   productCount: product.productCount,
                          //   selectedProductTotalCountTillNow:
                          //     selectedProductTotalCountTillNow,
                          //   selectedProductMultipleScanDetails:
                          //     typeof product.scanDetails === 'string'
                          //       ? JSON.parse(product.scanDetails)
                          //       : product.scanDetails,
                          //   modalVisible: false,
                          //   items: generateItemsArray(multipleScanLength),
                          // }));

                          // navigation.navigate('ProcessItem', {
                          //   name: `PROCESSING ${product.productName}`,
                          //   color: state.backgroundColors[index],
                          // });
                          // inputRefs.current[0]?.focus();
                        },
                      },
                    ])
                  }>
                  <Image
                    source={
                      product.productUrl
                        ? {
                            uri: `https://drive.google.com/thumbnail?id=${product.productUrl}`,
                          }
                        : product.shortCut === 'FAB'
                        ? require('./images/FAB.png')
                        : product.shortCut === 'SBT' ||
                          product.shortCut === 'ABT'
                        ? require('./images/SBT.jpg')
                        : product.shortCut === 'ABI'
                        ? require('./images/ABI.png')
                        : require('./images/default.png')
                    }
                    style={styles.image}
                  />
                  <View
                    style={[styles.productTitle, styles.productTitleContainer]}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: 15,
                      }}>
                      {product.productName}
                    </Text>
                    {product?.multipleScan && (
                      <Text style={styles.text}>
                        {JSON.parse(product.multipleScan).length} Extra Scans
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const containerHeight = Dimensions.get('window').height - 200;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: containerHeight,
  },
  modal: {
    backgroundColor: '#00000099',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#f9fafb',
    width: '80%',
    borderRadius: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    padding: 15,
    color: '#000',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'lightgray',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    margin: 2,
    borderColor: '#2a4944',
    borderWidth: 1,
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 30,
  },
  productTitleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
  },
  inputContainer: {
    flex: 1,
    margin: 10,
  },
  textField: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  barCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
  },
  warning: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
  units: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 5,
    flex: 1,
    backgroundColor: '#1baeff',
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    // textAlign: Juno 2025, 10:32 PM IST
  },
  container1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button1: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
});

export default ProcessItemScreen;
