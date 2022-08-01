import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";
import { BASEPATH, BASEPATHETIQUETAS } from "../../utils/constants";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Loading from "../../components/LoadingSpinner";
import Toast from "react-native-easy-toast";
import { COLORS } from "../../utils/colors";
import axios from "../../components/Auth/axiosApiInstance";
import { Icon, Divider, Button } from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import basic react native components
import { BottomSheet } from "react-native-btr";
import Layout from "../../utils/Layout";

export default function ScannerUbicar(params) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [session, setSession] = useState({});
  const [asset, setAsset] = useState({});

  const [tareas, setTareas] = useState([]);

  const navigation = useNavigation();

  const [visible, setVisible] = useState(false);

  const [arrayAssets, setArrayAssets] = useState([]);

  const toggleBottomNavigationView = () => {
    //Toggling the visibility state of the bottom sheet
    if (visible) {
      setTareas([]);
    }
    setVisible(!visible);
  };

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
        setTareas([]);
        setVisible(false);
        setScanned(true);
      };
    }, [])
  );

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);

    console.log(type);
    console.log(data);

    var requestURL = "";
    requestURL = BASEPATH + "/api/tags/search/" + data;

    axios
      .get(requestURL)
      .then((response) => {
        console.log("RESP CLIENTS");
        if (response.status === 200) {
          console.log("OK");

          // console.log("RESPUESTA: ", response.data);

          if (response.data.length == 0) {
            console.log("VACIO");
          } else {
            var objeto = response.data.data;

            objeto.nameevent = "locate_asset";

            //  console.log(objeto);

            if (objeto.type_tag.id == 1) {
              setAsset(objeto);
              //Es asset
              navigation.navigate("loadhtmlformubicar", {
                asset: objeto,
              });

              //setTareas(currentTareas);
              setVisible(true);

              //console.log("IDUSERROLE:: ", userData.roles[0].id);
            }
          }
        } else {
          console.error("ERROR ELSE");
          console.error(response.status);
        }
      })
      .catch((error) => {
        console.error("ERR2");
        console.error(error);
      });
  };

  const handleBarCodeScannedTask = async ({ type, data }) => {
    setScanned(true);

    console.log("DATA: ", data);
    console.log("ESCANEADO: ", arrayAssets);

    var elementoEncontrado = [];

    arrayAssets.forEach((element) => {
      if (element.tag.code == data) {
        elementoEncontrado = element;
      }
    });

    console.log("elementoEncontrado: ", elementoEncontrado);

    if (elementoEncontrado.length == 0) {
      alert(`Este equipo no está asignado a la tarea`);
    } else {
      var objeto = elementoEncontrado;

      setAsset(objeto);
      var obj = {};
      obj.id = objeto.id;

      objeto.object = obj;

      objeto.serial_number = "task";
      console.log(objeto);
      // objeto.data = objeto;

      setArrayAssets([]);
      //Es asset

      navigation.navigate("loadhtmlformubicar", {
        asset: objeto,
      });

      //setTareas(currentTareas);
      setVisible(true);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Loading
        isVisible={isLoading}
        text={"Cargando"}
        backgroundColor={COLORS.primary}
      ></Loading>
      {scanned == false ? (
        <Camera
          onBarCodeScanned={
            scanned
              ? undefined
              : arrayAssets.length > 0
              ? handleBarCodeScannedTask
              : handleBarCodeScanned
          }
          barCodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
          }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <Button
          icon={{
            type: "material-community",
            name: "camera-party-mode",
            size: 100,
            color: COLORS.primary,
          }}
          buttonStyle={{
            borderColor: "transparent",
          }}
          type="outline"
          titleStyle={{ color: COLORS.primary, fontSize: 10 }}
          containerStyle={{
            margin: 5,
          }}
          onPress={() => setScanned(false)}
        />
      )}
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
});
