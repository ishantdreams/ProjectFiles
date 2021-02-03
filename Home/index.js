import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  Platform,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  Keyboard,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {TextField} from 'react-native-material-textfield';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import {useSelector, useDispatch} from 'react-redux';
import Toast, {DURATION} from 'react-native-easy-toast';
import BottomSheet from 'reanimated-bottom-sheet';
import CustomBottomSheet from 'react-native-custom-bottom-sheet';
import UserAvatar from 'react-native-user-avatar';
import {SwipeablePanel} from 'rn-swipeable-panel';
import OpenAppSettings from 'react-native-app-settings';
import {useFocusEffect} from '@react-navigation/native';

import Colors from '../../Utils/Colors';
import Fonts from '../../Utils/Fonts';
import I18n from '../../Config/i18n';
import Styles from './Styles';
import CustomBottomBar from '../../Components/CustomBottomBar';
import CustomStatusBar from '../../Components/CustomStatusBar';
import Constants from '../../Config/Constants';
import {Loader} from '../../Components/Loader';
import {setData, getData, getValue} from '../../Config/CommonFunctions';
import Global from '../../Config/Global';
import firebaseSvc from '../../Components/FirebaseSvc';
//import {Modal} from 'react-native-paper';

const {width, height} = Dimensions.get('window');

