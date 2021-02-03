import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  FlatList,
  Alert,
  Switch,
  Share,
  SectionList,
} from 'react-native';
import {TextField} from 'react-native-material-textfield';
import Contacts from 'react-native-contacts';
import UserAvatar from 'react-native-user-avatar';
import Toast, {DURATION} from 'react-native-easy-toast';

import Colors from '../../Utils/Colors';
import Fonts from '../../Utils/Fonts';
import I18n from '../../Config/i18n';
import Styles from './Styles';
import Global from '../../Config/Global';
import Constants from '../../Config/Constants';
import {Loader} from '../../Components/Loader';
import CustomStatusBar from '../../Components/CustomStatusBar';
import CustomBottomBar from '../../Components/CustomBottomBar';

import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import OpenAppSettings from 'react-native-app-settings';

const FindFriends = (props) => {
  const [loader, setLoader] = useState(false);
  const [contactArr, setContactArr] = useState([]);
  const [filteredArr, setFilteredArr] = useState([]);
  const [krmpleUsers, setKrmpleUsers] = useState([]);

  const toastRef = useRef(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const getContactData = () => {
    setLoader(true);
    Contacts.getAll().then((contacts) => {
      setLoader(false);
      console.log('contact fatched - ', contacts);
      let contcts = contacts.sort(function (a, b) {
        return a.givenName === b.givenName
          ? a.familyName > b.familyName
          : a.givenName > b.givenName;
      });
      setContactArr(contcts);
      setFilteredArr(contcts);
      let arr = [];
      contcts.forEach(function (user) {
        if (user.phoneNumbers[0] !== undefined) {
          let str = user.phoneNumbers[0].number;
          str = str.replace(/[^0-9]/g, '');
          arr.push(str);
        }
      });
      console.log('phoneNumberArr - ', arr);
      hitCheckPhoneNumberApi(arr);
    });
  };

  const checkPermission = () => {
    check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CONTACTS
        : PERMISSIONS.ANDROID.READ_CONTACTS,
    )
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log('This feature is not available');
            break;
          case RESULTS.DENIED:
            console.log(
              'The permission has not been requested / is denied but requestable',
            );
            requestPermission();
            break;
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            getContactData();
            break;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            showAlert();
            break;
        }
      })
      .catch((err) => {
        console.log(err);
        toastRef.current.show(err.message, 2000, () => {});
      });
  };

  const requestPermission = () => {
    request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CONTACTS
        : PERMISSIONS.ANDROID.READ_CONTACTS,
    )
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log('This feature is not available');
            break;
          case RESULTS.DENIED:
            console.log('The permission has been denied');
            showAlert();
            break;
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            getContactData();
            break;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            showAlert();
            break;
        }
      })
      .catch((err) => {
        console.log(err);
        toastRef.current.show(err.message, 2000, () => {});
      });
  };

  const showAlert = () => {
    Alert.alert(i18n.t('permission_alert'), i18n.t('contact_permission'), [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
      },
      {
        text: i18n.t('open_settings'),
        onPress: () => OpenAppSettings.open(),
      },
    ]);
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: 'Hey this is an awesome application. Try it once.',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  //******************** Hit User invitation Api *******************
  hitSendInviteApi = async (user) => {
    setLoader(true);
    console.log('url - ', Constants.baseUrl + Constants.api.sendInvite);

    let number = String(user.phoneNumbers[0].number);

    var result = number.replace(/[- )(]/g, '');
    console.log('user detail - ', result);

    let params = {
      phone: result,
    };

    try {
      let response = await fetch(Constants.baseUrl + Constants.api.sendInvite, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Global.userDetails.access_token,
        },

        body: JSON.stringify(params),
      });

      setLoader(false);
      let responseJson = await response.json();
      console.log('userDetail ResponseJson - ', responseJson);

      if (response.status === 200) {
        console.log('ResponseJson - ', responseJson);
        if (responseJson.success === 'false') {
          onShare();
        }
      } else if (response.status === 401) {
        // removeData('userData');
        console.log('error - ', responseJson);
        props.navigation.reset({
          index: 0,
          routes: [{name: 'SignIn'}],
        });
      } else {
        console.log('error - ', responseJson);
        // toastRef.current.show(responseJson.message, 1000);
      }
    } catch (error) {
      setLoader(false);
      alert('error - ', error);
    }
  };

  //******************** Hit Send Request Api *******************
  hitSendRequestApi = async (userId) => {
    setLoader(true);
    console.log('url - ', Constants.baseUrl + Constants.api.sendRequest);

    let params = {
      send_request_to: userId,
    };

    try {
      let response = await fetch(
        Constants.baseUrl + Constants.api.sendRequest,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + Global.userDetails.access_token,
          },

          body: JSON.stringify(params),
        },
      );

      setLoader(false);
      let responseJson = await response.json();
      console.log('userDetail ResponseJson - ', responseJson);

      if (response.status === 200) {
        console.log('ResponseJson - ', responseJson);
        if (responseJson.success === 'false') {
          onShare();
        }
      } else if (response.status === 401) {
        // removeData('userData');
        console.log('error - ', responseJson);
        props.navigation.reset({
          index: 0,
          routes: [{name: 'SignIn'}],
        });
      } else {
        console.log('error - ', responseJson);
        // toastRef.current.show(responseJson.message, 1000);
      }
    } catch (error) {
      setLoader(false);
      alert('error - ', error);
    }
  };

  //******************** Hit check Phone Api *******************
  hitCheckPhoneNumberApi = async (phoneNumbers) => {
    setLoader(true);
    console.log('url - ', Constants.baseUrl + Constants.api.checkUsers);

    let params = {
      phone: phoneNumbers,
    };

    try {
      let response = await fetch(Constants.baseUrl + Constants.api.checkUsers, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Global.userDetails.access_token,
        },

        body: JSON.stringify(params),
      });

      setLoader(false);
      let responseJson = await response.json();
      console.log('userDetail ResponseJson - ', responseJson);

      if (response.status === 200) {
        console.log('ResponseJson - ', responseJson.data);
        setKrmpleUsers(responseJson.data);
      } else if (response.status === 401) {
        // removeData('userData');
        props.navigation.reset({
          index: 0,
          routes: [{name: 'SignIn'}],
        });
      } else {
        console.log('error - ', responseJson);
        // toastRef.current.show(responseJson.message, 1000);
      }
    } catch (error) {
      setLoader(false);
      alert('error - ', error);
    }
  };

  renderRow = (item, index) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: 15,
          borderBottomWidth: 0.5,
          borderBottomColor: Colors.steelGray,
        }}>
        <View style={{height: 40, marginRight: 10, width: 40}}>
          {/* <Image
            style={{height: 40, width: 40, borderRadius: 20}}
            source={item.image}
            resizeMode={'contain'}
          /> */}
          <UserAvatar size={40} name={item.givenName + ' ' + item.familyName} />
        </View>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text
            style={{
              fontSize: 13.5,
              fontFamily: Fonts.PoppinsMedium,
              color: Colors.black,
              opacity: 0.9,
            }}>
            {item.givenName + ' ' + item.familyName}
          </Text>
        </View>
        {index === -1 ? (
          <TouchableOpacity
            style={{
              height: 30,
              width: 30,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              // backgroundColor: Colors.appLightGreen,
            }}>
            <Image
              style={{height: 20, width: 20}}
              source={require('../../Assets/Images/checkRound.png')}
              resizeMode={'contain'}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              height: 30,
              width: 80,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              backgroundColor: Colors.appYellow,
              borderRadius: 5,
              shadowColor: Colors.black,
              shadowOpacity: 0.2,
              shadowRadius: 5,
              shadowOffset: {width: 0, height: 4},
            }}
            onPress={() => {
              hitSendInviteApi(item);
            }}>
            <Text
              style={{
                fontSize: 13.5,
                fontFamily: Fonts.PoppinsMedium,
                color: Colors.appDarkGreen,
                opacity: 0.9,
              }}>
              {/* {I18n.t('invite')} */}
              {'Invite'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  renderRowKrmpleUsers = (item, index) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          paddingVertical: 15,
          borderBottomWidth: 0.5,
          borderBottomColor: Colors.steelGray,
          alignItems: 'center',
        }}>
        <View style={{height: 40, marginRight: 10, width: 40}}>
          {/* <Image
            style={{height: 40, width: 40, borderRadius: 20}}
            source={item.image}
            resizeMode={'contain'}
          /> */}
          <UserAvatar size={40} name={item.first_name + ' ' + item.last_name} />
        </View>
        <View style={{flex: 1}}>
          <Text
            style={{
              fontSize: 13.5,
              fontFamily: Fonts.PoppinsMedium,
              color: Colors.black,
              opacity: 0.9,
            }}>
            {item.first_name + ' ' + item.last_name}
          </Text>
        </View>

        {/* <View
          style={{
            height: 30,
            width: 30,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            // backgroundColor: Colors.appLightGreen,
          }}>
          <Image
            style={{height: 20, width: 20}}
            source={require('../../Assets/Images/checkRound.png')}
            resizeMode={'contain'}
          />
        </View> */}
        <TouchableOpacity
          style={{
            height: 30,
            width: 80,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            backgroundColor: Colors.appYellow,
            borderRadius: 5,
            shadowColor: Colors.black,
            shadowOpacity: 0.2,
            shadowRadius: 5,
            shadowOffset: {width: 0, height: 4},
          }}
          onPress={() => {
            hitSendRequestApi(item.id);
          }}>
          <Text
            style={{
              fontSize: 13.5,
              fontFamily: Fonts.PoppinsMedium,
              color: Colors.appDarkGreen,
              opacity: 0.9,
            }}>
            {/* {I18n.t('invite')} */}
            {'Add'}
          </Text>
        </TouchableOpacity>
        {/* <View>
          
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                paddingHorizontal: 5,
                height: 50,
                width: 50,
                marginRight: 5,
              }}>
              <Image
                style={{height: 35, width: 35}}
                source={require('../../Assets/Images/accept.png')}
                resizeMode={'contain'}
              />
              <Text
                style={{
                  fontFamily: Fonts.PoppinsSemiBold,
                  fontSize: 9,
                  color: Colors.appDarkGreen,
                }}>
                {'Accept'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                paddingHorizontal: 5,
                height: 50,
                width: 50,
                // backgroundColor: Colors.appLightGreen,
              }}>
              <Image
                style={{height: 35, width: 35}}
                source={require('../../Assets/Images/reject.png')}
                resizeMode={'contain'}
              />
              <Text
                style={{
                  fontFamily: Fonts.PoppinsSemiBold,
                  fontSize: 9,
                  color: Colors.appDarkGreen,
                }}>
                {'Reject'}
              </Text>
            </TouchableOpacity>
          </View>
        </View> */}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors.white}}>
      {/* <Image
        style={Styles.banner}
        source={require('../../Assets/Images/loginFullImage.png')}
      /> */}
      <CustomStatusBar color={Colors.white} />
      <View
        style={{
          height: 44,
          backgroundColor: Colors.white,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.pop();
          }}>
          <Image
            style={{height: 30, marginLeft: 20, width: 30}}
            source={require('../../Assets/Images/back.png')}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
        <Text style={Styles.txtSignin}>{'Connections'}</Text>
        <TouchableOpacity>
          <Image
            style={{height: 30, marginLeft: 20, width: 30}}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
      </View>
      <View style={{flex: 1, backgroundColor: Colors.paleGray}}>
        <View
          style={{
            marginTop: 20,
            marginHorizontal: 20,
            flexDirection: 'row',
            backgroundColor: Colors.white,
            borderWidth: 1,
            borderColor: Colors.steelGray,
            borderRadius: 20,
            alignItems: 'center',
          }}>
          <Image
            style={{height: 15, marginLeft: 20, width: 15}}
            source={require('../../Assets/Images/search.png')}
            resizeMode={'contain'}
          />
          <TextInput
            style={{
              height: 40,
              paddingStart: 10,
              paddingEnd: 20,
              fontSize: 14.5,
              fontFamily: Fonts.PoppinsRegular,
              flex: 1,
            }}
            placeholder={I18n.t('search')}
            onChangeText={(text) => {
              let arr = contactArr.filter(function (item) {
                if (
                  item.givenName.includes(text) ||
                  item.familyName.includes(text)
                ) {
                  return item;
                }
              });

              setFilteredArr(arr);
            }}
          />
        </View>
        {/* <FlatList
          style={{marginHorizontal: 20, marginTop: 20}}
          data={krmpleUsers}
          bounces={false}
          renderItem={({item, index}) => renderRowKrmpleUsers(item, index)}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => {
            return (
              <View
                style={{
                  height: 1,
                  backgroundColor: Colors.steelGray,
                  width: '100%',
                }}
              />
            );
          }}
        />
        <FlatList
          style={{marginHorizontal: 20}}
          data={filteredArr}
          bounces={false}
          renderItem={({item, index}) => renderRow(item, index)}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => {
            return (
              <View
                style={{
                  height: 1,
                  backgroundColor: Colors.steelGray,
                  width: '100%',
                }}
              />
            );
          }}
        /> */}

        <ScrollView
          style={{flex: 1, paddingHorizontal: 30, paddingTop: 20}}
          contentContainerStyle={{paddingBottom: 20}}>
          {krmpleUsers.length > 0 && (
            <Text
              style={{
                fontFamily: Fonts.PoppinsSemiBold,
                fontSize: 17,
                color: Colors.appDarkGreen,
                paddingVertical: 20,
              }}>
              {'Friends on KRMPLE'}
            </Text>
          )}
          {krmpleUsers.map((item, index) => {
            return renderRowKrmpleUsers(item);
          })}
          {filteredArr.length > 0 && (
            <Text
              style={{
                fontFamily: Fonts.PoppinsSemiBold,
                fontSize: 17,
                color: Colors.appDarkGreen,
                paddingVertical: 20,
              }}>
              {'Other Contacts'}
            </Text>
          )}
          {filteredArr.map((item, index) => {
            return renderRow(item);
          })}
        </ScrollView>
      </View>
      {loader && <Loader />}
      <Toast
        ref={toastRef}
        style={{backgroundColor: Colors.appDarkGreen}}
        textStyle={{
          color: Colors.appYellow,
          fontSize: 14,
          fontFamily: Fonts.PoppinsSemiBold,
        }}
      />
      {!loader && <CustomBottomBar />}
    </SafeAreaView>
  );
};

export default FindFriends;
