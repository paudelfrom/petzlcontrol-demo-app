import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Image,
  Platform,
  NativeModules,
} from "react-native";

import { COLORS } from "../utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SplashScreen = ({ navigation }) => {
  //State for ActivityIndicator animation
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setAnimating(false);

      AsyncStorage.getItem("userData").then((value) => console.log(value));
      AsyncStorage.getItem("userData").then((value) =>
        navigation.replace(value === null ? "Auth" : "App")
      );
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        style={{
          width: "45%",
          resizeMode: "contain",
        }}
        source={require("../../assets/img/logoprolians.png")}
      />
      <ActivityIndicator
        animating={animating}
        color={"white"}
        size="large"
        style={styles.activityIndicator}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.foreground,
  },
  activityIndicator: {
    alignItems: "center",
    height: 80,
  },
});