const Home = (props) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loader, setLoader] = useState(false);
  const [currentLongitude, setCurrentLongitude] = useState(0);
  const [currentLatitude, setCurrentLatitude] = useState(0);
  const [locationStatus, setLocationStatus] = useState('');
  const [businessUserList, setBusinessUserList] = useState([]);
  const [communityList, setCommunityList] = useState([]);
  const [interestList, setInterestList] = useState([]);
  const [visibility, setVisibility] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState([]);
  const [filterRefreshCount, setFilterRefreshCount] = useState(0);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState('');
  const [searchedUserList, setSearchedUserList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [userStatus, setUserStatus] = useState('');

  const [panelProps, setPanelProps] = useState({
    fullWidth: true,
    openLarge: false,
    showCloseButton: true,
    allowTouchOutside: false,
    onClose: () => closePanel(),
    onPressCloseButton: () => closePanel(),
    // ...or any prop you want
  });
  const [isPanelActive, setIsPanelActive] = useState(false);
  const [filterProps, setFilterProps] = useState({
    fullWidth: true,
    openLarge: false,
    showCloseButton: true,
    allowTouchOutside: false,
    onClose: () => closePanel(),
    onPressCloseButton: () => closePanel(),
    // ...or any prop you want
  });

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const toastRef = useRef(null);
  const sheetRef = useRef(null);

  useEffect(() => {
    // console.warn('signin');
    // console.warn('home onuser - ', dispatch((user)));
    // getUserProfile();
    getFirebaseUser();


    // Get Cuurent Location
    getLocation();
    hitCommunityListApi();
    hitInterestListApi();
    getBusinessUserList('');
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setUserStatus(getData('userStat'))
    }, []),
  );

  // const getWatchLocation = () => {
  //   let watchID = Geolocation.watchPosition(
  //     (position) => {
  //       //Will give you the location on location change

  //       setLocationStatus('You are Here');
  //       console.log(position);

  //       //getting the Longitude from the location json
  //       let currentLongitude = JSON.stringify(position.coords.longitude);

  //       //getting the Latitude from the location json
  //       let currentLatitude = JSON.stringify(position.coords.latitude);

  //       //Setting Longitude state
  //       setCurrentLongitude(currentLongitude);

  //       //Setting Latitude state
  //       setCurrentLatitude(currentLatitude);
  //     },
  //     (error) => {
  //       setLocationStatus(error.message);
  //     },
  //     {
  //       enableHighAccuracy: false,
  //       maximumAge: 1000,
  //     },
  //   );
  // };

  const getLocation = () => {
    // Getting the current location
    Geolocation.getCurrentPosition(
      (position) => {
        let initialPosition = JSON.stringify(position);
        console.log('position', initialPosition);
        setCurrentLatitude(position.coords.latitude);
        setCurrentLongitude(position.coords.longitude);
      },
      (error) => {
        const locError = JSON.stringify(error);
        console.log('loc error', locError);
        // showAlert(error.code);
      },
      {
        enableHighAccuracy: false,
        timeout: 30 * 1000,
        //maximumAge: 36*100*1000,
        useSignificantChanges: true,
      },
    );
  };

  const showAlert = (type) => {
    if (type === 1) {
      Alert.alert(I18n.t('location_alert'), I18n.t('location_permission'), [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
        },
        {
          text: I18n.t('open_settings'),
          onPress: () => {
            showAlert(2);
            OpenAppSettings.open();
          },
        },
      ]);
    } else {
      Alert.alert(I18n.t('location_alert'), I18n.t('location_unavailable'), [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
        },
        {text: I18n.t('locate_again'), onPress: () => getLocation()},
      ]);
    }
  };

  const closePanel = () => {
    setIsPanelActive(false);
    setIsFilterActive(false);
  };

  const getFirebaseUser = async () => {
    let firebase = await getData('FirebaseUser');
    console.log('firebse-user', firebase);
    setFirebaseUser(firebase);
  };
  // Function to open chat
  const openChatRoom = (userId, otherId) => {
    let minId = userId > otherId ? otherId : userId;
    let maxId = userId > otherId ? userId : otherId;
    let room = firebaseSvc.setChatRoom(minId, maxId);
    console.log('Room Ref:' + room);
    props.navigation.navigate('ChatScreen', {
      user: firebaseUser,
      chatRoom: minId + '-' + maxId,
      senderId: userId,
      receiverId: otherId,
    });
  };

  //******************** Hit User profile Api *******************
  getBusinessUserList = async (id) => {
    setLoader(true);
    console.log('url - ', Constants.baseUrl + Constants.api.businessUserList);

    let params = {
      page: 0,
    };

    if (id !== '') {
      params.community_id = id;
    }

    if (searchText !== '') {
      params.search_key = searchText;
    }

    console.log('business user list request params - ', params);

    try {
      let response = await fetch(
        Constants.baseUrl + Constants.api.businessUserList,
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
        setBusinessUserList(responseJson.data);
        // setVisibility(!visibility);
        // setIsPanelActive(!isPanelActive);
        if (
          searchText !== '' &&
          responseJson.data !== undefined &&
          responseJson.data !== null
        ) {
          setIsPanelActive(true);
          Keyboard.dismiss();
        } else if (
          responseJson.data === undefined ||
          responseJson.data === null
        ) {
          toastRef.current.show(responseJson.message);
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

  //******************** Hit Community List Api *******************
  hitCommunityListApi = async () => {
    setLoader(true);
    console.log('url - ', Constants.baseUrl + Constants.api.getCommunityList);

    try {
      let response = await fetch(
        Constants.baseUrl + Constants.api.getCommunityList,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + Global.userDetails.access_token,
          },
        },
      );

      setLoader(false);
      let responseJson = await response.json();
      console.log('community list ResponseJson - ', responseJson);

      if (response.status === 200) {
        setCommunityList(responseJson.data);
        for (let i = 0; i < responseJson.data.length; i++) {
          selectedCommunity.push(false);
        }
      } else if (response.status === 401) {
        console.log('error - ', responseJson);
        props.navigation.reset({
          index: 0,
          routes: [{name: 'SignIn'}],
        });
      } else {
        console.log('error - ', responseJson);
      }
    } catch (error) {
      setLoader(false);
      alert('error - ', error);
    }
  };

  //******************** Hit Interest List Api *******************
  hitInterestListApi = async () => {
    setLoader(true);
    console.log('url - ', Constants.baseUrl + Constants.api.interestList);

    try {
      let response = await fetch(
        Constants.baseUrl + Constants.api.interestList,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + Global.userDetails.access_token,
          },
        },
      );

      setLoader(false);
      let responseJson = await response.json();
      console.log('interest list ResponseJson - ', responseJson);

      if (response.status === 200) {
        setInterestList(responseJson.data);
        for (let i = 0; i < responseJson.data.length; i++) {
          selectedInterest.push(false);
        }
      } else if (response.status === 401) {
        console.log('error - ', responseJson);
        props.navigation.reset({
          index: 0,
          routes: [{name: 'SignIn'}],
        });
      } else {
        console.log('error - ', responseJson);
      }
    } catch (error) {
      setLoader(false);
      console.log('error - ', error);
    }
  };

  renderRow = (item, index) => {
    return (
      <TouchableOpacity
        style={{flexDirection: 'row', paddingVertical: 15}}
        onPress={() => {
          setIsSearchVisible(false);
          setSearchText('');
          setSearchedUserList([]);
          props.navigation.navigate('ServiceDetails', {id: item.id});
        }}>
        <View style={{height: 40, marginRight: 10, width: 40}}>
          <UserAvatar
            size={40}
            name={item.first_name + ' ' + item.last_name}
            src={item.profile_image}
          />
        </View>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text
            style={{
              fontSize: 13.5,
              fontFamily: Fonts.PoppinsMedium,
              color: Colors.black,
              opacity: 0.9,
            }}>
            {item.first_name + ' ' + item.last_name}
          </Text>
          {/* <Text
            style={{
              fontSize: 13.5,
              fontFamily: Fonts.PoppinsMedium,
              color: Colors.black,
              opacity: 0.9,
            }}>
            {item.first_name + " " + item.last_name}
          </Text> */}
        </View>

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
            source={require('../../Assets/Images/rightArrow.png')}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  renderRowFilter = (item, index) => {
    return (
      <>
        {filterRefreshCount >= 0 && (
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() => {
              item.community_name !== undefined
                ? (selectedCommunity[index] = !selectedCommunity[index])
                : (selectedInterest[index] = !selectedInterest[index]);

              setFilterRefreshCount(filterRefreshCount + 1);
            }}
            activeOpacity={0.9}>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <Text
                style={{
                  fontSize: 13.5,
                  fontFamily: Fonts.PoppinsMedium,
                  color: Colors.black,
                  opacity: 0.9,
                }}>
                {item.community_name !== undefined
                  ? item.community_name
                  : item.interest_name}
              </Text>
            </View>

            <View
              style={{
                height: 30,
                width: 30,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
              }}>
              <Image
                style={{height: 20, width: 20}}
                source={
                  item.community_name !== undefined
                    ? selectedCommunity[index] === false
                      ? require('../../Assets/Images/uncheck.png')
                      : require('../../Assets/Images/check.png')
                    : selectedInterest[index] === false
                    ? require('../../Assets/Images/uncheck.png')
                    : require('../../Assets/Images/check.png')
                }
                resizeMode={'contain'}
              />
            </View>
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: Colors.white}}
      showsVerticalScrollIndicator={false}>
      <CustomStatusBar color={Colors.white} />

      <View
        style={{
          height: 44,
          backgroundColor: Colors.white,
          marginHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.pop();
          }}>
          <Image
            source={require('../../Assets/Images/back.png')}
            style={{height: 30, width: 35}}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
        {/* <TouchableOpacity style={{height: 25, width: 25, marginLeft: 10}}>
          <Image
            //source={require('../../Assets/Images/menu.png')}
            style={{height: 35, width: 35}}
            resizeMode={'contain'}
          />
        </TouchableOpacity> */}
        <Text
          style={{
            flex: 1,
            fontSize: 18,
            fontFamily: Fonts.PoppinsMedium,
            textAlign: 'center',
          }}>
          {I18n.t('communitySearch')}
        </Text>
        {/* <TouchableOpacity
          activeOpacity={0.8}
          style={{height: 25, width: 25}}
          onPress={() => {
            openChatRoom(25, 23);
          }}>
          <Image
            source={require('../../Assets/Images/search.png')}
            style={{height: 25, width: 25}}
            resizeMode={'contain'}
          />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={{
            height: 35,
            width: 35,
            marginLeft: 10,
            backgroundColor: Colors.appGray,
            borderRadius: 17.5,
          }}>
          <Image
            dafaultSource={require('../../Assets/Images/defaultDP.png')}
            source={
              Global.userDetails.profile_image !== null &&
              Global.userDetails.profile_image !== '' &&
              Global.userDetails.profile_image !== undefined
                ? {
                    uri: Global.userDetails.profile_image,
                  }
                : require('../../Assets/Images/defaultDP.png')
            }
            style={{height: 35, width: 35, borderRadius: 17.5}}
          />
           <View
            style={{
              height: 10,
              width: 10,
              borderRadius: 5,
              backgroundColor:
                userStatus === 'Online'
                  ? Colors.appLightGreen
                  : userStatus === 'Offline'
                  ? Colors.steelGray
                  : userStatus === 'Away'
                  ? Colors.appYellow
                  : Colors.appStrawberryRed,
              position: 'absolute',
              bottom: 0,
              right: 0,
            }}
          />
        </TouchableOpacity>
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: currentLatitude,
          longitude: currentLongitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0922,
        }}
        style={{flex: 1}}>
        <Marker
          coordinate={{latitude: currentLatitude, longitude: currentLongitude}}
        />
        {/* {businessUserList.map((item) => {
          <Marker
            coordinate={{
              latitude: parseInt(item.latitude),
              longitude: parseInt(item.longitude),
            }}
            pinColor="green"
          />;
        })} */}
      </MapView>
      <View
        style={{
          position: 'absolute',
          marginTop: Platform.OS === 'ios' ? height >= 812 && 100 : 70,
          right: 0,
          left: 0,
        }}>
        <View
          style={{
            marginHorizontal: 15,
            backgroundColor: Colors.white,
            height: 50,
            marginTop: 20,
            borderRadius: 5,
            shadowColor: Colors.appStrawberryRed,
            shadowRadius: 5,
            shadowOpacity: 0.15,
            shadowOffset: {width: 0, height: 3},
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: 10,
          }}>
          <Image
            source={require('../../Assets/Images/location.png')}
            style={{height: 20, width: 20}}
            resizeMode={'contain'}
          />
          {/* <TouchableOpacity
            style={{flex: 1, height: 50, justifyContent: 'center'}}
            onPress={() => {
              setIsSearchVisible(true);
            }}>
            <Text
              style={{
                marginHorizontal: 10,
                fontSize: 14,
                fontFamily: Fonts.PoppinsRegular,
                color: Colors.steelGray,
              }}>
              Search Business
            </Text>
          </TouchableOpacity> */}

          <TextInput
            style={{
              marginHorizontal: 10,
              marginRight: 20,
              fontSize: 14,
              fontFamily: Fonts.PoppinsRegular,
              height: 40,
              // borderWidth: 1,
              flex: 1,
              paddingStart: 10,
              backgroundColor: Colors.white,
              // borderColor: Colors.steelGray,
            }}
            placeholder={'Search Business'} //I18n.t('searchLocation')}
            // clearButtonMode={'while-editing'}
            returnKeyType={'search'}
            // enablesReturnKeyAutomatically={true}
            onSubmitEditing={() => {
              if (searchText !== '') {
                getBusinessUserList('');
              }
            }}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              if (text === '') {
                setIsPanelActive(false);
                getBusinessUserList('');
              }
              // if (text !== '') {
              //   let arr = businessUserList.filter(function (item) {
              //     if (
              //       item.first_name.includes(text) ||
              //       item.last_name.includes(text)
              //     ) {
              //       return item;
              //     }
              //   });
              //   setSearchedUserList(arr);
              // } else {
              //   setSearchedUserList([]);
              // }
            }}
          />

          <TouchableOpacity
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: Colors.appYellow,
              shadowColor: Colors.appGray,
              shadowRadius: 5,
              shadowOpacity: 0.2,
              shadowOffset: {width: 0, height: 3},
            }}
            onPress={() => {
              setIsFilterActive(!isFilterActive);
            }}>
            <Image
              source={require('../../Assets/Images/funnel.png')}
              style={{height: 20, width: 20}}
              resizeMode={'contain'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: Colors.appYellow,
          height: 50,
          width: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          bottom: 190,
          right: 20,
          shadowColor: Colors.black,
          shadowRadius: 5,
          shadowOpacity: 0.2,
          shadowOffset: {width: 0, height: 5},
        }}
        activeOpacity={0.9}
        onPress={() => {
          // props.navigation.navigate('ServiceDetails');
          // sheetRef.current.snapTo(0);
          // getBusinessUserList('');
          if (businessUserList !== undefined && businessUserList.length > 0) {
            setIsPanelActive(true);
          } else {
            toastRef.current.show('No Business User Found', 2000);
          }
        }}>
        <Image
          source={require('../../Assets/Images/list.png')}
          style={{height: 25, width: 25}}
          resizeMode={'contain'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: Colors.white,
          height: 50,
          width: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          bottom: 120,
          right: 20,
          shadowColor: Colors.black,
          shadowRadius: 5,
          shadowOpacity: 0.2,
          shadowOffset: {width: 0, height: 5},
        }}
        activeOpacity={0.9}
        onPress={() => {
          props.navigation.navigate('Messages');
        }}>
        <Image
          source={require('../../Assets/Images/message.png')}
          style={{height: 25, width: 25}}
          resizeMode={'contain'}
        />
      </TouchableOpacity>

      <SwipeablePanel {...panelProps} isActive={isPanelActive}>
        <FlatList
          style={{flex: 1, marginHorizontal: 20}}
          data={businessUserList}
          bounces={false}
          renderItem={({item, index}) => renderRow(item, index)}
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
      </SwipeablePanel>

      <SwipeablePanel
        {...filterProps}
        isActive={isFilterActive}
        openLarge={false}>
        <Text
          style={{
            fontSize: 19,
            fontFamily: Fonts.PoppinsSemiBold,
            marginTop: 20,
            marginLeft: 20,
          }}>
          {I18n.t('filter')}
        </Text>

        <Text
          style={{
            fontSize: 16,
            fontFamily: Fonts.PoppinsMedium,
            marginTop: 30,
            marginLeft: 20,
          }}>
          {I18n.t('community')}:
        </Text>

        <FlatList
          style={{flex: 1, marginHorizontal: 20, marginTop: 10}}
          data={communityList}
          bounces={false}
          renderItem={({item, index}) => renderRowFilter(item, index)}
        />

        {/* <View
          style={{
            height: 1,
            backgroundColor: Colors.steelGray,
            marginLeft: 20,
            marginRight: 25,
            marginTop: 25,
          }}
        /> */}

        {/* <Text
          style={{
            fontSize: 16,
            fontFamily: Fonts.PoppinsMedium,
            marginTop: 30,
            marginLeft: 20,
          }}>
          Interests:
        </Text>

        <FlatList
          style={{flex: 1, marginHorizontal: 20, marginTop: 10}}
          data={interestList}
          bounces={false}
          renderItem={({item, index}) => renderRowFilter(item, index)}
        /> */}
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity
            style={{
              height: 45,
              width: 120,
              marginTop: 30,
              marginBottom: 30,
              marginHorizontal: 8,
              borderColor: Colors.appYellow,
              borderWidth: 2,
              borderRadius: 5,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: Colors.appStrawberryRed,
              shadowRadius: 3,
              shadowOpacity: 0.3,
              shadowOffset: {width: 0, height: 3},
              elevation: 3,
            }}
            activeOpacity={0.9}
            onPress={() => {
              // hitUserFollowApi();
              // setSelectedService(null);
              // setVisibility(false);
              setIsFilterActive(false);
            }}>
            <Text style={Styles.btnTextSignin}>{I18n.t('cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              height: 45,
              width: 120,
              marginTop: 30,
              marginBottom: 30,
              marginHorizontal: 8,
              backgroundColor: Colors.appYellow,
              borderRadius: 5,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: Colors.appStrawberryRed,
              shadowRadius: 3,
              shadowOpacity: 0.3,
              shadowOffset: {width: 0, height: 3},
              elevation: 3,
            }}
            activeOpacity={0.9}
            onPress={() => {
              // hitUserFollowApi();
              // hitAvailServiceApi();
              // setVisibility(false);
              let id = '';
              selectedCommunity.forEach((data, index) => {
                if (data) {
                  id = communityList[index].id + ',';
                }
              });
              getBusinessUserList(id);
              setIsFilterActive(false);
            }}>
            <Text style={Styles.btnTextSignin}>{I18n.t('apply')}</Text>
          </TouchableOpacity>
        </View>
      </SwipeablePanel>

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
      {<CustomBottomBar />}

      <Modal
        visible={isSearchVisible}
        transparent={false}
        animationType={'slide'}>
        <SafeAreaView style={{flex: 1, backgroundColor: Colors.white}}>
          <CustomStatusBar color={Colors.paleGray} />
          <View
            style={{
              height: 60,
              backgroundColor: Colors.paleGray,
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: Colors.steelGray,
            }}>
            <TouchableOpacity
              style={{marginLeft: 10}}
              onPress={() => {
                setIsSearchVisible(false);
                setSearchText('');
                setSearchedUserList([]);
              }}>
              <Image
                source={require('../../Assets/Images/close.png')}
                style={{height: 30, width: 30}}
                resizeMode={'contain'}
              />
            </TouchableOpacity>

            <TextInput
              style={{
                marginHorizontal: 10,
                marginRight: 20,
                fontSize: 14,
                fontFamily: Fonts.PoppinsRegular,
                height: 40,
                borderWidth: 1,
                flex: 1,
                paddingStart: 10,
                backgroundColor: Colors.white,
                borderColor: Colors.steelGray,
              }}
              placeholder={'Search Business'} //I18n.t('searchLocation')}
              clearButtonMode={'while-editing'}
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                if (text !== '') {
                  let arr = businessUserList.filter(function (item) {
                    if (
                      item.first_name.includes(text) ||
                      item.last_name.includes(text)
                    ) {
                      return item;
                    }
                  });
                  setSearchedUserList(arr);
                } else {
                  setSearchedUserList([]);
                }
              }}
            />
          </View>
          <FlatList
            style={{flex: 1, marginHorizontal: 20}}
            data={searchedUserList}
            bounces={false}
            renderItem={({item, index}) => renderRow(item, index)}
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
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;
