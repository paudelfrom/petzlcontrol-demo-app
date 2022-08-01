import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { ListItem, List, Button } from "react-native-elements";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";
import { BASEPATH, BASEPATHETIQUETAS } from "../../utils/constants";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Loading from "../../components/LoadingSpinner";
import Toast from "react-native-easy-toast";
import { COLORS } from "../../utils/colors";
import axios from "../../components/Auth/axiosApiInstance";
import { Icon, Divider } from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import basic react native components
import { BottomSheet } from "react-native-btr";
import Layout from "../../utils/Layout";

export default function ScannerList(params) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [session, setSession] = useState({});
  const [barcodesList, setBarcodesList] = useState([]);
  const [extraData, setExtraData] = React.useState(new Date());

  const navigation = useNavigation();

  const [arrayAssets, setArrayAssets] = useState([]);

  const [activosNoEncontrados, setActivosNoEncontrados] = useState([]);

  useEffect(() => {
    (async () => {
      // You can await here
      let userDataItem = await AsyncStorage.getItem("userData");
      setUserData(JSON.parse(userDataItem));

      let sessionItem = await AsyncStorage.getItem("token");
      setSession(JSON.parse(sessionItem));
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      var activos = [];
      params.route.params.objects.forEach((objeto) => {
        if (objeto.type == "asset") {
          activos.push(objeto.object);
        }
      });
      console.log("ASSETS:: ", activos);
      setArrayAssets(activos);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        console.log("FOCUS");

        // Guardamos info en localStorage de search, selectedFamily y selectedFormat
        console.log("UNFOCUS");
        setBarcodesList([]);
        setExtraData(new Date());
        setScanned(true);
      };
    }, [])
  );

  const handleBarCodeScanned = async ({ type, data }) => {
    if (!barcodesList.includes(data)) {
      console.log(type);
      console.log(data);

      var br = barcodesList;

      br.unshift(data);
      setBarcodesList(br);
      setExtraData(new Date());
    }
  };

  const handleBarCodeScannedTask = async ({ type, data }) => {
    console.log("DATA: ", data);
    console.log("ESCANEADO: ", arrayAssets);

    var elementoEncontrado = [];

    arrayAssets.forEach((element) => {
      if (element.tag.code == data) {
        elementoEncontrado = element;
      }
    });

    console.log("elementoEncontrado: ", elementoEncontrado);

    if (
      elementoEncontrado.length == 0 &&
      !activosNoEncontrados.includes(data)
    ) {
      activosNoEncontrados.push(data);
      alert(`Este equipo no está asignado a la tarea`);
    } else if (elementoEncontrado) {
      var objeto = elementoEncontrado;

      var obj = {};
      obj.id = objeto.id;

      objeto.object = obj;

      objeto.serial_number = "task";
      // objeto.data = objeto;

      if (!barcodesList.includes(data)) {
        console.log(type);
        console.log(objeto);

        var br = barcodesList;

        br.unshift(objeto.tag.code);
        setBarcodesList(br);
        setExtraData(new Date());
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  function deleteItem(item) {
    console.log(item);
    var br = barcodesList;
    br.splice(br.indexOf(item), 1);
    setBarcodesList(br);
    console.log(barcodesList);
    setExtraData(new Date());
  }

  async function getAssets() {
    console.log(barcodesList);
    //get assets por array codes

    var requestURL = BASEPATH + "/api/events/assign/epi/tags";

    setIsLoading(true);

    var formdata = new FormData();
    formdata.append("user_id", "5");
    barcodesList.forEach((element) => {
      formdata.append("codes[]", element);
    });

    var config = {
      method: "post",
      url: requestURL,
      headers: {
        accept: "*/*",
      },
      data: formdata,
    };
    console.log(requestURL);
    console.log(formdata);
    await axios(config)
      .then((response2) => {
        console.log("RESP CLIENTS");
        if (response2.status === 200) {
          console.log("OK");
          setIsLoading(false);
          var arr = response2.data;

          arr.forEach((element) => {
            element.nameevent = "delivery_epi";
          });

          console.log(arr);
          setIsLoading(false);
          //enviamos a formulario entrega
          navigation.navigate("loadhtmlformentrega", {
            arrayAssets: arr,
          });
        } else {
          setIsLoading(false);
          console.error("ERROR ELSE");
          console.error(response2.status);
        }
      })
      .catch((error) => {
        // Error
        setIsLoading(false);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          //
          if (error.response.status == 400) {
            console.log(error.response.data.error);
            alert(
              `Error con la etiqueta ${error.response.data.error.code}: ${error.response.data.error.error}`
            );
          }
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the
          // browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        //   console.log(error.config);
      });
  }

  function Item(props) {
    var { item, navigation } = props;
    item = item.item;
    console.log(item);
    return (
      <TouchableOpacity style={styles.item} onPress={() => deleteItem(item)}>
        <View
          style={{
            height: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Icon
            style={styles.itemIcon}
            type="material-community"
            name="barcode-scan"
            size={30}
          ></Icon>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              width: "50%",
              paddingLeft: 10,
            }}
          >
            <Text style={styles.textoTarea}>{item}</Text>
          </View>
          <Icon
            style={styles.itemIcon}
            type="material-community"
            name="delete"
            size={30}
          ></Icon>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Loading
        isVisible={isLoading}
        text={"Cargando"}
        backgroundColor={COLORS.primary}
      ></Loading>

      <View style={styles.container}>
        <Camera
          onBarCodeScanned={
            arrayAssets.length > 0
              ? handleBarCodeScannedTask
              : handleBarCodeScanned
          }
          barCodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
          }}
          style={{ flex: 2 }}
        />
        {barcodesList.length > 0 ? (
          <View style={{ flex: 1 }}>
            <FlatList
              data={barcodesList}
              key={barcodesList.length}
              renderItem={(item) => (
                <Item item={item} navigation={navigation} />
              )}
              keyExtractor={(item, index) => item}
              extraData={extraData}
              contentContainerStyle={{ paddingBottom: 0 }}
            ></FlatList>
            <View style={{ height: 80 }}>
              <Button
                title="Siguiente"
                buttonStyle={{
                  borderColor: "transparent",
                }}
                type="outline"
                titleStyle={{ color: COLORS.primary }}
                containerStyle={{
                  margin: 5,
                }}
                onPress={() => {
                  getAssets();
                }}
              />
            </View>
          </View>
        ) : (
          <></>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  contentContainer: {
    backgroundColor: "#fff",
    height: 400,
    padding: 20,
  },
  item: {
    backgroundColor: "white",
    flex: 1,
    padding: 10,
    marginHorizontal: 24,
    marginTop: 9,
    height: 55,
  },
  textoTarea: {
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: 16,
    lineHeight: 19,
    textAlign: "left",
    width: "100%",
    color: "#474952",
    paddingLeft: 24,
  },
  itemIcon: {
    height: "100%",
    width: "100%",
    justifyContent: "center", //Centered horizontally
    alignItems: "center", //Centered vertically
    flex: 1,
  },
  viewFamily: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  textFamily: {
    color: COLORS.greyDark,
  },
  textCodArt: {
    color: COLORS.foreground,
  },
  titleText: {
    marginBottom: 20,
    fontSize: 18,
  },
  divider: {
    backgroundColor: "#C0C0C0",
    width: Layout.window.width - 60,
    marginTop: 20,
  },

  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 15,
    padding: 10,
    marginHorizontal: 24,
    marginTop: 9,
    height: 50,
  },
  textoTarea: {
    height: "100%",

    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 14,
    lineHeight: 17,
    justifyContent: "center", //Centered horizontally
    alignItems: "center", //Centered vertically
    flex: 1,
    color: "#474952",
  },
  itemIcon: {
    height: "100%",
    width: "100%",
    justifyContent: "center", //Centered horizontally
    alignItems: "center", //Centered vertically
    flex: 1,
  },
  btnContainer: {
    padding: 8,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
});
