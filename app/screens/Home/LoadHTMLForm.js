import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import {
  SearchBar,
  ListItem,
  Icon,
  BottomSheet,
  Text,
  Button,
} from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProducts } from "../../utils/api";
import { BASEPATH } from "../../utils/constants";
import Loading from "../../components/LoadingSpinner";
import Toast from "react-native-easy-toast";
import { COLORS } from "../../utils/colors";
import { ScrollView } from "react-native-gesture-handler";
import i18n from "../../../i18n";
import moment from "moment";
import axios from "../../components/Auth/axiosApiInstance";
import WebView from "react-native-webview";

export default function TaskInfo(params) {
  const navigation = useNavigation();

  useEffect(async () => {}, []);

  const { width } = useWindowDimensions();

  function onMessage(event) {
    console.log(event);
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <WebView
        source={{
          uri: "https://form.jotform.com/220443940925051?codigoQr=SQ234234",
        }}
        style={{ flex: 1 }}
        scalesPageToFit={Platform.OS === "ios" ? false : true}
        originWhitelist={["*"]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={(m) => onMessage(m.nativeEvent.data)}
        allowsInlineMediaPlayback={true}
      />
    </SafeAreaProvider>
  );
}
