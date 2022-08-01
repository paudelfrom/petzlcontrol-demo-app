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
import RenderHtml, {
  HTMLElementModel,
  HTMLContentModel,
} from "react-native-render-html";

const htmlContent = `
    <h1>VR Lorem ipsum dolor sit amet, consectetur adipiscing elit. !</h1>
    <button onclick="">Click me</button>
    <em>By <b class="author">React Native Master</b></em>
   
    <img src="https://image.freepik.com/free-photo/young-woman-using-vr-glasses-with-neon-lights_155003-17747.jpg" />
    <p>Vivamus bibendum feugiat pretium. <a href="uno">Vestibulum ultricies rutrum ornare</a>. Donec eget suscipit tortor. Nullam pellentesque nibh sagittis, <a href="otro">pharetra quam a</a>, varius sapien. Pellentesque ut leo id mauris hendrerit ultrices et non mauris. Quisque gravida erat at felis tincidunt tincidunt. Etiam sit amet egestas leo. Cras mollis mi sed lorem finibus, interdum molestie magna mollis. Sed venenatis lorem nec magna convallis iaculis.</p>
`;
const renderersProps = {
  a: {
    onPress(event, url, htmlAttribs, target) {
      // Do stuff
      console.log(htmlAttribs);
    },
  },
};

const customHTMLElementModels = {
  button: HTMLElementModel.fromCustomModel({
    tagName: "button",
    mixedUAStyles: {},
    contentModel: HTMLContentModel.block,
  }),
};

export default function TaskInfo(params) {
  const navigation = useNavigation();

  useEffect(async () => {}, []);

  const { width } = useWindowDimensions();

  return (
    <SafeAreaProvider>
      <ScrollView
        style={{ flex: 1, paddingVertical: 20, paddingHorizontal: 20 }}
      >
        <RenderHtml
          /*  html={htmlContent}
          imagesMaxWidth={Dimensions.get("window").width * 0.9}
          staticContentMaxWidth={Dimensions.get("window").width * 0.9} */
          tagsStyles={tagsStyles}
          classesStyles={classesStyles}
          renderersProps={renderersProps}
          source={{ html: htmlContent }}
          contentWidth={width}
          customHTMLElementModels={customHTMLElementModels}
          /*    onLinkPress={(event, url) => {
            //console.log("EVENT: ", event);
            console.log("URL: ", url);
            //Linking.openURL(url);
          }} */
        />
      </ScrollView>
    </SafeAreaProvider>
  );
}

const classesStyles = {
  author: {
    color: "#CA43AC",
  },
};

const tagsStyles = {
  h1: {
    color: "#6728C7",
    textAlign: "center",
    marginBottom: 10,
  },
  img: {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
  },
};
