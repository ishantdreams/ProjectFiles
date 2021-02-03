import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  FlatList,
  Switch,
  Platform,
  Dimensions,
} from 'react-native';
import {TextField} from 'react-native-material-textfield';
import {ActivityIndicator, FAB} from 'react-native-paper';
import ActionButton from 'react-native-action-button';
import Toast, {DURATION} from 'react-native-easy-toast';
import {useFocusEffect} from '@react-navigation/native';
import Moment from 'moment';

import Colors from '../../Utils/Colors';
import Fonts from '../../Utils/Fonts';
import I18n from '../../Config/i18n';
import Styles from './Styles';
import Constants from '../../Config/Constants';
import {Loader} from '../../Components/Loader';
import CustomStatusBar from '../../Components/CustomStatusBar';
import Global from '../../Config/Global';
import Indicator from '../../Components/Indicator';
import NotFoundError from '../../Components/NotFoundError';
import NetworkError from '../../Components/NetworkError';
import ServerError from '../../Components/ServerError';


const {width, height} = Dimensions.get('window');

const NewsFeed = (props) => {
  const [loader, setLoader] = useState(false);
  const [newsFeedArr, setNewsFeedArr] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [statusCode, setStatusCode] = useState(null);

  const toastRef = useRef(null);

  // useEffect(() => {
  //   console.warn('Chat');
  // }, []);

  useFocusEffect(
    React.useCallback(() => {
      hitAllNewsFeedApi();
    }, []),
  );

  //******************** Hit All News Feed Api *******************
  hitAllNewsFeedApi = async () => {
    setLoader(true);
    console.log('url - ', Constants.baseUrl + Constants.api.allNewsFeed);

    let params = {
      page: 0,
    };

    try {
      let response = await fetch(
        Constants.baseUrl + Constants.api.allNewsFeed,
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
      console.log('upcoming ResponseJson - ', responseJson);

      if (response.status === 200) {
        setStatusCode(200)
        console.log('notification data - ', responseJson);
        if (responseJson.success === 'true') {
          setNewsFeedArr(responseJson.data);
        }
        //dispatch(addUser(responseJson));

        // toastRef.current.show('Successfully Signed in', 2000, () => {});
      } else if (response.status === 401) {
        // removeData('userData');
        setStatusCode(401);
        console.log('error - ', responseJson);
        props.navigation.reset({
          index: 0,
          routes: [{name: 'SignIn'}],
        });
      } else if (response.status === 404) {
        setStatusCode(404);
      } else if (response.status === 500) {
        setStatusCode(500);
      } else {
        console.log('error - ', responseJson);
        setStatusCode(599)
      }
    } catch (error) {
      setStatusCode(599)
      setLoader(false);
    }
  };

  //******************** Hit Add LIke Api *******************
  hitAddNewsFeedLikeApi = async (id) => {
    setLoader(true);
    console.log('url - ', Constants.baseUrl + Constants.api.newsFeedLike);

    let param = {
      news_feed_id: id,
    };

    console.warn('param - ', param);

    try {
      let response = await fetch(
        Constants.baseUrl + Constants.api.newsFeedLike,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + Global.userDetails.access_token,
          },
          body: JSON.stringify(param),
        },
      );

      setLoader(false);
      let responseJson = await response.json();
      console.log('upcoming ResponseJson - ', response.status);

      if (response.status === 200) {
        console.log('ResponseJson data - ', responseJson.message);
        setStatusCode(200)
        toastRef.current.show(responseJson.message, 2000);
        hitAllNewsFeedApi();
      } else if (response.status === 401) {
        setStatusCode(401);
        console.log('error - ', responseJson);
        props.navigation.reset({
          index: 0,
          routes: [{name: 'SignIn'}],
        });
      } else if (response.status === 404) {
        setStatusCode(404);
      } else if (response.status === 500) {
        setStatusCode(500);
      } else {
        console.log('error - ', responseJson);
        setStatusCode(599)
      }
    } catch (error) {
      setStatusCode(599)
      setLoader(false);
    }
  };

  onViewableItemsChanged = ({viewableItems, changed}) => {
    console.log('Visible items are', viewableItems);
    console.log('Changed in this iteration', changed[0].index);

    setPageIndex(changed[0].index);
  };

  const handleVieweableItemsChanged = useCallback(({changed}) => {
    setPageIndex(() => {
      let pageIndex = null;
      changed.forEach(({index, isViewable}) => {
        if (index != null && isViewable) {
          pageIndex = index;
        }
      });
      return pageIndex;
    });
  }, []);

  viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50,
  };

  renderRow = (item, index) => {
    return (
      <View
        style={{
          paddingTop: 15,
          backgroundColor: Colors.white,
          marginTop: 5,
          marginBottom: 10,
        }}>
        <View style={{flexDirection: 'row', paddingHorizontal: 15}}>
          <Image
            style={{height: 40, width: 40, marginRight: 10, borderRadius: 20}}
            source={
              item.image !== null && item.image !== ''
                ? {uri: item.profile_image}
                : require('../../Assets/Images/defaultPic.png')
            }
          />
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  fontSize: 13.5,
                  fontFamily: Fonts.PoppinsMedium,
                  color: Colors.black,
                  opacity: 0.9,
                }}>
                {item.name}
                {' in '}
              </Text>
              <Text
                style={{
                  fontSize: 13.5,
                  fontFamily: Fonts.PoppinsMedium,
                  color: Colors.appDarkGreen,
                  opacity: 0.9,
                }}>
                {item.title}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: Fonts.PoppinsMedium,
                color: Colors.steelGray,
                opacity: 0.8,
              }}>
              {Moment(item.created_at).format('DD MMMM, YYYY')}
            </Text>
          </View>
        </View>

        <View
          style={{
            justifyContent: 'center',
            marginTop: 10,
            paddingHorizontal: 15,
          }}>
          <Text
            style={{
              fontSize: 11.5,
              fontFamily: Fonts.PoppinsMedium,
              color: Colors.greyishBrown,
              opacity: 0.8,
            }}>
            {item.content}
          </Text>
        </View>

        <View style={{marginTop: 10}}>
          {
            <FlatList
              style={{flex: 1}}
              data={item.image}
              horizontal
              pagingEnabled={true}
              showsHorizontalScrollIndicator={false}
              bounces={false}
              renderItem={({item}) => {
                return (
                  <View style={{flexDirection: 'row', flex: 1, height: 160}}>
                    <Image
                      style={{
                        height: 160,
                        width: width - 30,
                      }}
                      source={{
                        uri: item !== null && item !== undefined && item.image,
                      }}
                      defaultSource={require('../../Assets/Images/newFeedWall.png')}
                    />
                  </View>
                );
              }}
              keyExtractor={(item, index) => item.toString() + index}
              onViewableItemsChanged={handleVieweableItemsChanged}
              // onScrollEndDrag={(index)=>{
              //   console.log('index after scroll - ', index)
              //   setPageIndex(index.index)
              // }}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={(data, index) => ({
                length: width - 30,
                offset: (width - 30) * index,
                index,
              })}
            />
          }
          <Indicator
            itemCount={item.image.length}
            currentIndex={pageIndex % item.image.length}
            // indicatorStyle={this.props.indicatorStyle}
            indicatorContainerStyle={{
              marginTop: 18,
              position: 'absolute',
              bottom: 10,
              alignSelf: 'center',
            }}
            indicatorActiveColor={Colors.appYellow}
            indicatorInActiveColor={Colors.white}
            indicatorActiveWidth={6}
            // indicatorStyle={{}}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 15,
            height: 30,
            justifyContent: 'space-between',
            borderTopColor: Colors.black20,
            borderTopWidth: 0.5,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              style={{flexDirection: 'row', alignItems: 'center'}}
              onPress={() => {
                hitAddNewsFeedLikeApi(item.id);
              }}>
              <Image
                style={{
                  width: 15,
                  height: 15,
                  //tintColor: item.likes_count === 0 && Colors.steelGray,
                }}
                source={require('../../Assets/Images/like.png')}
                resizeMode={'contain'}
              />
              <Text
                style={{
                  fontSize: 11.5,
                  fontFamily: Fonts.PoppinsMedium,
                  color: Colors.black,
                  opacity: 0.9,
                  marginLeft: 5,
                }}>
                {item.likes_count}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 30,
              }}
              onPress={() => {
                props.navigation.navigate('Comments', {selectedFeed: item.id});
              }}>
              <Image
                style={{width: 15, height: 15}}
                source={require('../../Assets/Images/comment.png')}
                resizeMode={'contain'}
              />
              <Text
                style={{
                  fontSize: 11.5,
                  fontFamily: Fonts.PoppinsMedium,
                  color: Colors.black,
                  marginLeft: 5,
                  opacity: 0.9,
                }}>
                {item.comments_count}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <Image
              style={{width: 10, height: 10}}
              source={require('../../Assets/Images/shareIcon.png')}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: Fonts.PoppinsMedium,
                color: Colors.black,
                marginLeft: 7,
                opacity: 0.9,
              }}>
              {I18n.t('share')}
            </Text>
          </TouchableOpacity>
        </View>
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
        }}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.toggleDrawer();
          }}>
          <Image
            style={{height: 25, marginLeft: 20, width: 25}}
            source={require('../../Assets/Images/menu.png')}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
        <Text style={Styles.txtSignin}>{I18n.t('newsFeed')}</Text>
        <TouchableOpacity>
          <Image
            style={{height: 30, marginLeft: 20, width: 30}}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
      </View>
      {statusCode !== null && statusCode === 200 ? (<View style={{flex: 1, backgroundColor: Colors.paleGray}}>
        {newsFeedArr.length > 0 ? (
          <FlatList
            style={{flex: 1, marginHorizontal: 15, marginTop: 20}}
            data={newsFeedArr}
            showsVerticalScrollIndicator={false}
            bounces={false}
            renderItem={({item, index}) => renderRow(item, index)}
          />
        ) : (
          !loader && (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: Fonts.PoppinsMedium,
                  color: Colors.appDarkGreen,
                }}>
                {I18n.t('noFeedAvailable')}
              </Text>
            </View>
          )
        )}
      </View>) : statusCode !== null && statusCode === 404 ? (
        <NotFoundError
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
        />
      ) : statusCode !== null && statusCode === 500 ? (
        <ServerError
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
        />
      ) : statusCode !== null && (
        <NetworkError
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
        />
      )}

      {statusCode === 200 && <ActionButton
        buttonColor={Colors.appYellow}
        buttonTextStyle={{
          color: Colors.appDarkGreen,
          fontSize: 40,
        }}
        hideShadow={true}
        onPress={() => {
          console.log('hi');
          props.navigation.navigate('Post');
        }}
      />}

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

export default NewsFeed;
