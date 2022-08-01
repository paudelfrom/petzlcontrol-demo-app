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

export default function LoadHTMLFormEntrega(params) {
  const navigation = useNavigation();
  const [arrayAssets, setArrayAssets] = useState([]);
  const [stringEpis, setStringEpis] = useState("");
  const [location, setLocation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [arrayUsers, setArrayUsers] = useState([]);
  const [workerId, setWorkerId] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [urlForm, setUrlForm] = useState(
    "https://form.jotform.com/221492421061344"
  );

  const [value, setValue] = useState(null);

  /*  useEffect(() => {
    displayData();
  }, []); */

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      console.log("FOCUS:: ", params.route.params);
      async function fetchData() {
        // You can await here
        // setZonas(sistema);
        await MustLogout(navigation);
        loadEvent();
        loadUsers();
      }

      fetchData();

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions

        // Guardamos info en localStorage de search, selectedFamily y selectedFormat
        console.log("UNFOCUS");
        if (params.route.params.arrayAssets[0].serial_number == "task") {
          navigation.pop(1);
        }
      };
    }, [])
  );

  async function loadHtml(usuario) {
    displayData(usuario);
  }

  async function loadEvent() {
    var requestURL =
      BASEPATH +
      "/api/events/search/" +
      params.route.params.arrayAssets[0].nameevent;
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
          console.log("nameevent:: ");
          console.log("RESPONSE:: ", response.data);
          response = response.data.data;
          // console.log("RESPONSE:: ", response.data);

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

  async function loadUsers() {
    let userDataItem = await AsyncStorage.getItem("userData");
    setUserData(JSON.parse(userDataItem));

    var usuario = JSON.parse(userDataItem);

    console.log("USER:: ", JSON.parse(userDataItem));

    //setIsLoading(true);

    var requestURL =
      BASEPATH + "/api/users/operario_cliente/" + usuario.clients[0].id;
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

          console.log(response);
          var usrs = [];
          response.forEach((element) => {
            usrs.push({
              label: element.name + " " + element.surname,
              value:
                "(" + element.id + ") " + element.name + " " + element.surname,
              id: element.id,
              nameCompleto: element.name + " " + element.surname,
              user: element,
            });
          });
          setArrayUsers(usrs);
          console.log("ACABAAAA");
          setIsLoading(false);
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

  var displayData = async (usuario) => {
    try {
      setTimeout(async () => {
        // setIsLoading(true);
        setArrayAssets(params.route.params.arrayAssets);

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

        console.log("LOCATION::1 ", usuario);

        let loc = await GetLocation();
        setLocation(loc);

        console.log("NUEVALOC::", loc);

        if (loc.coords) {
          console.log(
            urlForm +
              "?empresa=" +
              userData.clients[0].name +
              str +
              "&latitude=" +
              loc.coords.latitude +
              "&longitude=" +
              loc.coords.longitude +
              "&user=" +
              userData.id +
              "&trabajador=" +
              usuario +
              "&revisor=" +
              userData.name +
              " " +
              userData.surname
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

  function onMessage(event) {
    console.log("CONDE:");
    console.log(event);
  }

  function Item(props) {
    var { item, navigation } = props;
    item = item.item;
    console.log(item);
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          setValue(item.value);
          loadHtml(item.value);

          setWorkerId(item.id);
          setWorkerName(item.nameCompleto);
        }}
      >
        <View style={styles.listItem}>
          <Image
            source={{ uri: item.user.avatar }}
            style={{ width: 60, height: 60, borderRadius: 30 }}
          />
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ fontWeight: "bold" }}>{item.label}</Text>
            <Text>{item.user.clients[0].name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      {location.coords && workerId != "" ? (
        <WebView
          source={{
            uri:
              urlForm +
              "?empresa=" +
              userData.clients[0].name +
              stringEpis +
              "&latitude=" +
              location.coords.latitude +
              "&longitude=" +
              location.coords.longitude +
              "&user=" +
              userData.id +
              "&user_id=" +
              workerId +
              "&trabajador=" +
              workerName +
              "&revisor=" +
              userData.name +
              " " +
              userData.surname,
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
        <View style={{ padding: 20 }}>
          <Text h4 style={{ marginBottom: 20 }}>
            Seleccione un operario:
          </Text>
          <FlatList
            data={arrayUsers}
            renderItem={(item) => <Item item={item} navigation={navigation} />}
            keyExtractor={(item, index) => index.toString()}
            extraData={arrayUsers}
            contentContainerStyle={{ paddingBottom: 30 }}
          ></FlatList>
        </View>
      )}

      <Loading
        isVisible={isLoading}
        text={"Cargando"}
        backgroundColor={COLORS.primary}
      ></Loading>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  listItem: {
    margin: 10,
    padding: 10,
    backgroundColor: "#FFF",
    width: "80%",
    flex: 1,
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: 5,
  },
});
