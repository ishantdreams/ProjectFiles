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
} from 'react-native';
import {TextField} from 'react-native-material-textfield';
import Toast, {DURATION} from 'react-native-easy-toast';
import ImagePicker from 'react-native-image-picker';
import ImagePickerCropper from 'react-native-image-crop-picker';

import Colors from '../../Utils/Colors';
import Fonts from '../../Utils/Fonts';
import i18n from '../../Config/i18n';
import Styles from './Styles';
import Constants from '../../Config/Constants';
import {Loader} from '../../Components/Loader';
import CustomStatusBar from '../../Components/CustomStatusBar';
import CustomBottomBar from '../../Components/CustomBottomBar';
import Global from '../../Config/Global';



const Post = (props) => {
  const [loader, setLoader] = useState(false);
  const [post, setPost] = useState('');
  const [title, setTitle] = useState('');
  const [postImg, setPostImg] = useState([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [statusCode, setStatusCode] = useState(null);

  const toastRef = useRef(null);

  useEffect(() => {
    //hitAddPostApi();
  }, []);

  const options = {
    title: 'Select Image',
    storageOptions: {
      skipBackup: true,
      path: 'images',
      isEditEnabled: false,
    },
    freeStyleCropEnabled: true,
  };

  //******************** Hit addNewsFeed Api *******************
  hitAddNewsFeedApi = async () => {
    setLoader(true);
    console.log('url - ', Constants.baseUrl + Constants.api.addNewsFeed);

    let formData = new FormData();
    formData.append('title', title);
    formData.append('content', post);

    postImg.forEach((item, i) => {
      formData.append('image[]', {
        uri: item,
        type: 'image/jpeg',
        name: `filename${i}.jpg`,
      });
    });

    console.warn('formData - ', formData);

    try {
      let response = await fetch(
        Constants.baseUrl + Constants.api.addNewsFeed,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',//'application/x-www-form-urlencoded',
            Authorization: 'Bearer ' + Global.userDetails.access_token,
          },
          body: formData,
        },
      );

      setLoader(false);
      let responseJson = await response.json();
      console.log('upcoming ResponseJson - ', response.status);

      if (response.status === 200) {
        console.log('notification data - ', responseJson);
        toastRef.current.show(responseJson.message, 2000, () => {
          props.navigation.pop();
        });
        //dispatch(addUser(responseJson));

        // toastRef.current.show('Successfully Signed in', 2000, () => {});
      } else if (response.status === 401) {
        // removeData('userData');
        setStatusCode(401);
        if (responseJson.error !== undefined) {
          let error = responseJson.error;
          if (error.title !== undefined && error.title !== null) {
            toastRef.current.show(error.title, 2000);
          }else if (error.content !== undefined && error.content !== null) {
            toastRef.current.show(error.content, 2000);
          }
        }

        props.navigation.reset({
          index: 0,
          routes: [{name: 'SignIn'}],
        });
      } else if (response.status === 404) {
        // removeData('userData');
        setStatusCode(404);
      } else if (response.status === 500) {
        // removeData('userData');
        setStatusCode(500);
      } else {
        console.log('error - ', responseJson);
        setStatusCode(599)
      }
    } catch (error) {
      setLoader(false);
      setStatusCode(599)
    }
  };

  actionForSelectedOptionInActionSheet = () => {
    console.warn('open Camera');
    ImagePicker.showImagePicker(options, (response) => {
      console.warn('image Path = ', response.uri);

      if (response.didCancel) {
        console.warn('User cancelled image picker');
      } else if (response.error) {
        console.warn('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.warn('User tapped custom button: ', response.customButton);
      } else {
        ImagePickerCropper.openCropper({
          path: response.uri,
          width: 300,
          height: 300,
        }).then((image) => {
          let arr = postImg;
          arr.push('file:///' + image.path);
          setPostImg(arr);
          setRefreshCount(refreshCount + 1);
          // hitUpdateProfilePicApi(image);
          console.log(image.path);
        });
      }
    });
  };

  renderRow = (item, index) => {
    return (
      <View
        style={{
          height: 60,
          marginRight: 10,
          width: 60,
          borderRadius: 5,
          paddingTop: 5,
        }}>
        <Image
          style={{height: 60, width: 60, borderRadius: 5}}
          source={{uri: item}}
          resizeMode={'contain'}
        />
        <TouchableOpacity
          style={{
            height: 20,
            width: 20,
            borderRadius: 10,
            backgroundColor: Colors.appLightGreen,
            position: 'absolute',
            top: 0,
            right: -5,
          }}>
          <Image
            style={{height: 20, width: 20}}
            source={require('../../Assets/Images/close.png')}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
      </View>
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
          borderBottomWidth: 1,
          borderBottomColor: Colors.steelGray,
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
        <Text style={Styles.txtSignin}>{i18n.t('post')}</Text>
        <TouchableOpacity>
          <Image
            style={{height: 30, marginLeft: 20, width: 30}}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
      </View>
      
      {<View style={{flex: 1, backgroundColor: Colors.white}}>
        <TextInput
          style={{
            height: 40,
            marginHorizontal: 20,
            borderWidth: 1,
            borderColor: Colors.steelGray,
            borderRadius: 5,
            marginTop: 20,
            paddingHorizontal: 10,
          }}
          placeholder={'Title'}
          onChangeText={(text) => {
            setTitle(text);
          }}
        />
        <TextInput
          multiline={true}
          style={{
            height: 160,
            marginHorizontal: 20,
            borderWidth: 1,
            borderColor: Colors.steelGray,
            borderRadius: 5,
            marginTop: 20,
            paddingHorizontal: 10,
          }}
          placeholder={i18n.t('description')}
          onChangeText={(text) => {
            setPost(text);
          }}
        />
        <Text
          style={{
            fontSize: 11.5,
            fontFamily: Fonts.PoppinsMedium,
            color: Colors.steel,
            marginHorizontal: 20,
            marginTop: 20,
          }}>
          {i18n.t('addPhoto/video:')}{' '}
        </Text>
        <View
          style={{
            height: 110,
            marginHorizontal: 20,
            borderWidth: 1,
            borderColor: Colors.steelGray,
            borderRadius: 5,
            marginTop: 10,
            paddingHorizontal: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{justifyContent: 'center', alignItems: 'center'}}
            onPress={() => {
              actionForSelectedOptionInActionSheet();
            }}>
            <Image
              style={{height: 30, width: 30}}
              source={require('../../Assets/Images/upload.png')}
              resizeMode={'contain'}
            />
            <Text
              style={{
                fontSize: 10,
                fontFamily: Fonts.PoppinsMedium,
                color: Colors.steel,
                marginHorizontal: 20,
              }}>
              {i18n.t('clickHereToUpload')}
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          style={{flex: 1, marginHorizontal: 20, marginTop: 20}}
          data={postImg}
          horizontal
          bounces={false}
          renderItem={({item, index}) => renderRow(item, index)}
          extraData={refreshCount}
        />
      </View>}

      <TouchableOpacity
        style={{
          height: 60,
          marginBottom: 60,
          marginHorizontal: 35,
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
        onPress={() => {
          hitAddNewsFeedApi();
        }}>
        <Text style={Styles.btnTextSignin}>{i18n.t('upload')}</Text>
      </TouchableOpacity>

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

export default Post;
