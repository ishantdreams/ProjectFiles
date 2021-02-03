import React from 'react';
import {StyleSheet} from 'react-native';
import Fonts from '../../Utils/Fonts';
import Colors from '../../Utils/Colors';

const Styles = StyleSheet.create({
  txtEnterCode: {
    marginTop: 30,
    marginHorizontal: 20,
    fontSize: 15.5,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.black,
  },
  txtEnterSixDigitCode: {
    marginHorizontal: 20,
    marginTop: 5,
    fontSize: 11.5,
    fontFamily: Fonts.PoppinsRegular,
    color: Colors.black,
  },
  tfContainerStyle:{marginHorizontal: 16, marginTop: 10},
  txtFieldLabelStyle: {fontSize: 13.5, fontFamily: Fonts.PoppinsRegular},
  btnTextSignin: {
    color: Colors.appDarkGreen,
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  noAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtNoAccount: {
    color: Colors.black,
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
  },
  btnSignup: {
    marginLeft: 5,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtSignup: {
    color: Colors.appDarkGreen,
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
    marginTop: 25,
    height: 50,
    marginBottom: 30,
    backgroundColor: Colors.paleGray,
  },
  txtLoginVia:{
    color: Colors.appDuskBlue,
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  btnSocial:{
    marginLeft: 5,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtTermsAndCond:{
    color: Colors.black,
    marginTop: 20,
    fontSize: 8,
    fontFamily: Fonts.PoppinsRegular,
    opacity: 0.5,
    alignSelf: 'center',
    marginBottom: 30,
  },
  otpViewStyle: {
    width: '80%',
    height: 50,
    marginTop: 40,
    alignSelf: 'center',
  },
  underlineStyleBase: {
    width: 45,
    height: 50,
    borderWidth: 1,
    color: Colors.white,
    backgroundColor: Colors.appLightGreen,
    fontSize: 22,
    fontFamily: Fonts.PoppinsBold,
    borderRadius:5,
  },
  underlineStyleHighLighted: {
    borderColor: Colors.appLightGreen,
    tintColor: Colors.white,
  },
  btnNext: {
    height: 60,
    marginTop: 30,
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
  }
});

export default Styles;
