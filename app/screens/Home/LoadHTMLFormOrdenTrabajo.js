import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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
import * as Location from "expo-location";
import { MustLogout } from "../../utils/helpers";
import { GetLocation } from "../../utils/helperLocation";

export default function LoadHTMLFormOrdenTrabajo(params) {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const [location, setLocation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [urlForm, setUrlForm] = useState(
    "https://form.jotform.com/220445681123348"
  );

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      console.log("FOCUS");
      async function fetchData() {
        // You can await here
        // setZonas(sistema);
        await MustLogout(navigation);
        loadEvent();
      }

      fetchData();

      return () => {};
    }, [])
  );

  async function loadEvent() {
    var requestURL = BASEPATH + "/api/events/search/ot";
    console.log(requestURL);

    var config = {
      method: "get",
      url: requestURL,
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        "X-CSRF-TOKEN": "",
      },
    };
    await axios(config)
      .then((response) => {
        console.log("RESP CLIENTS");

        if (response.status === 200) {
          console.log("OK");
          //    console.log(response);
          response = response.data.data;
          //    console.log(response.data);

          setUrlForm(response.url_form);

          console.log(response);
        } else {
          console.error("ERROR ELSE");
          console.error(response.status);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("ERR2");
        console.error(error);
        setIsLoading(false);
      });
  }

  useEffect(() => {
    displayData();
  }, []);

  var displayData = async () => {
    try {
      setTimeout(async () => {
        console.log("ENTRA EN LOADING");
        setIsLoading(true);
        let userDataItem = await AsyncStorage.getItem("userData");
        setUserData(JSON.parse(userDataItem));

        console.log(userData);

        console.log("LOCATIONNN::1 ");

        /*   let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("LOCATION:: Permission to access location was denied");
          setIsLoading(false);
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        console.log("LOCATION:: ", loc);
        setLocation(loc);

        if (loc.coords) {
          console.log(
            urlForm +
              "?latitude=" +
              loc.coords.latitude +
              "&longitude=" +
              loc.coords.longitude +
              "&user=" +
              JSON.parse(userDataItem).id +
              "&task_id=" +
              params.route.params.tarea.id
          );
        } else {
          console.log("NO");
        } */

        let loc = await GetLocation();
        setLocation(loc);

        console.log("NUEVALOC::", loc);

        if (loc.coords) {
          console.log(
            urlForm +
              "?latitude=" +
              loc.coords.latitude +
              "&longitude=" +
              loc.coords.longitude +
              "&user=" +
              JSON.parse(userDataItem).id +
              "&task_id=" +
              params.route.params.tarea.id
          );
        } else {
          console.log("NO");
        }

        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.log(error);
    }
  };

  const { width } = useWindowDimensions();

  console.log(params.route.params.asset);

  function onMessage(event) {
    console.log("CONDE:");
    console.log(event);
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      {location.coords ? (
        <WebView
          source={{
            uri:
              urlForm +
              "?latitude=" +
              location.coords.latitude +
              "&longitude=" +
              location.coords.longitude +
              "&user=" +
              userData.id +
              "&task_id=" +
              params.route.params.tarea.id,
          }}
          style={{ flex: 1 }}
          scalesPageToFit={Platform.OS === "ios" ? false : true}
          originWhitelist={["*"]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(m) => onMessage(m.nativeEvent.data)}
          allowsInlineMediaPlayback={true}
        />
      ) : (
        <></>
      )}

      <Loading
        isVisible={isLoading}
        text={"Cargando"}
        backgroundColor={COLORS.primary}
      ></Loading>
    </SafeAreaProvider>
  );
}
