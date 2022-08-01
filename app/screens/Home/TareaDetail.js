import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Divider, Icon, Card, Chip, Button } from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProducts } from "../../utils/api";
import { BASEPATH } from "../../utils/constants";
import Loading from "../../components/LoadingSpinner";
import Toast from "react-native-easy-toast";
import { COLORS } from "../../utils/colors";
import i18n from "../../../i18n";
import moment from "moment";
import axios from "../../components/Auth/axiosApiInstance";
import Layout from "../../utils/Layout";
import * as FileSystem from "expo-file-system";
import { startCase } from "lodash";
import WebView from "react-native-webview";
import { MustLogout } from "../../utils/helpers";

export default function ProductDetail(params) {
  const navigation = useNavigation();
  const [task, setTask] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [userData, setUserData] = useState({ roles: [{ name: "" }] });

  var tarea = params.route.params.tarea;
  console.log("item:: ", tarea);
  console.log("uri:: ", "https://prolianstrace.com/tasks/" + tarea.id);

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused

      async function fetchData() {
        // You can await here
        // setZonas(sistema);
        await MustLogout(navigation);
        console.log("FOCUS");
        setRefresh(!refresh);
      }

      fetchData();
    }, [])
  );

  useEffect(() => {
    setTask(tarea);
    navigation.setOptions({
      title: tarea.name,
    });
    displayData();
  }, []);

  var displayData = async () => {
    try {
      let userDataItem = await AsyncStorage.getItem("userData");
      setUserData(JSON.parse(userDataItem));

      console.log(userData);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{
          uri: "https://prolianstrace.com/tasks/" + task.id,
        }}
        style={{ height: "80%", marginVertical: 20 }}
        scalesPageToFit={Platform.OS === "ios" ? false : true}
        originWhitelist={["*"]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={(m) => onMessage(m.nativeEvent.data)}
        allowsInlineMediaPlayback={true}
        key={refresh}
      />
      {tarea.status.alias == "complete" ? (
        <></>
      ) : (userData.roles[0].name == "prl_cliente" &&
          tarea.event.alias == "review_epi") ||
        tarea.event.alias == "review_asset" ||
        tarea.event.alias == "locate_asset" ||
        tarea.event.alias == "ot" ||
        (userData.roles[0].name == "prl_cliente" &&
          tarea.event.alias == "delivery_epi") ? (
        <View
          style={{
            height: "7%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            title="Finalizar"
            buttonStyle={{
              borderColor: "transparent",
            }}
            type="outline"
            titleStyle={{ color: COLORS.primary }}
            containerStyle={{
              marginLeft: 20,
            }}
            onPress={() => {
              finish();
            }}
            style={{
              justifyContent: "center", //Centered horizontally
              alignItems: "center", //Centered vertically
            }}
          />
          <Button
            title="Siguiente"
            buttonStyle={{
              borderColor: "transparent",
            }}
            type="outline"
            titleStyle={{ color: COLORS.primary }}
            containerStyle={{
              marginRight: 20,
            }}
            onPress={() => {
              start();
            }}
            style={{
              justifyContent: "center", //Centered horizontally
              alignItems: "center", //Centered vertically
            }}
          />
        </View>
      ) : (
        <></>
      )}
    </SafeAreaView>
  );

  function start() {
    if (task.event.alias == "delivery_epi") {
      navigation.navigate("scanlist", {
        objects: task.objects,
      });
    } else if (
      task.event.alias == "review_epi" ||
      task.event.alias == "review_asset"
    ) {
      navigation.navigate("scanreview", {
        objects: task.objects,
      });
    } else if (task.event.alias == "locate_asset") {
      navigation.navigate("scanubicar", {
        objects: task.objects,
      });
    } else if (task.event.alias == "ot") {
      navigation.navigate("loadhtmlformordentrabajo", {
        objects: task.objects,
        tarea: tarea,
      });
    } else {
      navigation.navigate("loadhtmlform");
    }
  }

  async function finish() {
    console.log(task.id);

    var requestURL = BASEPATH + "/api/tasks/finish";
    console.log(requestURL);

    var config = {
      method: "post",
      url: requestURL,
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        "X-CSRF-TOKEN": "",
      },
      data: {
        task_id: task.id,
      },
    };
    await axios(config)
      .then((response) => {
        console.log("RESP CLIENTS");
        navigation.goBack();
      })
      .catch((error) => {
        console.error("ERR2");
        console.error(error);
      });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    /*   position: "relative",
    height: 500,
    alignItems: "center",
    justifyContent: "center", */
  },
  image: {
    /* width: Layout.window.width - 300,
    height: Layout.window.height / 2 - 300, */
    flex: 1,
    borderRadius: 20,
  },
  name: {
    color: "#5E5E5E",
    alignSelf: "flex-start",
  },
  desc: {
    color: "#5E5E5E",
    alignSelf: "flex-start",
    fontSize: 14,
  },
  divider: {
    backgroundColor: "#C0C0C0",
    width: Layout.window.width - 60,
    margin: 20,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  caracteristica: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});
