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

export default function LoadHTMLFormRevision(params) {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const [location, setLocation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  /*  const [url, setUrl] = useState("221183077598363"); */

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      console.log("FOCUS");
      async function fetchData() {
        // You can await here
        // setZonas(sistema);
        await MustLogout(navigation);
      }

      fetchData();

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions

        // Guardamos info en localStorage de search, selectedFamily y selectedFormat
        if (params.route.params.asset.serial_number == "task") {
          navigation.pop(1);
        }
      };
    }, [])
  );

  useEffect(() => {
    displayData();
  }, []);

  var displayData = async () => {
    try {
      setTimeout(async () => {
        setIsLoading(true);
        let userDataItem = await AsyncStorage.getItem("userData");
        setUserData(JSON.parse(userDataItem));

        console.log("ASSET:: ", params.route.params.asset);

        console.log("USER::  ", JSON.parse(userDataItem));

        let loc = await GetLocation();
        setLocation(loc);

        if (loc.coords) {
          console.log(params.route.params.asset.url_form);
          console.log(
            "?revisadoPor[first]=" +
              JSON.parse(userDataItem).name +
              "&revisadoPor[last]=" +
              JSON.parse(userDataItem).surname +
              "&asset_id=" +
              params.route.params.asset.object.id +
              "&asset_name=" +
              params.route.params.asset.name +
              "&asset_ns=" +
              params.route.params.asset.serial_number +
              "&latitude=" +
              loc.coords.latitude +
              "&longitude=" +
              loc.coords.longitude +
              "&company=" +
              JSON.parse(userDataItem).clients[0].name +
              /*   "&name[first]=" +
              JSON.parse(userDataItem).name +
              "&name[last]=" +
              JSON.parse(userDataItem).surname + */
              "&next_review_date[day]=" +
              new Date().getDate() +
              "&next_review_date[month]=" +
              (new Date().getMonth() + 1) +
              "&next_review_date[year]=" +
              (new Date().getFullYear() + 1) +
              /*     "&user_id=" +
              JSON.parse(userDataItem).id + */
              "&asset_manufacturing=" +
              (new Date().getFullYear() - 1) +
              "&fechaUtilizacion=" +
              params.route.params.asset.fecha_compra +
              "&buy_date=" +
              params.route.params.asset.fecha_compra +
              "&user=" +
              JSON.parse(userDataItem).id
          );
        } else {
          console.log("NO");
        }

        /*  let loc = await AsyncStorage.getItem("locationStorage");
        loc = JSON.parse(loc);
        setLocation(loc);

        console.log("NUEVALOC::", loc);

        if (loc.coords) {
          console.log(params.route.params);
          console.log(params.route.params.asset.url_form);
          console.log(
            "?revisadoPor[first]=" +
              JSON.parse(userDataItem).name +
              "&revisadoPor[last]=" +
              JSON.parse(userDataItem).surname +
              "&asset_id=" +
              params.route.params.asset.object.id +
              "&asset_name=" +
              params.route.params.asset.name +
              "&latitude=" +
              loc.coords.latitude +
              "&longitude=" +
              loc.coords.longitude +
              "&next_review_date[day]=" +
              new Date().getDate() +
              "&next_review_date[month]=" +
              (new Date().getMonth() + 1) +
              "&next_review_date[year]=" +
              (new Date().getFullYear() + 1) +
              "&user=" +
              JSON.parse(userDataItem).id
          );
        } else {
          console.log("NO");
          console.log("LOCATION::1 ");

          let { status } = await Location.requestForegroundPermissionsAsync();

          if (status !== "granted") {
            console.log("LOCATION:: Permission to access location was denied");
            setIsLoading(false);
            return;
          }
          loc = await Location.getCurrentPositionAsync();

          console.log("LOCATION:: ");
          setLocation(loc);
        } */

        /*    if (!loc || loc.length == 0) {
        
        } */

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
              params.route.params.asset.url_form +
              "?revisadoPor[first]=" +
              userData.name +
              "&revisadoPor[last]=" +
              userData.surname +
              "&asset_id=" +
              params.route.params.asset.object.id +
              "&asset_name=" +
              params.route.params.asset.name +
              "&asset_ns=" +
              (params.route.params.asset.serial_number
                ? params.route.params.asset.serial_number
                : params.route.params.asset.object.data.serial_number) +
              "&latitude=" +
              location.coords.latitude +
              "&longitude=" +
              location.coords.longitude +
              "&company=" +
              userData.clients[0].name +
              "&name[first]=" +
              "Mon" +
              "&name[last]=" +
              "Vertical" +
              "&next_review_date[day]=" +
              new Date().getDate() +
              "&next_review_date[month]=" +
              (new Date().getMonth() + 1) +
              "&next_review_date[year]=" +
              (new Date().getFullYear() + 1) +
              "&asset_manufacturing=" +
              (new Date().getFullYear() - 1) +
              "&fechaUtilizacion[day]=" +
              "25/1/2022".split("/")[0] +
              "&fechaUtilizacion[month]=" +
              "25/1/2022".split("/")[1] +
              "&fechaUtilizacion[year]=" +
              "25/1/2022".split("/")[2] +
              "&buy_date[day]=" +
              "25/1/2022".split("/")[0] +
              "&buy_date[month]=" +
              "25/1/2022".split("/")[1] +
              "&buy_date[year]=" +
              "25/1/2022".split("/")[2] +
              "&user=" +
              userData.id,
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
