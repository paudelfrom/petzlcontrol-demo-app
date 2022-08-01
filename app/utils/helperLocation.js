import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  SectionList,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

import * as Location from "expo-location";

export async function GetLocation() {
  let loc = await AsyncStorage.getItem("locationStorage");

  if (loc != null) {
    loc = JSON.parse(loc);

    console.log("NUEVALOC::", loc);
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
