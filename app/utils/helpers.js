import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  SectionList,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { SearchBar, ListItem, Icon, Text, Button } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

export async function MustLogout(navigation) {
  var udi = await AsyncStorage.getItem("userData");
  console.log("UDI:: ", udi);
  if (!udi) {
    console.log("LOGOUT NO UDI");
    try {
      clearAllData(navigation);
    } catch (error) {
      alert(error);
    }
  }
  var ud = JSON.parse(udi);
  if (ud.pw === undefined) {
    console.log("LOGOUT NO UD");
    console.log(ud);
    try {
      clearAllData(navigation);
    } catch (error) {
      alert(error);
    }
  } else {
    console.log("NO LOGOUT");
  }
}
async function clearAllData(navigation) {
  AsyncStorage.getAllKeys()
    .then((keys) => {
      keys.forEach(async (key) => {
        console.log("KEY: ", key);
        if (key != "language") {
          await AsyncStorage.removeItem(key);
        }
      });
    })
    .then(() => {
      console.log("BORRANDO DATOS");
      navigation.replace("Auth");
    });
}

async function GetLocation() {
  let loc = await AsyncStorage.getItem("locationStorage");
  loc = JSON.parse(loc);
  setLocation(loc);

  console.log("NUEVALOC::", loc);

  if (loc.coords) {
    return loc;
  } else {
    console.log("NO");
    console.log("LOCATION::1 ");

    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("LOCATION:: Permission to access location was denied");
      return;
    }
    loc = await Location.getCurrentPositionAsync();

    console.log("LOCATION:: ");
    // setLocation(loc);

    return loc;
  }
}
