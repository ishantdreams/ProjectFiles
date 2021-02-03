import React from 'react';
import {StyleSheet, TouchableOpacity, Text} from 'react-native';
import Fonts from '../../Utils/Fonts';
import Colors from '../../Utils/Colors';

const Styles = StyleSheet.create({
  banner: {height: 320, width: '100%'},
  txtSignin: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.black,
    textAlign: 'center',
    flex:1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
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
    backgroundColor: Colors.paleGray,
  },
  btnSignin: {
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
  },
  txtLoginVia: {
    color: Colors.appDuskBlue,
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  btnSocial: {
    marginLeft: 5,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtTermsAndCond: {
    color: Colors.black,
    marginTop: 20,
    fontSize: 8,
    fontFamily: Fonts.PoppinsRegular,
    opacity: 0.5,
    alignSelf: 'center',
    marginBottom: 30,
  },
});

export default Styles;
