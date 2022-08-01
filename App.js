import React, { useRef, useState, useEffect } from "react";
import Navigation from "./app/navigations/Navigation";
import { AppLoading, Font } from "expo"; //
import {
  LogBox,
  Platform,
  AppState,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "react-native-elements";
import { COLORS } from "./app/utils/colors";
import { MenuProvider } from "react-native-popup-menu";
import Store from "./app/utils/Store";

import * as Location from "expo-location";
LogBox.ignoreLogs(["Animated: `useNativeDriver`"]);

//import { useFonts } from "@use-expo/font";

const theme = {
  colors: {
    secondary: COLORS.primary,
  },
};

export default function App() {
  /* const [isLoaded] = useFonts({
    "Raleway-Black": require("./assets/fonts/Raleway-Black.ttf"),
  }); */
  const appState = useRef(AppState.currentState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("LOCATION:: Permission to access location was denied");
      return;
    }

    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        console.log("ENTRO EN APPJS");

        loadLoaction();

        appState.current = nextAppState;
        console.log("AppState", appState.current);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  async function loadLoaction() {
    setIsLoading(true);

    console.log("LOCATION::1 ");

    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("LOCATION:: Permission to access location was denied");
      setIsLoading(false);
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    console.log("LOCATION:: ", loc);

    try {
      const jsonValue = JSON.stringify(loc);
      await AsyncStorage.setItem("locationStorage", jsonValue);
    } catch (e) {
      // saving error
      console.log("ERROR AL GUARDAR EL STORAGE ");
    }
  }

  const isLoaded = true;

  if (Platform.OS === "android") {
    // only android needs polyfill
    require("intl"); // import intl object
    require("intl/locale-data/jsonp/de-DE"); // load the required locale details
  }

  if (!isLoaded) {
    return <AppLoading />;
  } else {
    return (
      <Store>
        <ThemeProvider theme={theme}>
          <SafeAreaProvider>
            <MenuProvider>
              <Navigation />
            </MenuProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </Store>
    );
  }
}
