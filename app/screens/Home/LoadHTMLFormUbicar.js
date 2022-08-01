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

export default function LoadHTMLFormUbicar(params) {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const [location, setLocation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [arrayLocations, setArrayLocations] = useState([]);
  const [locationSelect, setLocationSelect] = useState("");
  const [urlForm, setUrlForm] = useState(
    "https://form.jotform.com/221491688496370"
  );

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused

      console.log("FOCUS:: ", params.route.params);
      async function fetchData() {
        // You can await here
        // setZonas(sistema);
        await MustLogout(navigation);
        loadEvent();
        loadLocations();
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

  async function loadHtml(usuario) {
    displayData(usuario);
  }

  async function loadEvent() {
    console.log("EVENT:: ", params.route.params);
    var requestURL = BASEPATH + "/api/events/search/locate_asset";
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

  async function loadLocations() {
    let userDataItem = await AsyncStorage.getItem("userData");
    setUserData(JSON.parse(userDataItem));

    var usuario = JSON.parse(userDataItem);

    console.log("USER:: ", JSON.parse(userDataItem));

    //setIsLoading(true);

    var requestURL = BASEPATH + "/api/locations/list";
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
        id_client: usuario.clients[0].id,
        per_page: 200,
      },
    };
    await axios(config)
      .then((response) => {
        console.log("RESP CLIENTS");

        if (response.status === 200) {
          console.log("OK");
          //    console.log(response);
          response = response.data.data;
          //console.log(response);

          console.log(response);
          var locs = [];
          response.forEach((element) => {
            locs.push({
              label: element.name,
              value: element,
              loc: element,
            });
          });
          locs.push({
            label: "Activo en uso. Ubicar en mapa",
            value: {
              id: 0,
              name: "Activo en uso. Ubicar en mapa",
              client: {
                id: usuario.clients[0].id,
                name: usuario.clients[0].name,
              },
            },
            loc: {
              id: 0,
              name: "Activo en uso. Ubicar en mapa",
              client: {
                id: usuario.clients[0].id,
                name: usuario.clients[0].name,
              },
            },
          });
          setArrayLocations(locs);
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

  /*  useEffect(() => {
    displayData();
  }, []); */

  var displayData = async () => {
    try {
      setTimeout(async () => {
        setIsLoading(true);
        let userDataItem = await AsyncStorage.getItem("userData");
        setUserData(JSON.parse(userDataItem));

        console.log(userData);

        console.log("LOCATION::1 ");

        /*    let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("LOCATION:: Permission to access location was denied");
          setIsLoading(false);
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        console.log("LOCATION:: ", loc);
        setLocation(loc); */

        let loc = await GetLocation();
        setLocation(loc);

        console.log("NUEVALOC::", loc);

        if (loc.coords) {
          console.log(
            urlForm +
              "?asset_id=" +
              params.route.params.asset.object.id +
              "&asset_name=" +
              params.route.params.asset.name +
              "&latitude=" +
              loc.coords.latitude +
              "&longitude=" +
              loc.coords.longitude +
              "&user=" +
              userData.id
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

  function Item(props) {
    var { item, navigation } = props;
    item = item.item;
    console.log(item);
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          setLocationSelect(item.value);
          loadHtml(item.value);

          console.log(
            urlForm +
              "?asset_id=" +
              params.route.params.asset.object.id +
              "&asset_name=" +
              params.route.params.asset.name +
              "&latitude=" +
              location.coords +
              "&longitude=" +
              location.coords +
              "&localizacion_id=" +
              item.value.id +
              "&localizacion_name=" +
              item.value.name +
              "&user=" +
              userData.id
          );
        }}
      >
        <View style={styles.listItem}>
          <Icon
            type="material-community"
            name={item.loc.id == 0 ? "map-marker-check" : "home-variant"}
            size={30}
            color="black"
          />
          <View
            style={{
              alignItems: "center",
              textAlign: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      {location.coords && locationSelect != "" ? (
        <WebView
          source={{
            uri:
              urlForm +
              "?asset_id=" +
              params.route.params.asset.object.id +
              "&asset_name=" +
              params.route.params.asset.name +
              "&latitude=" +
              location.coords.latitude +
              "&longitude=" +
              location.coords.longitude +
              "&localizacion_id=" +
              locationSelect.id +
              "&localizacion_name=" +
              locationSelect.name +
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
        <View style={{ padding: 20 }}>
          <Text h4 style={{ marginBottom: 20 }}>
            Seleccione una localización:
          </Text>
          <FlatList
            data={arrayLocations}
            renderItem={(item) => <Item item={item} navigation={navigation} />}
            keyExtractor={(item, index) => index.toString()}
            extraData={arrayLocations}
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
    flex: 1,
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: 5,
    width: "80%",
  },
});
