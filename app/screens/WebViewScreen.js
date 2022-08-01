import React, { useState } from "react";
import WebView from "react-native-webview";
import { View, StyleSheet, Linking } from "react-native";
import { Button, Icon } from "react-native-elements";
import PDFReader from "rn-pdf-reader-js";
import { useNavigation } from "@react-navigation/native";
import i18n from "../../i18n";

export default function WebViewScreen(params) {
  const navigation = useNavigation();
  console.log(params.route.params);
  var screen = params.route.params;

  console.log("ENTRA WEBVIEW: ", screen.screen);

  return <WebView source={{ uri: screen.screen }} />;
}
