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

export default function LoadHTMLFormEntregaDesdeTarea(params) {
  const navigation = useNavigation();
  const [arrayAssets, setArrayAssets] = useState([]);
  const [stringEpis, setStringEpis] = useState("");

  useEffect(() => {
    displayData();
    return () => {
      // Do something when the screen is unfocused
      // Useful for cleanup functions

      // Guardamos info en localStorage de search, selectedFamily y selectedFormat
      console.log("UNFOCUS");
    };
  }, []);

  var displayData = async () => {
    try {
      setArrayAssets(params.route.params.arrayAssets);

      console.log(params.route.params.arrayAssets);

      var str = "";

      // idTodosEpis=[001,002,003,004,005]
      var idTodosEpis = [];
      params.route.params.arrayAssets.forEach((element) => {
        idTodosEpis.push(element.id);
      });

      str = str + "&assets=" + idTodosEpis;

      for (
        let index = 0;
        index < params.route.params.arrayAssets.length;
        index++
      ) {
        const element = params.route.params.arrayAssets[index];
        str = str + "&epi" + (index + 1) + "=" + element.name;
      }
      setStringEpis(str);

      console.log(
        "https://form.jotform.com/220435407774355?user_id=5&elTrabajador[first]=Juan&elTrabajador[last]=Operario&empresa=Demo&revisor[first]=Paco&revisor[last]=Revisor" +
          str
      );
    } catch (error) {
      console.log(error);
    }
  };

  const { width } = useWindowDimensions();

  function onMessage(event) {
    console.log("CONDE:");
    console.log(event);
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <WebView
        source={{
          uri:
            "https://form.jotform.com/220435407774355?user_id=5&elTrabajador[first]=Juan&elTrabajador[last]=Operario&empresa=Demo&revisor[first]=Paco&revisor[last]=Revisor" +
            stringEpis,
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
