import React, {useState, useEffect, useRef} from 'react';
import {
  ScrollView,
  Alert,
  Text,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import CustomStatusBar from '../../Components/CustomStatusBar';
import styles from './styles';
import Colors from '../../Utils/Colors';
import Fonts from '../../Utils/Fonts';
import I18n from '../../Config/i18n';

import {timeout, processResponse} from '../../Config/CommonFunctions';
import constants from '../../Config/Constants';
import {Loader} from '../../Components/Loader';
import Global from '../../Config/Global';

import Toast, {DURATION} from 'react-native-easy-toast';
import Moment from 'moment';
import ImagePicker from 'react-native-image-picker';
import OpenAppSettings from 'react-native-app-settings';
import {GiftedChat, Bubble} from 'react-native-gifted-chat';
import firebaseSvc from '../../Components/FirebaseSvc';

const ChatScreen = (props) => {
  const {user, chatRoom, senderId, receiverId} = props.route.params;
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);

  const [loader, setLoader] = useState(false);
  const toastRef = useRef(null);

  useEffect(() => {
    console.log('ChatRoom', chatRoom);
    console.log('ChatUser', user);
    console.log('SenderId', senderId);
    console.log('ReceiverId', receiverId);
    firebaseSvc.refRoomOn((message) => {
      //setMessages(prevState => [...prevState, message]);
      setMessages((prevState) => GiftedChat.append(prevState, message));
    });
  }, []);

  const selectPhoto = () => {
    let options = {
      quality: 1.0,
      allowsEditing: false,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      //console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        showAlert();
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        console.log('response', response.uri);
        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        Image.getSize(response.uri, (width, height) => {
          console.log('dimen', width + ',' + height);
        });
        let formdata = new FormData();
        if (response.uri != '') {
          formdata.append('image', {
            uri: response.uri,
            name: 'image.png',
            type: 'image/png',
          });
          UploadImageApi(formdata);
        }
      }
    });
  };

  const showAlert = () => {
    Alert.alert(I18n.t('storage_alert'), I18n.t('storage_permission'), [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
      },
      {
        text: I18n.t('open_settings'),
        onPress: () => OpenAppSettings.open(),
      },
    ]);
  };

  //******************** Hit Uplaod Image Api *******************
  const UploadImageApi = async (formData) => {
    setLoader(true);
    console.log(
      'ApiCall',
      constants.baseUrl + constants.api.uploadImageMessage,
    );
    console.log('Form-Data', formData);
    timeout(
      10000,
      fetch(constants.baseUrl + constants.api.uploadImageMessage, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          //'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Global.userDetails.access_token}`,
        },
        body: formData,
      }),
    )
      .then(processResponse)
      .then((res) => {
        const {responseCode, responseJson} = res;
        console.log(
          'response',
          responseCode + '' + JSON.stringify(responseJson),
        );
        setLoader(false);
        if (responseCode === 200) {
          if (responseJson.success == 'true') {
            var data = responseJson.data;
          } else {
            console.log('message-api-error', responseJson.message);
          }
        } else {
          if (responseJson.hasOwnProperty('message')) {
            console.log('message-error:', responseJson.message);
          } else {
            var key;
            var secondKey;
            for (var k in responseJson) {
              key = k;
              break;
            }
            for (var k in responseJson[key]) {
              secondKey = k;
              break;
            }
            console.log('message-error:', responseJson[key][secondKey][0]);
          }
        }
      })
      .catch((err) => {
        setLoader(false);
        console.log('message-exception', err.message);
      });
  };

  const sendMessage = (message, type) => {
    console.log('Text-Message', message);
    let data = {
      message: message,
      room_id: chatRoom,
      sender_id: senderId,
      receiver_id: receiverId,
      msg_type: type,
    };
    MessageSendApi(data);
  };

  //******************** Hit Send Message Api *******************
  const MessageSendApi = async (data) => {
    console.log('ApiCall', constants.baseUrl + constants.api.sendMessages);
    console.log('Msg-Data', data);
    console.log('key', Global.userDetails.access_token);
    timeout(
      10000,
      fetch(constants.baseUrl + constants.api.sendMessages, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          //'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Global.userDetails.access_token}`,
        },
        body: JSON.stringify(data),
      }),
    )
      .then(processResponse)
      .then((res) => {
        const {responseCode, responseJson} = res;
        console.log(
          'response',
          responseCode + '' + JSON.stringify(responseJson),
        );
        if (responseCode === 200) {
          if (responseJson.success == 'true') {
            var data = responseJson.data;
            sendMessage(data,'image');
          } else {
            console.log('message-api-error', responseJson.message);
          }
        } else if(responseCode === 401) {
          props.navigation.reset({
            index: 0,
            routes: [{name: 'SignIn'}],
          });
        } else {
          if (responseJson.hasOwnProperty('message')) {
            console.log('message-error:', responseJson.message);
          } else {
            var key;
            var secondKey;
            for (var k in responseJson) {
              key = k;
              break;
            }
            for (var k in responseJson[key]) {
              secondKey = k;
              break;
            }
            console.log('message-error:', responseJson[key][secondKey][0]);
          }
        }
      })
      .catch((err) => {
        console.log('message-exception', err.message);
      });
  };

  const BubbleView = (props) => {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: Colors.white,
          },
          left: {
            color: Colors.white,
          },
        }}
        wrapperStyle={{
          left: {
            backgroundColor: Colors.appLightGreen,
            //borderRadius: 0,
          },
          right: {
            backgroundColor: Colors.appDarkGreen,
            //borderRadius: 0,
          },
        }}
      />
    );
  };

  const TimeView = (props) => {
    return (
      <View>
        <Text
          style={{
            fontSize: 10,
            color: Colors.white,
            paddingHorizontal: 10,
            paddingBottom: 5,
          }}>
          {Moment(props.currentMessage.createdAt).format('hh:mm A')}
        </Text>
      </View>
    );
  };

  const LoaderView = (props) => {
    return (
      <ActivityIndicator
        size={'large'}
        color={Colors.theme}
        style={styles.loaderStyle}
      />
    );
  };

  const InputView = (props) => {
    return (
      <View
        style={{
          height: 60,
          paddingBottom: 15,
          backgroundColor: Colors.white,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          onPress={() => {
            //selectPhoto();
            firebaseSvc.sendImageMessage(
              'https://i.imgur.com/eYsCWCF.png',
              user,
            );
            sendMessage('https://i.imgur.com/eYsCWCF.png', 'image');
          }}>
          <Image
            source={require('../../Assets/Images/cameraChat.png')}
            style={{
              height: 30,
              width: 25,
              marginHorizontal: 15,
            }}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
        <TextInput
          style={{
            flex: 1,
            height: 35,
            alignSelf: 'center',
            borderColor: Colors.steelGray,
            borderWidth: 0.7,
            backgroundColor: Colors.paleGray,
            fontSize: 14,
            paddingStart: 10,
          }}
          placeholder={I18n.t('enterMessage')}
          defaultValue={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity
          onPress={() => {
            // firebaseSvc.sendImageMessage(
            //   'https://i.imgur.com/eYsCWCF.png',
            //   user,
            // );
            if (inputText.length != 0) {
              firebaseSvc.sendSingleMessage(inputText, user);
              sendMessage(inputText, 'text');
              setInputText('');
            } else {
              toast.current.show(I18n.t('pleaseEnterText'), 2000, () => {});
            }
          }}>
          <Image
            source={require('../../Assets/Images/sendIcon.png')}
            style={{
              height: 30,
              width: 25,
              marginHorizontal: 10,
            }}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.viewcontainer}>
      <CustomStatusBar color={Colors.theme} />
      <View style={styles.headerRowStyle}>
        <TouchableOpacity
          style={styles.backImageBack}
          activeOpacity={0.8}
          onPress={() => {
            Keyboard.dismiss();
            props.navigation.goBack();
          }}>
          <Image
            style={styles.backImageStyle}
            source={require('../../Assets/Images/back.png')}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
        <Text style={styles.titleText}>{I18n.t('chat')}</Text>
        <TouchableOpacity style={styles.backImageBack} />
      </View>
      <View style={styles.viewStyle}>
        <GiftedChat
          keyboardShouldPersistTaps="handled"
          user={user}
          messages={messages}
          alwaysShowSend={true}
          showUserAvatar={true}
          renderAvatarOnTop={true}
          onSend={(messages) => {
            firebaseSvc.sendMessage(messages);
            sendMessage(inputText, 'text');
          }}
          onInputTextChanged={setInputText}
          renderLoading={LoaderView}
          renderBubble={BubbleView}
          renderTime={TimeView}
          renderInputToolbar={InputView}
        />
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
    </SafeAreaView>
  );
};

export default ChatScreen;
