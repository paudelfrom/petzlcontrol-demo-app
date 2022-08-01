import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Image,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  KeyboardAvoidingView,
  Linking,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LoginForm from "../../components/Account/LoginForm";
import Toast from "react-native-easy-toast";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../utils/colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Login() {
  const toastRef = useRef();
  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.remove("keyboardDidShow", _keyboardDidShow);
      Keyboard.remove("keyboardDidHide", _keyboardDidHide);
    };
  }, []);
  const [keyboardStatus, setKeyboardStatus] = useState("hidden");
  const _keyboardDidShow = () => {
    setKeyboardStatus("shown");
  };
  const _keyboardDidHide = () => {
    setKeyboardStatus("hidden");
  };

  return Platform.OS === "ios" ? (
    <KeyboardAwareScrollView
      resetScrollToCoords={{ x: 0, y: 0 }}
      extraScrollHeight={50}
      contentContainerStyle={{ flexGrow: 1 }}
      scrollEnabled={false}
    >
      {insideLogin()}
    </KeyboardAwareScrollView>
  ) : (
    <KeyboardAvoidingView
      behavior={"height"}
      style={styles.container}
      /*  keyboardVerticalOffset={100} */
    >
      {insideLogin()}
    </KeyboardAvoidingView>
  );

  function insideLogin() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground style={styles.background}>
          <Image
            resizeMode="contain"
            style={styles.logo}
            source={require("../../../assets/img/logopetzl.png")}
          ></Image>

          <View style={styles.viewContainer}>
            <LoginForm toastRef={toastRef}></LoginForm>
          </View>

          <Toast
            ref={toastRef}
            style={{
              backgroundColor: COLORS.primary,
              width: "100%",
            }}
            textStyle={{ textAlign: "center", color: COLORS.foreground }}
            position="top"
            opacity={0.9}
            positionValue={70}
            fadeInDuration={750}
            fadeOutDuration={1000}
          ></Toast>
        </ImageBackground>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
  },
  background: {
    flex: 1,
    resizeMode: "contain",
    justifyContent: "space-around",
  },
  logo: {
    height: 100,
    width: "100%",
    alignItems: "center",
    /*  backgroundColor: "blue", */
    marginTop: 180,
  },
  viewContainer: {
    /*  flex: 1, */
    height: "60%",
    margin: "10%",
    justifyContent: "center",
    /* backgroundColor: "red", */
    paddingVertical: 30,
  },
  accessProblems: {
    color: COLORS.secondary,
    fontWeight: "bold",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  containerAccess: {
    padding: 16,
    width: "100%",
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
});
