import {StyleSheet, Dimensions, Platform} from 'react-native';
import Colors from '../../Utils/Colors';
import Fonts from '../../Utils/Fonts';

const IS_IOS = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';
const {width: viewportWidth, height: viewportHeight} = Dimensions.get('window');

export default StyleSheet.create({
  viewcontainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerRowStyle: {
    flexDirection: 'row',
    height: IS_IOS ? 44 : 55,
    backgroundColor: Colors.white,
  },
  backImageBack: {
    height: 30,
    width: 30,
    marginHorizontal: 15,
    backgroundColor: 'transparent',
    borderRadius: 20,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  // backImageStyle: {
  //   height: 20,
  //   width: 20,
  //   alignSelf: 'center',
  //   tintColor: Colors.white,
  // },
  backImageStyle: {
    height: 30,
    width: 30,
    marginLeft: 20,
    alignSelf: 'center',
  },
  titleText: {
    flex: 1,
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.black,
  },
  viewStyle: {
    flex: 1,
    backgroundColor: Colors.paleGray,
    justifyContent: 'center',
  },

  loaderStyle: {
    flex: 1,
    color: Colors.appDuskBlue,
    justifyContent: 'center',
  },
});
